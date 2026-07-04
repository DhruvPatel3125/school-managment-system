import React from 'react';
import { RefreshCw, Loader2, AlertTriangle, School, ExternalLink, Settings, Trash2 } from 'lucide-react';

const TenantTable = ({
  tenants,
  loading,
  error,
  refreshData,
  openEditModal,
  handleDeleteTenant
}) => {
  return (
    <section className="bg-slate-900/30 backdrop-blur-md border border-slate-800/80 rounded-2xl shadow-xl overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/40">
        <h3 className="text-md font-bold tracking-tight text-slate-200">Active School Portals Registry</h3>
        <button 
          onClick={refreshData}
          className="text-xs font-semibold text-indigo-400 hover:text-indigo-350 flex items-center gap-1.5 border border-indigo-500/20 px-3 py-1.5 rounded-lg bg-indigo-500/5 hover:bg-indigo-500/10 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Registry
        </button>
      </div>

      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-xs text-slate-550 font-medium uppercase tracking-wider animate-pulse">Loading Platform Registry...</p>
        </div>
      ) : error ? (
        <div className="py-12 text-center text-xs text-rose-450 font-medium flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      ) : tenants.length === 0 ? (
        <div className="py-16 text-center text-sm text-slate-500 max-w-sm mx-auto space-y-4">
          <School className="w-12 h-12 text-slate-700 mx-auto" />
          <p>No active portals are configured on this SaaS platform yet. Register a new tenant school to begin.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-850 text-slate-450 font-bold uppercase tracking-wider text-[10px]">
                <th className="px-6 py-4">School Details</th>
                <th className="px-6 py-4">Dedicated Domain</th>
                <th className="px-6 py-4">Subscription Plan</th>
                <th className="px-6 py-4">Branding Config</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {tenants.map((school) => (
                <tr key={school._id || school.id} className="hover:bg-slate-800/15 transition-all">
                  <td className="px-6 py-4 flex items-center space-x-3.5">
                    <img 
                      src={school.logoUrl || "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=200&h=200&fit=crop"} 
                      alt="" 
                      className="w-10 h-10 rounded-xl border border-slate-800 object-cover bg-slate-950 shadow-inner shrink-0" 
                      onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=200&h=200&fit=crop"; }}
                    />
                    <div>
                      <span className="font-extrabold text-slate-200 text-sm block leading-snug">{school.schoolName}</span>
                      <span className="text-[10px] text-slate-550 font-semibold uppercase tracking-wider block mt-0.5">Limit: {school.maxStudents || 10} students</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-400 font-medium">
                    <a 
                      href={`${window.location.protocol}//${school.subdomain}.${window.location.hostname}:${window.location.port}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-indigo-400 hover:text-indigo-350 hover:underline flex items-center gap-1 shrink-0"
                    >
                      {school.subdomain}.localhost <ExternalLink className="w-3 h-3 text-slate-650" />
                    </a>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/40 border border-indigo-500/20 rounded">
                      {school.plan || 'starter'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-5 h-5 rounded-md border border-slate-800 shadow-inner block" style={{ backgroundColor: school.primaryColor }} title="Primary Color"></span>
                      <span className="w-5 h-5 rounded-md border border-slate-800 shadow-inner block" style={{ backgroundColor: school.secondaryColor }} title="Secondary Color"></span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {school.status === 'suspended' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-rose-950/20 text-rose-450 border border-rose-500/20 uppercase tracking-wide">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Suspended
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-950/20 text-emerald-450 border border-emerald-500/20 uppercase tracking-wide">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => window.open(`${window.location.protocol}//${school.subdomain}.${window.location.hostname}:${window.location.port}`, "_blank")}
                        className="p-2 bg-indigo-500/10 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/20 rounded-lg transition-all"
                        title="Launch School Portal"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openEditModal(school)}
                        className="p-2 bg-slate-800 hover:bg-slate-750 text-slate-350 border border-slate-700 rounded-lg transition-all"
                        title="Modify Configurations"
                      >
                        <Settings className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTenant(school._id || school.id, school.schoolName)}
                        className="p-2 bg-rose-500/10 hover:bg-rose-600 hover:text-white text-rose-450 border border-rose-500/20 rounded-lg transition-all"
                        title="Delete School"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default TenantTable;
