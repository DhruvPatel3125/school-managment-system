import React, { useState } from 'react';
import {
  Plus, RefreshCw, Search, ExternalLink, Pencil, Trash2,
  Building2, Loader2, AlertTriangle, Download, SortAsc, SortDesc
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import PlanBadge from './PlanBadge';
import useDebounce from '../../../../hooks/useDebounce';
/* ── Helpers ── */
const fmt = (n) => n?.toLocaleString('en-IN') ?? '—';
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

/**
 * SchoolsView — Full tenants table with search, filter, sort, pagination, bulk actions
 */
const SchoolsView = ({ tenants, loading, error, refreshData, onOpenOnboard, onOpenEdit, onDelete }) => {
  const [search, setSearch]           = useState('');
  const debouncedSearch               = useDebounce(search, 300);
  const [planFilter, setPlanFilter]   = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortCol, setSortCol]         = useState('schoolName');
  const [sortDir, setSortDir]         = useState('asc');
  const [page, setPage]               = useState(1);
  const [perPage, setPerPage]         = useState(25);
  const [selected, setSelected]       = useState(new Set());

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
    return sortDir === 'asc'
      ? <SortAsc style={{ width: 10, height: 10 }} />
      : <SortDesc style={{ width: 10, height: 10 }} />;
  };

  const filtered = tenants
    .filter(t => {
      const q = debouncedSearch.toLowerCase();
      if (q && !t.schoolName?.toLowerCase().includes(q) && !t.subdomain?.toLowerCase().includes(q)) return false;
      if (planFilter !== 'all' && t.plan !== planFilter) return false;
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      return true;
    })
    .sort((a, b) => {
      const av = a[sortCol] ?? '';
      const bv = b[sortCol] ?? '';
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });

  const total    = filtered.length;
  const pages    = Math.max(1, Math.ceil(total / perPage));
  const pageData = filtered.slice((page - 1) * perPage, page * perPage);

  const toggleSelect = (id) =>
    setSelected(prev => { const n = new Set(prev); if (n.has(id)) { n.delete(id); } else { n.add(id); } return n; });
  const toggleAll = () =>
    setSelected(selected.size === pageData.length ? new Set() : new Set(pageData.map(t => t._id || t.id)));

  const exportCSV = () => {
    const rows = [['School Name', 'Subdomain', 'Plan', 'Status', 'Students', 'Joined']];
    filtered.forEach(t => rows.push([t.schoolName, t.subdomain, t.plan, t.status, t.maxStudents, fmtDate(t.createdAt)]));
    const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'schools.csv';
    a.click();
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">Schools</div>
          <div className="section-sub">
            {total} tenant{total !== 1 ? 's' : ''}
            {search || planFilter !== 'all' || statusFilter !== 'all' ? ' (filtered)' : ' total'}
          </div>
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
          <Search style={{ width: 13, height: 13, position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--sa-text4)' }} />
          <input
            className="admin-input"
            style={{ paddingLeft: 30 }}
            placeholder="Search by name or domain…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
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
        <div style={{ background: 'var(--sa-accent-bg)', border: '1px solid #BFDBFE', borderRadius: 6, padding: '8px 14px', marginBottom: 10, display: 'flex', gap: 10, alignItems: 'center', fontSize: 12 }}>
          <span style={{ color: 'var(--sa-accent)', fontWeight: 600 }}>{selected.size} selected</span>
          <button className="btn" style={{ padding: '3px 10px', fontSize: 11 }} onClick={() => setSelected(new Set())}>Clear</button>
        </div>
      )}

      {/* Table */}
      <div className="card">
        {loading ? (
          <div className="empty-state">
            <Loader2 style={{ width: 24, height: 24, animation: 'sa-spin 1s linear infinite', opacity: 0.5 }} />
          </div>
        ) : error ? (
          <div className="empty-state" style={{ color: 'var(--sa-red)' }}>
            <AlertTriangle style={{ width: 24, height: 24 }} />
            <div style={{ marginTop: 8 }}>{error}</div>
          </div>
        ) : pageData.length === 0 ? (
          <div className="empty-state">
            <Building2 style={{ width: 28, height: 28 }} />
            <div style={{ marginTop: 8 }}>No schools match your filters.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 36 }}>
                    <input type="checkbox" checked={selected.size === pageData.length && pageData.length > 0} onChange={toggleAll} />
                  </th>
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
                          <div style={{ width: 28, height: 28, borderRadius: 5, border: '1px solid var(--sa-border)', overflow: 'hidden', flexShrink: 0, background: 'var(--sa-bg2)' }}>
                            <img
                              src={school.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(school.schoolName)}&background=2563EB&color=fff&size=28&bold=true&format=svg`}
                              alt=""
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(school.schoolName)}&background=2563EB&color=fff&size=28&bold=true&format=svg`; }}
                            />
                          </div>
                          <span style={{ fontWeight: 500, color: 'var(--sa-text)', fontSize: 13 }}>{school.schoolName}</span>
                        </div>
                      </td>
                      <td>
                        <a
                          href={`${window.location.protocol}//${school.subdomain}.${window.location.hostname}:${window.location.port}`}
                          target="_blank"
                          rel="noreferrer"
                          className="mono"
                          style={{ color: 'var(--sa-accent)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          {school.subdomain}.localhost <ExternalLink style={{ width: 10, height: 10, opacity: 0.6 }} />
                        </a>
                      </td>
                      <td><PlanBadge plan={school.plan} /></td>
                      <td><StatusBadge status={school.status || 'active'} /></td>
                      <td><span className="mono" style={{ fontSize: 12, color: 'var(--sa-text3)' }}>{fmt(school.maxStudents)}</span></td>
                      <td><span className="mono" style={{ fontSize: 11, color: 'var(--sa-text3)' }}>{fmtDate(school.createdAt)}</span></td>
                      <td>
                        <div className="row-actions" style={{ justifyContent: 'flex-end' }}>
                          <button className="btn btn-icon" title="Launch Portal" onClick={() => launchPortal(school.subdomain)}>
                            <ExternalLink style={{ width: 13, height: 13 }} />
                          </button>
                          <button className="btn btn-icon" title="Edit" onClick={() => onOpenEdit(school)}>
                            <Pencil style={{ width: 13, height: 13 }} />
                          </button>
                          <button className="btn btn-icon btn-danger" title="Delete" onClick={() => onDelete(id, school.schoolName)}>
                            <Trash2 style={{ width: 13, height: 13 }} />
                          </button>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, fontSize: 12, color: 'var(--sa-text3)' }}>
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

export default SchoolsView;
