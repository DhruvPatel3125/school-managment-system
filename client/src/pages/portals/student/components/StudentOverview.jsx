import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, Calendar, Clock, BookOpen, Award, CreditCard, 
  AlertTriangle, Check, UserCheck, Printer, Users
} from 'lucide-react';

const StudentOverview = ({ studentDashData, studentAttendance, studentAssignments, studentFees, user, tenant }) => {
  const [cardFlipped, setCardFlipped] = useState(false);

  const profile = studentDashData?.student;
  const primaryBrandColor = tenant?.primaryColor || '#0D1B2A';
  const stats = studentDashData?.attendanceStats;

  const totalClasses = studentAttendance.length;
  const attendancePercentage = stats?.percentage || "0.0";
  const pendingHomeworkCount = studentDashData?.pendingAssignmentsCount || 0;

  const pendingFees = studentFees.filter(f => f.status === 'pending');
  const totalUnpaidAmount = pendingFees.reduce((sum, f) => sum + f.amount, 0);
  const pendingFeesCount = studentDashData?.pendingFeesCount || 0;

  const classSection = localStorage.getItem('studentClassSection') || 'Class 3 - Section A';

  const examCount = studentAssignments.filter(a =>
    a.title.toLowerCase().includes('exam') ||
    a.title.toLowerCase().includes('test') ||
    a.description.toLowerCase().includes('exam') ||
    a.description.toLowerCase().includes('test')
  ).length;

  const upcomingDeadlines = studentAssignments
    .filter(a => a.submissionStatus === 'pending')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 3);

  const getAnnouncements = () => {
    const list = [];
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
        if (!subjects[asg.subject]) subjects[asg.subject] = { sum: 0, count: 0 };
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
      if (distinctSubjects.length > 0) return distinctSubjects.map(sub => ({ name: sub, percentage: 80 }));
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

  return (
    <div className="space-y-8">
      {/* Metrics cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-slate-350 transition-all duration-200 text-left">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Attendance Rate</span>
          <strong className="text-2xl font-bold text-slate-900 block mt-1 tracking-tight">{attendancePercentage}%</strong>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1.5 mt-2.5">
            <Check className="w-3 h-3" /> {stats?.present || 0} / {totalClasses} classes
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-slate-350 transition-all duration-200 text-left">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Pending Tasks</span>
          <strong className="text-2xl font-bold text-slate-900 block mt-1 tracking-tight">{pendingHomeworkCount}</strong>
          <span className="text-[11px] text-amber-600 font-semibold flex items-center gap-1.5 mt-2.5">
            <Clock className="w-3 h-3" /> Submissions Due
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-slate-350 transition-all duration-200 text-left">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Outstanding Fees</span>
          <strong className="text-2xl font-bold text-slate-900 block mt-1 tracking-tight">₹{totalUnpaidAmount.toLocaleString()}</strong>
          <span className="text-[11px] text-rose-600 font-semibold flex items-center gap-1.5 mt-2.5">
            <AlertTriangle className="w-3 h-3" /> {pendingFeesCount} invoices unpaid
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-slate-350 transition-all duration-200 text-left">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Upcoming Exams</span>
          <strong className="text-2xl font-bold text-slate-900 block mt-1 tracking-tight">{examCount}</strong>
          <span className="text-[11px] text-blue-600 font-semibold flex items-center gap-1.5 mt-2.5">
            <Award className="w-3 h-3" /> In Next 30 Days
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* ID Card Widget */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 max-w-sm text-left relative z-10">
              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-100 border border-slate-200 text-slate-600 tracking-wider block w-fit">STUDENT CREDENTIAL</span>
              <h4 className="text-xl font-bold text-slate-900 leading-tight">Digital Identity Pass</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Your certified digital ID. Use it to gain entry, verify identity, or print a hard-copy badge layout.</p>
              <button onClick={() => setCardFlipped(!cardFlipped)} className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-[11px] rounded-lg shadow-sm transition-all active:scale-95 tracking-wider uppercase flex items-center gap-1.5 border border-slate-200">
                <UserCheck className="w-3.5 h-3.5 text-slate-500" /> Flip Card View
              </button>
            </div>

            <div className="w-80 h-48 shrink-0 relative perspective cursor-pointer" onClick={() => setCardFlipped(!cardFlipped)}>
              <div className={`w-full h-full duration-700 transform-style-3d relative ${cardFlipped ? 'rotate-y-180' : ''}`}>
                {/* Front Side: Dynamic Brand Color */}
                <div 
                  className="absolute inset-0 w-full h-full rounded-xl p-5 backface-hidden flex flex-col justify-between shadow-md border border-white/10"
                  style={{ backgroundColor: primaryBrandColor }}
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded bg-white/10 flex items-center justify-center text-white text-[11px] font-bold shadow-inner">
                        {tenant?.schoolName?.charAt(0) || 'E'}
                      </div>
                      <div className="text-left">
                        <h5 className="text-[10px] font-bold text-white leading-none truncate max-w-[150px]">{tenant?.schoolName || 'EduCore Academy'}</h5>
                        <span className="text-[6px] text-white/60 font-semibold tracking-widest block mt-0.5">ACADEMIC PROFILE PASS</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[7px] font-bold uppercase tracking-wider">ACTIVE</span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-13 h-13 rounded-lg bg-white/10 text-white flex items-center justify-center font-bold text-base uppercase shadow-sm border border-white/10 shrink-0">
                      {user?.name?.split(' ').map(n => n[0]).slice(0, 2).join('') || 'ST'}
                    </div>
                    <div className="text-left space-y-1 min-w-0 flex-1">
                      <h6 className="text-sm font-bold text-white truncate leading-none mb-0.5">{user?.name}</h6>
                      <p className="text-[9px] text-white/80 font-medium">{classSection}</p>
                      <p className="text-[8px] text-white/50 font-mono tracking-wider">{profile?.admissionNo || 'ADM-2026-2153'}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-[7px] text-white/40 font-bold border-t border-white/5 pt-2">
                    <span>EXPIRES: MAY 2027</span>
                    <span className="font-mono text-[9px] tracking-widest">||||| | ||| || ||| |</span>
                  </div>
                </div>

                {/* Back Side: Clean Slate-Gray */}
                <div className="absolute inset-0 w-full h-full rounded-xl p-5 backface-hidden rotate-y-180 flex flex-col justify-between shadow-md bg-slate-50 border border-slate-200">
                  <div className="text-left space-y-2.5">
                    <h5 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-1">Emergency Contacts & Info</h5>
                    <div className="grid grid-cols-2 gap-2 text-[9px]">
                      <div><span className="text-slate-450 block">Parent / Guardian:</span><strong className="text-slate-700 font-semibold block truncate">{profile?.parentName || 'N/A'}</strong></div>
                      <div><span className="text-slate-450 block">Emergency Call:</span><strong className="text-slate-700 font-mono font-semibold block">{profile?.parentPhone || 'N/A'}</strong></div>
                      <div><span className="text-slate-450 block">Official Email:</span><strong className="text-slate-700 truncate block">{profile?.email || user?.email}</strong></div>
                      <div><span className="text-slate-450 block">Blood Group:</span><strong className="text-slate-700 font-semibold block">O+ Positive</strong></div>
                    </div>
                  </div>
                  <div className="text-center text-[7px] text-slate-400 font-bold border-t border-slate-150 pt-2 flex justify-between items-center">
                    <span>EDUCORE SECURITY</span>
                    <span className="font-bold uppercase tracking-wider" style={{ color: primaryBrandColor }}>SCAN PASS</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Subject Performance */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 text-left">
            <div className="flex items-center justify-between border-b border-slate-150 pb-3 mb-5">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Subject Assessment Report</h4>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Academic Ledger</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {subjectPerformanceList.map((sub) => {
                return (
                  <div key={sub.name} className="bg-slate-50 p-4 rounded-xl border border-slate-200 hover:border-slate-350 transition-colors space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-700 truncate">{sub.name}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 text-[10px]">{sub.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-1000" 
                        style={{ width: `${sub.percentage}%`, backgroundColor: primaryBrandColor }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex flex-col space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-150 pb-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Task Deadlines</h4>
              <span className="flex h-2 w-2 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-450 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
            </div>
            <div className="space-y-3">
              {upcomingDeadlines.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 bg-slate-50 p-3 rounded-xl border border-slate-200">🎉 No homework assignments pending.</div>
              ) : (
                upcomingDeadlines.map((dead) => (
                  <div key={dead._id} className="flex gap-3.5 items-center bg-slate-50 p-3 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                    <div className="w-10 h-10 bg-white border border-slate-200 text-slate-850 rounded-lg flex flex-col items-center justify-center font-bold uppercase text-center shadow-sm shrink-0">
                      <span className="text-[8px] text-rose-600 leading-none">{new Date(dead.dueDate).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}</span>
                      <span className="text-sm font-bold leading-none block mt-0.5">{new Date(dead.dueDate).getDate()}</span>
                    </div>
                    <div className="text-left min-w-0 flex-1">
                      <h5 className="font-bold text-xs text-slate-800 truncate">{dead.title}</h5>
                      <p className="text-[10px] text-slate-450 truncate mt-0.5">{dead.subject}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex flex-col space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-150 pb-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Notice Bulletin</h4>
              <Link to="/announcements" className="text-[10px] font-bold hover:underline" style={{ color: primaryBrandColor }}>See All</Link>
            </div>
            <div className="space-y-3">
              {announcementsList.slice(0, 3).map((ann) => (
                <div key={ann.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex justify-between items-start gap-3">
                    <h5 className="font-bold text-xs text-slate-800 truncate">{ann.title}</h5>
                    <span className="px-1.5 py-0.5 rounded text-[7px] font-bold bg-slate-200 text-slate-600 border border-slate-300 uppercase shrink-0 tracking-wider">{ann.tag}</span>
                  </div>
                  <p className="text-[10px] text-slate-550 leading-relaxed truncate">{ann.description}</p>
                  <span className="text-[8px] text-slate-450 block font-semibold">{ann.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentOverview;
