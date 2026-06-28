import React from 'react';
import { useTenantTheme } from '../context/TenantThemeContext';

const Home = () => {
  const { tenant } = useTenantTheme();

  // Mock statistics for the school dashboard
  const stats = [
    { name: 'Total Students', value: '1,248', change: '+4.75%', changeType: 'increase', icon: '🎓' },
    { name: 'Active Teachers', value: '84', change: '+2.1%', changeType: 'increase', icon: '👨‍🏫' },
    { name: 'Daily Attendance', value: '94.2%', change: '-0.4%', changeType: 'decrease', icon: '📅' },
    { name: 'Fees Collected (Mtd)', value: '₹14.2L', change: '+12.5%', changeType: 'increase', icon: '💰' }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative rounded-2xl overflow-hidden shadow-lg border border-primary/20 bg-gradient-to-r from-primary to-primary/80 text-white p-6 sm:p-8">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome to {tenant?.schoolName || 'EduCore School'}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-white/90">
            Managing academic programs, student lifecycle documents, attendance lists, and fee receipts for your school in a unified portal.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button className="px-4 py-2 bg-white text-primary font-semibold text-sm rounded-lg shadow hover:bg-slate-50 active:scale-95 transition-all">
              Add Admission
            </button>
            <button className="px-4 py-2 bg-primary-dark/30 border border-white/20 text-white font-semibold text-sm rounded-lg hover:bg-white/10 active:scale-95 transition-all">
              Manage Exams
            </button>
          </div>
        </div>
        {/* Subtle decorative vector background */}
        <div className="absolute right-0 bottom-0 opacity-15 text-8xl p-4 hidden md:block select-none">
          🏫
        </div>
      </div>

      {/* Grid of widgets */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div 
            key={item.name} 
            className="glass-card hover-scale p-5 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">{item.name}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{item.value}</p>
              <div className="mt-1 flex items-center space-x-1.5">
                <span className={`text-xs font-semibold ${
                  item.changeType === 'increase' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}>
                  {item.change}
                </span>
                <span className="text-xs text-slate-400">vs last month</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center text-2xl shadow-inner">
              {item.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Demonstration dynamic switching section */}
      <div className="glass-card p-6 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
          <span className="mr-2">💡</span> Multi-Tenancy Demonstration
        </h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          This single React codebase automatically adapts to the sub-domain config mapping. You can toggle between different school subdomains to view how the application logo, dynamic styling variables (<span className="text-primary font-semibold">Primary Color</span>, <span className="text-secondary font-semibold">Secondary Color</span>), and portal page titles immediately adapt!
        </p>

        <div className="mt-6 border-t border-slate-100 dark:border-slate-700 pt-6">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Choose School Tenant Profile
          </h4>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => window.location.search = '?tenant=schoola'}
              className={`flex-1 min-w-[200px] flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                tenant?.subdomain === 'schoola' 
                  ? 'border-blue-500 bg-blue-500/5 shadow-md shadow-blue-500/5' 
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center text-white text-xs">A</span>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">Delhi Public School</div>
                  <div className="text-xs text-slate-500">subdomain: schoola</div>
                </div>
              </div>
              <span className="text-blue-500 text-xs font-semibold">#1E3A8A</span>
            </button>

            <button 
              onClick={() => window.location.search = '?tenant=schoolb'}
              className={`flex-1 min-w-[200px] flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                tenant?.subdomain === 'schoolb' 
                  ? 'border-emerald-500 bg-emerald-500/5 shadow-md shadow-emerald-500/5' 
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="w-8 h-8 rounded-full bg-emerald-800 flex items-center justify-center text-white text-xs">B</span>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">St. Mary School</div>
                  <div className="text-xs text-slate-500">subdomain: schoolb</div>
                </div>
              </div>
              <span className="text-emerald-500 text-xs font-semibold">#065F46</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
