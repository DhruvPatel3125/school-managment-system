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

  // Student Redesign UI Interactive States
  const [homeworkFilter, setHomeworkFilter] = useState('all'); // 'all', 'pending', 'submitted', 'graded'
  const [homeworkSearch, setHomeworkSearch] = useState('');
  const [attendanceMonth, setAttendanceMonth] = useState('all');
  const [cardFlipped, setCardFlipped] = useState(false);
  const [timetableDay, setTimetableDay] = useState('Monday');
  const [chatTeacher, setChatTeacher] = useState('Mrs. S. Sharma (Science)');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'teacher', text: 'Hi! Did you check the new homework assigned for this week?', time: '09:15 AM' },
    { sender: 'student', text: 'Yes, Mrs. Sharma. I am currently working on the physics assignment.', time: '09:20 AM' },
    { sender: 'teacher', text: 'Perfect. Let me know if you need any help with the questions.', time: '09:25 AM' }
  ]);
  const [newMsgText, setNewMsgText] = useState('');
  const [paymentStep, setPaymentStep] = useState('form'); // 'form', 'processing', 'success'
  const [processingStatus, setProcessingStatus] = useState('');

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
      .slice(0, 3);

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
          tag: 'ACADEMIC',
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
        tag: 'HOLIDAY',
        description: `All classes in ${tenant?.schoolName || 'Apex Academy'} will remain closed on account of public celebrations.`
      });

      list.push({
        id: 'notice-2',
        title: 'PTM Schedule Reminder',
        time: '5 days ago',
        icon: 'Users',
        color: 'yellow',
        tag: 'PTM MEETING',
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
          { name: 'Mathematics', percentage: 88 },
          { name: 'General Science', percentage: 76 },
          { name: 'English Grammar', percentage: 82 },
          { name: 'Social Studies', percentage: 70 },
          { name: 'Computer Science', percentage: 92 }
        ];
      }
      return list;
    };

    const subjectPerformanceList = getSubjectStats();

    // MOCK DATASETS FOR REDESIGN
    const mockExams = [
      { id: 1, subject: 'Mathematics', code: 'MATH-301', date: '2026-07-15', time: '09:00 AM - 12:00 PM', room: 'Lab 2', invigilator: 'Mr. R. K. Sen', maxMarks: 100, syllabus: 'Algebra, Geometry, Fractions' },
      { id: 2, subject: 'General Science', code: 'SCI-302', date: '2026-07-17', time: '09:00 AM - 12:00 PM', room: 'Hall A', invigilator: 'Mrs. S. Sharma', maxMarks: 100, syllabus: 'Human Body, Light, Plants structure' },
      { id: 3, subject: 'English Grammar', code: 'ENG-303', date: '2026-07-20', time: '10:00 AM - 01:00 PM', room: 'Room 104', invigilator: 'Mr. A. Patel', maxMarks: 80, syllabus: 'Nouns, Verbs, Essay Writing, Clauses' },
      { id: 4, subject: 'Computer Basics', code: 'COMP-304', date: '2026-07-22', time: '01:30 PM - 03:30 PM', room: 'Computer Lab', invigilator: 'Miss P. Roy', maxMarks: 50, syllabus: 'Introduction to HTML, Operating Systems' },
    ];

    const mockTimetable = {
      Monday: [
        { period: '1', subject: 'Mathematics', time: '08:30 AM - 09:20 AM', room: '104', teacher: 'Mr. R. K. Sen' },
        { period: '2', subject: 'General Science', time: '09:20 AM - 10:10 AM', room: 'Science Lab', teacher: 'Mrs. S. Sharma' },
        { period: '3', subject: 'English Grammar', time: '10:30 AM - 11:20 AM', room: '104', teacher: 'Mr. A. Patel' },
        { period: '4', subject: 'Social Studies', time: '11:20 AM - 12:10 PM', room: '104', teacher: 'Miss P. Roy' },
        { period: '5', subject: 'Computer Basics', time: '01:00 PM - 01:50 PM', room: 'Computer Lab', teacher: 'Mr. R. K. Sen' },
      ],
      Tuesday: [
        { period: '1', subject: 'English Grammar', time: '08:30 AM - 09:20 AM', room: '104', teacher: 'Mr. A. Patel' },
        { period: '2', subject: 'Mathematics', time: '09:20 AM - 10:10 AM', room: '104', teacher: 'Mr. R. K. Sen' },
        { period: '3', subject: 'General Science', time: '10:30 AM - 11:20 AM', room: 'Science Lab', teacher: 'Mrs. S. Sharma' },
        { period: '4', subject: 'Art & Craft', time: '11:20 AM - 12:10 PM', room: 'Art Studio', teacher: 'Miss K. Sen' },
        { period: '5', subject: 'Physical Ed', time: '01:00 PM - 01:50 PM', room: 'Playground', teacher: 'Mr. D. Rathore' },
      ],
      Wednesday: [
        { period: '1', subject: 'Mathematics', time: '08:30 AM - 09:20 AM', room: '104', teacher: 'Mr. R. K. Sen' },
        { period: '2', subject: 'General Science', time: '09:20 AM - 10:10 AM', room: 'Science Lab', teacher: 'Mrs. S. Sharma' },
        { period: '3', subject: 'Social Studies', time: '10:30 AM - 11:20 AM', room: '104', teacher: 'Miss P. Roy' },
        { period: '4', subject: 'English Grammar', time: '11:20 AM - 12:10 PM', room: '104', teacher: 'Mr. A. Patel' },
        { period: '5', subject: 'Library Study', time: '01:00 PM - 01:50 PM', room: 'Central Library', teacher: 'Mrs. G. Joshi' },
      ],
      Thursday: [
        { period: '1', subject: 'General Science', time: '08:30 AM - 09:20 AM', room: 'Science Lab', teacher: 'Mrs. S. Sharma' },
        { period: '2', subject: 'Social Studies', time: '09:20 AM - 10:10 AM', room: '104', teacher: 'Miss P. Roy' },
        { period: '3', subject: 'Mathematics', time: '10:30 AM - 11:20 AM', room: '104', teacher: 'Mr. R. K. Sen' },
        { period: '4', subject: 'English Grammar', time: '11:20 AM - 12:10 PM', room: '104', teacher: 'Mr. A. Patel' },
        { period: '5', subject: 'Music & Theatre', time: '01:00 PM - 01:50 PM', room: 'Music Hall', teacher: 'Mr. N. Varma' },
      ],
      Friday: [
        { period: '1', subject: 'Mathematics', time: '08:30 AM - 09:20 AM', room: '104', teacher: 'Mr. R. K. Sen' },
        { period: '2', subject: 'General Science', time: '09:20 AM - 10:10 AM', room: 'Science Lab', teacher: 'Mrs. S. Sharma' },
        { period: '3', subject: 'Computer Basics', time: '10:30 AM - 11:20 AM', room: 'Computer Lab', teacher: 'Mr. R. K. Sen' },
        { period: '4', subject: 'Self Study / Project', time: '11:20 AM - 12:10 PM', room: '104', teacher: 'Class Teacher' },
        { period: '5', subject: 'Weekly Assessment', time: '01:00 PM - 01:50 PM', room: 'Exam Hall A', teacher: 'Mr. R. K. Sen' },
      ]
    };

    const mockDocuments = [
      { id: 'doc-1', name: 'Annual Report Card - Term 1.pdf', size: '1.4 MB', type: 'PDF', category: 'Academic Report', date: '2026-06-15' },
      { id: 'doc-2', name: 'Syllabus & Curriculum Guide 2026-27.pdf', size: '3.8 MB', type: 'PDF', category: 'Syllabus', date: '2026-06-01' },
      { id: 'doc-3', name: 'Sports Day Participation Certificate.png', size: '820 KB', type: 'Image', category: 'Certificate', date: '2026-05-12' },
      { id: 'doc-4', name: 'School Bus Route Map & Timings.pdf', size: '950 KB', type: 'PDF', category: 'General Info', date: '2026-06-20' },
    ];

    const mockTeachers = [
      { name: 'Mrs. S. Sharma (Science)', status: 'Online' },
      { name: 'Mr. R. K. Sen (Mathematics)', status: 'Offline' },
      { name: 'Mr. A. Patel (English)', status: 'Online' },
      { name: 'Miss P. Roy (Computer)', status: 'Online' }
    ];

    // Interactive message helper
    const handleSendMessage = (e) => {
      e.preventDefault();
      if (!newMsgText.trim()) return;

      const userMessage = { sender: 'student', text: newMsgText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setChatMessages(prev => [...prev, userMessage]);
      setNewMsgText('');

      // Auto reply mock simulation
      setTimeout(() => {
        const reply = {
          sender: 'teacher',
          text: `Got your message regarding ${chatTeacher.split(' ')[2] || 'academics'}. I will look into it and get back to you during school hours.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatMessages(prev => [...prev, reply]);
      }, 1200);
    };

    // Override Payment Checkout for detailed gateway steps
    const handlePaymentCheckoutSubmit = async (e) => {
      e.preventDefault();
      setPaymentStep('processing');
      setProcessingStatus('Securing secure client connection...');

      try {
        await new Promise(r => setTimeout(r, 800));
        setProcessingStatus('Verifying Visa/Mastercard 3D-Secure credentials...');
        await new Promise(r => setTimeout(r, 800));
        setProcessingStatus('Posting authorized ledger transaction...');
        await new Promise(r => setTimeout(r, 600));

        const res = await axios.post(`http://localhost:5001/api/v1/students/portal/fees/${checkoutFeeModal._id}/pay`);
        if (res.data.success) {
          setPaymentStep('success');
          setPaymentSuccessMsg(`Payment Processed Successfully! Transaction ID: ${res.data.data.transactionId}`);
          fetchStudentFees();
          fetchStudentDashboard();
        }
      } catch (err) {
        alert(err.response?.data?.error || 'Payment transaction failed.');
        setPaymentStep('form');
        setCheckoutFeeModal(null);
      }
    };

    return (
      <div className="space-y-8 bg-[#070a13] text-slate-100 min-h-screen pb-12 antialiased">
        
        {/* Welcome Section */}
        {studentActiveTab === 'overview' && (
          <div className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-gradient-to-r from-slate-900 to-[#0e172a] p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="text-left relative z-10 space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black text-primary border border-primary/20 bg-primary/10 tracking-widest uppercase">
                <Sparkles className="w-3.5 h-3.5 animate-pulse text-primary" /> Active Session
              </span>
              <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                Welcome back, {user.name.split(' ')[0]}! 👋
              </h2>
              <p className="text-sm text-slate-400 font-medium max-w-md">
                Here's a comprehensive review of your educational status, schedules, and active tasks.
              </p>
            </div>
            {/* Ambient glows */}
            <div className="absolute right-0 top-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px]"></div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB: OVERVIEW VIEW */}
        {/* ========================================================== */}
        {studentActiveTab === 'overview' && (
          <div className="space-y-8">
            
            {/* Metrics cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Card 1: Attendance */}
              <div className="glass-card bg-[#0b101f]/80 border border-slate-800/60 rounded-3xl p-6 shadow-xl flex items-center justify-between hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 group">
                <div className="space-y-2 text-left">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Attendance Rate</span>
                  <strong className="text-3xl font-black text-white block tracking-tight">{attendancePercentage}%</strong>
                  <span className="text-xs text-emerald-400 font-semibold block flex items-center gap-1.5">
                    <Check className="w-3 h-3" /> {stats?.present || 0} / {totalClasses} classes
                  </span>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform shadow-inner">
                  <Calendar className="w-6 h-6" />
                </div>
              </div>

              {/* Card 2: Homework */}
              <div className="glass-card bg-[#0b101f]/80 border border-slate-800/60 rounded-3xl p-6 shadow-xl flex items-center justify-between hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 group">
                <div className="space-y-2 text-left">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pending Tasks</span>
                  <strong className="text-3xl font-black text-white block tracking-tight">{pendingHomeworkCount}</strong>
                  <span className="text-xs text-amber-500 font-semibold block flex items-center gap-1.5">
                    <Clock className="w-3 h-3 animate-pulse" /> Submissions Due
                  </span>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform shadow-inner">
                  <BookOpen className="w-6 h-6" />
                </div>
              </div>

              {/* Card 3: Unpaid Fees */}
              <div className="glass-card bg-[#0b101f]/80 border border-slate-800/60 rounded-3xl p-6 shadow-xl flex items-center justify-between hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 group">
                <div className="space-y-2 text-left">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Outstanding Fees</span>
                  <strong className="text-3xl font-black text-white block tracking-tight">₹{totalUnpaidAmount.toLocaleString()}</strong>
                  <span className="text-xs text-rose-500 font-semibold block flex items-center gap-1.5">
                    <AlertTriangle className="w-3 h-3" /> {pendingFeesCount} invoices unpaid
                  </span>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform shadow-inner">
                  <CreditCard className="w-6 h-6" />
                </div>
              </div>

              {/* Card 4: Upcoming Exams */}
              <div className="glass-card bg-[#0b101f]/80 border border-slate-800/60 rounded-3xl p-6 shadow-xl flex items-center justify-between hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 group">
                <div className="space-y-2 text-left">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Upcoming Exams</span>
                  <strong className="text-3xl font-black text-white block tracking-tight">{examCount}</strong>
                  <span className="text-xs text-primary font-semibold block flex items-center gap-1.5">
                    <Award className="w-3 h-3" /> In Next 30 Days
                  </span>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-inner">
                  <GraduationCap className="w-6 h-6" />
                </div>
              </div>

            </div>

            {/* Main Interactive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column (ID card & timelines - takes 2 cols) */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* 3D Student Card Widget */}
                <div className="glass-card bg-slate-900/65 rounded-3xl p-6 border border-slate-800/80 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="space-y-4 max-w-sm text-left relative z-10">
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 tracking-wider block w-fit">STUDENT CREDENTIAL</span>
                    <h4 className="text-2xl font-black text-white leading-tight">Digital Identity Pass</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Your certified digital ID. Use it to gain entry, verify identity, or print a hard-copy badge layout.
                    </p>
                    <button 
                      onClick={() => setCardFlipped(!cardFlipped)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-[11px] rounded-xl shadow-md transition-all active:scale-95 tracking-wider uppercase flex items-center gap-2 border border-slate-700/60"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-primary" /> Flip card View
                    </button>
                  </div>
                  
                  {/* Flip Card Container */}
                  <div className="w-80 h-48 shrink-0 relative perspective cursor-pointer" onClick={() => setCardFlipped(!cardFlipped)}>
                    <div className={`w-full h-full duration-700 transform-style-3d relative ${cardFlipped ? 'rotate-y-180' : ''}`}>
                      
                      {/* FRONT OF ID CARD */}
                      <div className="absolute inset-0 w-full h-full rounded-2xl p-5 backface-hidden flex flex-col justify-between shadow-2xl bg-gradient-to-br from-primary to-[#2e1065] border border-white/10">
                        {/* School header */}
                        <div className="flex items-center justify-between border-b border-white/10 pb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center text-white text-xs font-black shadow-inner">A</div>
                            <div className="text-left">
                              <h5 className="text-[10px] font-black text-white leading-none truncate max-w-[150px]">{tenant?.schoolName || 'Apex Academy'}</h5>
                              <span className="text-[6px] text-white/50 font-extrabold uppercase tracking-widest block mt-0.5">ACADEMIC PROFILE PASS</span>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[7px] font-extrabold uppercase tracking-wider">ACTIVE</span>
                        </div>
                        {/* Student details */}
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-pink-500 to-indigo-500 text-white flex items-center justify-center font-black text-lg uppercase shadow-lg border border-white/20 shrink-0">
                            {user?.name?.split(' ').map(n => n[0]).slice(0, 2).join('')}
                          </div>
                          <div className="text-left space-y-1 min-w-0 flex-1">
                            <h6 className="text-sm font-black text-white truncate leading-none mb-0.5">{user?.name}</h6>
                            <p className="text-[9px] text-white/70 font-extrabold">{classSection}</p>
                            <p className="text-[8px] text-white/40 font-mono font-bold">{profile?.admissionNo || 'ADM-2026-2153'}</p>
                          </div>
                        </div>
                        {/* Footer barcode design */}
                        <div className="flex justify-between items-center text-[7px] text-white/40 font-bold border-t border-white/5 pt-2">
                          <span>EXPIRES: MAY 2027</span>
                          <span className="font-mono">||| | | |||| | ||| | |||</span>
                        </div>
                      </div>

                      {/* BACK OF ID CARD */}
                      <div className="absolute inset-0 w-full h-full rounded-2xl p-5 backface-hidden rotate-y-180 flex flex-col justify-between shadow-2xl bg-gradient-to-br from-[#121320] to-[#1b1c30] border border-slate-800">
                        <div className="text-left space-y-3">
                          <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-850 pb-1">Emergency Contacts & Info</h5>
                          <div className="grid grid-cols-2 gap-3 text-[9px]">
                            <div>
                              <span className="text-slate-500 block">Parent / Guardian:</span>
                              <strong className="text-slate-300 font-bold block">{profile?.parentName || 'N/A'}</strong>
                            </div>
                            <div>
                              <span className="text-slate-500 block">Emergency Call:</span>
                              <strong className="text-slate-300 font-mono font-bold block">{profile?.parentPhone || 'N/A'}</strong>
                            </div>
                            <div>
                              <span className="text-slate-500 block">Official Email:</span>
                              <strong className="text-slate-300 truncate block">{profile?.email || user.email}</strong>
                            </div>
                            <div>
                              <span className="text-slate-500 block">Blood Group:</span>
                              <strong className="text-slate-300 font-bold block">O+ Positive</strong>
                            </div>
                          </div>
                        </div>
                        <div className="text-center text-[7px] text-slate-500 font-semibold border-t border-slate-850 pt-2 flex justify-between items-center">
                          <span>EDUCORE ECOSYSTEM SECURITY</span>
                          <span className="text-primary font-bold">SCAN PASS</span>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                {/* Subject Performance & Goals progress */}
                <div className="glass-card bg-[#0b101f]/80 border border-slate-850 rounded-3xl p-6 shadow-xl text-left">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-6">
                    <h4 className="text-base font-extrabold text-white">Subject Assessment Report</h4>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Dynamic Stats</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {subjectPerformanceList.map((sub, idx) => {
                      const colors = [
                        { text: 'text-indigo-400', progress: 'bg-indigo-500', bg: 'bg-indigo-500/10' },
                        { text: 'text-emerald-400', progress: 'bg-emerald-500', bg: 'bg-emerald-500/10' },
                        { text: 'text-amber-500', progress: 'bg-amber-500', bg: 'bg-amber-500/10' },
                        { text: 'text-rose-500', progress: 'bg-rose-500', bg: 'bg-rose-500/10' }
                      ];
                      const color = colors[idx % colors.length];
                      return (
                        <div key={sub.name} className="bg-slate-950/40 p-4 rounded-2xl border border-slate-850 hover:border-slate-800 transition-colors space-y-2">
                          <div className="flex justify-between items-center text-xs font-bold">
                            <span className="text-slate-300 truncate">{sub.name}</span>
                            <span className={`${color.text} px-2 py-0.5 rounded-lg ${color.bg} text-[10px]`}>{sub.percentage}%</span>
                          </div>
                          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                            <div className={`${color.progress} h-full rounded-full transition-all duration-1000`} style={{ width: `${sub.percentage}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Right Column (Upcoming Deadlines & Short Timelines) */}
              <div className="space-y-8">
                
                {/* Upcoming Deadlines */}
                <div className="glass-card bg-[#0b101f]/80 border border-slate-850 rounded-3xl p-6 shadow-xl flex flex-col space-y-4 text-left">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h4 className="text-sm font-extrabold text-white">Task Deadlines</h4>
                    <span className="flex h-2 w-2 relative shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                    </span>
                  </div>

                  <div className="space-y-4">
                    {upcomingDeadlines.length === 0 ? (
                      <div className="text-center py-8 text-xs text-slate-550 bg-slate-950/40 p-3 rounded-2xl border border-slate-850">
                        🎉 No homework assignments pending.
                      </div>
                    ) : (
                      upcomingDeadlines.map((dead) => (
                        <div key={dead._id} className="flex gap-4 items-center bg-slate-950/45 p-3.5 rounded-2xl border border-slate-850 hover:border-slate-800 transition-colors">
                          <div className="w-12 h-12 bg-white text-slate-950 rounded-xl flex flex-col items-center justify-center font-black uppercase text-center shadow shrink-0">
                            <span className="text-[9px] text-rose-500 leading-none">
                              {new Date(dead.dueDate).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                            </span>
                            <span className="text-lg leading-none block mt-1">
                              {new Date(dead.dueDate).getDate()}
                            </span>
                          </div>
                          <div className="text-left min-w-0 flex-1 space-y-0.5">
                            <h5 className="font-extrabold text-[12px] text-white truncate">{dead.title}</h5>
                            <p className="text-[10px] text-slate-450 truncate font-semibold">{dead.subject}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Recent Announcements bulletin */}
                <div className="glass-card bg-[#0b101f]/80 border border-slate-850 rounded-3xl p-6 shadow-xl flex flex-col space-y-4 text-left">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h4 className="text-sm font-extrabold text-white">Notice Bulletin</h4>
                    <Link to="/announcements" className="text-[10px] text-primary font-bold hover:underline">See All</Link>
                  </div>

                  <div className="space-y-4">
                    {announcementsList.slice(0, 3).map((ann) => {
                      return (
                        <div key={ann.id} className="bg-slate-950/40 p-3.5 rounded-2xl border border-slate-850 space-y-1.5">
                          <div className="flex justify-between items-start gap-4">
                            <h5 className="font-extrabold text-[11px] text-white truncate">{ann.title}</h5>
                            <span className="px-1.5 py-0.5 rounded text-[7px] font-black bg-primary/10 border border-primary/20 text-primary uppercase shrink-0 tracking-wider">{ann.tag}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-relaxed truncate">
                            {ann.description}
                          </p>
                          <span className="text-[8px] text-slate-550 block font-semibold">{ann.time}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ========================================================== */}
        {/* TAB: PROFILE VIEW */}
        {/* ========================================================== */}
        {studentActiveTab === 'profile' && (
          <div className="max-w-4xl mx-auto space-y-8 text-left">
            <div className="glass-card bg-slate-900/65 border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-[60px] pointer-events-none"></div>
              
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-slate-800/80 pb-8">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-primary to-purple-650 text-white flex items-center justify-center font-black text-4xl uppercase shadow-2xl border-2 border-white/10 shrink-0">
                  {user?.name?.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div className="text-center sm:text-left space-y-2.5">
                  <h3 className="text-2xl font-black text-white tracking-tight">{user?.name}</h3>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-slate-950 border border-slate-850 text-primary">
                      ADM: {profile?.admissionNo || 'ADM-2026-2153'}
                    </span>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 uppercase tracking-wider font-extrabold">
                      Active Student
                    </span>
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 text-xs">
                
                {/* Academic info */}
                <div className="space-y-4 bg-slate-950/40 p-5 rounded-2xl border border-slate-850">
                  <h4 className="text-sm font-extrabold text-white border-b border-slate-850 pb-2 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-primary" /> Academic Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-left">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Assigned Class</span>
                      <strong className="text-slate-200 mt-0.5 block text-sm">{profile?.classId?.name || 'Class 3'}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Section Group</span>
                      <strong className="text-slate-200 mt-0.5 block text-sm">Section {profile?.section || 'A'}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Official Email</span>
                      <strong className="text-slate-200 mt-0.5 block break-all font-semibold">{profile?.email || user.email}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Date of Birth</span>
                      <strong className="text-slate-200 mt-0.5 block text-sm">
                        {profile?.dob ? new Date(profile.dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Family details */}
                <div className="space-y-4 bg-slate-950/40 p-5 rounded-2xl border border-slate-850">
                  <h4 className="text-sm font-extrabold text-white border-b border-slate-850 pb-2 flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" /> Parent / Guardian Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-left">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Guardian Name</span>
                      <strong className="text-slate-200 mt-0.5 block text-sm">{profile?.parentName || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Phone Contact</span>
                      <strong className="text-slate-200 mt-0.5 block text-sm font-mono">{profile?.parentPhone || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Relationship</span>
                      <strong className="text-slate-200 mt-0.5 block text-sm">Parent / Father</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Authorized Address</span>
                      <strong className="text-slate-200 mt-0.5 block text-sm">Main Campus Roster</strong>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Printable ID badge section */}
            <div className="glass-card bg-slate-900/65 border border-slate-800/80 rounded-3xl p-6 shadow-xl space-y-6 text-center">
              <div className="space-y-2">
                <h4 className="text-base font-extrabold text-white flex items-center justify-center gap-2">
                  <Printer className="w-5 h-5 text-primary" /> Identity Badge Printing Center
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">Generate a high-resolution printable ID badge for student verifications on site.</p>
              </div>
              
              <div className="border border-slate-800/80 rounded-2xl p-6 bg-slate-950/40 w-fit mx-auto shadow-inner" id="printable-id-card-area">
                <div className="w-72 bg-gradient-to-br from-primary to-[#2e1065] rounded-2xl border border-white/10 p-5 shadow-2xl flex flex-col space-y-5 text-left text-white">
                  <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                    <div className="w-6 h-6 rounded-md bg-white/15 flex items-center justify-center text-white text-xs font-black shrink-0">A</div>
                    <div className="text-left">
                      <h5 className="text-[9px] font-black text-white leading-none">{tenant?.schoolName || 'Apex Academy'}</h5>
                      <span className="text-[6px] text-white/50 font-extrabold tracking-widest block mt-0.5">STUDENT IDENTITY BADGE</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-pink-500 to-indigo-500 text-white flex items-center justify-center font-black text-lg uppercase shadow-lg border border-white/20 shrink-0">
                      {user?.name?.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <div className="text-left space-y-1 min-w-0">
                      <h6 className="text-xs font-black text-white truncate leading-none">{user?.name}</h6>
                      <p className="text-[9px] text-white/70 font-extrabold">{classSection}</p>
                      <p className="text-[8px] text-white/40 font-mono font-bold">{profile?.admissionNo || 'ADM-2026-2153'}</p>
                    </div>
                  </div>

                  <div className="w-full grid grid-cols-2 gap-2 text-left border-t border-white/10 pt-3.5 text-[8px] text-white/50 font-semibold">
                    <div>
                      <span className="text-[7px] text-white/35 font-bold block">ADM No.</span>
                      <strong className="text-white block mt-0.5">{profile?.admissionNo || 'ADM-2026-2153'}</strong>
                    </div>
                    <div>
                      <span className="text-[7px] text-white/35 font-bold block">DOB</span>
                      <strong className="text-white block mt-0.5">
                        {profile?.dob ? new Date(profile.dob).toLocaleDateString() : 'N/A'}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => window.print()}
                className="px-6 py-3 bg-primary hover:bg-primary/95 text-white font-extrabold text-xs rounded-xl shadow-lg active:scale-95 transition-all flex items-center gap-2 mx-auto uppercase tracking-wider"
              >
                <Printer className="w-4 h-4" /> Print PDF ID Badge
              </button>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB: ATTENDANCE VIEW */}
        {/* ========================================================== */}
        {studentActiveTab === 'attendance' && (
          <div className="bg-[#0b101f]/80 border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8">
            
            {/* Header statistics section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-6 gap-6 text-left">
              <div>
                <h3 className="text-lg font-extrabold text-white">Daily Attendance Ledger</h3>
                <p className="text-xs text-slate-400 mt-1">Check verified daily roster logs and overall present rates.</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-xs font-semibold text-slate-350 bg-slate-950/40 px-3.5 py-2 rounded-xl border border-slate-850">
                  Month: 
                  <select 
                    value={attendanceMonth} 
                    onChange={e => setAttendanceMonth(e.target.value)}
                    className="ml-1 bg-transparent text-white font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="all" className="bg-slate-950">All Months</option>
                    <option value="07" className="bg-slate-950">July 2026</option>
                    <option value="06" className="bg-slate-950">June 2026</option>
                    <option value="05" className="bg-slate-950">May 2026</option>
                  </select>
                </div>
                <div className="px-4 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-xs font-extrabold text-emerald-400 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Rate: {attendancePercentage}%
                </div>
              </div>
            </div>

            {/* Attendance Status Summary meters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-850 text-left">
                <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Total Days Recorded</span>
                <strong className="text-2xl font-black text-white mt-1 block">{totalClasses}</strong>
              </div>
              <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-850 text-left">
                <span className="text-[10px] text-emerald-500 font-bold block uppercase tracking-wider">Present Days</span>
                <strong className="text-2xl font-black text-emerald-450 mt-1 block">{stats?.present || 0}</strong>
              </div>
              <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-850 text-left">
                <span className="text-[10px] text-rose-500 font-bold block uppercase tracking-wider">Absent Days</span>
                <strong className="text-2xl font-black text-rose-450 mt-1 block">{stats?.absent || 0}</strong>
              </div>
              <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-850 text-left">
                <span className="text-[10px] text-amber-500 font-bold block uppercase tracking-wider">Late Days</span>
                <strong className="text-2xl font-black text-amber-450 mt-1 block">{stats?.late || 0}</strong>
              </div>
            </div>

            {/* Interactive Month Grid Visualizer */}
            <div className="bg-slate-950/30 p-6 rounded-2xl border border-slate-850 text-left">
              <h4 className="text-xs font-extrabold text-slate-350 uppercase tracking-widest mb-4">Roster Dot Tracker</h4>
              <div className="flex flex-wrap gap-2.5">
                {studentAttendance.length === 0 ? (
                  <span className="text-xs text-slate-500">No logs listed.</span>
                ) : (
                  studentAttendance.map((log) => {
                    const dt = new Date(log.date);
                    const dayNum = dt.getDate();
                    const monthText = dt.toLocaleString('en-US', { month: 'short' });
                    const isPresent = log.status === 'present';
                    const isAbsent = log.status === 'absent';
                    const isLate = log.status === 'late';
                    
                    return (
                      <div 
                        key={log._id} 
                        className={`w-10 h-10 rounded-xl border flex flex-col items-center justify-center font-bold text-[10px] ${
                          isPresent 
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                            : isAbsent 
                              ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
                              : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                        }`}
                        title={`${log.status.toUpperCase()} on ${dt.toLocaleDateString()}`}
                      >
                        <span className="text-[8px] opacity-60 leading-none">{monthText}</span>
                        <span className="text-xs font-black leading-none mt-0.5">{dayNum}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Detailed Table */}
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-2">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Syncing database registers...</span>
              </div>
            ) : studentAttendance.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-550">No attendance ledger found.</div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-850 shadow-inner">
                <table className="w-full border-collapse text-left text-xs text-slate-400 font-medium">
                  <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase text-[9px] tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Session Date</th>
                      <th className="px-6 py-4 text-center">Roster Code</th>
                      <th className="px-6 py-4">Evaluation Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850/60 bg-slate-900/15">
                    {studentAttendance
                      .filter(log => {
                        if (attendanceMonth === 'all') return true;
                        const logMonth = new Date(log.date).toISOString().split('-')[1];
                        return logMonth === attendanceMonth;
                      })
                      .map((log) => (
                        <tr key={log._id} className="hover:bg-slate-800/10 transition-colors">
                          <td className="px-6 py-4 font-bold text-white">
                            {new Date(log.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex px-3 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                              log.status === 'present' 
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                : log.status === 'absent' 
                                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
                                  : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                            }`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-400 font-semibold italic text-left">Verified under general school roster rules.</td>
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-white">Homework & Assignments</h3>
                <p className="text-xs text-slate-400 mt-1">Submit answer writeups and check evaluations.</p>
              </div>
              
              {/* Search and Filters */}
              <div className="flex items-center gap-3">
                <input 
                  type="text" 
                  placeholder="Search subject..." 
                  value={homeworkSearch}
                  onChange={e => setHomeworkSearch(e.target.value)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-primary max-w-xs transition-colors"
                />
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 border-b border-slate-850 pb-2">
              {['all', 'pending', 'submitted', 'graded'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setHomeworkFilter(tab)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                    homeworkFilter === tab 
                      ? 'bg-primary text-white shadow-md' 
                      : 'text-slate-400 hover:bg-slate-900'
                  }`}
                >
                  {tab} Tasks
                </button>
              ))}
            </div>

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-2">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Syncing class homework...</span>
              </div>
            ) : studentAssignments.length === 0 ? (
              <div className="bg-[#0b101f]/80 border border-slate-800/80 rounded-3xl p-12 text-center text-xs text-slate-550">
                No active homework records found.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {studentAssignments
                  .filter(asg => {
                    if (homeworkFilter !== 'all' && asg.submissionStatus !== homeworkFilter) return false;
                    if (homeworkSearch && !asg.subject.toLowerCase().includes(homeworkSearch.toLowerCase()) && !asg.title.toLowerCase().includes(homeworkSearch.toLowerCase())) return false;
                    return true;
                  })
                  .map((asg) => {
                    const isPending = asg.submissionStatus === 'pending';
                    const isSubmitted = asg.submissionStatus === 'submitted';
                    const isGraded = asg.submissionStatus === 'graded';
                    
                    return (
                      <div key={asg._id} className="glass-card bg-[#0b101f]/80 border border-slate-850 rounded-3xl p-6 flex flex-col justify-between space-y-5 hover:border-slate-800 transition-all duration-300 shadow-xl group relative overflow-hidden">
                        
                        {/* Grade stamp overlay */}
                        {isGraded && (
                          <div className="absolute right-4 top-4 rotate-12 w-10 h-10 border-2 border-emerald-500/40 rounded-full flex items-center justify-center text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/5 select-none pointer-events-none">
                            {asg.grade || 'A'}
                          </div>
                        )}

                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black bg-primary/10 border border-primary/20 text-primary uppercase tracking-wider">
                              {asg.subject}
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold">
                              Due: {new Date(asg.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </span>
                          </div>
                          <h4 className="font-extrabold text-sm text-white group-hover:text-primary transition-colors">{asg.title}</h4>
                          <p className="text-xs text-slate-400 leading-relaxed font-medium line-clamp-2">{asg.description}</p>
                        </div>

                        <div className="border-t border-slate-800/80 pt-4 flex items-center justify-between">
                          <span className={`px-2.5 py-0.5 rounded text-[9px] font-extrabold uppercase border ${
                            isGraded 
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                              : isSubmitted
                                ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                                : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                          }`}>
                            {asg.submissionStatus}
                          </span>

                          {isPending ? (
                            <button
                              onClick={() => {
                                setSubmitError('');
                                setSubmitAnswerText('');
                                setSubmitAssignmentModal(asg);
                              }}
                              className="px-4 py-2 bg-primary hover:bg-primary/95 text-white font-extrabold text-[10px] rounded-xl tracking-wider uppercase transition-all shadow-md active:scale-95"
                            >
                              Submit Homework
                            </button>
                          ) : (
                            <button
                              onClick={() => alert(`YOUR SUBMISSION WRITEUP:\n"${asg.answerText}"\n\nGRADE: ${asg.grade || 'Pending Grading'}\nFEEDBACK: ${asg.feedback || 'Evaluating soon.'}`)}
                              className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800/60 text-slate-300 font-bold text-[10px] rounded-xl tracking-wider uppercase transition-all"
                            >
                              View Submission
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
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
              <h3 className="text-lg font-extrabold text-white">Fee Statements & Invoices</h3>
              <p className="text-xs text-slate-400 mt-1">Manage outstanding fee dues or review payment transactions.</p>
            </div>

            {/* Financial summary blocks */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-card bg-[#0b101f]/80 p-5 rounded-2xl border border-slate-850 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Unpaid Dues</span>
                  <strong className="text-2xl font-black text-white mt-1 block">₹{totalUnpaidAmount.toLocaleString()}</strong>
                </div>
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold">₹</div>
              </div>
              <div className="glass-card bg-[#0b101f]/80 p-5 rounded-2xl border border-slate-850 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Cleared Dues</span>
                  <strong className="text-2xl font-black text-emerald-450 mt-1 block">
                    ₹{studentFees.filter(f => f.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
                  </strong>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center"><CheckCircle className="w-5 h-5" /></div>
              </div>
              <div className="glass-card bg-[#0b101f]/80 p-5 rounded-2xl border border-slate-850 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Invoice Count</span>
                  <strong className="text-2xl font-black text-primary mt-1 block">{studentFees.length} Bills</strong>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><FileText className="w-5 h-5" /></div>
              </div>
            </div>

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-2">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Syncing billing ledgers...</span>
              </div>
            ) : studentFees.length === 0 ? (
              <div className="bg-[#0b101f]/80 border border-slate-800/80 rounded-3xl p-8 text-center text-xs text-slate-550">
                No billing statements found.
              </div>
            ) : (
              <div className="bg-[#0b101f]/80 border border-slate-800/80 rounded-3xl shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs text-slate-400 font-medium">
                    <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase text-[9px] tracking-widest">
                      <tr>
                        <th className="px-6 py-4">Billing Item / Invoice No</th>
                        <th className="px-6 py-4">Deadline Date</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 bg-slate-900/10">
                      {studentFees.map((fee) => (
                        <tr key={fee._id} className="hover:bg-slate-800/10 transition-colors">
                          <td className="px-6 py-4">
                            <div className="space-y-0.5">
                              <strong className="text-white font-extrabold block text-sm">{fee.title}</strong>
                              <span className="text-[9px] text-slate-500 block font-mono">TXN: {fee.transactionId || 'Awaiting Payment Clearance'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-semibold text-slate-300">{new Date(fee.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                          <td className="px-6 py-4 font-black text-white text-sm">₹{fee.amount.toLocaleString()}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex px-3 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                              fee.status === 'paid' 
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                : 'bg-amber-500/10 border-amber-500/20 text-amber-450'
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
                                  setPaymentStep('form');
                                  setCheckoutFeeModal(fee);
                                }}
                                className="px-4 py-2 bg-primary hover:bg-primary/95 text-white font-extrabold text-[10px] rounded-xl tracking-wider uppercase transition-all shadow active:scale-95"
                              >
                                Checkout
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest block">Settled</span>
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
        {/* TAB: EXAMS MODULE */}
        {/* ========================================================== */}
        {studentActiveTab === 'exams' && (
          <div className="bg-[#0b101f]/80 border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8 text-left">
            <div>
              <h3 className="text-lg font-extrabold text-white">Upcoming Examinations</h3>
              <p className="text-xs text-slate-400 mt-1">Review scheduled tests, seat numbers, and curriculum files.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column schedule list */}
              <div className="lg:col-span-2 space-y-6">
                <div className="overflow-hidden rounded-2xl border border-slate-850">
                  <table className="w-full border-collapse text-left text-xs text-slate-400">
                    <thead className="bg-slate-950 border-b border-slate-800 text-[9px] uppercase font-black tracking-widest text-slate-400">
                      <tr>
                        <th className="px-5 py-4">Subject</th>
                        <th className="px-5 py-4">Schedule</th>
                        <th className="px-5 py-4 text-center">Room/Seat</th>
                        <th className="px-5 py-4 text-center">Max Marks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850/60 bg-slate-900/10">
                      {mockExams.map((ex) => (
                        <tr key={ex.id} className="hover:bg-slate-800/10 transition-colors">
                          <td className="px-5 py-4 space-y-0.5">
                            <strong className="text-white font-extrabold text-sm block">{ex.subject}</strong>
                            <span className="text-[9px] text-slate-500 block font-mono">{ex.code}</span>
                          </td>
                          <td className="px-5 py-4 space-y-0.5 font-medium">
                            <span className="text-slate-200 block font-bold">{new Date(ex.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            <span className="text-[9px] text-slate-500 block">{ex.time}</span>
                          </td>
                          <td className="px-5 py-4 text-center font-semibold text-slate-350">
                            <span className="block">{ex.room}</span>
                            <span className="text-[8px] text-slate-500 font-bold block uppercase">{ex.invigilator}</span>
                          </td>
                          <td className="px-5 py-4 text-center text-sm font-black text-white">{ex.maxMarks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Column Hall Ticket & Tips */}
              <div className="space-y-6">
                <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-850 space-y-4">
                  <h4 className="text-xs font-black uppercase text-white tracking-widest border-b border-slate-850 pb-2">Academic Seat Ticket</h4>
                  <div className="space-y-3 text-[11px] text-slate-400 font-semibold">
                    <p className="flex justify-between"><span>Admission Roster:</span> <strong className="text-white font-mono">{profile?.admissionNo || 'ADM-2026-2153'}</strong></p>
                    <p className="flex justify-between"><span>Testing Center:</span> <strong className="text-white">Main School Block</strong></p>
                    <p className="flex justify-between"><span>Class Allocation:</span> <strong className="text-white">{classSection}</strong></p>
                    <p className="flex justify-between"><span>Verification Status:</span> <strong className="text-emerald-450 uppercase">PASSED</strong></p>
                  </div>
                  <button 
                    onClick={() => alert('Downloading admit ticket PDF... Done.')}
                    className="w-full py-2.5 bg-primary hover:bg-primary/95 text-white font-extrabold text-[10px] rounded-xl uppercase tracking-wider shadow-md transition-all active:scale-95"
                  >
                    Download Admit Pass
                  </button>
                </div>

                <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-850 space-y-2.5">
                  <h5 className="text-[10px] font-black uppercase text-amber-500 tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Exam Regulations
                  </h5>
                  <ul className="text-[10px] text-slate-450 space-y-1.5 list-disc pl-4 font-semibold leading-relaxed">
                    <li>Arrive at the testing room 15 minutes before slot timing.</li>
                    <li>Possession of smart devices in examination desk is prohibited.</li>
                    <li>Keep your printed Digital Admit Card on desk for verification.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB: TIMETABLE MODULE */}
        {/* ========================================================== */}
        {studentActiveTab === 'timetable' && (
          <div className="bg-[#0b101f]/80 border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8 text-left">
            <div className="border-b border-slate-800 pb-4">
              <h3 className="text-lg font-extrabold text-white">Weekly Class Schedule</h3>
              <p className="text-xs text-slate-400 mt-1">Browse weekly academic timelines and classroom details.</p>
            </div>

            {/* Day Selector Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-slate-850 pb-2">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                <button
                  key={day}
                  onClick={() => setTimetableDay(day)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all ${
                    timetableDay === day 
                      ? 'bg-primary text-white shadow-md' 
                      : 'text-slate-400 hover:bg-slate-900'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>

            {/* Schedule Slot Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockTimetable[timetableDay]?.map((slot) => (
                <div key={slot.period} className="bg-slate-950/40 p-5 rounded-2xl border border-slate-850 hover:border-slate-800 transition-all flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-500 border border-slate-800 text-[8px] font-black uppercase tracking-wider">
                        Period {slot.period}
                      </span>
                      <span className="text-[10px] text-slate-450 font-bold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" /> {slot.time.split(' - ')[0]}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-sm text-white">{slot.subject}</h4>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-450 border-t border-slate-900 pt-3.5 font-bold">
                    <span>Room: <strong className="text-slate-200">{slot.room}</strong></span>
                    <span>Teacher: <strong className="text-slate-200">{slot.teacher}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB: ANNOUNCEMENTS MODULE */}
        {/* ========================================================== */}
        {studentActiveTab === 'announcements' && (
          <div className="bg-[#0b101f]/80 border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8 text-left max-w-4xl mx-auto">
            <div className="border-b border-slate-800 pb-4">
              <h3 className="text-lg font-extrabold text-white">School Announcement Bulletin</h3>
              <p className="text-xs text-slate-400 mt-1">Official circular updates issued under student notifications.</p>
            </div>

            <div className="space-y-6">
              {announcementsList.map((ann) => (
                <div key={ann.id} className="bg-slate-950/40 p-5 rounded-2xl border border-slate-850 space-y-3 relative overflow-hidden group">
                  <div className="flex justify-between items-center">
                    <span className="px-2.5 py-0.5 rounded text-[8px] font-black bg-primary/10 border border-primary/20 text-primary uppercase tracking-widest font-mono">
                      {ann.tag}
                    </span>
                    <span className="text-[9px] text-slate-550 font-bold">{ann.time}</span>
                  </div>
                  <h4 className="font-extrabold text-sm text-white group-hover:text-primary transition-colors">{ann.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">{ann.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB: MESSAGES CHAT MODULE */}
        {/* ========================================================== */}
        {studentActiveTab === 'messages' && (
          <div className="bg-[#0b101f]/80 border border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden h-[550px] flex flex-col md:flex-row text-left">
            
            {/* Sidebar list of teachers */}
            <div className="w-full md:w-64 border-r border-slate-850 flex flex-col shrink-0">
              <div className="p-4 border-b border-slate-850 bg-slate-950/30">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Instructor Directory</span>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-slate-850/50 p-2 space-y-1">
                {mockTeachers.map((tc) => {
                  const isActive = chatTeacher === tc.name;
                  const initials = tc.name.split(' ').slice(1, 3).map(n => n[0]).join('');
                  return (
                    <button
                      key={tc.name}
                      onClick={() => setChatTeacher(tc.name)}
                      className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${
                        isActive ? 'bg-slate-900 border border-slate-800 text-white' : 'text-slate-400 hover:bg-slate-900/40'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-extrabold text-[10px] uppercase">
                        {initials}
                      </div>
                      <div className="min-w-0 text-left space-y-0.5">
                        <h5 className="text-[11px] font-bold truncate leading-none">{tc.name.split(' ')[0]} {tc.name.split(' ')[1]}</h5>
                        <span className={`text-[8px] font-bold block ${tc.status === 'Online' ? 'text-emerald-450' : 'text-slate-500'}`}>{tc.status}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chat conversation area */}
            <div className="flex-1 flex flex-col justify-between bg-slate-950/20">
              {/* Chat header */}
              <div className="p-4 border-b border-slate-850 bg-slate-950/40 flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="text-[12px] font-black text-white">{chatTeacher}</h4>
                  <span className="text-[8px] text-emerald-400 font-bold block">Secure School Tunnel</span>
                </div>
              </div>

              {/* Message balloons list */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {chatMessages.map((msg, index) => {
                  const isTeacher = msg.sender === 'teacher';
                  return (
                    <div key={index} className={`flex ${isTeacher ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-xs p-3.5 rounded-2xl text-xs space-y-1 font-medium ${
                        isTeacher 
                          ? 'bg-[#121b33] border border-slate-850 text-slate-200 rounded-tl-none' 
                          : 'bg-primary text-white rounded-tr-none'
                      }`}>
                        <p className="leading-relaxed">{msg.text}</p>
                        <span className="text-[8px] opacity-50 block text-right font-semibold">{msg.time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-850 bg-slate-950/45 flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Enter message for your class teacher..."
                  value={newMsgText}
                  onChange={e => setNewMsgText(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-primary transition-all font-sans"
                />
                <button
                  type="submit"
                  className="p-2.5 bg-primary hover:bg-primary/95 text-white rounded-xl shadow-md transition-all active:scale-95"
                >
                  <Send className="w-4.5 h-4.5" />
                </button>
              </form>

            </div>

          </div>
        )}

        {/* ========================================================== */}
        {/* TAB: DOCUMENTS FILE MANAGER MODULE */}
        {/* ========================================================== */}
        {studentActiveTab === 'documents' && (
          <div className="bg-[#0b101f]/80 border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8 text-left max-w-4xl mx-auto">
            <div>
              <h3 className="text-lg font-extrabold text-white">Student Locker Files</h3>
              <p className="text-xs text-slate-400 mt-1">Review official downloads, term cards, and bus itineraries.</p>
            </div>

            <div className="space-y-4">
              {mockDocuments.map((doc) => (
                <div key={doc.id} className="bg-slate-950/40 p-4 rounded-2xl border border-slate-850 flex items-center justify-between hover:border-slate-850 transition-colors">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 text-left space-y-0.5">
                      <h4 className="text-[12px] font-black text-white truncate">{doc.name}</h4>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{doc.category} • {doc.size} • {doc.date}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => alert(`Initiating download for ${doc.name}...`)}
                    className="px-4 py-2 border border-slate-800 bg-slate-950 hover:bg-slate-900 rounded-xl text-[10px] text-slate-300 font-bold uppercase tracking-wider transition-all"
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* MODAL OVERLAYS */}
        {/* ========================================================== */}

        {/* MODAL: Submit assignment */}
        {submitAssignmentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative text-left">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-white flex items-center gap-1.5">
                    <BookOpen className="w-4.5 h-4.5 text-primary animate-pulse" /> Submit Homework
                  </h3>
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Topic: {submitAssignmentModal.title}</p>
                </div>
                <button onClick={() => setSubmitAssignmentModal(null)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors">
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {submitError && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl text-xs font-semibold mb-4 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> {submitError}
                </div>
              )}

              <form onSubmit={handleAssignmentSubmit} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Answer Writeup Response</label>
                  <textarea
                    rows={5}
                    placeholder="Enter writeup response notes, questions solved, or links to cloud documents..."
                    value={submitAnswerText}
                    onChange={e => setSubmitAnswerText(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-2xl border border-slate-800 bg-slate-950/40 text-white placeholder-slate-600 focus:outline-none focus:border-primary transition-all font-sans leading-relaxed"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => setSubmitAssignmentModal(null)}
                    className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800/60 rounded-xl text-slate-300 font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingAssignment}
                    className="px-5 py-2 bg-primary hover:bg-primary/95 active:scale-95 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-lg transition-all"
                  >
                    {submittingAssignment ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" /> Post Submission
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: Checkout payment gateway mock */}
        {checkoutFeeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-left">
              
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-850 pb-4 mb-6">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-450" /> Secure Payment Checkout
                  </h3>
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Billing ID: {checkoutFeeModal._id}</span>
                </div>
                <button onClick={() => setCheckoutFeeModal(null)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors">
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {paymentStep === 'success' ? (
                <div className="text-center py-6 space-y-6">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center shadow-lg">
                    <Check className="w-7 h-7" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-lg font-black text-white">Ledger Clearance Authorized</h4>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                      Your fee clearance has been processed and saved under school database billing accounts ledger logs.
                    </p>
                  </div>
                  <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-850 max-w-xs mx-auto text-xs space-y-1.5 text-left font-semibold">
                    <p className="flex justify-between"><span>Amount Billed:</span> <strong className="text-white">₹{checkoutFeeModal.amount}</strong></p>
                    <p className="flex justify-between"><span>Status:</span> <strong className="text-emerald-400">Settled</strong></p>
                    <p className="flex justify-between"><span className="truncate">Transaction Ref:</span> <strong className="text-white font-mono break-all text-[10px]">{paymentSuccessMsg.split('ID: ')[1] || 'TXN-MOCK'}</strong></p>
                  </div>
                  <div className="flex gap-3 justify-center pt-2">
                    <button 
                      onClick={() => window.print()}
                      className="px-5 py-2.5 bg-slate-850 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all"
                    >
                      Print Receipt
                    </button>
                    <button
                      onClick={() => setCheckoutFeeModal(null)}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-550 active:scale-95 text-white font-bold text-xs rounded-xl shadow transition-all"
                    >
                      Close Portal
                    </button>
                  </div>
                </div>
              ) : paymentStep === 'processing' ? (
                <div className="py-12 text-center space-y-4">
                  <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-extrabold text-white">Processing payment transaction...</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{processingStatus}</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  
                  {/* Interactive Credit Card Mockup */}
                  <div className="w-full space-y-6">
                    <div className="w-full h-44 rounded-2xl p-5 bg-gradient-to-br from-[#1e3a8a] to-[#0f172a] border border-white/10 shadow-2xl relative flex flex-col justify-between text-white overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px]"></div>
                      <div className="flex justify-between items-start border-b border-white/5 pb-2">
                        <span className="text-[9px] font-black tracking-widest uppercase">Apex Payment Gateway</span>
                        {cardNumber.startsWith('4') ? (
                          <span className="text-xs font-black italic text-sky-400">VISA</span>
                        ) : (
                          <span className="text-xs font-black italic text-amber-500">MasterCard</span>
                        )}
                      </div>
                      <div className="space-y-1">
                        <span className="text-[8px] text-white/45 block tracking-wider font-semibold">CARD NUMBER</span>
                        <p className="font-mono text-base tracking-widest text-white truncate">{cardNumber || '•••• •••• •••• ••••'}</p>
                      </div>
                      <div className="flex justify-between text-[9px] border-t border-white/5 pt-2">
                        <div>
                          <span className="text-white/45 block font-bold">CARD HOLDER</span>
                          <strong className="text-white uppercase truncate max-w-[120px] block">{cardName || 'STUDENT NAME'}</strong>
                        </div>
                        <div>
                          <span className="text-white/45 block font-bold">EXPIRES</span>
                          <strong className="text-white font-mono">{cardExpiry || 'MM/YY'}</strong>
                        </div>
                        <div>
                          <span className="text-white/45 block font-bold">CVV</span>
                          <strong className="text-white font-mono">•••</strong>
                        </div>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500 font-semibold bg-slate-950/30 p-3 rounded-xl border border-slate-850 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-primary shrink-0" /> SSL 256-Bit Encrypted Secure Sandbox Checkout Tunnel.
                    </div>
                  </div>

                  {/* Form fields */}
                  <form onSubmit={handlePaymentCheckoutSubmit} className="space-y-4 text-xs font-semibold">
                    <div className="space-y-1">
                      <label className="block text-[10px] text-slate-500 uppercase tracking-wider">Card Holder Name</label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={e => setCardName(e.target.value)}
                        required
                        placeholder="Holder full name"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950/40 text-white focus:outline-none focus:border-primary transition-all placeholder-slate-700"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] text-slate-500 uppercase tracking-wider">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={e => setCardNumber(e.target.value)}
                        required
                        placeholder="4111 2222 3333 4444"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950/40 text-white focus:outline-none focus:border-primary transition-all font-mono placeholder-slate-700"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] text-slate-500 uppercase tracking-wider">Expiry Date</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          placeholder="12/28"
                          onChange={e => setCardExpiry(e.target.value)}
                          required
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950/40 text-white focus:outline-none focus:border-primary transition-all font-mono placeholder-slate-700"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] text-slate-500 uppercase tracking-wider">CVV (CVC)</label>
                        <input
                          type="password"
                          value={cardCvc}
                          placeholder="•••"
                          onChange={e => setCardCvc(e.target.value)}
                          required
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950/40 text-white focus:outline-none focus:border-primary transition-all font-mono placeholder-slate-700"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-850">
                      <button
                        type="button"
                        onClick={() => setCheckoutFeeModal(null)}
                        className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800/60 rounded-xl text-slate-400"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-550 active:scale-95 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-950/30 transition-all"
                      >
                        Authorize ₹{checkoutFeeModal.amount}
                      </button>
                    </div>
                  </form>
                  
                </div>
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
