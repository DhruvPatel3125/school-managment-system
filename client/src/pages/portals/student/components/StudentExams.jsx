import React from 'react';
import { AlertTriangle } from 'lucide-react';

const StudentExams = ({ studentAssignments }) => {
  const profile = JSON.parse(localStorage.getItem('user')) || {};
  const classSection = localStorage.getItem('studentClassSection') || 'Class 3 - Section A';
  
  const mockExams = [
    { id: 1, subject: 'Mathematics', code: 'MATH-301', date: '2026-07-15', time: '09:00 AM - 12:00 PM', room: 'Lab 2', invigilator: 'Mr. R. K. Sen', maxMarks: 100, syllabus: 'Algebra, Geometry, Fractions' },
    { id: 2, subject: 'General Science', code: 'SCI-302', date: '2026-07-17', time: '09:00 AM - 12:00 PM', room: 'Hall A', invigilator: 'Mrs. S. Sharma', maxMarks: 100, syllabus: 'Human Body, Light, Plants structure' },
    { id: 3, subject: 'English Grammar', code: 'ENG-303', date: '2026-07-20', time: '10:00 AM - 01:00 PM', room: 'Room 104', invigilator: 'Mr. A. Patel', maxMarks: 80, syllabus: 'Nouns, Verbs, Essay Writing, Clauses' },
    { id: 4, subject: 'Computer Basics', code: 'COMP-304', date: '2026-07-22', time: '01:30 PM - 03:30 PM', room: 'Computer Lab', invigilator: 'Miss P. Roy', maxMarks: 50, syllabus: 'Introduction to HTML, Operating Systems' },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8 shadow-2xl space-y-8 text-left">
      <div>
        <h3 className="text-lg font-extrabold text-slate-900">Upcoming Examinations</h3>
        <p className="text-xs text-slate-400 mt-1">Review scheduled tests, seat numbers, and curriculum files.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full border-collapse text-left text-xs text-slate-400">
              <thead className="bg-slate-50 border-b border-slate-200 text-[9px] uppercase font-black tracking-widest text-slate-900">
                <tr>
                  <th className="px-5 py-4">Subject</th>
                  <th className="px-5 py-4">Schedule</th>
                  <th className="px-5 py-4 text-center">Room/Seat</th>
                  <th className="px-5 py-4 text-center">Max Marks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {mockExams.map((ex) => (
                  <tr key={ex.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 space-y-0.5">
                      <strong className="text-slate-900 font-extrabold text-sm block">{ex.subject}</strong>
                      <span className="text-[9px] text-slate-500 block font-mono">{ex.code}</span>
                    </td>
                    <td className="px-5 py-4 space-y-0.5 font-medium">
                      <span className="text-slate-700 block font-bold">{new Date(ex.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span className="text-[9px] text-slate-500 block">{ex.time}</span>
                    </td>
                    <td className="px-5 py-4 text-center font-semibold text-slate-600">
                      <span className="block">{ex.room}</span>
                      <span className="text-[8px] text-slate-500 font-bold block uppercase">{ex.invigilator}</span>
                    </td>
                    <td className="px-5 py-4 text-center text-sm font-black text-slate-900">{ex.maxMarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 space-y-4">
            <h4 className="text-xs font-black uppercase text-blue-700 tracking-widest border-b border-blue-100 pb-2">Academic Seat Ticket</h4>
            <div className="space-y-3 text-[11px] text-slate-600 font-semibold">
              <p className="flex justify-between"><span>Admission Roster:</span> <strong className="text-slate-900 font-mono">{profile?.admissionNo || 'ADM-2026-2153'}</strong></p>
              <p className="flex justify-between"><span>Testing Center:</span> <strong className="text-slate-900">Main School Block</strong></p>
              <p className="flex justify-between"><span>Class Allocation:</span> <strong className="text-slate-900">{classSection}</strong></p>
              <p className="flex justify-between"><span>Verification Status:</span> <strong className="text-emerald-600 uppercase">PASSED</strong></p>
            </div>
            <button
              onClick={() => alert('Downloading admit ticket PDF... Done.')}
              className="w-full py-2.5 bg-primary hover:bg-primary/95 text-white font-extrabold text-[10px] rounded-xl uppercase tracking-wider shadow-md transition-all active:scale-95"
            >
              Download Admit Pass
            </button>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2.5">
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
  );
};

export default StudentExams;
