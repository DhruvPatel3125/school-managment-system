import React, { useState } from 'react';
import { Send } from 'lucide-react';

const StudentMessages = () => {
  const [chatTeacher, setChatTeacher] = useState('Mrs. S. Sharma (Science)');
  const [newMsgText, setNewMsgText] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'teacher', text: 'Hi! Did you check the new homework assigned for this week?', time: '09:15 AM' },
    { sender: 'student', text: 'Yes, Mrs. Sharma. I am currently working on the physics assignment.', time: '09:20 AM' },
    { sender: 'teacher', text: 'Perfect. Let me know if you need any help with the questions.', time: '09:25 AM' }
  ]);

  const mockTeachers = [
    { name: 'Mrs. S. Sharma (Science)', status: 'Online' },
    { name: 'Mr. R. K. Sen (Mathematics)', status: 'Offline' },
    { name: 'Mr. A. Patel (English)', status: 'Online' },
    { name: 'Miss P. Roy (Computer)', status: 'Online' }
  ];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMsgText.trim()) return;

    const userMessage = { sender: 'student', text: newMsgText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setChatMessages(prev => [...prev, userMessage]);
    setNewMsgText('');

    setTimeout(() => {
      const reply = {
        sender: 'teacher',
        text: `Got your message. I will look into it and get back to you during school hours.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, reply]);
    }, 1200);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm shadow-2xl overflow-hidden h-[550px] flex flex-col md:flex-row text-left">
      <div className="w-full md:w-64 border-r border-slate-200 flex flex-col shrink-0 bg-slate-50">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Instructor Directory</span>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-slate-200 p-2 space-y-1">
          {mockTeachers.map((tc) => {
            const isActive = chatTeacher === tc.name;
            const initials = tc.name.split(' ').slice(1, 3).map(n => n[0]).join('');
            return (
              <button
                key={tc.name}
                onClick={() => { setChatTeacher(tc.name); setChatMessages([]); }}
                className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${isActive ? 'bg-blue-50 border border-blue-200 text-blue-700' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-blue-100 shadow-blue-500/20 text-primary flex items-center justify-center font-extrabold text-[10px] uppercase">
                  {initials}
                </div>
                <div className="min-w-0 text-left space-y-0.5">
                  <h5 className="text-[11px] font-bold truncate leading-none">{tc.name.split(' ')[0]} {tc.name.split(' ')[1]}</h5>
                  <span className={`text-[8px] font-bold block ${tc.status === 'Online' ? 'text-emerald-500' : 'text-slate-500'}`}>{tc.status}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-between bg-slate-50">
        <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="text-[12px] font-black text-slate-900">{chatTeacher}</h4>
            <span className="text-[8px] text-emerald-500 font-bold block">Secure School Tunnel</span>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {chatMessages.map((msg, index) => {
            const isTeacher = msg.sender === 'teacher';
            return (
              <div key={index} className={`flex ${isTeacher ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-xs p-3.5 rounded-2xl text-xs space-y-1 font-medium ${isTeacher
                    ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                    : 'bg-primary text-white rounded-tr-none'
                  }`}>
                  <p className="leading-relaxed">{msg.text}</p>
                  <span className={`text-[8px] opacity-70 block text-right font-semibold mt-1`}>{msg.time}</span>
                </div>
              </div>
            );
          })}
        </div>

        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 bg-white flex items-center gap-3">
          <input
            type="text"
            placeholder="Enter message for your class teacher..."
            value={newMsgText}
            onChange={e => setNewMsgText(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-primary transition-all font-sans"
          />
          <button type="submit" className="p-2.5 bg-primary hover:bg-primary/95 text-white rounded-xl shadow-md transition-all active:scale-95">
            <Send className="w-4.5 h-4.5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentMessages;
