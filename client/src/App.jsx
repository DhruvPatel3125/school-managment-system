import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { TenantThemeProvider, useTenantTheme } from './context/TenantThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import BaseLayout from './layouts/BaseLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import MainLandingPage from './pages/MainLandingPage';
import Classes from './pages/Classes';
import Students from './pages/Students';
import Staff from './pages/Staff';
import NotFound from './pages/NotFound';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Announcements from './pages/Announcements';

// Wrapper that displays the dynamic brand tenant resolving view
const AppContent = () => {
  const { tenant, loading: tenantLoading, error: tenantError } = useTenantTheme();
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
          className="mt-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-550 rounded-lg text-white font-semibold shadow transition-all active:scale-95"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // SPLIT ROUTING: If no subdomain/tenant is active, show the Main SaaS Landing Page & Super Admin Dashboard
  if (!tenant) {
    return (
      <Routes>
        {/* Main Platform Landing Page */}
        <Route path="/" element={<MainLandingPage />} />

        {/* Public Login Route */}
        <Route path="/login" element={<Login />} />

        {/* Legal Routes */}
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />

        {/* Protected Global Super Admin Dashboard */}
        <Route 
          path="/super-admin" 
          element={
            <ProtectedRoute requiredRole="super_admin">
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback to Landing Page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // SCHOOL PORTAL MODE: If a subdomain tenant is resolved (e.g. tapovan.localhost)
  return (
    <Routes>
      {/* Public Login Route (Gets custom theme variables dynamically) */}
      <Route path="/login" element={<Login />} />

      {/* Legal Routes */}
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />

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
        <Route path="myprofile" element={<Home />} />
        <Route path="attendance" element={<Home />} />
        <Route path="homework" element={<Home />} />
        <Route path="fees" element={<Home />} />
        <Route path="exams" element={<Home />} />
        <Route path="timetable" element={<Home />} />
        <Route path="announcements" element={<Announcements />} />
        <Route path="messages" element={<Home />} />
        <Route path="documents" element={<Home />} />
        <Route 
          path="classes" 
          element={
            <ProtectedRoute requiredRole="school_admin">
              <Classes />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="students" 
          element={
            <ProtectedRoute requiredPermission="read:students">
              <Students />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="staff" 
          element={
            <ProtectedRoute requiredRole="school_admin">
              <Staff />
            </ProtectedRoute>
          } 
        />
      </Route>

      {/* Fallback back to Portal Root */}
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
