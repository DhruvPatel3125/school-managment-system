import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTenantTheme } from '../context/TenantThemeContext';
import {
  BookOpen, Plus, Edit2, Trash2, Users,
  CheckCircle2, X
} from 'lucide-react';

import { API_URL } from '../config/api';

const Classes = () => {
  const { tenant } = useTenantTheme();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [className, setClassName] = useState('');
  const [sectionsInput, setSectionsInput] = useState('A, B');

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get(`${API_URL}/api/v1/classes`);
      setClasses(res.data.data || []);
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
    setSectionsInput(cls.sections ? cls.sections.join(', ') : 'A, B');
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
        await axios.put(`${API_URL}/api/v1/classes/${editingClass._id}`, {
          name: className.trim(),
          sections
        });
      } else {
        await axios.post(`${API_URL}/api/v1/classes`, {
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
    if (!window.confirm('Are you sure you want to delete this class? Associated student records might lose their class reference.')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/v1/classes/${classId}`);
      fetchClasses();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete class.');
    }
  };

  const totalSections = classes.reduce((sum, c) => sum + (c.sections ? c.sections.length : 0), 0);

  return (
    <div className="space-y-6 animate-fade-in pb-12">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <BookOpen className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Academic Setup & Classes
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Configure grade levels, section offerings, and classroom structure for {tenant?.schoolName || 'EduCore School'}.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#C4613A] hover:bg-[#b0532e] active:scale-95 text-white font-bold text-xs shadow-md transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Grade / Class</span>
        </button>
      </div>

      {/* ── Summary Metrics Bar ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Configured Grades</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{classes.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#C4613A]/10 text-[#C4613A] flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Sections</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{totalSections}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Enrolled Roster Capacity</p>
            <p className="text-2xl font-black text-slate-900 mt-1">1,200 Max</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── Content Grid / List ── */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : classes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No Classes Configured Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Click "+ Add Grade / Class" above to set up grade levels and section offerings.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <div
              key={cls._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 font-extrabold flex items-center justify-center text-sm border border-indigo-100">
                      {cls.name.substring(0, 3)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {cls.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {cls.sections ? cls.sections.length : 0} Configured Sections
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(cls)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      title="Edit Class"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cls._id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Class"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Sections List Chips */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Sections Offered
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {cls.sections && cls.sections.map((sec) => (
                      <span
                        key={sec}
                        className="px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Section {sec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                <span>Curriculum Sync Active</span>
                <span className="text-indigo-600 font-bold">Standard Syllabus</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Add/Edit Modal Drawer Overlay ── */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-fade-in space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                {editingClass ? 'Edit Grade / Class' : 'Add New Grade / Class'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Grade / Class Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Class 10"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Sections (Comma Separated)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. A, B, C"
                  value={sectionsInput}
                  onChange={(e) => setSectionsInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
                <p className="text-[10px] text-slate-400 mt-1">Separate multiple sections with commas (e.g. A, B, C)</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs shadow-md transition-all"
                >
                  {editingClass ? 'Update Class' : 'Create Class'}
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
