import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTenantTheme } from '../context/TenantThemeContext';
import { Loader2, AlertTriangle, CheckCircle, Zap } from 'lucide-react';
import { API_URL } from '../config/api';

const plansConfig = [
  { id: 'starter', name: 'Starter', price: '₹1,999/mo', desc: 'Perfect for small schools just getting started.', limit: 200 },
  { id: 'professional', name: 'Professional', price: '₹4,499/mo', desc: 'The complete package for growing institutions.', limit: 1000 },
  { id: 'enterprise', name: 'Enterprise', price: 'Custom', desc: 'For large institutions & school chains.', limit: 'Unlimited' }
];

const Subscription = () => {
  const { user } = useAuth();
  const { tenant } = useTenantTheme();
  const [studentCount, setStudentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [upgradeError, setUpgradeError] = useState('');
  const [upgradeSuccess, setUpgradeSuccess] = useState('');

  const currentPlan = tenant?.plan || 'starter';
  const maxStudents = tenant?.maxStudents || 200;

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/v1/students`, {
          withCredentials: true
        });
        setStudentCount(res.data.data.length);
      } catch (err) {
        console.error('Failed to fetch student count', err);
        setError('Failed to fetch current usage.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsage();
  }, []);

  const handleUpgrade = async (planId) => {
    if (planId === currentPlan) return;
    if (planId === 'enterprise') {
      alert("Please contact our sales team to upgrade to Enterprise.");
      return;
    }

    setUpgradeError('');
    setUpgradeSuccess('');
    setUpgradeLoading(true);

    try {
      const orderRes = await axios.post(`${API_URL}/api/v1/payments/upgrade-plan-order`, { plan: planId }, {
        withCredentials: true
      });
      
      const { order_id, amount, currency } = orderRes.data.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        amount: amount,
        currency: currency,
        name: "EduCore ERP",
        description: `Upgrade to ${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan`,
        image: tenant?.logoUrl || "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?q=80&w=200&h=200&fit=crop",
        order_id: order_id,
        handler: async function (response) {
          try {
            const verifyPayload = {
              plan: planId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            };

            await axios.post(`${API_URL}/api/v1/payments/upgrade-plan-verify`, verifyPayload, {
              withCredentials: true
            });
            
            setUpgradeSuccess(`Successfully upgraded to ${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan!`);
            
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          } catch (verifyErr) {
            setUpgradeError(verifyErr.response?.data?.error || 'Failed to verify upgrade payment.');
          } finally {
            setUpgradeLoading(false);
          }
        },
        prefill: { name: user.name, email: user.email },
        theme: { color: tenant?.primaryColor || "#0D1B2A" },
        modal: {
          ondismiss: function() {
            setUpgradeError('Payment was cancelled.');
            setUpgradeLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
        setUpgradeError(`Payment failed: ${response.error.description}`);
        setUpgradeLoading(false);
      });
      rzp.open();

    } catch (err) {
      setUpgradeError(err.response?.data?.error || 'Failed to initiate upgrade.');
      setUpgradeLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: tenant?.primaryColor || '#0D1B2A' }} />
      </div>
    );
  }

  const getPlanIndex = (planName) => plansConfig.findIndex(p => p.id === planName);
  const currentPlanIndex = getPlanIndex(currentPlan);

  const usageRatio = studentCount / maxStudents;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <Zap className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Subscription & Billing Management</h1>
          </div>
          <p className="text-xs text-slate-500">Manage your school's subscription plan tier, seat capacity limits, and billing details for {tenant?.schoolName || 'EduCore School'}.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}
      
      {upgradeError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {upgradeError}
        </div>
      )}

      {upgradeSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-medium flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" /> {upgradeSuccess}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {/* Usage Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Active Plan</span>
                <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wider text-[#C4613A] bg-[#C4613A]/10 border border-[#C4613A]/20">
                  {currentPlan} Tier
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                Your school is utilizing <strong className="text-slate-900 font-bold font-mono">{studentCount}</strong> active student seats out of <strong className="text-slate-900 font-bold font-mono">{maxStudents}</strong> maximum total seat capacity.
              </p>
            </div>
            
            <div className="w-full md:w-1/3 space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Seat Capacity Usage</span>
                <span className="font-mono">{Math.round(usageRatio * 100)}%</span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    usageRatio > 0.9 ? 'bg-rose-500' : 
                    usageRatio > 0.75 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`} 
                  style={{ width: `${Math.min(usageRatio * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Upgrade Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plansConfig.map((p, idx) => {
            const isCurrent = p.id === currentPlan;
            const isDowngrade = idx < currentPlanIndex;
            
            return (
              <div 
                key={p.id} 
                className={`bg-white rounded-2xl border p-6 flex flex-col justify-between shadow-sm relative transition-all ${
                  isCurrent ? 'border-indigo-500 ring-2 ring-indigo-500/10 shadow-md' : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                {isCurrent && (
                  <span className="absolute top-4 right-4 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Current Active Tier
                  </span>
                )}
                
                <div className="mb-4">
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">{p.name}</h3>
                  <div className="mt-2 text-3xl font-black text-slate-900 tracking-tight">{p.price}</div>
                  <p className="text-xs text-slate-500 mt-2 font-medium leading-relaxed">{p.desc}</p>
                </div>
                
                <div className="my-4 space-y-3 flex-1 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Up to {p.limit === 'Unlimited' ? p.limit : `${p.limit} students`} limit</span>
                  </div>
                  {p.id === 'professional' && (
                    <>
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>Advanced Academic Analytics</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>Automated SMS & Portal Notices</span>
                      </div>
                    </>
                  )}
                  {p.id === 'enterprise' && (
                    <>
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>Custom Multi-Tenant Database</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>24/7 Priority Dedicated Support</span>
                      </div>
                    </>
                  )}
                </div>
                
                {isCurrent ? (
                  <div className="w-full py-2.5 bg-slate-50 border border-slate-200 text-slate-500 text-xs font-bold rounded-xl text-center select-none uppercase tracking-wider">
                    Current Active Tier
                  </div>
                ) : isDowngrade ? (
                  <div className="w-full py-2.5 bg-slate-50 border border-slate-200 text-slate-400 text-xs font-bold rounded-xl text-center select-none uppercase tracking-wider opacity-60">
                    Downgrade Locked
                  </div>
                ) : (
                  <button 
                    onClick={() => handleUpgrade(p.id)}
                    disabled={upgradeLoading}
                    className="w-full py-2.5 bg-[#C4613A] hover:bg-[#b0532e] active:scale-95 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
                  >
                    {upgradeLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Zap className="w-4 h-4 text-amber-300" />
                        <span>Upgrade to {p.name}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Subscription;
