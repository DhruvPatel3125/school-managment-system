import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, Calendar, Clock, BookOpen, Award, CreditCard, 
  AlertTriangle, Check, UserCheck, Printer, Users
} from 'lucide-react';

const StudentOverview = ({ studentDashData, studentAttendance, studentAssignments, studentFees, user, tenant }) => {
  const [cardFlipped, setCardFlipped] = useState(false);

  const profile = studentDashData?.student;
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
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-between hover:shadow-md hover:border-emerald-200 hover:-translate-y-0.5 transition-all duration-300 group">
          <div className="space-y-1.5 text-left">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Attendance Rate</span>
            <strong className="text-3xl font-black text-slate-900 block tracking-tight">{attendancePercentage}%</strong>
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
              <Check className="w-3 h-3" /> {stats?.present || 0} / {totalClasses} classes
            </span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform shadow-sm">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-between hover:shadow-md hover:border-amber-200 hover:-translate-y-0.5 transition-all duration-300 group">
          <div className="space-y-1.5 text-left">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pending Tasks</span>
            <strong className="text-3xl font-black text-slate-900 block tracking-tight">{pendingHomeworkCount}</strong>
            <span className="text-xs text-amber-600 font-semibold flex items-center gap-1.5">
              <Clock className="w-3 h-3 animate-pulse" /> Submissions Due
            </span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform shadow-sm">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-between hover:shadow-md hover:border-rose-200 hover:-translate-y-0.5 transition-all duration-300 group">
          <div className="space-y-1.5 text-left">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Outstanding Fees</span>
            <strong className="text-3xl font-black text-slate-900 block tracking-tight">₹{totalUnpaidAmount.toLocaleString()}</strong>
            <span className="text-xs text-rose-600 font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3" /> {pendingFeesCount} invoices unpaid
            </span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform shadow-sm">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-between hover:shadow-md hover:border-blue-200 hover:-translate-y-0.5 transition-all duration-300 group">
          <div className="space-y-1.5 text-left">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Upcoming Exams</span>
            <strong className="text-3xl font-black text-slate-900 block tracking-tight">{examCount}</strong>
            <span className="text-xs text-blue-600 font-semibold flex items-center gap-1.5">
              <Award className="w-3 h-3" /> In Next 30 Days
            </span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform shadow-sm">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* ID Card Widget */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-sm text-left relative z-10">
              <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-blue-50 border border-indigo-500/20 text-blue-500 tracking-wider block w-fit">STUDENT CREDENTIAL</span>
              <h4 className="text-2xl font-black text-slate-900 leading-tight">Digital Identity Pass</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Your certified digital ID. Use it to gain entry, verify identity, or print a hard-copy badge layout.</p>
              <button onClick={() => setCardFlipped(!cardFlipped)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-[11px] rounded-xl shadow-sm transition-all active:scale-95 tracking-wider uppercase flex items-center gap-2 border border-slate-200">
                <UserCheck className="w-3.5 h-3.5 text-primary" /> Flip card View
              </button>
            </div>

            <div className="w-80 h-48 shrink-0 relative perspective cursor-pointer" onClick={() => setCardFlipped(!cardFlipped)}>
              <div className={`w-full h-full duration-700 transform-style-3d relative ${cardFlipped ? 'rotate-y-180' : ''}`}>
                <div className="absolute inset-0 w-full h-full rounded-2xl p-5 backface-hidden flex flex-col justify-between shadow-2xl bg-gradient-to-br from-primary to-[#2e1065] border border-white/10">
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
                  <div className="flex justify-between items-center text-[7px] text-white/40 font-bold border-t border-white/5 pt-2">
                    <span>EXPIRES: MAY 2027</span>
                    <span className="font-mono">||| | | |||| | ||| | |||</span>
                  </div>
                </div>

                <div className="absolute inset-0 w-full h-full rounded-2xl p-5 backface-hidden rotate-y-180 flex flex-col justify-between shadow-2xl bg-gradient-to-br from-[#121320] to-[#1b1c30] border border-slate-800">
                  <div className="text-left space-y-3">
                    <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-1">Emergency Contacts & Info</h5>
                    <div className="grid grid-cols-2 gap-3 text-[9px]">
                      <div><span className="text-slate-500 block">Parent / Guardian:</span><strong className="text-slate-700 font-bold block">{profile?.parentName || 'N/A'}</strong></div>
                      <div><span className="text-slate-500 block">Emergency Call:</span><strong className="text-slate-300 font-mono font-bold block">{profile?.parentPhone || 'N/A'}</strong></div>
                      <div><span className="text-slate-500 block">Official Email:</span><strong className="text-slate-300 truncate block">{profile?.email || user?.email}</strong></div>
                      <div><span className="text-slate-500 block">Blood Group:</span><strong className="text-slate-700 font-bold block">O+ Positive</strong></div>
                    </div>
                  </div>
                  <div className="text-center text-[7px] text-slate-500 font-semibold border-t border-slate-200 pt-2 flex justify-between items-center">
                    <span>EDUCORE ECOSYSTEM SECURITY</span>
                    <span className="text-primary font-bold">SCAN PASS</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Subject Performance */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 shadow-xl text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-6">
              <h4 className="text-base font-extrabold text-slate-900">Subject Assessment Report</h4>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Dynamic Stats</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {subjectPerformanceList.map((sub, idx) => {
                const colors = [
                  { text: 'text-blue-500', progress: 'bg-indigo-500', bg: 'bg-blue-50' },
                  { text: 'text-emerald-400', progress: 'bg-emerald-500', bg: 'bg-emerald-500/10' },
                  { text: 'text-amber-500', progress: 'bg-amber-500', bg: 'bg-amber-500/10' },
                  { text: 'text-rose-500', progress: 'bg-rose-500', bg: 'bg-rose-500/10' }
                ];
                const color = colors[idx % colors.length];
                return (
                  <div key={sub.name} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 hover:border-slate-800 transition-colors space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-700 truncate">{sub.name}</span>
                      <span className={`${color.text} px-2 py-0.5 rounded-lg ${color.bg} text-[10px]`}>{sub.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className={`${color.progress} h-full rounded-full transition-all duration-1000`} style={{ width: `${sub.percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 shadow-xl flex flex-col space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-extrabold text-slate-900">Task Deadlines</h4>
              <span className="flex h-2 w-2 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
            </div>
            <div className="space-y-4">
              {upcomingDeadlines.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-200">🎉 No homework assignments pending.</div>
              ) : (
                upcomingDeadlines.map((dead) => (
                  <div key={dead._id} className="flex gap-4 items-center bg-slate-950/45 p-3.5 rounded-2xl border border-slate-200 hover:border-slate-800 transition-colors">
                    <div className="w-12 h-12 bg-white text-slate-950 rounded-xl flex flex-col items-center justify-center font-black uppercase text-center shadow shrink-0">
                      <span className="text-[9px] text-rose-500 leading-none">{new Date(dead.dueDate).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}</span>
                      <span className="text-lg leading-none block mt-1">{new Date(dead.dueDate).getDate()}</span>
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

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 shadow-xl flex flex-col space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-extrabold text-slate-900">Notice Bulletin</h4>
              <Link to="/announcements" className="text-[10px] text-primary font-bold hover:underline">See All</Link>
            </div>
            <div className="space-y-4">
              {announcementsList.slice(0, 3).map((ann) => (
                <div key={ann.id} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5">
                  <div className="flex justify-between items-start gap-4">
                    <h5 className="font-extrabold text-[11px] text-slate-900 truncate">{ann.title}</h5>
                    <span className="px-1.5 py-0.5 rounded text-[7px] font-black bg-primary/10 border border-blue-100 shadow-blue-500/20 text-primary uppercase shrink-0 tracking-wider">{ann.tag}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed truncate">{ann.description}</p>
                  <span className="text-[8px] text-slate-500 block font-semibold">{ann.time}</span>
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
