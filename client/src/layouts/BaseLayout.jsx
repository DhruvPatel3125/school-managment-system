import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useTenantTheme } from '../context/TenantThemeContext';

const BaseLayout = () => {
  const { tenant } = useTenantTheme();

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300 dark:bg-slate-900 bg-slate-50">
      {/* Dynamic Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {tenant?.logoUrl ? (
              <img 
                src={tenant.logoUrl} 
                alt={`${tenant.schoolName} logo`} 
                className="w-10 h-10 rounded-full border-2 border-primary object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                🏫
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
              ● Active Tenant
            </span>
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
              AD
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
              <span className="mr-3 text-lg">📊</span>
              Overview Dashboard
            </Link>

            <a 
              href="#" 
              className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all border-l-4 border-transparent pl-2"
              onClick={(e) => e.preventDefault()}
            >
              <span className="mr-3 text-lg">👥</span>
              Students (SIS)
            </a>

            <a 
              href="#" 
              className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all border-l-4 border-transparent pl-2"
              onClick={(e) => e.preventDefault()}
            >
              <span className="mr-3 text-lg">👨‍🏫</span>
              Staff Directory
            </a>

            <a 
              href="#" 
              className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all border-l-4 border-transparent pl-2"
              onClick={(e) => e.preventDefault()}
            >
              <span className="mr-3 text-lg">💰</span>
              Fee Management
            </a>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-700 my-2"></div>

            <div className="px-3 py-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Tenant Settings
            </div>

            <a 
              href="#" 
              className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all border-l-4 border-transparent pl-2"
              onClick={(e) => e.preventDefault()}
            >
              <span className="mr-3 text-lg">🎨</span>
              Branding Config
            </a>
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
