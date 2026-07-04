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
      <div className="bg-gradient-to-b from-blue-700 to-indigo-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md mb-6 shadow-lg border border-white/20">
            <ScrollText className="w-8 h-8 text-blue-100" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Terms of Service</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            These terms govern your use of the EduCore multi-tenant SaaS platform. Please read them carefully.
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
              <Handshake className="w-6 h-6 text-blue-500" />
              1. Acceptance of Terms
            </h2>
            <div className="text-slate-600 leading-relaxed text-sm md:text-base space-y-4">
              <p>
                By accessing, registering for, or using EduCore's software-as-a-service platform ("Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Service. If you are accepting these terms on behalf of an educational institution, you represent that you have the authority to bind that institution to these terms.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
              <FileText className="w-6 h-6 text-emerald-500" />
              2. License & Account Use
            </h2>
            <div className="text-slate-600 leading-relaxed text-sm md:text-base space-y-4">
              <p>
                We grant your institution a limited, non-exclusive, non-transferable license to access and use the Service in accordance with your chosen subscription plan.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>You are responsible for maintaining the confidentiality of all admin and user credentials.</li>
                <li>You agree not to reverse engineer, decompile, or attempt to extract the source code of the Service.</li>
                <li>You must not use the Service for any unlawful or unauthorized purpose.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-amber-500" />
              3. Service Availability & Subscriptions
            </h2>
            <div className="text-slate-600 leading-relaxed text-sm md:text-base space-y-4">
              <p>
                EduCore is a subscription-based service. Failure to pay applicable subscription fees may result in the suspension or termination of your tenant portal.
              </p>
              <p>
                While we strive for 99.9% uptime, the Service is provided on an "AS IS" and "AS AVAILABLE" basis. We do not warrant that the Service will be uninterrupted or error-free. We reserve the right to perform scheduled maintenance, which we will communicate in advance.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
              <Scale className="w-6 h-6 text-indigo-500" />
              4. Limitation of Liability
            </h2>
            <div className="text-slate-600 leading-relaxed text-sm md:text-base space-y-4">
              <p>
                In no event shall EduCore, its directors, employees, or partners be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
              </p>
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

export default TermsOfService;
