import React from 'react';
import {
  Plus, ClipboardList, Activity, Mail
} from 'lucide-react';

/* ── Helpers ── */
const planPrice = { starter: 1999, professional: 4499, enterprise: 0 };
const fmt = (n) => n?.toLocaleString('en-IN') ?? '—';
const fmtTime = (d) =>
  d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) : '—';

/**
 * DashboardView — Main platform overview with stats, activity feed, and quick actions
 */
const DashboardView = ({ tenants, metrics, logs, onOpenOnboard, onNav }) => {
  const mrr = tenants.reduce((acc, t) => acc + (planPrice[t.plan] || 0), 0);
  const active = tenants.filter(t => t.status !== 'suspended').length;

  const stats = [
    { label: 'Registered Schools', value: fmt(metrics.schools), trend: null },
    { label: 'Total Students',     value: fmt(metrics.students), trend: null },
    { label: 'Estimated MRR',      value: `₹${fmt(mrr)}`,       trend: null },
    { label: 'Active Portals',     value: fmt(active),           trend: null },
    { label: 'Platform Uptime',    value: '99.9%', valueClass: 'mono', color: 'var(--sa-green)' },
    { label: 'Staff Members',      value: fmt(metrics.staff),    trend: null },
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
              ? (
                <div className="empty-state" style={{ padding: 32 }}>
                  <ClipboardList style={{ width: 28, height: 28 }} />
                  <div style={{ marginTop: 8, fontSize: 12 }}>No activity logged yet.</div>
                </div>
              )
              : logs.slice(0, 10).map((log, i) => (
                <div className="activity-item" key={i} style={{ padding: '8px 16px' }}>
                  <div style={{ flexShrink: 0, marginTop: 2 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--sa-accent)', marginTop: 3 }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontWeight: 600, fontSize: 12, color: 'var(--sa-text)' }}>{log.action}</span>
                    <span style={{ fontSize: 12, color: 'var(--sa-text3)', marginLeft: 6 }}>{log.details}</span>
                  </div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--sa-text4)', flexShrink: 0 }}>{fmtTime(log.createdAt)}</div>
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
                { label: 'Onboard New School', icon: Plus,          action: onOpenOnboard },
                { label: 'View Inquiries',     icon: Mail,          action: () => onNav('inquiries') },
                { label: 'System Health',      icon: Activity,      action: () => onNav('health') },
                { label: 'Audit Log',          icon: ClipboardList, action: () => onNav('audit') },
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
                      <span style={{ textTransform: 'capitalize', fontWeight: 500, color: 'var(--sa-text2)' }}>{p}</span>
                      <span className="mono" style={{ fontSize: 11, color: 'var(--sa-text3)' }}>{count} · {pct}%</span>
                    </div>
                    <div style={{ height: 4, background: 'var(--sa-bg3)', borderRadius: 2 }}>
                      <div style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: p === 'enterprise' ? 'var(--sa-amber)' : p === 'professional' ? 'var(--sa-accent)' : 'var(--sa-text4)',
                        borderRadius: 2,
                        transition: 'width 0.4s'
                      }} />
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

export default DashboardView;
