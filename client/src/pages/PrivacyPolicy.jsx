import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, ShieldCheck, Database, Lock, Eye, CheckCircle2 } from 'lucide-react';
import logo from '../assets/logo.svg';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased">
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className=" mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => navigate('/')}>
            <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <img src={logo} alt="EduCore Logo" className="h-6" />
          </div>
          <button
            onClick={() => navigate('/login')}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm"
          >
            Go to Portal
          </button>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="bg-[#0F172A] text-white py-12 border-b border-slate-800">
        <div className="max-w-3xl mx-auto px-6 text-left space-y-4">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 border border-white/10 shadow-sm">
            <Shield className="w-5 h-5 text-slate-200" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Privacy Policy</h1>
            <p className="text-slate-400 text-xs md:text-sm max-w-xl">
              Your data privacy and security are our highest priority. Learn how we collect, use, and protect your information at EduCore.
            </p>
          </div>
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            Last Updated: July 14, 2026
          </div>
        </div>
      </div>

      {/* Content Section */}
      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-10 space-y-10 shadow-sm text-left">

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-150 pb-2">
              <Database className="w-4 h-4 text-slate-555" />
              <span>1. Information We Collect</span>
            </h2>
            <div className="space-y-3 text-slate-650 text-xs md:text-sm leading-relaxed">
              <p>When you use the EduCore ERP platform, we may collect the following types of information:</p>
              <ul className="space-y-2.5 pl-1">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Account Information:</strong> Name, email address, phone number, and school details when registering for a tenant account.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Educational Data:</strong> Student records, attendance logs, evaluation grades, and fee billing statements uploaded by your institution.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Usage Data:</strong> IP addresses, device types, and system logs to diagnose issues and optimize platform performance.</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-150 pb-2">
              <Eye className="w-4 h-4 text-slate-555" />
              <span>2. How We Process Data</span>
            </h2>
            <div className="space-y-3 text-slate-650 text-xs md:text-sm leading-relaxed">
              <p>EduCore acts strictly as a data processor for the educational institutions (the data controllers). We process your data exclusively to:</p>
              <ul className="space-y-1.5 list-disc pl-5">
                <li>Maintain, secure, and deliver the school management portal features.</li>
                <li>Process secure fee payment transactions and generate payment receipts.</li>
                <li>Send administrative updates (e.g., fee reminders, exam schedules).</li>
                <li>Enforce security verification protocols and prevent unauthorized access.</li>
              </ul>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-slate-800 font-semibold text-xs mt-4">
                We do not sell, rent, or monetize your personal or student records to third parties under any circumstances.
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-150 pb-2">
              <Lock className="w-4 h-4 text-slate-555" />
              <span>3. Data Security & Storage</span>
            </h2>
            <div className="text-slate-650 text-xs md:text-sm leading-relaxed space-y-3">
              <p>
                We implement enterprise-grade security measures to protect your database transactions. All traffic is encrypted using industry-standard TLS/SSL. Database systems enforce strict tenant isolation, ensuring school databases remain isolated and cannot be accessed by external tenants.
              </p>
              <p>
                Routine backups are encrypted and saved to secure data centers to prevent data loss.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-150 pb-2">
              <ShieldCheck className="w-4 h-4 text-slate-555" />
              <span>4. Your Rights</span>
            </h2>
            <div className="text-slate-650 text-xs md:text-sm leading-relaxed">
              <p>
                Depending on your jurisdiction, you may have rights to access, update, or erase personal data. Since EduCore processes data on behalf of schools, students and parents should route data access requests through their respective school administration office.
              </p>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
