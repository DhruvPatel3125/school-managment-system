import React from 'react';
import { FileText } from 'lucide-react';

const StudentDocuments = () => {
  const mockDocuments = [
    { id: 'doc-1', name: 'Annual Report Card - Term 1.pdf', size: '1.4 MB', type: 'PDF', category: 'Academic Report', date: '2026-06-15' },
    { id: 'doc-2', name: 'Syllabus & Curriculum Guide 2026-27.pdf', size: '3.8 MB', type: 'PDF', category: 'Syllabus', date: '2026-06-01' },
    { id: 'doc-3', name: 'Sports Day Participation Certificate.png', size: '820 KB', type: 'Image', category: 'Certificate', date: '2026-05-12' },
    { id: 'doc-4', name: 'School Bus Route Map & Timings.pdf', size: '950 KB', type: 'PDF', category: 'General Info', date: '2026-06-20' },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8 shadow-2xl space-y-8 text-left max-w-4xl mx-auto">
      <div>
        <h3 className="text-lg font-extrabold text-slate-900">Student Locker Files</h3>
        <p className="text-xs text-slate-400 mt-1">Review official downloads, term cards, and bus itineraries.</p>
      </div>

      <div className="space-y-4">
        {mockDocuments.map((doc) => (
          <div key={doc.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between hover:border-slate-300 transition-colors">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-blue-100 shadow-blue-500/20 text-primary flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0 text-left space-y-0.5">
                <h4 className="text-[12px] font-black text-slate-900 truncate">{doc.name}</h4>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{doc.category} • {doc.size} • {doc.date}</p>
              </div>
            </div>
            <button
              onClick={() => alert(`Initiating download for ${doc.name}...`)}
              className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-100 rounded-xl text-[10px] text-slate-600 font-bold uppercase tracking-wider transition-all shadow-sm"
            >
              Download
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentDocuments;
