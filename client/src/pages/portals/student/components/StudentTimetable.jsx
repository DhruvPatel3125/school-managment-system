import React, { useState } from 'react';
import { Clock, User, MapPin } from 'lucide-react';
import { useTenantTheme } from '../../../../context/TenantThemeContext';

const StudentTimetable = () => {
  const { tenant } = useTenantTheme();
  const [timetableDay, setTimetableDay] = useState('Monday');

  const primaryBrandColor = tenant?.primaryColor || '#0D1B2A';

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
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 sm:p-6 space-y-6 text-left">
      <div className="border-b border-slate-150 pb-4">
        <h3 className="text-base font-bold text-slate-900 leading-tight">Weekly Class Schedule</h3>
        <p className="text-xs text-slate-500 mt-0.5">Browse classroom schedules, slot durations, and assigned subject tutors.</p>
      </div>

      {/* Weekday Selector: Unpilled Active Indicator */}
      <div className="flex border-b border-slate-200 gap-6 overflow-x-auto pb-0.5">
        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
          <button
            key={day}
            onClick={() => setTimetableDay(day)}
            className={`py-2 text-xs font-semibold shrink-0 relative transition-all ${
              timetableDay === day
                ? 'text-slate-900 font-bold'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <span>{day}</span>
            {timetableDay === day && (
              <div 
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" 
                style={{ backgroundColor: primaryBrandColor }}
              />
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockTimetable[timetableDay]?.map((slot) => (
          <div key={slot.period} className="bg-slate-50 p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors flex flex-col justify-between space-y-3.5">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="px-2 py-0.5 rounded bg-slate-200 border border-slate-300 text-slate-700 text-[8px] font-bold uppercase tracking-wider">
                  Period {slot.period}
                </span>
                <span className="text-[10px] text-slate-450 font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> 
                  <span>{slot.time.split(' - ')[0]}</span>
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-900">{slot.subject}</h4>
            </div>
            
            <div className="flex justify-between items-center text-[10px] text-slate-500 border-t border-slate-200 pt-2.5 font-medium">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Room: <strong className="text-slate-700 font-semibold">{slot.room}</strong></span>
              </span>
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span><strong className="text-slate-700 font-semibold">{slot.teacher}</strong></span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentTimetable;
