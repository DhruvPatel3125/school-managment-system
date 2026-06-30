import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
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
  School
} from 'lucide-react';

const BaseLayout = () => {
  const { tenant } = useTenantTheme();
  const { logout, user } = useAuth();
  const [logoError, setLogoError] = useState(false);

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
