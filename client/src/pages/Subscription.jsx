import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTenantTheme } from '../context/TenantThemeContext';
import { CreditCard, Loader2, AlertTriangle, CheckCircle, Zap } from 'lucide-react';

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
        const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5001`;
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
      const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5001`;
      
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

  const primaryBrandColor = tenant?.primaryColor || '#0D1B2A';
  const usageRatio = studentCount / maxStudents;

  return (
    <div className="space-y-6">
      {/* Calm Header */}
      <div className="flex justify-between items-end bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Subscription & Billing</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage your school's plan and view current usage limits.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}
      
      {upgradeError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {upgradeError}
        </div>
      )}

      {upgradeSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-medium flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" /> {upgradeSuccess}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5">
        {/* Usage Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Account Plan</span>
                <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 border border-slate-200">
                  {currentPlan}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2 font-medium">
                Your school uses <strong className="text-slate-800 font-mono">{studentCount}</strong> seats out of a total capacity limit of <strong className="text-slate-800 font-mono">{maxStudents}</strong> students.
              </p>
            </div>
            
            <div className="w-full md:w-1/3">
              <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                <span>Usage Seat Cap</span>
                <span className="font-mono">{Math.round(usageRatio * 100)}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    usageRatio > 0.9 ? 'bg-red-500' : 
                    usageRatio > 0.75 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`} 
                  style={{ width: `${Math.min(usageRatio * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Upgrade Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plansConfig.map((p, idx) => {
            const isCurrent = p.id === currentPlan;
            const isDowngrade = idx < currentPlanIndex;
            
            return (
              <div 
                key={p.id} 
                className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between shadow-sm relative hover:border-slate-300 transition-colors"
              >
                {isCurrent && (
                  <span className="absolute top-3 right-3 text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded uppercase tracking-wider">
                    Current Plan
                  </span>
                )}
                
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">{p.name}</h3>
                  <div className="mt-2 text-2xl font-bold text-slate-800 tracking-tight">{p.price}</div>
                  <p className="text-[11px] text-slate-500 mt-1 font-medium leading-relaxed">{p.desc}</p>
                </div>
                
                <div className="my-4 space-y-2.5 flex-1 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2 text-xs text-slate-700">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Up to {p.limit === 'Unlimited' ? p.limit : `${fmt => p.limit} students`} limit</span>
                  </div>
                  {p.id === 'professional' && (
                    <>
                      <div className="flex items-center gap-2 text-xs text-slate-700">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>Advanced Academic Analytics</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-700">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>SMS Portal integrations</span>
                      </div>
                    </>
                  )}
                  {p.id === 'enterprise' && (
                    <>
                      <div className="flex items-center gap-2 text-xs text-slate-700">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>Custom database configuration</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-700">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>24/7 dedicated support staff</span>
                      </div>
                    </>
                  )}
                </div>
                
                {isCurrent ? (
                  <div className="w-full py-2 bg-slate-50 border border-slate-200 text-slate-500 text-xs font-bold rounded-lg text-center select-none uppercase tracking-wider">
                    Current active tier
                  </div>
                ) : isDowngrade ? (
                  <div className="w-full py-2 bg-slate-50 border border-slate-200 text-slate-400 text-xs font-bold rounded-lg text-center select-none uppercase tracking-wider opacity-60">
                    Downgrade locked
                  </div>
                ) : (
                  <button 
                    onClick={() => handleUpgrade(p.id)}
                    disabled={upgradeLoading}
                    className="w-full py-2 text-white text-xs font-bold rounded-lg shadow-sm hover:opacity-95 transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider"
                    style={{ backgroundColor: primaryBrandColor }}
                  >
                    {upgradeLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5" />
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
