import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTenantTheme } from '../context/TenantThemeContext';
import { Plus, Edit2, Trash2, BookOpen, AlertTriangle, Loader2 } from 'lucide-react';

const Classes = () => {
  const { tenant } = useTenantTheme();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form states
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [className, setClassName] = useState('');
  const [sectionsInput, setSectionsInput] = useState('A, B');

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get('http://localhost:5001/api/v1/classes');
      setClasses(res.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch classes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const openAddModal = () => {
    setEditingClass(null);
    setClassName('');
    setSectionsInput('A, B');
    setShowModal(true);
  };

  const openEditModal = (cls) => {
    setEditingClass(cls);
    setClassName(cls.name);
    setSectionsInput(cls.sections.join(', '));
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!className.trim()) {
      setError('Class name is required.');
      return;
    }

    const sections = sectionsInput
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter((s) => s.length > 0);

    if (sections.length === 0) {
      setError('At least one section must be specified.');
      return;
    }

    try {
      if (editingClass) {
        await axios.put(`http://localhost:5001/api/v1/classes/${editingClass._id}`, {
          name: className.trim(),
          sections
        });
      } else {
        await axios.post('http://localhost:5001/api/v1/classes', {
          name: className.trim(),
          sections
        });
      }
      setShowModal(false);
      fetchClasses();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save class.');
    }
  };

  const handleDelete = async (classId) => {
    if (!window.confirm('Are you sure you want to delete this class? All associated student records might lose their class reference.')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5001/api/v1/classes/${classId}`);
      fetchClasses();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete class.');
    }
  };

  const primaryBrandColor = tenant?.primaryColor || '#0D1B2A';

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Classes & Sections</h2>
          <p className="text-xs text-slate-500 mt-0.5">Configure academic classes, section partitions, and cohort streams.</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-white text-xs font-semibold rounded-lg shadow-sm hover:opacity-95 active:scale-95 transition-all"
          style={{ backgroundColor: primaryBrandColor }}
        >
          <Plus className="w-4 h-4" /> Add Class
        </button>
      </div>

      {error && !showModal && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: primaryBrandColor }} />
          <p className="text-slate-400 text-xs">Loading classes directory…</p>
        </div>
      ) : classes.length === 0 ? (
        <div className="bg-white border border-slate-200 border-dashed text-center p-12 rounded-xl">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-xs font-semibold text-slate-800 mb-1">No Classes Configured</h3>
          <p className="text-slate-400 text-xs max-w-sm mx-auto mb-4">Create classes like "Class 10" or "Grade 6" to begin admitting students under them.</p>
          <button
            onClick={openAddModal}
            className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg transition-all inline-flex items-center gap-1.5 mx-auto"
          >
            <Plus className="w-3.5 h-3.5" /> Create Your First Class
          </button>
        </div>
      ) : (
        /* Scalable Data Roster List (Not loud bloated cards) */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="px-5 py-3">Class / Grade</th>
                <th className="px-5 py-3">Allocated Sections</th>
                <th className="px-5 py-3">Reference ID</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classes.map((cls) => (
                <tr key={cls._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-slate-900 text-sm">{cls.name}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {cls.sections.map((sec) => (
                        <span 
                          key={sec} 
                          className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 border border-slate-200 text-slate-600 hover:border-slate-300 transition-colors"
                        >
                          Section {sec}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-[11px] text-slate-400">{cls._id.slice(-8).toUpperCase()}</td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button 
                        onClick={() => openEditModal(cls)}
                        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded transition-colors"
                        title="Edit Class"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(cls._id)}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-rose-50 rounded transition-colors"
                        title="Delete Class"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Redesigned clean dialog modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300">
          <div className="w-full max-w-md bg-white rounded-xl p-5 border border-slate-200 shadow-xl relative">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              {editingClass ? 'Edit Class' : 'Add New Class'}
            </h3>

            {error && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-[11px] font-medium mb-3 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Class Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Class 10, Grade 6"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-slate-500 bg-white placeholder-slate-400 text-slate-800 transition-all shadow-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Sections (Comma Separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. A, B, C"
                  value={sectionsInput}
                  onChange={(e) => setSectionsInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-slate-500 bg-white placeholder-slate-400 text-slate-800 transition-all shadow-sm"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Specify multiple sections separated by a comma (e.g. A, B, C).</span>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 font-semibold text-xs transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-white rounded-lg font-semibold text-xs transition-all shadow-sm"
                  style={{ backgroundColor: primaryBrandColor }}
                >
                  Save Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Classes;
