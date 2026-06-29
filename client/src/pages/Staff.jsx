import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Staff = () => {
  const { user: currentUser } = useAuth();
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [employeeId, setEmployeeId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [designation, setDesignation] = useState('Teacher');
  const [department, setDepartment] = useState('Mathematics');

  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get('http://localhost:5001/api/v1/staff');
      setStaffList(res.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to retrieve staff roster.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const openAddModal = () => {
    const randomNum = Math.floor(100 + Math.random() * 900);
    setEditingStaff(null);
    setEmployeeId(`EMP-STA-${randomNum}`);
    setName('');
    setEmail('');
    setDesignation('Teacher');
    setDepartment('Mathematics');
    setError('');
    setShowModal(true);
  };

  const openEditModal = (staff) => {
    setEditingStaff(staff);
    setEmployeeId(staff.employeeId);
    setName(staff.name);
    setEmail(staff.email);
    setDesignation(staff.designation);
    setDepartment(staff.department);
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !designation || !department) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      if (editingStaff) {
        // Edit Mode
        await axios.put(`http://localhost:5001/api/v1/staff/${editingStaff._id}`, {
          name,
          email,
          designation,
          department
        });
      } else {
        // Add Mode
        await axios.post('http://localhost:5001/api/v1/staff', {
          employeeId,
          name,
          email,
          designation,
          department
        });
      }
      setShowModal(false);
      fetchStaff();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save staff record.');
    }
  };

  const handleDelete = async (staffId) => {
    if (!window.confirm('Are you sure you want to remove this employee from the directory?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5001/api/v1/staff/${staffId}`);
      fetchStaff();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete staff record.');
    }
  };

  const isPrincipal = currentUser?.role === 'school_admin';

  return (
    <div className="space-y-6">
      {/* Header details */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Staff Directory</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">View and manage profile cards for teachers, principals, and administrative staff.</p>
        </div>
        {isPrincipal && (
          <button
            onClick={openAddModal}
            className="px-4 py-2.5 bg-primary hover:opacity-90 active:scale-95 text-white font-semibold text-sm rounded-lg shadow-lg transition-all flex items-center gap-2"
          >
            <span>👨‍🏫</span> Onboard Employee
          </button>
        )}
      </div>

      {error && !showModal && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-sm font-medium">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="w-10 h-10 border-4 border-slate-800 border-t-primary rounded-full animate-spin"></div>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider animate-pulse">Loading Staff...</p>
        </div>
      ) : staffList.length === 0 ? (
        <div className="glass-card text-center p-12 border border-slate-200 dark:border-slate-800 rounded-xl">
          <span className="text-5xl block mb-4">👨‍🏫</span>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No Staff Registered</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto mb-6">Onboard teachers or administrators to set up your school department roster.</p>
          {isPrincipal && (
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-sm rounded-lg transition-all"
            >
              Add First Staff Member
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staffList.map((staff) => (
            <div 
              key={staff._id} 
              className="glass-card hover-scale p-6 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-sm relative flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-primary/15 text-primary border border-primary/20 flex items-center justify-center font-bold text-lg uppercase shadow-inner">
                      {staff.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{staff.name}</h3>
                      <span className="text-xs text-slate-400 font-semibold uppercase tracking-wide">{staff.designation}</span>
                    </div>
                  </div>

                  {isPrincipal && (
                    <div className="flex gap-1">
                      <button 
                        onClick={() => openEditModal(staff)}
                        className="p-1 text-slate-400 hover:text-primary dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-all"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => handleDelete(staff._id)}
                        className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded transition-all"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-5 space-y-2 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>Employee ID:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{staff.employeeId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Department:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{staff.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Email Address:</span>
                    <span className="text-slate-800 dark:text-slate-300">{staff.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Joining Date:</span>
                    <span>{new Date(staff.joiningDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-100 dark:border-slate-700/50 pt-4 flex justify-between items-center text-xs text-slate-400">
                <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active Duty
                </span>
                <span>ID: {staff._id.slice(-6).toUpperCase()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Onboard / Edit Staff Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-2xl relative">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              {editingStaff ? '✏️ Edit Staff Record' : '👨‍🏫 Onboard New Employee'}
            </h3>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs font-medium mb-4">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                  Employee ID
                </label>
                <input
                  type="text"
                  value={employeeId}
                  disabled={!!editingStaff} // ID cannot be updated after onboarding
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all disabled:opacity-55"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Anil Mehta"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. anil@schoola.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                    Designation
                  </label>
                  <select
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  >
                    <option value="Teacher" className="dark:bg-slate-800">Teacher</option>
                    <option value="Principal" className="dark:bg-slate-800">Principal</option>
                    <option value="Accountant" className="dark:bg-slate-800">Accountant</option>
                    <option value="Registrar" className="dark:bg-slate-800">Registrar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  >
                    <option value="Mathematics" className="dark:bg-slate-800">Mathematics</option>
                    <option value="Science" className="dark:bg-slate-800">Science</option>
                    <option value="English Lit." className="dark:bg-slate-800">English Lit.</option>
                    <option value="Administration" className="dark:bg-slate-800">Administration</option>
                    <option value="Finance" className="dark:bg-slate-800">Finance</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-semibold text-xs transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:opacity-90 active:scale-95 text-white rounded-lg font-semibold text-xs transition-all shadow-md"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Staff;
