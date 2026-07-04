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
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/')}>
            <button className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <img src={logo} alt="EduCore Logo" className="h-8" />
          </div>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm"
          >
            Go to Portal
          </button>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-b from-blue-600 to-violet-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md mb-6 shadow-lg border border-white/20">
            <Shield className="w-8 h-8 text-blue-100" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Your data privacy and security are our highest priority. Learn how we collect, use, and protect your information at EduCore.
          </p>
          <div className="mt-8 text-sm text-blue-200/80 font-medium tracking-wide uppercase">
            Last Updated: July 4, 2026
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-12 space-y-12">
          
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
              <Database className="w-6 h-6 text-blue-500" />
              1. Information We Collect
            </h2>
            <div className="space-y-4 text-slate-600 leading-relaxed text-sm md:text-base">
              <p>When you use the EduCore ERP platform, we may collect the following types of information:</p>
              <ul className="space-y-3 ml-2">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span><strong>Account Information:</strong> Name, email address, phone number, and school details when registering for a tenant account.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span><strong>Educational Data:</strong> Student records, attendance, grades, and fee payment history inputted by your institution.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span><strong>Usage Data:</strong> IP addresses, browser types, and interaction metrics to help us improve system performance and security.</span>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
              <Eye className="w-6 h-6 text-violet-500" />
              2. How We Use Your Data
            </h2>
            <div className="text-slate-600 leading-relaxed text-sm md:text-base space-y-4">
              <p>EduCore acts strictly as a data processor for the educational institutions (the data controllers). We use your data exclusively to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide, maintain, and improve the school management platform.</li>
                <li>Process secure fee transactions and generate receipts.</li>
                <li>Send essential administrative notifications (e.g., fee reminders, exam schedules).</li>
                <li>Prevent fraudulent activity and enforce our strict security protocols.</li>
              </ul>
              <p className="font-semibold text-slate-800 bg-slate-50 p-4 rounded-xl border border-slate-100">
                We do not sell, rent, or monetize your personal or student data to third parties under any circumstances.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
              <Lock className="w-6 h-6 text-amber-500" />
              3. Data Security & Storage
            </h2>
            <div className="text-slate-600 leading-relaxed text-sm md:text-base space-y-4">
              <p>
                We implement enterprise-grade security measures to protect your data. All traffic is encrypted using industry-standard TLS/SSL. Passwords are securely hashed using bcrypt. Our database architecture ensures strict tenant isolation—meaning data from one school can never be accessed by another.
              </p>
              <p>
                Data is stored in secure, certified data centers with routine encrypted backups to prevent data loss.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-rose-500" />
              4. Your Rights
            </h2>
            <div className="text-slate-600 leading-relaxed text-sm md:text-base space-y-4">
              <p>Depending on your region, you may have the right to access, correct, or request the deletion of your personal data. Because EduCore processes data on behalf of schools, students and parents should direct these requests to their school administration first.</p>
            </div>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 py-8 text-center text-slate-400 text-sm border-t border-slate-800">
        <p>© {new Date().getFullYear()} EduCore Multi-Tenant ERP. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
