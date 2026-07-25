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
  User,
  Calendar,
  BookOpen,
  Award,
  Clock,
  Bell,
  MessageSquare,
  FileText,
  HelpCircle,
  Menu,
  X
} from 'lucide-react';
import logo from '../assets/logo.svg';
import NotificationBell from '../components/NotificationBell';

const BaseLayout = () => {
  const { tenant } = useTenantTheme();
  const { logout, user } = useAuth();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getActiveTab = () => {
    const path = location.pathname;
    if (path.startsWith('/students')) return 'students';
    if (path.startsWith('/classes')) return 'classes';
    if (path.startsWith('/staff')) return 'staff';
    if (path.startsWith('/myprofile')) return 'myprofile';
    if (path.startsWith('/attendance')) return 'attendance';
    if (path.startsWith('/homework')) return 'homework';
    if (path.startsWith('/fees')) return 'fees';
    if (path.startsWith('/exams')) return 'exams';
    if (path.startsWith('/timetable')) return 'timetable';
    if (path.startsWith('/announcements')) return 'announcements';
    if (path.startsWith('/messages')) return 'messages';
    if (path.startsWith('/documents')) return 'documents';
    if (path.startsWith('/subscription')) return 'subscription';
    return 'overview';
  };
  const activeTab = getActiveTab();

  const classSection = user?.role === 'student'
    ? (localStorage.getItem('studentClassSection') || 'Class 3 - Section A')
    : (user?.role === 'teacher' ? 'Class Teacher' : 'School Admin');

  let navLinks = [];
  if (user?.role === 'student') {
    navLinks = [
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
    ];
  } else if (user?.role === 'teacher') {
    navLinks = [
      { to: '/',            tab: 'overview',      icon: LayoutDashboard, label: 'Overview Dashboard' },
      { to: '/classes',     tab: 'classes',       icon: GraduationCap,   label: 'Classes & Sections' },
      { to: '/students',    tab: 'students',      icon: Users,           label: 'Students (SIS)' },
      { to: '/announcements', tab: 'announcements', icon: Bell,          label: 'Announcements' },
    ];
  } else {
    navLinks = [
      { to: '/',            tab: 'overview',      icon: LayoutDashboard, label: 'Overview Dashboard' },
      { to: '/announcements', tab: 'announcements', icon: Bell,          label: 'Announcements' },
      { to: '/classes',     tab: 'classes',       icon: GraduationCap,   label: 'Classes & Sections' },
      { to: '/students',    tab: 'students',      icon: Users,           label: 'Students (SIS)' },
      { to: '/staff',       tab: 'staff',         icon: Users2,          label: 'Staff Directory' },
      { to: '/subscription',tab: 'subscription',  icon: CreditCard,      label: 'Subscription & Billing' },
      { divider: true },
      { title: 'Tenant Settings' },
      { to: '#',            tab: 'branding',      icon: Palette,         label: 'Branding Config',   disabled: true },
    ];
  }

  const primaryBrandColor = tenant?.primaryColor || '#0D1B2A';

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800 font-sans antialiased overflow-x-hidden">
      {/* -- Mobile Sticky Top Bar -- */}
      <div className="md:hidden w-full bg-white border-b border-slate-200 h-14 flex items-center justify-between px-4 fixed top-0 left-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
          {tenant?.logoUrl ? (
            <img src={tenant.logoUrl} alt="Logo" className="w-6 h-6 rounded object-cover" />
          ) : (
            <img src={logo} alt="Logo" className="h-4 object-contain" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <div 
            onClick={logout}
            className="w-7 h-7 rounded text-white flex items-center justify-center font-bold text-[10px] uppercase cursor-pointer"
            style={{ background: primaryBrandColor }}
            title="Click to logout"
          >
            {user?.name?.split(' ').map(n => n[0]).slice(0, 2).join('') || 'U'}
          </div>
        </div>
      </div>

      {/* -- Left Sidebar (Fixed on Mobile Drawer / Sticky on Desktop) -- */}
      <aside 
        className={`w-60 bg-white border-r border-slate-200 flex flex-col shrink-0 h-screen fixed md:sticky top-0 z-50 shadow-sm transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {tenant?.logoUrl ? (
              <>
                <img src={tenant.logoUrl} alt="Logo" className="w-8 h-8 rounded-lg object-cover shrink-0 border border-slate-200" />
                <div className="min-w-0 text-left">
                  <h2 className="font-semibold text-xs text-slate-950 tracking-tight leading-tight truncate">
                    {tenant?.schoolName}
                  </h2>
                  <span className="text-[9px] font-semibold uppercase tracking-wider block mt-0.5" style={{ color: primaryBrandColor }}>
                    {user?.role === 'student' ? 'Student Portal' : user?.role === 'teacher' ? 'Teacher Portal' : 'Admin Portal'}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-start gap-0.5">
                <img src={logo} alt="EduCore Logo" className="h-6 object-contain shrink-0" />
                <span className="text-[9px] font-semibold uppercase tracking-wider block" style={{ color: primaryBrandColor }}>
                  {user?.role === 'student' ? 'Student Portal' : user?.role === 'teacher' ? 'Teacher Portal' : 'Admin Portal'}
                </span>
              </div>
            )}
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1.5 rounded hover:bg-slate-100 text-slate-450">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2.5 space-y-0.5">
          <p className="px-2.5 pt-2 pb-1 text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Main Menu</p>

          {navLinks.map((item, index) => {
            if (item.divider) {
              return <div key={`div-${index}`} className="border-t border-slate-100 my-2"></div>;
            }
            if (item.title) {
              return <p key={`title-${index}`} className="px-2.5 py-1 text-[9px] font-semibold text-slate-400 uppercase tracking-wider">{item.title}</p>;
            }

            const active = activeTab === item.tab;
            const Icon = item.icon;

            if (item.disabled) {
              return (
                <a
                  key={item.tab}
                  href="#"
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-400 opacity-60 cursor-not-allowed"
                  onClick={(e) => e.preventDefault()}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </a>
              );
            }

            return (
              <Link
                key={item.tab}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                  active
                    ? 'bg-slate-50 text-slate-900 border-l-2'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
                style={active ? { borderLeftColor: primaryBrandColor } : {}}
              >
                <Icon
                  className="w-4 h-4 shrink-0 transition-colors"
                  style={{ color: active ? primaryBrandColor : 'var(--slate-400)' }}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Help Link */}
        <div className="p-3 border-t border-slate-100">
          <button
            onClick={() => alert('Support request submitted. We will contact you shortly.')}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-800 text-xs font-medium transition-colors shadow-sm"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>Contact Support</span>
          </button>
        </div>
      </aside>

      {/* Backdrop overlay for mobile */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="md:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-45" />
      )}

      {/* -- Right Content (with padding-top offset on mobile for header) -- */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-slate-50 pt-14 md:pt-0">
        {/* Desktop Header */}
        <header className="hidden md:flex px-6 py-3 items-center justify-between bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
              Academic Session 2026-27
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <NotificationBell />

            {/* Profile */}
            <div className="flex items-center gap-3 border-l border-slate-200 pl-3">
              <div
                className="w-7 h-7 rounded-lg text-white flex items-center justify-center font-bold text-xs uppercase"
                style={{ background: primaryBrandColor }}
              >
                {user?.name?.split(' ').map(n => n[0]).slice(0, 2).join('') || 'U'}
              </div>
              <div className="text-left hidden sm:block">
                <h4 className="font-semibold text-xs text-slate-800 tracking-wide leading-none">{user?.name}</h4>
                <span className="text-[9px] text-slate-500 font-medium block mt-0.5">{classSection}</span>
              </div>
              <button
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 flex-grow bg-slate-50 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default BaseLayout;
