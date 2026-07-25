import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft, AlertCircle, Handshake, ScrollText, Scale } from 'lucide-react';
import logo from '../assets/logo.svg';

const TermsOfService = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased">
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
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
            <ScrollText className="w-5 h-5 text-slate-200" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Terms of Service</h1>
            <p className="text-slate-400 text-xs md:text-sm max-w-xl">
              These terms govern your use of the EduCore multi-tenant SaaS platform. Please read them carefully.
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
              <Handshake className="w-4 h-4 text-slate-555" />
              <span>1. Acceptance of Terms</span>
            </h2>
            <div className="text-slate-650 text-xs md:text-sm leading-relaxed space-y-3">
              <p>
                By accessing, registering for, or using EduCore's software-as-a-service platform ("Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Service. If you are accepting these terms on behalf of an educational institution, you represent that you have the authority to bind that institution to these terms.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-150 pb-2">
              <FileText className="w-4 h-4 text-slate-555" />
              <span>2. License & Account Use</span>
            </h2>
            <div className="text-slate-650 text-xs md:text-sm leading-relaxed space-y-3">
              <p>
                We grant your institution a limited, non-exclusive, non-transferable license to access and use the Service in accordance with your chosen subscription plan.
              </p>
              <ul className="space-y-1.5 list-disc pl-5">
                <li>You are responsible for maintaining the confidentiality of all admin and user credentials.</li>
                <li>You agree not to reverse engineer, decompile, or attempt to extract the source code of the Service.</li>
                <li>You must not use the Service for any unlawful or unauthorized purpose.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-150 pb-2">
              <AlertCircle className="w-4 h-4 text-slate-555" />
              <span>3. Availability & Subscriptions</span>
            </h2>
            <div className="text-slate-650 text-xs md:text-sm leading-relaxed space-y-3">
              <p>
                EduCore is a subscription-based service. Failure to pay subscription invoices in a timely manner may result in the suspension or termination of your tenant portal.
              </p>
              <p>
                While we strive for 99.9% uptime, the Service is provided on an "AS IS" and "AS AVAILABLE" basis. We reserve the right to perform scheduled maintenance, which we will communicate in advance.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-150 pb-2">
              <Scale className="w-4 h-4 text-slate-555" />
              <span>4. Limitation of Liability</span>
            </h2>
            <div className="text-slate-650 text-xs md:text-sm leading-relaxed space-y-3">
              <p>
                To the maximum extent permitted by law, EduCore shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of the Service.
              </p>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
};

export default TermsOfService;
