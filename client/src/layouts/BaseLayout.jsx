import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useTenantTheme } from '../context/TenantThemeContext';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  Users2,
  CreditCard,
  Palette,
  LogOut,
  School,
  User,
  Calendar,
  BookOpen,
  Award,
  Clock,
  Bell,
  MessageSquare,
  FileText,
  HelpCircle
} from 'lucide-react';

const BaseLayout = () => {
  const { tenant } = useTenantTheme();
  const { logout, user } = useAuth();
  const [logoError, setLogoError] = useState(false);
  const location = useLocation();

  // Resolve current active tab from pathname for the student dashboard
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/myprofile') return 'myprofile';
    if (path === '/attendance') return 'attendance';
    if (path === '/homework') return 'homework';
    if (path === '/fees') return 'fees';
    if (path === '/exams') return 'exams';
    if (path === '/timetable') return 'timetable';
    if (path === '/announcements') return 'announcements';
    if (path === '/messages') return 'messages';
    if (path === '/documents') return 'documents';
    return 'overview';
  };
  const activeTab = getActiveTab();

  const isStudent = user?.role === 'student';
  const classSection = localStorage.getItem('studentClassSection') || 'Class 3 - Section A';

  // Student portal sidebar item styling
  const getStudentSidebarClass = (tabName) => {
    const isActive = activeTab === tabName;
    return `flex items-center px-4 py-3 text-[13px] font-bold rounded-xl transition-all duration-200 group gap-3 ${isActive
        ? 'bg-gradient-to-r from-pink-500/10 to-pink-500/5 border-l-4 border-pink-500 text-pink-500'
        : 'text-slate-400 hover:text-slate-100 hover:bg-[#1a233a]/50'
      }`;
  };

  // Student Portal Layout — Light Theme (matches landing & login page)
  if (isStudent) {
    return (
      <div className="min-h-screen flex bg-slate-50 text-slate-800 font-sans antialiased">

        {/* ── Left Sidebar ── */}
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 h-screen sticky top-0 z-30 shadow-sm">

          {/* Brand Header */}
          <div className="p-5 border-b border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="min-w-0 text-left">
              <h2 className="font-black text-[14px] text-slate-900 tracking-tight leading-tight truncate">
                {tenant?.schoolName || 'EduCore'}
              </h2>
              <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider block mt-0.5">
                Student Portal
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
            <p className="px-3 pt-3 pb-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Main Menu</p>

            {[
              { to: '/',            tab: 'overview',      icon: LayoutDashboard, label: 'Dashboard' },
              { to: '/myprofile',   tab: 'myprofile',     icon: User,            label: 'My Profile' },
              { to: '/attendance',  tab: 'attendance',    icon: Calendar,        label: 'Attendance' },
              { to: '/homework',    tab: 'homework',      icon: BookOpen,        label: 'Homework' },
              { to: '/fees',        tab: 'fees',          icon: CreditCard,      label: 'Fees & Payments' },
              { to: '/exams',       tab: 'exams',         icon: Award,           label: 'Exams' },
              { to: '/timetable',   tab: 'timetable',     icon: Clock,           label: 'Time Table' },
              { to: '/announcements', tab: 'announcements', icon: Bell,          label: 'Announcements' },
              { to: '/messages',    tab: 'messages',      icon: MessageSquare,   label: 'Messages' },
              { to: '/documents',   tab: 'documents',     icon: FileText,        label: 'Documents' },
            ].map(({ to, tab, icon: Icon, label }) => {
              const active = activeTab === tab;
              return (
                <Link
                  key={tab}
                  to={to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150 ${
                    active
                      ? 'bg-blue-50 text-blue-700 border border-blue-100 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{label}</span>
                  {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />}
                </Link>
              );
            })}
          </nav>

          {/* Help card */}
          <div className="p-3 border-t border-slate-100">
            <div className="bg-gradient-to-br from-blue-600 to-violet-600 rounded-xl p-4 text-white relative overflow-hidden shadow-lg shadow-blue-500/20">
              <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full" />
              <HelpCircle className="w-5 h-5 mb-2 opacity-80" />
              <h4 className="font-extrabold text-[12px] mb-0.5">Need Help?</h4>
              <p className="text-[10px] text-blue-100 mb-3 leading-relaxed">Our support team is here for you.</p>
              <button
                onClick={() => alert('Support request submitted. We will contact you shortly.')}
                className="w-full py-1.5 bg-white/20 hover:bg-white/30 border border-white/25 text-white font-bold text-[10px] rounded-lg tracking-wider uppercase transition-all"
              >
                Contact Support
              </button>
            </div>
          </div>
        </aside>

        {/* ── Right Content ── */}
        <div className="flex-1 flex flex-col h-screen overflow-y-auto">

          {/* Header */}
          <header className="px-8 py-3.5 flex items-center justify-between bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
            <div>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                Academic Session 2026-27
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Notification Bell */}
              <button className="relative p-2 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-slate-500 hover:text-blue-600 transition-all group shrink-0">
                <Bell className="w-4.5 h-4.5" />
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white font-black text-[8px] rounded-full flex items-center justify-center animate-pulse border-2 border-white">
                  3
                </span>
              </button>

              {/* Profile */}
              <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-white flex items-center justify-center font-extrabold text-sm uppercase shadow-md shadow-blue-500/20">
                  {user?.name?.split(' ').map(n => n[0]).slice(0, 2).join('') || 'S'}
                </div>
                <div className="text-left hidden sm:block">
                  <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider leading-none">{user?.name}</h4>
                  <span className="text-[10px] text-slate-500 font-medium block mt-0.5">{classSection}</span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 ml-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="p-8 flex-grow bg-slate-50">
            <Outlet />
          </main>
        </div>
      </div>
    );
  }

  // Classic Admin / Staff Layout (Unmodified)
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Dynamic Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {tenant?.logoUrl && !logoError ? (
              <img
                src={tenant.logoUrl}
                alt={`${tenant.schoolName} logo`}
                className="w-10 h-10 rounded-full border-2 border-blue-600 object-cover"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
                <School className="w-5 h-5 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-900 leading-none">
                {tenant?.schoolName || 'EduCore ERP'}
              </h1>
              <span className="text-xs text-slate-500 font-medium">
                {tenant?.subdomain}.educore.app
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:text-emerald-400">
              ● Active
            </span>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-md shadow-blue-500/25">
                {user?.name?.split(' ').map(n => n[0]).slice(0, 2).join('') || 'U'}
              </div>
              <button
                onClick={logout}
                className="text-xs text-rose-500 hover:text-rose-600 font-semibold px-2 py-1 rounded hover:bg-rose-50 active:scale-95 transition-all flex items-center gap-1"
              >
                <LogOut className="w-3 h-3" />
                Log Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 shrink-0">
          <nav className="space-y-1 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Main Dashboard
            </div>

            <Link
              to="/"
              className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-slate-900 hover:bg-slate-50 hover:text-slate-900 group border-l-4 border-blue-600 bg-blue-50 text-blue-700 pl-2 transition-all"
            >
              <LayoutDashboard className="w-4 h-4 mr-3 text-slate-400 group-hover:text-blue-600" />
              Overview Dashboard
            </Link>

            {user?.role === 'school_admin' && (
              <Link
                to="/classes"
                className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 group border-l-4 border-transparent pl-2 transition-all"
              >
                <GraduationCap className="w-4 h-4 mr-3 text-slate-400 group-hover:text-blue-600" />
                Classes & Sections
              </Link>
            )}

            {(user?.role === 'school_admin' || user?.role === 'teacher') && (
              <Link
                to="/students"
                className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 group border-l-4 border-transparent pl-2 transition-all"
              >
                <Users className="w-4 h-4 mr-3 text-slate-400 group-hover:text-blue-600" />
                Students (SIS)
              </Link>
            )}

            {user?.role === 'school_admin' && (
              <>
                <Link
                  to="/staff"
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 group border-l-4 border-transparent pl-2 transition-all"
                >
                  <Users2 className="w-4 h-4 mr-3 text-slate-400 group-hover:text-blue-600" />
                  Staff Directory
                </Link>

                <a
                  href="#"
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 group border-l-4 border-transparent pl-2 transition-all"
                  onClick={(e) => e.preventDefault()}
                >
                  <CreditCard className="w-4 h-4 mr-3 text-slate-400 group-hover:text-blue-600" />
                  Fee Management
                </a>
              </>
            )}

            {user?.role === 'school_admin' && (
              <>
                <div className="pt-4 border-t border-slate-200 my-2"></div>

                <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Tenant Settings
                </div>

                <a
                  href="#"
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 group border-l-4 border-transparent pl-2 transition-all"
                  onClick={(e) => e.preventDefault()}
                >
                  <Palette className="w-4 h-4 mr-3 text-slate-400 group-hover:text-blue-600" />
                  Branding Config
                </a>
              </>
            )}
          </nav>
        </aside>

        {/* Dynamic Nested Route Content */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto text-center text-sm text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4">
          <p>© {new Date().getFullYear()} {tenant?.schoolName || 'EduCore School'}. Powered by <strong className="text-blue-600">EduCore ERP Multi-Tenant</strong>.</p>
        </div>
      </footer>
    </div>
  );
};

export default BaseLayout;

