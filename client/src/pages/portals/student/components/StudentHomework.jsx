import React, { useState } from 'react';
import { Loader2, Search, ClipboardList } from 'lucide-react';
import { useTenantTheme } from '../../../../context/TenantThemeContext';
import axios from 'axios';

import { API_URL } from '../../../../config/api';

const StudentHomework = ({ studentAssignments, fetchStudentAssignments, fetchStudentDashboard }) => {
  const { tenant } = useTenantTheme();
  const [homeworkFilter, setHomeworkFilter] = useState('all');
  const [homeworkSearch, setHomeworkSearch] = useState('');
  const [submitAssignmentModal, setSubmitAssignmentModal] = useState(null);
  const [submitAnswerText, setSubmitAnswerText] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submittingAssignment, setSubmittingAssignment] = useState(false);

  const primaryBrandColor = tenant?.primaryColor || '#0D1B2A';

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!submitAnswerText.trim()) {
      setSubmitError('Please enter your response text.');
      return;
    }

    try {
      setSubmittingAssignment(true);
      const res = await axios.post(`${API_URL}/api/v1/students/portal/assignments/${submitAssignmentModal._id}/submit`, {
        answerText: submitAnswerText.trim()
      });
      if (res.data.success) {
        setSubmitAssignmentModal(null);
        setSubmitAnswerText('');
        fetchStudentAssignments();
        fetchStudentDashboard();
      }
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Failed to submit assignment.');
    } finally {
      setSubmittingAssignment(false);
    }
  };

  const filteredAssignments = studentAssignments.filter(asg => {
    if (homeworkFilter !== 'all' && asg.submissionStatus !== homeworkFilter) return false;
    if (homeworkSearch && 
        !asg.subject.toLowerCase().includes(homeworkSearch.toLowerCase()) && 
        !asg.title.toLowerCase().includes(homeworkSearch.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-150 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 leading-tight">Homework & Assignments</h3>
          <p className="text-xs text-slate-500 mt-0.5">Submit homework, tasks, and check evaluation results.</p>
        </div>
        <div className="relative w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by subject or title..."
            value={homeworkSearch}
            onChange={e => setHomeworkSearch(e.target.value)}
            className="w-full sm:w-60 pl-8 pr-3 py-1.5 rounded-lg border border-slate-250 text-xs text-slate-800 focus:outline-none focus:border-slate-500 bg-white placeholder-slate-400 transition-colors shadow-sm"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Tabs Selector: Unpilled Underline Treatment */}
      <div className="flex border-b border-slate-200 gap-6">
        {['all', 'pending', 'submitted', 'graded'].map((tab) => (
          <button
            key={tab}
            onClick={() => setHomeworkFilter(tab)}
            className={`py-2 text-xs font-semibold capitalize relative transition-all ${
              homeworkFilter === tab
                ? 'text-slate-900'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <span>{tab} tasks</span>
            {homeworkFilter === tab && (
              <div 
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" 
                style={{ backgroundColor: primaryBrandColor }}
              />
            )}
          </button>
        ))}
      </div>

      {filteredAssignments.length === 0 ? (
        <div className="bg-slate-50 border border-slate-250 border-dashed rounded-xl p-12 text-center">
          <ClipboardList className="w-8 h-8 text-slate-350 mx-auto mb-2" />
          <h4 className="text-xs font-semibold text-slate-700">No Assignments Found</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">You have no tasks matching this filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAssignments.map((asg) => {
            const isPending = asg.submissionStatus === 'pending';
            const isSubmitted = asg.submissionStatus === 'submitted';
            const isGraded = asg.submissionStatus === 'graded';

            return (
              <div key={asg._id} className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex flex-col justify-between space-y-4 hover:border-slate-350 transition-all relative group">
                {isGraded && (
                  <div 
                    className="absolute right-4 top-4 border-2 rounded-lg flex items-center justify-center text-[10px] font-bold px-2 py-0.5 select-none pointer-events-none uppercase tracking-wider bg-slate-50"
                    style={{ borderColor: primaryBrandColor, color: primaryBrandColor }}
                  >
                    Grade {asg.grade || 'A'}
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 text-[9px] font-bold uppercase tracking-wider">
                      {asg.subject}
                    </span>
                    <span className="text-[10px] text-slate-450 font-medium">
                      Due: {new Date(asg.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 group-hover:opacity-90 transition-opacity pr-16">{asg.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{asg.description}</p>
                </div>

                <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                    isGraded
                      ? 'bg-emerald-50 border-emerald-250 text-emerald-700'
                      : isSubmitted
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'bg-amber-50 border-amber-200 text-amber-700'
                  }`}>
                    {asg.submissionStatus}
                  </span>

                  {isPending ? (
                    <button
                      onClick={() => {
                        setSubmitError('');
                        setSubmitAnswerText('');
                        setSubmitAssignmentModal(asg);
                      }}
                      className="px-3 py-1.5 text-white font-semibold text-[10px] rounded-lg tracking-wider uppercase transition-all shadow-sm active:scale-95 hover:opacity-95"
                      style={{ backgroundColor: primaryBrandColor }}
                    >
                      Submit Homework
                    </button>
                  ) : (
                    <button
                      onClick={() => alert(`YOUR SUBMISSION WRITEUP:\n"${asg.answerText}"\n\nGRADE: ${asg.grade || 'Pending Grading'}\nFEEDBACK: ${asg.feedback || 'Evaluating soon.'}`)}
                      className="px-3 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-[10px] rounded-lg tracking-wider uppercase transition-all"
                    >
                      View Submission
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Composing Submission Modal */}
      {submitAssignmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-xl p-5 border border-slate-200 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-sm font-bold text-slate-900 mb-0.5">Submit Homework</h3>
            <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider mb-4">{submitAssignmentModal.title}</p>
            
            {submitError && (
              <div className="mb-4 p-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium">
                {submitError}
              </div>
            )}
            
            <form onSubmit={handleAssignmentSubmit} className="space-y-4">
              <textarea
                className="w-full px-3 py-2 border border-slate-250 rounded-lg focus:outline-none focus:border-slate-500 bg-slate-50 focus:bg-white text-xs text-slate-800 h-32 resize-none leading-relaxed"
                placeholder="Type your submission writeup here..."
                value={submitAnswerText}
                onChange={e => setSubmitAnswerText(e.target.value)}
                required
              />
              <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                <button 
                  type="button" 
                  onClick={() => setSubmitAssignmentModal(null)} 
                  className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold transition-colors"
                >
                  Discard
                </button>
                <button 
                  type="submit" 
                  disabled={submittingAssignment} 
                  className="px-4 py-1.5 text-white text-xs font-semibold rounded-lg shadow-sm hover:opacity-95 transition-all flex items-center gap-1.5"
                  style={{ backgroundColor: primaryBrandColor }}
                >
                  {submittingAssignment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentHomework;
