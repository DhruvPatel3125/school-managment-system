import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TenantThemeProvider, useTenantTheme } from './context/TenantThemeContext';
import BaseLayout from './layouts/BaseLayout';
import Home from './pages/Home';
import NotFound from './pages/NotFound';

// Inner component to handle loading and error states of Tenant Resolution
const AppContent = () => {
  const { loading, error, tenant } = useTenantTheme();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white space-y-4">
        {/* Animated spinner */}
        <div className="w-12 h-12 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-slate-400 font-medium animate-pulse">Resolving School Tenant Settings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-6 text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-rose-500">Initialization Error</h2>
        <p className="mt-2 text-slate-400 max-w-md">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold shadow transition-all active:scale-95"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<BaseLayout />}>
        <Route index element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <TenantThemeProvider>
        <AppContent />
      </TenantThemeProvider>
    </Router>
  );
}

export default App;
