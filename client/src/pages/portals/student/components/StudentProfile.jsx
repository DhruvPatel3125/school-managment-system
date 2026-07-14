import React from 'react';
import { User, Mail, Calendar, GraduationCap, ShieldCheck, Heart, Phone, Award } from 'lucide-react';
import { useTenantTheme } from '../../../../context/TenantThemeContext';

const StudentProfile = ({ studentDashData, user }) => {
  const { tenant } = useTenantTheme();
  
  const profile = studentDashData?.student || {};
  const classSection = localStorage.getItem('studentClassSection') || 'Class 3 - Section A';
  const primaryBrandColor = tenant?.primaryColor || '#0D1B2A';

  const initials = user?.name?.split(' ').map(n => n[0]).slice(0, 2).join('') || 'ST';

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 sm:p-6 space-y-6 text-left">
      {/* Profile Header Block */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 border-b border-slate-150 pb-5">
        <div 
          className="w-16 h-16 rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-sm uppercase shrink-0"
          style={{ backgroundColor: primaryBrandColor }}
        >
          {initials}
        </div>
        <div className="text-center sm:text-left space-y-1">
          <h2 className="text-lg font-bold text-slate-900">{user?.name}</h2>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-650 text-[9px] font-bold uppercase tracking-wider">
              Student Profile
            </span>
            <span className="text-[10px] text-slate-400 font-medium font-mono">
              ID: {profile?.admissionNo || 'ADM-2026-2153'}
            </span>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Personal Details */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3.5">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
            <User className="w-3.5 h-3.5 text-slate-450" />
            <span>Personal Information</span>
          </h4>
          <div className="space-y-3 text-xs text-slate-600 font-medium">
            <div className="flex justify-between items-center">
              <span>Full Name:</span>
              <strong className="text-slate-800 font-semibold">{user?.name}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> Email:
              </span>
              <strong className="text-slate-800 font-semibold truncate max-w-[200px]">{user?.email}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> DOB:
              </span>
              <strong className="text-slate-800 font-semibold">{profile?.dob ? new Date(profile.dob).toLocaleDateString('en-IN') : 'N/A'}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-slate-400" /> Blood Group:
              </span>
              <strong className="text-slate-800 font-semibold">O+ Positive</strong>
            </div>
          </div>
        </div>

        {/* Academic Details */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3.5">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
            <GraduationCap className="w-4 h-4 text-slate-450" />
            <span>Academic Records</span>
          </h4>
          <div className="space-y-3 text-xs text-slate-600 font-medium">
            <div className="flex justify-between items-center">
              <span>Class Allocation:</span>
              <strong className="text-slate-800 font-semibold">{classSection}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span>Admission Number:</span>
              <strong className="text-slate-800 font-mono tracking-wider">{profile?.admissionNo || 'ADM-2026-2153'}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span>Roll Number:</span>
              <strong className="text-slate-800 font-semibold">12</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" /> Status:
              </span>
              <strong className="text-emerald-700 font-bold uppercase text-[10px]">Active</strong>
            </div>
          </div>
        </div>

        {/* Guardian / Emergency Info */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3.5 md:col-span-2">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
            <Phone className="w-3.5 h-3.5 text-slate-450" />
            <span>Guardian & Contact Info</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600 font-medium">
            <div className="flex justify-between items-center bg-white/60 p-2.5 rounded border border-slate-200/50">
              <span>Parent / Guardian:</span>
              <strong className="text-slate-800 font-semibold">{profile?.parentName || 'N/A'}</strong>
            </div>
            <div className="flex justify-between items-center bg-white/60 p-2.5 rounded border border-slate-200/50">
              <span>Emergency Mobile:</span>
              <strong className="text-slate-850 font-mono font-semibold">{profile?.parentPhone || 'N/A'}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
