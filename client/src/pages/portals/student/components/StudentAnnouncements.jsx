import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Bell } from 'lucide-react';

import { API_URL } from '../../../../config/api';

const StudentAnnouncements = ({ studentAssignments }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/v1/announcements`);
        if (res.data.success) {
          setAnnouncements(res.data.data.slice(0, 10)); // show top 10
        }
      } catch (err) {
        console.error('Failed to fetch announcements', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  const getTagColor = (t) => {
    switch (t) {
      case 'HOLIDAY': return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'EXAM': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'EVENT': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'FEES': return 'text-blue-700 bg-blue-50 border-blue-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-205'; // NOTICE, ACADEMIC
    }
  };

  const getMixedList = () => {
    const list = [];
    if (studentAssignments && studentAssignments.length > 0) {
      studentAssignments.slice(0, 3).forEach(asg => {
        list.push({
          id: `asg-${asg._id}`,
          title: `Homework Posted: ${asg.title}`,
          time: 'Recently',
          tag: 'ACADEMIC',
          description: `Subject: ${asg.subject}. Submission is pending with a due date of ${new Date(asg.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}.`
        });
      });
    }
    
    announcements.forEach(ann => {
      list.push({
        id: ann._id,
        title: ann.title,
        time: new Date(ann.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        tag: ann.tag,
        description: ann.description
      });
    });
    return list;
  };

  const mixedList = getMixedList();

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 sm:p-6 space-y-6 text-left">
      <div className="border-b border-slate-150 pb-4">
        <h3 className="text-base font-bold text-slate-900 leading-tight">School Announcement Bulletin</h3>
        <p className="text-xs text-slate-500 mt-0.5">Official circular updates and notices issued by school authorities.</p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            <div className="h-16 bg-slate-50 rounded-lg animate-pulse border border-slate-100"></div>
            <div className="h-16 bg-slate-50 rounded-lg animate-pulse border border-slate-100"></div>
          </div>
        ) : mixedList.length === 0 ? (
          <div className="py-12 bg-slate-50 border border-slate-200 border-dashed rounded-lg text-center">
            <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h4 className="text-xs font-semibold text-slate-700">No Announcements</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">There are no school announcements listed on this board.</p>
          </div>
        ) : (
          mixedList.map((ann) => (
            <div key={ann.id} className="bg-slate-50 p-4.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors space-y-2.5 relative overflow-hidden group">
              <div className="flex justify-between items-center gap-4">
                <span className={`px-2 py-0.5 rounded text-[8px] font-bold border uppercase tracking-wider ${getTagColor(ann.tag)}`}>
                  {ann.tag}
                </span>
                <span className="text-[10px] text-slate-450 font-semibold flex items-center gap-1.5 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> {ann.time}
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-900 group-hover:opacity-95 transition-all">{ann.title}</h4>
              <p className="text-xs text-slate-650 leading-relaxed">{ann.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentAnnouncements;
