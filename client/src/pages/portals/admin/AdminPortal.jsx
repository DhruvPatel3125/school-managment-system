import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import AdminOverview from './components/AdminOverview';

/**
 * AdminPortal — School Admin portal entry point
 * Role-guarded: only admin / school_admin / super_admin can access
 */
const AdminPortal = () => {
  const { user } = useAuth();

  if (
    !user ||
    (user.role !== 'admin' && user.role !== 'school_admin' && user.role !== 'super_admin')
  ) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="admin-portal-root w-full h-full">
      <AdminOverview />
    </div>
  );
};

export default AdminPortal;
