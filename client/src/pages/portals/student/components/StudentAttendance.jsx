import React, { useState } from 'react';
import { Calendar, CheckCircle, AlertTriangle, AlertCircle, Info, ChevronDown } from 'lucide-react';

const StudentAttendance = ({ studentAttendance, studentDashData }) => {
  const [attendanceMonth, setAttendanceMonth] = useState('all');
  const stats = studentDashData?.attendanceStats;
  const totalClasses = studentAttendance.length;
  const attendancePercentage = stats?.percentage || "0.0";

  // Filter logs based on month select
  const filteredAttendance = studentAttendance.filter(log => {
    if (attendanceMonth === 'all') return true;
    const logMonth = new Date(log.date).getMonth() + 1; // 1-indexed
    return String(logMonth).padStart(2, '0') === attendanceMonth;
  });

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 sm:p-6 space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-150 pb-5 gap-4 text-left">
        <div>
          <h3 className="text-base font-bold text-slate-900 leading-tight">Attendance Ledger</h3>
          <p className="text-xs text-slate-500 mt-0.5">Roster records and present rates for the current academic session.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="relative">
            <select
              value={attendanceMonth}
              onChange={e => setAttendanceMonth(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-250 bg-white text-xs font-semibold text-slate-700 hover:border-slate-350 focus:outline-none transition-colors pr-8 appearance-none cursor-pointer"
            >
              <option value="all">All Months</option>
              <option value="07">July 2026</option>
              <option value="06">June 2026</option>
              <option value="05">May 2026</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
          <div className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Rate: {attendancePercentage}%</span>
          </div>
        </div>
      </div>

      {/* Flat Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-left">
          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Days Logged</span>
          <strong className="text-xl font-bold text-slate-800 mt-1 block">{totalClasses}</strong>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-left">
          <span className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider block">Present</span>
          <strong className="text-xl font-bold text-emerald-600 mt-1 block">{stats?.present || 0}</strong>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-left">
          <span className="text-[10px] text-rose-600 font-semibold uppercase tracking-wider block">Absent</span>
          <strong className="text-xl font-bold text-rose-600 mt-1 block">{stats?.absent || 0}</strong>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-left">
          <span className="text-[10px] text-amber-600 font-semibold uppercase tracking-wider block">Late Arrivals</span>
          <strong className="text-xl font-bold text-amber-600 mt-1 block">{stats?.late || 0}</strong>
        </div>
      </div>

      {/* Visual Dot Heatmap / Dot Grid */}
      <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 text-left space-y-3.5">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Attendance Calendar Dots</h4>
        </div>
        
        {filteredAttendance.length === 0 ? (
          <div className="py-4 text-xs text-slate-400 italic">No attendance records found for this period.</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {filteredAttendance.map((log) => {
              const dt = new Date(log.date);
              const dayNum = dt.getDate();
              const monthText = dt.toLocaleString('en-US', { month: 'short' });
              
              let statusClasses = 'bg-slate-100 border-slate-200 text-slate-400';
              if (log.status === 'present') {
                statusClasses = 'bg-emerald-50 border-emerald-250 text-emerald-700 font-bold';
              } else if (log.status === 'absent') {
                statusClasses = 'bg-rose-50 border-rose-250 text-rose-700 font-bold';
              } else if (log.status === 'late') {
                statusClasses = 'bg-amber-50 border-amber-250 text-amber-700 font-bold';
              }

              return (
                <div
                  key={log._id}
                  className={`w-9 h-9 rounded-lg border flex flex-col items-center justify-center text-[10px] transition-transform hover:scale-105 ${statusClasses}`}
                  title={`${log.status.toUpperCase()} on ${dt.toLocaleDateString()}`}
                >
                  <span className="text-[7px] opacity-60 leading-none">{monthText}</span>
                  <span className="text-xs font-bold leading-none mt-0.5">{dayNum}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Roster Ledger Table */}
      {filteredAttendance.length === 0 ? (
        <div className="py-12 bg-slate-50 border border-slate-200 border-dashed rounded-lg text-center">
          <AlertCircle className="w-8 h-8 text-slate-350 mx-auto mb-2" />
          <h4 className="text-xs font-semibold text-slate-700">Empty Ledger Sheet</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">There are no school attendance logs for the chosen filter date range.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full border-collapse text-left text-xs text-slate-600 font-medium">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[9px] tracking-wider">
              <tr>
                <th className="px-5 py-3">Session Date</th>
                <th className="px-5 py-3 text-center">Roster Code</th>
                <th className="px-5 py-3">Remarks / Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredAttendance.map((log) => (
                <tr key={log._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-semibold text-slate-900">
                    {new Date(log.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                      log.status === 'present'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : log.status === 'absent'
                          ? 'bg-rose-50 border-rose-200 text-rose-700'
                          : 'bg-amber-50 border-amber-200 text-amber-700'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-400 text-left text-[11px]">Verified under automated portal sync rules.</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentAttendance;
