import React from 'react';
import { School, GraduationCap, Users } from 'lucide-react';

const DashboardMetrics = ({ metrics }) => {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md shadow-slate-200/50 flex items-center justify-between hover:border-slate-300 hover:shadow-lg transition-all duration-300">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Registered Schools</p>
          <p className="text-3xl font-black mt-1.5 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-600">{metrics.schools}</p>
        </div>
        <div className="p-3.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm">
          <School className="w-6 h-6" />
        </div>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md shadow-slate-200/50 flex items-center justify-between hover:border-slate-300 hover:shadow-lg transition-all duration-300">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Admitted Students</p>
          <p className="text-3xl font-black mt-1.5 text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">{metrics.students}</p>
        </div>
        <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm">
          <GraduationCap className="w-6 h-6" />
        </div>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md shadow-slate-200/50 flex items-center justify-between hover:border-slate-300 hover:shadow-lg transition-all duration-300">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Registered Staff Members</p>
          <p className="text-3xl font-black mt-1.5 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">{metrics.staff}</p>
        </div>
        <div className="p-3.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 shadow-sm">
          <Users className="w-6 h-6" />
        </div>
      </div>
    </section>
  );
};

export default DashboardMetrics;
