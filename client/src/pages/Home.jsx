import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { useTenantTheme } from '../context/TenantThemeContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
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
  Bell,
  Check,
  X,
  Lock,
  ArrowRight,
  TrendingUp,
  Receipt,
  Printer
} from 'lucide-react';

const Home = () => {
  const { tenant } = useTenantTheme();
  const { user } = useAuth();
  const location = useLocation();
  
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

  // Sync tab from URL path dynamically
  useEffect(() => {
    const path = location.pathname;
    if (path === '/myprofile') {
      setStudentActiveTab('profile');
    } else if (path === '/attendance') {
      setStudentActiveTab('attendance');
    } else if (path === '/homework') {
      setStudentActiveTab('homework');
    } else if (path === '/fees') {
      setStudentActiveTab('fees');
    } else if (path === '/exams') {
      setStudentActiveTab('exams');
    } else if (path === '/timetable') {
      setStudentActiveTab('timetable');
    } else if (path === '/announcements') {
      setStudentActiveTab('announcements');
    } else if (path === '/messages') {
      setStudentActiveTab('messages');
    } else if (path === '/documents') {
      setStudentActiveTab('documents');
    } else {
      setStudentActiveTab('overview');
    }
  }, [location.pathname]);

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
        const studentData = res.data.data.student;
        if (studentData) {
          localStorage.setItem('studentClassSection', `${studentData.classId?.name || 'Class 10'} - Section ${studentData.section || 'A'}`);
        }
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

    // Calculate dynamic stats
    const totalClasses = studentAttendance.length;
    const presentClasses = studentAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
    const attendancePercentage = stats?.percentage || "0.0";
    
    const pendingHomeworkCount = studentDashData?.pendingAssignmentsCount || 0;
    
    const pendingFees = studentFees.filter(f => f.status === 'pending');
    const totalUnpaidAmount = pendingFees.reduce((sum, f) => sum + f.amount, 0);
    const pendingFeesCount = studentDashData?.pendingFeesCount || 0;

    const classSection = localStorage.getItem('studentClassSection') || 'Class 3 - Section A';

    // Dynamic Exams count based on assignments with "exam" or "test" in description/title
    const examCount = studentAssignments.filter(a => 
      a.title.toLowerCase().includes('exam') || 
      a.title.toLowerCase().includes('test') ||
      a.description.toLowerCase().includes('exam') || 
      a.description.toLowerCase().includes('test')
    ).length;

    // Dynamic upcoming deadlines from real homework
    const upcomingDeadlines = studentAssignments
      .filter(a => a.submissionStatus === 'pending')
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 2);

    // Dynamic Announcements List
    const getAnnouncements = () => {
      const list = [];
      
      // Dynamic homework announcements
      studentAssignments.slice(0, 2).forEach(asg => {
        list.push({
          id: `asg-${asg._id}`,
          title: `New Homework: ${asg.title}`,
          time: 'Recently posted',
          icon: 'FileText',
          color: 'indigo',
          description: `Subject: ${asg.subject}. Submission is pending with a due date of ${new Date(asg.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}.`
        });
      });

      // Default customized notices
      list.push({
        id: 'notice-1',
        title: 'School Holiday Notice',
        time: '2 days ago',
        icon: 'Bell',
        color: 'pink',
        description: `All classes in ${tenant?.schoolName || 'Apex Academy'} will remain closed on account of public celebrations.`
      });

      list.push({
        id: 'notice-2',
        title: 'PTM Schedule Reminder',
        time: '5 days ago',
        icon: 'Users',
        color: 'yellow',
        description: `Parent-Teacher interaction session for ${classSection} is scheduled for Friday from 12:00 PM.`
      });

      return list;
    };

    const announcementsList = getAnnouncements();

    // Dynamic subject performance stats based on graded assignments
    const getSubjectStats = () => {
      const gradesMap = {
        'A+': 98, 'A': 95, 'A-': 90,
        'B+': 88, 'B': 85, 'B-': 80,
        'C+': 78, 'C': 75, 'C-': 70,
        'D': 60, 'F': 40
      };
      const subjects = {};
      studentAssignments.forEach(asg => {
        if (asg.submissionStatus === 'graded' && asg.grade) {
          const numericGrade = gradesMap[asg.grade.toUpperCase()] || parseFloat(asg.grade) || 80;
          if (!subjects[asg.subject]) {
            subjects[asg.subject] = { sum: 0, count: 0 };
          }
          subjects[asg.subject].sum += numericGrade;
          subjects[asg.subject].count += 1;
        }
      });

      const list = Object.keys(subjects).map(sub => ({
        name: sub,
        percentage: Math.round(subjects[sub].sum / subjects[sub].count)
      }));

      if (list.length === 0) {
        const distinctSubjects = [...new Set(studentAssignments.map(a => a.subject))];
        if (distinctSubjects.length > 0) {
          return distinctSubjects.map(sub => ({ name: sub, percentage: 80 }));
        }
        return [
          { name: 'Mathematics', percentage: 85 },
          { name: 'Science', percentage: 78 },
          { name: 'English', percentage: 72 },
          { name: 'Social Studies', percentage: 68 },
          { name: 'Computer', percentage: 90 }
        ];
      }
      return list;
    };

    const subjectPerformanceList = getSubjectStats();

    return (
      <div className="space-y-8 bg-[#090e1a] text-slate-100 min-h-screen">
        
        {/* Welcome Section */}
        {studentActiveTab === 'overview' && (
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="text-left">
              <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest block mb-1">
                Dashboard Overview
              </span>
              <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
                Welcome back, {user.name.toLowerCase()}! 👋
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                Here's what's happening with your academics today.
              </p>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB: OVERVIEW VIEW */}
        {/* ========================================================== */}
        {studentActiveTab === 'overview' && (
          <div className="space-y-6">
            
            {/* Row 1: 4 Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Card 1: Attendance */}
              <div className="bg-[#0d1527] border border-[#1e293b]/60 rounded-2xl p-5 shadow-lg flex items-center justify-between hover:border-[#1e293b] transition-all">
                <div className="space-y-1.5 text-left">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Attendance Rate</span>
                  <strong className="text-3xl font-black text-white block">{attendancePercentage}%</strong>
                  <span className="text-[10px] text-slate-400 font-bold block">
                    Present: {stats?.present || 0} / {totalClasses} days
                  </span>
                </div>
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>

              {/* Card 2: Homework */}
              <div className="bg-[#0d1527] border border-[#1e293b]/60 rounded-2xl p-5 shadow-lg flex items-center justify-between hover:border-[#1e293b] transition-all">
                <div className="space-y-1.5 text-left">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Pending Homework</span>
                  <strong className="text-3xl font-black text-white block">{pendingHomeworkCount}</strong>
                  <span className="text-[10px] text-slate-400 font-bold block">Submissions Pending</span>
                </div>
                <div className="w-11 h-11 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400">
                  <BookOpen className="w-5 h-5" />
                </div>
              </div>

              {/* Card 3: Unpaid Fees */}
              <div className="bg-[#0d1527] border border-[#1e293b]/60 rounded-2xl p-5 shadow-lg flex items-center justify-between hover:border-[#1e293b] transition-all">
                <div className="space-y-1.5 text-left">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Unpaid Fees</span>
                  <strong className="text-3xl font-black text-white block">
                    ₹{totalUnpaidAmount.toLocaleString()}
                  </strong>
                  <span className="text-[10px] text-slate-400 font-bold block">
                    {pendingFeesCount} Invoice{pendingFeesCount !== 1 ? 's' : ''} Pending
                  </span>
                </div>
                <div className="w-11 h-11 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                  <CreditCard className="w-5 h-5" />
                </div>
              </div>

              {/* Card 4: Upcoming Exams */}
              <div className="bg-[#0d1527] border border-[#1e293b]/60 rounded-2xl p-5 shadow-lg flex items-center justify-between hover:border-[#1e293b] transition-all">
                <div className="space-y-1.5 text-left">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Upcoming Exams</span>
                  <strong className="text-3xl font-black text-white block">{examCount}</strong>
                  <span className="text-[10px] text-slate-400 font-bold block">In Next 7 Days</span>
                </div>
                <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Clock className="w-5 h-5" />
                </div>
              </div>

            </div>

            {/* Row 2: ID Card Banner & Upcoming Events */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* ID Card Violet/Purple Gradient Banner (Takes 2 cols) */}
              <div className="lg:col-span-2 bg-gradient-to-br from-[#2e1065] to-[#4c1d95] rounded-2xl p-6 sm:p-8 border border-purple-500/20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-purple-950/10">
                <div className="space-y-4 max-w-sm text-left relative z-10">
                  <h4 className="text-xl font-black text-white">Digital Identity Card</h4>
                  <p className="text-xs text-purple-200 leading-relaxed">
                    Your school digital ID card has been issued and is ready. You can print it or show it directly on mobile devices.
                  </p>
                  <Link 
                    to="/myprofile"
                    className="inline-block px-5 py-2.5 bg-purple-600 hover:bg-purple-550 text-white font-extrabold text-[11px] rounded-xl shadow-md transition-all active:scale-95 tracking-wider uppercase"
                  >
                    View ID Card
                  </Link>
                </div>
                
                {/* Visual Card Mock */}
                <div className="w-72 bg-gradient-to-br from-[#1b1c30] to-[#121320] rounded-xl border border-purple-500/30 p-4 shadow-2xl shadow-black/60 flex flex-col space-y-3 shrink-0 transform md:rotate-3 hover:rotate-0 transition-transform duration-300 relative z-10">
                  <div className="flex items-center gap-2.5 border-b border-slate-800/80 pb-2">
                    <div className="w-5 h-5 rounded-md bg-purple-500 flex items-center justify-center text-white text-[10px] font-black shrink-0 shadow-inner">A</div>
                    <div className="text-left">
                      <h5 className="text-[9px] font-black text-white leading-none">{tenant?.schoolName || 'Apex Academy'}</h5>
                      <span className="text-[7px] text-purple-400 font-bold uppercase tracking-widest block mt-0.5">STUDENT IDENTITY CARD</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-tr from-pink-500 to-indigo-500 text-white flex items-center justify-center font-black text-sm uppercase shadow">
                      {user?.name?.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <div className="text-left space-y-0.5 min-w-0">
                      <h6 className="text-[11px] font-black text-white truncate">{user?.name}</h6>
                      <p className="text-[8px] text-purple-400 font-extrabold">{classSection}</p>
                      <p className="text-[8px] text-slate-400 font-mono font-bold">{profile?.admissionNo || 'ADM-2026-2153'}</p>
                    </div>
                  </div>
                </div>
                
                {/* Styled background light flare */}
                <div className="absolute w-48 h-48 bg-pink-500/20 rounded-full blur-[60px] -bottom-24 -right-12"></div>
              </div>

              {/* Sidebar: Upcoming Events (Takes 1 col) */}
              <div className="bg-[#0d1527] border border-[#1e293b]/60 rounded-2xl p-5 shadow-lg flex flex-col space-y-4">
                <div className="flex items-center justify-between border-b border-[#1e293b]/60 pb-3">
                  <h4 className="text-sm font-extrabold text-white">Upcoming Events</h4>
                  <a href="#" onClick={(e) => e.preventDefault()} className="text-[10px] text-pink-500 font-bold hover:underline">View All</a>
                </div>

                <div className="space-y-3.5 flex-1 flex flex-col justify-center">
                  {upcomingDeadlines.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-500 font-semibold bg-[#121b33] p-3 rounded-xl border border-[#1e293b]/30">
                      🎉 No pending homework due!
                    </div>
                  ) : (
                    upcomingDeadlines.map((dead) => (
                      <div key={dead._id} className="flex items-center gap-4 bg-[#121b33] p-3 rounded-xl border border-[#1e293b]/30">
                        <div className="w-11 h-11 bg-white text-slate-900 rounded-xl flex flex-col items-center justify-center font-black uppercase text-center shadow shrink-0">
                          <span className="text-[8px] text-pink-500 leading-none">
                            {new Date(dead.dueDate).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                          </span>
                          <span className="text-base leading-none block mt-0.5">
                            {new Date(dead.dueDate).getDate()}
                          </span>
                        </div>
                        <div className="text-left min-w-0 flex-1">
                          <h5 className="font-extrabold text-[12px] text-white truncate">{dead.title}</h5>
                          <p className="text-[9px] text-slate-400 mt-0.5 font-medium truncate">{dead.subject} • Due {new Date(dead.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Row 3: Recent Announcements & Subject Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Recent Announcements (Takes 2 cols) */}
              <div className="lg:col-span-2 bg-[#0d1527] border border-[#1e293b]/60 rounded-2xl p-5 shadow-lg flex flex-col space-y-4">
                <div className="flex items-center justify-between border-b border-[#1e293b]/60 pb-3">
                  <h4 className="text-sm font-extrabold text-white">Recent Announcements</h4>
                  <Link to="/announcements" className="text-[10px] text-pink-500 font-bold hover:underline">View All</Link>
                </div>

                <div className="space-y-4">
                  {announcementsList.map((ann, idx) => {
                    const colorMap = {
                      indigo: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', text: 'text-indigo-400' },
                      pink: { bg: 'bg-pink-500/10', border: 'border-pink-500/20', text: 'text-pink-400' },
                      yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-400' }
                    };
                    const theme = colorMap[ann.color] || colorMap.indigo;
                    return (
                      <div key={ann.id} className={`flex items-start gap-4 ${idx > 0 ? 'border-t border-[#1e293b]/40 pt-4' : ''}`}>
                        <div className={`w-9 h-9 rounded-xl ${theme.bg} border ${theme.border} ${theme.text} flex items-center justify-center shrink-0`}>
                          {ann.icon === 'Bell' && <Bell className="w-4 h-4" />}
                          {ann.icon === 'FileText' && <FileText className="w-4 h-4" />}
                          {ann.icon === 'Users' && <Users className="w-4 h-4" />}
                        </div>
                        <div className="text-left space-y-1 min-w-0 flex-1">
                          <div className="flex justify-between items-center gap-4">
                            <h5 className="font-extrabold text-[12px] text-white truncate">{ann.title}</h5>
                            <span className="text-[8px] text-slate-500 font-bold shrink-0">{ann.time}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            {ann.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Subject Performance (Takes 1 col) */}
              <div className="bg-[#0d1527] border border-[#1e293b]/60 rounded-2xl p-5 shadow-lg flex flex-col space-y-4">
                <div className="flex items-center justify-between border-b border-[#1e293b]/60 pb-3">
                  <h4 className="text-sm font-extrabold text-white">Subject Performance</h4>
                  <a href="#" onClick={(e) => e.preventDefault()} className="text-[10px] text-pink-500 font-bold hover:underline">View All</a>
                </div>

                <div className="space-y-4 flex-grow flex flex-col justify-center text-left">
                  {subjectPerformanceList.map((sub, idx) => {
                    const colors = [
                      { text: 'text-emerald-400', progress: 'bg-emerald-500' },
                      { text: 'text-teal-400', progress: 'bg-teal-450' },
                      { text: 'text-amber-500', progress: 'bg-amber-500' },
                      { text: 'text-orange-500', progress: 'bg-orange-500' },
                      { text: 'text-rose-500', progress: 'bg-rose-500' }
                    ];
                    const color = colors[idx % colors.length];
                    return (
                      <div key={sub.name} className="space-y-1 text-left">
                        <div className="flex justify-between text-[11px] font-bold text-slate-355">
                          <span>{sub.name}</span>
                          <span className={color.text}>{sub.percentage}%</span>
                        </div>
                        <div className="w-full bg-[#16223f] h-2 rounded-full overflow-hidden">
                          <div className={color.progress + " h-full rounded-full"} style={{ width: `${sub.percentage}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================== */}
        {/* TAB: PROFILE VIEW */}
        {/* ========================================================== */}
        {studentActiveTab === 'profile' && (
          <div className="max-w-2xl mx-auto space-y-6 text-left">
            <div className="bg-[#0d1527] border border-[#1e293b]/60 rounded-2xl p-6 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full blur-[40px] pointer-events-none"></div>
              
              <div className="flex flex-col items-center text-center space-y-4 border-b border-[#1e293b]/60 pb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-pink-500 to-indigo-500 text-white flex items-center justify-center font-extrabold text-3xl uppercase shadow">
                  {user?.name?.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">{user?.name}</h3>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#1a233a] border border-[#1e293b]/80 text-pink-400 block w-fit mx-auto mt-2">
                    {profile?.admissionNo || 'ADM-2026-2153'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 text-xs text-left">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Official Email</span>
                  <strong className="text-slate-200 mt-0.5 block">{profile?.email || user.email}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Academic Class</span>
                  <strong className="text-slate-200 mt-0.5 block">{profile?.classId?.name || 'Class 3'}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Class Section</span>
                  <strong className="text-slate-200 mt-0.5 block">Section {profile?.section || 'A'}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Date of Birth</span>
                  <strong className="text-slate-200 mt-0.5 block">
                    {profile?.dob ? new Date(profile.dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
                  </strong>
                </div>
                <div className="md:col-span-2 border-t border-[#1e293b]/40 pt-4 text-left">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block text-left">Parent / Guardian Details</span>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <span className="text-[9px] text-slate-500 font-bold block">Parent Name</span>
                      <strong className="text-slate-200 mt-0.5 block">{profile?.parentName || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 font-bold block">Parent Contact</span>
                      <strong className="text-slate-200 mt-0.5 block">{profile?.parentPhone || 'N/A'}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Official ID badge card for print */}
            <div className="bg-[#0d1527] border border-[#1e293b]/60 rounded-2xl p-6 shadow-lg space-y-4 text-center">
              <h4 className="text-sm font-extrabold text-white flex items-center justify-center gap-2">
                <CreditCard className="w-4 h-4 text-pink-500" /> Print Identity Badge
              </h4>
              <p className="text-[11px] text-slate-400">Click the button below to print your official student ID badge layout.</p>
              
              <div className="border border-[#1e293b]/60 rounded-2xl p-6 bg-slate-900/40 w-fit mx-auto" id="printable-id-card-area">
                <div className="w-72 bg-gradient-to-br from-[#1b1c30] to-[#121320] rounded-xl border border-purple-500/30 p-5 shadow-2xl flex flex-col space-y-4">
                  <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                    <div className="w-6 h-6 rounded-md bg-purple-500 flex items-center justify-center text-white text-xs font-black shrink-0">A</div>
                    <div className="text-left">
                      <h5 className="text-[10px] font-black text-white leading-none">{tenant?.schoolName || 'Apex Academy'}</h5>
                      <span className="text-[7px] text-purple-400 font-extrabold tracking-widest block mt-0.5">STUDENT IDENTITY CARD</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-500 to-indigo-500 text-white flex items-center justify-center font-black text-xl uppercase shadow border-2 border-purple-500/20">
                      {user?.name?.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <h6 className="text-[13px] font-black text-white">{user?.name}</h6>
                      <p className="text-[10px] text-purple-400 font-extrabold block mt-0.5">{classSection}</p>
                    </div>
                  </div>
                  <div className="w-full grid grid-cols-2 gap-2 text-left border-t border-slate-800 pt-3.5 text-[9px] text-slate-400 font-semibold">
                    <div>
                      <span className="text-[7px] text-slate-500 font-bold block">ADM No.</span>
                      <strong className="text-slate-355">{profile?.admissionNo || 'ADM-2026-2153'}</strong>
                    </div>
                    <div>
                      <span className="text-[7px] text-slate-500 font-bold block">DOB</span>
                      <strong className="text-slate-355">
                        {profile?.dob ? new Date(profile.dob).toLocaleDateString() : 'N/A'}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-pink-600 hover:bg-pink-550 text-white font-extrabold text-xs rounded-xl shadow active:scale-95 transition-all flex items-center gap-1.5 mx-auto"
              >
                <Printer className="w-4 h-4" /> Print ID Card
              </button>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB: ATTENDANCE VIEW */}
        {/* ========================================================== */}
        {studentActiveTab === 'attendance' && (
          <div className="bg-[#0d1527] border border-[#1e293b]/60 rounded-2xl p-6 shadow-lg space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-[#1e293b]/60 pb-4 gap-4 text-left">
              <div>
                <h3 className="text-lg font-extrabold text-white">Daily Attendance Log</h3>
                <p className="text-xs text-slate-455 mt-1">Roster record history of your school classes.</p>
              </div>
              <div className="px-4 py-2 bg-[#121b33] rounded-xl border border-[#1e293b]/60 text-xs font-semibold text-emerald-400 flex items-center gap-1.5 w-fit">
                <CheckCircle className="w-4 h-4" /> Attendance Percentage: {attendancePercentage}%
              </div>
            </div>

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-2">
                <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Querying attendance list...</span>
              </div>
            ) : studentAttendance.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-550">No attendance records found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs text-slate-400 font-medium">
                  <thead className="bg-[#121b33] border-b border-[#1e293b]/60 text-slate-350 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4 text-center">Status</th>
                      <th className="px-6 py-4">Verification Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e293b]/30">
                    {studentAttendance.map((log) => (
                      <tr key={log._id} className="hover:bg-[#1a233a]/20">
                        <td className="px-6 py-4 font-bold text-white">
                          {new Date(log.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border ${
                            log.status === 'present' 
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                              : log.status === 'absent' 
                                ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
                                : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-555 font-semibold italic text-left">Verified by Homeroom Teacher</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB: HOMEWORK VIEW */}
        {/* ========================================================== */}
        {studentActiveTab === 'homework' && (
          <div className="space-y-6 text-left">
            <div>
              <h3 className="text-lg font-extrabold text-white">Homework & Assignments</h3>
              <p className="text-xs text-slate-455 mt-1">Review assignments lists and submit answer writeups.</p>
            </div>

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-2">
                <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Loading syllabus homework...</span>
              </div>
            ) : studentAssignments.length === 0 ? (
              <div className="bg-[#0d1527] border border-[#1e293b]/60 rounded-2xl p-8 text-center text-xs text-slate-550">
                No homework assignments listed for your class scope.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {studentAssignments.map((asg) => (
                  <div key={asg._id} className="bg-[#0d1527] border border-[#1e293b]/60 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-[#1e293b] transition-all shadow-lg">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-pink-500/10 border border-pink-500/20 text-pink-400 uppercase tracking-wide">
                          {asg.subject}
                        </span>
                        <span className="text-[9px] text-slate-555 font-bold">
                          Due: {new Date(asg.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-sm text-white">{asg.title}</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed truncate">{asg.description}</p>
                    </div>

                    <div className="border-t border-[#1e293b]/40 pt-4 flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                        asg.submissionStatus === 'graded' 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                          : asg.submissionStatus === 'submitted'
                            ? 'bg-indigo-500/10 border-[#1e293b]/50 text-indigo-400'
                            : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                      }`}>
                        {asg.submissionStatus}
                      </span>

                      {asg.submissionStatus === 'pending' ? (
                        <button
                          onClick={() => {
                            setSubmitError('');
                            setSubmitAnswerText('');
                            setSubmitAssignmentModal(asg);
                          }}
                          className="px-3.5 py-1.5 bg-pink-600 hover:bg-pink-550 text-white font-extrabold text-[10px] rounded-lg tracking-wide uppercase transition-all shadow"
                        >
                          Submit Work
                        </button>
                      ) : (
                        <button
                          onClick={() => alert(`Your submission answer was:\n"${asg.answerText}"\n\nGrade: ${asg.grade || 'Ungraded'}\nFeedback: ${asg.feedback || 'Pending evaluation.'}`)}
                          className="px-3.5 py-1.5 bg-[#1a233a] border border-[#1e293b]/85 hover:bg-[#1a233a]/80 text-slate-200 font-bold text-[10px] rounded-lg tracking-wide uppercase transition-all"
                        >
                          View Evaluation
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB: FEES VIEW */}
        {/* ========================================================== */}
        {studentActiveTab === 'fees' && (
          <div className="space-y-6 text-left">
            <div>
              <h3 className="text-lg font-extrabold text-white">Fee Invoices & Payments</h3>
              <p className="text-xs text-slate-455 mt-1">Clear pending academic board fees and sports charges.</p>
            </div>

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-2">
                <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Checking billing ledger...</span>
              </div>
            ) : studentFees.length === 0 ? (
              <div className="bg-[#0d1527] border border-[#1e293b]/60 rounded-2xl p-8 text-center text-xs text-slate-550">
                No billing statements found.
              </div>
            ) : (
              <div className="bg-[#0d1527] border border-[#1e293b]/60 rounded-2xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs text-slate-400 font-medium">
                    <thead className="bg-[#121b33] border-b border-[#1e293b]/60 text-slate-355 font-bold uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Fee Statement</th>
                        <th className="px-6 py-4">Due Date</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-center">Checkout</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1e293b]/30">
                      {studentFees.map((fee) => (
                        <tr key={fee._id} className="hover:bg-[#1a233a]/20">
                          <td className="px-6 py-4">
                            <div>
                              <strong className="text-white font-extrabold block text-[13px]">{fee.title}</strong>
                              <span className="text-[9px] text-slate-550 block mt-0.5">TXN: {fee.transactionId || 'Unpaid Invoice'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-bold">{new Date(fee.dueDate).toLocaleDateString()}</td>
                          <td className="px-6 py-4 font-extrabold text-white text-[13px]">₹{fee.amount.toLocaleString()}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border ${
                              fee.status === 'paid' 
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                            }`}>
                              {fee.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {fee.status === 'pending' ? (
                              <button
                                onClick={() => {
                                  setPaymentSuccessMsg('');
                                  setCardName(user?.name || '');
                                  setCheckoutFeeModal(fee);
                                }}
                                className="px-4 py-2 bg-pink-600 hover:bg-pink-550 active:scale-95 text-white font-extrabold text-[10px] rounded-lg tracking-wide uppercase transition-all shadow"
                              >
                                Checkout
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-555 font-bold uppercase tracking-wider block">Cleared</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB MOCKS: EXAMS, TIMETABLE, ANNOUNCEMENTS, MESSAGES, DOCUMENTS */}
        {/* ========================================================== */}
        {['exams', 'timetable', 'announcements', 'messages', 'documents'].includes(studentActiveTab) && (
          <div className="bg-[#0d1527] border border-[#1e293b]/60 rounded-2xl p-12 shadow-lg max-w-xl mx-auto space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto text-2xl shadow animate-pulse">
              <AlertTriangle className="w-6 h-6" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-black text-white capitalize">{studentActiveTab} Module</h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                This page is not available. Please contact your school administrator if you believe this is in error.
              </p>
            </div>
          </div>
        )}

        {/* MODAL: Submit assignment */}
        {submitAssignmentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-[#0d1527] border border-[#1e293b]/80 rounded-2xl p-6 shadow-2xl relative text-left">
              <h3 className="text-base font-extrabold text-white mb-1 flex items-center gap-1.5">
                <BookOpen className="w-4.5 h-4.5 text-pink-500" /> Submit Homework Work
              </h3>
              <p className="text-[10px] text-slate-550 uppercase tracking-wider mb-4">Assignment: {submitAssignmentModal.title}</p>

              {submitError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs font-semibold mb-4 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> {submitError}
                </div>
              )}

              <form onSubmit={handleAssignmentSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-555 uppercase tracking-wider mb-1">Answer Response Text</label>
                  <textarea
                    rows={4}
                    placeholder="Write your homework answers or submission remarks..."
                    value={submitAnswerText}
                    onChange={e => setSubmitAnswerText(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-lg border border-[#1e293b] bg-[#121b33]/40 text-white placeholder-slate-550 focus:outline-none focus:border-pink-500 transition-all font-sans"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#1e293b]/40">
                  <button
                    type="button"
                    onClick={() => setSubmitAssignmentModal(null)}
                    className="px-4 py-2 border border-[#1e293b] hover:bg-[#1a233a] rounded-lg text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingAssignment}
                    className="px-5 py-2 bg-pink-650 hover:bg-pink-550 active:scale-95 text-white rounded-lg font-bold flex items-center gap-1.5 shadow"
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

        {/* MODAL: Checkout payments */}
        {checkoutFeeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
            <div className="w-full max-w-md bg-[#0d1527] border border-[#1e293b]/80 rounded-2xl p-6 shadow-2xl relative text-left">
              <h3 className="text-base font-extrabold text-white mb-1 flex items-center gap-1.5">
                <Receipt className="w-4.5 h-4.5 text-pink-500" /> Payment Portal Checkout
              </h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-4">Billed Fee: {checkoutFeeModal.title}</p>

              {paymentSuccessMsg ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                    <Check className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-white">Payment Authorized</h4>
                    <p className="text-[10.5px] text-slate-400 mt-1 leading-relaxed">
                      Your payment has been successfully recorded in the school portal billing ledger database.
                    </p>
                  </div>
                  <button
                    onClick={() => setCheckoutFeeModal(null)}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-555 text-white font-extrabold text-xs rounded-xl shadow transition-all active:scale-95 tracking-wide"
                  >
                    Close Invoice
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePayFeeSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Card Holder Name</label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={e => setCardName(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg border border-[#1e293b] bg-[#121b33]/40 text-white focus:outline-none focus:border-pink-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg border border-[#1e293b] bg-[#121b33]/40 text-white focus:outline-none focus:border-pink-500 transition-all font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Expiry Date</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={e => setCardExpiry(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-lg border border-[#1e293b] bg-[#121b33]/40 text-white focus:outline-none focus:border-pink-500 transition-all font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Security Code (CVC)</label>
                      <input
                        type="password"
                        value={cardCvc}
                        onChange={e => setCardCvc(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-lg border border-[#1e293b] bg-[#121b33]/40 text-white focus:outline-none focus:border-pink-500 transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-[#1e293b]/40">
                    <button
                      type="button"
                      onClick={() => setCheckoutFeeModal(null)}
                      className="px-4 py-2 border border-[#1e293b] hover:bg-[#1a233a] rounded-lg text-slate-355 font-semibold"
                    >
                      Cancel Checkout
                    </button>
                    <button
                      type="submit"
                      disabled={processingPayment}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-555 active:scale-95 text-white rounded-lg font-bold flex items-center gap-1.5 shadow"
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
