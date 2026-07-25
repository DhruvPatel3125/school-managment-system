import React, { useState } from 'react';
import axios from 'axios';
import {
  X, Building2, Upload, Loader2, AlertTriangle, ChevronLeft, ChevronRight
} from 'lucide-react';
import Stepper from '../components/Stepper';

const API = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5001`;

const planConfig = [
  { id: 'starter',      name: 'Starter',     price: '₹1,999/mo' },
  { id: 'professional', name: 'Professional', price: '₹4,499/mo' },
  { id: 'enterprise',   name: 'Enterprise',   price: 'Custom' },
];

/**
 * EditModal — 2-step wizard to edit an existing school tenant
 */
const EditModal = ({ school, onClose, onSuccess }) => {
  const [step, setStep]           = useState(1);
  const [name, setName]           = useState(school?.schoolName || '');
  const [logoUrl, setLogoUrl]     = useState(school?.logoUrl || '');
  const [primary, setPrimary]     = useState(school?.primaryColor || '#2563EB');
  const [secondary, setSecondary] = useState(school?.secondaryColor || '#16A34A');
  const [status, setStatus]       = useState(school?.status || 'active');
  const [plan, setPlan]           = useState(school?.plan || 'starter');
  const [maxStudents, setMax]     = useState(school?.maxStudents || 200);
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
      setOk('Logo updated.');
      setTimeout(() => setOk(''), 2000);
    } catch (e) {
      setErr(e.response?.data?.error || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < 2) { setStep(2); return; }
    setErr('');
    setLoading(true);
    try {
      await axios.put(`${API}/api/v1/superadmin/tenants/${school._id || school.id}`, {
        schoolName: name, logoUrl, primaryColor: primary, secondaryColor: secondary,
        status, plan, maxStudents: Number(maxStudents),
      });
      setOk('Saved successfully.');
      if (onSuccess) onSuccess();
      setTimeout(onClose, 1500);
    } catch (e) {
      setErr(e.response?.data?.error || 'Save failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <div className="modal-title">Edit School — {school?.schoolName}</div>
          <button className="btn btn-icon" onClick={onClose}><X style={{ width: 16, height: 16 }} /></button>
        </div>

        <div className="modal-body">
          <Stepper steps={['Profile & Branding', 'Plan & Status']} current={step} />

          {err && (
            <div style={{ background: 'var(--sa-red-bg)', border: '1px solid var(--sa-red-b)', color: 'var(--sa-red)', borderRadius: 6, padding: '8px 12px', fontSize: 12, marginBottom: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
              <AlertTriangle style={{ width: 14, height: 14 }} />{err}
            </div>
          )}
          {ok && (
            <div style={{ background: 'var(--sa-green-bg)', border: '1px solid var(--sa-green-b)', color: 'var(--sa-green)', borderRadius: 6, padding: '8px 12px', fontSize: 12, marginBottom: 14 }}>
              {ok}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1 — Profile & Branding */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="form-label">School Name</label>
                  <input className="admin-input" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div>
                  <label className="form-label">Logo</label>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'var(--sa-bg2)', border: '1px solid var(--sa-border)', borderRadius: 6, padding: '10px 12px' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 6, background: 'var(--sa-bg3)', border: '1px solid var(--sa-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                      {logoUrl
                        ? <img src={logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <Building2 style={{ width: 18, height: 18, color: 'var(--sa-text4)' }} />
                      }
                    </div>
                    <label className="btn" style={{ cursor: 'pointer', margin: 0 }}>
                      {uploading
                        ? <><Loader2 style={{ width: 13, height: 13, animation: 'sa-spin 1s linear infinite' }} />Uploading…</>
                        : <><Upload style={{ width: 13, height: 13 }} />Change Logo</>
                      }
                      <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} style={{ display: 'none' }} />
                    </label>
                  </div>
                </div>
                <div className="layout-grid-form-2col">
                  {[['Primary Color', primary, setPrimary], ['Secondary Color', secondary, setSecondary]].map(([label, val, set]) => (
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

            {/* Step 2 — Plan & Status */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="form-label">Portal Status</label>
                  <select className="admin-select" value={status} onChange={e => setStatus(e.target.value)} style={{ width: '100%' }}>
                    <option value="active">Active — Access Allowed</option>
                    <option value="suspended">Suspended — Access Blocked</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Subscription Plan</label>
                  {planConfig.map(p => (
                    <div
                      key={p.id}
                      onClick={() => { setPlan(p.id); setMax(p.id === 'professional' ? 1000 : p.id === 'enterprise' ? 10000 : 200); }}
                      style={{ padding: '10px 14px', border: `1.5px solid ${plan === p.id ? 'var(--sa-accent)' : 'var(--sa-border)'}`, borderRadius: 7, cursor: 'pointer', background: plan === p.id ? 'var(--sa-accent-bg)' : 'var(--sa-bg)', display: 'flex', justifyContent: 'space-between', marginBottom: 8, transition: 'all 0.15s' }}
                    >
                      <div style={{ fontWeight: plan === p.id ? 600 : 400, fontSize: 13, color: plan === p.id ? 'var(--sa-accent)' : 'var(--sa-text)' }}>{p.name}</div>
                      <div className="mono" style={{ fontSize: 12, color: plan === p.id ? 'var(--sa-accent)' : 'var(--sa-text3)' }}>{p.price}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <label className="form-label">Student Cap</label>
                  <input className="admin-input mono" type="number" value={maxStudents} onChange={e => setMax(e.target.value)} required />
                </div>
              </div>
            )}

            {/* Footer */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 14, marginTop: 16, borderTop: '1px solid var(--sa-border)' }}>
              {step > 1 && (
                <button type="button" className="btn" onClick={() => setStep(1)}>
                  <ChevronLeft style={{ width: 14, height: 14 }} />Back
                </button>
              )}
              <button type="button" className="btn" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading || uploading}>
                {loading ? <Loader2 style={{ width: 13, height: 13, animation: 'sa-spin 1s linear infinite' }} /> : null}
                {step < 2 ? <>Next<ChevronRight style={{ width: 14, height: 14 }} /></> : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
