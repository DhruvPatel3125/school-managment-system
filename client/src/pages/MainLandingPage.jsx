import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  School, 
  Shield, 
  ArrowRight, 
  Layers, 
  Sparkles, 
  CheckCircle,
  Database,
  ExternalLink,
  Laptop
} from 'lucide-react';

const MainLandingPage = () => {
  const navigate = useNavigate();
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/v1/tenants');
        setSchools(res.data.data || []);
      } catch (err) {
        console.error('Failed to load registered schools:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchools();
  }, []);

  const launchTenant = (subdomain) => {
    // Redirect to subdomain domain on localhost
    const protocol = window.location.protocol;
    const hostname = window.location.hostname; // e.g. localhost
    const port = window.location.port; // e.g. 5173
    
    // Construct http://subdomain.localhost:5173
    window.open(`${protocol}//${subdomain}.${hostname}:${port}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-x-hidden relative selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Background radial highlights */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[150px] pointer-events-none z-0"></div>

      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900/60 backdrop-blur-md border-b border-slate-800/80 h-16 flex items-center justify-between px-6 md:px-12 shadow-md relative z-10">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
            <Layers className="w-5 h-5 text-indigo-400" />
          </div>
          <span className="text-md font-extrabold tracking-tight text-white uppercase">EduCore SaaS ERP</span>
        </div>
        <button 
          onClick={() => navigate('/super-admin')}
          className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-lg shadow-lg shadow-indigo-600/10 border border-indigo-550/20 transition-all flex items-center gap-1.5"
        >
          <Shield className="w-3.5 h-3.5" /> SuperAdmin Login
        </button>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pt-16 pb-12 text-center space-y-6 relative z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/40 border border-indigo-500/20 text-xs text-indigo-300 font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> Enterprise Multi-Tenant Platform
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black tracking-tight max-w-4xl mx-auto leading-tight">
          Next-Generation Administration <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">For Modern Schools</span>
        </h1>
        
        <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
          EduCore is a cloud-based SaaS database platform. School owners can instantly spin up isolated web portals, custom color brandings, and student directory limiters under dedicated domains.
        </p>

        <div className="pt-4 flex justify-center gap-4">
          <a 
            href="#registry" 
            className="px-5 py-3 bg-slate-900 border border-slate-800 text-slate-200 hover:text-white hover:bg-slate-800 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            Launch Active Portals <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </section>

      {/* Redirection / Active Portals List */}
      <section id="registry" className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-6 relative z-10">
        <div className="border-b border-slate-850 pb-3">
          <h2 className="text-xl font-extrabold tracking-tight">Active Registered School Portals</h2>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-0.5">Click to launch any school's dedicated tenant site</p>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-2">
            <div className="w-8 h-8 border-2 border-indigo-650 border-t-white rounded-full animate-spin"></div>
            <p className="text-slate-500 text-xs">Querying school directory...</p>
          </div>
        ) : schools.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-slate-900/20 border border-slate-900 rounded-xl">
            No school portals have been onboarded yet. Follow the guide below to spin one up!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {schools.map(school => (
              <div 
                key={school._id || school.id}
                className="bg-slate-900/40 backdrop-blur-md border border-slate-850 hover:border-slate-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4 hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex items-center space-x-3.5">
                  <img 
                    src={school.logoUrl || "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=150&h=150&fit=crop"} 
                    alt="" 
                    className="w-12 h-12 rounded-xl object-cover border border-slate-800 bg-slate-950 shadow-inner"
                    onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=150&h=150&fit=crop"; }}
                  />
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-200">{school.schoolName}</h3>
                    <span className="text-[9px] font-bold text-indigo-400 bg-indigo-950/40 border border-indigo-900/40 px-1.5 py-0.5 rounded tracking-wide uppercase mt-1 block w-fit">
                      {school.plan || 'Free Trial'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-450 border-t border-slate-900 pt-3.5">
                  <span className="font-semibold text-slate-500">Domain: <strong className="text-slate-350">{school.subdomain}.localhost</strong></span>
                  <div className="flex items-center space-x-1">
                    <span className="w-3 h-3 rounded-full border border-slate-800" style={{ backgroundColor: school.primaryColor }}></span>
                    <span className="w-3 h-3 rounded-full border border-slate-800" style={{ backgroundColor: school.secondaryColor }}></span>
                  </div>
                </div>

                <button 
                  onClick={() => launchTenant(school.subdomain)}
                  className="w-full py-2.5 bg-indigo-650/10 hover:bg-indigo-650 hover:text-white border border-indigo-500/20 text-indigo-400 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  Launch Portal Website <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Guidance Section: How to create website */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-12 relative z-10">
        <div className="bg-slate-900/20 backdrop-blur-md border border-slate-900/80 rounded-3xl p-6 md:p-8 space-y-8 shadow-2xl">
          
          <div className="border-b border-slate-850 pb-4">
            <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Laptop className="w-6 h-6 text-indigo-400" /> Platform Onboarding & Configuration Guide
            </h2>
            <p className="text-slate-400 text-sm mt-1">Follow these simple steps to spin up and customize a brand new school website instantly.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-550/15 border border-indigo-500/20 text-indigo-400 font-black text-sm flex items-center justify-center">1</div>
              <h4 className="font-extrabold text-sm text-slate-200">Open Admin Panel</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Click on the <strong>"SuperAdmin Login"</strong> button in the navbar above and log in using platform supervisor credentials:
              </p>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-900 font-mono text-[9px] text-slate-500 space-y-0.5">
                <div>Email: <strong className="text-slate-350">admin@educore.app</strong></div>
                <div>Pass: <strong className="text-slate-350">Password123</strong></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-550/15 border border-indigo-500/20 text-indigo-400 font-black text-sm flex items-center justify-center">2</div>
              <h4 className="font-extrabold text-sm text-slate-200">Spin Up Onboarding Form</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Click the **"Onboard School"** button in the dashboard page to launch the configurations stepped setup wizard.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-550/15 border border-indigo-500/20 text-indigo-400 font-black text-sm flex items-center justify-center">3</div>
              <h4 className="font-extrabold text-sm text-slate-200">Configure Identity & Brand</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Fill out step 1 (school name, subdomain, logo upload, brand colors) and step 2 (subscription plan card selection & limits cap), then step 3 (admin login credentials) and submit!
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-550/15 border border-indigo-500/20 text-indigo-400 font-black text-sm flex items-center justify-center">4</div>
              <h4 className="font-extrabold text-sm text-slate-200">Launch Portal Website</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                The school website is immediately generated! You can launch it from the school registry on this landing page or click the link in the SuperAdmin table.
              </p>
            </div>

          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-900/60 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3 text-xs">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse shrink-0"></div>
              <p className="text-slate-400 font-medium">Ready to test? Open the Super Admin panel to spin up a custom portal.</p>
            </div>
            <button 
              onClick={() => navigate('/super-admin')}
              className="px-4 py-2 bg-indigo-650 hover:bg-indigo-600 text-white font-bold text-xs rounded-xl shadow transition-all active:scale-95 shrink-0"
            >
              Open Super Admin Dashboard
            </button>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-[10px] text-slate-600 font-bold uppercase tracking-wider relative z-10">
        © 2026 EduCore Multi-Tenant ERP Platform. All rights reserved.
      </footer>
    </div>
  );
};

export default MainLandingPage;
