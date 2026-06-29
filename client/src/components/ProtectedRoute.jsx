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
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-md">
        <div className="text-6xl mb-4">🚫</div>
        <h2 className="text-2xl font-bold text-rose-600 dark:text-rose-500">Access Restricted</h2>
        <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-md">
          Your profile account role (<strong>{user.role}</strong>) does not have authorization to view this administrative interface.
        </p>
        <Navigate to="/" replace />
      </div>
    );
  }

  // Check Permission constraints
  if (requiredPermission && !user.permissions?.includes(requiredPermission) && user.role !== 'super_admin') {
    console.warn(`Protected route block: user permissions missing '${requiredPermission}'`);
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-md">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-rose-600 dark:text-rose-500">Permission Required</h2>
        <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-md">
          You lack the permission node <code>{requiredPermission}</code> required to access this resource.
        </p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
