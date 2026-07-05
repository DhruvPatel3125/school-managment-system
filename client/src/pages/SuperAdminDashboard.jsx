import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  Users, 
  GraduationCap, 
  Shield, 
  LogOut, 
  Plus, 
  RefreshCw, 
  Activity,
  Sparkles
} from 'lucide-react';
import logo from '../assets/logo.svg';

import DashboardMetrics from './superadmin/components/DashboardMetrics';
import TenantTable from './superadmin/components/TenantTable';
import SystemHealthSidebar from './superadmin/components/SystemHealthSidebar';
import OnboardTenantModal from './superadmin/components/OnboardTenantModal';
import EditTenantModal from './superadmin/components/EditTenantModal';
import ContactInquiries from './superadmin/components/ContactInquiries';

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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500/30 selection:text-indigo-900">
      
      {/* Dynamic Background Glows */}
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed top-1/2 right-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none z-0"></div>

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 flex items-center justify-between px-6 shadow-sm">
        <div className="flex items-center space-x-3 ml-5">
          <img src={logo} alt="EduCore Logo" className="h-12" />
          <div>
    
          </div>
        </div>

        <div className="flex items-center space-x-4">
        
          <button 
            onClick={logout}
            className="px-3.5 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg active:scale-95 transition-all flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8 relative z-10">
        
        {/* Banner */}
        <div className="relative overflow-hidden bg-white border border-slate-200 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl shadow-slate-200/50">
          <div className="absolute top-0 right-0 w-[300px] h-full bg-gradient-to-l from-indigo-50 to-transparent pointer-events-none"></div>
          <div className="space-y-1.5 z-10">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-indigo-600 animate-pulse" /> Onboard School Portals
            </h2>
            <p className="text-slate-500 text-sm max-w-2xl leading-relaxed">
              Create and manage isolated school databases on the fly. Suspend, upgrade, or modify school portals in real-time. Changes apply instantly with no code changes needed.
            </p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 z-10"
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

        {/* Contact Inquiries */}
        <ContactInquiries />

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
