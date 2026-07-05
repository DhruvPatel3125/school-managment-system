import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, CheckCircle, Clock, Search, MessageSquare, User, Calendar } from 'lucide-react';

const ContactInquiries = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get('http://localhost:5001/api/v1/contacts');
      setContacts(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch contact inquiries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden mt-8">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Contact Inquiries</h3>
            <p className="text-xs font-medium text-slate-500">Messages from landing page</p>
          </div>
        </div>
        <button onClick={fetchContacts} className="text-xs font-semibold text-slate-500 hover:text-indigo-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-200 bg-white hover:bg-indigo-50 transition-all flex items-center gap-2">
          Refresh
        </button>
      </div>

      <div className="p-0">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm font-medium animate-pulse">
            Loading inquiries...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-500 text-sm font-medium">
            {error}
          </div>
        ) : contacts.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mb-4">
              <Mail className="w-8 h-8" />
            </div>
            <h4 className="text-slate-800 font-bold mb-1">No Inquiries Yet</h4>
            <p className="text-slate-500 text-sm max-w-sm">When users fill out the contact form on the landing page, their messages will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-slate-500 w-[25%]">Sender</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-slate-500 w-[20%]">Date</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-slate-500 w-[45%]">Message</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-slate-500 w-[10%]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contacts.map((contact) => (
                  <tr key={contact._id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 align-top">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                          {contact.firstName.charAt(0)}{contact.lastName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{contact.firstName} {contact.lastName}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{contact.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="flex items-center gap-1.5 text-slate-600 text-xs">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(contact.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="text-slate-700 text-sm whitespace-pre-wrap bg-slate-50 p-3 rounded-xl border border-slate-100">
                        {contact.message}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      {contact.status === 'new' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-wider border border-amber-200/50">
                          <Clock className="w-3 h-3" /> New
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider border border-emerald-200/50">
                          <CheckCircle className="w-3 h-3" /> {contact.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactInquiries;
