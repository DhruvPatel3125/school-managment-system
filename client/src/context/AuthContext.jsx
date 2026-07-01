import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// Configure baseline Axios requests to allow cookies (credentials)
axios.defaults.withCredentials = true;

let isTokenRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

const onTokenRefreshed = (token) => {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  // Setup Axios Interceptors
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        // Rewrite localhost:5001 to the current hostname:5001 to prevent CORS/subdomain issues
        if (config.url && config.url.includes('localhost:5001')) {
          config.url = config.url.replace('localhost:5001', `${window.location.hostname}:5001`);
        }

        if (accessToken) {
          config.headers['Authorization'] = `Bearer ${accessToken}`;
        }

        // Dynamically resolve tenant subdomain scope from current URL context
        const host = window.location.hostname;
        const parts = host.split('.');
        let subdomain = null;

        // If sub-domain pattern matches (e.g. schoola.localhost)
        if (parts.length > 1) {
          const firstPart = parts[0];
          if (firstPart !== 'www' && firstPart !== 'localhost' && firstPart !== 'educore') {
            subdomain = firstPart;
          }
        }

        // Fallback to query parameter (e.g. ?tenant=schoola)
        if (!subdomain) {
          const urlParams = new URLSearchParams(window.location.search);
          subdomain = urlParams.get('tenant') || 'schoola'; // default matching setup
        }

        if (subdomain) {
          config.headers['x-tenant-subdomain'] = subdomain;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (err) => {
        const originalRequest = err.config;

        // If API returns 401 and we haven't retried yet, try token refresh
        if (err.response?.status === 401 && !originalRequest._retry) {
          // If the request was to login itself, don't try refreshing
          if (originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/refresh')) {
            return Promise.reject(err);
          }

          originalRequest._retry = true;

          if (!isTokenRefreshing) {
            isTokenRefreshing = true;
            try {
              console.log('🔄 Access token expired. Attempting token rotation...');
              const storedRefreshToken = localStorage.getItem('refreshToken');
              const res = await axios.post(`http://${window.location.hostname}:5001/api/v1/auth/refresh`, {
                refreshToken: storedRefreshToken
              });
              const newToken = res.data.accessToken;
              const newRefreshToken = res.data.refreshToken;
              
              setAccessToken(newToken);
              localStorage.setItem('accessToken', newToken);
              if (newRefreshToken) {
                localStorage.setItem('refreshToken', newRefreshToken);
              }
              
              isTokenRefreshing = false;
              onTokenRefreshed(newToken);
            } catch (refreshErr) {
              console.warn('❌ Session refresh failed. Logging out user.');
              isTokenRefreshing = false;
              setUser(null);
              setAccessToken(null);
              localStorage.removeItem('user');
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              return Promise.reject(refreshErr);
            }
          }

          // Queue requests while token is refreshing
          return new Promise((resolve) => {
            subscribeTokenRefresh((token) => {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
              resolve(axios(originalRequest));
            });
          });
        }
        return Promise.reject(err);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [accessToken]);

  // Check active session on app startup
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        // Restore from localStorage first
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('accessToken');
        const storedRefreshToken = localStorage.getItem('refreshToken');

        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
          setAccessToken(storedToken);
        }

        // Validate session / attempt refresh if token expired or verify profile
        const activeToken = storedToken;
        if (activeToken) {
          try {
            const meRes = await axios.get(`http://${window.location.hostname}:5001/api/v1/auth/me`, {
              headers: { Authorization: `Bearer ${activeToken}` }
            });
            setUser(meRes.data.user);
            localStorage.setItem('user', JSON.stringify(meRes.data.user));
          } catch (meErr) {
            // If token invalid/expired, try refresh
            if (storedRefreshToken) {
              console.log('🔄 Session profile verify failed. Attempting refresh token...');
              const res = await axios.post(`http://${window.location.hostname}:5001/api/v1/auth/refresh`, {
                refreshToken: storedRefreshToken
              });
              const newToken = res.data.accessToken;
              const newRefreshToken = res.data.refreshToken;
              
              setAccessToken(newToken);
              localStorage.setItem('accessToken', newToken);
              if (newRefreshToken) {
                localStorage.setItem('refreshToken', newRefreshToken);
              }
              
              const meRes = await axios.get(`http://${window.location.hostname}:5001/api/v1/auth/me`, {
                headers: { Authorization: `Bearer ${newToken}` }
              });
              setUser(meRes.data.user);
              localStorage.setItem('user', JSON.stringify(meRes.data.user));
            } else {
              throw meErr;
            }
          }
        } else if (storedRefreshToken) {
          // No active access token but we have refresh token
          const res = await axios.post(`http://${window.location.hostname}:5001/api/v1/auth/refresh`, {
            refreshToken: storedRefreshToken
          });
          const newToken = res.data.accessToken;
          const newRefreshToken = res.data.refreshToken;
          
          setAccessToken(newToken);
          localStorage.setItem('accessToken', newToken);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }
          
          const meRes = await axios.get(`http://${window.location.hostname}:5001/api/v1/auth/me`, {
            headers: { Authorization: `Bearer ${newToken}` }
          });
          setUser(meRes.data.user);
          localStorage.setItem('user', JSON.stringify(meRes.data.user));
        }
      } catch (err) {
        console.log('No active session found on initialization (guest access).');
        // Clear stale local storage
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login handler
  const login = async (email, password, subdomainScope) => {
    try {
      setError(null);
      setLoading(true);

      const res = await axios.post(`http://${window.location.hostname}:5001/api/v1/auth/login`, 
        { email, password },
        { headers: { 'x-tenant-subdomain': subdomainScope } }
      );

      const { accessToken: token, refreshToken: rToken, user: userData } = res.data;
      setAccessToken(token);
      setUser(userData);

      // Persist in localStorage
      localStorage.setItem('accessToken', token);
      localStorage.setItem('refreshToken', rToken);
      localStorage.setItem('user', JSON.stringify(userData));

      return userData;
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Invalid login details. Please try again.';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      const storedRefreshToken = localStorage.getItem('refreshToken');
      await axios.post(`http://${window.location.hostname}:5001/api/v1/auth/logout`, {
        refreshToken: storedRefreshToken
      });
    } catch (err) {
      console.error('Logout error on server:', err);
    } finally {
      setUser(null);
      setAccessToken(null);
      setError(null);
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
