/**
 * Centralized API Base URL Configuration for EduCore ERP
 * Supports local dev (port 5001) and Vercel/Netlify production (same-origin / relative path).
 */
export const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL !== undefined && import.meta.env.VITE_API_URL !== '') {
    return import.meta.env.VITE_API_URL.replace(/\/$/, '');
  }
  // If hosted in production or over HTTPS (e.g. Vercel/Netlify), use relative URL to same origin
  if (typeof window !== 'undefined' && (window.location.protocol === 'https:' || import.meta.env.PROD)) {
    return '';
  }
  // Local development fallback
  const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  return `http://${host}:5001`;
};

export const API_URL = getApiUrl();
export const API = getApiUrl();

