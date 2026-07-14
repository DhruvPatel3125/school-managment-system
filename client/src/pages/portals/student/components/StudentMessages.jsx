import React, { useState } from 'react';
import { Send, UserCheck, MessageSquare, ChevronDown } from 'lucide-react';
import { useTenantTheme } from '../../../../context/TenantThemeContext';

const StudentMessages = () => {
  const { tenant } = useTenantTheme();
  const [chatTeacher, setChatTeacher] = useState('Mrs. S. Sharma (Science)');
  const [newMsgText, setNewMsgText] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'teacher', text: 'Hi! Did you check the new homework assigned for this week?', time: '09:15 AM' },
    { sender: 'student', text: 'Yes, Mrs. Sharma. I am currently working on the physics assignment.', time: '09:20 AM' },
    { sender: 'teacher', text: 'Perfect. Let me know if you need any help with the questions.', time: '09:25 AM' }
  ]);

  const primaryBrandColor = tenant?.primaryColor || '#0D1B2A';

  const mockTeachers = [
    { name: 'Mrs. S. Sharma (Science)', status: 'Online' },
    { name: 'Mr. R. K. Sen (Mathematics)', status: 'Offline' },
    { name: 'Mr. A. Patel (English)', status: 'Online' },
    { name: 'Miss P. Roy (Computer)', status: 'Online' }
  ];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMsgText.trim()) return;

    const userMessage = { 
      sender: 'student', 
      text: newMsgText.trim(), 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };
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
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden h-[520px] flex flex-col md:flex-row text-left">
      {/* Instructor Directory Sidebar */}
      <div className="w-full md:w-64 border-r border-slate-200 flex flex-col shrink-0 bg-slate-50">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Instructor Directory</span>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {mockTeachers.map((tc) => {
            const isActive = chatTeacher === tc.name;
            const initials = tc.name.split(' ').slice(1, 3).map(n => n[0]).join('');
            
            return (
              <button
                key={tc.name}
                onClick={() => { setChatTeacher(tc.name); setChatMessages([]); }}
                className={`w-full p-2.5 rounded-lg flex items-center gap-3 transition-colors ${
                  isActive 
                    ? 'bg-slate-100 text-slate-900 border-l-2' 
                    : 'text-slate-500 hover:bg-slate-100/60'
                }`}
                style={{ borderLeftColor: isActive ? primaryBrandColor : 'transparent' }}
              >
                <div 
                  className="w-8 h-8 rounded bg-slate-200 flex items-center justify-center font-bold text-[10px] uppercase shrink-0 text-slate-700"
                >
                  {initials}
                </div>
                <div className="min-w-0 text-left space-y-0.5">
                  <h5 className="text-[11px] font-bold text-slate-800 truncate leading-none">
                    {tc.name.split(' ')[0]} {tc.name.split(' ')[1]}
                  </h5>
                  <span className={`text-[8px] font-semibold block ${tc.status === 'Online' ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {tc.status}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col justify-between bg-slate-50/50">
        {/* Active Contact Header */}
        <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900 leading-tight">{chatTeacher}</h4>
            <span className="text-[9px] text-slate-400 font-medium block">Secure Communication Tunnel</span>
          </div>
        </div>

        {/* Message Logs */}
        <div className="flex-1 p-5 overflow-y-auto space-y-3.5">
          {chatMessages.map((msg, index) => {
            const isTeacher = msg.sender === 'teacher';
            
            return (
              <div key={index} className={`flex ${isTeacher ? 'justify-start' : 'justify-end'}`}>
                {isTeacher ? (
                  /* Received: Neutral White Bubble */
                  <div className="max-w-xs p-3 rounded-lg text-xs space-y-1 font-medium bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm">
                    <p className="leading-relaxed">{msg.text}</p>
                    <span className="text-[8px] text-slate-400 block text-right font-semibold mt-1 font-mono">{msg.time}</span>
                  </div>
                ) : (
                  /* Sent: Soft Accent Tint Bubble with Dark text */
                  <div 
                    className="max-w-xs p-3 rounded-lg text-xs space-y-1 font-medium rounded-tr-none border shadow-sm"
                    style={{ 
                      backgroundColor: primaryBrandColor + '10', 
                      borderColor: primaryBrandColor + '20', 
                      color: '#0f172a' 
                    }}
                  >
                    <p className="leading-relaxed">{msg.text}</p>
                    <span className="text-[8px] opacity-60 block text-right font-semibold mt-1 font-mono">{msg.time}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Messaging Form */}
        <form onSubmit={handleSendMessage} className="p-3.5 border-t border-slate-200 bg-white flex items-center gap-2">
          <input
            type="text"
            placeholder="Type your message..."
            value={newMsgText}
            onChange={e => setNewMsgText(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg bg-slate-50 border border-slate-250 text-xs text-slate-800 focus:outline-none focus:border-slate-500 focus:bg-white transition-all font-sans"
          />
          <button 
            type="submit" 
            className="p-2 text-white rounded-lg shadow-sm hover:opacity-95 active:scale-95 transition-all"
            style={{ backgroundColor: primaryBrandColor }}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentMessages;
