import React from 'react';
import { School, GraduationCap, Users } from 'lucide-react';

const DashboardMetrics = ({ metrics }) => {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-sm flex items-center justify-between hover:border-slate-700/80 transition-all duration-300">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Registered Schools</p>
          <p className="text-3xl font-black mt-1.5 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">{metrics.schools}</p>
        </div>
        <div className="p-3.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-inner">
          <School className="w-6 h-6" />
        </div>
      </div>
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-sm flex items-center justify-between hover:border-slate-700/80 transition-all duration-300">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Admitted Students</p>
          <p className="text-3xl font-black mt-1.5 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">{metrics.students}</p>
        </div>
        <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-inner">
          <GraduationCap className="w-6 h-6" />
        </div>
      </div>
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-sm flex items-center justify-between hover:border-slate-700/80 transition-all duration-300">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Registered Staff Members</p>
          <p className="text-3xl font-black mt-1.5 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{metrics.staff}</p>
        </div>
        <div className="p-3.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-inner">
          <Users className="w-6 h-6" />
        </div>
      </div>
    </section>
  );
};

export default DashboardMetrics;
