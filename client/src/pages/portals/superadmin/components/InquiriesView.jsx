import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { RefreshCw, Search, Mail, MessageSquare, Loader2 } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5001`;

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

/**
 * InquiriesView — Contact form submissions from landing page
 */
const InquiriesView = () => {
  const [contacts, setContacts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState('all');
  const [expanded, setExpanded]   = useState(null);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API}/api/v1/contacts`);
      setContacts(res.data.data || []);
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to load inquiries.');
    } finally {
      setLoading(false);
    }
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
          <div className="section-title">
            Inquiries{' '}
            {newCount > 0 && (
              <span className="badge badge-amber" style={{ marginLeft: 8, fontSize: 10 }}>{newCount} new</span>
            )}
          </div>
          <div className="section-sub">Contact form submissions from the landing page</div>
        </div>
        <button className="btn" onClick={fetchContacts}><RefreshCw style={{ width: 13, height: 13 }} />Refresh</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
          <Search style={{ width: 13, height: 13, position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--sa-text4)' }} />
          <input
            className="admin-input"
            style={{ paddingLeft: 30 }}
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="admin-select" value={statusFilter} onChange={e => setStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty-state">
            <Loader2 style={{ width: 20, height: 20, animation: 'sa-spin 1s linear infinite', opacity: 0.4 }} />
          </div>
        ) : error ? (
          <div className="empty-state" style={{ color: 'var(--sa-red)' }}>{error}</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <MessageSquare style={{ width: 28, height: 28 }} />
            <div style={{ marginTop: 8 }}>No inquiries found.</div>
          </div>
        ) : (
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
                    <td>
                      <a className="mono" href={`mailto:${c.email}`} style={{ color: 'var(--sa-accent)', fontSize: 12 }} onClick={e => e.stopPropagation()}>
                        {c.email}
                      </a>
                    </td>
                    <td><span className="mono" style={{ fontSize: 11, color: 'var(--sa-text3)' }}>{fmtDate(c.createdAt)}</span></td>
                    <td style={{ maxWidth: 280 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12, color: 'var(--sa-text3)' }}>{c.message}</div>
                    </td>
                    <td>
                      <select
                        className="admin-select"
                        value={c.status || 'new'}
                        style={{ padding: '3px 22px 3px 8px', fontSize: 11 }}
                        onClick={e => e.stopPropagation()}
                        onChange={e => updateStatus(c._id, e.target.value)}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>
                    <td>
                      <a className="btn btn-icon" href={`mailto:${c.email}`} onClick={e => e.stopPropagation()} title="Reply via email">
                        <Mail style={{ width: 13, height: 13 }} />
                      </a>
                    </td>
                  </tr>

                  {expanded === c._id && (
                    <tr>
                      <td colSpan={6} style={{ background: 'var(--sa-bg2)', padding: '12px 16px' }}>
                        <div style={{ fontSize: 13, color: 'var(--sa-text2)', lineHeight: 1.6, maxWidth: 700 }}>{c.message}</div>
                        <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                          <a className="btn" href={`mailto:${c.email}?subject=Re: Your EduCore Inquiry`} style={{ fontSize: 12, padding: '5px 12px' }}>
                            <Mail style={{ width: 12, height: 12 }} />Reply
                          </a>
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

export default InquiriesView;
