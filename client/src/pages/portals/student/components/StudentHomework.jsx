import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import axios from 'axios';

const StudentHomework = ({ studentAssignments, fetchStudentAssignments, fetchStudentDashboard }) => {
  const [homeworkFilter, setHomeworkFilter] = useState('all');
  const [homeworkSearch, setHomeworkSearch] = useState('');
  const [submitAssignmentModal, setSubmitAssignmentModal] = useState(null);
  const [submitAnswerText, setSubmitAnswerText] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submittingAssignment, setSubmittingAssignment] = useState(false);

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!submitAnswerText) {
      setSubmitError('Please enter your response text.');
      return;
    }

    try {
      setSubmittingAssignment(true);
      const res = await axios.post(`http://localhost:5001/api/v1/students/portal/assignments/${submitAssignmentModal._id}/submit`, {
        answerText: submitAnswerText
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

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900">Homework & Assignments</h3>
          <p className="text-xs text-slate-400 mt-1">Submit answer writeups and check evaluations.</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search subject..."
            value={homeworkSearch}
            onChange={e => setHomeworkSearch(e.target.value)}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-400 max-w-xs shadow-sm transition-colors"
          />
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-200 pb-2">
        {['all', 'pending', 'submitted', 'graded'].map((tab) => (
          <button
            key={tab}
            onClick={() => setHomeworkFilter(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${homeworkFilter === tab
                ? 'bg-primary text-white shadow-md'
                : 'text-slate-500 hover:bg-slate-100'
              }`}
          >
            {tab} Tasks
          </button>
        ))}
      </div>

      {studentAssignments.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-12 text-center text-xs text-slate-500">
          No active homework records found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {studentAssignments
            .filter(asg => {
              if (homeworkFilter !== 'all' && asg.submissionStatus !== homeworkFilter) return false;
              if (homeworkSearch && !asg.subject.toLowerCase().includes(homeworkSearch.toLowerCase()) && !asg.title.toLowerCase().includes(homeworkSearch.toLowerCase())) return false;
              return true;
            })
            .map((asg) => {
              const isPending = asg.submissionStatus === 'pending';
              const isSubmitted = asg.submissionStatus === 'submitted';
              const isGraded = asg.submissionStatus === 'graded';

              return (
                <div key={asg._id} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col justify-between space-y-5 hover:border-slate-800 transition-all duration-300 shadow-xl group relative overflow-hidden">
                  {isGraded && (
                    <div className="absolute right-4 top-4 rotate-12 w-10 h-10 border-2 border-emerald-500/40 rounded-full flex items-center justify-center text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-500/5 select-none pointer-events-none">
                      {asg.grade || 'A'}
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black bg-primary/10 border border-blue-100 shadow-blue-500/20 shadow-xl text-primary uppercase tracking-wider">
                        {asg.subject}
                      </span>
                      <span className="text-[10px] text-slate-500 font-bold">
                        Due: {new Date(asg.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-primary transition-colors">{asg.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium line-clamp-2">{asg.description}</p>
                  </div>

                  <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded text-[9px] font-extrabold uppercase border ${isGraded
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
                        : isSubmitted
                          ? 'bg-blue-50 border-indigo-500/20 text-indigo-600'
                          : 'bg-amber-500/10 border-amber-500/20 text-amber-600'
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
                        className="px-4 py-2 bg-primary hover:bg-primary/95 text-white font-extrabold text-[10px] rounded-xl tracking-wider uppercase transition-all shadow-md active:scale-95"
                      >
                        Submit Homework
                      </button>
                    ) : (
                      <button
                        onClick={() => alert(`YOUR SUBMISSION WRITEUP:\n"${asg.answerText}"\n\nGRADE: ${asg.grade || 'Pending Grading'}\nFEEDBACK: ${asg.feedback || 'Evaluating soon.'}`)}
                        className="px-4 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-[10px] rounded-xl tracking-wider uppercase transition-all"
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
      
      {submitAssignmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 border border-slate-200 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 mb-1">Submit Assignment</h3>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-4">{submitAssignmentModal.title}</p>
            {submitError && <div className="mb-4 p-2 bg-rose-50 border border-rose-100 text-rose-600 text-xs rounded">{submitError}</div>}
            <form onSubmit={handleAssignmentSubmit}>
              <textarea
                className="w-full px-3 py-2 border rounded-xl bg-slate-50 focus:bg-white text-xs text-slate-900 mb-4 h-32"
                placeholder="Type your answer here..."
                value={submitAnswerText}
                onChange={e => setSubmitAnswerText(e.target.value)}
              ></textarea>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setSubmitAssignmentModal(null)} className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200">Cancel</button>
                <button type="submit" disabled={submittingAssignment} className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-white flex items-center gap-1">
                  {submittingAssignment ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit'}
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
