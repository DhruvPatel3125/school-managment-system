import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminPortal from './portals/admin/AdminPortal';
import TeacherPortal from './portals/teacher/TeacherPortal';
import StudentPortal from './portals/student/StudentPortal';
import { Loader2 } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isAdmin = user.role === 'admin' || user.role === 'school_admin' || user.role === 'super_admin';

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {isAdmin && <AdminPortal />}
      {user.role === 'teacher' && <TeacherPortal />}
      {user.role === 'student' && <StudentPortal />}
    </div>
  );
};

export default Home;
