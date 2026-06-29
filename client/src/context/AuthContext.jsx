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
              const res = await axios.post('http://localhost:5001/api/v1/auth/refresh');
              const newToken = res.data.accessToken;
              setAccessToken(newToken);
              isTokenRefreshing = false;
              onTokenRefreshed(newToken);
            } catch (refreshErr) {
              console.warn('❌ Session refresh failed. Logging out user.');
              isTokenRefreshing = false;
              setUser(null);
              setAccessToken(null);
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
        // First try to refresh access token in memory using HTTPOnly cookie
        const res = await axios.post('http://localhost:5001/api/v1/auth/refresh');
        const token = res.data.accessToken;
        setAccessToken(token);

        // Fetch user profile info
        const meRes = await axios.get('http://localhost:5001/api/v1/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(meRes.data.user);
      } catch (err) {
        console.log('No active session found on initialization (guest access).');
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

      const res = await axios.post('http://localhost:5001/api/v1/auth/login', 
        { email, password },
        { headers: { 'x-tenant-subdomain': subdomainScope } }
      );

      const { accessToken: token, user: userData } = res.data;
      setAccessToken(token);
      setUser(userData);
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
      await axios.post('http://localhost:5001/api/v1/auth/logout');
    } catch (err) {
      console.error('Logout error on server:', err);
    } finally {
      setUser(null);
      setAccessToken(null);
      setError(null);
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
