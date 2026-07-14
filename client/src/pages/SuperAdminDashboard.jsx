import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Building2, CreditCard, Mail,
  Activity, ClipboardList, Settings, LogOut,
  Plus, RefreshCw, Search, Bell, ChevronDown,
  ExternalLink, Pencil, Trash2,
  ChevronLeft, ChevronRight, Upload, Loader2,
  AlertTriangle, Check, X, Sun, Moon, Download,
  SortAsc, SortDesc, MessageSquare, Menu
} from 'lucide-react';
import logo from '../assets/logo.svg';

const API = 'http://localhost:5001';

/* ─── CSS variables injected once ─── */
const AdminStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

    :root {
      --bg:        #FFFFFF;
      --bg2:       #F7F8FA;
      --bg3:       #F0F2F5;
      --border:    #E4E7EC;
      --border2:   #D0D5DD;
      --text:      #101828;
      --text2:     #344054;
      --text3:     #667085;
      --text4:     #98A2B3;
      --accent:    #2563EB;
      --accent-h:  #1D4ED8;
      --accent-bg: #EFF6FF;
      --green:     #16A34A;
      --green-bg:  #F0FDF4;
      --green-b:   #BBF7D0;
      --amber:     #D97706;
      --amber-bg:  #FFFBEB;
      --amber-b:   #FDE68A;
      --red:       #DC2626;
      --red-bg:    #FEF2F2;
      --red-b:     #FECACA;
      --sidebar-w: 220px;
      --topbar-h:  52px;
    }

    [data-theme="dark"] {
      --bg:        #0D1117;
      --bg2:       #161B22;
      --bg3:       #21262D;
      --border:    #30363D;
      --border2:   #484F58;
      --text:      #E6EDF3;
      --text2:     #C9D1D9;
      --text3:     #8B949E;
      --text4:     #6E7681;
      --accent:    #3B82F6;
      --accent-h:  #2563EB;
      --accent-bg: #1D2D44;
      --green-bg:  #0D2818;
      --green-b:   #1A4731;
      --amber-bg:  #2D1B00;
      --amber-b:   #5C3800;
      --red-bg:    #2D0A0A;
      --red-b:     #5C1A1A;
    }

    * { box-sizing: border-box; }

    .admin-root {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: var(--bg2);
      color: var(--text);
      min-height: 100vh;
    }

    /* Sidebar */
    .admin-sidebar {
      position: fixed;
      top: 0; left: 0;
      width: var(--sidebar-w);
      height: 100vh;
      background: var(--bg);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      z-index: 40;
      overflow-y: auto;
    }

    .admin-topbar {
      position: fixed;
      top: 0;
      left: var(--sidebar-w);
      right: 0;
      height: var(--topbar-h);
      background: var(--bg);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      padding: 0 20px;
      gap: 12px;
      z-index: 39;
    }

    .admin-main {
      margin-left: var(--sidebar-w);
      padding-top: var(--topbar-h);
      min-height: 100vh;
    }

    .admin-content {
      padding: 24px;
      max-width: 1400px;
    }

    /* Nav links */
    .nav-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      margin: 1px 8px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      color: var(--text3);
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
      text-decoration: none;
      border: none;
      background: none;
      width: calc(100% - 16px);
      text-align: left;
    }
    .nav-item:hover { background: var(--bg2); color: var(--text2); }
    .nav-item.active { background: var(--accent-bg); color: var(--accent); font-weight: 600; }
    .nav-item svg { flex-shrink: 0; }

    /* Stat card */
    .stat-card {
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 16px;
    }
    .stat-label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--text3);
      margin-bottom: 6px;
    }
    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: var(--text);
      font-family: 'Inter', sans-serif;
      line-height: 1;
    }
    .stat-trend {
      font-size: 11px;
      font-weight: 500;
      margin-top: 4px;
      display: flex;
      align-items: center;
      gap: 3px;
    }

    /* Table */
    .admin-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .admin-table th {
      padding: 9px 14px;
      text-align: left;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--text3);
      background: var(--bg2);
      border-bottom: 1px solid var(--border);
      white-space: nowrap;
      cursor: pointer;
      user-select: none;
    }
    .admin-table th:hover { color: var(--text2); }
    .admin-table td { padding: 10px 14px; border-bottom: 1px solid var(--border); vertical-align: middle; }
    .admin-table tr:hover td { background: var(--bg2); }
    .admin-table tr:last-child td { border-bottom: none; }

    /* Monospace */
    .mono {
      font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
      font-size: 11.5px;
    }

    /* Status badge */
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.02em;
    }
    .badge-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
    .badge-green  { background: var(--green-bg);  color: var(--green);  border: 1px solid var(--green-b); }
    .badge-amber  { background: var(--amber-bg);  color: var(--amber);  border: 1px solid var(--amber-b); }
    .badge-red    { background: var(--red-bg);    color: var(--red);    border: 1px solid var(--red-b); }
    .badge-gray   { background: var(--bg3);       color: var(--text3);  border: 1px solid var(--border); }
    .badge-blue   { background: var(--accent-bg); color: var(--accent); border: 1px solid #BFDBFE; }

    /* Buttons */
    .btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 7px 14px;
      border-radius: 6px;
      font-size: 13px; font-weight: 500;
      border: 1px solid var(--border2);
      background: var(--bg);
      color: var(--text2);
      cursor: pointer;
      transition: all 0.15s;
      white-space: nowrap;
    }
    .btn:hover { background: var(--bg2); color: var(--text); }
    .btn-primary {
      background: var(--accent); color: #fff;
      border-color: var(--accent);
    }
    .btn-primary:hover { background: var(--accent-h); border-color: var(--accent-h); }
    .btn-danger {
      background: var(--red-bg); color: var(--red);
      border-color: var(--red-b);
    }
    .btn-danger:hover { background: var(--red); color: #fff; border-color: var(--red); }
    .btn-icon {
      padding: 5px; border-radius: 5px;
    }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn:active { transform: translateY(1px); }

    /* Input */
    .admin-input {
      background: var(--bg);
      border: 1px solid var(--border2);
      border-radius: 6px;
      padding: 7px 12px;
      font-size: 13px;
      color: var(--text);
      font-family: 'Inter', sans-serif;
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
      width: 100%;
    }
    .admin-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(37,99,235,0.12); }
    .admin-input::placeholder { color: var(--text4); }

    .admin-select {
      background: var(--bg);
      border: 1px solid var(--border2);
      border-radius: 6px;
      padding: 7px 30px 7px 12px;
      font-size: 13px;
      color: var(--text);
      font-family: 'Inter', sans-serif;
      outline: none;
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23667085' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 10px center;
    }
    .admin-select:focus { border-color: var(--accent); outline: none; }

    /* Divider */
    .divider { height: 1px; background: var(--border); }

    /* Section header */
    .section-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 16px;
    }
    .section-title {
      font-size: 15px; font-weight: 600; color: var(--text);
    }
    .section-sub {
      font-size: 12px; color: var(--text3); margin-top: 1px;
    }

    /* Card */
    .card {
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
    }
    .card-header {
      padding: 12px 16px;
      border-bottom: 1px solid var(--border);
      display: flex; align-items: center; justify-content: space-between;
    }
    .card-title { font-size: 13px; font-weight: 600; color: var(--text); }

    /* Pagination */
    .pagination {
      display: flex; align-items: center; gap: 4px;
    }
    .page-btn {
      padding: 4px 8px;
      border-radius: 5px;
      font-size: 12px;
      font-weight: 500;
      border: 1px solid var(--border);
      background: var(--bg);
      color: var(--text3);
      cursor: pointer;
      transition: all 0.15s;
    }
    .page-btn:hover { background: var(--bg2); color: var(--text); }
    .page-btn.active { background: var(--accent); color: #fff; border-color: var(--accent); }
    .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

    /* Modal */
    .modal-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.45);
      display: flex; align-items: center; justify-content: center;
      z-index: 60;
      padding: 20px;
    }
    .modal-box {
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 10px;
      width: 100%;
      max-width: 520px;
      max-height: 90vh;
      overflow-y: auto;
    }
    .modal-header {
      padding: 16px 20px;
      border-bottom: 1px solid var(--border);
      display: flex; align-items: center; justify-content: space-between;
    }
    .modal-title { font-size: 15px; font-weight: 600; color: var(--text); }
    .modal-body { padding: 20px; }
    .modal-footer {
      padding: 12px 20px;
      border-top: 1px solid var(--border);
      display: flex; gap: 8px; justify-content: flex-end;
    }

    /* Form */
    .form-label {
      display: block;
      font-size: 11px; font-weight: 600;
      text-transform: uppercase; letter-spacing: 0.05em;
      color: var(--text3);
      margin-bottom: 5px;
    }

    /* Step indicator */
    .stepper { display: flex; align-items: center; gap: 0; margin-bottom: 20px; }
    .step-item { display: flex; align-items: center; gap: 6px; }
    .step-num {
      width: 22px; height: 22px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700;
      border: 1.5px solid var(--border2);
      color: var(--text4);
      background: var(--bg2);
      flex-shrink: 0;
    }
    .step-num.active { border-color: var(--accent); color: var(--accent); background: var(--accent-bg); }
    .step-num.done  { border-color: var(--green); color: #fff; background: var(--green); }
    .step-label { font-size: 12px; font-weight: 500; color: var(--text3); }
    .step-label.active { color: var(--accent); font-weight: 600; }
    .step-label.done  { color: var(--green); }
    .step-line { flex: 1; height: 1px; background: var(--border); margin: 0 8px; min-width: 20px; }
    .step-line.done { background: var(--green); }

    /* Log entry */
    .log-row { display: flex; gap: 10px; padding: 5px 0; border-bottom: 1px solid var(--border); font-size: 12px; }
    .log-row:last-child { border-bottom: none; }

    /* Tooltip-ish hover actions */
    .row-actions { display: flex; gap: 4px; align-items: center; }

    /* Search highlight */
    mark { background: #FEF08A; color: inherit; border-radius: 2px; padding: 0 1px; }

    /* Scrollbar */
    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 4px; }

    /* Mobile Hamburger Menu Button */
    .mobile-menu-btn {
      display: none !important;
    }

    /* Responsive Grid Layouts */
    .layout-grid-dashboard {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 16px;
    }
    .layout-grid-settings {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 16px;
    }
    .layout-grid-2col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .layout-grid-form-2col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    /* Responsive: collapse sidebar below 768px */
    @media (max-width: 768px) {
      .mobile-menu-btn {
        display: inline-flex !important;
      }
      .admin-sidebar {
        transform: translateX(-100%);
        transition: transform 0.25s ease-in-out;
        z-index: 55;
      }
      .admin-sidebar.open {
        transform: translateX(0);
      }
      .admin-topbar {
        left: 0 !important;
        padding: 0 12px !important;
      }
      .admin-main {
        margin-left: 0 !important;
      }
      .admin-content {
        padding: 16px !important;
      }
      
      /* Grid Stacking for layouts on mobile */
      .layout-grid-dashboard,
      .layout-grid-settings,
      .layout-grid-2col,
      .layout-grid-form-2col {
        grid-template-columns: 1fr !important;
      }

      /* Stack section header buttons and titles on mobile */
      .section-header {
        flex-direction: column !important;
        align-items: flex-start !important;
        gap: 10px !important;
      }
      .section-header > div:last-child {
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .section-header button {
        flex: 1;
        justify-content: center;
      }
    }

    /* Health metrics */
    .health-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid var(--border);
      font-size: 12px;
    }
    .health-row:last-child { border-bottom: none; }
    .health-key { color: var(--text3); }
    .health-val { font-family: 'JetBrains Mono', monospace; font-size: 11.5px; font-weight: 500; color: var(--text); }

    /* Inline activity feed */
    .activity-item {
      display: flex; gap: 10px; align-items: flex-start;
      padding: 7px 0;
      border-bottom: 1px solid var(--border);
      font-size: 12px;
    }
    .activity-item:last-child { border-bottom: none; }

    /* Empty state */
    .empty-state {
      text-align: center;
      padding: 48px 24px;
      color: var(--text3);
    }
    .empty-state svg { margin: 0 auto 12px; opacity: 0.3; }
    .empty-icon { margin-bottom: 12px; color: var(--text4); display: flex; justify-content: center; }
  `}</style>
);

/* ─── helpers ─── */
const planPrice = { starter: 1999, professional: 4499, enterprise: 0 };
const planConfig = [
  { id: 'starter', name: 'Starter', limit: 200, price: '₹1,999/mo', desc: 'Small schools, up to 200 students.' },
  { id: 'professional', name: 'Professional', limit: 1000, price: '₹4,499/mo', desc: 'Growing institutions, up to 1,000 students.' },
  { id: 'enterprise', name: 'Enterprise', limit: 10000, price: 'Custom', desc: 'Large chains & districts. Contact sales.' },
];
const fmt = (n) => n?.toLocaleString('en-IN') ?? '—';
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtTime = (d) => d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) : '—';

/* ─── Status badge ─── */
const StatusBadge = ({ status }) => {
  const map = {
    active:      { cls: 'badge-green', dot: '#16A34A', label: 'Active' },
    suspended:   { cls: 'badge-red',   dot: '#DC2626', label: 'Suspended' },
    trial:       { cls: 'badge-amber', dot: '#D97706', label: 'Trial' },
    new:         { cls: 'badge-amber', dot: '#D97706', label: 'New' },
    contacted:   { cls: 'badge-blue',  dot: '#2563EB', label: 'Contacted' },
    closed:      { cls: 'badge-gray',  dot: '#6B7280', label: 'Closed' },
    healthy:     { cls: 'badge-green', dot: '#16A34A', label: 'Healthy' },
    degraded:    { cls: 'badge-amber', dot: '#D97706', label: 'Degraded' },
    down:        { cls: 'badge-red',   dot: '#DC2626', label: 'Down' },
  };
  const s = map[status?.toLowerCase()] || map.active;
  return (
    <span className={`badge ${s.cls}`}>
      <span className="badge-dot" style={{ background: s.dot }} />
      {s.label}
    </span>
  );
};

/* ─── Plan badge ─── */
const PlanBadge = ({ plan }) => {
  const map = {
    starter: 'badge-gray',
    professional: 'badge-blue',
    enterprise: 'badge-amber',
  };
  return (
    <span className={`badge ${map[plan] || 'badge-gray'}`} style={{ textTransform: 'capitalize' }}>
      {plan || 'Starter'}
    </span>
  );
};

/* ─── Stepper ─── */
const Stepper = ({ steps, current }) => (
  <div className="stepper">
    {steps.map((s, i) => (
      <React.Fragment key={s}>
        <div className="step-item">
          <div className={`step-num ${i + 1 < current ? 'done' : i + 1 === current ? 'active' : ''}`}>
            {i + 1 < current ? <Check style={{ width: 11, height: 11 }} /> : i + 1}
          </div>
          <span className={`step-label ${i + 1 < current ? 'done' : i + 1 === current ? 'active' : ''}`}>{s}</span>
        </div>
        {i < steps.length - 1 && <div className={`step-line ${i + 1 < current ? 'done' : ''}`} />}
      </React.Fragment>
    ))}
  </div>
);

/* ─────────────────────────────────────────────
   ONBOARD MODAL
───────────────────────────────────────────── */
const OnboardModal = ({ onClose, onSuccess }) => {
  const [step, setStep]           = useState(1);
  const [schoolName, setSchoolName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [logoUrl, setLogoUrl]     = useState('');
  const [primaryColor, setPrimary]   = useState('#2563EB');
  const [secondaryColor, setSecondary] = useState('#16A34A');
  const [plan, setPlan]           = useState('starter');
  const [maxStudents, setMax]     = useState(200);
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPass] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [err, setErr]             = useState('');
  const [ok, setOk]               = useState('');

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true); setErr('');
    const fd = new FormData(); fd.append('file', file);
    try {
      const res = await axios.post(`${API}/api/v1/upload`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setLogoUrl(res.data.url); setOk('Logo uploaded.');
      setTimeout(() => setOk(''), 2000);
    } catch (e) { setErr(e.response?.data?.error || 'Upload failed.'); }
    finally { setUploading(false); }
  };

  const handlePlan = (p) => {
    setPlan(p);
    setMax(p === 'professional' ? 1000 : p === 'enterprise' ? 10000 : 200);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < 3) { setStep(s => s + 1); return; }
    setErr(''); setLoading(true);
    try {
      if (plan === 'enterprise') { setErr('Enterprise plans require custom setup. Contact sales.'); setLoading(false); return; }
      const vRes = await axios.post(`${API}/api/v1/superadmin/tenants/validate`,
        { schoolName, subdomain, adminName, adminEmail, adminPassword }, { withCredentials: true });
      const orderRes = await axios.post(`${API}/api/v1/payments/create-razorpay-order`, { plan }, { withCredentials: true });
      const { order_id, amount, currency } = orderRes.data.data;
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        amount, currency, name: 'EduCore', order_id,
        description: `${plan} Subscription`,
        handler: async (resp) => {
          try {
            await axios.post(`${API}/api/v1/superadmin/tenants`, {
              schoolName, subdomain, logoUrl, primaryColor, secondaryColor,
              adminName, adminEmail, adminPassword, plan, maxStudents: Number(maxStudents),
              razorpay_order_id: resp.razorpay_order_id,
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_signature: resp.razorpay_signature,
            }, { withCredentials: true });
            setOk(`School '${schoolName}' onboarded successfully!`);
            if (onSuccess) onSuccess();
            setTimeout(onClose, 1800);
          } catch (e) { setErr(e.response?.data?.error || 'Tenant creation failed.'); }
          finally { setLoading(false); }
        },
        prefill: { name: adminName, email: adminEmail },
        modal: { ondismiss: () => { setErr('Payment cancelled.'); setLoading(false); } },
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (r) => { setErr(`Payment failed: ${r.error.description}`); setLoading(false); });
      rzp.open();
    } catch (e) { setErr(e.response?.data?.error || 'Failed to initiate payment.'); setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <div>
            <div className="modal-title">Onboard School Tenant</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>Multi-tenant registry setup</div>
          </div>
          <button className="btn btn-icon" onClick={onClose}><X style={{ width: 16, height: 16 }} /></button>
        </div>
        <div className="modal-body">
          <Stepper steps={['Profile', 'Subscription', 'Admin Access']} current={step} />

          {err && <div style={{ background: 'var(--red-bg)', border: '1px solid var(--red-b)', color: 'var(--red)', borderRadius: 6, padding: '8px 12px', fontSize: 12, marginBottom: 14, display: 'flex', gap: 8, alignItems: 'center' }}><AlertTriangle style={{ width: 14, height: 14, flexShrink: 0 }} />{err}</div>}
          {ok  && <div style={{ background: 'var(--green-bg)', border: '1px solid var(--green-b)', color: 'var(--green)', borderRadius: 6, padding: '8px 12px', fontSize: 12, marginBottom: 14 }}>{ok}</div>}

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="layout-grid-form-2col">
                  <div>
                    <label className="form-label">School Name</label>
                    <input className="admin-input" value={schoolName} onChange={e => setSchoolName(e.target.value)} placeholder="Greenwood High School" required />
                  </div>
                  <div>
                    <label className="form-label">Subdomain Prefix</label>
                    <input className="admin-input mono" value={subdomain} onChange={e => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} placeholder="greenwood" required />
                    {subdomain && <div style={{ fontSize: 10, color: 'var(--text4)', marginTop: 3 }} className="mono">{subdomain}.educore.app</div>}
                  </div>
                </div>
                <div>
                  <label className="form-label">School Logo</label>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 12px' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 6, background: 'var(--bg3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                      {logoUrl ? <img src={logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Building2 style={{ width: 18, height: 18, color: 'var(--text4)' }} />}
                    </div>
                    <label className="btn" style={{ cursor: 'pointer', margin: 0 }}>
                      {uploading ? <><Loader2 style={{ width: 13, height: 13, animation: 'spin 1s linear infinite' }} /> Uploading…</> : <><Upload style={{ width: 13, height: 13 }} /> Upload Logo</>}
                      <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} style={{ display: 'none' }} />
                    </label>
                    <span style={{ fontSize: 11, color: 'var(--text4)' }}>PNG, JPG up to 5MB</span>
                  </div>
                </div>
                <div className="layout-grid-form-2col">
                  {[['Primary Color', primaryColor, setPrimary], ['Secondary Color', secondaryColor, setSecondary]].map(([label, val, set]) => (
                    <div key={label}>
                      <label className="form-label">{label}</label>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <input type="color" value={val} onChange={e => set(e.target.value)} style={{ width: 34, height: 34, borderRadius: 5, border: '1px solid var(--border2)', cursor: 'pointer', padding: 2, flexShrink: 0 }} />
                        <input className="admin-input mono" value={val} onChange={e => set(e.target.value)} style={{ textAlign: 'center' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <label className="form-label">Subscription Plan</label>
                {planConfig.map(p => (
                  <div key={p.id} onClick={() => handlePlan(p.id)} style={{ padding: '12px 14px', border: `1.5px solid ${plan === p.id ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 7, cursor: 'pointer', background: plan === p.id ? 'var(--accent-bg)' : 'var(--bg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.15s' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: plan === p.id ? 'var(--accent)' : 'var(--text)' }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{p.desc}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: plan === p.id ? 'var(--accent)' : 'var(--text2)' }}>{p.price}</div>
                      <div className="mono" style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{fmt(p.limit)} students</div>
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: 4 }}>
                  <label className="form-label">Student Cap Override</label>
                  <input className="admin-input mono" type="number" value={maxStudents} onChange={e => setMax(e.target.value)} required />
                </div>
              </div>
            )}

            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="form-label">Administrator Full Name</label>
                  <input className="admin-input" value={adminName} onChange={e => setAdminName(e.target.value)} placeholder="Principal Jane Doe" required />
                </div>
                <div className="layout-grid-form-2col">
                  <div>
                    <label className="form-label">Admin Email</label>
                    <input className="admin-input mono" type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} placeholder="admin@school.com" required />
                  </div>
                  <div>
                    <label className="form-label">Admin Password</label>
                    <input className="admin-input" type="password" value={adminPassword} onChange={e => setAdminPass(e.target.value)} placeholder="Min. 8 characters" required />
                  </div>
                </div>
              </div>
            )}

            <div className="modal-footer" style={{ padding: '14px 0 0', marginTop: 20, borderTop: '1px solid var(--border)' }}>
              {step > 1 && <button type="button" className="btn" onClick={() => setStep(s => s - 1)}><ChevronLeft style={{ width: 14, height: 14 }} />Back</button>}
              <button type="button" className="btn" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading || uploading}>
                {loading ? <Loader2 style={{ width: 13, height: 13, animation: 'spin 1s linear infinite' }} /> : null}
                {step < 3 ? <>Next <ChevronRight style={{ width: 14, height: 14 }} /></> : 'Create & Pay'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   EDIT MODAL
───────────────────────────────────────────── */
const EditModal = ({ school, onClose, onSuccess }) => {
  const [step, setStep]           = useState(1);
  const [name, setName]           = useState(school?.schoolName || '');
  const [logoUrl, setLogoUrl]     = useState(school?.logoUrl || '');
  const [primary, setPrimary]     = useState(school?.primaryColor || '#2563EB');
  const [secondary, setSecondary] = useState(school?.secondaryColor || '#16A34A');
  const [status, setStatus]       = useState(school?.status || 'active');
  const [plan, setPlan]           = useState(school?.plan || 'starter');
  const [maxStudents, setMax]     = useState(school?.maxStudents || 200);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [err, setErr]             = useState('');
  const [ok, setOk]               = useState('');

  const handleUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true); setErr('');
    const fd = new FormData(); fd.append('file', file);
    try {
      const res = await axios.post(`${API}/api/v1/upload`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setLogoUrl(res.data.url); setOk('Logo updated.'); setTimeout(() => setOk(''), 2000);
    } catch (e) { setErr(e.response?.data?.error || 'Upload failed.'); }
    finally { setUploading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < 2) { setStep(2); return; }
    setErr(''); setLoading(true);
    try {
      await axios.put(`${API}/api/v1/superadmin/tenants/${school._id || school.id}`, {
        schoolName: name, logoUrl, primaryColor: primary, secondaryColor: secondary,
        status, plan, maxStudents: Number(maxStudents),
      });
      setOk('Saved successfully.');
      if (onSuccess) onSuccess();
      setTimeout(onClose, 1500);
    } catch (e) { setErr(e.response?.data?.error || 'Save failed.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <div className="modal-title">Edit School — {school?.schoolName}</div>
          <button className="btn btn-icon" onClick={onClose}><X style={{ width: 16, height: 16 }} /></button>
        </div>
        <div className="modal-body">
          <Stepper steps={['Profile & Branding', 'Plan & Status']} current={step} />

          {err && <div style={{ background: 'var(--red-bg)', border: '1px solid var(--red-b)', color: 'var(--red)', borderRadius: 6, padding: '8px 12px', fontSize: 12, marginBottom: 14, display: 'flex', gap: 8, alignItems: 'center' }}><AlertTriangle style={{ width: 14, height: 14 }} />{err}</div>}
          {ok  && <div style={{ background: 'var(--green-bg)', border: '1px solid var(--green-b)', color: 'var(--green)', borderRadius: 6, padding: '8px 12px', fontSize: 12, marginBottom: 14 }}>{ok}</div>}

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="form-label">School Name</label>
                  <input className="admin-input" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div>
                  <label className="form-label">Logo</label>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 12px' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 6, background: 'var(--bg3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                      {logoUrl ? <img src={logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Building2 style={{ width: 18, height: 18, color: 'var(--text4)' }} />}
                    </div>
                    <label className="btn" style={{ cursor: 'pointer', margin: 0 }}>
                      {uploading ? <><Loader2 style={{ width: 13, height: 13, animation: 'spin 1s linear infinite' }} />Uploading…</> : <><Upload style={{ width: 13, height: 13 }} />Change Logo</>}
                      <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} style={{ display: 'none' }} />
                    </label>
                  </div>
                </div>
                <div className="layout-grid-form-2col">
                  {[['Primary Color', primary, setPrimary], ['Secondary Color', secondary, setSecondary]].map(([label, val, set]) => (
                    <div key={label}>
                      <label className="form-label">{label}</label>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <input type="color" value={val} onChange={e => set(e.target.value)} style={{ width: 34, height: 34, borderRadius: 5, border: '1px solid var(--border2)', cursor: 'pointer', padding: 2, flexShrink: 0 }} />
                        <input className="admin-input mono" value={val} onChange={e => set(e.target.value)} style={{ textAlign: 'center' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="form-label">Portal Status</label>
                  <select className="admin-select" value={status} onChange={e => setStatus(e.target.value)} style={{ width: '100%' }}>
                    <option value="active">Active — Access Allowed</option>
                    <option value="suspended">Suspended — Access Blocked</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Subscription Plan</label>
                  {planConfig.map(p => (
                    <div key={p.id} onClick={() => { setPlan(p.id); setMax(p.id === 'professional' ? 1000 : p.id === 'enterprise' ? 10000 : 200); }} style={{ padding: '10px 14px', border: `1.5px solid ${plan === p.id ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 7, cursor: 'pointer', background: plan === p.id ? 'var(--accent-bg)' : 'var(--bg)', display: 'flex', justifyContent: 'space-between', marginBottom: 8, transition: 'all 0.15s' }}>
                      <div style={{ fontWeight: plan === p.id ? 600 : 400, fontSize: 13, color: plan === p.id ? 'var(--accent)' : 'var(--text)' }}>{p.name}</div>
                      <div className="mono" style={{ fontSize: 12, color: plan === p.id ? 'var(--accent)' : 'var(--text3)' }}>{p.price}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <label className="form-label">Student Cap</label>
                  <input className="admin-input mono" type="number" value={maxStudents} onChange={e => setMax(e.target.value)} required />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 14, marginTop: 16, borderTop: '1px solid var(--border)' }}>
              {step > 1 && <button type="button" className="btn" onClick={() => setStep(1)}><ChevronLeft style={{ width: 14, height: 14 }} />Back</button>}
              <button type="button" className="btn" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading || uploading}>
                {loading ? <Loader2 style={{ width: 13, height: 13, animation: 'spin 1s linear infinite' }} /> : null}
                {step < 2 ? <>Next<ChevronRight style={{ width: 14, height: 14 }} /></> : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   VIEW: DASHBOARD
───────────────────────────────────────────── */
const DashboardView = ({ tenants, metrics, logs, onOpenOnboard, onNav }) => {
  const mrr = tenants.reduce((acc, t) => acc + (planPrice[t.plan] || 0), 0);
  const active = tenants.filter(t => t.status !== 'suspended').length;
  const stats = [
    { label: 'Registered Schools', value: fmt(metrics.schools), trend: null },
    { label: 'Total Students', value: fmt(metrics.students), trend: null },
    { label: 'Estimated MRR', value: `₹${fmt(mrr)}`, trend: null },
    { label: 'Active Portals', value: fmt(active), trend: null },
    { label: 'Platform Uptime', value: '99.9%', valueClass: 'mono', color: 'var(--green)' },
    { label: 'Staff Members', value: fmt(metrics.staff), trend: null },
  ];
  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">Dashboard</div>
          <div className="section-sub">Platform overview</div>
        </div>
        <button className="btn btn-primary" onClick={onOpenOnboard}>
          <Plus style={{ width: 14, height: 14 }} /> Onboard School
        </button>
      </div>

      {/* Stat strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
        {stats.map(({ label, value, valueClass, color }) => (
          <div className="stat-card" key={label}>
            <div className="stat-label">{label}</div>
            <div className={`stat-value ${valueClass || ''}`} style={color ? { color } : {}}>{value}</div>
          </div>
        ))}
      </div>

      <div className="layout-grid-dashboard">
        {/* Recent activity */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Activity</span>
            <button className="btn btn-icon" style={{ fontSize: 11, padding: '3px 8px' }} onClick={() => onNav('audit')}>View all →</button>
          </div>
          <div style={{ padding: '0 0 4px' }}>
            {logs.length === 0
              ? <div className="empty-state" style={{ padding: 32 }}><ClipboardList style={{ width: 28, height: 28 }} /><div style={{ marginTop: 8, fontSize: 12 }}>No activity logged yet.</div></div>
              : logs.slice(0, 10).map((log, i) => (
                <div className="activity-item" key={i} style={{ padding: '8px 16px' }}>
                  <div style={{ flexShrink: 0, marginTop: 2 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', marginTop: 3 }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontWeight: 600, fontSize: 12, color: 'var(--text)' }}>{log.action}</span>
                    <span style={{ fontSize: 12, color: 'var(--text3)', marginLeft: 6 }}>{log.details}</span>
                  </div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--text4)', flexShrink: 0 }}>{fmtTime(log.createdAt)}</div>
                </div>
              ))
            }
          </div>
        </div>

        {/* Quick actions + plan breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="card">
            <div className="card-header"><span className="card-title">Quick Actions</span></div>
            <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { label: 'Onboard New School', icon: Plus, action: onOpenOnboard },
                { label: 'View Inquiries', icon: Mail, action: () => onNav('inquiries') },
                { label: 'System Health', icon: Activity, action: () => onNav('health') },
                { label: 'Audit Log', icon: ClipboardList, action: () => onNav('audit') },
              ].map(({ label, icon: Icon, action }) => (
                <button key={label} className="btn" style={{ justifyContent: 'flex-start', width: '100%' }} onClick={action}>
                  <Icon style={{ width: 13, height: 13 }} /> {label}
                </button>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-header"><span className="card-title">Plan Distribution</span></div>
            <div style={{ padding: 12 }}>
              {['starter', 'professional', 'enterprise'].map(p => {
                const count = tenants.filter(t => t.plan === p).length;
                const pct = tenants.length ? Math.round((count / tenants.length) * 100) : 0;
                return (
                  <div key={p} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <span style={{ textTransform: 'capitalize', fontWeight: 500, color: 'var(--text2)' }}>{p}</span>
                      <span className="mono" style={{ fontSize: 11, color: 'var(--text3)' }}>{count} · {pct}%</span>
                    </div>
                    <div style={{ height: 4, background: 'var(--bg3)', borderRadius: 2 }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: p === 'enterprise' ? 'var(--amber)' : p === 'professional' ? 'var(--accent)' : 'var(--text4)', borderRadius: 2, transition: 'width 0.4s' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   VIEW: SCHOOLS
───────────────────────────────────────────── */
const SchoolsView = ({ tenants, loading, error, refreshData, onOpenOnboard, onOpenEdit, onDelete }) => {
  const [search, setSearch]         = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortCol, setSortCol]       = useState('schoolName');
  const [sortDir, setSortDir]       = useState('asc');
  const [page, setPage]             = useState(1);
  const [perPage, setPerPage]       = useState(25);
  const [selected, setSelected]     = useState(new Set());

  const launchPortal = (sub) => {
    const { protocol, hostname, port } = window.location;
    window.open(`${protocol}//${sub}.${hostname}:${port}`, '_blank');
  };

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
    setPage(1);
  };

  const SortIcon = ({ col }) => {
    if (sortCol !== col) return <SortAsc style={{ width: 10, height: 10, opacity: 0.3 }} />;
    return sortDir === 'asc' ? <SortAsc style={{ width: 10, height: 10 }} /> : <SortDesc style={{ width: 10, height: 10 }} />;
  };

  const filtered = tenants
    .filter(t => {
      const q = search.toLowerCase();
      if (q && !t.schoolName?.toLowerCase().includes(q) && !t.subdomain?.toLowerCase().includes(q)) return false;
      if (planFilter !== 'all' && t.plan !== planFilter) return false;
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      return true;
    })
    .sort((a, b) => {
      const av = a[sortCol] ?? '';
      const bv = b[sortCol] ?? '';
      return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const pageData = filtered.slice((page - 1) * perPage, page * perPage);

  const toggleSelect = (id) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () => setSelected(selected.size === pageData.length ? new Set() : new Set(pageData.map(t => t._id || t.id)));

  const exportCSV = () => {
    const rows = [['School Name', 'Subdomain', 'Plan', 'Status', 'Students', 'Joined']];
    filtered.forEach(t => rows.push([t.schoolName, t.subdomain, t.plan, t.status, t.maxStudents, fmtDate(t.createdAt)]));
    const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'schools.csv'; a.click();
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">Schools</div>
          <div className="section-sub">{total} tenant{total !== 1 ? 's' : ''} {search || planFilter !== 'all' || statusFilter !== 'all' ? '(filtered)' : 'total'}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={exportCSV}><Download style={{ width: 13, height: 13 }} />Export CSV</button>
          <button className="btn" onClick={refreshData}><RefreshCw style={{ width: 13, height: 13 }} />Refresh</button>
          <button className="btn btn-primary" onClick={onOpenOnboard}><Plus style={{ width: 14, height: 14 }} />Onboard School</button>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: 200 }}>
          <Search style={{ width: 13, height: 13, position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text4)' }} />
          <input className="admin-input" style={{ paddingLeft: 30 }} placeholder="Search by name or domain…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="admin-select" value={planFilter} onChange={e => { setPlanFilter(e.target.value); setPage(1); }}>
          <option value="all">All Plans</option>
          <option value="starter">Starter</option>
          <option value="professional">Professional</option>
          <option value="enterprise">Enterprise</option>
        </select>
        <select className="admin-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
        <select className="admin-select" value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}>
          <option value={25}>25 / page</option>
          <option value={50}>50 / page</option>
          <option value={100}>100 / page</option>
        </select>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div style={{ background: 'var(--accent-bg)', border: '1px solid #BFDBFE', borderRadius: 6, padding: '8px 14px', marginBottom: 10, display: 'flex', gap: 10, alignItems: 'center', fontSize: 12 }}>
          <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{selected.size} selected</span>
          <button className="btn" style={{ padding: '3px 10px', fontSize: 11 }} onClick={() => setSelected(new Set())}>Clear</button>
        </div>
      )}

      {/* Table */}
      <div className="card">
        {loading ? (
          <div className="empty-state"><Loader2 style={{ width: 24, height: 24, animation: 'spin 1s linear infinite', opacity: 0.5 }} /></div>
        ) : error ? (
          <div className="empty-state" style={{ color: 'var(--red)' }}><AlertTriangle style={{ width: 24, height: 24 }} /><div style={{ marginTop: 8 }}>{error}</div></div>
        ) : pageData.length === 0 ? (
          <div className="empty-state"><Building2 style={{ width: 28, height: 28 }} /><div style={{ marginTop: 8 }}>No schools match your filters.</div></div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 36 }}><input type="checkbox" checked={selected.size === pageData.length && pageData.length > 0} onChange={toggleAll} /></th>
                  <th onClick={() => handleSort('schoolName')}>School <SortIcon col="schoolName" /></th>
                  <th onClick={() => handleSort('subdomain')}>Domain <SortIcon col="subdomain" /></th>
                  <th onClick={() => handleSort('plan')}>Plan <SortIcon col="plan" /></th>
                  <th onClick={() => handleSort('status')}>Status <SortIcon col="status" /></th>
                  <th onClick={() => handleSort('maxStudents')}>Cap <SortIcon col="maxStudents" /></th>
                  <th onClick={() => handleSort('createdAt')}>Joined <SortIcon col="createdAt" /></th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageData.map(school => {
                  const id = school._id || school.id;
                  return (
                    <tr key={id}>
                      <td><input type="checkbox" checked={selected.has(id)} onChange={() => toggleSelect(id)} /></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 5, border: '1px solid var(--border)', overflow: 'hidden', flexShrink: 0, background: 'var(--bg2)' }}>
                            <img src={school.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(school.schoolName)}&background=2563EB&color=fff&size=28&bold=true&format=svg`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(school.schoolName)}&background=2563EB&color=fff&size=28&bold=true&format=svg`; }} />
                          </div>
                          <span style={{ fontWeight: 500, color: 'var(--text)', fontSize: 13 }}>{school.schoolName}</span>
                        </div>
                      </td>
                      <td><a href={`${window.location.protocol}//${school.subdomain}.${window.location.hostname}:${window.location.port}`} target="_blank" rel="noreferrer" className="mono" style={{ color: 'var(--accent)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>{school.subdomain}.localhost <ExternalLink style={{ width: 10, height: 10, opacity: 0.6 }} /></a></td>
                      <td><PlanBadge plan={school.plan} /></td>
                      <td><StatusBadge status={school.status || 'active'} /></td>
                      <td><span className="mono" style={{ fontSize: 12, color: 'var(--text3)' }}>{fmt(school.maxStudents)}</span></td>
                      <td><span className="mono" style={{ fontSize: 11, color: 'var(--text3)' }}>{fmtDate(school.createdAt)}</span></td>
                      <td>
                        <div className="row-actions" style={{ justifyContent: 'flex-end' }}>
                          <button className="btn btn-icon" title="Launch Portal" onClick={() => launchPortal(school.subdomain)}><ExternalLink style={{ width: 13, height: 13 }} /></button>
                          <button className="btn btn-icon" title="Edit" onClick={() => onOpenEdit(school)}><Pencil style={{ width: 13, height: 13 }} /></button>
                          <button className="btn btn-icon btn-danger" title="Delete" onClick={() => onDelete(id, school.schoolName)}><Trash2 style={{ width: 13, height: 13 }} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {total > perPage && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, fontSize: 12, color: 'var(--text3)' }}>
          <span>Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total}</span>
          <div className="pagination">
            <button className="page-btn" disabled={page === 1} onClick={() => setPage(1)}>«</button>
            <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
            {Array.from({ length: Math.min(5, pages) }, (_, i) => {
              const p = Math.max(1, Math.min(pages - 4, page - 2)) + i;
              return <button key={p} className={`page-btn ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>;
            })}
            <button className="page-btn" disabled={page === pages} onClick={() => setPage(p => p + 1)}>›</button>
            <button className="page-btn" disabled={page === pages} onClick={() => setPage(pages)}>»</button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   VIEW: BILLING
───────────────────────────────────────────── */
const BillingView = ({ tenants }) => {
  const plans = ['starter', 'professional', 'enterprise'];
  const rows = plans.map(p => {
    const count = tenants.filter(t => t.plan === p).length;
    const mrr = count * (planPrice[p] || 0);
    return { plan: p, count, mrr };
  });
  const totalMRR = rows.reduce((a, r) => a + r.mrr, 0);
  const totalSchools = tenants.length;

  return (
    <div>
      <div className="section-header">
        <div><div className="section-title">Billing & Revenue</div><div className="section-sub">Estimated — computed from active plan assignments</div></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Estimated MRR', value: `₹${fmt(totalMRR)}` },
          { label: 'Paying Schools', value: fmt(totalSchools) },
          { label: 'Est. ARR', value: `₹${fmt(totalMRR * 12)}` },
          { label: 'Avg. Rev / School', value: totalSchools ? `₹${fmt(Math.round(totalMRR / totalSchools))}` : '—' },
        ].map(({ label, value }) => (
          <div className="stat-card" key={label}>
            <div className="stat-label">{label}</div>
            <div className="stat-value">{value}</div>
          </div>
        ))}
      </div>

      <div className="layout-grid-2col">
        <div className="card">
          <div className="card-header"><span className="card-title">Revenue by Plan</span></div>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead><tr><th>Plan</th><th>Schools</th><th>Price/mo</th><th>MRR</th><th>Share</th></tr></thead>
              <tbody>
                {rows.map(({ plan, count, mrr }) => (
                  <tr key={plan}>
                    <td><PlanBadge plan={plan} /></td>
                    <td className="mono" style={{ fontSize: 12 }}>{count}</td>
                    <td className="mono" style={{ fontSize: 12 }}>₹{fmt(planPrice[plan] || 0)}</td>
                    <td className="mono" style={{ fontSize: 12, fontWeight: 600 }}>₹{fmt(mrr)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ height: 4, width: 80, background: 'var(--bg3)', borderRadius: 2 }}>
                          <div style={{ height: '100%', width: `${totalMRR ? Math.round((mrr / totalMRR) * 100) : 0}%`, background: 'var(--accent)', borderRadius: 2 }} />
                        </div>
                        <span className="mono" style={{ fontSize: 11, color: 'var(--text3)' }}>{totalMRR ? Math.round((mrr / totalMRR) * 100) : 0}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Active Schools by Plan</span></div>
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {rows.map(({ plan, count }) => {
              const pct = totalSchools ? Math.round((count / totalSchools) * 100) : 0;
              const color = plan === 'enterprise' ? 'var(--amber)' : plan === 'professional' ? 'var(--accent)' : 'var(--text4)';
              return (
                <div key={plan}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                    <span style={{ fontWeight: 500, color: 'var(--text2)', textTransform: 'capitalize' }}>{plan}</span>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--text3)' }}>{count} schools · {pct}%</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--bg3)', borderRadius: 3 }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width 0.5s' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   VIEW: INQUIRIES
───────────────────────────────────────────── */
const InquiriesView = () => {
  const [contacts, setContacts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatus]   = useState('all');
  const [expanded, setExpanded]     = useState(null);

  const fetchContacts = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await axios.get(`${API}/api/v1/contacts`);
      setContacts(res.data.data || []);
    } catch (e) { setError(e.response?.data?.error || 'Failed to load inquiries.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.patch(`${API}/api/v1/contacts/${id}`, { status: newStatus });
      setContacts(c => c.map(x => (x._id === id ? { ...x, status: newStatus } : x)));
    } catch {}
  };

  const filtered = contacts.filter(c => {
    const q = search.toLowerCase();
    if (q && !`${c.firstName} ${c.lastName} ${c.email}`.toLowerCase().includes(q)) return false;
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    return true;
  });

  const newCount = contacts.filter(c => c.status === 'new' || !c.status).length;

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">Inquiries {newCount > 0 && <span className="badge badge-amber" style={{ marginLeft: 8, fontSize: 10 }}>{newCount} new</span>}</div>
          <div className="section-sub">Contact form submissions from the landing page</div>
        </div>
        <button className="btn" onClick={fetchContacts}><RefreshCw style={{ width: 13, height: 13 }} />Refresh</button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
          <Search style={{ width: 13, height: 13, position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text4)' }} />
          <input className="admin-input" style={{ paddingLeft: 30 }} placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="admin-select" value={statusFilter} onChange={e => setStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="card">
        {loading ? <div className="empty-state"><Loader2 style={{ width: 20, height: 20, animation: 'spin 1s linear infinite', opacity: 0.4 }} /></div>
          : error ? <div className="empty-state" style={{ color: 'var(--red)' }}>{error}</div>
          : filtered.length === 0 ? <div className="empty-state"><MessageSquare style={{ width: 28, height: 28 }} /><div style={{ marginTop: 8 }}>No inquiries found.</div></div>
          : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Sender</th>
                  <th>Email</th>
                  <th>Date</th>
                  <th>Message</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <React.Fragment key={c._id}>
                    <tr style={{ cursor: 'pointer' }} onClick={() => setExpanded(expanded === c._id ? null : c._id)}>
                      <td style={{ fontWeight: 500 }}>{c.firstName} {c.lastName}</td>
                      <td><a className="mono" href={`mailto:${c.email}`} style={{ color: 'var(--accent)', fontSize: 12 }} onClick={e => e.stopPropagation()}>{c.email}</a></td>
                      <td><span className="mono" style={{ fontSize: 11, color: 'var(--text3)' }}>{fmtDate(c.createdAt)}</span></td>
                      <td style={{ maxWidth: 280 }}><div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12, color: 'var(--text3)' }}>{c.message}</div></td>
                      <td>
                        <select className="admin-select" value={c.status || 'new'} style={{ padding: '3px 22px 3px 8px', fontSize: 11 }} onClick={e => e.stopPropagation()} onChange={e => updateStatus(c._id, e.target.value)}>
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="closed">Closed</option>
                        </select>
                      </td>
                      <td>
                        <a className="btn btn-icon" href={`mailto:${c.email}`} onClick={e => e.stopPropagation()} title="Reply via email"><Mail style={{ width: 13, height: 13 }} /></a>
                      </td>
                    </tr>
                    {expanded === c._id && (
                      <tr>
                        <td colSpan={6} style={{ background: 'var(--bg2)', padding: '12px 16px' }}>
                          <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, maxWidth: 700 }}>{c.message}</div>
                          <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                            <a className="btn" href={`mailto:${c.email}?subject=Re: Your EduCore Inquiry`} style={{ fontSize: 12, padding: '5px 12px' }}><Mail style={{ width: 12, height: 12 }} />Reply</a>
                            <button className="btn" style={{ fontSize: 12, padding: '5px 12px' }} onClick={() => updateStatus(c._id, 'contacted')}>Mark Contacted</button>
                            <button className="btn" style={{ fontSize: 12, padding: '5px 12px' }} onClick={() => updateStatus(c._id, 'closed')}>Mark Closed</button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   VIEW: SYSTEM HEALTH
───────────────────────────────────────────── */
const HealthView = ({ systemHealth, logs, fetchLogs, onNav }) => {
  const [logSearch, setLogSearch] = useState('');
  const filteredLogs = logs.filter(l => {
    const q = logSearch.toLowerCase();
    if (!q) return true;
    return l.action?.toLowerCase().includes(q) || l.details?.toLowerCase().includes(q) || l.performedBy?.toLowerCase().includes(q);
  });

  return (
    <div>
      <div className="section-header">
        <div><div className="section-title">System Health</div><div className="section-sub">Infrastructure telemetry + recent audit activity</div></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={fetchLogs}><RefreshCw style={{ width: 13, height: 13 }} />Refresh</button>
          <button className="btn" onClick={() => onNav('audit')}>Full Audit Log →</button>
        </div>
      </div>

      <div className="layout-grid-settings">
        {/* Metrics panel */}
        <div className="card">
          <div className="card-header"><span className="card-title">Infrastructure</span><span className="badge badge-green" style={{ fontSize: 10 }}><span className="badge-dot" style={{ background: 'var(--green)', animation: 'pulse 2s infinite' }} />Live</span></div>
          <div style={{ padding: '8px 14px' }}>
            {[
              { key: 'API Status', val: systemHealth.apiStatus || 'Healthy', type: 'status' },
              { key: 'CPU Usage', val: systemHealth.cpu || '—', type: 'mono' },
              { key: 'Memory', val: systemHealth.memory || '—', type: 'mono' },
              { key: 'Uptime', val: systemHealth.uptime || '—', type: 'mono' },
              { key: 'Environment', val: 'production', type: 'mono' },
              { key: 'Node Version', val: 'v20.x', type: 'mono' },
            ].map(({ key, val, type }) => (
              <div className="health-row" key={key}>
                <span className="health-key">{key}</span>
                {type === 'status'
                  ? <StatusBadge status={val.toLowerCase()} />
                  : <span className="health-val">{val}</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Recent audit log */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Audit Activity</span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <Search style={{ width: 11, height: 11, position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text4)' }} />
                <input className="admin-input" style={{ paddingLeft: 26, fontSize: 12, padding: '5px 10px 5px 26px', width: 200 }} placeholder="Filter logs…" value={logSearch} onChange={e => setLogSearch(e.target.value)} />
              </div>
            </div>
          </div>
          <div style={{ padding: '4px 14px', maxHeight: 380, overflowY: 'auto' }}>
            {filteredLogs.length === 0
              ? <div className="empty-state" style={{ padding: 32 }}>No logs found.</div>
              : filteredLogs.slice(0, 30).map((log, i) => (
                <div className="log-row" key={i}>
                  <span className="mono" style={{ color: 'var(--text4)', fontSize: 10, flexShrink: 0, minWidth: 70 }}>{fmtTime(log.createdAt)}</span>
                  <span className="mono" style={{ color: 'var(--accent)', fontWeight: 600, flexShrink: 0 }}>{log.action}</span>
                  <span style={{ color: 'var(--text2)', flex: 1 }}>{log.details}</span>
                  <span style={{ color: 'var(--text4)', fontSize: 11, flexShrink: 0 }}>by {log.performedBy}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   VIEW: AUDIT LOG
───────────────────────────────────────────── */
const AuditView = ({ logs, fetchLogs }) => {
  const [search, setSearch]     = useState('');
  const [action, setAction]     = useState('all');
  const [page, setPage]         = useState(1);
  const perPage = 50;

  const actions = [...new Set(logs.map(l => l.action).filter(Boolean))];

  const filtered = logs.filter(l => {
    const q = search.toLowerCase();
    if (q && !l.action?.toLowerCase().includes(q) && !l.details?.toLowerCase().includes(q) && !l.performedBy?.toLowerCase().includes(q)) return false;
    if (action !== 'all' && l.action !== action) return false;
    return true;
  });

  const pageData = filtered.slice((page - 1) * perPage, page * perPage);
  const pages = Math.max(1, Math.ceil(filtered.length / perPage));

  const exportCSV = () => {
    const rows = [['Timestamp', 'Action', 'Details', 'Performed By']];
    filtered.forEach(l => rows.push([new Date(l.createdAt).toISOString(), l.action, l.details, l.performedBy]));
    const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'audit-log.csv'; a.click();
  };

  return (
    <div>
      <div className="section-header">
        <div><div className="section-title">Audit Log</div><div className="section-sub">{filtered.length} entries</div></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={exportCSV}><Download style={{ width: 13, height: 13 }} />Export CSV</button>
          <button className="btn" onClick={fetchLogs}><RefreshCw style={{ width: 13, height: 13 }} />Refresh</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 340 }}>
          <Search style={{ width: 13, height: 13, position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text4)' }} />
          <input className="admin-input" style={{ paddingLeft: 30 }} placeholder="Search logs…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="admin-select" value={action} onChange={e => { setAction(e.target.value); setPage(1); }}>
          <option value="all">All Actions</option>
          {actions.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      <div className="card">
        {pageData.length === 0
          ? <div className="empty-state"><ClipboardList style={{ width: 28, height: 28 }} /><div style={{ marginTop: 8 }}>No log entries found.</div></div>
          : (
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead><tr><th>Timestamp</th><th>Action</th><th>Details</th><th>Performed By</th></tr></thead>
                <tbody>
                  {pageData.map((log, i) => (
                    <tr key={i}>
                      <td><span className="mono" style={{ fontSize: 11, color: 'var(--text3)' }}>{new Date(log.createdAt).toLocaleString('en-IN')}</span></td>
                      <td><span className="mono" style={{ color: 'var(--accent)', fontWeight: 600, fontSize: 11 }}>{log.action}</span></td>
                      <td style={{ maxWidth: 400, fontSize: 12, color: 'var(--text2)' }}>{log.details}</td>
                      <td><span style={{ fontSize: 12, color: 'var(--text3)' }}>{log.performedBy}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>

      {filtered.length > perPage && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, fontSize: 12, color: 'var(--text3)' }}>
          <span>Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}</span>
          <div className="pagination">
            <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
            {Array.from({ length: Math.min(5, pages) }, (_, i) => {
              const p = Math.max(1, Math.min(pages - 4, page - 2)) + i;
              return <button key={p} className={`page-btn ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>;
            })}
            <button className="page-btn" disabled={page === pages} onClick={() => setPage(p => p + 1)}>›</button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   VIEW: SETTINGS (stub)
───────────────────────────────────────────── */
const SettingsView = ({ logout }) => (
  <div>
    <div className="section-header"><div><div className="section-title">Settings</div><div className="section-sub">Account & platform configuration</div></div></div>
    <div className="card" style={{ padding: 32, textAlign: 'center', color: 'var(--text3)' }}>
      <Settings style={{ width: 32, height: 32, margin: '0 auto 12px', opacity: 0.3 }} />
      <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Settings panel coming soon</div>
      <div style={{ fontSize: 12, marginBottom: 20 }}>Profile, notifications, and API key management will appear here.</div>
      <button className="btn btn-danger" onClick={logout}><LogOut style={{ width: 13, height: 13 }} />Sign Out</button>
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   MAIN SUPER ADMIN DASHBOARD
───────────────────────────────────────────── */
const SuperAdminDashboard = () => {
  const { logout } = useAuth();

  const [view, setView]           = useState('dashboard');
  const [dark, setDark]           = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);
  const [tenants, setTenants]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [metrics, setMetrics]     = useState({ schools: 0, students: 0, staff: 0 });
  const [logs, setLogs]           = useState([]);
  const [systemHealth, setHealth] = useState({ cpu: '—', memory: '—', uptime: '—', apiStatus: 'Healthy' });
  const [showOnboard, setOnboard] = useState(false);
  const [editSchool, setEditSchool] = useState(null);
  const [profileOpen, setProfile] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [newInquiries, setNewInquiries] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* Dark mode */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }, [dark]);

  const fetchTenants = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await axios.get(`${API}/api/v1/tenants`);
      setTenants(res.data.data || []);
    } catch (e) { setError(e.response?.data?.error || 'Failed to fetch tenants.'); }
    finally { setLoading(false); }
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

  useEffect(() => {
    fetchTenants(); fetchMetrics(); fetchLogs(); fetchInquiries();
    const healthInterval = setInterval(() => {
      setHealth({ cpu: `${Math.floor(10 + Math.random() * 20)}%`, memory: `${(4.4 + Math.random() * 0.6).toFixed(2)} GB / 8.00 GB`, uptime: '1d 14h 22m', apiStatus: 'Healthy' });
    }, 4000);
    return () => clearInterval(healthInterval);
  }, [fetchTenants, fetchMetrics, fetchLogs, fetchInquiries]);

  const refreshData = () => { fetchTenants(); fetchMetrics(); fetchLogs(); fetchInquiries(); };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?\n\nThis will permanently remove all data for this school. This cannot be undone.`)) return;
    try {
      await axios.delete(`${API}/api/v1/superadmin/tenants/${id}`);
      refreshData();
    } catch (e) { alert(e.response?.data?.error || 'Delete failed.'); }
  };

  /* Cmd+K global search */
  useEffect(() => {
    const handler = (e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); document.getElementById('global-search')?.focus(); } };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'schools', icon: Building2, label: 'Schools' },
    { id: 'billing', icon: CreditCard, label: 'Billing' },
    { id: 'inquiries', icon: Mail, label: 'Inquiries', badge: newInquiries },
    { id: 'health', icon: Activity, label: 'System Health' },
    { id: 'audit', icon: ClipboardList, label: 'Audit Log' },
  ];

  return (
    <div className="admin-root" data-theme={dark ? 'dark' : 'light'}>
      <AdminStyles />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>

      {/* ── SIDEBAR ── */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid var(--border)' }}>
          <img src={logo} alt="EduCore" style={{ height: 30 }} />
          <div style={{ fontSize: 9, color: 'var(--text4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>Super Admin</div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '8px 0', flex: 1 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text4)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '8px 20px 4px' }}>Platform</div>
          {navItems.map(({ id, icon: Icon, label, badge }) => (
            <button key={id} className={`nav-item ${view === id ? 'active' : ''}`} onClick={() => { setView(id); setSidebarOpen(false); }}>
              <Icon style={{ width: 14, height: 14 }} />
              <span style={{ flex: 1 }}>{label}</span>
              {badge > 0 && <span style={{ background: 'var(--amber)', color: '#fff', borderRadius: 10, fontSize: 9, padding: '1px 5px', fontWeight: 700, minWidth: 16, textAlign: 'center' }}>{badge}</span>}
            </button>
          ))}
          <div style={{ height: 1, background: 'var(--border)', margin: '8px 16px' }} />
          <button className={`nav-item ${view === 'settings' ? 'active' : ''}`} onClick={() => { setView('settings'); setSidebarOpen(false); }}>
            <Settings style={{ width: 14, height: 14 }} /> Settings
          </button>
        </nav>

        {/* Sidebar footer */}
        <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 10, color: 'var(--text4)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }} />
            <span className="mono">All systems operational</span>
          </div>
        </div>
      </aside>

      {/* Backdrop overlay for mobile drawer */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)} 
          style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', zIndex: 49 }} 
        />
      )}

      {/* ── TOPBAR ── */}
      <header className="admin-topbar">
        {/* Mobile Menu Button */}
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
          <Search style={{ width: 13, height: 13, position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text4)' }} />
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
            <kbd style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 9, color: 'var(--text4)', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 3, padding: '1px 4px' }}>ESC</kbd>
          )}
          {/* Search results dropdown */}
          {searchFocused && globalSearch && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 100, maxHeight: 260, overflowY: 'auto' }}>
              {tenants.filter(t => t.schoolName?.toLowerCase().includes(globalSearch.toLowerCase()) || t.subdomain?.toLowerCase().includes(globalSearch.toLowerCase())).slice(0, 8).map(t => (
                <div key={t._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border)', fontSize: 13 }}
                  onMouseDown={() => { setView('schools'); setGlobalSearch(''); }}>
                  <Building2 style={{ width: 13, height: 13, color: 'var(--text4)' }} />
                  <span style={{ fontWeight: 500, color: 'var(--text)' }}>{t.schoolName}</span>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--text4)', marginLeft: 'auto' }}>{t.subdomain}.localhost</span>
                </div>
              ))}
              {tenants.filter(t => t.schoolName?.toLowerCase().includes(globalSearch.toLowerCase()) || t.subdomain?.toLowerCase().includes(globalSearch.toLowerCase())).length === 0 && (
                <div style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text4)' }}>No schools match "{globalSearch}"</div>
              )}
            </div>
          )}
        </div>

        <div style={{ flex: 1 }} />

        {/* Dark mode toggle */}
        <button className="btn btn-icon" onClick={() => setDark(d => !d)} title="Toggle dark mode">
          {dark ? <Sun style={{ width: 15, height: 15 }} /> : <Moon style={{ width: 15, height: 15 }} />}
        </button>

        {/* Notifications */}
        <button className="btn btn-icon" style={{ position: 'relative' }} onClick={() => setView('inquiries')}>
          <Bell style={{ width: 15, height: 15 }} />
          {newInquiries > 0 && <span style={{ position: 'absolute', top: 3, right: 3, width: 7, height: 7, background: 'var(--red)', borderRadius: '50%', border: '1.5px solid var(--bg)' }} />}
        </button>

        {/* Profile dropdown */}
        <div style={{ position: 'relative' }}>
          <button className="btn" style={{ gap: 6, padding: '5px 10px' }} onClick={() => setProfile(p => !p)}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>SA</div>
            <span style={{ fontSize: 12, fontWeight: 500 }}>Super Admin</span>
            <ChevronDown style={{ width: 12, height: 12 }} />
          </button>
          {profileOpen && (
            <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 6, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, minWidth: 180, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 100 }}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Super Admin</div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--text4)' }}>admin@educore.app</div>
                <span className="badge badge-blue" style={{ fontSize: 9, marginTop: 4 }}>super_admin</span>
              </div>
              <button className="nav-item" style={{ width: '100%', margin: 0, borderRadius: 0, padding: '8px 14px' }} onClick={() => { setView('settings'); setProfile(false); }}>
                <Settings style={{ width: 13, height: 13 }} /> Settings
              </button>
              <button className="nav-item" style={{ width: '100%', margin: 0, borderRadius: 0, padding: '8px 14px', color: 'var(--red)' }} onClick={logout}>
                <LogOut style={{ width: 13, height: 13 }} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="admin-main">
        <div className="admin-content">
          {view === 'dashboard' && <DashboardView tenants={tenants} metrics={metrics} logs={logs} onOpenOnboard={() => setOnboard(true)} onNav={setView} />}
          {view === 'schools' && <SchoolsView tenants={tenants} loading={loading} error={error} refreshData={refreshData} onOpenOnboard={() => setOnboard(true)} onOpenEdit={s => setEditSchool(s)} onDelete={handleDelete} />}
          {view === 'billing' && <BillingView tenants={tenants} />}
          {view === 'inquiries' && <InquiriesView />}
          {view === 'health' && <HealthView systemHealth={systemHealth} logs={logs} fetchLogs={fetchLogs} onNav={setView} />}
          {view === 'audit' && <AuditView logs={logs} fetchLogs={fetchLogs} />}
          {view === 'settings' && <SettingsView logout={logout} />}
        </div>
      </main>

      {/* ── MODALS ── */}
      {showOnboard && <OnboardModal onClose={() => setOnboard(false)} onSuccess={refreshData} />}
      {editSchool && <EditModal school={editSchool} onClose={() => setEditSchool(null)} onSuccess={refreshData} />}

      {/* Backdrop dismiss profile */}
      {profileOpen && <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setProfile(false)} />}
    </div>
  );
};

export default SuperAdminDashboard;
