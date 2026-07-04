import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { useTenantTheme } from '../../../context/TenantThemeContext';
import { useAuth } from '../../../context/AuthContext';
import StudentOverview from './components/StudentOverview';
import StudentAttendance from './components/StudentAttendance';
import StudentHomework from './components/StudentHomework';
import StudentFees from './components/StudentFees';
import StudentExams from './components/StudentExams';
import StudentTimetable from './components/StudentTimetable';
import StudentAnnouncements from './components/StudentAnnouncements';
import StudentMessages from './components/StudentMessages';
import StudentDocuments from './components/StudentDocuments';
import { Sparkles, Loader2 } from 'lucide-react';

const StudentPortal = () => {
  const { tenant } = useTenantTheme();
  const { user } = useAuth();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [studentDashData, setStudentDashData] = useState(null);
  const [studentAttendance, setStudentAttendance] = useState([]);
  const [studentAssignments, setStudentAssignments] = useState([]);
  const [studentFees, setStudentFees] = useState([]);
  const [studentActiveTab, setStudentActiveTab] = useState('overview');

  useEffect(() => {
    fetchStudentDashboard();
    fetchStudentAttendance();
    fetchStudentAssignments();
    fetchStudentFees();
  }, []);

  useEffect(() => {
    const path = location.pathname;
    if (path === '/myprofile') setStudentActiveTab('profile');
    else if (path === '/attendance') setStudentActiveTab('attendance');
    else if (path === '/homework') setStudentActiveTab('homework');
    else if (path === '/fees') setStudentActiveTab('fees');
    else if (path === '/exams') setStudentActiveTab('exams');
    else if (path === '/timetable') setStudentActiveTab('timetable');
    else if (path === '/announcements') setStudentActiveTab('announcements');
    else if (path === '/messages') setStudentActiveTab('messages');
    else if (path === '/documents') setStudentActiveTab('documents');
    else setStudentActiveTab('overview');
  }, [location.pathname]);

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
      if (res.data.success) setStudentAttendance(res.data.data);
    } catch (err) { console.error('Failed to load student attendance logs', err); }
  };

  const fetchStudentAssignments = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/v1/students/portal/assignments');
      if (res.data.success) setStudentAssignments(res.data.data);
    } catch (err) { console.error('Failed to load student assignments', err); }
  };

  const fetchStudentFees = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/v1/students/portal/fees');
      if (res.data.success) setStudentFees(res.data.data);
    } catch (err) { console.error('Failed to load student fees logs', err); }
  };

  if (loading && !studentDashData) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 antialiased">
      {studentActiveTab === 'overview' && (
        <div className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-600 to-violet-700 p-6 sm:p-8 shadow-xl shadow-blue-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="text-left relative z-10 space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black text-white border border-white/30 bg-white/15 tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Active Session
            </span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.name?.split(' ')[0]}! 👋
            </h2>
            <p className="text-sm text-blue-100 font-medium max-w-md">
              Here's a comprehensive review of your educational status, schedules, and active tasks.
            </p>
          </div>
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-[80px]"></div>
        </div>
      )}

      {studentActiveTab === 'overview' && <StudentOverview studentDashData={studentDashData} studentAttendance={studentAttendance} studentAssignments={studentAssignments} studentFees={studentFees} user={user} tenant={tenant} />}
      {studentActiveTab === 'attendance' && <StudentAttendance studentAttendance={studentAttendance} studentDashData={studentDashData} />}
      {studentActiveTab === 'homework' && <StudentHomework studentAssignments={studentAssignments} fetchStudentAssignments={fetchStudentAssignments} fetchStudentDashboard={fetchStudentDashboard} />}
      {studentActiveTab === 'fees' && <StudentFees studentFees={studentFees} fetchStudentFees={fetchStudentFees} fetchStudentDashboard={fetchStudentDashboard} />}
      {studentActiveTab === 'exams' && <StudentExams studentAssignments={studentAssignments} />}
      {studentActiveTab === 'timetable' && <StudentTimetable />}
      {studentActiveTab === 'announcements' && <StudentAnnouncements studentAssignments={studentAssignments} />}
      {studentActiveTab === 'messages' && <StudentMessages />}
      {studentActiveTab === 'documents' && <StudentDocuments />}
    </div>
  );
};

export default StudentPortal;
