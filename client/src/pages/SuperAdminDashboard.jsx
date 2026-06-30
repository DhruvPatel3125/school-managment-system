import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, 
  Plus, 
  RefreshCw, 
  ExternalLink, 
  LogOut, 
  School,
  Upload,
  Loader2,
  CheckCircle,
  Database,
  Activity,
  Trash2,
  Settings,
  AlertTriangle,
  Users,
  GraduationCap,
  ChevronRight,
  ChevronLeft,
  KeyRound,
  LayoutGrid,
  Sparkles
} from 'lucide-react';

const SuperAdminDashboard = () => {
  const { logout, user } = useAuth();
  
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Platform Metrics State
  const [metrics, setMetrics] = useState({ schools: 0, students: 0, staff: 0 });

  // Audit Logs State
  const [logs, setLogs] = useState([]);

  // Live Health State
  const [systemHealth, setSystemHealth] = useState({
    cpu: '18%',
    memory: '4.82 GB / 8.00 GB',
    uptime: '1d 14h 22m',
    apiStatus: 'Healthy'
  });

  // Onboarding stepped modal navigation (1: Profile, 2: Plan, 3: Admin Creds)
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [schoolName, setSchoolName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#4f46e5'); 
  const [secondaryColor, setSecondaryColor] = useState('#06b6d4'); 
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [plan, setPlan] = useState('free_trial');
  const [maxStudents, setMaxStudents] = useState(10);

  // Editing stepped modal navigation (1: Profile, 2: Plan)
  const [showEditModal, setShowEditModal] = useState(false);
  const [editModalStep, setEditModalStep] = useState(1);
  const [editSchoolId, setEditSchoolId] = useState('');
  const [editSchoolName, setEditSchoolName] = useState('');
  const [editLogoUrl, setEditLogoUrl] = useState('');
  const [editPrimaryColor, setEditPrimaryColor] = useState('#4f46e5');
  const [editSecondaryColor, setEditSecondaryColor] = useState('#06b6d4');
  const [editStatus, setEditStatus] = useState('active');
  const [editPlan, setEditPlan] = useState('free_trial');
  const [editMaxStudents, setEditMaxStudents] = useState(10);

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  // Plans details configuration
  const plansConfig = [
    { id: 'free_trial', name: 'Free Trial', limit: 10, price: '$0', desc: 'Sandbox sandbox testing tier.' },
    { id: 'standard', name: 'Standard Plan', limit: 250, price: '$149', desc: 'Ideal for medium growth schools.' },
    { id: 'enterprise', name: 'Enterprise VIP', limit: 10000, price: '$499', desc: 'Full custom branding & scale.' }
  ];

  // Fetch tenants
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

  // Fetch metrics
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

  // Fetch logs
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

    // Live Resource Simulation
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

  const handlePlanChange = (selectedPlan, isEdit = false) => {
    let limit = 10;
    if (selectedPlan === 'standard') limit = 250;
    if (selectedPlan === 'enterprise') limit = 10000;
    
    if (isEdit) {
      setEditPlan(selectedPlan);
      setEditMaxStudents(limit);
    } else {
      setPlan(selectedPlan);
      setMaxStudents(limit);
    }
  };

  const handleLogoUpload = async (e, isEdit = false) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingLogo(true);
    setSubmitError('');
    setSubmitSuccess('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('http://localhost:5001/api/v1/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (isEdit) {
        setEditLogoUrl(res.data.url);
      } else {
        setLogoUrl(res.data.url);
      }
      setSubmitSuccess('School logo uploaded successfully!');
      setTimeout(() => setSubmitSuccess(''), 2500);
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Failed to upload logo.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleOnboard = async (e) => {
    e.preventDefault();
    if (modalStep < 3) {
      setModalStep(prev => prev + 1);
      return;
    }

    setSubmitError('');
    setSubmitSuccess('');
    setSubmitLoading(true);

    try {
      const payload = {
        schoolName,
        subdomain,
        logoUrl,
        primaryColor,
        secondaryColor,
        adminName,
        adminEmail,
        adminPassword,
        plan,
        maxStudents: Number(maxStudents)
      };

      await axios.post('http://localhost:5001/api/v1/superadmin/tenants', payload);
      
      setSubmitSuccess(`Successfully onboarded school '${schoolName}'!`);
      
      // Reset form fields
      setSchoolName('');
      setSubdomain('');
      setLogoUrl('');
      setPrimaryColor('#4f46e5');
      setSecondaryColor('#06b6d4');
      setAdminName('');
      setAdminEmail('');
      setAdminPassword('');
      setPlan('free_trial');
      setMaxStudents(10);
      setModalStep(1);

      // Refresh data
      fetchTenants();
      fetchMetrics();
      fetchLogs();

      // Close modal after delay
      setTimeout(() => {
        setShowModal(false);
        setSubmitSuccess('');
      }, 2000);
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Onboarding request failed.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const openEditModal = (school) => {
    setEditSchoolId(school._id || school.id);
    setEditSchoolName(school.schoolName);
    setEditLogoUrl(school.logoUrl || '');
    setEditPrimaryColor(school.primaryColor || '#4f46e5');
    setEditSecondaryColor(school.secondaryColor || '#06b6d4');
    setEditStatus(school.status || 'active');
    setEditPlan(school.plan || 'free_trial');
    setEditMaxStudents(school.maxStudents || 10);
    setEditModalStep(1);
    setSubmitError('');
    setSubmitSuccess('');
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (editModalStep < 2) {
      setEditModalStep(prev => prev + 1);
      return;
    }

    setSubmitError('');
    setSubmitSuccess('');
    setSubmitLoading(true);

    try {
      await axios.put(`http://localhost:5001/api/v1/superadmin/tenants/${editSchoolId}`, {
        schoolName: editSchoolName,
        logoUrl: editLogoUrl,
        primaryColor: editPrimaryColor,
        secondaryColor: editSecondaryColor,
        status: editStatus,
        plan: editPlan,
        maxStudents: Number(editMaxStudents)
      });

      setSubmitSuccess('School settings updated successfully!');
      fetchTenants();
      fetchMetrics();
      fetchLogs();

      setTimeout(() => {
        setShowEditModal(false);
        setSubmitSuccess('');
      }, 1500);
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Failed to save configurations.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteTenant = async (id, name) => {
    if (!window.confirm(`⚠️ WARNING: Are you absolutely sure you want to permanently delete school '${name}'?\n\nThis will cascade delete ALL students, teachers, classes, fees, and administrators associated with this school tenant. This action is irreversible!`)) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5001/api/v1/superadmin/tenants/${id}`);
      alert(`Permanently deleted school '${name}' and cleaned up database.`);
      fetchTenants();
      fetchMetrics();
      fetchLogs();
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
      <header className="sticky top-0 z-40 bg-slate-900/60 backdrop-blur-md border-b border-slate-800/80 h-16 flex items-center justify-between px-6 shadow-lg z-10">
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
            onClick={() => {
              setSubmitError('');
              setSubmitSuccess('');
              setModalStep(1);
              setShowModal(true);
            }}
            className="px-5 py-3 bg-indigo-650 hover:bg-indigo-500 active:scale-95 text-white font-bold text-sm rounded-xl shadow-xl shadow-indigo-600/10 transition-all flex items-center gap-2 border border-indigo-500/20 hover:shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" /> Onboard New School
          </button>
        </div>

        {/* Global Statistics */}
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

        {/* Tenants List */}
        <section className="bg-slate-900/30 backdrop-blur-md border border-slate-800/80 rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/40">
            <h3 className="text-md font-bold tracking-tight text-slate-200">Active School Portals Registry</h3>
            <button 
              onClick={() => {
                fetchTenants();
                fetchMetrics();
                fetchLogs();
              }} 
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
                          {school.plan || 'free_trial'}
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
                            onClick={() => window.open(`${window.location.protocol}//${window.location.hostname}:${window.location.port}/?tenant=${school.subdomain}`, "_blank")}
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

        {/* Live System Health & Audit logs (Grid Layout) */}
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
      </main>

      {/* 1. Onboarding Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto transition-all duration-300">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 my-8">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-black flex items-center gap-2">
                  <School className="w-5 h-5 text-indigo-400" /> Onboard School Tenant
                </h3>
                <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider mt-0.5">Multi-tenant automated registry setup</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white text-xl">×</button>
            </div>

            {/* Stepped progress indicators */}
            <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-850">
              <div className={`flex items-center space-x-1.5 text-xs font-bold ${modalStep === 1 ? 'text-indigo-400' : 'text-slate-500'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${modalStep === 1 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>1</span>
                <span>Profile</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-700" />
              <div className={`flex items-center space-x-1.5 text-xs font-bold ${modalStep === 2 ? 'text-indigo-400' : 'text-slate-500'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${modalStep === 2 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>2</span>
                <span>Subscription</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-700" />
              <div className={`flex items-center space-x-1.5 text-xs font-bold ${modalStep === 3 ? 'text-indigo-400' : 'text-slate-500'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${modalStep === 3 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>3</span>
                <span>Security Credentials</span>
              </div>
            </div>

            {submitError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-450 rounded-xl text-xs font-medium flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> {submitError}
              </div>
            )}
            
            {submitSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 rounded-xl text-xs font-medium">
                ✅ {submitSuccess}
              </div>
            )}

            <form onSubmit={handleOnboard} className="space-y-4">
              
              {/* STEP 1: School Profile & Colors */}
              {modalStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">School Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Greenwood High"
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-800 bg-slate-950 text-white placeholder-slate-700 text-xs focus:outline-none focus:border-indigo-600 transition-all font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Subdomain prefix</label>
                      <input 
                        type="text" 
                        placeholder="e.g. greenwood"
                        value={subdomain}
                        onChange={(e) => setSubdomain(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-800 bg-slate-950 text-white placeholder-slate-700 text-xs focus:outline-none focus:border-indigo-600 transition-all font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">School Logo Branding</label>
                    <div className="flex items-center space-x-4 bg-slate-950 border border-slate-800 p-3.5 rounded-xl">
                      {logoUrl ? (
                        <img src={logoUrl} alt="Logo preview" className="w-12 h-12 rounded-xl object-cover border border-slate-800 bg-slate-900 shadow-lg" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-800/50 flex items-center justify-center border border-slate-700/60 shadow-inner">
                          <School className="w-5 h-5 text-slate-500" />
                        </div>
                      )}
                      <div className="flex-1">
                        <label className="cursor-pointer inline-flex items-center px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs rounded-lg transition-all gap-1.5 shadow-md">
                          {uploadingLogo ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Uploading Image...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5" />
                              <span>Choose Local File</span>
                            </>
                          )}
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => handleLogoUpload(e, false)}
                            disabled={uploadingLogo}
                            className="hidden"
                          />
                        </label>
                        <p className="text-[9px] text-slate-550 mt-1.5 font-semibold">Supported formats: PNG, JPG, WEBP. Maximum 5MB.</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Primary Color Scheme</label>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="color" 
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="w-9 h-9 rounded-lg border border-slate-800 bg-transparent cursor-pointer shrink-0"
                        />
                        <input 
                          type="text" 
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-white text-xs focus:outline-none text-center font-mono font-bold"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Secondary Color Scheme</label>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="color" 
                          value={secondaryColor}
                          onChange={(e) => setSecondaryColor(e.target.value)}
                          className="w-9 h-9 rounded-lg border border-slate-800 bg-transparent cursor-pointer shrink-0"
                        />
                        <input 
                          type="text" 
                          value={secondaryColor}
                          onChange={(e) => setSecondaryColor(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-white text-xs focus:outline-none text-center font-mono font-bold"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Plan & Subscription cards */}
              {modalStep === 2 && (
                <div className="space-y-4">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Select SaaS Subscription Tier</label>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {plansConfig.map(p => (
                      <div 
                        key={p.id}
                        onClick={() => handlePlanChange(p.id, false)}
                        className={`p-4 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between gap-4 ${plan === p.id ? 'border-indigo-500 bg-indigo-950/20 shadow-md shadow-indigo-550/5' : 'border-slate-800/80 bg-slate-950/50 hover:bg-slate-900/50'}`}
                      >
                        <div className="space-y-1">
                          <h5 className="font-bold text-sm text-slate-200 flex items-center gap-1.5">
                            {p.name}
                            {plan === p.id && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>}
                          </h5>
                          <p className="text-[10px] text-slate-450 leading-relaxed font-medium">{p.desc}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-extrabold text-indigo-400 block">{p.limit} Pupils limit</span>
                          <span className="text-slate-500 font-bold text-[10px] block mt-0.5">{p.price} / monthly</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Custom Student Registration Cap</label>
                    <input 
                      type="number" 
                      value={maxStudents}
                      onChange={(e) => setMaxStudents(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-800 bg-slate-950 text-white text-xs focus:outline-none focus:border-indigo-600 transition-all font-semibold"
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: Admin Credentials */}
              {modalStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Administrator Full Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Principal Jane"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-800 bg-slate-950 text-white placeholder-slate-700 text-xs focus:outline-none focus:border-indigo-600 transition-all font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Administrator Email</label>
                      <input 
                        type="email" 
                        placeholder="admin@greenwood.com"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-800 bg-slate-950 text-white placeholder-slate-700 text-xs focus:outline-none focus:border-indigo-600 transition-all font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Secure Password</label>
                      <input 
                        type="password" 
                        placeholder="••••••••"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-800 bg-slate-950 text-white placeholder-slate-700 text-xs focus:outline-none focus:border-indigo-600 transition-all font-semibold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Footer Controls */}
              <div className="flex space-x-3 pt-4 border-t border-slate-800 mt-2">
                {modalStep > 1 && (
                  <button 
                    type="button"
                    onClick={() => setModalStep(prev => prev - 1)}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700 rounded-lg transition-all flex items-center gap-1.5"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Back
                  </button>
                )}
                
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700 rounded-lg transition-all"
                >
                  Cancel
                </button>
                
                <button 
                  type="submit"
                  disabled={submitLoading || uploadingLogo}
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  {submitLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : modalStep < 3 ? (
                    <>
                      <span>Next Step</span> <ChevronRight className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>Onboard & Create School</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 2. Editing Settings Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto transition-all duration-300">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 my-8">
            
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-black flex items-center gap-2">
                  <Settings className="w-5 h-5 text-indigo-500" /> Edit School Configurations
                </h3>
                <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider mt-0.5">Modify branding & subscription plans</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-white text-lg">×</button>
            </div>

            {/* Stepped progress indicators for Edit */}
            <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-850">
              <div className={`flex items-center space-x-1.5 text-xs font-bold ${editModalStep === 1 ? 'text-indigo-400' : 'text-slate-500'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${editModalStep === 1 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>1</span>
                <span>Profile & Branding</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-700" />
              <div className={`flex items-center space-x-1.5 text-xs font-bold ${editModalStep === 2 ? 'text-indigo-400' : 'text-slate-500'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${editModalStep === 2 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>2</span>
                <span>Plan & Access Status</span>
              </div>
            </div>

            {submitError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-450 rounded-xl text-xs font-medium flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> {submitError}
              </div>
            )}
            
            {submitSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 rounded-xl text-xs font-medium">
                ✅ {submitSuccess}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              
              {/* EDIT STEP 1: Name, Logo & Branding Colors */}
              {editModalStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">School Name</label>
                    <input 
                      type="text" 
                      value={editSchoolName}
                      onChange={(e) => setEditSchoolName(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-800 bg-slate-950 text-white text-xs focus:outline-none focus:border-indigo-650 transition-all font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">School Logo Branding</label>
                    <div className="flex items-center space-x-4 bg-slate-950 border border-slate-800 p-3.5 rounded-xl">
                      {editLogoUrl ? (
                        <img src={editLogoUrl} alt="Logo preview" className="w-12 h-12 rounded-xl object-cover border border-slate-800 bg-slate-900 shadow-lg" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-800/50 flex items-center justify-center border border-slate-700/60 shadow-inner">
                          <School className="w-5 h-5 text-slate-500" />
                        </div>
                      )}
                      <div className="flex-1">
                        <label className="cursor-pointer inline-flex items-center px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs rounded-lg transition-all gap-1.5 shadow-md">
                          {uploadingLogo ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Uploading Image...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5" />
                              <span>Choose Local File</span>
                            </>
                          )}
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => handleLogoUpload(e, true)}
                            disabled={uploadingLogo}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Primary Color Scheme</label>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="color" 
                          value={editPrimaryColor}
                          onChange={(e) => setEditPrimaryColor(e.target.value)}
                          className="w-9 h-9 rounded-lg border border-slate-800 bg-transparent cursor-pointer shrink-0"
                        />
                        <input 
                          type="text" 
                          value={editPrimaryColor}
                          onChange={(e) => setEditPrimaryColor(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-white text-xs focus:outline-none text-center font-mono font-bold"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Secondary Color Scheme</label>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="color" 
                          value={editSecondaryColor}
                          onChange={(e) => setEditSecondaryColor(e.target.value)}
                          className="w-9 h-9 rounded-lg border border-slate-800 bg-transparent cursor-pointer shrink-0"
                        />
                        <input 
                          type="text" 
                          value={editSecondaryColor}
                          onChange={(e) => setEditSecondaryColor(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-white text-xs focus:outline-none text-center font-mono font-bold"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* EDIT STEP 2: Plan & Portal Access Status */}
              {editModalStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Portal Access Control</label>
                    <select 
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-800 bg-slate-950 text-white text-xs focus:outline-none font-semibold focus:border-indigo-600 transition-all"
                    >
                      <option value="active">Active (Access Allowed)</option>
                      <option value="suspended">Suspended (Access Blocked)</option>
                    </select>
                  </div>

                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Modify Subscription Tier</label>
                  <div className="grid grid-cols-1 gap-3">
                    {plansConfig.map(p => (
                      <div 
                        key={p.id}
                        onClick={() => handlePlanChange(p.id, true)}
                        className={`p-4 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between gap-4 ${editPlan === p.id ? 'border-indigo-500 bg-indigo-950/20 shadow-md' : 'border-slate-800/80 bg-slate-950/50 hover:bg-slate-900/50'}`}
                      >
                        <div className="space-y-1">
                          <h5 className="font-bold text-sm text-slate-200 flex items-center gap-1.5">
                            {p.name}
                            {editPlan === p.id && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>}
                          </h5>
                          <p className="text-[10px] text-slate-450 leading-relaxed font-medium">{p.desc}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-extrabold text-indigo-400 block">{p.limit} Pupils limit</span>
                          <span className="text-slate-500 font-bold text-[10px] block mt-0.5">{p.price} / monthly</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Custom Student Registration Cap</label>
                    <input 
                      type="number" 
                      value={editMaxStudents}
                      onChange={(e) => setEditMaxStudents(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-800 bg-slate-950 text-white text-xs focus:outline-none focus:border-indigo-600 transition-all font-semibold"
                    />
                  </div>
                </div>
              )}

              {/* Edit Modal Footer Controls */}
              <div className="flex space-x-3 pt-4 border-t border-slate-800 mt-2">
                {editModalStep > 1 && (
                  <button 
                    type="button"
                    onClick={() => setEditModalStep(prev => prev - 1)}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700 rounded-lg transition-all flex items-center gap-1.5"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Back
                  </button>
                )}
                
                <button 
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700 rounded-lg transition-all"
                >
                  Cancel
                </button>
                
                <button 
                  type="submit"
                  disabled={submitLoading || uploadingLogo}
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  {submitLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : editModalStep < 2 ? (
                    <>
                      <span>Next Step</span> <ChevronRight className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <span>Save Configurations</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
