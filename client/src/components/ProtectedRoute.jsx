import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole, requiredPermission }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white space-y-4">
        <div className="w-12 h-12 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-slate-400 font-medium animate-pulse">Verifying Security Session...</p>
      </div>
    );
  }

  // Redirect to login if unauthenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check Role constraints
  if (requiredRole && user.role !== requiredRole) {
    console.warn(`Protected route block: user role '${user.role}' does not match required '${requiredRole}'`);
    return <Navigate to="/" replace />;
  }

  // Check Permission constraints
  if (requiredPermission && !user.permissions?.includes(requiredPermission) && user.role !== 'super_admin') {
    console.warn(`Protected route block: user permissions missing '${requiredPermission}'`);
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
