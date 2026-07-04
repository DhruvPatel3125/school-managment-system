import React from 'react';
import { UserCheck, Award, BookOpen } from 'lucide-react';

const TeacherOverview = ({ teacherDashData, setTeacherActiveTab }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Metric widgets */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Assigned Classes</span>
          <strong className="text-3xl font-black text-slate-900 mt-2">{teacherDashData?.classesCount || 0}</strong>
          <span className="text-[10px] text-slate-400 mt-1">Total school class groups</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Enrolled Students</span>
          <strong className="text-3xl font-black text-slate-900 mt-2">{teacherDashData?.studentsCount || 0}</strong>
          <span className="text-[10px] text-slate-400 mt-1">Multi-tenant scope roster</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Attendance Logs Today</span>
          <strong className="text-3xl font-black text-emerald-500 mt-2">{teacherDashData?.attendanceTodayCount || 0}</strong>
          <span className="text-[10px] text-slate-400 mt-1">Attendance logs created today</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Ungraded Homework</span>
          <strong className="text-3xl font-black text-amber-500 mt-2">{teacherDashData?.ungradedCount || 0}</strong>
          <span className="text-[10px] text-slate-400 mt-1">Student submissions pending grade</span>
        </div>
      </div>

      {/* Quick tasks panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wide">Daily Register</span>
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400"><UserCheck className="w-5 h-5" /></span>
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-slate-900">Class Attendance</h4>
            <p className="text-xs text-slate-500 mt-1">Submit the daily attendance roster for your assigned Grade section.</p>
          </div>
          <button
            onClick={() => setTeacherActiveTab('attendance')}
            className="w-full py-2 bg-primary text-white text-xs font-bold rounded-lg shadow active:scale-95 transition-all"
          >
            Open Attendance Sheet
          </button>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wide">Grading Panel</span>
            <span className="p-2 rounded-lg bg-blue-50 text-primary"><Award className="w-5 h-5" /></span>
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-slate-900">Record Marks</h4>
            <p className="text-xs text-slate-500 mt-1">Input grades, marks, and academic remarks for recent homework submissions.</p>
          </div>
          <button
            onClick={() => setTeacherActiveTab('assignments')}
            className="w-full py-2 bg-primary text-white text-xs font-bold rounded-lg shadow active:scale-95 transition-all"
          >
            Grade Homework Submissions
          </button>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wide">Homework Dispatcher</span>
            <span className="p-2 rounded-lg bg-blue-50 text-primary"><BookOpen className="w-5 h-5" /></span>
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-slate-900">Curriculum Plan</h4>
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
  );
};

export default TeacherOverview;
