import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, 
  Plus, 
  LogOut, 
  Sparkles
} from 'lucide-react';

import DashboardMetrics from './superadmin/components/DashboardMetrics';
import TenantTable from './superadmin/components/TenantTable';
import SystemHealthSidebar from './superadmin/components/SystemHealthSidebar';
import OnboardTenantModal from './superadmin/components/OnboardTenantModal';
import EditTenantModal from './superadmin/components/EditTenantModal';

const SuperAdminDashboard = () => {
  const { logout } = useAuth();
  
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [metrics, setMetrics] = useState({ schools: 0, students: 0, staff: 0 });
  const [logs, setLogs] = useState([]);
  const [systemHealth, setSystemHealth] = useState({
    cpu: '18%',
    memory: '4.82 GB / 8.00 GB',
    uptime: '1d 14h 22m',
    apiStatus: 'Healthy'
  });

  const [showModal, setShowModal] = useState(false);
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSchool, setEditSchool] = useState(null);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get('http://localhost:5001/api/v1/tenants');
      setTenants(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch tenants directory list.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/v1/superadmin/metrics');
      if (res.data.success) {
        setMetrics(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load system metrics:', err);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/v1/superadmin/logs');
      if (res.data.success) {
        setLogs(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load activity logs:', err);
    }
  };

  useEffect(() => {
    fetchTenants();
    fetchMetrics();
    fetchLogs();

    const interval = setInterval(() => {
      const randomCpu = Math.floor(10 + Math.random() * 20) + '%';
      const randomMem = (4.4 + Math.random() * 0.6).toFixed(2) + ' GB / 8.00 GB';
      setSystemHealth(prev => ({
        ...prev,
        cpu: randomCpu,
        memory: randomMem
      }));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const refreshData = () => {
    fetchTenants();
    fetchMetrics();
    fetchLogs();
  };

  const openEditModal = (school) => {
    setEditSchool(school);
    setShowEditModal(true);
  };

  const handleDeleteTenant = async (id, name) => {
    if (!window.confirm(`⚠️ WARNING: Are you absolutely sure you want to permanently delete school '${name}'?\n\nThis will cascade delete ALL students, teachers, classes, fees, and administrators associated with this school tenant. This action is irreversible!`)) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5001/api/v1/superadmin/tenants/${id}`);
      alert(`Permanently deleted school '${name}' and cleaned up database.`);
      refreshData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to remove tenant registry.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Dynamic Background Glows */}
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed top-1/2 right-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[150px] pointer-events-none z-0"></div>

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900/60 backdrop-blur-md border-b border-slate-800/80 h-16 flex items-center justify-between px-6 shadow-lg">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-indigo-550/10 rounded-xl border border-indigo-500/20">
            <Shield className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-tight leading-none text-white flex items-center gap-1.5">
              EduCore <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 text-[10px] uppercase font-bold tracking-wider border border-indigo-500/25">SuperAdmin</span>
            </h1>
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5 block">SaaS Platform Console</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-2 bg-slate-950 border border-slate-850 px-3 py-1.5 rounded-lg text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-400">Status: <strong className="text-slate-200">Session Secure</strong></span>
          </div>
          <button 
            onClick={logout}
            className="px-3.5 py-2 text-xs font-semibold text-rose-450 hover:text-white bg-rose-950/20 hover:bg-rose-600 border border-rose-500/20 rounded-lg active:scale-95 transition-all flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8 relative z-10">
        
        {/* Banner */}
        <div className="relative overflow-hidden bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
          <div className="absolute top-0 right-0 w-[300px] h-full bg-gradient-to-l from-indigo-500/5 to-transparent pointer-events-none"></div>
          <div className="space-y-1.5">
            <h2 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" /> Onboard School Portals
            </h2>
            <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
              Create and manage isolated school databases on the fly. Suspend, upgrade, or modify school portals in real-time. Changes apply instantly with no code changes needed.
            </p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="px-5 py-3 bg-indigo-650 hover:bg-indigo-500 active:scale-95 text-white font-bold text-sm rounded-xl shadow-xl shadow-indigo-600/10 transition-all flex items-center gap-2 border border-indigo-500/20 hover:shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" /> Onboard New School
          </button>
        </div>

        {/* Global Statistics */}
        <DashboardMetrics metrics={metrics} />

        {/* Tenants List */}
        <TenantTable 
          tenants={tenants} 
          loading={loading} 
          error={error}
          refreshData={refreshData}
          openEditModal={openEditModal}
          handleDeleteTenant={handleDeleteTenant}
        />

        {/* Live System Health & Audit logs */}
        <SystemHealthSidebar 
          systemHealth={systemHealth} 
          logs={logs} 
          fetchLogs={fetchLogs} 
        />
      </main>

      {/* 1. Onboarding Modal */}
      {showModal && (
        <OnboardTenantModal 
          onClose={() => setShowModal(false)}
          onSuccess={refreshData}
        />
      )}

      {/* 2. Editing Settings Modal */}
      {showEditModal && (
        <EditTenantModal 
          school={editSchool}
          onClose={() => setShowEditModal(false)}
          onSuccess={refreshData}
        />
      )}
    </div>
  );
};

export default SuperAdminDashboard;
