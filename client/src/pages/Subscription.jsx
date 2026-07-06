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
      
      // 1. Create order
      const orderRes = await axios.post(`${API_URL}/api/v1/payments/upgrade-plan-order`, { plan: planId }, {
        withCredentials: true
      });
      
      const { order_id, amount, currency } = orderRes.data.data;

      // 2. Open Razorpay
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
            
            // Reload page to reflect changes in tenant context
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
        theme: { color: tenant?.primaryColor || "#4f46e5" },
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
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const getPlanIndex = (planName) => plansConfig.findIndex(p => p.id === planName);
  const currentPlanIndex = getPlanIndex(currentPlan);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Subscription & Billing</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Manage your school's plan and view current usage limits.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-medium flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" /> {error}
        </div>
      )}
      
      {upgradeError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-medium flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" /> {upgradeError}
        </div>
      )}

      {upgradeSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-medium flex items-center gap-2">
          <CheckCircle className="w-5 h-5" /> {upgradeSuccess}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current Usage Card */}
        <div className="col-span-1 md:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Current Plan: <span className="uppercase text-blue-600 bg-blue-50 px-2 py-1 rounded-md text-sm">{currentPlan}</span>
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                You are currently using <strong>{studentCount}</strong> out of <strong>{maxStudents}</strong> available student seats.
              </p>
            </div>
            
            <div className="w-full md:w-1/3">
              <div className="flex justify-between text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                <span>Usage</span>
                <span>{Math.round((studentCount / maxStudents) * 100)}%</span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    (studentCount / maxStudents) > 0.9 ? 'bg-rose-500' : 
                    (studentCount / maxStudents) > 0.75 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`} 
                  style={{ width: `${Math.min((studentCount / maxStudents) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Upgrade Plans */}
        {plansConfig.map((p, idx) => {
          const isCurrent = p.id === currentPlan;
          const isDowngrade = idx < currentPlanIndex;
          
          return (
            <div 
              key={p.id} 
              className={`relative bg-white rounded-2xl shadow-sm border ${isCurrent ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200'} p-6 flex flex-col transition-all duration-300 hover:shadow-md`}
            >
              {isCurrent && (
                <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl rounded-tr-xl">
                  Current Plan
                </div>
              )}
              
              <div className="mb-4">
                <h3 className="text-xl font-black text-slate-900">{p.name}</h3>
                <div className="mt-2 text-2xl font-bold text-slate-700">{p.price}</div>
                <p className="text-xs text-slate-500 mt-2 font-medium h-10">{p.desc}</p>
              </div>
              
              <div className="mb-6 space-y-3 flex-1">
                <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                  <CheckCircle className="w-4 h-4 text-emerald-500" /> Up to {p.limit} Students
                </div>
                {p.id === 'professional' && (
                  <>
                    <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                      <CheckCircle className="w-4 h-4 text-emerald-500" /> Advanced Analytics
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                      <CheckCircle className="w-4 h-4 text-emerald-500" /> SMS Integration
                    </div>
                  </>
                )}
                {p.id === 'enterprise' && (
                  <>
                    <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                      <CheckCircle className="w-4 h-4 text-emerald-500" /> Custom Integrations
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                      <CheckCircle className="w-4 h-4 text-emerald-500" /> Priority Support
                    </div>
                  </>
                )}
              </div>
              
              <button 
                onClick={() => handleUpgrade(p.id)}
                disabled={isCurrent || isDowngrade || upgradeLoading}
                className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  isCurrent ? 'bg-blue-50 text-blue-600 border border-blue-200 cursor-default' : 
                  isDowngrade ? 'bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed' :
                  p.id === 'enterprise' ? 'bg-slate-900 text-white hover:bg-slate-800' :
                  'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/25 active:scale-95'
                }`}
              >
                {upgradeLoading && p.id !== 'enterprise' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isCurrent ? (
                  'Active Plan'
                ) : isDowngrade ? (
                  'Downgrade Not Supported'
                ) : p.id === 'enterprise' ? (
                  'Contact Sales'
                ) : (
                  <>
                    <Zap className="w-4 h-4" /> Upgrade to {p.name}
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Subscription;
