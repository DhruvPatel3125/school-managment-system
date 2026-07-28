import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';

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
        if (parts.length > 1 && !host.endsWith('.vercel.app')) {
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
        const response = await axios.get(`${API_URL}/api/v1/tenants/current`, {
          headers: {
            'x-tenant-subdomain': subdomain
          }
        });

        const tenantData = response.data.data;
        setTenant(tenantData);

        // 3. Inject CSS variables dynamically into document root
        if (tenantData?.branding) {
          const root = document.documentElement;
          if (tenantData.branding.primaryColor) {
            root.style.setProperty('--color-primary', tenantData.branding.primaryColor);
          }
          if (tenantData.branding.secondaryColor) {
            root.style.setProperty('--color-secondary', tenantData.branding.secondaryColor);
          }
          if (tenantData.branding.accentColor) {
            root.style.setProperty('--color-accent', tenantData.branding.accentColor);
          }
        }
      } catch (err) {
        console.warn('Failed to resolve tenant configuration:', err);
        setError(err.response?.data?.error || 'Tenant not found');
        setTenant(null);
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

export const useTenant = () => {
  const context = useContext(TenantThemeContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantThemeProvider');
  }
  return context;
};

export const useTenantTheme = useTenant;
