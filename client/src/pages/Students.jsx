import React, { useState, useEffect } from 'react';
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
  CheckCircle
} from 'lucide-react';

const Students = () => {
  const { tenant } = useTenantTheme();
  
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('');

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

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch classes for dropdowns
      const classesRes = await axios.get('http://localhost:5001/api/v1/classes');
      setClasses(classesRes.data.data);

      // Fetch students with active filters
      let studentsUrl = 'http://localhost:5001/api/v1/students';
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
  };

  useEffect(() => {
    fetchData();
  }, [selectedClassFilter, searchTerm]);

  // Handle class selection inside admission form to load its sections dynamically
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
    // Generate a default random admission number for convenience
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
        const uploadRes = await axios.post('http://localhost:5001/api/v1/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        });
        if (uploadRes.data.success) {
          profileImageUrl = uploadRes.data.url;
        }
      }

      const res = await axios.post('http://localhost:5001/api/v1/students', {
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
      await axios.delete(`http://localhost:5001/api/v1/students/${studentId}`);
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

  return (
    <div className="space-y-6">
      {/* Printable CSS to hide everything except ID card during browser print */}
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 ">Student Directory (SIS)</h2>
          <p className="text-sm text-slate-500 ">View profile information, admit new students, and generate official ID cards.</p>
        </div>
        <button
          onClick={openAdmissionModal}
          className="px-4 py-2.5 bg-primary hover:opacity-90 active:scale-95 text-white font-semibold text-sm rounded-lg shadow-lg transition-all flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" /> New Admission
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white  p-4 rounded-xl border border-slate-200  shadow-sm">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search by student name or Admission No..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300  bg-transparent text-slate-900  placeholder-slate-400 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        </div>
        
        <div className="w-full sm:w-60">
          <select
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300  bg-transparent text-slate-900  text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          >
            <option value="" className="">All Classes</option>
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id} className="">
                {cls.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && !showAddModal && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-sm font-medium flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Student List View */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="w-10 h-10 border-4 border-slate-800 border-t-primary rounded-full animate-spin"></div>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider animate-pulse">Loading Students...</p>
        </div>
      ) : students.length === 0 ? (
        <div className="glass-card text-center p-12 border border-slate-200  rounded-xl">
          <GraduationCap className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900  mb-1">No Students Found</h3>
          <p className="text-slate-500  text-sm max-w-sm mx-auto mb-6">Create classes first, then admit students using the "New Admission" button.</p>
          <button
            onClick={openAdmissionModal}
            className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-sm rounded-lg transition-all"
          >
            Admit a Student
          </button>
        </div>
      ) : (
        <div className="bg-white  border border-slate-200  rounded-xl overflow-hidden shadow-sm transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-slate-500 ">
              <thead className="bg-slate-50  text-slate-700  font-semibold text-xs uppercase tracking-wider border-b border-slate-200 ">
                <tr>
                  <th className="px-6 py-4">Admission No</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Class</th>
                  <th className="px-6 py-4">Section</th>
                  <th className="px-6 py-4">Parent details</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 ">
                {students.map((student) => (
                  <tr key={student._id} className="hover:bg-slate-50/50 :bg-slate-700/30 transition-all">
                    <td className="px-6 py-4 font-bold text-slate-900 ">{student.admissionNo}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase shadow-inner">
                          {student.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 ">{student.name}</div>
                          <div className="text-xs text-slate-400">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-750 ">
                      {student.classId ? student.classId.name : 'Unknown Class'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100  text-slate-700  border border-slate-200 ">
                        {student.section}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 ">{student.parentName}</div>
                      <div className="text-xs text-slate-400">{student.parentPhone}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center items-center gap-3">
                        <button
                          onClick={() => openIdCard(student)}
                          className="px-2.5 py-1.5 bg-slate-100  hover:bg-primary hover:text-white :bg-primary rounded-lg text-slate-700  font-semibold text-xs transition-all flex items-center gap-1 shadow-sm"
                        >
                          <Contact className="w-3.5 h-3.5" /> ID Card
                        </button>
                        <button
                          onClick={() => handleDelete(student._id)}
                          className="p-1.5 hover:text-rose-500 hover:bg-rose-50 :bg-rose-950/20 rounded transition-all"
                        >
                          <Trash2 className="w-4 h-4 text-rose-500" />
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

      {/* 1. Admission Form Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300">
          <div className="w-full max-w-lg bg-white  rounded-2xl p-6 border border-slate-200  shadow-2xl relative">
            {onboardedCredentials ? (
              <div className="text-center py-4 space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 ">Admission Successful</h3>
                  <p className="text-xs text-slate-500 mt-1">Student portal login credentials have been generated automatically.</p>
                </div>
                <div className="bg-slate-50  border border-slate-100  rounded-xl p-4 text-left text-sm space-y-2">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Portal Username (Email)</span>
                    <strong className="text-slate-800  select-all font-mono">{onboardedCredentials.email}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Temporary Password</span>
                    <strong className="text-slate-800  select-all font-mono">{onboardedCredentials.password}</strong>
                  </div>
                </div>
                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => {
                      setOnboardedCredentials(null);
                      setShowAddModal(false);
                    }}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-555 text-white rounded-lg text-xs font-semibold shadow transition-all active:scale-95"
                  >
                    Copy & Close
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-bold text-slate-900  mb-4 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-indigo-500" /> Admit New Student
                </h3>

                {error && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs font-medium mb-4 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" /> {error}
                  </div>
                )}

                <form onSubmit={handleAdmissionSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400  uppercase tracking-wider mb-1">
                      Admission Number
                    </label>
                    <input
                      type="text"
                      value={admissionNo}
                      onChange={(e) => setAdmissionNo(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-slate-300  bg-transparent text-slate-900  text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400  uppercase tracking-wider mb-1">
                      Student Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul Patel"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-slate-300  bg-transparent text-slate-900  text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400  uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. rahul@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-slate-300  bg-transparent text-slate-900  text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400  uppercase tracking-wider mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-slate-300  bg-transparent text-slate-900  text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400  uppercase tracking-wider mb-1">
                      Assign Class
                    </label>
                    <select
                      value={selectedClassId}
                      onChange={(e) => handleClassChangeInForm(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300  bg-transparent text-slate-900  text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    >
                      <option value="" disabled className="">Select Class</option>
                      {classes.map((cls) => (
                        <option key={cls._id} value={cls._id} className="">{cls.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400  uppercase tracking-wider mb-1">
                      Select Section
                    </label>
                    <select
                      value={selectedSection}
                      onChange={(e) => setSelectedSection(e.target.value)}
                      disabled={availableSections.length === 0}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300  bg-transparent text-slate-900  text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all disabled:opacity-50"
                    >
                      {availableSections.map((sec) => (
                        <option key={sec} value={sec} className="">Section {sec}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400  uppercase tracking-wider mb-1">
                      Parent / Guardian Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Patel"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-slate-300  bg-transparent text-slate-900  text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400  uppercase tracking-wider mb-1">
                      Parent Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-slate-300  bg-transparent text-slate-900  text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>

                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-400  uppercase tracking-wider mb-1">
                      Student Profile Image (Optional)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setProfileImageFile(e.target.files[0])}
                      className="w-full px-4 py-2 rounded-lg border border-slate-300  bg-transparent text-slate-900  text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>

                  <div className="col-span-1 sm:col-span-2 flex justify-end gap-3 pt-4 border-t border-slate-100 ">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 border border-slate-200  hover:bg-slate-50 :bg-slate-700 rounded-lg text-slate-700  font-semibold text-xs transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUploading}
                      className="px-4 py-2 bg-primary hover:opacity-90 active:scale-95 text-white rounded-lg font-semibold text-xs transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <UserPlus className="w-4 h-4" /> {isUploading ? 'Admitting...' : 'Submit Admission'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* 2. Official Student ID Card Modal */}
      {showIdCardModal && activeStudentForIdCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl relative flex flex-col items-center">
            
            {/* Printable Area Wrapper */}
            <div id="printable-id-card-area" className="w-[320px] h-[480px] bg-white border border-slate-200 rounded-2xl flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden font-sans">
              
              {/* Vibrant Top Header / Banner */}
              <div className="h-28 bg-gradient-to-br from-blue-600 to-indigo-700 w-full relative flex flex-col items-center justify-center text-white px-4 pt-4">
                <div className="absolute inset-0 bg-white/10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
                <div className="relative z-10 flex items-center gap-3 w-full justify-center">
                  {tenant?.logoUrl ? (
                    <img src={tenant.logoUrl} alt="Logo" className="w-10 h-10 rounded-full border-2 border-white/50 object-cover shadow-sm" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/50 flex items-center justify-center backdrop-blur-sm">
                      <School className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div className="text-left">
                    <h4 className="text-sm font-black tracking-tight leading-none uppercase drop-shadow-sm">{tenant?.schoolName || 'EduCore School'}</h4>
                    <span className="text-[10px] text-blue-100 font-bold tracking-widest uppercase drop-shadow-sm">Official Identity Card</span>
                  </div>
                </div>
              </div>

              {/* Photo & Identity Section */}
              <div className="relative flex flex-col items-center px-6 mt-[-40px]">
                {activeStudentForIdCard.profileImage ? (
                  <img 
                    src={activeStudentForIdCard.profileImage} 
                    alt="Student" 
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md bg-white"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-slate-100 text-blue-600 border-4 border-white shadow-md flex items-center justify-center">
                    <GraduationCap className="w-10 h-10 text-slate-300" />
                  </div>
                )}
                
                <h3 className="text-lg font-black text-slate-900 mt-3">{activeStudentForIdCard.name}</h3>
                <span className="px-3 py-1 mt-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider border border-blue-100">
                  Class {activeStudentForIdCard.classId?.name} - {activeStudentForIdCard.section}
                </span>
              </div>

              {/* Details Grid */}
              <div className="flex-1 px-6 py-4 flex flex-col justify-center">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2.5 shadow-inner">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-semibold uppercase tracking-wider">Admission No</span>
                    <span className="font-bold text-slate-800">{activeStudentForIdCard.admissionNo}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-semibold uppercase tracking-wider">DOB</span>
                    <span className="font-bold text-slate-800">{activeStudentForIdCard.dob ? new Date(activeStudentForIdCard.dob).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-semibold uppercase tracking-wider">Guardian</span>
                    <span className="font-bold text-slate-800">{activeStudentForIdCard.parentName}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-semibold uppercase tracking-wider">Emergency</span>
                    <span className="font-bold text-slate-800">{activeStudentForIdCard.parentPhone}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="h-12 bg-slate-900 w-full flex items-center justify-between px-6 text-[9px] text-slate-300 font-bold uppercase tracking-widest">
                <span>Valid for 2026-27</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> Active
                </span>
              </div>
            </div>

            {/* Print and Close controls */}
            <div className="mt-8 flex w-full gap-3 justify-center relative z-20">
              <button
                type="button"
                onClick={() => setShowIdCardModal(false)}
                className="px-6 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-bold text-sm transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePrintIdCard}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl font-bold text-sm transition-all shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] flex items-center gap-2"
              >
                <Printer className="w-4 h-4" /> Print ID Card
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Students;
