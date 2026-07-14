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

  const primaryBrandColor = tenant?.primaryColor || '#0D1B2A';

  const statCards = [
    { name: 'Total Students', value: stats.totalStudents, change: '+4.75%', changeType: 'increase' },
    { name: 'Active Teachers', value: stats.activeTeachers, change: '+2.1%', changeType: 'increase' },
    { name: 'Daily Attendance', value: `${stats.attendancePercentage}%`, change: '-0.4%', changeType: 'decrease' },
    { name: 'Fees Collected (Mtd)', value: stats.feesCollected, change: '+12.5%', changeType: 'increase' }
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: primaryBrandColor }} />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Flat & Calm Welcoming Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Active Session</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 leading-tight">
            Welcome back, {user?.name || 'Administrator'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dashboard for {tenant?.schoolName || 'EduCore School'} · {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/students"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-white text-xs font-semibold rounded-lg shadow-sm hover:opacity-95 active:scale-95 transition-all"
            style={{ backgroundColor: primaryBrandColor }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Student Admission</span>
          </Link>
          <Link
            to="/classes"
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 bg-white text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
          >
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>Manage Classes</span>
          </Link>
        </div>
      </div>

      {/* Grid of Flat Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((item) => (
          <div
            key={item.name}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-all"
          >
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.name}</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">{item.value}</span>
              <span className={`text-[10px] font-semibold px-1 py-0.5 rounded ${
                item.changeType === 'increase' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
              }`}>
                {item.change}
              </span>
            </div>
            <p className="text-[9px] text-slate-400 mt-2 font-medium">vs. previous month</p>
          </div>
        ))}
      </div>

      {/* Quick Actions / Recent Activity Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Quick Actions Grid */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Quick Actions Hub</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { to: '/students', label: 'Manage Students', desc: 'Browse SIS, admit pupils', icon: Users, color: '#3B82F6' },
              { to: '/staff', label: 'Staff Directory', desc: 'Manage teachers & admins', icon: Award, color: '#10B981' },
              { to: '/classes', label: 'Academic Setup', desc: 'Configure sections & grades', icon: TrendingUp, color: '#F59E0B' }
            ].map((act) => {
              const ActionIcon = act.icon;
              return (
                <Link
                  key={act.to}
                  to={act.to}
                  className="p-4 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100/50 hover:border-slate-200 transition-colors flex flex-col gap-1 group text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-slate-200 shadow-sm group-hover:scale-105 transition-transform" style={{ color: act.color }}>
                    <ActionIcon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-800 mt-2 block">{act.label}</span>
                  <span className="text-[10px] text-slate-500 leading-tight block">{act.desc}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* System Status Panel */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">System Status</h3>
          <div className="space-y-3">
            {[
              { title: 'Database Connection', status: 'Online', desc: 'Live operations normal' },
              { title: 'Cloud Storage Sync', status: 'Online', desc: 'Synced 2m ago' },
              { title: 'Active Connections', status: 'Stable', desc: '14 active administrators' }
            ].map((stat) => (
              <div key={stat.title} className="flex gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0 animate-pulse"></span>
                <div>
                  <h4 className="text-xs font-bold text-slate-700">{stat.title}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">{stat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
