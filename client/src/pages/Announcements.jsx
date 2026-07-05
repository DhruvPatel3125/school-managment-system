import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Bell, Plus, Trash2, Tag, Calendar, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5001`;

const Announcements = () => {
  const { user } = useAuth();
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

  const fetchAnnouncements = async () => {
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
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title || !description) return;
    
    try {
      setSubmitting(true);
      await axios.post(`${API_URL}/api/v1/announcements`, { title, description, tag });
      
      // Reset form and refetch
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

  const getTagColor = (tag) => {
    switch (tag) {
      case 'HOLIDAY': return 'text-rose-600 bg-rose-50 border-rose-200';
      case 'EXAM': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'EVENT': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'ACADEMIC': return 'text-violet-600 bg-violet-50 border-violet-200';
      case 'FEES': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200'; // NOTICE
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800">Announcements</h1>
            <p className="text-xs font-medium text-slate-500 mt-0.5">Official notices and updates from the school</p>
          </div>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition-all shadow-sm active:scale-95"
          >
            {showForm ? 'Cancel' : <><Plus className="w-4 h-4" /> New Announcement</>}
          </button>
        )}
      </div>

      {/* Create Form */}
      {isAdmin && showForm && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4">Post New Notice</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-all"
                  placeholder="e.g. Summer Vacation Dates"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tag</label>
                <select
                  value={tag}
                  onChange={e => setTag(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-all"
                >
                  <option value="NOTICE">Notice</option>
                  <option value="HOLIDAY">Holiday</option>
                  <option value="EXAM">Exam</option>
                  <option value="EVENT">Event</option>
                  <option value="ACADEMIC">Academic</option>
                  <option value="FEES">Fees</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
              <textarea
                required
                rows="3"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-all resize-none"
                placeholder="Details of the announcement..."
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-bold rounded-xl transition-all shadow-sm"
              >
                {submitting ? 'Posting...' : 'Post Announcement'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-3 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-slate-400 text-sm font-medium mt-3">Loading announcements...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="py-16 bg-white border border-slate-200 border-dashed rounded-2xl text-center">
            <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">No Announcements Yet</h3>
            <p className="text-xs text-slate-400 mt-1">Check back later for updates from the school.</p>
          </div>
        ) : (
          announcements.map((ann) => (
            <div key={ann._id} className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow group">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getTagColor(ann.tag)}`}>
                      {ann.tag}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(ann.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-800">{ann.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{ann.description}</p>
                  <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 pt-2">
                    <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                      {ann.createdBy?.name?.charAt(0) || 'A'}
                    </div>
                    Posted by {ann.createdBy?.name || 'Admin'}
                  </div>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(ann._id)}
                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
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
    </div>
  );
};

export default Announcements;
