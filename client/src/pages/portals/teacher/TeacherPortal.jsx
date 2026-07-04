import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { Loader2 } from 'lucide-react';
import TeacherOverview from './components/TeacherOverview';
import TeacherAttendance from './components/TeacherAttendance';
import TeacherAssignments from './components/TeacherAssignments';

const TeacherPortal = () => {
  const { user } = useAuth();
  
  // Teacher States
  const [teacherDashData, setTeacherDashData] = useState(null);
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [teacherActiveTab, setTeacherActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  // Attendance Tracker state
  const [attendanceClassId, setAttendanceClassId] = useState('');
  const [attendanceSection, setAttendanceSection] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRoster, setAttendanceRoster] = useState([]);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [attendanceMsg, setAttendanceMsg] = useState('');

  // Assignment Creator state
  const [assignTitle, setAssignTitle] = useState('');
  const [assignDescription, setAssignDescription] = useState('');
  const [assignDueDate, setAssignDueDate] = useState('');
  const [assignClassId, setAssignClassId] = useState('');
  const [assignSection, setAssignSection] = useState('');
  const [assignSubject, setAssignSubject] = useState('Mathematics');
  const [creatingAssignment, setCreatingAssignment] = useState(false);
  const [assignmentSuccessMsg, setAssignmentSuccessMsg] = useState('');
  const [teacherAssignments, setTeacherAssignments] = useState([]);

  // Submission Grader state
  const [gradeSubmissionModal, setGradeSubmissionModal] = useState(null);
  const [inputGrade, setInputGrade] = useState('A');
  const [inputFeedback, setInputFeedback] = useState('');
  const [submittingGrade, setSubmittingGrade] = useState(false);

  useEffect(() => {
    fetchTeacherDashboard();
    fetchTeacherClasses();
    fetchTeacherAssignments();
  }, []);

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

  useEffect(() => {
    if (teacherActiveTab === 'attendance') {
      loadAttendanceRoster();
    }
  }, [attendanceClassId, attendanceSection, attendanceDate, teacherActiveTab]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome banner */}
      <div className="relative rounded-2xl overflow-hidden shadow-lg border border-blue-100 shadow-blue-500/20 shadow-xl bg-gradient-to-r from-blue-600 to-violet-700 text-white p-6 sm:p-8">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, Educator {user?.name}!
          </h2>
          <p className="mt-2 text-sm sm:text-base text-white/90">
            Submit daily student attendance registers, schedule tests, enter exam scores, and update student logs.
          </p>
        </div>
      </div>

      {/* Tab navigation headers */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-6 text-sm font-semibold">
          <button
            onClick={() => setTeacherActiveTab('overview')}
            className={`py-3 border-b-2 transition-all ${teacherActiveTab === 'overview'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
          >
            Overview Dashboard
          </button>
          <button
            onClick={() => setTeacherActiveTab('attendance')}
            className={`py-3 border-b-2 transition-all ${teacherActiveTab === 'attendance'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
          >
            Take Attendance
          </button>
          <button
            onClick={() => setTeacherActiveTab('assignments')}
            className={`py-3 border-b-2 transition-all ${teacherActiveTab === 'assignments'
                ? 'border-primary text-primary'
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
          <p className="text-xs text-slate-500">Loading educator panel dashboard...</p>
        </div>
      ) : (
        <div>
          {teacherActiveTab === 'overview' && (
            <TeacherOverview 
              teacherDashData={teacherDashData} 
              setTeacherActiveTab={setTeacherActiveTab} 
            />
          )}
          {teacherActiveTab === 'attendance' && (
            <TeacherAttendance 
              teacherClasses={teacherClasses}
              attendanceClassId={attendanceClassId}
              setAttendanceClassId={setAttendanceClassId}
              attendanceSection={attendanceSection}
              setAttendanceSection={setAttendanceSection}
              attendanceDate={attendanceDate}
              setAttendanceDate={setAttendanceDate}
              attendanceMsg={attendanceMsg}
              setAttendanceMsg={setAttendanceMsg}
              attendanceRoster={attendanceRoster}
              setAttendanceRoster={setAttendanceRoster}
              loadingRoster={loadingRoster}
              savingAttendance={savingAttendance}
              setSavingAttendance={setSavingAttendance}
              fetchTeacherDashboard={fetchTeacherDashboard}
            />
          )}
          {teacherActiveTab === 'assignments' && (
            <TeacherAssignments 
              teacherClasses={teacherClasses}
              assignClassId={assignClassId}
              setAssignClassId={setAssignClassId}
              assignSection={assignSection}
              setAssignSection={setAssignSection}
              assignSubject={assignSubject}
              setAssignSubject={setAssignSubject}
              assignTitle={assignTitle}
              setAssignTitle={setAssignTitle}
              assignDescription={assignDescription}
              setAssignDescription={setAssignDescription}
              assignDueDate={assignDueDate}
              setAssignDueDate={setAssignDueDate}
              creatingAssignment={creatingAssignment}
              setCreatingAssignment={setCreatingAssignment}
              assignmentSuccessMsg={assignmentSuccessMsg}
              setAssignmentSuccessMsg={setAssignmentSuccessMsg}
              teacherAssignments={teacherAssignments}
              fetchTeacherAssignments={fetchTeacherAssignments}
              fetchTeacherDashboard={fetchTeacherDashboard}
              gradeSubmissionModal={gradeSubmissionModal}
              setGradeSubmissionModal={setGradeSubmissionModal}
              inputGrade={inputGrade}
              setInputGrade={setInputGrade}
              inputFeedback={inputFeedback}
              setInputFeedback={setInputFeedback}
              submittingGrade={submittingGrade}
              setSubmittingGrade={setSubmittingGrade}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default TeacherPortal;
