import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const SuperAdminDashboard = () => {
  const { logout, user } = useAuth();
  
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Onboarding Modal Form States
  const [showModal, setShowModal] = useState(false);
  const [schoolName, setSchoolName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#4f46e5'); // default Indigo
  const [secondaryColor, setSecondaryColor] = useState('#06b6d4'); // default Cyan
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  // Fetch tenants
  const fetchTenants = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get('http://localhost:5001/api/v1/tenants');
      setTenants(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch tenants directory list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleOnboard = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');
    setSubmitLoading(true);

    try {
      const payload = {
        schoolName,
        subdomain,
        logoUrl,
        primaryColor,
        secondaryColor,
        adminName,
        adminEmail,
        adminPassword
      };

      await axios.post('http://localhost:5001/api/v1/superadmin/tenants', payload);
      
      setSubmitSuccess(`Successfully onboarded school '${schoolName}'!`);
      
      // Reset form fields
      setSchoolName('');
      setSubdomain('');
      setLogoUrl('');
      setPrimaryColor('#4f46e5');
      setSecondaryColor('#06b6d4');
      setAdminName('');
      setAdminEmail('');
      setAdminPassword('');

      // Refresh list
      fetchTenants();

      // Close modal after delay
      setTimeout(() => {
        setShowModal(false);
        setSubmitSuccess('');
      }, 2000);
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Onboarding request failed.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 h-16 flex items-center justify-between px-6 shadow-md">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🛡️</span>
          <div>
            <h1 className="text-md font-bold tracking-tight leading-none text-white">EduCore SuperAdmin</h1>
            <span className="text-xs text-slate-500 font-medium">Platform Management Control Panel</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-xs text-slate-400">Welcome, <strong>{user?.name}</strong></span>
          <button 
            onClick={logout}
            className="px-3 py-1.5 text-xs font-semibold text-rose-400 bg-rose-950/20 hover:bg-rose-950/50 border border-rose-500/20 rounded-lg active:scale-95 transition-all"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-indigo-900/60 to-purple-900/60 border border-indigo-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">Onboard New School Tenants</h2>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Register new educational institutes in the multi-tenant SaaS schema. Each school immediately gets isolated database records and dynamic custom CSS theme configurations.
            </p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 font-semibold text-sm rounded-lg shadow-lg shadow-indigo-600/20 transition-all flex items-center"
          >
            <span className="mr-2 text-lg leading-none">+</span> Onboard School
          </button>
        </div>

        {/* Global Statistics */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Registered Tenants</p>
            <p className="text-3xl font-extrabold mt-1">{tenants.length}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">System Node Status</p>
            <p className="text-3xl font-extrabold mt-1 text-emerald-400">ONLINE</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Database Dialect</p>
            <p className="text-3xl font-extrabold mt-1 text-indigo-400">SQLITE</p>
          </div>
        </section>

        {/* Tenants List */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg">
          <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-lg font-bold">School Registry ({tenants.length})</h3>
            <button onClick={fetchTenants} className="text-xs text-indigo-400 hover:underline">Refresh List</button>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-2 border-slate-700 border-t-indigo-500 rounded-full animate-spin"></div>
              <p className="text-xs text-slate-500">Loading directory...</p>
            </div>
          ) : error ? (
            <div className="py-8 text-center text-xs text-rose-400">{error}</div>
          ) : tenants.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">No schools are onboarded yet. Click "Onboard School" to begin.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-850 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="px-6 py-4">School Profile</th>
                    <th className="px-6 py-4">Subdomain</th>
                    <th className="px-6 py-4">Colors</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {tenants.map((school) => (
                    <tr key={school._id || school.id} className="hover:bg-slate-800/20 transition-all">
                      <td className="px-6 py-4 flex items-center space-x-3">
                        <img 
                          src={school.logoUrl || "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=200&h=200&fit=crop"} 
                          alt="" 
                          className="w-10 h-10 rounded-full border border-slate-700 object-cover bg-slate-950" 
                        />
                        <span className="font-bold text-slate-200">{school.schoolName}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        <a 
                          href={`${window.location.protocol}//${school.subdomain}.${window.location.hostname}:${window.location.port}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-indigo-400 hover:underline"
                        >
                          {school.subdomain}.localhost
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1.5">
                          <span className="w-4 h-4 rounded-full border border-slate-700 shadow-inner" style={{ backgroundColor: school.primaryColor }}></span>
                          <span className="w-4 h-4 rounded-full border border-slate-700 shadow-inner" style={{ backgroundColor: school.secondaryColor }}></span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-900/30 text-emerald-400 border border-emerald-500/20">
                          {school.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => window.open(`${window.location.protocol}//${window.location.hostname}:${window.location.port}/?tenant=${school.subdomain}`, "_blank")}
                          className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                        >
                          Launch Portal
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* Onboarding Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 my-8">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold">Onboard New School Tenant</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white text-lg">×</button>
            </div>

            {submitError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs font-medium">
                ⚠️ {submitError}
              </div>
            )}
            
            {submitSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-medium">
                ✅ {submitSuccess}
              </div>
            )}

            <form onSubmit={handleOnboard} className="space-y-4">
              
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider border-b border-slate-800/60 pb-1">1. School Profile Details</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">School Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Greenwood High"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-white placeholder-slate-600 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Subdomain Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. greenwood"
                      value={subdomain}
                      onChange={(e) => setSubdomain(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-white placeholder-slate-600 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Logo URL (Optional)</label>
                  <input 
                    type="url" 
                    placeholder="https://example.com/logo.png"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-white placeholder-slate-600 text-xs focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Primary Color (Hex)</label>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="color" 
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                      />
                      <input 
                        type="text" 
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Secondary Color (Hex)</label>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="color" 
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                      />
                      <input 
                        type="text" 
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider border-b border-slate-800/60 pb-1">2. Default School Admin Account</h4>
                
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Admin Full Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Principal Jane"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-white placeholder-slate-600 text-xs focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Admin Email Address</label>
                    <input 
                      type="email" 
                      placeholder="admin@greenwood.com"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-white placeholder-slate-600 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Admin Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-white placeholder-slate-600 text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4 border-t border-slate-800">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg transition-all shadow-md flex items-center justify-center"
                >
                  {submitLoading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <span>Onboard & Create School</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
