/**
 * Centralized API Base URL Configuration for EduCore ERP
 * Supports local dev (port 5001) and Netlify production (same-origin / relative path).
 */
export const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, '');
  }
  // If hosted on HTTPS (e.g. Netlify), use relative URL to same origin
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    return '';
  }
  // Local development fallback
  const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  return `http://${host}:5001`;
};

export const API_URL = getApiUrl();
