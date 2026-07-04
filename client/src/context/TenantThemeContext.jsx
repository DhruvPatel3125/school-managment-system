import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5001`;


const TenantThemeContext = createContext(null);

export const TenantThemeProvider = ({ children }) => {
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const resolveTenant = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Resolve subdomain from window location
        const host = window.location.hostname;
        const parts = host.split('.');
        let subdomain = null;

        // If host has a subdomain (e.g. schoola.localhost or schoola.educore.app)
        if (parts.length > 1) {
          const firstPart = parts[0];
          // Exclude main domains/subdomains
          if (firstPart !== 'www' && firstPart !== 'localhost' && firstPart !== 'educore') {
            subdomain = firstPart;
          }
        }

        // If no subdomain found, look for 'tenant' query parameter as fallback (dev helper)
        if (!subdomain) {
          const urlParams = new URLSearchParams(window.location.search);
          subdomain = urlParams.get('tenant'); // Do not default to 'schoola'
        }

        if (!subdomain) {
          // Main platform landing page mode
          setTenant(null);
          setLoading(false);
          return;
        }

        console.log(`Resolving branding settings for tenant: "${subdomain}"`);

        // 2. Fetch tenant profile from backend
        // We call the server running on port 5001 (standard dev port)
        const response = await axios.get(`${API_URL}/api/v1/tenants/current`, {
          headers: {
            'x-tenant-subdomain': subdomain
          }
        });

        const tenantData = response.data.data;
        setTenant(tenantData);

        // 3. Inject CSS variables dynamically into document root
        if (tenantData.primaryColor) {
          document.documentElement.style.setProperty('--tenant-primary', tenantData.primaryColor);
        }
        if (tenantData.secondaryColor) {
          document.documentElement.style.setProperty('--tenant-secondary', tenantData.secondaryColor);
        }

        // Update browser page title and favicon
        document.title = `${tenantData.schoolName} - EduCore ERP`;

        let favicon = document.querySelector("link[rel~='icon']");
        if (!favicon) {
          favicon = document.createElement('link');
          favicon.rel = 'icon';
          document.getElementsByTagName('head')[0].appendChild(favicon);
        }
        favicon.href = tenantData.logoUrl || '/favicon.ico';

      } catch (err) {
        console.error('Failed to resolve tenant configuration:', err);
        setError(err.response?.data?.error || 'Failed to connect to school server. Please verify your connection.');
      } finally {
        setLoading(false);
      }
    };

    resolveTenant();
  }, []);

  return (
    <TenantThemeContext.Provider value={{ tenant, loading, error }}>
      {children}
    </TenantThemeContext.Provider>
  );
};

export const useTenantTheme = () => {
  const context = useContext(TenantThemeContext);
  if (!context) {
    throw new Error('useTenantTheme must be used within a TenantThemeProvider');
  }
  return context;
};
