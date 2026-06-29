import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTenantTheme } from '../context/TenantThemeContext';

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
  const [admissionNo, setAdmissionNo] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [availableSections, setAvailableSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');

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
    setError('');
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
      await axios.post('http://localhost:5001/api/v1/students', {
        admissionNo,
        name,
        email,
        dob: dob || undefined,
        classId: selectedClassId,
        section: selectedSection,
        parentName,
        parentPhone
      });
      setShowAddModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit admission form.');
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
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Student Directory (SIS)</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">View profile information, admit new students, and generate official ID cards.</p>
        </div>
        <button
          onClick={openAdmissionModal}
          className="px-4 py-2.5 bg-primary hover:opacity-90 active:scale-95 text-white font-semibold text-sm rounded-lg shadow-lg transition-all flex items-center gap-2"
        >
          <span>🎓</span> New Admission
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-sm">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search by student name or Admission No..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
          <span className="absolute left-3 top-2.5 text-slate-400 text-sm">🔍</span>
        </div>
        
        <div className="w-full sm:w-60">
          <select
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          >
            <option value="" className="dark:bg-slate-800">All Classes</option>
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id} className="dark:bg-slate-800">
                {cls.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && !showAddModal && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-sm font-medium">
          ⚠️ {error}
        </div>
      )}

      {/* Student List View */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="w-10 h-10 border-4 border-slate-800 border-t-primary rounded-full animate-spin"></div>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider animate-pulse">Loading Students...</p>
        </div>
      ) : students.length === 0 ? (
        <div className="glass-card text-center p-12 border border-slate-200 dark:border-slate-800 rounded-xl">
          <span className="text-5xl block mb-4">👨‍🎓</span>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No Students Found</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto mb-6">Create classes first, then admit students using the "New Admission" button.</p>
          <button
            onClick={openAdmissionModal}
            className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-sm rounded-lg transition-all"
          >
            Admit a Student
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl overflow-hidden shadow-sm transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-slate-500 dark:text-slate-400">
              <thead className="bg-slate-50 dark:bg-slate-750 text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4">Admission No</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Class</th>
                  <th className="px-6 py-4">Section</th>
                  <th className="px-6 py-4">Parent details</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50">
                {students.map((student) => (
                  <tr key={student._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-all">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{student.admissionNo}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase shadow-inner">
                          {student.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">{student.name}</div>
                          <div className="text-xs text-slate-400">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-750 dark:text-slate-350">
                      {student.classId ? student.classId.name : 'Unknown Class'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                        {student.section}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 dark:text-white">{student.parentName}</div>
                      <div className="text-xs text-slate-400">{student.parentPhone}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center items-center gap-3">
                        <button
                          onClick={() => openIdCard(student)}
                          className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-primary hover:text-white dark:hover:bg-primary rounded-lg text-slate-700 dark:text-slate-300 font-semibold text-xs transition-all flex items-center gap-1 shadow-sm"
                        >
                          🪪 ID Card
                        </button>
                        <button
                          onClick={() => handleDelete(student._id)}
                          className="p-1.5 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded transition-all"
                        >
                          🗑️
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
          <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-2xl relative">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">🎓 Admit New Student</h3>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs font-medium mb-4">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleAdmissionSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                  Admission Number
                </label>
                <input
                  type="text"
                  value={admissionNo}
                  onChange={(e) => setAdmissionNo(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                  Student Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Patel"
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
                  placeholder="e.g. rahul@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                  Assign Class
                </label>
                <select
                  value={selectedClassId}
                  onChange={(e) => handleClassChangeInForm(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                >
                  <option value="" disabled className="dark:bg-slate-800">Select Class</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id} className="dark:bg-slate-800">{cls.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                  Select Section
                </label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  disabled={availableSections.length === 0}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all disabled:opacity-50"
                >
                  {availableSections.map((sec) => (
                    <option key={sec} value={sec} className="dark:bg-slate-800">Section {sec}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                  Parent / Guardian Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Patel"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                  Parent Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>

              <div className="col-span-1 sm:col-span-2 flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-semibold text-xs transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:opacity-90 active:scale-95 text-white rounded-lg font-semibold text-xs transition-all shadow-md"
                >
                  Submit Admission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Official Student ID Card Modal */}
      {showIdCardModal && activeStudentForIdCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300">
          <div className="w-full max-w-sm bg-slate-900/90 border border-slate-700 rounded-2xl p-6 shadow-2xl relative text-white flex flex-col items-center">
            
            {/* Printable Area Wrapper */}
            <div id="printable-id-card-area" className="w-[300px] h-[450px] bg-slate-950 border border-slate-700 rounded-2xl p-6 flex flex-col justify-between items-center text-center shadow-lg relative overflow-hidden font-sans">
              {/* Dynamic Branding Background Glows */}
              <div className="absolute w-[200px] h-[200px] rounded-full filter blur-[80px] opacity-20 -top-10 -left-10 bg-primary"></div>
              <div className="absolute w-[200px] h-[200px] rounded-full filter blur-[80px] opacity-20 -bottom-20 -right-20 bg-secondary"></div>

              {/* Header */}
              <div className="relative z-10 w-full pb-3 border-b border-white/10 flex items-center justify-center gap-2">
                {tenant?.logoUrl ? (
                  <img src={tenant.logoUrl} alt="Logo" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <span className="text-xl">🏫</span>
                )}
                <div>
                  <h4 className="text-sm font-bold tracking-tight text-white leading-none uppercase">{tenant?.schoolName || 'EduCore School'}</h4>
                  <span className="text-[9px] text-slate-400 font-semibold tracking-widest uppercase">Student Pass</span>
                </div>
              </div>

              {/* Photo */}
              <div className="relative z-10 my-4 flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-primary/10 text-primary border-2 border-primary flex items-center justify-center font-bold text-3xl shadow-lg">
                  🎓
                </div>
                <h3 className="text-md font-bold mt-3 text-white">{activeStudentForIdCard.name}</h3>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Class: {activeStudentForIdCard.classId?.name} ({activeStudentForIdCard.section})
                </span>
              </div>

              {/* Profile details */}
              <div className="relative z-10 w-full text-left bg-white/5 border border-white/10 p-3.5 rounded-xl space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Admission No:</span>
                  <span className="font-bold text-white">{activeStudentForIdCard.admissionNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Guardian Name:</span>
                  <span className="font-semibold text-white">{activeStudentForIdCard.parentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Emergency Call:</span>
                  <span className="font-semibold text-white">{activeStudentForIdCard.parentPhone}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="relative z-10 w-full pt-3 border-t border-white/10 flex items-center justify-between text-[9px] text-slate-500 font-semibold">
                <span>EDUCORE SAFE PASS</span>
                <span className="text-primary font-bold">ACTIVE</span>
              </div>
            </div>

            {/* Print and Close controls */}
            <div className="mt-6 flex w-full gap-3 justify-end relative z-20">
              <button
                type="button"
                onClick={() => setShowIdCardModal(false)}
                className="px-4 py-2 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-lg font-semibold text-xs transition-all"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handlePrintIdCard}
                className="px-4 py-2 bg-primary hover:opacity-90 active:scale-95 text-white rounded-lg font-semibold text-xs transition-all shadow-md flex items-center gap-1.5"
              >
                <span>🖨️</span> Print Pass Card
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Students;
