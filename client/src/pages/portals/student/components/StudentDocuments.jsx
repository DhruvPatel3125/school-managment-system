import React from 'react';
import { FileText, Download } from 'lucide-react';
import { useTenantTheme } from '../../../../context/TenantThemeContext';

const StudentDocuments = () => {
  const { tenant } = useTenantTheme();
  
  const primaryBrandColor = tenant?.primaryColor || '#0D1B2A';

  const mockDocuments = [
    { id: 'doc-1', name: 'Annual Report Card - Term 1.pdf', size: '1.4 MB', type: 'PDF', category: 'Academic Report', date: '2026-06-15' },
    { id: 'doc-2', name: 'Syllabus & Curriculum Guide 2026-27.pdf', size: '3.8 MB', type: 'PDF', category: 'Syllabus', date: '2026-06-01' },
    { id: 'doc-3', name: 'Sports Day Participation Certificate.png', size: '820 KB', type: 'Image', category: 'Certificate', date: '2026-05-12' },
    { id: 'doc-4', name: 'School Bus Route Map & Timings.pdf', size: '950 KB', type: 'PDF', category: 'General Info', date: '2026-06-20' },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 sm:p-6 space-y-6 text-left">
      <div className="border-b border-slate-150 pb-4">
        <h3 className="text-base font-bold text-slate-900 leading-tight">Student Locker Files</h3>
        <p className="text-xs text-slate-500 mt-0.5">Access official downloads, term cards, academic syllabi, and reports.</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {mockDocuments.map((doc) => (
          <div key={doc.id} className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-slate-200/60 border border-slate-300 text-slate-500 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-slate-550" />
              </div>
              <div className="min-w-0 text-left">
                <h4 className="text-xs font-bold text-slate-800 truncate">{doc.name}</h4>
                <p className="text-[10px] text-slate-450 mt-1 font-semibold uppercase tracking-wider">
                  {doc.category} • {doc.size} • {new Date(doc.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => alert(`Initiating download for ${doc.name}...`)}
              className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-[10px] text-slate-700 font-semibold uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5 shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Download</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentDocuments;
