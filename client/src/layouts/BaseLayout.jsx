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
    return `flex items-center px-4 py-3 text-[13px] font-bold rounded-xl transition-all duration-200 group gap-3 ${
      isActive 
        ? 'bg-gradient-to-r from-pink-500/10 to-pink-500/5 border-l-4 border-pink-500 text-pink-500' 
        : 'text-slate-400 hover:text-slate-100 hover:bg-[#1a233a]/50'
    }`;
  };

  // Student Portal Layout
  if (isStudent) {
    return (
      <div className="min-h-screen flex bg-[#090e1a] text-slate-100 font-sans antialiased">
        
        {/* Left Sidebar */}
        <aside className="w-64 bg-[#0d1527] border-r border-[#1e293b]/60 flex flex-col shrink-0 h-screen sticky top-0 z-30">
          {/* Logo Brand Header */}
          <div className="p-6 border-b border-[#1e293b]/60 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shrink-0">
              <span className="font-black text-lg">A</span>
            </div>
            <div className="min-w-0">
              <h2 className="font-extrabold text-[15px] text-white tracking-tight leading-tight truncate">
                {tenant?.schoolName || 'Apex Academy'}
              </h2>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                Student Portal
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
            <div className="px-3 py-1.5 text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">
              Main Menu
            </div>

            <Link to="/" className={getStudentSidebarClass('overview')}>
              <LayoutDashboard className="w-4.5 h-4.5 shrink-0" />
              <span>Dashboard</span>
            </Link>

            <Link to="/myprofile" className={getStudentSidebarClass('myprofile')}>
              <User className="w-4.5 h-4.5 shrink-0" />
              <span>My Profile</span>
            </Link>

            <Link to="/attendance" className={getStudentSidebarClass('attendance')}>
              <Calendar className="w-4.5 h-4.5 shrink-0" />
              <span>Attendance</span>
            </Link>

            <Link to="/homework" className={getStudentSidebarClass('homework')}>
              <BookOpen className="w-4.5 h-4.5 shrink-0" />
              <span>Homework</span>
            </Link>

            <Link to="/fees" className={getStudentSidebarClass('fees')}>
              <CreditCard className="w-4.5 h-4.5 shrink-0" />
              <span>Fees & Payments</span>
            </Link>

            <Link to="/exams" className={getStudentSidebarClass('exams')}>
              <Award className="w-4.5 h-4.5 shrink-0" />
              <span>Exams</span>
            </Link>

            <Link to="/timetable" className={getStudentSidebarClass('timetable')}>
              <Clock className="w-4.5 h-4.5 shrink-0" />
              <span>Time Table</span>
            </Link>

            <Link to="/announcements" className={getStudentSidebarClass('announcements')}>
              <Bell className="w-4.5 h-4.5 shrink-0" />
              <span>Announcements</span>
            </Link>

            <Link to="/messages" className={getStudentSidebarClass('messages')}>
              <MessageSquare className="w-4.5 h-4.5 shrink-0" />
              <span>Messages</span>
            </Link>

            <Link to="/documents" className={getStudentSidebarClass('documents')}>
              <FileText className="w-4.5 h-4.5 shrink-0" />
              <span>Documents</span>
            </Link>
          </nav>

          {/* Quick Help Card */}
          <div className="p-4 border-t border-[#1e293b]/60">
            <div className="bg-[#121b33] rounded-xl p-4 border border-[#1e293b]/80 relative overflow-hidden">
              <div className="absolute -right-2 -bottom-2 opacity-5 text-4xl"><HelpCircle /></div>
              <div className="flex items-center gap-2 mb-2">
                <HelpCircle className="w-4 h-4 text-pink-500" />
                <h4 className="font-extrabold text-[12px] text-white">Quick Help</h4>
              </div>
              <p className="text-[10px] text-slate-400 mb-3.5 leading-relaxed">Need help? Contact our tech support team.</p>
              <button 
                onClick={() => alert('Support request submitted. We will contact you shortly.')}
                className="w-full py-2 bg-gradient-to-r from-pink-500/20 to-transparent border border-pink-500/30 hover:bg-pink-500 hover:text-white transition-all text-pink-400 font-extrabold text-[10px] rounded-lg tracking-wider uppercase"
              >
                Contact Support
              </button>
            </div>
          </div>
        </aside>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-[#090e1a]">
          
          {/* Header */}
          <header className="px-8 py-4 flex items-center justify-between bg-[#0d1527]/40 border-b border-[#1e293b]/40 sticky top-0 z-20 backdrop-blur-md">
            <div>
              <span className="text-[10px] font-bold text-pink-500 uppercase tracking-widest">
                Academic Session 2026-27
              </span>
            </div>

            <div className="flex items-center gap-6">
              {/* Notification bell widget */}
              <button className="relative p-2 rounded-xl hover:bg-[#1a233a] transition-all group shrink-0">
                <Bell className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white font-black text-[8px] rounded-full flex items-center justify-center border border-[#0d1527] animate-pulse">
                  3
                </span>
              </button>

              {/* Profile Card */}
              <div className="flex items-center gap-3 border-l border-[#1e293b]/80 pl-6">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 to-indigo-500 text-white flex items-center justify-center font-extrabold text-sm uppercase shadow-inner shadow-black/40">
                  {user?.name?.split(' ').map(n => n[0]).slice(0, 2).join('') || 'S'}
                </div>
                <div className="text-left hidden sm:block">
                  <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">{user?.name}</h4>
                  <span className="text-[9px] text-slate-450 font-bold block mt-0.5">{classSection}</span>
                </div>
                
                {/* Logout Button */}
                <button 
                  onClick={logout}
                  className="p-2 ml-2 hover:bg-rose-500/10 text-rose-400 hover:text-rose-500 rounded-lg transition-all"
                  title="Logout Session"
                >
                  <LogOut className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>
          </header>

          {/* Page Body content */}
          <main className="p-8 flex-grow">
            <Outlet />
          </main>
          
        </div>
      </div>
    );
  }

  // Classic Admin / Staff Layout (Unmodified)
  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300 dark:bg-slate-900 bg-slate-50">
      {/* Dynamic Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {tenant?.logoUrl && !logoError ? (
              <img 
                src={tenant.logoUrl} 
                alt={`${tenant.schoolName} logo`} 
                className="w-10 h-10 rounded-full border-2 border-primary object-cover"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-inner">
                <School className="w-5 h-5 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                {tenant?.schoolName || 'EduCore ERP'}
              </h1>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {tenant?.subdomain}.educore.app
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
              ● Active
            </span>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase shadow-inner">
                {user?.name?.split(' ').map(n => n[0]).slice(0, 2).join('') || 'U'}
              </div>
              <button 
                onClick={logout}
                className="text-xs text-rose-500 hover:text-rose-600 font-semibold px-2 py-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/20 active:scale-95 transition-all flex items-center gap-1"
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
          <nav className="space-y-1 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-sm transition-colors">
            <div className="px-3 py-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Main Dashboard
            </div>
            
            <Link 
              to="/" 
              className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700/50 group border-l-4 border-primary pl-2 transition-all"
            >
              <LayoutDashboard className="w-4 h-4 mr-3 text-slate-400 group-hover:text-primary transition-colors" />
              Overview Dashboard
            </Link>

            {user?.role === 'school_admin' && (
              <Link 
                to="/classes" 
                className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 group border-l-4 border-transparent pl-2 transition-all"
              >
                <GraduationCap className="w-4 h-4 mr-3 text-slate-400 group-hover:text-primary transition-colors" />
                Classes & Sections
              </Link>
            )}

            {(user?.role === 'school_admin' || user?.role === 'teacher') && (
              <Link 
                to="/students" 
                className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 group border-l-4 border-transparent pl-2 transition-all"
              >
                <Users className="w-4 h-4 mr-3 text-slate-400 group-hover:text-primary transition-colors" />
                Students (SIS)
              </Link>
            )}

            {user?.role === 'school_admin' && (
              <>
                <Link 
                  to="/staff" 
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 group border-l-4 border-transparent pl-2 transition-all"
                >
                  <Users2 className="w-4 h-4 mr-3 text-slate-400 group-hover:text-primary transition-colors" />
                  Staff Directory
                </Link>

                <a 
                  href="#" 
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 group border-l-4 border-transparent pl-2 transition-all"
                  onClick={(e) => e.preventDefault()}
                >
                  <CreditCard className="w-4 h-4 mr-3 text-slate-400 group-hover:text-primary transition-colors" />
                  Fee Management
                </a>
              </>
            )}

            {user?.role === 'school_admin' && (
              <>
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700 my-2"></div>

                <div className="px-3 py-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Tenant Settings
                </div>

                <a 
                  href="#" 
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 group border-l-4 border-transparent pl-2 transition-all"
                  onClick={(e) => e.preventDefault()}
                >
                  <Palette className="w-4 h-4 mr-3 text-slate-400 group-hover:text-primary transition-colors" />
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
      <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-6 mt-auto transition-colors text-center text-sm text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4">
          <p>© {new Date().getFullYear()} {tenant?.schoolName || 'EduCore School'}. Powered by <strong className="text-primary">EduCore ERP Multi-Tenant</strong>.</p>
        </div>
      </footer>
    </div>
  );
};

export default BaseLayout;
