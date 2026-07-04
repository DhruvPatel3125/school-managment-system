import React from 'react';

const StudentAnnouncements = ({ studentAssignments }) => {
  const getAnnouncements = () => {
    const list = [];
    studentAssignments.slice(0, 2).forEach(asg => {
      list.push({
        id: `asg-${asg._id}`,
        title: `New Homework: ${asg.title}`,
        time: 'Recently posted',
        tag: 'ACADEMIC',
        description: `Subject: ${asg.subject}. Submission is pending with a due date of ${new Date(asg.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}.`
      });
    });
    list.push({
      id: 'notice-1',
      title: 'School Holiday Notice',
      time: '2 days ago',
      tag: 'HOLIDAY',
      description: `All classes will remain closed on account of public celebrations.`
    });
    list.push({
      id: 'notice-2',
      title: 'PTM Schedule Reminder',
      time: '5 days ago',
      tag: 'PTM MEETING',
      description: `Parent-Teacher interaction session is scheduled for Friday from 12:00 PM.`
    });
    return list;
  };

  const announcementsList = getAnnouncements();

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8 shadow-2xl space-y-8 text-left max-w-4xl mx-auto">
      <div className="border-b border-slate-200 pb-4">
        <h3 className="text-lg font-extrabold text-slate-900">School Announcement Bulletin</h3>
        <p className="text-xs text-slate-400 mt-1">Official circular updates issued under student notifications.</p>
      </div>

      <div className="space-y-6">
        {announcementsList.map((ann) => (
          <div key={ann.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 relative overflow-hidden group">
            <div className="flex justify-between items-center">
              <span className="px-2.5 py-0.5 rounded text-[8px] font-black bg-primary/10 border border-blue-100 shadow-blue-500/20 text-primary uppercase tracking-widest font-mono">
                {ann.tag}
              </span>
              <span className="text-[9px] text-slate-500 font-bold">{ann.time}</span>
            </div>
            <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-primary transition-colors">{ann.title}</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">{ann.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentAnnouncements;
