import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTenantTheme } from '../context/TenantThemeContext';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  Calendar,
  Clock,
  BookOpen,
  Award,
  FileText,
  CheckCircle,
  AlertTriangle,
  CreditCard,
  UserCheck,
  Plus,
  Sparkles,
  User,
  Mail,
  Phone,
  LayoutDashboard,
  Users,
  Loader2,
  Send,
  Check,
  X,
  Lock,
  ArrowRight,
  TrendingUp,
  Receipt
} from 'lucide-react';

const Home = () => {
  const { tenant } = useTenantTheme();
  const { user } = useAuth();
  
  // COMMON STATE
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ==========================================
  // STUDENT PORTAL STATES
  // ==========================================
  const [studentDashData, setStudentDashData] = useState(null);
  const [studentAttendance, setStudentAttendance] = useState([]);
  const [studentAssignments, setStudentAssignments] = useState([]);
  const [studentFees, setStudentFees] = useState([]);
  const [studentActiveTab, setStudentActiveTab] = useState('overview'); // 'overview', 'attendance', 'assignments', 'fees'

  // Student Homework submission Modal
  const [submitAssignmentModal, setSubmitAssignmentModal] = useState(null); // { _id, title }
  const [submitAnswerText, setSubmitAnswerText] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submittingAssignment, setSubmittingAssignment] = useState(false);

  // Student Exam Fee Checkout Modal
  const [checkoutFeeModal, setCheckoutFeeModal] = useState(null); // fee object
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('123');
  const [cardName, setCardName] = useState(user?.name || '');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState('');

  // ==========================================
  // TEACHER PORTAL STATES
  // ==========================================
  const [teacherDashData, setTeacherDashData] = useState(null);
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [teacherActiveTab, setTeacherActiveTab] = useState('overview'); // 'overview', 'attendance', 'assignments', 'grade'

  // Teacher Attendance Tracker state
  const [attendanceClassId, setAttendanceClassId] = useState('');
  const [attendanceSection, setAttendanceSection] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRoster, setAttendanceRoster] = useState([]);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [attendanceMsg, setAttendanceMsg] = useState('');

  // Teacher Assignment Creator state
  const [assignTitle, setAssignTitle] = useState('');
  const [assignDescription, setAssignDescription] = useState('');
  const [assignDueDate, setAssignDueDate] = useState('');
  const [assignClassId, setAssignClassId] = useState('');
  const [assignSection, setAssignSection] = useState('');
  const [assignSubject, setAssignSubject] = useState('Mathematics');
  const [creatingAssignment, setCreatingAssignment] = useState(false);
  const [assignmentSuccessMsg, setAssignmentSuccessMsg] = useState('');
  const [teacherAssignments, setTeacherAssignments] = useState([]);

  // Teacher Submission Grader state
  const [gradeSubmissionModal, setGradeSubmissionModal] = useState(null); // { assignmentId, studentId, studentName, answerText, currentGrade, currentFeedback }
  const [inputGrade, setInputGrade] = useState('A');
  const [inputFeedback, setInputFeedback] = useState('');
  const [submittingGrade, setSubmittingGrade] = useState(false);

  // ==========================================
  // LIFECYCLE EFFECTS
  // ==========================================
  useEffect(() => {
    if (user?.role === 'student') {
      fetchStudentDashboard();
      fetchStudentAttendance();
      fetchStudentAssignments();
      fetchStudentFees();
    } else if (user?.role === 'teacher') {
      fetchTeacherDashboard();
      fetchTeacherClasses();
      fetchTeacherAssignments();
    }
  }, [user]);

  // ==========================================
  // STUDENT PORTAL API HANDLERS
  // ==========================================
  const fetchStudentDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get('http://localhost:5001/api/v1/students/portal/dashboard');
      if (res.data.success) {
        setStudentDashData(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch student dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentAttendance = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/v1/students/portal/attendance');
      if (res.data.success) {
        setStudentAttendance(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load student attendance logs', err);
    }
  };

  const fetchStudentAssignments = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/v1/students/portal/assignments');
      if (res.data.success) {
        setStudentAssignments(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load student assignments', err);
    }
  };

  const fetchStudentFees = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/v1/students/portal/fees');
      if (res.data.success) {
        setStudentFees(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load student fees logs', err);
    }
  };

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!submitAnswerText) {
      setSubmitError('Please enter your response text.');
      return;
    }

    try {
      setSubmittingAssignment(true);
      const res = await axios.post(`http://localhost:5001/api/v1/students/portal/assignments/${submitAssignmentModal._id}/submit`, {
        answerText: submitAnswerText
      });
      if (res.data.success) {
        setSubmitAssignmentModal(null);
        setSubmitAnswerText('');
        fetchStudentAssignments();
        fetchStudentDashboard();
      }
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Failed to submit assignment.');
    } finally {
      setSubmittingAssignment(false);
    }
  };

  const handlePayFeeSubmit = async (e) => {
    e.preventDefault();
    setPaymentSuccessMsg('');
    try {
      setProcessingPayment(true);
      // Simulate network checkout lag
      await new Promise(r => setTimeout(r, 1500));
      const res = await axios.post(`http://localhost:5001/api/v1/students/portal/fees/${checkoutFeeModal._id}/pay`);
      if (res.data.success) {
        setPaymentSuccessMsg(`Payment Processed Successfully! Transaction ID: ${res.data.data.transactionId}`);
        fetchStudentFees();
        fetchStudentDashboard();
        setTimeout(() => {
          setCheckoutFeeModal(null);
          setPaymentSuccessMsg('');
        }, 2000);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Payment transaction failed.');
    } finally {
      setProcessingPayment(false);
    }
  };

  // ==========================================
  // TEACHER PORTAL API HANDLERS
  // ==========================================
  const fetchTeacherDashboard = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5001/api/v1/teachers/portal/dashboard');
      if (res.data.success) {
        setTeacherDashData(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeacherClasses = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/v1/teachers/portal/classes');
      if (res.data.success) {
        setTeacherClasses(res.data.data);
        if (res.data.data.length > 0) {
          setAttendanceClassId(res.data.data[0]._id);
          setAssignClassId(res.data.data[0]._id);
          if (res.data.data[0].sections?.length > 0) {
            setAttendanceSection(res.data.data[0].sections[0]);
            setAssignSection(res.data.data[0].sections[0]);
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTeacherAssignments = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/v1/teachers/portal/assignments');
      if (res.data.success) {
        setTeacherAssignments(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadAttendanceRoster = async () => {
    if (!attendanceClassId || !attendanceSection) return;
    try {
      setLoadingRoster(true);
      setAttendanceMsg('');
      const res = await axios.get(`http://localhost:5001/api/v1/teachers/portal/attendance?classId=${attendanceClassId}&section=${attendanceSection}&date=${attendanceDate}`);
      if (res.data.success) {
        // Map status to present by default if null
        const roster = res.data.data.map(stud => ({
          ...stud,
          status: stud.status || 'present'
        }));
        setAttendanceRoster(roster);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRoster(false);
    }
  };

  // Reload roster when parameters change
  useEffect(() => {
    if (user?.role === 'teacher' && teacherActiveTab === 'attendance') {
      loadAttendanceRoster();
    }
  }, [attendanceClassId, attendanceSection, attendanceDate, teacherActiveTab]);

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceRoster(prev => prev.map(item => item._id === studentId ? { ...item, status } : item));
  };

  const submitAttendanceRoster = async () => {
    try {
      setSavingAttendance(true);
      setAttendanceMsg('');
      const records = attendanceRoster.map(s => ({ studentId: s._id, status: s.status }));
      const res = await axios.post('http://localhost:5001/api/v1/teachers/portal/attendance', {
        classId: attendanceClassId,
        section: attendanceSection,
        date: attendanceDate,
        records
      });
      if (res.data.success) {
        setAttendanceMsg('Attendance registered successfully!');
        fetchTeacherDashboard();
      }
    } catch (err) {
      setAttendanceMsg(err.response?.data?.error || 'Failed to submit attendance roster.');
    } finally {
      setSavingAttendance(false);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    setAssignmentSuccessMsg('');
    if (!assignTitle || !assignDescription || !assignDueDate || !assignClassId || !assignSection || !assignSubject) {
      alert('Please fill in all assignment fields.');
      return;
    }
    try {
      setCreatingAssignment(true);
      const res = await axios.post('http://localhost:5001/api/v1/teachers/portal/assignments', {
        title: assignTitle,
        description: assignDescription,
        dueDate: assignDueDate,
        classId: assignClassId,
        section: assignSection,
        subject: assignSubject
      });
      if (res.data.success) {
        setAssignmentSuccessMsg('Homework Assignment created successfully!');
        setAssignTitle('');
        setAssignDescription('');
        setAssignDueDate('');
        fetchTeacherAssignments();
        fetchTeacherDashboard();
        setTimeout(() => setAssignmentSuccessMsg(''), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create assignment.');
    } finally {
      setCreatingAssignment(false);
    }
  };

  const submitGradingFeedback = async (e) => {
    e.preventDefault();
    try {
      setSubmittingGrade(true);
      const res = await axios.put(`http://localhost:5001/api/v1/teachers/portal/assignments/${gradeSubmissionModal.assignmentId}/submissions/${gradeSubmissionModal.studentId}/grade`, {
        grade: inputGrade,
        feedback: inputFeedback
      });
      if (res.data.success) {
        setGradeSubmissionModal(null);
        setInputGrade('A');
        setInputFeedback('');
        fetchTeacherAssignments();
        fetchTeacherDashboard();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to grade submission.');
    } finally {
      setSubmittingGrade(false);
    }
  };

  // ==========================================
  // RENDER: Student Portal view
  // ==========================================
  if (user?.role === 'student') {
    const profile = studentDashData?.student;
    const stats = studentDashData?.attendanceStats;

    return (
      <div className="space-y-6">
        {/* Header Dashboard Banner */}
        <div className="relative rounded-2xl overflow-hidden shadow-lg border border-primary/20 bg-gradient-to-r from-primary to-primary/80 text-white p-6 sm:p-8">
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" /> Welcome back, {user.name}!
            </h2>
            <p className="mt-2 text-sm sm:text-base text-white/90">
              Access your digital ID badge, check class attendance logs, submit homework assignments, and clear academic fee invoices.
            </p>
          </div>
        </div>

        {/* Tab navigation headers */}
        <div className="border-b border-slate-200 dark:border-slate-800">
          <nav className="-mb-px flex space-x-6 text-sm font-semibold">
            <button
              onClick={() => setStudentActiveTab('overview')}
              className={`py-3 border-b-2 transition-all ${
                studentActiveTab === 'overview'
                  ? 'border-primary text-primary dark:text-white'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              Overview Dashboard
            </button>
            <button
              onClick={() => setStudentActiveTab('attendance')}
              className={`py-3 border-b-2 transition-all ${
                studentActiveTab === 'attendance'
                  ? 'border-primary text-primary dark:text-white'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              Attendance logs
            </button>
            <button
              onClick={() => setStudentActiveTab('assignments')}
              className={`py-3 border-b-2 transition-all relative ${
                studentActiveTab === 'assignments'
                  ? 'border-primary text-primary dark:text-white'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              Homework ({studentAssignments.filter(a => a.submissionStatus === 'pending').length} Pending)
            </button>
            <button
              onClick={() => setStudentActiveTab('fees')}
              className={`py-3 border-b-2 transition-all relative ${
                studentActiveTab === 'fees'
                  ? 'border-primary text-primary dark:text-white'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              Exam Fees & Bills
              {studentDashData?.pendingFeesCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] bg-rose-500 text-white font-black animate-pulse">
                  {studentDashData.pendingFeesCount}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Loading spinners */}
        {loading && !studentDashData ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-xs text-slate-550">Loading student dashboard portal...</p>
          </div>
        ) : (
          <div>
            {/* SUB-TAB: Overview */}
            {studentActiveTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Column 1: Student Digital ID Card */}
                <div className="space-y-4 lg:col-span-1">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-450 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-primary" /> Digital Identity Card
                  </h3>
                  
                  <div 
                    className="w-full max-w-sm mx-auto rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 relative bg-white dark:bg-slate-900"
                    style={{ borderTop: `8px solid var(--tenant-primary, #4f46e5)` }}
                  >
                    <div className="p-5 flex items-center space-x-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                      <img 
                        src={tenant?.logoUrl || "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=200&h=200&fit=crop"} 
                        alt="School Logo" 
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-950 dark:text-white leading-tight">{tenant?.schoolName || 'EduCore Academy'}</h4>
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Student ID Card</span>
                      </div>
                    </div>

                    <div className="p-6 flex flex-col items-center text-center space-y-4">
                      <img 
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&h=150&fit=crop" 
                        alt="Profile" 
                        className="w-20 h-20 rounded-full object-cover border-4 border-slate-100 dark:border-slate-800 bg-slate-50 shadow"
                      />
                      <div>
                        <h3 className="text-base font-black text-slate-955 dark:text-white">{profile?.name || user.name}</h3>
                        <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider">{profile?.classId?.name || 'Class 10'} - Section {profile?.section || 'A'}</span>
                      </div>

                      <div className="w-full grid grid-cols-2 gap-3 text-left border-t border-slate-100 dark:border-slate-800 pt-4 text-[10px] text-slate-655 dark:text-slate-400">
                        <div>
                          <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block">Admission No.</span>
                          <strong className="text-slate-900 dark:text-white font-bold">{profile?.admissionNo}</strong>
                        </div>
                        <div>
                          <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block">Date of Birth</span>
                          <strong className="text-slate-900 dark:text-white font-bold">
                            {profile?.dob ? new Date(profile.dob).toLocaleDateString() : 'N/A'}
                          </strong>
                        </div>
                        <div>
                          <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block">Parent / Guardian</span>
                          <strong className="text-slate-900 dark:text-white font-bold">{profile?.parentName}</strong>
                        </div>
                        <div>
                          <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block">Parent Phone</span>
                          <strong className="text-slate-900 dark:text-white font-bold">{profile?.parentPhone}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 2: Stats Grid and Overview widgets */}
                <div className="space-y-6 lg:col-span-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-450">
                    Quick Dashboard Metrics
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {/* Attendance summary card */}
                    <div className="glass-card p-5 rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
                      <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Attendance Rate</span>
                      <strong className="text-3xl font-black text-emerald-500 mt-2">{stats?.percentage || '0.0'}%</strong>
                      <span className="text-[10px] text-slate-400 mt-1">({stats?.present} Present of {stats?.present + stats?.absent + stats?.late} Days)</span>
                    </div>

                    {/* Pending assignments card */}
                    <div className="glass-card p-5 rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
                      <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Pending Homework</span>
                      <strong className="text-3xl font-black text-amber-500 mt-2">{studentDashData?.pendingAssignmentsCount || 0}</strong>
                      <span className="text-[10px] text-slate-400 mt-1">Requires immediate response</span>
                    </div>

                    {/* Unpaid balance card */}
                    <div className="glass-card p-5 rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
                      <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Unpaid Fee items</span>
                      <strong className="text-3xl font-black text-rose-500 mt-2">{studentDashData?.pendingFeesCount || 0}</strong>
                      <span className="text-[10px] text-slate-400 mt-1">Exam registration fee bills</span>
                    </div>
                  </div>

                  {/* Quick Attendance Circle widget */}
                  <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-4">
                    <h4 className="text-xs font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-emerald-400" /> Attendance logs Progress
                    </h4>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                      <div className="flex items-center space-x-4">
                        <div className="relative w-16 h-16 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="32" cy="32" r="26" className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="5" fill="transparent" />
                            <circle 
                              cx="32" 
                              cy="32" 
                              r="26" 
                              className="stroke-emerald-400" 
                              strokeWidth="5" 
                              fill="transparent" 
                              strokeDasharray="163.3"
                              strokeDashoffset={163.3 - (163.3 * (parseFloat(stats?.percentage) || 0)) / 100}
                            />
                          </svg>
                          <span className="absolute text-xs font-black text-slate-905 dark:text-white">{stats?.percentage || '0.0'}%</span>
                        </div>
                        <div>
                          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Monthly Attendance Summary</h4>
                          <p className="text-[10px] text-slate-500 mt-0.5">Please maintain a minimum attendance rate of 75% to appear in final exams.</p>
                        </div>
                      </div>
                      <div className="flex space-x-6 text-center text-xs">
                        <div>
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Present</span>
                          <strong className="text-emerald-400 font-bold text-base">{stats?.present}d</strong>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Absent</span>
                          <strong className="text-rose-500 font-bold text-base">{stats?.absent}d</strong>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Late</span>
                          <strong className="text-amber-500 font-bold text-base">{stats?.late}d</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB: Attendance Details */}
            {studentActiveTab === 'attendance' && (
              <div className="glass-card rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Class Attendance Logs</h3>
                  <span className="text-[10px] font-semibold text-slate-400">Total Entries: {studentAttendance.length}</span>
                </div>
                {studentAttendance.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-xs">
                    No attendance records registered yet for your account.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {studentAttendance.map((rec) => (
                      <div key={rec._id} className="p-4 flex items-center justify-between text-xs transition-colors hover:bg-slate-50/30 dark:hover:bg-slate-850/20">
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">
                              {new Date(rec.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                            <p className="text-[10px] text-slate-500">Record ID: {rec._id}</p>
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          rec.status === 'present' 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' 
                            : rec.status === 'late'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-955/30 dark:text-amber-400'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-955/30 dark:text-rose-400'
                        }`}>
                          {rec.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SUB-TAB: Assignments List */}
            {studentActiveTab === 'assignments' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-450">Active Class Homework Assignments</h3>
                </div>

                {studentAssignments.length === 0 ? (
                  <div className="glass-card p-12 text-center text-slate-400 text-xs rounded-xl border border-slate-200 dark:border-slate-800">
                    No homework assignments allocated for your class and section.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {studentAssignments.map((asg) => (
                      <div 
                        key={asg._id} 
                        className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm flex flex-col justify-between space-y-4 relative bg-white dark:bg-slate-900"
                        style={{ borderLeft: `5px solid ${asg.submissionStatus === 'graded' ? '#10b981' : asg.submissionStatus === 'submitted' ? '#3b82f6' : '#f59e0b'}` }}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold uppercase tracking-wider bg-indigo-500/10 text-primary px-2 py-0.5 rounded">
                              {asg.subject}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                              asg.submissionStatus === 'graded'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'
                                : asg.submissionStatus === 'submitted'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-955/30 dark:text-amber-400'
                            }`}>
                              {asg.submissionStatus}
                            </span>
                          </div>
                          <h4 className="font-extrabold text-sm text-slate-905 dark:text-white pt-1">{asg.title}</h4>
                          <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{asg.description}</p>
                        </div>

                        <div className="border-t border-slate-100 dark:border-slate-800 pt-3 text-[10px] text-slate-500 space-y-1">
                          <div className="flex justify-between">
                            <span>Due Date:</span>
                            <strong className="text-slate-700 dark:text-slate-350">{new Date(asg.dueDate).toLocaleDateString()}</strong>
                          </div>
                          {asg.submissionStatus !== 'pending' && (
                            <div className="flex justify-between">
                              <span>Submitted:</span>
                              <strong className="text-slate-700 dark:text-slate-350">{new Date(asg.submittedAt).toLocaleDateString()}</strong>
                            </div>
                          )}
                          {asg.submissionStatus === 'graded' && (
                            <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80 mt-2 space-y-1">
                              <div className="flex justify-between text-[11px]">
                                <span className="font-bold text-emerald-500">Assigned Score:</span>
                                <strong className="text-emerald-500 font-extrabold">{asg.grade}</strong>
                              </div>
                              {asg.feedback && (
                                <p className="text-[9px] text-slate-450 italic">" {asg.feedback} "</p>
                              )}
                            </div>
                          )}
                        </div>

                        {asg.submissionStatus === 'pending' && (
                          <button
                            onClick={() => {
                              setSubmitError('');
                              setSubmitAssignmentModal(asg);
                            }}
                            className="w-full py-2 bg-primary hover:opacity-90 active:scale-95 text-white text-xs font-bold rounded-lg shadow transition-all flex items-center justify-center gap-1"
                          >
                            <Send className="w-3.5 h-3.5" /> Submit Response
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SUB-TAB: Fees & Billing */}
            {studentActiveTab === 'fees' && (
              <div className="glass-card rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Fee Invoices & Bills</h3>
                </div>

                {studentFees.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-xs">
                    No fee billing records found.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {studentFees.map((fee) => (
                      <div key={fee._id} className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs">
                        <div className="flex items-start space-x-3.5">
                          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-primary flex items-center justify-center shrink-0">
                            <Receipt className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{fee.title}</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">Due Date: {new Date(fee.dueDate).toLocaleDateString()}</p>
                            {fee.status === 'paid' && (
                              <p className="text-[9px] text-slate-550 mt-1 bg-slate-50 dark:bg-slate-950 px-2 py-0.5 rounded inline-block font-mono">
                                txn: {fee.transactionId} | paid on: {new Date(fee.paymentDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-slate-100 dark:border-slate-850 pt-3 sm:pt-0">
                          <div>
                            <span className="text-[9px] text-slate-500 font-semibold block sm:text-right">Billing Amount</span>
                            <strong className="text-slate-900 dark:text-white text-base font-black font-sans">₹{fee.amount}</strong>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              fee.status === 'paid'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-955/30 dark:text-rose-400'
                            }`}>
                              {fee.status}
                            </span>
                            {fee.status === 'pending' && (
                              <button
                                onClick={() => setCheckoutFeeModal(fee)}
                                className="px-4 py-1.5 bg-primary hover:opacity-90 active:scale-95 text-white text-xs font-bold rounded-lg shadow transition-all"
                              >
                                Pay Now
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        )}

        {/* MODAL: Homework submission */}
        {submitAssignmentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-2xl relative">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                <Send className="w-4 h-4 text-indigo-500" /> Submit Assignment Response
              </h3>
              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mb-4">Topic: {submitAssignmentModal.title}</p>
              
              {submitError && (
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs font-medium mb-4">
                  ⚠️ {submitError}
                </div>
              )}

              <form onSubmit={handleAssignmentSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                    Your Response Text / Answers
                  </label>
                  <textarea
                    rows="6"
                    placeholder="Enter your answers or response essay details here..."
                    value={submitAnswerText}
                    onChange={(e) => setSubmitAnswerText(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-sans"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700/50 text-xs">
                  <button
                    type="button"
                    onClick={() => setSubmitAssignmentModal(null)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-750 dark:text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingAssignment}
                    className="px-5 py-2 bg-primary hover:opacity-90 active:scale-95 text-white rounded-lg font-semibold flex items-center gap-1 shadow"
                  >
                    {submittingAssignment ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" /> Submit Homework
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: Exam Fee checkout */}
        {checkoutFeeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-2xl relative">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-emerald-500" /> Secure Portal Checkout
              </h3>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-4">EduCore Payment Gateway Integration</p>

              {paymentSuccessMsg ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center animate-bounce">
                    <Check className="w-6 h-6" />
                  </div>
                  <strong className="block text-sm text-slate-900 dark:text-white font-bold">{paymentSuccessMsg}</strong>
                  <p className="text-xs text-slate-400">Updating invoice records, please stand by...</p>
                </div>
              ) : (
                <form onSubmit={handlePayFeeSubmit} className="space-y-4">
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-xs space-y-1.5 mb-2">
                    <div className="flex justify-between">
                      <span className="text-slate-450">Billing Item:</span>
                      <strong className="text-slate-800 dark:text-slate-350">{checkoutFeeModal.title}</strong>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-455 font-bold">Total Payment Due:</span>
                      <strong className="text-slate-950 dark:text-white font-black">₹{checkoutFeeModal.amount}</strong>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Cardholder Name</label>
                    <input 
                      type="text" 
                      value={cardName} 
                      onChange={e => setCardName(e.target.value)} 
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white text-xs focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Card Number</label>
                    <input 
                      type="text" 
                      value={cardNumber} 
                      onChange={e => setCardNumber(e.target.value)} 
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Expiry Date</label>
                      <input 
                        type="text" 
                        value={cardExpiry} 
                        onChange={e => setCardExpiry(e.target.value)} 
                        placeholder="MM/YY"
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">CVV/CVC</label>
                      <input 
                        type="password" 
                        value={cardCvc} 
                        onChange={e => setCardCvc(e.target.value)} 
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700/50 text-xs">
                    <button
                      type="button"
                      onClick={() => setCheckoutFeeModal(null)}
                      className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-750 dark:text-slate-300 font-semibold"
                    >
                      Cancel Checkout
                    </button>
                    <button
                      type="submit"
                      disabled={processingPayment}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-555 active:scale-95 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow"
                    >
                      {processingPayment ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" /> Authorize ₹{checkoutFeeModal.amount}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    );
  }

  // ==========================================
  // RENDER: Teacher Portal view
  // ==========================================
  if (user?.role === 'teacher') {
    return (
      <div className="space-y-6">
        {/* Welcome banner */}
        <div className="relative rounded-2xl overflow-hidden shadow-lg border border-primary/20 bg-gradient-to-r from-primary to-primary/80 text-white p-6 sm:p-8">
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, Educator {user.name}!
            </h2>
            <p className="mt-2 text-sm sm:text-base text-white/90">
              Submit daily student attendance registers, schedule tests, enter exam scores, and update student logs.
            </p>
          </div>
        </div>

        {/* Tab navigation headers */}
        <div className="border-b border-slate-200 dark:border-slate-800">
          <nav className="-mb-px flex space-x-6 text-sm font-semibold">
            <button
              onClick={() => setTeacherActiveTab('overview')}
              className={`py-3 border-b-2 transition-all ${
                teacherActiveTab === 'overview'
                  ? 'border-primary text-primary dark:text-white'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              Overview Dashboard
            </button>
            <button
              onClick={() => setTeacherActiveTab('attendance')}
              className={`py-3 border-b-2 transition-all ${
                teacherActiveTab === 'attendance'
                  ? 'border-primary text-primary dark:text-white'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              Take Attendance
            </button>
            <button
              onClick={() => setTeacherActiveTab('assignments')}
              className={`py-3 border-b-2 transition-all ${
                teacherActiveTab === 'assignments'
                  ? 'border-primary text-primary dark:text-white'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              Assignments & Homework
            </button>
          </nav>
        </div>

        {/* Loading spinners */}
        {loading && !teacherDashData ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-xs text-slate-550">Loading educator panel dashboard...</p>
          </div>
        ) : (
          <div>
            {/* SUB-TAB: Overview */}
            {teacherActiveTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Metric widgets */}
                  <div className="glass-card p-5 rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Assigned Classes</span>
                    <strong className="text-3xl font-black text-slate-905 dark:text-white mt-2">{teacherDashData?.classesCount || 0}</strong>
                    <span className="text-[10px] text-slate-400 mt-1">Total school class groups</span>
                  </div>

                  <div className="glass-card p-5 rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Enrolled Students</span>
                    <strong className="text-3xl font-black text-slate-905 dark:text-white mt-2">{teacherDashData?.studentsCount || 0}</strong>
                    <span className="text-[10px] text-slate-400 mt-1">Multi-tenant scope roster</span>
                  </div>

                  <div className="glass-card p-5 rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Attendance Logs Today</span>
                    <strong className="text-3xl font-black text-emerald-500 mt-2">{teacherDashData?.attendanceTodayCount || 0}</strong>
                    <span className="text-[10px] text-slate-400 mt-1">Attendance logs created today</span>
                  </div>

                  <div className="glass-card p-5 rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Ungraded Homework</span>
                    <strong className="text-3xl font-black text-amber-500 mt-2">{teacherDashData?.ungradedCount || 0}</strong>
                    <span className="text-[10px] text-slate-400 mt-1">Student submissions pending grade</span>
                  </div>
                </div>

                {/* Quick tasks panel */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 bg-white dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-bold uppercase tracking-wide">Daily Register</span>
                      <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400"><UserCheck className="w-5 h-5" /></span>
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Class Attendance</h4>
                      <p className="text-xs text-slate-500 mt-1">Submit the daily attendance roster for your assigned Grade section.</p>
                    </div>
                    <button 
                      onClick={() => setTeacherActiveTab('attendance')}
                      className="w-full py-2 bg-primary text-white text-xs font-bold rounded-lg shadow active:scale-95 transition-all"
                    >
                      Open Attendance Sheet
                    </button>
                  </div>

                  <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 bg-white dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-bold uppercase tracking-wide">Grading Panel</span>
                      <span className="p-2 rounded-lg bg-indigo-500/10 text-primary"><Award className="w-5 h-5" /></span>
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Record Marks</h4>
                      <p className="text-xs text-slate-500 mt-1">Input grades, marks, and academic remarks for recent homework submissions.</p>
                    </div>
                    <button 
                      onClick={() => setTeacherActiveTab('assignments')}
                      className="w-full py-2 bg-primary text-white text-xs font-bold rounded-lg shadow active:scale-95 transition-all"
                    >
                      Grade Homework Submissions
                    </button>
                  </div>

                  <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 bg-white dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-550 font-bold uppercase tracking-wide">Homework Dispatcher</span>
                      <span className="p-2 rounded-lg bg-indigo-500/10 text-primary"><BookOpen className="w-5 h-5" /></span>
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Curriculum Plan</h4>
                      <p className="text-xs text-slate-500 mt-1">Upload syllabus guidelines and homework items for the student portal.</p>
                    </div>
                    <button 
                      onClick={() => setTeacherActiveTab('assignments')}
                      className="w-full py-2 bg-primary text-white text-xs font-bold rounded-lg shadow active:scale-95 transition-all"
                    >
                      Publish New Homework
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB: Take Attendance */}
            {teacherActiveTab === 'attendance' && (
              <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm bg-white dark:bg-slate-900 space-y-6">
                
                {/* Roster Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-semibold">
                  <div>
                    <label className="block text-slate-400 uppercase tracking-wider mb-1 text-[10px]">Select Class</label>
                    <select
                      value={attendanceClassId}
                      onChange={e => setAttendanceClassId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                    >
                      {teacherClasses.map(cls => (
                        <option key={cls._id} value={cls._id} className="dark:bg-slate-800">{cls.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 uppercase tracking-wider mb-1 text-[10px]">Select Section</label>
                    <select
                      value={attendanceSection}
                      onChange={e => setAttendanceSection(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                    >
                      {teacherClasses.find(c => c._id === attendanceClassId)?.sections?.map(sec => (
                        <option key={sec} value={sec} className="dark:bg-slate-800">Section {sec}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 uppercase tracking-wider mb-1 text-[10px]">Attendance Date</label>
                    <input
                      type="date"
                      value={attendanceDate}
                      onChange={e => setAttendanceDate(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {attendanceMsg && (
                  <div className={`p-3 border rounded-lg text-xs font-medium ${
                    attendanceMsg.includes('successfully')
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                  }`}>
                    {attendanceMsg}
                  </div>
                )}

                {/* Roster student list */}
                {loadingRoster ? (
                  <div className="py-12 flex flex-col items-center justify-center space-y-2">
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    <p className="text-[10px] text-slate-500">Querying student logs...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {attendanceRoster.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 text-xs italic">
                        No active students found in the selected class and section.
                      </div>
                    ) : (
                      <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                        {attendanceRoster.map((student) => (
                          <div key={student._id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                              <strong className="text-slate-900 dark:text-white font-bold block text-sm">{student.name}</strong>
                              <span className="text-[10px] text-slate-500 font-mono">Admission: {student.admissionNo}</span>
                            </div>

                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleAttendanceChange(student._id, 'present')}
                                className={`px-4 py-1.5 rounded-lg font-bold transition-all ${
                                  student.status === 'present'
                                    ? 'bg-emerald-500 text-white shadow-md'
                                    : 'border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                              >
                                Present
                              </button>
                              <button
                                onClick={() => handleAttendanceChange(student._id, 'absent')}
                                className={`px-4 py-1.5 rounded-lg font-bold transition-all ${
                                  student.status === 'absent'
                                    ? 'bg-rose-500 text-white shadow-md'
                                    : 'border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                              >
                                Absent
                              </button>
                              <button
                                onClick={() => handleAttendanceChange(student._id, 'late')}
                                className={`px-4 py-1.5 rounded-lg font-bold transition-all ${
                                  student.status === 'late'
                                    ? 'bg-amber-500 text-white shadow-md'
                                    : 'border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                              >
                                Late
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {attendanceRoster.length > 0 && (
                      <div className="flex justify-end pt-4">
                        <button
                          onClick={submitAttendanceRoster}
                          disabled={savingAttendance}
                          className="px-6 py-2.5 bg-primary hover:opacity-90 active:scale-95 text-white text-xs font-bold rounded-lg shadow transition-all flex items-center gap-1.5"
                        >
                          {savingAttendance ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <>
                              <UserCheck className="w-4 h-4" /> Register Daily Attendance
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* SUB-TAB: Assignments & Homework */}
            {teacherActiveTab === 'assignments' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left side: Create Assignment Form */}
                <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm bg-white dark:bg-slate-900 space-y-4 lg:col-span-1 h-fit">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
                    <Plus className="w-4 h-4" /> Create Homework Assignment
                  </h3>

                  {assignmentSuccessMsg && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-semibold">
                      {assignmentSuccessMsg}
                    </div>
                  )}

                  <form onSubmit={handleCreateAssignment} className="space-y-3.5 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Class</label>
                      <select
                        value={assignClassId}
                        onChange={e => setAssignClassId(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                      >
                        {teacherClasses.map(cls => (
                          <option key={cls._id} value={cls._id} className="dark:bg-slate-800">{cls.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Section</label>
                      <select
                        value={assignSection}
                        onChange={e => setAssignSection(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                      >
                        {teacherClasses.find(c => c._id === assignClassId)?.sections?.map(sec => (
                          <option key={sec} value={sec} className="dark:bg-slate-800">Section {sec}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Subject</label>
                      <select
                        value={assignSubject}
                        onChange={e => setAssignSubject(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                      >
                        <option value="Mathematics" className="dark:bg-slate-800">Mathematics</option>
                        <option value="Physics" className="dark:bg-slate-800">Physics</option>
                        <option value="Chemistry" className="dark:bg-slate-800">Chemistry</option>
                        <option value="Biology" className="dark:bg-slate-800">Biology</option>
                        <option value="English" className="dark:bg-slate-800">English</option>
                        <option value="Computer Sci." className="dark:bg-slate-800">Computer Sci.</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Assignment Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Calculus Exercises"
                        value={assignTitle}
                        onChange={e => setAssignTitle(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Description / Guidelines</label>
                      <textarea
                        rows="3"
                        placeholder="Detail homework instructions..."
                        value={assignDescription}
                        onChange={e => setAssignDescription(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Due Date</label>
                      <input
                        type="date"
                        value={assignDueDate}
                        onChange={e => setAssignDueDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={creatingAssignment}
                      className="w-full py-2 bg-primary hover:opacity-90 active:scale-95 text-white font-bold rounded-lg shadow transition-all flex items-center justify-center gap-1"
                    >
                      {creatingAssignment ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" /> Publish Assignment
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Right side: Created Assignments & Submissions List */}
                <div className="space-y-4 lg:col-span-2">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">Assignments & Submissions</h3>

                  {teacherAssignments.length === 0 ? (
                    <div className="glass-card p-12 text-center text-slate-400 text-xs rounded-xl border border-slate-200 dark:border-slate-800">
                      No assignments published yet. Use the dispatcher to create one.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {teacherAssignments.map((asg) => (
                        <div key={asg._id} className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 space-y-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-[9px] font-bold uppercase tracking-wider bg-indigo-500/10 text-primary px-2 py-0.5 rounded">
                                {asg.classId?.name} ({asg.section}) - {asg.subject}
                              </span>
                              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mt-1.5">{asg.title}</h4>
                              <p className="text-xs text-slate-450 mt-0.5">Due Date: {new Date(asg.dueDate).toLocaleDateString()}</p>
                            </div>
                            <span className="text-[10px] font-semibold text-slate-400">
                              Submissions: {asg.submissions?.length || 0}
                            </span>
                          </div>

                          {/* Student Submissions List */}
                          {asg.submissions && asg.submissions.length > 0 && (
                            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2 text-xs">
                              <span className="text-[9px] text-slate-450 uppercase font-black tracking-wider block">Student Submissions:</span>
                              <div className="space-y-2.5">
                                {asg.submissions.map((sub) => (
                                  <div key={sub._id || sub.studentId?._id} className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <strong className="text-slate-800 dark:text-slate-200 font-bold">{sub.studentId?.name}</strong>
                                        <span className="text-[10px] text-slate-500 font-mono">({sub.studentId?.admissionNo})</span>
                                        <span className={`px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wider ${
                                          sub.status === 'graded' 
                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' 
                                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400'
                                        }`}>
                                          {sub.status}
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-slate-500 leading-relaxed font-sans mt-1 bg-white dark:bg-slate-950 p-2 rounded border border-slate-100 dark:border-slate-850">
                                        {sub.answerText}
                                      </p>
                                      {sub.status === 'graded' && (
                                        <div className="text-[10px] text-emerald-500 font-medium">
                                          Grade: <strong>{sub.grade}</strong> {sub.feedback && `| Feedback: "${sub.feedback}"`}
                                        </div>
                                      )}
                                    </div>

                                    {sub.status === 'submitted' && (
                                      <button
                                        onClick={() => {
                                          setInputGrade('A');
                                          setInputFeedback('');
                                          setGradeSubmissionModal({
                                            assignmentId: asg._id,
                                            studentId: sub.studentId?._id || sub.studentId,
                                            studentName: sub.studentId?.name,
                                            title: asg.title,
                                            answerText: sub.answerText
                                          });
                                        }}
                                        className="px-3.5 py-1 bg-primary hover:opacity-90 active:scale-95 text-white text-[11px] font-semibold rounded-lg shadow shrink-0 self-end sm:self-center"
                                      >
                                        Evaluate Grade
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        )}

        {/* MODAL: Evaluate Grade submission */}
        {gradeSubmissionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-2xl relative">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-indigo-500" /> Grade Homework Submission
              </h3>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-3">Student: {gradeSubmissionModal.studentName}</p>

              <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-lg border border-slate-100 dark:border-slate-800 text-xs space-y-1 mb-4">
                <span className="text-[9px] text-slate-450 uppercase font-black tracking-wider block">Submitted Answer Response:</span>
                <p className="text-slate-700 dark:text-slate-300 font-sans italic leading-relaxed">
                  "{gradeSubmissionModal.answerText}"
                </p>
              </div>

              <form onSubmit={submitGradingFeedback} className="space-y-4 text-xs">
                <div className="grid grid-cols-3 gap-4 items-center">
                  <div className="col-span-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Score / Grade</label>
                    <select
                      value={inputGrade}
                      onChange={e => setInputGrade(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                    >
                      <option value="A+" className="dark:bg-slate-800">A+</option>
                      <option value="A" className="dark:bg-slate-800">A</option>
                      <option value="B+" className="dark:bg-slate-800">B+</option>
                      <option value="B" className="dark:bg-slate-800">B</option>
                      <option value="C" className="dark:bg-slate-800">C</option>
                      <option value="D" className="dark:bg-slate-800">D</option>
                      <option value="F" className="dark:bg-slate-800">F</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Feedback Remarks</label>
                    <input
                      type="text"
                      placeholder="e.g. Excellent thesis analysis..."
                      value={inputFeedback}
                      onChange={e => setInputFeedback(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                  <button
                    type="button"
                    onClick={() => setGradeSubmissionModal(null)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-750 dark:text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingGrade}
                    className="px-5 py-2 bg-primary hover:opacity-90 active:scale-95 text-white rounded-lg font-semibold flex items-center gap-1 shadow"
                  >
                    {submittingGrade ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Award className="w-3.5 h-3.5" /> Submit Score
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    );
  }

  // ==========================================
  // RENDER: School Admin Dashboard (Default)
  // ==========================================
  const stats = [
    { name: 'Total Students', value: '1,248', change: '+4.75%', changeType: 'increase', icon: <GraduationCap className="w-5 h-5 text-indigo-400" /> },
    { name: 'Active Teachers', value: '84', change: '+2.1%', changeType: 'increase', icon: <Users className="w-5 h-5 text-indigo-400" /> },
    { name: 'Daily Attendance', value: '94.2%', change: '-0.4%', changeType: 'decrease', icon: <Calendar className="w-5 h-5 text-indigo-400" /> },
    { name: 'Fees Collected (Mtd)', value: '₹14.2L', change: '+12.5%', changeType: 'increase', icon: <CreditCard className="w-5 h-5 text-indigo-400" /> }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative rounded-2xl overflow-hidden shadow-lg border border-primary/20 bg-gradient-to-r from-primary to-primary/80 text-white p-6 sm:p-8">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome to {tenant?.schoolName || 'EduCore School'}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-white/90">
            Managing academic programs, student lifecycle documents, attendance lists, and fee receipts for your school in a unified portal.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button className="px-4 py-2 bg-white text-primary font-semibold text-sm rounded-lg shadow hover:bg-slate-50 active:scale-95 transition-all flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Add Admission
            </button>
            <button className="px-4 py-2 bg-primary-dark/30 border border-white/20 text-white font-semibold text-sm rounded-lg hover:bg-white/10 active:scale-95 transition-all flex items-center gap-1.5">
              <FileText className="w-4 h-4" /> Manage Exams
            </button>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 opacity-15 text-8xl p-4 hidden md:block select-none">
          🏫
        </div>
      </div>

      {/* Grid of widgets */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div 
            key={item.name} 
            className="glass-card hover-scale p-5 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">{item.name}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{item.value}</p>
              <div className="mt-1 flex items-center space-x-1.5">
                <span className={`text-xs font-semibold ${
                  item.changeType === 'increase' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-455'
                }`}>
                  {item.change}
                </span>
                <span className="text-xs text-slate-450">vs last month</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center shadow-inner shrink-0">
              {item.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Demonstration dynamic switching section */}
      <div className="glass-card p-6 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
          <Sparkles className="w-5 h-5 text-indigo-400" /> Multi-Tenancy Demonstration
        </h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          This single React codebase automatically adapts to the sub-domain config mapping. You can toggle between different school subdomains to view how the application logo, dynamic styling variables (<span className="text-primary font-semibold">Primary Color</span>, <span className="text-secondary font-semibold">Secondary Color</span>), and portal page titles immediately adapt!
        </p>

        <div className="mt-6 border-t border-slate-100 dark:border-slate-700 pt-6">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Choose School Tenant Profile
          </h4>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => window.location.search = '?tenant=schoola'}
              className={`flex-1 min-w-[200px] flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                tenant?.subdomain === 'schoola' 
                  ? 'border-blue-500 bg-blue-500/5 shadow-md shadow-blue-500/5' 
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center text-white text-xs">A</span>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">Delhi Public School</div>
                  <div className="text-xs text-slate-550">subdomain: schoola</div>
                </div>
              </div>
              <span className="text-blue-500 text-xs font-semibold">#1E3A8A</span>
            </button>

            <button 
              onClick={() => window.location.search = '?tenant=schoolb'}
              className={`flex-1 min-w-[200px] flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                tenant?.subdomain === 'schoolb' 
                  ? 'border-emerald-500 bg-emerald-500/5 shadow-md shadow-emerald-500/5' 
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="w-8 h-8 rounded-full bg-emerald-800 flex items-center justify-center text-white text-xs">B</span>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">St. Mary School</div>
                  <div className="text-xs text-slate-550">subdomain: schoolb</div>
                </div>
              </div>
              <span className="text-emerald-500 text-xs font-semibold">#065F46</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
