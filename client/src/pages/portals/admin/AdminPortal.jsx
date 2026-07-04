import React from 'react';
import AdminOverview from './components/AdminOverview';
import { useAuth } from '../../../context/AuthContext';
import { Navigate } from 'react-router-dom';

const AdminPortal = () => {
  const { user } = useAuth();

  if (!user || (user.role !== 'admin' && user.role !== 'school_admin' && user.role !== 'super_admin')) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="w-full h-full">
      <AdminOverview />
    </div>
  );
};

export default AdminPortal;
