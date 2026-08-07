import React from 'react';
import axios from 'axios';
import { Loader2, UserCheck } from 'lucide-react';

import { API_URL } from '../../../../config/api';

const TeacherAttendance = ({
  teacherClasses,
  attendanceClassId,
  setAttendanceClassId,
  attendanceSection,
  setAttendanceSection,
  attendanceDate,
  setAttendanceDate,
  attendanceMsg,
  setAttendanceMsg,
  attendanceRoster,
  setAttendanceRoster,
  loadingRoster,
  savingAttendance,
  setSavingAttendance,
  fetchTeacherDashboard
}) => {
  const handleAttendanceChange = (studentId, status) => {
    setAttendanceRoster(prev => prev.map(item => item._id === studentId ? { ...item, status } : item));
  };

  const submitAttendanceRoster = async () => {
    try {
      setSavingAttendance(true);
      setAttendanceMsg('');
      const records = attendanceRoster.map(s => ({ studentId: s._id, status: s.status }));
      const res = await axios.post(`${API_URL}/api/v1/teachers/portal/attendance`, {
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

  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-200 shadow-sm bg-white space-y-6">
      {/* Roster Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-semibold">
        <div>
          <label className="block text-slate-400 uppercase tracking-wider mb-1 text-[10px]">Select Class</label>
          <select
            value={attendanceClassId}
            onChange={e => setAttendanceClassId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-transparent text-slate-900"
          >
            {teacherClasses.map(cls => (
              <option key={cls._id} value={cls._id}>{cls.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-slate-400 uppercase tracking-wider mb-1 text-[10px]">Select Section</label>
          <select
            value={attendanceSection}
            onChange={e => setAttendanceSection(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-transparent text-slate-900"
          >
            {teacherClasses.find(c => c._id === attendanceClassId)?.sections?.map(sec => (
              <option key={sec} value={sec}>Section {sec}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-slate-400 uppercase tracking-wider mb-1 text-[10px]">Attendance Date</label>
          <input
            type="date"
            value={attendanceDate}
            onChange={e => setAttendanceDate(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-transparent text-slate-900"
          />
        </div>
      </div>

      {attendanceMsg && (
        <div className={`p-3 border rounded-lg text-xs font-medium ${attendanceMsg.includes('successfully')
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
            : 'bg-rose-500/10 border-rose-500/20 text-rose-600'
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
            <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
              {attendanceRoster.map((student) => (
                <div key={student._id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-slate-50 transition-colors">
                  <div>
                    <strong className="text-slate-900 font-bold block text-sm">{student.name}</strong>
                    <span className="text-[10px] text-slate-500 font-mono">Admission: {student.admissionNo}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleAttendanceChange(student._id, 'present')}
                      className={`px-4 py-1.5 rounded-lg font-bold transition-all ${student.status === 'present'
                          ? 'bg-emerald-500 text-white shadow-md'
                          : 'border border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                    >
                      Present
                    </button>
                    <button
                      onClick={() => handleAttendanceChange(student._id, 'absent')}
                      className={`px-4 py-1.5 rounded-lg font-bold transition-all ${student.status === 'absent'
                          ? 'bg-rose-500 text-white shadow-md'
                          : 'border border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                    >
                      Absent
                    </button>
                    <button
                      onClick={() => handleAttendanceChange(student._id, 'late')}
                      className={`px-4 py-1.5 rounded-lg font-bold transition-all ${student.status === 'late'
                          ? 'bg-amber-500 text-white shadow-md'
                          : 'border border-slate-200 text-slate-500 hover:bg-slate-50'
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
  );
};

export default TeacherAttendance;
