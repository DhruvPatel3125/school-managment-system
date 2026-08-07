import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useTenantTheme } from '../../../../context/TenantThemeContext';
import { useAuth } from '../../../../context/AuthContext';
import {
  Users, GraduationCap, Activity, CreditCard,
  UserPlus, Megaphone, Calendar, BookOpen, ArrowUpRight, ArrowRight
} from 'lucide-react';

import '../../../../styles/admin.css';
import { API_URL } from '../../../../config/api';

const AdminOverview = () => {
  const { tenant } = useTenantTheme();
  const { user }   = useAuth();

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalStudents:        0,
    activeTeachers:       0,
    totalClasses:         0,
    attendancePercentage: '0.0',
    feesCollected:        '₹0',
    recentStudents:       [],
    recentAnnouncements:  []
  });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/v1/admin/dashboard`, { withCredentials: true });
        if (res.data.success) {
          setDashboardData(prev => ({ ...prev, ...res.data.data }));
        }
      } catch (err) {
        console.error('Failed to fetch admin dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const kpiCards = [
    {
      title: 'Total Enrolled Students',
      value: dashboardData.totalStudents || 0,
      subText: 'Active student roster',
      icon: Users,
      color: '#C4613A',
      bgColor: 'bg-[#C4613A]/10'
    },
    {
      title: 'Active Faculty & Staff',
      value: dashboardData.activeTeachers || 0,
      subText: 'Teaching staff members',
      icon: GraduationCap,
      color: '#0D1B2A',
      bgColor: 'bg-[#0D1B2A]/10'
    },
    {
      title: 'Today\'s Attendance',
      value: `${dashboardData.attendancePercentage || '0.0'}%`,
      subText: 'Daily attendance rate',
      icon: Activity,
      color: '#10B981',
      bgColor: 'bg-emerald-500/10'
    },
    {
      title: 'Monthly Fee Collection',
      value: dashboardData.feesCollected || '₹0',
      subText: 'MTD revenue collected',
      icon: CreditCard,
      color: '#D97706',
      bgColor: 'bg-amber-500/10'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-stone-200 border-t-[#C4613A] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="admin-portal-root space-y-6 pb-12">

      {/* ── Clean Executive Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#0D1B2A] tracking-tight">
              Welcome back, {user?.name || 'School Administrator'} 👋
            </h1>
          </div>
          <p className="text-xs text-slate-500 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#C4613A]" />
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            <span>•</span>
            <span className="font-semibold text-[#0D1B2A]">{tenant?.schoolName || 'EduCore ERP'}</span>
            <span>•</span>
            <span className="text-[#C4613A] font-semibold">Session 2026-27</span>
          </p>
        </div>

        {/* Quick Action Header Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            to="/students"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C4613A] hover:bg-[#b0532e] active:scale-95 text-white font-bold text-xs shadow-md transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ New Admission</span>
          </Link>
          <Link
            to="/announcements"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-[#0D1B2A] font-bold text-xs transition-all border border-slate-200"
          >
            <Megaphone className="w-4 h-4 text-[#C4613A]" />
            <span>Broadcast Notice</span>
          </Link>
        </div>
      </div>

      {/* ── Executive KPI Stat Cards Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  {card.title}
                </span>
                <p className="text-2xl font-black text-[#0D1B2A] tracking-tight">
                  {card.value}
                </p>
                <p className="text-[10px] font-medium text-slate-400">
                  {card.subText}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${card.bgColor} shrink-0`}>
                <Icon className="w-6 h-6" style={{ color: card.color }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Main Two-Column Dashboard Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column (2/3 width): Live Recent Admissions & Latest Announcements */}
        <div className="lg:col-span-2 space-y-6">

          {/* Live Recent Admissions Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-extrabold text-[#0D1B2A] flex items-center gap-2">
                  <UserPlus className="w-4.5 h-4.5 text-[#C4613A]" />
                  Recent Student Admissions
                </h2>
                <p className="text-xs text-slate-500">Newly enrolled students in your school database</p>
              </div>
              <Link
                to="/students"
                className="text-xs font-bold text-[#C4613A] hover:underline flex items-center gap-1"
              >
                <span>View Full Roster</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {dashboardData.recentStudents.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No recent student admissions recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-4 py-2.5 rounded-l-xl">Student Name</th>
                      <th className="px-4 py-2.5">Admission No</th>
                      <th className="px-4 py-2.5">Class & Sec</th>
                      <th className="px-4 py-2.5">Guardian Contact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {dashboardData.recentStudents.map((stud) => (
                      <tr key={stud._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3 font-semibold text-[#0D1B2A] flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[#C4613A]/10 text-[#C4613A] font-bold flex items-center justify-center text-[10px] uppercase">
                            {stud.name?.split(' ').map(n => n[0]).slice(0, 2).join('') || 'S'}
                          </div>
                          <span>{stud.name}</span>
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-slate-700">{stud.admissionNo}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold border border-slate-200">
                            {stud.classId?.name || 'Class'} - {stud.section}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {stud.parentName} ({stud.parentPhone})
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Latest Announcements Stream */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-extrabold text-[#0D1B2A] flex items-center gap-2">
                  <Megaphone className="w-4.5 h-4.5 text-[#C4613A]" />
                  Latest School Broadcasts
                </h2>
                <p className="text-xs text-slate-500">Recent notices published across campus</p>
              </div>
              <Link
                to="/announcements"
                className="text-xs font-bold text-[#C4613A] hover:underline flex items-center gap-1"
              >
                <span>View All Broadcasts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {dashboardData.recentAnnouncements.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No active announcements published.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dashboardData.recentAnnouncements.map((ann) => (
                  <div key={ann._id} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-[#C4613A]/10 text-[#C4613A] border border-[#C4613A]/20">
                        {ann.tag || 'NOTICE'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(ann.created_at || ann.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-[#0D1B2A] line-clamp-1">{ann.title}</h3>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{ann.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column (1/3 width): School Summary & Quick Navigation Shortcuts */}
        <div className="space-y-6">

          {/* School Overview Summary Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-[#0D1B2A] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#C4613A]" />
                School Summary Overview
              </h3>
            </div>

            <div className="space-y-3 text-xs font-semibold">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600">Configured Grade Levels</span>
                <span className="font-bold text-[#0D1B2A] font-mono text-sm">{dashboardData.totalClasses || 0} Grades</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600">Total Enrolled Students</span>
                <span className="font-bold text-[#C4613A] font-mono text-sm">{dashboardData.totalStudents || 0} Students</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600">Active Faculty Members</span>
                <span className="font-bold text-emerald-700 font-mono text-sm">{dashboardData.activeTeachers || 0} Teachers</span>
              </div>
            </div>
          </div>

          {/* Quick Navigation Shortcuts */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-[#0D1B2A]">Primary Operations</h3>
              <p className="text-xs text-slate-400 mt-0.5">Quick access to admin sections</p>
            </div>

            <div className="space-y-2">
              <Link
                to="/students"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 hover:border-[#C4613A]/40 hover:bg-slate-50/80 transition-all text-xs font-bold text-[#0D1B2A] group"
              >
                <div className="flex items-center gap-2.5">
                  <UserPlus className="w-4 h-4 text-[#C4613A]" />
                  <span>Student Directory (SIS)</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#C4613A] transition-colors" />
              </Link>

              <Link
                to="/staff"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 hover:border-[#C4613A]/40 hover:bg-slate-50/80 transition-all text-xs font-bold text-[#0D1B2A] group"
              >
                <div className="flex items-center gap-2.5">
                  <GraduationCap className="w-4 h-4 text-[#0D1B2A]" />
                  <span>Staff & Educator Directory</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#C4613A] transition-colors" />
              </Link>

              <Link
                to="/classes"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 hover:border-[#C4613A]/40 hover:bg-slate-50/80 transition-all text-xs font-bold text-[#0D1B2A] group"
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-amber-600" />
                  <span>Academic Setup & Classes</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#C4613A] transition-colors" />
              </Link>

              <Link
                to="/announcements"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 hover:border-[#C4613A]/40 hover:bg-slate-50/80 transition-all text-xs font-bold text-[#0D1B2A] group"
              >
                <div className="flex items-center gap-2.5">
                  <Megaphone className="w-4 h-4 text-emerald-600" />
                  <span>Broadcast Notice Board</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#C4613A] transition-colors" />
              </Link>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default AdminOverview;
