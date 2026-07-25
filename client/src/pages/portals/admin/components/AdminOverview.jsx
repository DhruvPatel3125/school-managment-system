import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTenantTheme } from '../../../../context/TenantThemeContext';
import { useAuth } from '../../../../context/AuthContext';
import {
  GraduationCap, Users, CreditCard, FileText,
  TrendingUp, Activity, Award
} from 'lucide-react';
import { Link } from 'react-router-dom';

/* ── CSS ── */
import '../../../../styles/admin.css';

/**
 * AdminOverview — School admin dashboard with stats, quick actions, and system status
 */
const AdminOverview = () => {
  const { tenant } = useTenantTheme();
  const { user }   = useAuth();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents:        0,
    activeTeachers:       0,
    attendancePercentage: '0.0',
    feesCollected:        '₹0',
  });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5001`;
        const res = await axios.get(`${API_URL}/api/v1/admin/dashboard`, { withCredentials: true });
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch admin dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const primaryBrandColor = tenant?.primaryColor || '#1e3a8a';

  /* ── Stat card definitions ── */
  const statCards = [
    { name: 'Total Students',       value: stats.totalStudents,               change: '+4.75%', changeType: 'increase', icon: Users },
    { name: 'Active Teachers',      value: stats.activeTeachers,              change: '+2.1%',  changeType: 'increase', icon: GraduationCap },
    { name: 'Daily Attendance',     value: `${stats.attendancePercentage}%`,  change: '-0.4%',  changeType: 'decrease', icon: Activity },
    { name: 'Fees Collected (Mtd)', value: stats.feesCollected,               change: '+12.5%', changeType: 'increase', icon: CreditCard },
  ];

  /* ── Quick action definitions ── */
  const quickActions = [
    { to: '/students', label: 'Manage Students',  desc: 'Browse SIS, admit pupils',        icon: Users,       color: '#3B82F6' },
    { to: '/staff',    label: 'Staff Directory',   desc: 'Manage teachers & admins',        icon: Award,       color: '#10B981' },
    { to: '/classes',  label: 'Academic Setup',    desc: 'Configure sections & grades',     icon: TrendingUp,  color: '#F59E0B' },
    { to: '/announcements', label: 'Announcements', desc: 'Post school-wide updates',       icon: FileText,    color: '#8B5CF6' },
  ];

  /* ── System status items ── */
  const systemStatus = [
    { title: 'Database Connection', desc: 'Live operations normal' },
    { title: 'Cloud Storage Sync',  desc: 'Synced 2m ago' },
    { title: 'Active Connections',  desc: '14 active administrators' },
  ];

  if (loading) {
    return (
      <div className="ap-loader">
        <div className="ap-spinner" style={{ borderTopColor: primaryBrandColor }} />
      </div>
    );
  }

  return (
    <div className="admin-portal-root" style={{ padding: '0 0 48px' }}>

      {/* ── Welcome Header ── */}
      <div className="ap-welcome">
        <div className="ap-welcome-row">
          <div>
            <div className="ap-welcome-badge">
              <span className="dot" />
              Active Session
            </div>
            <h2>Welcome back, {user?.name || 'Administrator'}</h2>
            <p>
              Dashboard for {tenant?.schoolName || 'EduCore School'} ·{' '}
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link
              to="/students"
              className="ap-btn ap-btn-primary"
              style={{ backgroundColor: primaryBrandColor }}
            >
              + Add Student Admission
            </Link>
            <Link to="/classes" className="ap-btn ap-btn-outline">
              <FileText style={{ width: 14, height: 14 }} />
              Manage Classes
            </Link>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="ap-stat-grid">
        {statCards.map((item) => {
          const Icon = item.icon;
          return (
            <div className="ap-stat-card" key={item.name}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <p className="ap-stat-label">{item.name}</p>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: `${primaryBrandColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon style={{ width: 15, height: 15, color: primaryBrandColor }} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span className="ap-stat-value">{item.value}</span>
                <span className={`ap-stat-change ${item.changeType === 'increase' ? 'up' : 'down'}`}>
                  {item.change}
                </span>
              </div>
              <p style={{ fontSize: 10, color: 'var(--admin-text4)', marginTop: 6, fontWeight: 500 }}>vs. previous month</p>
            </div>
          );
        })}
      </div>

      {/* ── Bottom Grid: Quick Actions + System Status ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>

        {/* Quick Actions */}
        <div className="ap-card">
          <div className="ap-card-header">
            <span className="ap-card-title">Quick Actions Hub</span>
          </div>
          <div className="ap-card-body">
            <div className="ap-action-grid">
              {quickActions.map((act) => {
                const Icon = act.icon;
                return (
                  <Link key={act.to} to={act.to} className="ap-action-tile">
                    <div className="ap-action-icon" style={{ color: act.color }}>
                      <Icon style={{ width: 16, height: 16 }} />
                    </div>
                    <span className="ap-action-label">{act.label}</span>
                    <span className="ap-action-desc">{act.desc}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="ap-card">
          <div className="ap-card-header">
            <span className="ap-card-title">System Status</span>
          </div>
          <div className="ap-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {systemStatus.map((stat) => (
              <div key={stat.title} className="ap-status-item">
                <span className="ap-status-dot online" />
                <div>
                  <h4 className="ap-status-name">{stat.title}</h4>
                  <p className="ap-status-desc">{stat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
