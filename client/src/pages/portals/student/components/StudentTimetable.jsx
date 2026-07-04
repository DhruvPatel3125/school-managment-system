import React, { useState } from 'react';
import { Clock } from 'lucide-react';

const StudentTimetable = () => {
  const [timetableDay, setTimetableDay] = useState('Monday');

  const mockTimetable = {
    Monday: [
      { period: '1', subject: 'Mathematics', time: '08:30 AM - 09:20 AM', room: '104', teacher: 'Mr. R. K. Sen' },
      { period: '2', subject: 'General Science', time: '09:20 AM - 10:10 AM', room: 'Science Lab', teacher: 'Mrs. S. Sharma' },
      { period: '3', subject: 'English Grammar', time: '10:30 AM - 11:20 AM', room: '104', teacher: 'Mr. A. Patel' },
      { period: '4', subject: 'Social Studies', time: '11:20 AM - 12:10 PM', room: '104', teacher: 'Miss P. Roy' },
      { period: '5', subject: 'Computer Basics', time: '01:00 PM - 01:50 PM', room: 'Computer Lab', teacher: 'Mr. R. K. Sen' },
    ],
    Tuesday: [
      { period: '1', subject: 'English Grammar', time: '08:30 AM - 09:20 AM', room: '104', teacher: 'Mr. A. Patel' },
      { period: '2', subject: 'Mathematics', time: '09:20 AM - 10:10 AM', room: '104', teacher: 'Mr. R. K. Sen' },
      { period: '3', subject: 'General Science', time: '10:30 AM - 11:20 AM', room: 'Science Lab', teacher: 'Mrs. S. Sharma' },
      { period: '4', subject: 'Art & Craft', time: '11:20 AM - 12:10 PM', room: 'Art Studio', teacher: 'Miss K. Sen' },
      { period: '5', subject: 'Physical Ed', time: '01:00 PM - 01:50 PM', room: 'Playground', teacher: 'Mr. D. Rathore' },
    ],
    Wednesday: [
      { period: '1', subject: 'Mathematics', time: '08:30 AM - 09:20 AM', room: '104', teacher: 'Mr. R. K. Sen' },
      { period: '2', subject: 'General Science', time: '09:20 AM - 10:10 AM', room: 'Science Lab', teacher: 'Mrs. S. Sharma' },
      { period: '3', subject: 'Social Studies', time: '10:30 AM - 11:20 AM', room: '104', teacher: 'Miss P. Roy' },
      { period: '4', subject: 'English Grammar', time: '11:20 AM - 12:10 PM', room: '104', teacher: 'Mr. A. Patel' },
      { period: '5', subject: 'Library Study', time: '01:00 PM - 01:50 PM', room: 'Central Library', teacher: 'Mrs. G. Joshi' },
    ],
    Thursday: [
      { period: '1', subject: 'General Science', time: '08:30 AM - 09:20 AM', room: 'Science Lab', teacher: 'Mrs. S. Sharma' },
      { period: '2', subject: 'Social Studies', time: '09:20 AM - 10:10 AM', room: '104', teacher: 'Miss P. Roy' },
      { period: '3', subject: 'Mathematics', time: '10:30 AM - 11:20 AM', room: '104', teacher: 'Mr. R. K. Sen' },
      { period: '4', subject: 'English Grammar', time: '11:20 AM - 12:10 PM', room: '104', teacher: 'Mr. A. Patel' },
      { period: '5', subject: 'Music & Theatre', time: '01:00 PM - 01:50 PM', room: 'Music Hall', teacher: 'Mr. N. Varma' },
    ],
    Friday: [
      { period: '1', subject: 'Mathematics', time: '08:30 AM - 09:20 AM', room: '104', teacher: 'Mr. R. K. Sen' },
      { period: '2', subject: 'General Science', time: '09:20 AM - 10:10 AM', room: 'Science Lab', teacher: 'Mrs. S. Sharma' },
      { period: '3', subject: 'Computer Basics', time: '10:30 AM - 11:20 AM', room: 'Computer Lab', teacher: 'Mr. R. K. Sen' },
      { period: '4', subject: 'Self Study / Project', time: '11:20 AM - 12:10 PM', room: '104', teacher: 'Class Teacher' },
      { period: '5', subject: 'Weekly Assessment', time: '01:00 PM - 01:50 PM', room: 'Exam Hall A', teacher: 'Mr. R. K. Sen' },
    ]
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8 shadow-2xl space-y-8 text-left">
      <div className="border-b border-slate-200 pb-4">
        <h3 className="text-lg font-extrabold text-slate-900">Weekly Class Schedule</h3>
        <p className="text-xs text-slate-400 mt-1">Browse weekly academic timelines and classroom details.</p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
          <button
            key={day}
            onClick={() => setTimetableDay(day)}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all ${timetableDay === day
                ? 'bg-primary text-white shadow-md'
                : 'text-slate-500 hover:bg-slate-100'
              }`}
          >
            {day}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockTimetable[timetableDay]?.map((slot) => (
          <div key={slot.period} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 hover:border-slate-800 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-500 border border-slate-200 text-[8px] font-black uppercase tracking-wider">
                  Period {slot.period}
                </span>
                <span className="text-[10px] text-slate-450 font-bold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" /> {slot.time.split(' - ')[0]}
                </span>
              </div>
              <h4 className="font-extrabold text-sm text-slate-900">{slot.subject}</h4>
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-450 border-t border-slate-900 pt-3.5 font-bold">
              <span>Room: <strong className="text-slate-200">{slot.room}</strong></span>
              <span>Teacher: <strong className="text-slate-200">{slot.teacher}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentTimetable;
