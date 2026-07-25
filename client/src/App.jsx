import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { TenantThemeProvider, useTenantTheme } from './context/TenantThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import BaseLayout from './layouts/BaseLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import SuperAdminDashboard from './pages/portals/superadmin/SuperAdminDashboard';
import MainLandingPage from './pages/MainLandingPage';
import Classes from './pages/Classes';
import Students from './pages/Students';
import Staff from './pages/Staff';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Announcements from './pages/Announcements';
import Subscription from './pages/Subscription';

// Wrapper that displays the dynamic brand tenant resolving view
const AppContent = () => {
  const { tenant, loading: tenantLoading, error: tenantError } = useTenantTheme();
  const { loading: authLoading } = useAuth();

  if (tenantLoading || authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4" style={{ background: '#0D1B2A', fontFamily: 'DM Sans, -apple-system, sans-serif' }}>
        <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(255,255,255,0.12)', borderTopColor: '#C4613A' }} />
        <p className="text-xs font-semibold uppercase tracking-widest animate-pulse" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Initializing EduCore...
        </p>
      </div>
    );
  }

  if (tenantError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center" style={{ background: '#0D1B2A', fontFamily: 'DM Sans, -apple-system, sans-serif' }}>
        <div className="text-5xl mb-5">⚠</div>
        <h2 className="text-xl font-semibold mb-2" style={{ color: '#E8957A' }}>Connection Failed</h2>
        <p className="text-sm max-w-md mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>{tenantError}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 rounded-lg text-white font-semibold text-sm transition-all active:scale-95"
          style={{ background: '#C4613A' }}
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
        <Route 
          path="subscription" 
          element={
            <ProtectedRoute requiredRole="school_admin">
              <Subscription />
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
