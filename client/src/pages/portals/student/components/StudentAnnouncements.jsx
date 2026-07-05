import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5001`;

const StudentAnnouncements = ({ studentAssignments }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/v1/announcements`);
        if (res.data.success) {
          setAnnouncements(res.data.data.slice(0, 5)); // show top 5 on dashboard
        }
      } catch (err) {
        console.error('Failed to fetch announcements', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  // Optionally mix in assignments
  const getMixedList = () => {
    const list = [];
    if (studentAssignments && studentAssignments.length > 0) {
      studentAssignments.slice(0, 2).forEach(asg => {
        list.push({
          id: `asg-${asg._id}`,
          title: `New Homework: ${asg.title}`,
          time: 'Recently posted',
          tag: 'ACADEMIC',
          description: `Subject: ${asg.subject}. Submission is pending with a due date of ${new Date(asg.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}.`
        });
      });
    }
    
    announcements.forEach(ann => {
      list.push({
        id: ann._id,
        title: ann.title,
        time: new Date(ann.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        tag: ann.tag,
        description: ann.description
      });
    });
    return list;
  };

  const mixedList = getMixedList();

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8 shadow-2xl space-y-8 text-left max-w-4xl mx-auto h-full">
      <div className="border-b border-slate-200 pb-4">
        <h3 className="text-lg font-extrabold text-slate-900">School Announcement Bulletin</h3>
        <p className="text-xs text-slate-400 mt-1">Official circular updates issued under student notifications.</p>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-slate-100 rounded-2xl"></div>
            <div className="h-20 bg-slate-100 rounded-2xl"></div>
          </div>
        ) : mixedList.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm font-medium text-slate-400">No announcements found</p>
          </div>
        ) : (
          mixedList.map((ann) => (
            <div key={ann.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 relative overflow-hidden group">
              <div className="flex justify-between items-center">
                <span className="px-2.5 py-0.5 rounded text-[8px] font-black bg-blue-100/50 border border-blue-100 shadow-sm text-blue-600 uppercase tracking-widest font-mono">
                  {ann.tag}
                </span>
                <span className="text-[9px] text-slate-500 font-bold flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {ann.time}
                </span>
              </div>
              <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">{ann.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">{ann.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentAnnouncements;
