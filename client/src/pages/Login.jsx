import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTenantTheme } from '../context/TenantThemeContext';
import {
  GraduationCap, Eye, EyeOff, ArrowRight, Shield,
  CheckCircle, Info, Mail, Lock
} from 'lucide-react';
import logo from '../assets/logo.svg';

/* ── Design tokens (same as landing page) ── */
const FontImport = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');
    :root {
      --navy: #0D1B2A;
      --navy-800: #152236;
      --terra: #C4613A;
      --terra-light: #E8957A;
      --cream: #F8F5F1;
      --cream-dark: #EDE8E1;
      --stone: #8B8278;
      --ink: #2C2C2C;
    }
    .login-ledger-bg {
      background-image: repeating-linear-gradient(
        180deg,
        transparent, transparent 47px,
        rgba(255,255,255,0.04) 47px, rgba(255,255,255,0.04) 48px
      );
    }
    .login-dot-grid {
      background-image: radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px);
      background-size: 28px 28px;
    }
    .form-input {
      width: 100%;
      padding: 0.75rem 1rem 0.75rem 2.75rem;
      border-radius: 0.5rem;
      border: 1.5px solid rgba(13,27,42,0.14);
      background: #fff;
      color: var(--ink);
      font-family: 'DM Sans', sans-serif;
      font-size: 0.875rem;
      outline: none;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }
    .form-input:focus {
      border-color: var(--navy);
      box-shadow: 0 0 0 3px rgba(13,27,42,0.07);
    }
    .form-input:disabled { opacity: 0.6; }
    .form-input::placeholder { color: var(--stone); }
    button, a { outline: none; }
    html { scroll-behavior: smooth; }
  `}</style>
);

const Login = () => {
  const { login, error: authError } = useAuth();
  const { tenant } = useTenantTheme();

  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [logoError, setLogoError] = useState(false);
  const [showPass, setShowPass]   = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from     = location.state?.from?.pathname || '/';

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

  const schoolName = tenant?.schoolName || 'EduCore';

  /* ── Tenant primary colour for branded left panel ── */
  const brandColor = tenant?.primaryColor || 'var(--navy)';

  return (
    <div
      className="min-h-screen flex antialiased"
      style={{ fontFamily: 'DM Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}
    >
      <FontImport />

      {/* ═══ LEFT PANEL — Branding ═══ */}
      <div
        className="hidden lg:flex lg:w-[52%] xl:w-[55%] flex-col relative overflow-hidden login-ledger-bg"
        style={{ background: tenant?.primaryColor || 'var(--navy)' }}
      >
        {/* Dot grid overlay */}
        <div className="absolute inset-0 login-dot-grid pointer-events-none" />

        {/* Subtle diagonal highlight */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 60%)',
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-12 xl:p-16">

          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            {tenant?.logoUrl && !logoError ? (
              <>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ background: 'rgba(255,255,255,0.15)' }}
                >
                  <img
                    src={tenant.logoUrl}
                    alt={schoolName}
                    className="w-8 h-8 rounded-lg object-cover"
                    onError={() => setLogoError(true)}
                  />
                </div>
                <span
                  className="font-semibold text-lg text-white leading-none"
                  style={{ fontFamily: 'DM Sans, sans-serif' }}
                >
                  {schoolName}
                </span>
              </>
            ) : (
              <img src={logo} alt="EduCore" className="h-9" style={{ filter: 'brightness(10)', opacity: 0.9 }} />
            )}
          </div>

          {/* Central content */}
          <div className="flex-1 flex flex-col justify-center max-w-md">

            {/* Section label */}
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px w-8 flex-shrink-0" style={{ background: 'var(--terra-light)' }} />
              <span
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: 'var(--terra-light)', fontFamily: 'DM Sans, sans-serif' }}
              >
                {tenant ? 'School Portal' : 'Platform Access'}
              </span>
            </div>

            <h1
              className="leading-[1.1] tracking-tight mb-5 text-white"
              style={{
                fontFamily: 'Instrument Serif, Georgia, serif',
                fontSize: 'clamp(2.2rem, 3.5vw, 3.2rem)',
              }}
            >
              Welcome back{tenant && (
                <>.<br />
                  <em className="not-italic" style={{ color: 'rgba(255,255,255,0.65)', fontSize: '70%' }}>
                    {schoolName}
                  </em>
                </>
              )}
            </h1>

            <p
              className="text-base leading-relaxed mb-10"
              style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'DM Sans, sans-serif' }}
            >
              Access your personalized dashboard — manage students, attendance, fees, homework, and more from one place.
            </p>

            {/* Feature list */}
            <div className="space-y-4">
              {[
                'Student attendance & performance tracking',
                'Online fee payments with instant receipts',
                'Homework, exams & results management',
                'Secure role-based access for all users',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div
                    className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(196,97,58,0.3)' }}
                  >
                    <CheckCircle className="w-3 h-3" style={{ color: 'var(--terra-light)' }} />
                  </div>
                  <span
                    className="text-sm"
                    style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'DM Sans, sans-serif' }}
                  >
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom security badge */}
          <div
            className="flex items-center gap-3 p-4 rounded-xl"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.1)' }}
            >
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-xs" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                Enterprise-Grade Security
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'DM Sans, sans-serif' }}>
                JWT auth · HTTPS encrypted · Role-based access control
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ RIGHT PANEL — Form ═══ */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden"
        style={{ background: 'var(--cream)' }}
      >
        {/* Ledger-rule background motif */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(180deg, transparent, transparent 47px, rgba(13,27,42,0.04) 47px, rgba(13,27,42,0.04) 48px)',
          }}
        />
        {/* Dot grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(13,27,42,0.06) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            opacity: 0.4,
          }}
        />

        <div className="w-full max-w-md relative z-10">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-10 justify-center">
            <img src={logo} alt="EduCore" className="h-8" />
          </div>

          {/* Back to home */}
          <div className="mb-8">
            <a
              href="/"
              className="inline-flex items-center gap-2 text-xs font-medium transition-colors"
              style={{ color: 'var(--stone)', fontFamily: 'DM Sans, sans-serif' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--navy)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--stone)'}
            >
              ← Back to EduCore.app
            </a>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2
              className="tracking-tight mb-2"
              style={{
                fontFamily: 'Instrument Serif, Georgia, serif',
                fontSize: 'clamp(1.8rem, 3vw, 2.4rem)',
                color: 'var(--navy)',
                lineHeight: 1.15,
              }}
            >
              Sign in to your portal.
            </h2>
            <p className="text-sm" style={{ color: 'var(--stone)', fontFamily: 'DM Sans, sans-serif' }}>
              Accessing <strong style={{ color: 'var(--navy)', fontWeight: 600 }}>{schoolName}</strong>
            </p>
          </div>

          {/* Demo credentials info */}
          <div
            className="mb-6 p-4 rounded-xl"
            style={{
              background: 'rgba(13,27,42,0.04)',
              border: '1px solid rgba(13,27,42,0.1)',
            }}
          >
            <p
              className="font-semibold text-xs flex items-center gap-1.5 mb-2"
              style={{ color: 'var(--navy)', fontFamily: 'DM Sans, sans-serif' }}
            >
              <Info className="w-3.5 h-3.5" style={{ color: 'var(--terra)' }} />
              Demo Credentials
            </p>
            <ul className="space-y-1 text-xs" style={{ color: '#5C5650', fontFamily: 'DM Sans, sans-serif' }}>
              <li><span className="font-semibold" style={{ color: 'var(--navy)' }}>Super Admin:</span> admin@educore.app / Password123</li>
              <li><span className="font-semibold" style={{ color: 'var(--navy)' }}>School Admin:</span> admin@schoola.com / Password123</li>
              <li><span className="font-semibold" style={{ color: 'var(--navy)' }}>Teacher:</span> teacher@schoolb.com / Password123</li>
            </ul>
          </div>

          {/* Error alert */}
          {(error || authError) && (
            <div
              className="mb-5 p-4 rounded-xl flex items-start gap-3 text-sm"
              style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#dc2626' }}
            >
              <span className="flex-shrink-0 mt-0.5">⚠</span>
              <span style={{ fontFamily: 'DM Sans, sans-serif' }}>{error || authError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: 'var(--stone)', fontFamily: 'DM Sans, sans-serif' }}
              >
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: 'var(--stone)' }}
                />
                <input
                  type="email"
                  placeholder="you@school.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={loading}
                  className="form-input"
                  style={{ paddingLeft: '2.75rem' }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label
                  className="block text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--stone)', fontFamily: 'DM Sans, sans-serif' }}
                >
                  Password
                </label>
                <a
                  href="#"
                  onClick={e => e.preventDefault()}
                  className="text-xs font-medium transition-colors"
                  style={{ color: 'var(--terra)', fontFamily: 'DM Sans, sans-serif' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#B5542F'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--terra)'}
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: 'var(--stone)' }}
                />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={loading}
                  className="form-input"
                  style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--stone)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--navy)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--stone)'}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-1 rounded-lg font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: 'var(--navy)', fontFamily: 'DM Sans, sans-serif' }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = '#152236'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--navy)'; e.currentTarget.style.transform = 'translateY(0)'; }}
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
          <div
            className="mt-8 pt-6 text-center"
            style={{ borderTop: '1px solid rgba(13,27,42,0.08)' }}
          >
            <p className="text-xs" style={{ color: 'var(--stone)', fontFamily: 'DM Sans, sans-serif' }}>
              Protected by{' '}
              <strong style={{ color: 'var(--navy)', fontWeight: 600 }}>EduCore Security</strong>
              {' '}· All sessions are encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
        
export default Login;
