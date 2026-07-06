import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useTenantTheme } from '../context/TenantThemeContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
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
import logo from '../assets/logo.svg';

const BaseLayout = () => {
  const { tenant } = useTenantTheme();
  const { logout, user } = useAuth();
  const location = useLocation();

  const [announcements, setAnnouncements] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [announcementCount, setAnnouncementCount] = useState(0);

  React.useEffect(() => {
    // Fetch announcement count
    const fetchAnnouncements = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5001`;
        const res = await axios.get(`${API_URL}/api/v1/announcements`);
        if (res.data.success) {
          setAnnouncementCount(res.data.count);
          setAnnouncements(res.data.data.slice(0, 5)); // Keep only latest 5 for dropdown
        }
      } catch (err) {
        console.error('Failed to fetch announcements for notification count', err);
      }
    };
    if (user && tenant) {
      fetchAnnouncements();
    }
  }, [user, tenant]);

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

  const classSection = user?.role === 'student' ? (localStorage.getItem('studentClassSection') || 'Class 3 - Section A') : (user?.role === 'teacher' ? 'Class Teacher' : 'Admin Staff');

  // Define Navigation links based on role
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
    // school_admin or super_admin
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

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800 font-sans antialiased overflow-hidden">
      {/* -- Left Sidebar -- */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 h-screen sticky top-0 z-30 shadow-sm">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
          {tenant?.logoUrl ? (
            <>
              <img src={tenant.logoUrl} alt="Logo" className="w-10 h-10 rounded-xl object-cover shadow-md shadow-blue-500/25 shrink-0 border border-slate-100" />
              <div className="min-w-0 text-left">
                <h2 className="font-black text-[14px] text-slate-900 tracking-tight leading-tight truncate">
                  {tenant?.schoolName}
                </h2>
                <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider block mt-0.5">
                  {user?.role === 'student' ? 'Student Portal' : user?.role === 'teacher' ? 'Teacher Portal' : 'Admin Portal'}
                </span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-start gap-1">
              <img src={logo} alt="EduCore Logo" className="h-8 object-contain shrink-0" />
              <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider block">
                {user?.role === 'student' ? 'Student Portal' : user?.role === 'teacher' ? 'Teacher Portal' : 'Admin Portal'}
              </span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          <p className="px-3 pt-3 pb-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Main Menu</p>

          {navLinks.map((item, index) => {
            if (item.divider) {
              return <div key={`div-${index}`} className="pt-4 border-t border-slate-100 my-2"></div>;
            }
            if (item.title) {
              return <p key={`title-${index}`} className="px-3 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.title}</p>;
            }

            const active = activeTab === item.tab;
            const Icon = item.icon;

            if (item.disabled) {
              return (
                <a
                  key={item.tab}
                  href="#"
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150 text-slate-400 opacity-60 cursor-not-allowed`}
                  onClick={(e) => e.preventDefault()}
                >
                  <Icon className="w-4 h-4 shrink-0 text-slate-400" />
                  <span>{item.label}</span>
                </a>
              )
            }

            return (
              <Link
                key={item.tab}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150 ${
                  active
                    ? 'bg-blue-50 text-blue-700 border border-blue-100 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
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

      {/* -- Right Content -- */}
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
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-slate-500 hover:text-blue-600 transition-all group shrink-0"
              >
                <Bell className="w-4.5 h-4.5" />
                {announcementCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white font-black text-[8px] rounded-full flex items-center justify-center animate-pulse border-2 border-white">
                    {announcementCount}
                  </span>
                )}
              </button>
              
              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in slide-in-from-top-2 fade-in duration-200">
                  <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Notifications</h3>
                    <Link to="/announcements" onClick={() => setShowNotifications(false)} className="text-[10px] font-bold text-blue-600 hover:text-blue-700">View All</Link>
                  </div>
                  <div className="max-h-72 overflow-y-auto p-2 space-y-1">
                    {announcements.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400 font-medium">No new notifications</div>
                    ) : (
                      announcements.map((ann) => (
                        <div key={ann._id} className="p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-100 group">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-[9px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{ann.tag}</span>
                            <span className="text-[9px] text-slate-400 font-medium">{new Date(ann.created_at).toLocaleDateString()}</span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-600 line-clamp-1">{ann.title}</h4>
                          <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{ann.description}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-white flex items-center justify-center font-extrabold text-sm uppercase shadow-md shadow-blue-500/20">
                {user?.name?.split(' ').map(n => n[0]).slice(0, 2).join('') || 'U'}
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
};

export default BaseLayout;
