import React from 'react';
import axios from 'axios';
import { Plus, Loader2, Award } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5001`;

const TeacherAssignments = ({
  teacherClasses,
  assignClassId,
  setAssignClassId,
  assignSection,
  setAssignSection,
  assignSubject,
  setAssignSubject,
  assignTitle,
  setAssignTitle,
  assignDescription,
  setAssignDescription,
  assignDueDate,
  setAssignDueDate,
  creatingAssignment,
  setCreatingAssignment,
  assignmentSuccessMsg,
  setAssignmentSuccessMsg,
  teacherAssignments,
  fetchTeacherAssignments,
  fetchTeacherDashboard,
  gradeSubmissionModal,
  setGradeSubmissionModal,
  inputGrade,
  setInputGrade,
  inputFeedback,
  setInputFeedback,
  submittingGrade,
  setSubmittingGrade
}) => {

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    setAssignmentSuccessMsg('');
    if (!assignTitle || !assignDescription || !assignDueDate || !assignClassId || !assignSection || !assignSubject) {
      alert('Please fill in all assignment fields.');
      return;
    }
    try {
      setCreatingAssignment(true);
      const res = await axios.post(`${API_URL}/api/v1/teachers/portal/assignments`, {
        title: assignTitle,
        description: assignDescription,
        dueDate: assignDueDate,
        classId: assignClassId,
        section: assignSection,
        subject: assignSubject
      });
      if (res.data.success) {
        setAssignmentSuccessMsg('Homework Assignment created successfully!');
        setAssignTitle('');
        setAssignDescription('');
        setAssignDueDate('');
        fetchTeacherAssignments();
        fetchTeacherDashboard();
        setTimeout(() => setAssignmentSuccessMsg(''), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create assignment.');
    } finally {
      setCreatingAssignment(false);
    }
  };

  const submitGradingFeedback = async (e) => {
    e.preventDefault();
    try {
      setSubmittingGrade(true);
      const res = await axios.put(`${API_URL}/api/v1/teachers/portal/assignments/${gradeSubmissionModal.assignmentId}/submissions/${gradeSubmissionModal.studentId}/grade`, {
        grade: inputGrade,
        feedback: inputFeedback
      });
      if (res.data.success) {
        setGradeSubmissionModal(null);
        setInputGrade('A');
        setInputFeedback('');
        fetchTeacherAssignments();
        fetchTeacherDashboard();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to grade submission.');
    } finally {
      setSubmittingGrade(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left side: Create Assignment Form */}
      <div className="glass-card p-5 rounded-2xl border border-slate-200 shadow-sm bg-white space-y-4 lg:col-span-1 h-fit">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
          <Plus className="w-4 h-4" /> Create Homework Assignment
        </h3>

        {assignmentSuccessMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-lg text-xs font-semibold">
            {assignmentSuccessMsg}
          </div>
        )}

        <form onSubmit={handleCreateAssignment} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Class</label>
            <select
              value={assignClassId}
              onChange={e => setAssignClassId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-transparent text-slate-900"
            >
              {teacherClasses.map(cls => (
                <option key={cls._id} value={cls._id}>{cls.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Section</label>
            <select
              value={assignSection}
              onChange={e => setAssignSection(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-transparent text-slate-900"
            >
              {teacherClasses.find(c => c._id === assignClassId)?.sections?.map(sec => (
                <option key={sec} value={sec}>Section {sec}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Subject</label>
            <select
              value={assignSubject}
              onChange={e => setAssignSubject(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-transparent text-slate-900"
            >
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
              <option value="English">English</option>
              <option value="Computer Sci.">Computer Sci.</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Assignment Title</label>
            <input
              type="text"
              placeholder="e.g. Calculus Exercises"
              value={assignTitle}
              onChange={e => setAssignTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-transparent text-slate-900"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Description / Guidelines</label>
            <textarea
              rows="3"
              placeholder="Detail homework instructions..."
              value={assignDescription}
              onChange={e => setAssignDescription(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-transparent text-slate-900"
            ></textarea>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Due Date</label>
            <input
              type="date"
              value={assignDueDate}
              onChange={e => setAssignDueDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-transparent text-slate-900"
            />
          </div>

          <button
            type="submit"
            disabled={creatingAssignment}
            className="w-full py-2 bg-primary hover:opacity-90 active:scale-95 text-white font-bold rounded-lg shadow transition-all flex items-center justify-center gap-1"
          >
            {creatingAssignment ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" /> Publish Assignment
              </>
            )}
          </button>
        </form>
      </div>

      {/* Right side: Created Assignments & Submissions List */}
      <div className="space-y-4 lg:col-span-2">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">Assignments & Submissions</h3>

        {teacherAssignments.length === 0 ? (
          <div className="glass-card p-12 text-center text-slate-400 text-xs rounded-xl border border-slate-200">
            No assignments published yet. Use the dispatcher to create one.
          </div>
        ) : (
          <div className="space-y-4">
            {teacherAssignments.map((asg) => (
              <div key={asg._id} className="glass-card p-5 rounded-2xl border border-slate-200 shadow-sm bg-white space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-blue-50 text-primary px-2 py-0.5 rounded">
                      {asg.classId?.name} ({asg.section}) - {asg.subject}
                    </span>
                    <h4 className="font-extrabold text-sm text-slate-900 mt-1.5">{asg.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Due Date: {new Date(asg.dueDate).toLocaleDateString()}</p>
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                    {asg.submissions?.length || 0} Submissions
                  </span>
                </div>
                
                {asg.submissions && asg.submissions.length > 0 && (
                  <div className="border-t border-slate-100 pt-4 mt-2">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Student Submissions</h5>
                    <div className="space-y-2">
                      {asg.submissions.map(sub => (
                        <div key={sub.studentId?._id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 hover:border-slate-300 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-primary flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                              {sub.studentId?.name?.charAt(0) || 'S'}
                            </div>
                            <div>
                              <strong className="text-xs text-slate-900 block leading-tight">{sub.studentId?.name || 'Unknown Student'}</strong>
                              <span className="text-[9px] font-mono text-slate-500">Submitted: {new Date(sub.submittedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${sub.status === 'graded' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                              {sub.status === 'graded' ? `Score: ${sub.grade}` : 'Needs Review'}
                            </span>
                            <button
                              onClick={() => setGradeSubmissionModal({
                                assignmentId: asg._id,
                                studentId: sub.studentId?._id,
                                studentName: sub.studentId?.name,
                                answerText: sub.answerText,
                                currentGrade: sub.grade,
                                currentFeedback: sub.feedback
                              })}
                              className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-600 rounded-lg shadow-sm transition-all"
                            >
                              Evaluate
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL: Evaluate Grade submission */}
      {gradeSubmissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 border border-slate-200 shadow-2xl relative">
            <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-indigo-500" /> Grade Homework Submission
            </h3>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-3">Student: {gradeSubmissionModal.studentName}</p>

            <div className="bg-slate-50/60 p-3 rounded-lg border border-slate-100 text-xs space-y-1 mb-4">
              <span className="text-[9px] text-slate-500 uppercase font-black tracking-wider block">Submitted Answer Response:</span>
              <p className="text-slate-700 font-sans italic leading-relaxed">
                "{gradeSubmissionModal.answerText}"
              </p>
            </div>

            <form onSubmit={submitGradingFeedback} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Score / Grade</label>
                  <select
                    value={inputGrade}
                    onChange={e => setInputGrade(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-transparent text-slate-900"
                  >
                    <option value="A+">A+</option>
                    <option value="A">A</option>
                    <option value="B+">B+</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="F">F</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Feedback Remarks</label>
                  <input
                    type="text"
                    placeholder="e.g. Excellent thesis analysis..."
                    value={inputFeedback}
                    onChange={e => setInputFeedback(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-transparent text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100/50">
                <button
                  type="button"
                  onClick={() => setGradeSubmissionModal(null)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingGrade}
                  className="px-5 py-2 bg-primary hover:opacity-90 active:scale-95 text-white rounded-lg font-semibold flex items-center gap-1 shadow"
                >
                  {submittingGrade ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <Award className="w-3.5 h-3.5" /> Submit Score
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherAssignments;
