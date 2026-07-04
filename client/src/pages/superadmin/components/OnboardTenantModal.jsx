import React, { useState } from 'react';
import axios from 'axios';
import { School, ChevronRight, ChevronLeft, Loader2, AlertTriangle, Upload, LayoutGrid } from 'lucide-react';

const plansConfig = [
  { id: 'starter', name: 'Starter', limit: 200, price: '₹1,999/mo', desc: 'Perfect for small schools just getting started.' },
  { id: 'professional', name: 'Professional', limit: 1000, price: '₹4,499/mo', desc: 'The complete package for growing institutions.' },
  { id: 'enterprise', name: 'Enterprise', limit: 10000, price: 'Custom', desc: 'For large institutions & school chains.' }
];

const OnboardTenantModal = ({ onClose, onSuccess }) => {
  const [modalStep, setModalStep] = useState(1);
  const [schoolName, setSchoolName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#4f46e5');
  const [secondaryColor, setSecondaryColor] = useState('#06b6d4');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [plan, setPlan] = useState('starter');
  const [maxStudents, setMaxStudents] = useState(200);

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const handlePlanChange = (selectedPlan) => {
    let limit = 200;
    if (selectedPlan === 'professional') limit = 1000;
    if (selectedPlan === 'enterprise') limit = 10000;
    
    setPlan(selectedPlan);
    setMaxStudents(limit);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingLogo(true);
    setSubmitError('');
    setSubmitSuccess('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('http://localhost:5001/api/v1/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setLogoUrl(res.data.url);
      setSubmitSuccess('School logo uploaded successfully!');
      setTimeout(() => setSubmitSuccess(''), 2500);
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Failed to upload logo.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleOnboard = async (e) => {
    e.preventDefault();
    if (modalStep < 3) {
      setModalStep(prev => prev + 1);
      return;
    }

    setSubmitError('');
    setSubmitSuccess('');
    setSubmitLoading(true);

    try {
      if (plan === 'enterprise') {
        setSubmitError('Enterprise plans require custom setup. Please contact sales.');
        setSubmitLoading(false);
        return;
      }

      const orderRes = await axios.post('http://localhost:5001/api/v1/payments/create-razorpay-order', { plan }, {
        withCredentials: true
      });
      
      const { order_id, amount, currency } = orderRes.data.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        amount: amount,
        currency: currency,
        name: "EduCore ERP",
        description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Subscription`,
        image: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?q=80&w=200&h=200&fit=crop",
        order_id: order_id,
        handler: async function (response) {
          try {
            const payload = {
              schoolName,
              subdomain,
              logoUrl,
              primaryColor,
              secondaryColor,
              adminName,
              adminEmail,
              adminPassword,
              plan,
              maxStudents: Number(maxStudents),
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            };

            await axios.post('http://localhost:5001/api/v1/superadmin/tenants', payload, {
              withCredentials: true
            });
            
            setSubmitSuccess(`Payment verified! Successfully onboarded school '${schoolName}'!`);
            
            if (onSuccess) onSuccess();

            setTimeout(() => {
              onClose();
            }, 2000);
          } catch (tenantErr) {
            setSubmitError(tenantErr.response?.data?.error || 'Failed to create tenant after payment.');
          } finally {
            setSubmitLoading(false);
          }
        },
        prefill: { name: adminName, email: adminEmail },
        theme: { color: "#4f46e5" },
        modal: {
          ondismiss: function() {
            setSubmitError('Payment was cancelled.');
            setSubmitLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
        setSubmitError(`Payment failed: ${response.error.description}`);
        setSubmitLoading(false);
      });
      rzp.open();

    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Failed to initiate payment.');
      setSubmitLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto transition-all duration-300">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 my-8">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-lg font-black flex items-center gap-2">
              <School className="w-5 h-5 text-indigo-400" /> Onboard School Tenant
            </h3>
            <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider mt-0.5">Multi-tenant automated registry setup</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl">×</button>
        </div>

        {/* Stepped progress indicators */}
        <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-850">
          <div className={`flex items-center space-x-1.5 text-xs font-bold ${modalStep === 1 ? 'text-indigo-400' : 'text-slate-500'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${modalStep === 1 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>1</span>
            <span>Profile</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-700" />
          <div className={`flex items-center space-x-1.5 text-xs font-bold ${modalStep === 2 ? 'text-indigo-400' : 'text-slate-500'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${modalStep === 2 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>2</span>
            <span>Subscription</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-700" />
          <div className={`flex items-center space-x-1.5 text-xs font-bold ${modalStep === 3 ? 'text-indigo-400' : 'text-slate-500'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${modalStep === 3 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>3</span>
            <span>Security Credentials</span>
          </div>
        </div>

        {submitError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-450 rounded-xl text-xs font-medium flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" /> {submitError}
          </div>
        )}
        
        {submitSuccess && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 rounded-xl text-xs font-medium">
            ✅ {submitSuccess}
          </div>
        )}

        <form onSubmit={handleOnboard} className="space-y-4">
          
          {/* STEP 1: School Profile & Colors */}
          {modalStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">School Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Greenwood High"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-800 bg-slate-950 text-white placeholder-slate-700 text-xs focus:outline-none focus:border-indigo-600 transition-all font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Subdomain prefix</label>
                  <input 
                    type="text" 
                    placeholder="e.g. greenwood"
                    value={subdomain}
                    onChange={(e) => setSubdomain(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-800 bg-slate-950 text-white placeholder-slate-700 text-xs focus:outline-none focus:border-indigo-600 transition-all font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">School Logo Branding</label>
                <div className="flex items-center space-x-4 bg-slate-950 border border-slate-800 p-3.5 rounded-xl">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo preview" className="w-12 h-12 rounded-xl object-cover border border-slate-800 bg-slate-900 shadow-lg" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-800/50 flex items-center justify-center border border-slate-700/60 shadow-inner">
                      <School className="w-5 h-5 text-slate-500" />
                    </div>
                  )}
                  <div className="flex-1">
                    <label className="cursor-pointer inline-flex items-center px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs rounded-lg transition-all gap-1.5 shadow-md">
                      {uploadingLogo ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Uploading Image...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>Choose Local File</span>
                        </>
                      )}
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleLogoUpload}
                        disabled={uploadingLogo}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[9px] text-slate-550 mt-1.5 font-semibold">Supported formats: PNG, JPG, WEBP. Maximum 5MB.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Primary Color Scheme</label>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="color" 
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-9 h-9 rounded-lg border border-slate-800 bg-transparent cursor-pointer shrink-0"
                    />
                    <input 
                      type="text" 
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-white text-xs focus:outline-none text-center font-mono font-bold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Secondary Color Scheme</label>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="color" 
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-9 h-9 rounded-lg border border-slate-800 bg-transparent cursor-pointer shrink-0"
                    />
                    <input 
                      type="text" 
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-white text-xs focus:outline-none text-center font-mono font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Plan & Subscription cards */}
          {modalStep === 2 && (
            <div className="space-y-4">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Select SaaS Subscription Tier</label>
              
              <div className="grid grid-cols-1 gap-3">
                {plansConfig.map(p => (
                  <div 
                    key={p.id}
                    onClick={() => handlePlanChange(p.id)}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between gap-4 ${plan === p.id ? 'border-indigo-500 bg-indigo-950/20 shadow-md shadow-indigo-550/5' : 'border-slate-800/80 bg-slate-950/50 hover:bg-slate-900/50'}`}
                  >
                    <div className="space-y-1">
                      <h5 className="font-bold text-sm text-slate-200 flex items-center gap-1.5">
                        {p.name}
                        {plan === p.id && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>}
                      </h5>
                      <p className="text-[10px] text-slate-450 leading-relaxed font-medium">{p.desc}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-extrabold text-indigo-400 block">{p.limit} Pupils limit</span>
                      <span className="text-slate-500 font-bold text-[10px] block mt-0.5">{p.price} / monthly</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Custom Student Registration Cap</label>
                <input 
                  type="number" 
                  value={maxStudents}
                  onChange={(e) => setMaxStudents(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-800 bg-slate-950 text-white text-xs focus:outline-none focus:border-indigo-600 transition-all font-semibold"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Admin Credentials */}
          {modalStep === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Administrator Full Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Principal Jane"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-800 bg-slate-950 text-white placeholder-slate-700 text-xs focus:outline-none focus:border-indigo-600 transition-all font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Administrator Email</label>
                  <input 
                    type="email" 
                    placeholder="admin@greenwood.com"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-800 bg-slate-950 text-white placeholder-slate-700 text-xs focus:outline-none focus:border-indigo-600 transition-all font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Secure Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-800 bg-slate-950 text-white placeholder-slate-700 text-xs focus:outline-none focus:border-indigo-600 transition-all font-semibold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="flex space-x-3 pt-4 border-t border-slate-800 mt-2">
            {modalStep > 1 && (
              <button 
                type="button"
                onClick={() => setModalStep(prev => prev - 1)}
                className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700 rounded-lg transition-all flex items-center gap-1.5"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Back
              </button>
            )}
            
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700 rounded-lg transition-all"
            >
              Cancel
            </button>
            
            <button 
              type="submit"
              disabled={submitLoading || uploadingLogo}
              className="flex-1 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              {submitLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : modalStep < 3 ? (
                <>
                  <span>Next Step</span> <ChevronRight className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Onboard & Create School</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default OnboardTenantModal;
