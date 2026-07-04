import React from 'react';
import { Activity, Database, RefreshCw } from 'lucide-react';

const SystemHealthSidebar = ({ systemHealth, logs, fetchLogs }) => {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Health Stats */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-md shadow-slate-200/50 space-y-4 lg:col-span-1">
        <div className="border-b border-slate-200 pb-2.5">
          <h3 className="text-sm font-bold flex items-center gap-2 uppercase tracking-wide text-slate-900">
            <Activity className="w-4 h-4 text-emerald-500 animate-pulse" /> Infrastructure Telemetry
          </h3>
        </div>
        
        <div className="space-y-3.5 text-xs font-medium">
          <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-slate-600">Gateway API Connection</span>
            <span className="font-semibold text-emerald-700 flex items-center gap-1.5 bg-emerald-100/50 px-2 py-0.5 rounded border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              {systemHealth.apiStatus}
            </span>
          </div>
          <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-slate-600">Node.js CPU Utilization</span>
            <span className="font-semibold text-indigo-600">{systemHealth.cpu}</span>
          </div>
          <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-slate-600">Memory Load (Buffered)</span>
            <span className="font-semibold text-indigo-600">{systemHealth.memory}</span>
          </div>
          <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-slate-600">Server Instance Uptime</span>
            <span className="font-semibold text-slate-700">{systemHealth.uptime}</span>
          </div>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-md shadow-slate-200/50 lg:col-span-2 flex flex-col justify-between">
        <div className="border-b border-slate-200 pb-2.5 flex justify-between items-center bg-transparent">
          <h3 className="text-sm font-bold flex items-center gap-2 uppercase tracking-wide text-slate-900">
            <Database className="w-4 h-4 text-indigo-600" /> Platform Security Audit Console
          </h3>
          <button 
            onClick={fetchLogs} 
            className="text-xs font-semibold text-indigo-700 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded border border-indigo-200 transition-all shadow-sm"
          >
            <RefreshCw className="w-2.5 h-2.5" /> Refresh Logs
          </button>
        </div>

        <div className="mt-3 bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-[10px] text-slate-700 space-y-2 h-44 overflow-y-auto custom-scrollbar shadow-inner">
          {logs.length === 0 ? (
            <div className="text-center text-slate-400 py-12">No administration activities logged in Mongo DB.</div>
          ) : (
            logs.map((log) => (
              <div key={log._id || log.id} className="flex items-start gap-2 hover:bg-white transition-all py-1 px-1 border-b border-slate-200/60 leading-relaxed rounded">
                <span className="text-slate-400 text-[9px] shrink-0 font-sans">[{new Date(log.createdAt).toLocaleTimeString()}]</span>
                <span className="text-indigo-600 font-bold shrink-0 uppercase">#{log.action}:</span>
                <span className="text-slate-700 font-sans">{log.details}</span>
                <span className="text-slate-400 italic text-[9px] ml-auto shrink-0 font-sans">by {log.performedBy}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default SystemHealthSidebar;
