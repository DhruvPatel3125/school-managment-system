import React from 'react';
import { Activity, Database, RefreshCw } from 'lucide-react';

const SystemHealthSidebar = ({ systemHealth, logs, fetchLogs }) => {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Health Stats */}
      <div className="bg-slate-900/30 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-xl space-y-4 lg:col-span-1">
        <div className="border-b border-slate-800 pb-2.5">
          <h3 className="text-sm font-bold flex items-center gap-2 uppercase tracking-wide text-slate-300">
            <Activity className="w-4 h-4 text-emerald-450 animate-pulse" /> Infrastructure Telemetry
          </h3>
        </div>
        
        <div className="space-y-3.5 text-xs font-medium">
          <div className="flex justify-between items-center bg-slate-950/70 p-3 rounded-lg border border-slate-850">
            <span className="text-slate-500">Gateway API Connection</span>
            <span className="font-semibold text-emerald-400 flex items-center gap-1.5 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-500/10">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              {systemHealth.apiStatus}
            </span>
          </div>
          <div className="flex justify-between items-center bg-slate-950/70 p-3 rounded-lg border border-slate-850">
            <span className="text-slate-550">Node.js CPU Utilization</span>
            <span className="font-semibold text-indigo-400">{systemHealth.cpu}</span>
          </div>
          <div className="flex justify-between items-center bg-slate-950/70 p-3 rounded-lg border border-slate-850">
            <span className="text-slate-550">Memory Load (Buffered)</span>
            <span className="font-semibold text-indigo-400">{systemHealth.memory}</span>
          </div>
          <div className="flex justify-between items-center bg-slate-950/70 p-3 rounded-lg border border-slate-850">
            <span className="text-slate-555">Server Instance Uptime</span>
            <span className="font-semibold text-slate-350">{systemHealth.uptime}</span>
          </div>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="bg-slate-900/30 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-xl lg:col-span-2 flex flex-col justify-between">
        <div className="border-b border-slate-800 pb-2.5 flex justify-between items-center bg-transparent">
          <h3 className="text-sm font-bold flex items-center gap-2 uppercase tracking-wide text-slate-300">
            <Database className="w-4 h-4 text-indigo-400" /> Platform Security Audit Console
          </h3>
          <button 
            onClick={fetchLogs} 
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-350 flex items-center gap-1 bg-indigo-500/5 px-2 py-1 rounded border border-indigo-500/10 transition-all"
          >
            <RefreshCw className="w-2.5 h-2.5" /> Refresh Logs
          </button>
        </div>

        <div className="mt-3 bg-black/85 p-4 rounded-xl border border-slate-900 font-mono text-[10px] text-slate-450 space-y-2 h-44 overflow-y-auto custom-scrollbar shadow-inner text-emerald-400/90 shadow-[0_0_15px_rgba(0,0,0,0.4)]">
          {logs.length === 0 ? (
            <div className="text-center text-slate-600 py-12">No administration activities logged in Mongo DB.</div>
          ) : (
            logs.map((log) => (
              <div key={log._id || log.id} className="flex items-start gap-2 hover:text-emerald-350 transition-all py-0.5 border-b border-slate-950/30 leading-relaxed">
                <span className="text-slate-600 text-[9px] shrink-0 font-sans">[{new Date(log.createdAt).toLocaleTimeString()}]</span>
                <span className="text-indigo-455 font-bold shrink-0 uppercase">#{log.action}:</span>
                <span className="text-slate-300 font-sans">{log.details}</span>
                <span className="text-slate-600 italic text-[9px] ml-auto shrink-0 font-sans">by {log.performedBy}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default SystemHealthSidebar;
