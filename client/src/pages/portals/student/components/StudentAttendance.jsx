import React, { useState } from 'react';
import { Loader2, CheckCircle } from 'lucide-react';

const StudentAttendance = ({ studentAttendance, studentDashData }) => {
  const [attendanceMonth, setAttendanceMonth] = useState('all');
  const stats = studentDashData?.attendanceStats;
  const totalClasses = studentAttendance.length;
  const attendancePercentage = stats?.percentage || "0.0";

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-6 gap-6 text-left">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900">Daily Attendance Ledger</h3>
          <p className="text-xs text-slate-400 mt-1">Check verified daily roster logs and overall present rates.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs font-semibold text-slate-600 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm">
            Month:
            <select
              value={attendanceMonth}
              onChange={e => setAttendanceMonth(e.target.value)}
              className="ml-1 bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-white">All Months</option>
              <option value="07" className="bg-white">July 2026</option>
              <option value="06" className="bg-white">June 2026</option>
              <option value="05" className="bg-white">May 2026</option>
            </select>
          </div>
          <div className="px-4 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-xs font-extrabold text-emerald-400 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> Rate: {attendancePercentage}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left">
          <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Total Days Recorded</span>
          <strong className="text-2xl font-black text-slate-800 mt-1 block">{totalClasses}</strong>
        </div>
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left">
          <span className="text-[10px] text-emerald-500 font-bold block uppercase tracking-wider">Present Days</span>
          <strong className="text-2xl font-black text-emerald-500 mt-1 block">{stats?.present || 0}</strong>
        </div>
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left">
          <span className="text-[10px] text-rose-500 font-bold block uppercase tracking-wider">Absent Days</span>
          <strong className="text-2xl font-black text-rose-500 mt-1 block">{stats?.absent || 0}</strong>
        </div>
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left">
          <span className="text-[10px] text-amber-500 font-bold block uppercase tracking-wider">Late Days</span>
          <strong className="text-2xl font-black text-amber-500 mt-1 block">{stats?.late || 0}</strong>
        </div>
      </div>

      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-left">
        <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-4">Roster Dot Tracker</h4>
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

              return (
                <div
                  key={log._id}
                  className={`w-10 h-10 rounded-xl border flex flex-col items-center justify-center font-bold text-[10px] ${isPresent
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
                      : isAbsent
                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-600'
                        : 'bg-amber-500/10 border-amber-500/20 text-amber-600'
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

      {studentAttendance.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-500">No attendance ledger found.</div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-inner">
          <table className="w-full border-collapse text-left text-xs text-slate-400 font-medium">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold uppercase text-[9px] tracking-widest">
              <tr>
                <th className="px-6 py-4">Session Date</th>
                <th className="px-6 py-4 text-center">Roster Code</th>
                <th className="px-6 py-4">Evaluation Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {studentAttendance
                .filter(log => {
                  if (attendanceMonth === 'all') return true;
                  const logMonth = new Date(log.date).toISOString().split('-')[1];
                  return logMonth === attendanceMonth;
                })
                .map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {new Date(log.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-3 py-0.5 rounded-full text-[9px] font-black uppercase border ${log.status === 'present'
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
                          : log.status === 'absent'
                            ? 'bg-rose-500/10 border-rose-500/20 text-rose-600'
                            : 'bg-amber-500/10 border-amber-500/20 text-amber-600'
                        }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-semibold italic text-left">Verified under general school roster rules.</td>
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
