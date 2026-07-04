import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings, ChevronRight, ChevronLeft, Loader2, AlertTriangle, School, Upload } from 'lucide-react';

const plansConfig = [
  { id: 'starter', name: 'Starter', limit: 200, price: '₹1,999/mo', desc: 'Perfect for small schools just getting started.' },
  { id: 'professional', name: 'Professional', limit: 1000, price: '₹4,499/mo', desc: 'The complete package for growing institutions.' },
  { id: 'enterprise', name: 'Enterprise', limit: 10000, price: 'Custom', desc: 'For large institutions & school chains.' }
];

const EditTenantModal = ({ school, onClose, onSuccess }) => {
  const [editModalStep, setEditModalStep] = useState(1);
  const [editSchoolId, setEditSchoolId] = useState('');
  const [editSchoolName, setEditSchoolName] = useState('');
  const [editLogoUrl, setEditLogoUrl] = useState('');
  const [editPrimaryColor, setEditPrimaryColor] = useState('#4f46e5');
  const [editSecondaryColor, setEditSecondaryColor] = useState('#06b6d4');
  const [editStatus, setEditStatus] = useState('active');
  const [editPlan, setEditPlan] = useState('starter');
  const [editMaxStudents, setEditMaxStudents] = useState(200);

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  useEffect(() => {
    if (school) {
      setEditSchoolId(school._id || school.id);
      setEditSchoolName(school.schoolName);
      setEditLogoUrl(school.logoUrl || '');
      setEditPrimaryColor(school.primaryColor || '#4f46e5');
      setEditSecondaryColor(school.secondaryColor || '#06b6d4');
      setEditStatus(school.status || 'active');
      setEditPlan(school.plan || 'starter');
      setEditMaxStudents(school.maxStudents || 10);
    }
  }, [school]);

  const handlePlanChange = (selectedPlan) => {
    let limit = 200;
    if (selectedPlan === 'professional') limit = 1000;
    if (selectedPlan === 'enterprise') limit = 10000;
    
    setEditPlan(selectedPlan);
    setEditMaxStudents(limit);
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
      setEditLogoUrl(res.data.url);
      setSubmitSuccess('School logo uploaded successfully!');
      setTimeout(() => setSubmitSuccess(''), 2500);
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Failed to upload logo.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (editModalStep < 2) {
      setEditModalStep(prev => prev + 1);
      return;
    }

    setSubmitError('');
    setSubmitSuccess('');
    setSubmitLoading(true);

    try {
      await axios.put(`http://localhost:5001/api/v1/superadmin/tenants/${editSchoolId}`, {
        schoolName: editSchoolName,
        logoUrl: editLogoUrl,
        primaryColor: editPrimaryColor,
        secondaryColor: editSecondaryColor,
        status: editStatus,
        plan: editPlan,
        maxStudents: Number(editMaxStudents)
      });

      setSubmitSuccess('School settings updated successfully!');
      if (onSuccess) onSuccess();

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Failed to save configurations.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto transition-all duration-300">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-2xl shadow-slate-200/50 space-y-5 my-8">
        
        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-lg font-black flex items-center gap-2 text-slate-900">
              <Settings className="w-5 h-5 text-indigo-600" /> Edit School Configurations
            </h3>
            <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider mt-0.5">Modify branding & subscription plans</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800 text-lg transition-colors">×</button>
        </div>

        {/* Stepped progress indicators for Edit */}
        <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-200 shadow-sm">
          <div className={`flex items-center space-x-1.5 text-xs font-bold ${editModalStep === 1 ? 'text-indigo-600' : 'text-slate-500'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shadow-sm ${editModalStep === 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>1</span>
            <span>Profile & Branding</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <div className={`flex items-center space-x-1.5 text-xs font-bold ${editModalStep === 2 ? 'text-indigo-600' : 'text-slate-500'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shadow-sm ${editModalStep === 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>2</span>
            <span>Plan & Access Status</span>
          </div>
        </div>

        {submitError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-sm">
            <AlertTriangle className="w-4 h-4" /> {submitError}
          </div>
        )}
        
        {submitSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-medium shadow-sm">
            ✅ {submitSuccess}
          </div>
        )}

        <form onSubmit={handleEditSubmit} className="space-y-4">
          
          {/* EDIT STEP 1: Name, Logo & Branding Colors */}
          {editModalStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">School Name</label>
                <input 
                  type="text" 
                  value={editSchoolName}
                  onChange={(e) => setEditSchoolName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-semibold shadow-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">School Logo Branding</label>
                <div className="flex items-center space-x-4 bg-slate-50 border border-slate-200 p-3.5 rounded-xl shadow-sm">
                  {editLogoUrl ? (
                    <img src={editLogoUrl} alt="Logo preview" className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-white shadow-sm" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 shadow-sm">
                      <School className="w-5 h-5 text-slate-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <label className="cursor-pointer inline-flex items-center px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs rounded-lg transition-all gap-1.5 shadow-md">
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
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Primary Color Scheme</label>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="color" 
                      value={editPrimaryColor}
                      onChange={(e) => setEditPrimaryColor(e.target.value)}
                      className="w-9 h-9 rounded-lg border border-slate-300 bg-transparent cursor-pointer shrink-0 shadow-sm"
                    />
                    <input 
                      type="text" 
                      value={editPrimaryColor}
                      onChange={(e) => setEditPrimaryColor(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-center font-mono font-bold shadow-sm transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Secondary Color Scheme</label>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="color" 
                      value={editSecondaryColor}
                      onChange={(e) => setEditSecondaryColor(e.target.value)}
                      className="w-9 h-9 rounded-lg border border-slate-300 bg-transparent cursor-pointer shrink-0 shadow-sm"
                    />
                    <input 
                      type="text" 
                      value={editSecondaryColor}
                      onChange={(e) => setEditSecondaryColor(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-center font-mono font-bold shadow-sm transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* EDIT STEP 2: Plan & Portal Access Status */}
          {editModalStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Portal Access Control</label>
                <select 
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-semibold transition-all shadow-sm"
                >
                  <option value="active">Active (Access Allowed)</option>
                  <option value="suspended">Suspended (Access Blocked)</option>
                </select>
              </div>

              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Modify Subscription Tier</label>
              <div className="grid grid-cols-1 gap-3">
                {plansConfig.map(p => (
                  <div 
                    key={p.id}
                    onClick={() => handlePlanChange(p.id)}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between gap-4 shadow-sm ${editPlan === p.id ? 'border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-100/50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
                  >
                    <div className="space-y-1">
                      <h5 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                        {p.name}
                        {editPlan === p.id && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>}
                      </h5>
                      <p className="text-[10px] text-slate-500 leading-relaxed font-medium">{p.desc}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-extrabold text-indigo-600 block">{p.limit} Pupils limit</span>
                      <span className="text-slate-500 font-bold text-[10px] block mt-0.5">{p.price} / monthly</span>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Custom Student Registration Cap</label>
                <input 
                  type="number" 
                  value={editMaxStudents}
                  onChange={(e) => setEditMaxStudents(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-semibold shadow-sm"
                />
              </div>
            </div>
          )}

          {/* Edit Modal Footer Controls */}
          <div className="flex space-x-3 pt-4 border-t border-slate-200 mt-2">
            {editModalStep > 1 && (
              <button 
                type="button"
                onClick={() => setEditModalStep(prev => prev - 1)}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-300 rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Back
              </button>
            )}
            
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-300 rounded-lg transition-all shadow-sm"
            >
              Cancel
            </button>
            
            <button 
              type="submit"
              disabled={submitLoading || uploadingLogo}
              className="flex-1 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              {submitLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : editModalStep < 2 ? (
                <>
                  <span>Next Step</span> <ChevronRight className="w-3.5 h-3.5" />
                </>
              ) : (
                <span>Save Configurations</span>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditTenantModal;
