import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import {
  LayoutDashboard, Building2, CreditCard, Mail,
  Activity, ClipboardList, Settings, LogOut,
  Search, Bell, ChevronDown, X, Sun, Moon, Menu
} from 'lucide-react';
import logo from '../../../assets/logo.svg';

/* ── CSS ── */
import '../../../styles/superadmin.css';

/* ── View Components ── */
import DashboardView  from './components/DashboardView';
import SchoolsView    from './components/SchoolsView';
import BillingView    from './components/BillingView';
import InquiriesView  from './components/InquiriesView';
import HealthView     from './components/HealthView';
import AuditView      from './components/AuditView';
import SettingsView   from './components/SettingsView';

/* ── Modals ── */
import OnboardModal from './modals/OnboardModal';
import EditModal    from './modals/EditModal';

import { API } from '../../../config/api';

/**
 * SuperAdminDashboard — Main shell component
 * Handles: state management, data fetching, navigation, sidebar/topbar layout
 * All view logic is delegated to dedicated components in ./components/ and ./modals/
 */
const SuperAdminDashboard = () => {
  const { logout } = useAuth();

  /* ── State ── */
  const [view, setView]             = useState('dashboard');
  const [dark, setDark]             = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);
  const [tenants, setTenants]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [metrics, setMetrics]       = useState({ schools: 0, students: 0, staff: 0 });
  const [logs, setLogs]             = useState([]);
  const [systemHealth, setHealth]   = useState({ cpu: '—', memory: '—', uptime: '—', apiStatus: 'Healthy' });
  const [showOnboard, setOnboard]   = useState(false);
  const [editSchool, setEditSchool] = useState(null);
  const [profileOpen, setProfile]   = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [newInquiries, setNewInquiries]   = useState(0);
  const [sidebarOpen, setSidebarOpen]     = useState(false);

  /* ── Dark mode sync ── */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }, [dark]);

  /* ── Data fetchers ── */
  const fetchTenants = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API}/api/v1/tenants`);
      setTenants(res.data.data || []);
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to fetch tenants.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMetrics = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/v1/superadmin/metrics`);
      if (res.data.success) setMetrics(res.data.data);
    } catch {}
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/v1/superadmin/logs`);
      if (res.data.success) setLogs(res.data.data);
    } catch {}
  }, []);

  const fetchInquiries = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/v1/contacts`);
      const data = res.data.data || [];
      setNewInquiries(data.filter(c => c.status === 'new' || !c.status).length);
    } catch {}
  }, []);

  /* ── Initial load + health polling ── */
  useEffect(() => {
    fetchTenants();
    fetchMetrics();
    fetchLogs();
    fetchInquiries();

    const healthInterval = setInterval(() => {
      setHealth({
        cpu:       `${Math.floor(10 + Math.random() * 20)}%`,
        memory:    `${(4.4 + Math.random() * 0.6).toFixed(2)} GB / 8.00 GB`,
        uptime:    '1d 14h 22m',
        apiStatus: 'Healthy',
      });
    }, 4000);

    return () => clearInterval(healthInterval);
  }, [fetchTenants, fetchMetrics, fetchLogs, fetchInquiries]);

  const refreshData = () => {
    fetchTenants();
    fetchMetrics();
    fetchLogs();
    fetchInquiries();
  };

  /* ── Delete handler ── */
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?\n\nThis will permanently remove all data for this school. This cannot be undone.`)) return;
    try {
      await axios.delete(`${API}/api/v1/superadmin/tenants/${id}`);
      refreshData();
    } catch (e) {
      alert(e.response?.data?.error || 'Delete failed.');
    }
  };

  /* ── Cmd+K global search shortcut ── */
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('global-search')?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  /* ── Nav items ── */
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'schools',   icon: Building2,       label: 'Schools' },
    { id: 'billing',   icon: CreditCard,      label: 'Billing' },
    { id: 'inquiries', icon: Mail,            label: 'Inquiries', badge: newInquiries },
    { id: 'health',    icon: Activity,        label: 'System Health' },
    { id: 'audit',     icon: ClipboardList,   label: 'Audit Log' },
  ];

  return (
    <div className="admin-root" data-theme={dark ? 'dark' : 'light'}>

      {/* ── SIDEBAR ── */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid var(--sa-border)' }}>
          <img src={logo} alt="EduCore" style={{ height: 30 }} />
          <div style={{ fontSize: 9, color: 'var(--sa-text4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>
            Super Admin
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '8px 0', flex: 1 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--sa-text4)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '8px 20px 4px' }}>
            Platform
          </div>
          {navItems.map(({ id, icon: Icon, label, badge }) => (
            <button
              key={id}
              className={`nav-item ${view === id ? 'active' : ''}`}
              onClick={() => { setView(id); setSidebarOpen(false); }}
            >
              <Icon style={{ width: 14, height: 14 }} />
              <span style={{ flex: 1 }}>{label}</span>
              {badge > 0 && (
                <span style={{ background: 'var(--sa-amber)', color: '#fff', borderRadius: 10, fontSize: 9, padding: '1px 5px', fontWeight: 700, minWidth: 16, textAlign: 'center' }}>
                  {badge}
                </span>
              )}
            </button>
          ))}
          <div style={{ height: 1, background: 'var(--sa-border)', margin: '8px 16px' }} />
          <button
            className={`nav-item ${view === 'settings' ? 'active' : ''}`}
            onClick={() => { setView('settings'); setSidebarOpen(false); }}
          >
            <Settings style={{ width: 14, height: 14 }} /> Settings
          </button>
        </nav>

        {/* Sidebar footer */}
        <div style={{ padding: '10px 16px', borderTop: '1px solid var(--sa-border)' }}>
          <div style={{ fontSize: 10, color: 'var(--sa-text4)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--sa-green)' }} />
            <span className="mono">All systems operational</span>
          </div>
        </div>
      </aside>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)', zIndex: 49 }}
        />
      )}

      {/* ── TOPBAR ── */}
      <header className="admin-topbar">
        {/* Mobile menu button */}
        <button
          className="btn btn-icon mobile-menu-btn"
          onClick={() => setSidebarOpen(s => !s)}
          title="Toggle menu"
          style={{ marginRight: 8 }}
        >
          {sidebarOpen ? <X style={{ width: 14, height: 14 }} /> : <Menu style={{ width: 14, height: 14 }} />}
        </button>

        {/* Global search */}
        <div style={{ position: 'relative', flex: 1, maxWidth: 380 }}>
          <Search style={{ width: 13, height: 13, position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--sa-text4)' }} />
          <input
            id="global-search"
            className="admin-input"
            style={{ paddingLeft: 30, paddingRight: 60, fontSize: 12 }}
            placeholder="Search schools… (⌘K)"
            value={globalSearch}
            onChange={e => setGlobalSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
          />
          {globalSearch && (
            <kbd style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 9, color: 'var(--sa-text4)', background: 'var(--sa-bg2)', border: '1px solid var(--sa-border)', borderRadius: 3, padding: '1px 4px' }}>
              ESC
            </kbd>
          )}
          {/* Search dropdown */}
          {searchFocused && globalSearch && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, background: 'var(--sa-bg)', border: '1px solid var(--sa-border)', borderRadius: 6, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 100, maxHeight: 260, overflowY: 'auto' }}>
              {tenants.filter(t =>
                t.schoolName?.toLowerCase().includes(globalSearch.toLowerCase()) ||
                t.subdomain?.toLowerCase().includes(globalSearch.toLowerCase())
              ).slice(0, 8).map(t => (
                <div
                  key={t._id}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid var(--sa-border)', fontSize: 13 }}
                  onMouseDown={() => { setView('schools'); setGlobalSearch(''); }}
                >
                  <Building2 style={{ width: 13, height: 13, color: 'var(--sa-text4)' }} />
                  <span style={{ fontWeight: 500, color: 'var(--sa-text)' }}>{t.schoolName}</span>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--sa-text4)', marginLeft: 'auto' }}>{t.subdomain}.localhost</span>
                </div>
              ))}
              {tenants.filter(t =>
                t.schoolName?.toLowerCase().includes(globalSearch.toLowerCase()) ||
                t.subdomain?.toLowerCase().includes(globalSearch.toLowerCase())
              ).length === 0 && (
                <div style={{ padding: '12px 16px', fontSize: 12, color: 'var(--sa-text4)' }}>No schools match "{globalSearch}"</div>
              )}
            </div>
          )}
        </div>

        <div style={{ flex: 1 }} />

        {/* Dark mode toggle */}
        <button className="btn btn-icon" onClick={() => setDark(d => !d)} title="Toggle dark mode">
          {dark ? <Sun style={{ width: 15, height: 15 }} /> : <Moon style={{ width: 15, height: 15 }} />}
        </button>

        {/* Notifications bell */}
        <button className="btn btn-icon" style={{ position: 'relative' }} onClick={() => setView('inquiries')}>
          <Bell style={{ width: 15, height: 15 }} />
          {newInquiries > 0 && (
            <span style={{ position: 'absolute', top: 3, right: 3, width: 7, height: 7, background: 'var(--sa-red)', borderRadius: '50%', border: '1.5px solid var(--sa-bg)' }} />
          )}
        </button>

        {/* Profile dropdown */}
        <div style={{ position: 'relative' }}>
          <button className="btn" style={{ gap: 6, padding: '5px 10px' }} onClick={() => setProfile(p => !p)}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--sa-accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>SA</div>
            <span style={{ fontSize: 12, fontWeight: 500 }}>Super Admin</span>
            <ChevronDown style={{ width: 12, height: 12 }} />
          </button>

          {profileOpen && (
            <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 6, background: 'var(--sa-bg)', border: '1px solid var(--sa-border)', borderRadius: 8, minWidth: 180, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 100 }}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--sa-border)' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--sa-text)' }}>Super Admin</div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--sa-text4)' }}>admin@educore.app</div>
                <span className="badge badge-blue" style={{ fontSize: 9, marginTop: 4 }}>super_admin</span>
              </div>
              <button className="nav-item" style={{ width: '100%', margin: 0, borderRadius: 0, padding: '8px 14px' }} onClick={() => { setView('settings'); setProfile(false); }}>
                <Settings style={{ width: 13, height: 13 }} /> Settings
              </button>
              <button className="nav-item" style={{ width: '100%', margin: 0, borderRadius: 0, padding: '8px 14px', color: 'var(--sa-red)' }} onClick={logout}>
                <LogOut style={{ width: 13, height: 13 }} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="admin-main">
        <div className="admin-content">
          {view === 'dashboard' && (
            <DashboardView
              tenants={tenants}
              metrics={metrics}
              logs={logs}
              onOpenOnboard={() => setOnboard(true)}
              onNav={setView}
            />
          )}
          {view === 'schools' && (
            <SchoolsView
              tenants={tenants}
              loading={loading}
              error={error}
              refreshData={refreshData}
              onOpenOnboard={() => setOnboard(true)}
              onOpenEdit={s => setEditSchool(s)}
              onDelete={handleDelete}
            />
          )}
          {view === 'billing'    && <BillingView tenants={tenants} />}
          {view === 'inquiries'  && <InquiriesView />}
          {view === 'health'     && <HealthView systemHealth={systemHealth} logs={logs} fetchLogs={fetchLogs} onNav={setView} />}
          {view === 'audit'      && <AuditView logs={logs} fetchLogs={fetchLogs} />}
          {view === 'settings'   && <SettingsView logout={logout} />}
        </div>
      </main>

      {/* ── MODALS ── */}
      {showOnboard && <OnboardModal onClose={() => setOnboard(false)} onSuccess={refreshData} />}
      {editSchool   && <EditModal school={editSchool} onClose={() => setEditSchool(null)} onSuccess={refreshData} />}

      {/* Backdrop to dismiss profile dropdown */}
      {profileOpen && <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setProfile(false)} />}
    </div>
  );
};

export default SuperAdminDashboard;
