import React from 'react';
import PlanBadge from './PlanBadge';

/* ── Helpers ── */
const planPrice = { starter: 1999, professional: 4499, enterprise: 0 };
const fmt = (n) => n?.toLocaleString('en-IN') ?? '—';

/**
 * BillingView — Revenue & plan breakdown
 */
const BillingView = ({ tenants }) => {
  const plans = ['starter', 'professional', 'enterprise'];
  const rows = plans.map(p => {
    const count = tenants.filter(t => t.plan === p).length;
    const mrr   = count * (planPrice[p] || 0);
    return { plan: p, count, mrr };
  });
  const totalMRR    = rows.reduce((a, r) => a + r.mrr, 0);
  const totalSchools = tenants.length;

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">Billing &amp; Revenue</div>
          <div className="section-sub">Estimated — computed from active plan assignments</div>
        </div>
      </div>

      {/* Stat strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Estimated MRR',       value: `₹${fmt(totalMRR)}` },
          { label: 'Paying Schools',       value: fmt(totalSchools) },
          { label: 'Est. ARR',             value: `₹${fmt(totalMRR * 12)}` },
          { label: 'Avg. Rev / School',    value: totalSchools ? `₹${fmt(Math.round(totalMRR / totalSchools))}` : '—' },
        ].map(({ label, value }) => (
          <div className="stat-card" key={label}>
            <div className="stat-label">{label}</div>
            <div className="stat-value">{value}</div>
          </div>
        ))}
      </div>

      <div className="layout-grid-2col">
        {/* Revenue by plan table */}
        <div className="card">
          <div className="card-header"><span className="card-title">Revenue by Plan</span></div>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Schools</th>
                  <th>Price/mo</th>
                  <th>MRR</th>
                  <th>Share</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ plan, count, mrr }) => (
                  <tr key={plan}>
                    <td><PlanBadge plan={plan} /></td>
                    <td className="mono" style={{ fontSize: 12 }}>{count}</td>
                    <td className="mono" style={{ fontSize: 12 }}>₹{fmt(planPrice[plan] || 0)}</td>
                    <td className="mono" style={{ fontSize: 12, fontWeight: 600 }}>₹{fmt(mrr)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ height: 4, width: 80, background: 'var(--sa-bg3)', borderRadius: 2 }}>
                          <div style={{ height: '100%', width: `${totalMRR ? Math.round((mrr / totalMRR) * 100) : 0}%`, background: 'var(--sa-accent)', borderRadius: 2 }} />
                        </div>
                        <span className="mono" style={{ fontSize: 11, color: 'var(--sa-text3)' }}>
                          {totalMRR ? Math.round((mrr / totalMRR) * 100) : 0}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active schools by plan bar chart */}
        <div className="card">
          <div className="card-header"><span className="card-title">Active Schools by Plan</span></div>
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {rows.map(({ plan, count }) => {
              const pct = totalSchools ? Math.round((count / totalSchools) * 100) : 0;
              const color = plan === 'enterprise' ? 'var(--sa-amber)' : plan === 'professional' ? 'var(--sa-accent)' : 'var(--sa-text4)';
              return (
                <div key={plan}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                    <span style={{ fontWeight: 500, color: 'var(--sa-text2)', textTransform: 'capitalize' }}>{plan}</span>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--sa-text3)' }}>{count} schools · {pct}%</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--sa-bg3)', borderRadius: 3 }}>
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

export default BillingView;
