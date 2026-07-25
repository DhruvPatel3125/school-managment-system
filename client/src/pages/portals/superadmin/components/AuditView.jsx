import React, { useState } from 'react';
import { RefreshCw, Search, Download, ClipboardList } from 'lucide-react';

/**
 * AuditView — Full paginated audit log with search and filter
 */
const AuditView = ({ logs, fetchLogs }) => {
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('all');
  const [page, setPage]     = useState(1);
  const perPage = 50;

  const actions = [...new Set(logs.map(l => l.action).filter(Boolean))];

  const filtered = logs.filter(l => {
    const q = search.toLowerCase();
    if (
      q &&
      !l.action?.toLowerCase().includes(q) &&
      !l.details?.toLowerCase().includes(q) &&
      !l.performedBy?.toLowerCase().includes(q)
    ) return false;
    if (action !== 'all' && l.action !== action) return false;
    return true;
  });

  const pageData = filtered.slice((page - 1) * perPage, page * perPage);
  const pages = Math.max(1, Math.ceil(filtered.length / perPage));

  const exportCSV = () => {
    const rows = [['Timestamp', 'Action', 'Details', 'Performed By']];
    filtered.forEach(l => rows.push([new Date(l.createdAt).toISOString(), l.action, l.details, l.performedBy]));
    const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'audit-log.csv';
    a.click();
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">Audit Log</div>
          <div className="section-sub">{filtered.length} entries</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={exportCSV}><Download style={{ width: 13, height: 13 }} />Export CSV</button>
          <button className="btn" onClick={fetchLogs}><RefreshCw style={{ width: 13, height: 13 }} />Refresh</button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 340 }}>
          <Search style={{ width: 13, height: 13, position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--sa-text4)' }} />
          <input
            className="admin-input"
            style={{ paddingLeft: 30 }}
            placeholder="Search logs…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select className="admin-select" value={action} onChange={e => { setAction(e.target.value); setPage(1); }}>
          <option value="all">All Actions</option>
          {actions.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      <div className="card">
        {pageData.length === 0 ? (
          <div className="empty-state">
            <ClipboardList style={{ width: 28, height: 28 }} />
            <div style={{ marginTop: 8 }}>No log entries found.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Details</th>
                  <th>Performed By</th>
                </tr>
              </thead>
              <tbody>
                {pageData.map((log, i) => (
                  <tr key={i}>
                    <td><span className="mono" style={{ fontSize: 11, color: 'var(--sa-text3)' }}>{new Date(log.createdAt).toLocaleString('en-IN')}</span></td>
                    <td><span className="mono" style={{ color: 'var(--sa-accent)', fontWeight: 600, fontSize: 11 }}>{log.action}</span></td>
                    <td style={{ maxWidth: 400, fontSize: 12, color: 'var(--sa-text2)' }}>{log.details}</td>
                    <td><span style={{ fontSize: 12, color: 'var(--sa-text3)' }}>{log.performedBy}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filtered.length > perPage && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, fontSize: 12, color: 'var(--sa-text3)' }}>
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

export default AuditView;
