import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTenantTheme } from '../context/TenantThemeContext';
import {
  GraduationCap, Eye, EyeOff, ArrowRight, Shield,
  CheckCircle, Info, Mail, Lock, Sparkles
} from 'lucide-react';

const Login = () => {
  const { login, error: authError } = useAuth();
  const { tenant } = useTenantTheme();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [logoError, setLogoError] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please enter both your email and password.');
      return;
    }
    try {
      setLoading(true);
      const user = await login(email, password, tenant?.subdomain);
      if (user.role === 'super_admin') navigate('/super-admin');
      else navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const schoolName = tenant?.schoolName || 'EduCore ERP';

  return (
    <div className="min-h-screen flex font-sans antialiased bg-white">

      {/* ═══ LEFT PANEL — Branding ═══ */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] flex-col relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-violet-700">

        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-[-80px] right-[-80px] w-96 h-96 bg-white/5 rounded-full" />
          <div className="absolute bottom-[-100px] left-[-60px] w-80 h-80 bg-white/5 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-12">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
              {tenant?.logoUrl && !logoError ? (
                <img
                  src={tenant.logoUrl}
                  alt={schoolName}
                  className="w-8 h-8 rounded-lg object-cover"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <GraduationCap className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <span className="text-white font-black text-lg tracking-tight block leading-none">
                {tenant ? schoolName : <span>Edu<span className="text-blue-200">Core</span></span>}
              </span>
              {!tenant && <span className="text-blue-200 text-[10px] font-semibold uppercase tracking-widest">School ERP Platform</span>}
            </div>
          </div>

          {/* Central hero text */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 w-fit mb-6">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span className="text-white text-xs font-bold uppercase tracking-widest">Secure School Portal</span>
            </div>

            <h1 className="text-4xl xl:text-5xl font-black text-white leading-[1.1] tracking-tight mb-6">
              Welcome Back
              {tenant && <span className="block text-blue-200 text-2xl xl:text-3xl mt-2 font-bold">{schoolName}</span>}
            </h1>

            <p className="text-blue-100 text-base leading-relaxed max-w-md mb-10">
              Access your personalized dashboard — manage students, teachers, attendance, fees, assignments, and more from one place.
            </p>

            {/* Feature pills */}
            <div className="space-y-3">
              {[
                'Student attendance & performance tracking',
                'Online fee payments with instant receipts',
                'Homework, exams & results management',
                'Secure role-based access for all users',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-blue-100 text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom badge */}
          <div className="flex items-center gap-3 bg-white/10 border border-white/15 rounded-2xl p-4">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Shield className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-xs">Enterprise-Grade Security</p>
              <p className="text-blue-200 text-[11px] mt-0.5">JWT auth · HTTPS encrypted · Role-based access control</p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ RIGHT PANEL — Login Form ═══ */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-white relative overflow-hidden">

        {/* Subtle bg decoration for mobile */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/60 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-50/60 rounded-full blur-[80px] pointer-events-none" />

        <div className="w-full max-w-md relative z-10">

          {/* Mobile logo (only visible on small screens) */}
          <div className="lg:hidden flex items-center gap-2.5 mb-10 justify-center">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-md">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-[17px] font-black tracking-tight text-slate-900">
              Edu<span className="text-blue-600">Core</span>
            </span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Sign In</h2>
            <p className="text-slate-500 text-sm">
              Enter your credentials to access the <strong className="text-slate-700">{schoolName}</strong> portal.
            </p>
          </div>

          {/* Demo credentials info box */}
          <div className="mb-6 p-4 rounded-2xl bg-blue-50 border border-blue-100">
            <p className="text-blue-700 font-bold text-xs flex items-center gap-1.5 mb-2">
              <Info className="w-3.5 h-3.5" /> Demo Credentials
            </p>
            <ul className="space-y-1 text-xs text-slate-600">
              <li><span className="font-semibold text-slate-700">Super Admin:</span> admin@educore.app / Password123</li>
              <li><span className="font-semibold text-slate-700">School Admin:</span> admin@schoola.com / Password123</li>
              <li><span className="font-semibold text-slate-700">Teacher:</span> teacher@schoolb.com / Password123</li>
            </ul>
          </div>

          {/* Error alert */}
          {(error || authError) && (
            <div className="mb-5 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium flex items-start gap-2">
              <span className="text-rose-500 mt-0.5">⚠️</span>
              <span>{error || authError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  placeholder="you@school.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all shadow-sm disabled:opacity-60"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Password
                </label>
                <a
                  href="#"
                  onClick={e => e.preventDefault()}
                  className="text-xs text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-colors"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all shadow-sm disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-1 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  Sign In to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
              Protected by <strong className="text-slate-500 font-semibold">EduCore Security</strong> · All sessions are encrypted
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Login;
