import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTenantTheme } from '../../../../context/TenantThemeContext';
import { useAuth } from '../../../../context/AuthContext';
import {
  GraduationCap,
  Users,
  Calendar,
  CreditCard,
  Plus,
  FileText,
  Loader2,
  TrendingUp,
  Activity,
  Award
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminOverview = () => {
  const { tenant } = useTenantTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeTeachers: 0,
    attendancePercentage: '0.0',
    feesCollected: '₹0'
  });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/v1/admin/dashboard', {
          withCredentials: true
        });
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch admin dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const statCards = [
    { name: 'Total Students', value: stats.totalStudents, change: '+4.75%', changeType: 'increase', icon: <GraduationCap className="w-6 h-6 text-indigo-500" /> },
    { name: 'Active Teachers', value: stats.activeTeachers, change: '+2.1%', changeType: 'increase', icon: <Users className="w-6 h-6 text-emerald-500" /> },
    { name: 'Daily Attendance', value: `${stats.attendancePercentage}%`, change: '-0.4%', changeType: 'decrease', icon: <Calendar className="w-6 h-6 text-amber-500" /> },
    { name: 'Fees Collected (Mtd)', value: stats.feesCollected, change: '+12.5%', changeType: 'increase', icon: <CreditCard className="w-6 h-6 text-rose-500" /> }
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Welcome Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-900 via-blue-800 to-violet-900 p-8 sm:p-10 shadow-2xl shadow-blue-900/20 text-white">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold backdrop-blur-sm">
            <Activity className="w-3.5 h-3.5 text-blue-300" />
            <span className="text-blue-100 uppercase tracking-wider">Admin Portal Live</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-100">{tenant?.schoolName || 'EduCore School'}</span>
          </h2>
          
          <p className="text-sm sm:text-base text-blue-100/80 font-medium max-w-2xl leading-relaxed">
            Monitor academic programs, manage student lifecycle documents, track daily attendance, and oversee fee collections from this unified command center.
          </p>
          
          <div className="pt-4 flex flex-wrap gap-4">
            <Link to="/students" className="px-5 py-2.5 bg-white text-indigo-700 font-bold text-sm rounded-xl shadow-lg hover:bg-slate-50 hover:shadow-xl active:scale-95 transition-all flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Admission
            </Link>
            <Link to="/classes" className="px-5 py-2.5 bg-white/15 border border-white/20 text-white font-bold text-sm rounded-xl backdrop-blur-md hover:bg-white/20 active:scale-95 transition-all flex items-center gap-2">
              <FileText className="w-4 h-4" /> Manage Classes
            </Link>
          </div>
        </div>
      </div>

      {/* Grid of widgets */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((item, index) => (
          <div
            key={item.name}
            className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-100 hover:-translate-y-1 transition-all duration-300 flex items-center justify-between relative overflow-hidden"
          >
            {/* Subtle background glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 to-indigo-50/0 group-hover:from-indigo-50/50 group-hover:to-transparent transition-all duration-500 pointer-events-none"></div>
            
            <div className="relative z-10 space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.name}</p>
              <p className="text-3xl font-black text-slate-800 tracking-tight">{item.value}</p>
              <div className="flex items-center gap-1.5 pt-1">
                <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${item.changeType === 'increase' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  {item.change}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">vs last month</span>
              </div>
            </div>
            
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-sm shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 relative z-10">
              {item.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions / Recent Activity Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">Quick Actions Hub</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Link to="/students" className="p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-100 transition-colors flex flex-col items-center justify-center text-center gap-2 group">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform text-indigo-500">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-600 group-hover:text-indigo-700">Manage Students</span>
            </Link>
            <Link to="/staff" className="p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-100 transition-colors flex flex-col items-center justify-center text-center gap-2 group">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform text-emerald-500">
                <Award className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-600 group-hover:text-emerald-700">Staff Directory</span>
            </Link>
            <Link to="/classes" className="p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-amber-50 hover:border-amber-100 transition-colors flex flex-col items-center justify-center text-center gap-2 group">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform text-amber-500">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-600 group-hover:text-amber-700">Academic Setup</span>
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
           <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">System Status</h3>
          </div>
          <div className="space-y-4">
             <div className="flex items-center gap-4 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100/50">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
               <div className="flex-1">
                 <p className="text-sm font-bold text-slate-700">Database Connection</p>
                 <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Online & Stable</p>
               </div>
             </div>
             <div className="flex items-center gap-4 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100/50">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
               <div className="flex-1">
                 <p className="text-sm font-bold text-slate-700">Cloud Storage Sync</p>
                 <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Synced 2m ago</p>
               </div>
             </div>
             <div className="flex items-center gap-4 p-3 rounded-xl bg-blue-50/50 border border-blue-100/50">
               <div className="w-2 h-2 rounded-full bg-blue-500"></div>
               <div className="flex-1">
                 <p className="text-sm font-bold text-slate-700">Active Sessions</p>
                 <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">14 users online</p>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
