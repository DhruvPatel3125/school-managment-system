import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTenantTheme } from '../context/TenantThemeContext';
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
  CheckCircle,
  Search
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5001`;

const Staff = () => {
  const { user: currentUser } = useAuth();
  const { tenant } = useTenantTheme();
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');

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
      const res = await axios.get(`${API_URL}/api/v1/staff`);
      setStaffList(res.data.data || []);
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

    if (!name.trim() || !email.trim() || !designation || !department) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      if (editingStaff) {
        await axios.put(`${API_URL}/api/v1/staff/${editingStaff._id}`, {
          name: name.trim(),
          email: email.trim(),
          designation,
          department
        });
        setShowModal(false);
      } else {
        const res = await axios.post(`${API_URL}/api/v1/staff`, {
          employeeId,
          name: name.trim(),
          email: email.trim(),
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
      await axios.delete(`${API_URL}/api/v1/staff/${staffId}`);
      fetchStaff();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete staff record.');
    }
  };

  const isPrincipal = currentUser?.role === 'school_admin';
  const primaryBrandColor = tenant?.primaryColor || '#0D1B2A';

  // Departments List
  const departments = ['ALL', 'Mathematics', 'Science', 'English Lit.', 'Administration', 'Finance'];

  // Filter logic
  const filteredStaff = staffList.filter(s => {
    const q = searchTerm.toLowerCase();
    if (q && !s.name?.toLowerCase().includes(q) && !s.employeeId?.toLowerCase().includes(q)) return false;
    if (selectedDeptFilter !== 'ALL' && s.department !== selectedDeptFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header details */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Staff Directory</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage details of faculty members, teachers, and administrative personnel.</p>
        </div>
        {isPrincipal && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-white text-xs font-semibold rounded-lg shadow-sm hover:opacity-95 active:scale-95 transition-all"
            style={{ backgroundColor: primaryBrandColor }}
          >
            <Plus className="w-4 h-4" /> Onboard Employee
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm items-center">
        <div className="sm:col-span-2 relative">
          <input
            type="text"
            placeholder="Search by staff name or employee ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-slate-500 bg-white placeholder-slate-400 text-slate-800 transition-all shadow-sm"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        </div>
        <div>
          <select
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-slate-500 bg-white text-slate-800 transition-all shadow-sm"
          >
            {departments.map(d => (
              <option key={d} value={d}>{d === 'ALL' ? 'All Departments' : d}</option>
            ))}
          </select>
        </div>
      </div>

      {error && !showModal && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="w-8 h-8 rounded-full border-2 border-slate-200 animate-spin" style={{ borderTopColor: primaryBrandColor }} />
          <p className="text-slate-400 text-xs">Loading staff roster…</p>
        </div>
      ) : filteredStaff.length === 0 ? (
        <div className="bg-white border border-slate-200 border-dashed text-center p-12 rounded-xl">
          <Users2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-xs font-semibold text-slate-800 mb-1">No Employees Found</h3>
          <p className="text-slate-400 text-xs max-w-sm mx-auto mb-4">Admit and register new staff directory records using the "Onboard Employee" button.</p>
          {isPrincipal && (
            <button
              onClick={openAddModal}
              className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg transition-all inline-flex items-center gap-1.5 mx-auto"
            >
              <Plus className="w-3.5 h-3.5" /> Add Faculty Member
            </button>
          )}
        </div>
      ) : (
        /* Flat and Densified Grid System */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStaff.map((staff) => (
            <div 
              key={staff._id} 
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                      {staff.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 text-xs leading-none">{staff.name}</h3>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mt-1">{staff.designation}</span>
                    </div>
                  </div>

                  {isPrincipal && (
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => openEditModal(staff)}
                        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(staff._id)}
                        className="p-1 text-slate-300 hover:text-red-600 hover:bg-rose-50 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-4 space-y-2 text-xs border-t border-slate-100 pt-3">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Employee ID</span>
                    <span className="font-bold text-slate-800 font-mono">{staff.employeeId}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400 flex items-center gap-1"><Briefcase className="w-3 h-3 text-slate-400" /> Dept.</span>
                    <span className="font-semibold text-slate-850">{staff.department}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400 flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" /> Email</span>
                    <span className="text-slate-700">{staff.email}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400 flex items-center gap-1"><Calendar className="w-3 h-3 text-slate-400" /> Joining Date</span>
                    <span className="text-slate-600">{new Date(staff.joiningDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 border-t border-slate-100 pt-3 flex justify-between items-center text-[10px]">
                <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                </span>
                <span className="font-mono text-slate-300">ID: {staff._id.slice(-6).toUpperCase()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Onboard / Edit Staff Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300">
          <div className="w-full max-w-md bg-white rounded-xl p-5 border border-slate-200 shadow-xl relative">
            {onboardedCredentials ? (
              <div className="text-center py-4 space-y-4">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Onboarding Successful</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Staff login credentials have been generated.</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-left text-xs space-y-2">
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Portal Username / Email</span>
                    <strong className="text-slate-800 select-all font-mono">{onboardedCredentials.email}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Temporary Password</span>
                    <strong className="text-slate-800 select-all font-mono">{onboardedCredentials.password}</strong>
                  </div>
                </div>
                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => {
                      setOnboardedCredentials(null);
                      setShowModal(false);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                  {editingStaff ? 'Edit Staff Record' : 'Onboard New Employee'}
                </h3>

                {error && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-[11px] font-medium mb-3 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Employee ID
                    </label>
                    <input
                      type="text"
                      value={employeeId}
                      disabled={!!editingStaff}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-slate-500 bg-white text-slate-800 transition-all font-mono shadow-sm disabled:opacity-55"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. Anil Mehta"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-slate-500 bg-white placeholder-slate-400 text-slate-800 transition-all shadow-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. anil@school.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-slate-500 bg-white placeholder-slate-400 text-slate-800 transition-all shadow-sm"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Designation
                      </label>
                      <select
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-slate-500 bg-white text-slate-800 transition-all shadow-sm"
                      >
                        <option value="Teacher">Teacher</option>
                        <option value="Principal">Principal</option>
                        <option value="Accountant">Accountant</option>
                        <option value="Registrar">Registrar</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Department
                      </label>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-slate-500 bg-white text-slate-800 transition-all shadow-sm"
                      >
                        <option value="Mathematics">Mathematics</option>
                        <option value="Science">Science</option>
                        <option value="English Lit.">English Lit.</option>
                        <option value="Administration">Administration</option>
                        <option value="Finance">Finance</option>
                      </select>
                    </div>
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
                      <UserCheck className="w-3.5 h-3.5 inline-block mr-1" /> Save Employee
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
