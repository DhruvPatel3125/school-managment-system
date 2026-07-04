import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, BookOpen, AlertTriangle } from 'lucide-react';

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form states
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [className, setClassName] = useState('');
  const [sectionsInput, setSectionsInput] = useState('A, B');

  // Fetch classes from backend API
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
        // Edit Mode
        await axios.put(`http://localhost:5001/api/v1/classes/${editingClass._id}`, {
          name: className.trim(),
          sections
        });
      } else {
        // Add Mode
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

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 ">Classes & Sections</h2>
          <p className="text-sm text-slate-500 ">Configure academic class categories and sections for your school tenant.</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-primary hover:opacity-90 active:scale-95 text-white font-semibold text-sm rounded-lg shadow-lg transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Class
        </button>
      </div>

      {error && !showModal && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-sm font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="w-10 h-10 border-4 border-slate-800 border-t-primary rounded-full animate-spin"></div>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider animate-pulse">Loading Classes...</p>
        </div>
      ) : classes.length === 0 ? (
        <div className="glass-card text-center p-12 border border-slate-200  rounded-xl">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900  mb-1">No Classes Configured</h3>
          <p className="text-slate-500  text-sm max-w-sm mx-auto mb-6">Create classes like "Class 10" or "Grade 6" to begin admitting students under them.</p>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-sm rounded-lg transition-all flex items-center gap-1.5 mx-auto"
          >
            <Plus className="w-4 h-4" /> Create Your First Class
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <div 
              key={cls._id} 
              className="glass-card hover-scale p-6 rounded-xl border border-slate-200  shadow-sm relative flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold text-slate-900 ">{cls.name}</h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => openEditModal(cls)}
                      className="p-1.5 text-slate-400 hover:text-primary :text-white hover:bg-slate-100 :bg-slate-700 rounded transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(cls._id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 :bg-rose-950/20 rounded transition-all"
                    >
                      <Trash2 className="w-4 h-4 text-rose-500" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-4">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Sections</span>
                  <div className="flex flex-wrap gap-2">
                    {cls.sections.map((sec) => (
                      <span 
                        key={sec} 
                        className="px-2.5 py-1 rounded-md text-xs font-bold bg-primary/10 text-primary border border-primary/20"
                      >
                        Section {sec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-100  pt-4 flex justify-between items-center text-xs text-slate-400">
                <span>Configured Academic Portal</span>
                <span>ID: {cls._id.slice(-6).toUpperCase()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Elegant Slide-over / Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300">
          <div className="w-full max-w-md bg-white  rounded-2xl p-6 border border-slate-200  shadow-2xl relative">
            <h3 className="text-lg font-bold text-slate-900  mb-4 flex items-center gap-2">
              {editingClass ? <Edit2 className="w-5 h-5 text-indigo-500" /> : <BookOpen className="w-5 h-5 text-indigo-500" />}
              {editingClass ? 'Edit Class Configuration' : 'Add New Class'}
            </h3>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs font-medium mb-4 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400  uppercase tracking-wider mb-1">
                  Class Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Class 10, Grade 6"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300  bg-transparent text-slate-900  placeholder-slate-400 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400  uppercase tracking-wider mb-1">
                  Sections (Comma Separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. A, B, C"
                  value={sectionsInput}
                  onChange={(e) => setSectionsInput(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300  bg-transparent text-slate-900  placeholder-slate-400 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Specify multiple sections separated by a comma (e.g. A, B, C).</span>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 ">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200  hover:bg-slate-50 :bg-slate-700 rounded-lg text-slate-700  font-semibold text-xs transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:opacity-90 active:scale-95 text-white rounded-lg font-semibold text-xs transition-all shadow-md flex items-center gap-1"
                >
                  Save Configuration
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
