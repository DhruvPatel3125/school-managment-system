import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTenantTheme } from '../context/TenantThemeContext';
import { Bell, Plus, Trash2, Calendar, AlertCircle, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5001`;

const Announcements = () => {
  const { user } = useAuth();
  const { tenant } = useTenantTheme();
  const isAdmin = ['admin', 'school_admin', 'super_admin'].includes(user?.role);

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tag, setTag] = useState('NOTICE');
  const [submitting, setSubmitting] = useState(false);

  // Filter & Pagination States
  const [selectedTagFilter, setSelectedTagFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const perPage = 10;

  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/v1/announcements`);
      setAnnouncements(res.data.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    try {
      setSubmitting(true);
      await axios.post(`${API_URL}/api/v1/announcements`, {
        title: title.trim(),
        description: description.trim(),
        tag
      });
      setTitle('');
      setDescription('');
      setTag('NOTICE');
      setShowForm(false);
      fetchAnnouncements();
    } catch (err) {
      alert(err.response?.data?.error || 'Error creating announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await axios.delete(`${API_URL}/api/v1/announcements/${id}`);
      setAnnouncements(announcements.filter(a => a._id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Error deleting announcement');
    }
  };

  const getTagColor = (t) => {
    switch (t) {
      case 'HOLIDAY': return 'text-red-700 bg-red-50 border-red-200';
      case 'EXAM': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'EVENT': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'FEES': return 'text-blue-700 bg-blue-50 border-blue-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200'; // NOTICE, ACADEMIC
    }
  };

  const primaryBrandColor = tenant?.primaryColor || '#0D1B2A';

  // Apply Tag Filter
  const filteredAnnouncements = announcements.filter(a => {
    if (selectedTagFilter === 'ALL') return true;
    return a.tag === selectedTagFilter;
  });

  // Paginate list
  const total = filteredAnnouncements.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const paginatedAnnouncements = filteredAnnouncements.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="mx-auto space-y-6">
      {/* Calm Flat Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Announcements</h1>
            <p className="text-xs text-slate-500 mt-0.5">Official notices, events, and circulars for the school</p>
          </div>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-white text-xs font-semibold rounded-lg transition-all shadow-sm active:scale-95"
            style={{ backgroundColor: primaryBrandColor }}
          >
            {showForm ? 'Cancel' : <><Plus className="w-3.5 h-3.5" /> Post Announcement</>}
          </button>
        )}
      </div>

      {/* Post form */}
      {isAdmin && showForm && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Post New Announcement</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Announcement Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-slate-500 bg-white placeholder-slate-400 text-slate-800 transition-all shadow-sm"
                  placeholder="e.g. Annual Sports Day Schedule"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Announcement Type / Tag</label>
                <select
                  value={tag}
                  onChange={e => setTag(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-slate-500 bg-white text-slate-800 transition-all shadow-sm"
                >
                  <option value="NOTICE">Notice</option>
                  <option value="HOLIDAY">Holiday</option>
                  <option value="EXAM">Exam</option>
                  <option value="EVENT">Event</option>
                  <option value="FEES">Fees</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Message / Details</label>
              <textarea
                required
                rows="3"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-slate-500 bg-white placeholder-slate-400 text-slate-800 transition-all resize-none shadow-sm"
                placeholder="Details of the circular..."
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 text-white text-xs font-semibold rounded-lg shadow-sm hover:opacity-90 transition-all"
                style={{ backgroundColor: primaryBrandColor }}
              >
                {submitting ? 'Posting Notice…' : 'Publish Announcement'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Content Controls */}
      <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-lg border border-slate-200 shadow-sm">
        <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="text-xs text-slate-500 font-medium">Filter announcements:</span>
        <div className="flex flex-wrap gap-1.5">
          {['ALL', 'NOTICE', 'HOLIDAY', 'EXAM', 'EVENT', 'FEES'].map(t => (
            <button
              key={t}
              onClick={() => { setSelectedTagFilter(t); setPage(1); }}
              className={`px-2.5 py-1 rounded text-[10px] font-semibold tracking-wider transition-all border ${selectedTagFilter === t
                  ? 'bg-slate-100 text-slate-900 border-slate-300'
                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-slate-200 animate-spin" style={{ borderTopColor: primaryBrandColor }} />
            <p className="text-slate-400 text-xs mt-3">Loading announcements...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-3 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        ) : paginatedAnnouncements.length === 0 ? (
          <div className="py-12 bg-white border border-slate-200 rounded-xl text-center shadow-sm">
            <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h3 className="text-xs font-semibold text-slate-700">No Announcements Found</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">There are no school announcements listed under this category.</p>
          </div>
        ) : (
          paginatedAnnouncements.map((ann) => (
            <div key={ann._id} className="bg-white p-5 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors shadow-sm relative group">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${getTagColor(ann.tag)}`}>
                      {ann.tag}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {new Date(ann.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-slate-900">{ann.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{ann.description}</p>

                  <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1.5 pt-1">
                    <div className="w-4 h-4 rounded bg-slate-100 flex items-center justify-center text-slate-500 font-bold uppercase">
                      {ann.createdBy?.name?.charAt(0) || 'A'}
                    </div>
                    <span>Published by {ann.createdBy?.name || 'School Admin'}</span>
                  </div>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(ann._id)}
                    className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-rose-50 rounded transition-colors shrink-0"
                    title="Delete Announcement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {total > perPage && (
        <div className="flex items-center justify-between mt-6 text-xs text-slate-400">
          <span>Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total}</span>
          <div className="flex gap-1.5">
            <button
              onClick={() => setPage(p => p - 1)}
              disabled={page === 1}
              className="p-1.5 border border-slate-200 rounded hover:bg-slate-50 bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page === pages}
              className="p-1.5 border border-slate-200 rounded hover:bg-slate-50 bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcements;
