import React from 'react';
import { AlertTriangle, ChevronDown, Download, Award, Calendar, Home } from 'lucide-react';
import { useTenantTheme } from '../../../../context/TenantThemeContext';

const StudentExams = () => {
  const { tenant } = useTenantTheme();
  const profile = JSON.parse(localStorage.getItem('user')) || {};
  const classSection = localStorage.getItem('studentClassSection') || 'Class 3 - Section A';
  
  const primaryBrandColor = tenant?.primaryColor || '#0D1B2A';

  const mockExams = [
    { id: 1, subject: 'Mathematics', code: 'MATH-301', date: '2026-07-15', time: '09:00 AM - 12:00 PM', room: 'Lab 2', invigilator: 'Mr. R. K. Sen', maxMarks: 100, syllabus: 'Algebra, Geometry, Fractions' },
    { id: 2, subject: 'General Science', code: 'SCI-302', date: '2026-07-17', time: '09:00 AM - 12:00 PM', room: 'Hall A', invigilator: 'Mrs. S. Sharma', maxMarks: 100, syllabus: 'Human Body, Light, Plants structure' },
    { id: 3, subject: 'English Grammar', code: 'ENG-303', date: '2026-07-20', time: '10:00 AM - 01:00 PM', room: 'Room 104', invigilator: 'Mr. A. Patel', maxMarks: 80, syllabus: 'Nouns, Verbs, Essay Writing, Clauses' },
    { id: 4, subject: 'Computer Basics', code: 'COMP-304', date: '2026-07-22', time: '01:30 PM - 03:30 PM', room: 'Computer Lab', invigilator: 'Miss P. Roy', maxMarks: 50, syllabus: 'Introduction to HTML, Operating Systems' },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 sm:p-6 space-y-6 text-left">
      <div>
        <h3 className="text-base font-bold text-slate-900 leading-tight">Upcoming Examinations</h3>
        <p className="text-xs text-slate-500 mt-0.5">Review examination schedules, center locations, and seat allocations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roster Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full border-collapse text-left text-xs text-slate-600 font-medium">
              <thead className="bg-slate-50 border-b border-slate-200 text-[9px] uppercase font-semibold tracking-wider text-slate-600">
                <tr>
                  <th className="px-5 py-3">Subject</th>
                  <th className="px-5 py-3">Schedule</th>
                  <th className="px-5 py-3 text-center">Center / Seat</th>
                  <th className="px-5 py-3 text-center">Max Marks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {mockExams.map((ex) => (
                  <tr key={ex.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 space-y-0.5">
                      <strong className="text-slate-800 font-bold block text-xs">{ex.subject}</strong>
                      <span className="text-[9px] text-slate-450 block font-mono">{ex.code}</span>
                    </td>
                    <td className="px-5 py-3.5 space-y-0.5">
                      <span className="text-slate-700 block font-semibold">{new Date(ex.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span className="text-[9px] text-slate-400 block">{ex.time}</span>
                    </td>
                    <td className="px-5 py-3.5 text-center font-medium text-slate-600">
                      <span className="block text-xs">{ex.room}</span>
                      <span className="text-[8px] text-slate-400 block uppercase font-bold">{ex.invigilator}</span>
                    </td>
                    <td className="px-5 py-3.5 text-center text-xs font-bold text-slate-850">{ex.maxMarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar ticket info */}
        <div className="space-y-6">
          {/* Boarding Pass Seat Ticket */}
          <div className="bg-[#FAF9F6] border border-slate-200 rounded-xl overflow-hidden relative shadow-sm">
            <div className="p-4 text-center border-b border-dashed border-slate-300 relative">
              <span className="px-2 py-0.5 rounded bg-slate-200/60 text-slate-600 text-[8px] font-bold uppercase tracking-wider block w-fit mx-auto mb-2 border border-slate-300">Official Pass</span>
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Academic Seat Ticket</h4>
              
              {/* Ticket Cutouts */}
              <div className="absolute w-4 h-4 bg-white border-r border-slate-200 rounded-full -left-2 bottom-[-8px]"></div>
              <div className="absolute w-4 h-4 bg-white border-l border-slate-200 rounded-full -right-2 bottom-[-8px]"></div>
            </div>
            
            <div className="p-5 space-y-3.5 text-xs text-slate-600 font-medium">
              <div className="flex justify-between items-center">
                <span>Admission No:</span> 
                <strong className="text-slate-850 font-mono tracking-wider">{profile?.admissionNo || 'ADM-2026-2153'}</strong>
              </div>
              <div className="flex justify-between items-center">
                <span>Testing Center:</span> 
                <strong className="text-slate-800">Main School Block</strong>
              </div>
              <div className="flex justify-between items-center">
                <span>Class Section:</span> 
                <strong className="text-slate-800">{classSection}</strong>
              </div>
              <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                <span>Verification Check:</span> 
                <strong className="text-emerald-700 font-bold uppercase text-[10px]">PASSED</strong>
              </div>
              
              <button
                onClick={() => alert('Downloading admit pass PDF... Done.')}
                className="w-full py-2 bg-slate-900 text-white font-semibold text-[10px] rounded-lg uppercase tracking-wider shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1.5 mt-2 hover:opacity-95"
                style={{ backgroundColor: primaryBrandColor }}
              >
                <Download className="w-3.5 h-3.5" /> Download Admit Pass
              </button>
            </div>
          </div>

          {/* Regulations */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <h5 className="text-[10px] font-bold uppercase text-amber-700 tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Exam Regulations
            </h5>
            <ul className="text-[10px] text-slate-500 space-y-1 list-disc pl-4 font-medium leading-relaxed">
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
