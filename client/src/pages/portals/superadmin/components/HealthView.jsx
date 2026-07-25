import React, { useState } from 'react';
import { RefreshCw, Search } from 'lucide-react';
import StatusBadge from './StatusBadge';

const fmtTime = (d) =>
  d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) : '—';

/**
 * HealthView — Infrastructure telemetry + recent audit activity
 */
const HealthView = ({ systemHealth, logs, fetchLogs, onNav }) => {
  const [logSearch, setLogSearch] = useState('');

  const filteredLogs = logs.filter(l => {
    const q = logSearch.toLowerCase();
    if (!q) return true;
    return (
      l.action?.toLowerCase().includes(q) ||
      l.details?.toLowerCase().includes(q) ||
      l.performedBy?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">System Health</div>
          <div className="section-sub">Infrastructure telemetry + recent audit activity</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={fetchLogs}><RefreshCw style={{ width: 13, height: 13 }} />Refresh</button>
          <button className="btn" onClick={() => onNav('audit')}>Full Audit Log →</button>
        </div>
      </div>

      <div className="layout-grid-settings">
        {/* Infrastructure metrics panel */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Infrastructure</span>
            <span className="badge badge-green" style={{ fontSize: 10 }}>
              <span className="badge-dot" style={{ background: 'var(--sa-green)', animation: 'sa-pulse 2s infinite' }} />
              Live
            </span>
          </div>
          <div style={{ padding: '8px 14px' }}>
            {[
              { key: 'API Status',    val: systemHealth.apiStatus || 'Healthy', type: 'status' },
              { key: 'CPU Usage',     val: systemHealth.cpu    || '—',          type: 'mono' },
              { key: 'Memory',        val: systemHealth.memory || '—',          type: 'mono' },
              { key: 'Uptime',        val: systemHealth.uptime || '—',          type: 'mono' },
              { key: 'Environment',   val: 'production',                         type: 'mono' },
              { key: 'Node Version',  val: 'v20.x',                              type: 'mono' },
            ].map(({ key, val, type }) => (
              <div className="health-row" key={key}>
                <span className="health-key">{key}</span>
                {type === 'status'
                  ? <StatusBadge status={val.toLowerCase()} />
                  : <span className="health-val">{val}</span>
                }
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
                <Search style={{ width: 11, height: 11, position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--sa-text4)' }} />
                <input
                  className="admin-input"
                  style={{ paddingLeft: 26, fontSize: 12, padding: '5px 10px 5px 26px', width: 200 }}
                  placeholder="Filter logs…"
                  value={logSearch}
                  onChange={e => setLogSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div style={{ padding: '4px 14px', maxHeight: 380, overflowY: 'auto' }}>
            {filteredLogs.length === 0 ? (
              <div className="empty-state" style={{ padding: 32 }}>No logs found.</div>
            ) : (
              filteredLogs.slice(0, 30).map((log, i) => (
                <div className="log-row" key={i}>
                  <span className="mono" style={{ color: 'var(--sa-text4)', fontSize: 10, flexShrink: 0, minWidth: 70 }}>{fmtTime(log.createdAt)}</span>
                  <span className="mono" style={{ color: 'var(--sa-accent)', fontWeight: 600, flexShrink: 0 }}>{log.action}</span>
                  <span style={{ color: 'var(--sa-text2)', flex: 1 }}>{log.details}</span>
                  <span style={{ color: 'var(--sa-text4)', fontSize: 11, flexShrink: 0 }}>by {log.performedBy}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthView;
