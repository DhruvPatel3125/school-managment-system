import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Users2, 
  Mail, 
  Briefcase, 
  Calendar, 
  AlertTriangle, 
  UserCheck,
  CheckCircle
} from 'lucide-react';

const Staff = () => {
  const { user: currentUser } = useAuth();
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [onboardedCredentials, setOnboardedCredentials] = useState(null);
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
    setOnboardedCredentials(null);
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
    setOnboardedCredentials(null);
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
        setShowModal(false);
      } else {
        // Add Mode
        const res = await axios.post('http://localhost:5001/api/v1/staff', {
          employeeId,
          name,
          email,
          designation,
          department
        });
        if (res.data.success && res.data.credentials) {
          setOnboardedCredentials(res.data.credentials);
        } else {
          setShowModal(false);
        }
      }
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
            <Plus className="w-4 h-4" /> Onboard Employee
          </button>
        )}
      </div>

      {error && !showModal && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-sm font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="w-10 h-10 border-4 border-slate-800 border-t-primary rounded-full animate-spin"></div>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider animate-pulse">Loading Staff...</p>
        </div>
      ) : staffList.length === 0 ? (
        <div className="glass-card text-center p-12 border border-slate-200 dark:border-slate-800 rounded-xl">
          <Users2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No Staff Registered</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto mb-6">Onboard teachers or administrators to set up your school department roster.</p>
          {isPrincipal && (
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-sm rounded-lg transition-all flex items-center gap-1.5 mx-auto"
            >
              <Plus className="w-4 h-4" /> Add First Staff Member
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
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(staff._id)}
                        className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded transition-all"
                      >
                        <Trash2 className="w-4 h-4 text-rose-500" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-5 space-y-2.5 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Employee ID:</span>
                    <span className="font-bold text-slate-950 dark:text-slate-200">{staff.employeeId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 flex items-center gap-1"><Briefcase className="w-3.5 h-3.5 text-slate-450" /> Department:</span>
                    <span className="font-semibold text-slate-950 dark:text-slate-200">{staff.department}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-slate-450" /> Email Address:</span>
                    <span className="text-slate-800 dark:text-slate-350">{staff.email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-450" /> Joining Date:</span>
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
            {onboardedCredentials ? (
              <div className="text-center py-4 space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Onboarding Successful</h3>
                  <p className="text-xs text-slate-500 mt-1">Employee portal login credentials have been generated automatically.</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-xl p-4 text-left text-sm space-y-2">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Portal Username (Email)</span>
                    <strong className="text-slate-800 dark:text-slate-200 select-all font-mono">{onboardedCredentials.email}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Temporary Password</span>
                    <strong className="text-slate-800 dark:text-slate-200 select-all font-mono">{onboardedCredentials.password}</strong>
                  </div>
                </div>
                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => {
                      setOnboardedCredentials(null);
                      setShowModal(false);
                    }}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-555 text-white rounded-lg text-xs font-semibold shadow transition-all active:scale-95"
                  >
                    Copy & Close
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  {editingStaff ? <Edit2 className="w-5 h-5 text-indigo-500" /> : <Users2 className="w-5 h-5 text-indigo-500" />}
                  {editingStaff ? 'Edit Staff Record' : 'Onboard New Employee'}
                </h3>

                {error && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs font-medium mb-4 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" /> {error}
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
                      disabled={!!editingStaff}
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
                      className="px-4 py-2 bg-primary hover:opacity-90 active:scale-95 text-white rounded-lg font-semibold text-xs transition-all shadow-md flex items-center gap-1"
                    >
                      <UserCheck className="w-4 h-4" /> Save Record
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Staff;
