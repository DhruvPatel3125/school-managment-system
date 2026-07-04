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
    <section className="bg-white border border-slate-200 rounded-2xl shadow-md overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <h3 className="text-md font-bold tracking-tight text-slate-900">Active School Portals Registry</h3>
        <button 
          onClick={refreshData}
          className="text-xs font-semibold text-indigo-700 hover:text-indigo-800 flex items-center gap-1.5 border border-indigo-200 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition-all shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Registry
        </button>
      </div>

      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider animate-pulse">Loading Platform Registry...</p>
        </div>
      ) : error ? (
        <div className="py-12 text-center text-xs text-rose-600 font-medium flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      ) : tenants.length === 0 ? (
        <div className="py-16 text-center text-sm text-slate-500 max-w-sm mx-auto space-y-4">
          <School className="w-12 h-12 text-slate-300 mx-auto" />
          <p>No active portals are configured on this SaaS platform yet. Register a new tenant school to begin.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="px-6 py-4">School Details</th>
                <th className="px-6 py-4">Dedicated Domain</th>
                <th className="px-6 py-4">Subscription Plan</th>
                <th className="px-6 py-4">Branding Config</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tenants.map((school) => (
                <tr key={school._id || school.id} className="hover:bg-slate-50/80 transition-all">
                  <td className="px-6 py-4 flex items-center space-x-3.5">
                    <img 
                      src={school.logoUrl || "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=200&h=200&fit=crop"} 
                      alt="" 
                      className="w-10 h-10 rounded-xl border border-slate-200 object-cover bg-white shadow-sm shrink-0" 
                      onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=200&h=200&fit=crop"; }}
                    />
                    <div>
                      <span className="font-extrabold text-slate-900 text-sm block leading-snug">{school.schoolName}</span>
                      <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block mt-0.5">Limit: {school.maxStudents || 10} students</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">
                    <a 
                      href={`${window.location.protocol}//${school.subdomain}.${window.location.hostname}:${window.location.port}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 shrink-0"
                    >
                      {school.subdomain}.localhost <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 rounded">
                      {school.plan || 'starter'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-5 h-5 rounded-md border border-slate-300 shadow-sm block" style={{ backgroundColor: school.primaryColor }} title="Primary Color"></span>
                      <span className="w-5 h-5 rounded-md border border-slate-300 shadow-sm block" style={{ backgroundColor: school.secondaryColor }} title="Secondary Color"></span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {school.status === 'suspended' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200 uppercase tracking-wide">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Suspended
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wide">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => window.open(`${window.location.protocol}//${school.subdomain}.${window.location.hostname}:${window.location.port}`, "_blank")}
                        className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg transition-all shadow-sm"
                        title="Launch School Portal"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openEditModal(school)}
                        className="p-2 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-lg transition-all shadow-sm"
                        title="Modify Configurations"
                      >
                        <Settings className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTenant(school._id || school.id, school.schoolName)}
                        className="p-2 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 border border-rose-200 rounded-lg transition-all shadow-sm"
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
