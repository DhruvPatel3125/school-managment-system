import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTenantTheme } from '../context/TenantThemeContext';
import { School, Info } from 'lucide-react';

const Login = () => {
  const { login, error: authError } = useAuth();
  const { tenant } = useTenantTheme();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [logoError, setLogoError] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Redirect path after successful login
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please enter both your email and password.');
      return;
    }

    try {
      setLoading(true);
      // Pass tenant subdomain to backend to enforce correct portal scope
      const user = await login(email, password, tenant?.subdomain);
      
      // If super_admin, redirect to super-admin dashboard instead
      if (user.role === 'super_admin') {
        navigate('/super-admin');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Login credentials failed. Verify details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative p-4 bg-slate-950 overflow-hidden font-sans">
      {/* Dynamic ambient color glow circles */}
      <div 
        className="absolute w-[400px] h-[400px] rounded-full filter blur-[120px] opacity-25 -top-10 -left-10 transition-all duration-1000"
        style={{ backgroundColor: tenant?.primaryColor || '#1e3a8a' }}
      ></div>
      <div 
        className="absolute w-[450px] h-[450px] rounded-full filter blur-[130px] opacity-25 -bottom-20 -right-20 transition-all duration-1000"
        style={{ backgroundColor: tenant?.secondaryColor || '#d97706' }}
      ></div>

      {/* Main Container glassmorphic card */}
      <div className="w-full max-w-md glass-card rounded-2xl p-8 border border-white/10 shadow-2xl relative z-10">
        <div className="flex flex-col items-center text-center space-y-4 mb-6">
          {tenant?.logoUrl && !logoError ? (
            <img 
              src={tenant.logoUrl} 
              alt={`${tenant.schoolName} logo`} 
              className="w-16 h-16 rounded-full border-2 border-primary object-cover shadow-md"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary border-2 border-primary/20 flex items-center justify-center shadow-md">
              <School className="w-8 h-8 text-primary" />
            </div>
          )}

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Sign In to Portal
            </h2>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">
              {tenant?.schoolName || 'EduCore ERP'}
            </p>
          </div>
        </div>

        {/* Info alerts */}
        <div className="bg-slate-900/60 border border-slate-750 p-3 rounded-xl mb-5 text-xs text-slate-300">
          <p className="font-semibold text-primary mb-1.5 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            Demo Accounts Credentials:
          </p>
          <ul className="list-disc pl-4 space-y-1 text-slate-400">
            <li><strong>Super Admin (Global):</strong> <code>admin@educore.app</code> / Password123</li>
            <li><strong>DPS Admin (School A):</strong> <code>admin@schoola.com</code> / Password123</li>
            <li><strong>St. Mary Teacher (School B):</strong> <code>teacher@schoolb.com</code> / Password123</li>
          </ul>
        </div>

        {/* Error notifications */}
        {(error || authError) && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs font-medium mb-5">
            ⚠️ {error || authError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input 
              type="email"
              placeholder="e.g. admin@schoola.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-700/80 bg-slate-900/50 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Password
              </label>
              <a href="#" className="text-xs text-secondary font-medium hover:underline" onClick={(e) => e.preventDefault()}>
                Forgot password?
              </a>
            </div>
            <input 
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-700/80 bg-slate-900/50 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 rounded-lg bg-primary hover:opacity-90 active:scale-[0.99] text-white font-semibold text-sm transition-all shadow-lg flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <span>Sign In to Dashboard</span>
            )}
          </button>
        </form>

        <div className="mt-6 border-t border-slate-800 pt-4 text-center">
          <p className="text-xs text-slate-500">
            Powered by <strong className="text-slate-400 font-medium">EduCore ERP Platform</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
