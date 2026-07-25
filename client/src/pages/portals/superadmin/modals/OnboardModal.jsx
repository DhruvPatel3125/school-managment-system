import React, { useState } from 'react';
import axios from 'axios';
import {
  X, Building2, Upload, Loader2, AlertTriangle, ChevronLeft, ChevronRight
} from 'lucide-react';
import Stepper from '../components/Stepper';

const API = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5001`;

const planConfig = [
  { id: 'starter',      name: 'Starter',      limit: 200,   price: '₹1,999/mo', desc: 'Small schools, up to 200 students.' },
  { id: 'professional', name: 'Professional',  limit: 1000,  price: '₹4,499/mo', desc: 'Growing institutions, up to 1,000 students.' },
  { id: 'enterprise',   name: 'Enterprise',    limit: 10000, price: 'Custom',    desc: 'Large chains & districts. Contact sales.' },
];

const fmt = (n) => n?.toLocaleString('en-IN') ?? '—';

/**
 * OnboardModal — 3-step wizard to onboard a new school tenant with Razorpay payment
 */
const OnboardModal = ({ onClose, onSuccess }) => {
  const [step, setStep]           = useState(1);
  const [schoolName, setSchoolName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [logoUrl, setLogoUrl]     = useState('');
  const [primaryColor, setPrimary]   = useState('#2563EB');
  const [secondaryColor, setSecondary] = useState('#16A34A');
  const [plan, setPlan]           = useState('starter');
  const [maxStudents, setMax]     = useState(200);
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPass] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [err, setErr]             = useState('');
  const [ok, setOk]               = useState('');

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setErr('');
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await axios.post(`${API}/api/v1/upload`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setLogoUrl(res.data.url);
      setOk('Logo uploaded.');
      setTimeout(() => setOk(''), 2000);
    } catch (e) {
      setErr(e.response?.data?.error || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handlePlan = (p) => {
    setPlan(p);
    setMax(p === 'professional' ? 1000 : p === 'enterprise' ? 10000 : 200);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < 3) { setStep(s => s + 1); return; }
    setErr('');
    setLoading(true);
    try {
      if (plan === 'enterprise') {
        setErr('Enterprise plans require custom setup. Contact sales.');
        setLoading(false);
        return;
      }
      await axios.post(`${API}/api/v1/superadmin/tenants/validate`,
        { schoolName, subdomain, adminName, adminEmail, adminPassword },
        { withCredentials: true }
      );
      const orderRes = await axios.post(`${API}/api/v1/payments/create-razorpay-order`, { plan }, { withCredentials: true });
      const { order_id, amount, currency } = orderRes.data.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        amount, currency, name: 'EduCore', order_id,
        description: `${plan} Subscription`,
        handler: async (resp) => {
          try {
            await axios.post(`${API}/api/v1/superadmin/tenants`, {
              schoolName, subdomain, logoUrl, primaryColor, secondaryColor,
              adminName, adminEmail, adminPassword, plan, maxStudents: Number(maxStudents),
              razorpay_order_id:   resp.razorpay_order_id,
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_signature:  resp.razorpay_signature,
            }, { withCredentials: true });
            setOk(`School '${schoolName}' onboarded successfully!`);
            if (onSuccess) onSuccess();
            setTimeout(onClose, 1800);
          } catch (e) {
            setErr(e.response?.data?.error || 'Tenant creation failed.');
          } finally {
            setLoading(false);
          }
        },
        prefill: { name: adminName, email: adminEmail },
        modal: { ondismiss: () => { setErr('Payment cancelled.'); setLoading(false); } },
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (r) => { setErr(`Payment failed: ${r.error.description}`); setLoading(false); });
      rzp.open();
    } catch (e) {
      setErr(e.response?.data?.error || 'Failed to initiate payment.');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <div>
            <div className="modal-title">Onboard School Tenant</div>
            <div style={{ fontSize: 11, color: 'var(--sa-text3)', marginTop: 2 }}>Multi-tenant registry setup</div>
          </div>
          <button className="btn btn-icon" onClick={onClose}><X style={{ width: 16, height: 16 }} /></button>
        </div>

        <div className="modal-body">
          <Stepper steps={['Profile', 'Subscription', 'Admin Access']} current={step} />

          {err && (
            <div style={{ background: 'var(--sa-red-bg)', border: '1px solid var(--sa-red-b)', color: 'var(--sa-red)', borderRadius: 6, padding: '8px 12px', fontSize: 12, marginBottom: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
              <AlertTriangle style={{ width: 14, height: 14, flexShrink: 0 }} />{err}
            </div>
          )}
          {ok && (
            <div style={{ background: 'var(--sa-green-bg)', border: '1px solid var(--sa-green-b)', color: 'var(--sa-green)', borderRadius: 6, padding: '8px 12px', fontSize: 12, marginBottom: 14 }}>
              {ok}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1 — School Profile */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="layout-grid-form-2col">
                  <div>
                    <label className="form-label">School Name</label>
                    <input className="admin-input" value={schoolName} onChange={e => setSchoolName(e.target.value)} placeholder="Greenwood High School" required />
                  </div>
                  <div>
                    <label className="form-label">Subdomain Prefix</label>
                    <input
                      className="admin-input mono"
                      value={subdomain}
                      onChange={e => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      placeholder="greenwood"
                      required
                    />
                    {subdomain && <div style={{ fontSize: 10, color: 'var(--sa-text4)', marginTop: 3 }} className="mono">{subdomain}.educore.app</div>}
                  </div>
                </div>

                <div>
                  <label className="form-label">School Logo</label>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'var(--sa-bg2)', border: '1px solid var(--sa-border)', borderRadius: 6, padding: '10px 12px' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 6, background: 'var(--sa-bg3)', border: '1px solid var(--sa-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                      {logoUrl
                        ? <img src={logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <Building2 style={{ width: 18, height: 18, color: 'var(--sa-text4)' }} />
                      }
                    </div>
                    <label className="btn" style={{ cursor: 'pointer', margin: 0 }}>
                      {uploading
                        ? <><Loader2 style={{ width: 13, height: 13, animation: 'sa-spin 1s linear infinite' }} /> Uploading…</>
                        : <><Upload style={{ width: 13, height: 13 }} /> Upload Logo</>
                      }
                      <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} style={{ display: 'none' }} />
                    </label>
                    <span style={{ fontSize: 11, color: 'var(--sa-text4)' }}>PNG, JPG up to 5MB</span>
                  </div>
                </div>

                <div className="layout-grid-form-2col">
                  {[['Primary Color', primaryColor, setPrimary], ['Secondary Color', secondaryColor, setSecondary]].map(([label, val, set]) => (
                    <div key={label}>
                      <label className="form-label">{label}</label>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <input type="color" value={val} onChange={e => set(e.target.value)} style={{ width: 34, height: 34, borderRadius: 5, border: '1px solid var(--sa-border2)', cursor: 'pointer', padding: 2, flexShrink: 0 }} />
                        <input className="admin-input mono" value={val} onChange={e => set(e.target.value)} style={{ textAlign: 'center' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2 — Subscription Plan */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <label className="form-label">Subscription Plan</label>
                {planConfig.map(p => (
                  <div
                    key={p.id}
                    onClick={() => handlePlan(p.id)}
                    style={{ padding: '12px 14px', border: `1.5px solid ${plan === p.id ? 'var(--sa-accent)' : 'var(--sa-border)'}`, borderRadius: 7, cursor: 'pointer', background: plan === p.id ? 'var(--sa-accent-bg)' : 'var(--sa-bg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.15s' }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: plan === p.id ? 'var(--sa-accent)' : 'var(--sa-text)' }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--sa-text3)', marginTop: 2 }}>{p.desc}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: plan === p.id ? 'var(--sa-accent)' : 'var(--sa-text2)' }}>{p.price}</div>
                      <div className="mono" style={{ fontSize: 10, color: 'var(--sa-text3)', marginTop: 2 }}>{fmt(p.limit)} students</div>
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: 4 }}>
                  <label className="form-label">Student Cap Override</label>
                  <input className="admin-input mono" type="number" value={maxStudents} onChange={e => setMax(e.target.value)} required />
                </div>
              </div>
            )}

            {/* Step 3 — Admin Access */}
            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="form-label">Administrator Full Name</label>
                  <input className="admin-input" value={adminName} onChange={e => setAdminName(e.target.value)} placeholder="Principal Jane Doe" required />
                </div>
                <div className="layout-grid-form-2col">
                  <div>
                    <label className="form-label">Admin Email</label>
                    <input className="admin-input mono" type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} placeholder="admin@school.com" required />
                  </div>
                  <div>
                    <label className="form-label">Admin Password</label>
                    <input className="admin-input" type="password" value={adminPassword} onChange={e => setAdminPass(e.target.value)} placeholder="Min. 8 characters" required />
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="modal-footer" style={{ padding: '14px 0 0', marginTop: 20, borderTop: '1px solid var(--sa-border)' }}>
              {step > 1 && (
                <button type="button" className="btn" onClick={() => setStep(s => s - 1)}>
                  <ChevronLeft style={{ width: 14, height: 14 }} />Back
                </button>
              )}
              <button type="button" className="btn" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading || uploading}>
                {loading ? <Loader2 style={{ width: 13, height: 13, animation: 'sa-spin 1s linear infinite' }} /> : null}
                {step < 3 ? <>Next <ChevronRight style={{ width: 14, height: 14 }} /></> : 'Create & Pay'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OnboardModal;
