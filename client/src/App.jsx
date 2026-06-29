import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { TenantThemeProvider, useTenantTheme } from './context/TenantThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import BaseLayout from './layouts/BaseLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import Classes from './pages/Classes';
import Students from './pages/Students';
import Staff from './pages/Staff';
import NotFound from './pages/NotFound';

// Wrapper that displays the dynamic brand tenant resolving view
const AppContent = () => {
  const { loading: tenantLoading, error: tenantError } = useTenantTheme();
  const { loading: authLoading } = useAuth();

  if (tenantLoading || authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white space-y-4">
        {/* Animated spinner */}
        <div className="w-12 h-12 border-4 border-slate-800 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider animate-pulse">
          Initializing EduCore Security Session...
        </p>
      </div>
    );
  }

  if (tenantError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-6 text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-rose-500">Connection Failed</h2>
        <p className="mt-2 text-slate-400 max-w-md">{tenantError}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-6 px-4 py-2 bg-indigo-650 hover:bg-indigo-650 rounded-lg text-white font-semibold shadow transition-all active:scale-95"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Login Route (Gets custom theme variables dynamically) */}
      <Route path="/login" element={<Login />} />

      {/* Protected School Tenant Routes */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <BaseLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Home />} />
        <Route path="classes" element={<Classes />} />
        <Route path="students" element={<Students />} />
        <Route path="staff" element={<Staff />} />
      </Route>

      {/* Protected Global Super Admin Routes */}
      <Route 
        path="/super-admin" 
        element={
          <ProtectedRoute requiredRole="super_admin">
            <SuperAdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <TenantThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </TenantThemeProvider>
    </Router>
  );
}

export default App;
