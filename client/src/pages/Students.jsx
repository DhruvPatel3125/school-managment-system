import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useTenantTheme } from '../context/TenantThemeContext';
import { 
  Search, 
  UserPlus, 
  Printer, 
  Trash2, 
  GraduationCap, 
  School, 
  Contact, 
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5001`;

const Students = () => {
  const { tenant } = useTenantTheme();
  
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 25;

  // Admission Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [onboardedCredentials, setOnboardedCredentials] = useState(null);
  const [admissionNo, setAdmissionNo] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [availableSections, setAvailableSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // ID Card Modal State
  const [showIdCardModal, setShowIdCardModal] = useState(false);
  const [activeStudentForIdCard, setActiveStudentForIdCard] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const classesRes = await axios.get(`${API_URL}/api/v1/classes`);
      setClasses(classesRes.data.data);

      let studentsUrl = `${API_URL}/api/v1/students`;
      const params = [];
      if (selectedClassFilter) params.push(`classId=${selectedClassFilter}`);
      if (searchTerm) params.push(`search=${encodeURIComponent(searchTerm)}`);
      
      if (params.length > 0) {
        studentsUrl += `?${params.join('&')}`;
      }

      const studentsRes = await axios.get(studentsUrl);
      setStudents(studentsRes.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to retrieve students roster.');
    } finally {
      setLoading(false);
    }
  }, [selectedClassFilter, searchTerm]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleClassChangeInForm = (classId) => {
    setSelectedClassId(classId);
    const cls = classes.find(c => c._id === classId);
    if (cls && cls.sections) {
      setAvailableSections(cls.sections);
      setSelectedSection(cls.sections[0] || '');
    } else {
      setAvailableSections([]);
      setSelectedSection('');
    }
  };

  const openAdmissionModal = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setAdmissionNo(`ADM-2026-${randomNum}`);
    setName('');
    setEmail('');
    setDob('');
    setSelectedClassId(classes[0]?._id || '');
    if (classes[0]) {
      setAvailableSections(classes[0].sections || []);
      setSelectedSection(classes[0].sections[0] || '');
    } else {
      setAvailableSections([]);
      setSelectedSection('');
    }
    setParentName('');
    setParentPhone('');
    setProfileImageFile(null);
    setIsUploading(false);
    setError('');
    setOnboardedCredentials(null);
    setShowAddModal(true);
  };

  const handleAdmissionSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !selectedClassId || !selectedSection || !parentName || !parentPhone) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setIsUploading(true);
      let profileImageUrl = '';
      if (profileImageFile) {
        const formData = new FormData();
        formData.append('file', profileImageFile);
        const uploadRes = await axios.post(`${API_URL}/api/v1/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        });
        if (uploadRes.data.success) {
          profileImageUrl = uploadRes.data.url;
        }
      }

      const res = await axios.post(`${API_URL}/api/v1/students`, {
        admissionNo,
        name,
        email,
        dob: dob || undefined,
        classId: selectedClassId,
        section: selectedSection,
        parentName,
        parentPhone,
        profileImage: profileImageUrl
      }, { withCredentials: true });

      if (res.data.success && res.data.credentials) {
        setOnboardedCredentials(res.data.credentials);
      } else {
        setShowAddModal(false);
      }
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit admission form.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (studentId) => {
    if (!window.confirm('Are you sure you want to remove this student record permanently?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/v1/students/${studentId}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete student.');
    }
  };

  const openIdCard = (student) => {
    setActiveStudentForIdCard(student);
    setShowIdCardModal(true);
  };

  const handlePrintIdCard = () => {
    window.print();
  };

  const primaryBrandColor = tenant?.primaryColor || '#0D1B2A';

  // Pagination processing
  const total = students.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const paginatedStudents = students.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="space-y-6">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-id-card-area, #printable-id-card-area * {
            visibility: visible;
          }
          #printable-id-card-area {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%) scale(1.5);
          }
        }
      `}</style>

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Student Directory (SIS)</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage admissions, view student rosters, and generate identity cards.</p>
        </div>
        <button
          onClick={openAdmissionModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-white text-xs font-semibold rounded-lg shadow-sm hover:opacity-95 active:scale-95 transition-all"
          style={{ backgroundColor: primaryBrandColor }}
        >
          <UserPlus className="w-4 h-4" /> New Admission
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search by student name or Admission No..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-slate-500 bg-white placeholder-slate-400 text-slate-800 transition-all shadow-sm"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        </div>
        
        <div className="w-full sm:w-60">
          <select
            value={selectedClassFilter}
            onChange={(e) => { setSelectedClassFilter(e.target.value); setPage(1); }}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-slate-500 bg-white text-slate-800 transition-all shadow-sm"
          >
            <option value="">All Classes</option>
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && !showAddModal && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-medium flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* Student List View */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: primaryBrandColor }} />
          <p className="text-slate-400 text-xs">Loading students roster…</p>
        </div>
      ) : paginatedStudents.length === 0 ? (
        <div className="bg-white border border-slate-200 border-dashed text-center p-12 rounded-xl">
          <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-xs font-semibold text-slate-800 mb-1">No Students Found</h3>
          <p className="text-slate-400 text-xs max-w-sm mx-auto mb-4">Admit new students to this portal using the "New Admission" action.</p>
          <button
            onClick={openAdmissionModal}
            className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg transition-all inline-flex items-center gap-1.5 mx-auto"
          >
            <UserPlus className="w-3.5 h-3.5" /> Start New Admission
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-slate-50/75 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Admission No</th>
                  <th className="px-5 py-3">Student Name</th>
                  <th className="px-5 py-3">Class</th>
                  <th className="px-5 py-3">Section</th>
                  <th className="px-5 py-3">Guardian Details</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-[11px] font-semibold text-slate-900">{student.admissionNo}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center space-x-2.5">
                        {student.profileImage ? (
                          <img src={student.profileImage} alt="" className="w-7 h-7 rounded object-cover border border-slate-200" />
                        ) : (
                          <div className="w-7 h-7 rounded bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center font-semibold text-[10px] uppercase">
                            {student.name?.split(' ').map(n => n[0]).slice(0, 2).join('') || 'S'}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-slate-900 text-xs">{student.name}</div>
                          <div className="text-[10px] text-slate-400">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-700">
                      {student.classId ? student.classId.name : 'Unassigned'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        {student.section}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-800 text-xs">{student.parentName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{student.parentPhone}</div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex justify-end items-center gap-1.5">
                        <button
                          onClick={() => openIdCard(student)}
                          className="px-2 py-1 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded text-[10px] font-semibold flex items-center gap-1 shadow-sm transition-colors"
                        >
                          <Contact className="w-3 h-3 text-slate-400" /> <span>ID Card</span>
                        </button>
                        <button
                          onClick={() => handleDelete(student._id)}
                          className="p-1 text-slate-300 hover:text-red-600 hover:bg-rose-50 rounded transition-colors"
                          title="Delete Record"
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
        </div>
      )}

      {/* Pagination Controls */}
      {total > perPage && (
        <div className="flex items-center justify-between mt-4 text-xs text-slate-400">
          <span>Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total}</span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(p => p - 1)}
              disabled={page === 1}
              className="p-1 border border-slate-200 rounded hover:bg-slate-50 bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page === pages}
              className="p-1 border border-slate-200 rounded hover:bg-slate-50 bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Admission Form Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300">
          <div className="w-full max-w-md bg-white rounded-xl p-5 border border-slate-200 shadow-xl relative">
            {onboardedCredentials ? (
              <div className="text-center py-4 space-y-4">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Admission Completed</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Student portal credentials have been provisioned.</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-left text-xs space-y-2">
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Username / Email</span>
                    <strong className="text-slate-800 select-all font-mono">{onboardedCredentials.email}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Default Password</span>
                    <strong className="text-slate-800 select-all font-mono">{onboardedCredentials.password}</strong>
                  </div>
                </div>
                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => {
                      setOnboardedCredentials(null);
                      setShowAddModal(false);
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
                  <UserPlus className="w-4 h-4 text-slate-500" /> Admit New Student
                </h3>

                {error && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-[11px] font-medium mb-3 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {error}
                  </div>
                )}

                <form onSubmit={handleAdmissionSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Admission Number
                    </label>
                    <input
                      type="text"
                      value={admissionNo}
                      onChange={(e) => setAdmissionNo(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-slate-500 bg-white text-slate-800 transition-all font-mono shadow-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Student Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul Patel"
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
                      placeholder="e.g. rahul@school.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-slate-500 bg-white placeholder-slate-400 text-slate-800 transition-all shadow-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-slate-500 bg-white text-slate-800 transition-all shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Assign Class
                    </label>
                    <select
                      value={selectedClassId}
                      onChange={(e) => handleClassChangeInForm(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-slate-500 bg-white text-slate-800 transition-all shadow-sm"
                      required
                    >
                      <option value="" disabled>Select Class</option>
                      {classes.map((cls) => (
                        <option key={cls._id} value={cls._id}>{cls.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Select Section
                    </label>
                    <select
                      value={selectedSection}
                      onChange={(e) => setSelectedSection(e.target.value)}
                      disabled={availableSections.length === 0}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-slate-500 bg-white text-slate-800 transition-all shadow-sm disabled:opacity-55"
                      required
                    >
                      {availableSections.map((sec) => (
                        <option key={sec} value={sec}>Section {sec}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Parent / Guardian Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Patel"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-slate-500 bg-white placeholder-slate-400 text-slate-800 transition-all shadow-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Parent Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-slate-500 bg-white placeholder-slate-400 text-slate-800 transition-all shadow-sm"
                      required
                    />
                  </div>

                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Profile Photo (Optional)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setProfileImageFile(e.target.files[0])}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-slate-500 bg-white text-slate-800 transition-all shadow-sm"
                    />
                  </div>

                  <div className="col-span-1 sm:col-span-2 flex justify-end gap-2 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 font-semibold text-xs transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUploading}
                      className="px-3.5 py-1.5 text-white rounded-lg font-semibold text-xs transition-all shadow-sm disabled:opacity-50"
                      style={{ backgroundColor: primaryBrandColor }}
                    >
                      {isUploading ? 'Registering...' : 'Admit Student'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* ID Card Modal */}
      {showIdCardModal && activeStudentForIdCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300">
          <div className="w-full max-w-sm bg-white rounded-xl p-5 shadow-xl relative flex flex-col items-center">
            
            {/* ID Card View */}
            <div id="printable-id-card-area" className="w-[280px] h-[400px] bg-white border border-slate-200 rounded-xl flex flex-col shadow-md relative overflow-hidden font-sans">
              {/* Header */}
              <div className="h-20 w-full relative flex flex-col items-center justify-center text-white px-3" style={{ backgroundColor: primaryBrandColor }}>
                <div className="absolute inset-0 bg-white/5" style={{ backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, rgba(255,255,255,0.1) 1.5px, transparent 0)', backgroundSize: '12px 12px' }}></div>
                <div className="relative z-10 flex items-center gap-2 w-full justify-center">
                  {tenant?.logoUrl ? (
                    <img src={tenant.logoUrl} alt="" className="w-8 h-8 rounded-full border border-white/50 object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-white/10 border border-white/50 flex items-center justify-center">
                      <School className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className="text-left min-w-0">
                    <h4 className="text-[11px] font-bold uppercase truncate leading-none">{tenant?.schoolName || 'EduCore School'}</h4>
                    <span className="text-[8px] text-white/80 font-bold uppercase tracking-wider block mt-1">Identity Card</span>
                  </div>
                </div>
              </div>

              {/* Photo & Badge */}
              <div className="relative flex flex-col items-center px-4 mt-[-28px]">
                {activeStudentForIdCard.profileImage ? (
                  <img 
                    src={activeStudentForIdCard.profileImage} 
                    alt="" 
                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-sm bg-white"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-slate-100 text-slate-400 border-4 border-white shadow-sm flex items-center justify-center font-bold text-lg uppercase">
                    {activeStudentForIdCard.name?.split(' ').map(n => n[0]).slice(0, 2).join('') || 'S'}
                  </div>
                )}
                
                <h3 className="text-sm font-bold text-slate-900 mt-2 text-center truncate w-full">{activeStudentForIdCard.name}</h3>
                <span className="px-2 py-0.5 mt-1 rounded bg-slate-100 text-slate-700 text-[9px] font-bold border border-slate-200">
                  Grade {activeStudentForIdCard.classId?.name} - {activeStudentForIdCard.section}
                </span>
              </div>

              {/* Roster Fields */}
              <div className="flex-1 px-4 py-2 flex flex-col justify-center">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 font-semibold uppercase">Admission No</span>
                    <span className="font-semibold text-slate-800 font-mono">{activeStudentForIdCard.admissionNo}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 font-semibold uppercase">DOB</span>
                    <span className="font-semibold text-slate-800">{activeStudentForIdCard.dob ? new Date(activeStudentForIdCard.dob).toLocaleDateString() : '—'}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 font-semibold uppercase">Guardian</span>
                    <span className="font-semibold text-slate-800">{activeStudentForIdCard.parentName}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 font-semibold uppercase">Emergency</span>
                    <span className="font-semibold text-slate-800 font-mono">{activeStudentForIdCard.parentPhone}</span>
                  </div>
                </div>
              </div>

              {/* Valid Footer */}
              <div className="h-9 bg-slate-950 w-full flex items-center justify-between px-4 text-[8px] text-slate-400 font-semibold uppercase">
                <span>Valid: 2026-27</span>
                <span className="text-emerald-400">● Active</span>
              </div>
            </div>

            {/* Print action controls */}
            <div className="mt-5 flex w-full gap-2 justify-center">
              <button
                type="button"
                onClick={() => setShowIdCardModal(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg font-bold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePrintIdCard}
                className="px-4 py-2 text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
                style={{ backgroundColor: primaryBrandColor }}
              >
                <Printer className="w-3.5 h-3.5" /> Print Card
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
