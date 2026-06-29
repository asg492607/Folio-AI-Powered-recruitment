import React, { useState } from 'react';
import { X, User, Building, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';
import { db } from '@/services/firebase/db';

interface RecruiterProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const cleanCommaString = (input: string): string[] => {
  return input
    .split(',')
    .map((s) => s.trim())
    .filter((val, idx, arr) => val !== '' && arr.indexOf(val) === idx);
};

export default function RecruiterProfileModal({ isOpen, onClose }: RecruiterProfileModalProps) {
  const { recruiterProfile, setRecruiterProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'recruiter' | 'company' | 'hiring'>('recruiter');

  const [form, setForm] = useState({
    fullName: recruiterProfile?.fullName || '',
    designation: recruiterProfile?.designation || '',
    email: recruiterProfile?.email || '',
    phoneNumber: recruiterProfile?.phoneNumber || '',
    linkedinUrl: recruiterProfile?.linkedinUrl || '',
    companyName: recruiterProfile?.companyName || '',
    companyWebsite: recruiterProfile?.companyWebsite || '',
    companyLogo: recruiterProfile?.companyLogo || '',
    industry: recruiterProfile?.industry || '',
    companySize: recruiterProfile?.companySize || '51-200 employees',
    officeLocation: recruiterProfile?.officeLocation || '',
    hiringDepartments: Array.isArray(recruiterProfile?.hiringDepartments) ? recruiterProfile.hiringDepartments.join(', ') : '',
    preferredLocations: Array.isArray(recruiterProfile?.preferredLocations) ? recruiterProfile.preferredLocations.join(', ') : '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.fullName.trim()) next.fullName = 'Full Name is required.';
    if (!form.designation.trim()) next.designation = 'Designation is required.';
    if (!form.email.trim()) next.email = 'Email is required.';
    if (!form.phoneNumber.trim()) next.phoneNumber = 'Phone Number is required.';
    if (!form.companyName.trim()) next.companyName = 'Company Name is required.';
    if (!form.companyWebsite.trim()) next.companyWebsite = 'Company Website is required.';
    if (!form.industry.trim()) next.industry = 'Industry is required.';
    if (!form.officeLocation.trim()) next.officeLocation = 'Office Location is required.';
    if (!form.hiringDepartments.trim()) next.hiringDepartments = 'Hiring Departments are required.';
    if (!form.preferredLocations.trim()) next.preferredLocations = 'Preferred Locations are required.';
    return next;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Automatically switch to the tab containing the first error
      if (validationErrors.fullName || validationErrors.designation || validationErrors.email || validationErrors.phoneNumber) {
        setActiveTab('recruiter');
      } else if (validationErrors.companyName || validationErrors.companyWebsite || validationErrors.industry) {
        setActiveTab('company');
      } else if (validationErrors.officeLocation || validationErrors.hiringDepartments || validationErrors.preferredLocations) {
        setActiveTab('hiring');
      }
      return;
    }

    setErrors({});
    setIsSaving(true);

    try {
      const updatedData = {
        ...form,
        hiringDepartments: cleanCommaString(form.hiringDepartments),
        preferredLocations: cleanCommaString(form.preferredLocations),
        updatedAt: new Date().toISOString(),
      };

      if (recruiterProfile?.id) {
        // Update using existing db service
        await db.collection('recruiterProfiles').updateDoc(recruiterProfile.id, updatedData);
        setRecruiterProfile({ ...recruiterProfile, ...updatedData });
      } else {
        // Fallback create
        const saved = await db.collection('recruiterProfiles').addDoc(updatedData);
        setRecruiterProfile(saved);
      }
      onClose();
    } catch (err) {
      console.error('Error updating profile:', err);
      setErrors({ submit: 'Failed to update profile. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const labelFontStyle = { fontFamily: '"DM Sans", system-ui, sans-serif' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-2xl rounded-2xl bg-[#FAF9F7] p-8 shadow-2xl animate-slide-up text-brand-navy max-h-[90vh] overflow-y-auto border border-[#ECE8E2]">
        
        {/* Modal Header */}
        <div className="flex justify-between items-start mb-6 border-b border-[#ECE8E2] pb-4">
          <div>
            <h2 className="text-xl font-bold font-serif" style={labelFontStyle}>Edit Recruiter Profile</h2>
            <p className="text-[10px] mt-0.5 folio-meta text-[#6D6B8D] uppercase tracking-wider font-bold">Update workspace details</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-stone-100 rounded-full transition cursor-pointer"
          >
            <X className="h-5 w-5 text-stone-500" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 border-b border-[#ECE8E2] pb-4 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('recruiter')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              activeTab === 'recruiter' 
                ? 'bg-brand-navy text-white shadow-xs' 
                : 'bg-white text-stone-600 border border-[#ECE8E2] hover:bg-stone-50'
            }`}
            style={labelFontStyle}
          >
            <User className="h-3.5 w-3.5" />
            Recruiter Info
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('company')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              activeTab === 'company' 
                ? 'bg-brand-navy text-white shadow-xs' 
                : 'bg-white text-stone-600 border border-[#ECE8E2] hover:bg-stone-50'
            }`}
            style={labelFontStyle}
          >
            <Building className="h-3.5 w-3.5" />
            Company Info
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('hiring')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              activeTab === 'hiring' 
                ? 'bg-brand-navy text-white shadow-xs' 
                : 'bg-white text-stone-600 border border-[#ECE8E2] hover:bg-stone-50'
            }`}
            style={labelFontStyle}
          >
            <MapPin className="h-3.5 w-3.5" />
            Hiring Info
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {activeTab === 'recruiter' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2" style={labelFontStyle}>Full Name</label>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className={`w-full bg-white border ${errors.fullName ? 'border-rose-300' : 'border-[#ECE8E2]'} rounded-xl px-4 py-3 text-[14px] text-brand-navy`}
                  />
                  {errors.fullName && <p className="mt-1 text-[10px] text-rose-500 font-medium font-sans">{errors.fullName}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2" style={labelFontStyle}>Designation</label>
                  <input
                    type="text"
                    value={form.designation}
                    onChange={(e) => setForm({ ...form, designation: e.target.value })}
                    className={`w-full bg-white border ${errors.designation ? 'border-rose-300' : 'border-[#ECE8E2]'} rounded-xl px-4 py-3 text-[14px] text-brand-navy`}
                  />
                  {errors.designation && <p className="mt-1 text-[10px] text-rose-500 font-medium font-sans">{errors.designation}</p>}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2" style={labelFontStyle}>Email Address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={`w-full bg-white border ${errors.email ? 'border-rose-300' : 'border-[#ECE8E2]'} rounded-xl px-4 py-3 text-[14px] text-brand-navy`}
                  />
                  {errors.email && <p className="mt-1 text-[10px] text-rose-500 font-medium font-sans">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2" style={labelFontStyle}>Phone Number</label>
                  <input
                    type="tel"
                    value={form.phoneNumber}
                    onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                    className={`w-full bg-white border ${errors.phoneNumber ? 'border-rose-300' : 'border-[#ECE8E2]'} rounded-xl px-4 py-3 text-[14px] text-brand-navy`}
                  />
                  {errors.phoneNumber && <p className="mt-1 text-[10px] text-rose-500 font-medium font-sans">{errors.phoneNumber}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2" style={labelFontStyle}>LinkedIn Profile URL (Optional)</label>
                <input
                  type="url"
                  value={form.linkedinUrl}
                  onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
                  className="w-full bg-white border border-[#ECE8E2] rounded-xl px-4 py-3 text-[14px] text-brand-navy"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
            </div>
          )}

          {activeTab === 'company' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2" style={labelFontStyle}>Company Name</label>
                  <input
                    type="text"
                    value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    className={`w-full bg-white border ${errors.companyName ? 'border-rose-300' : 'border-[#ECE8E2]'} rounded-xl px-4 py-3 text-[14px] text-brand-navy`}
                  />
                  {errors.companyName && <p className="mt-1 text-[10px] text-rose-500 font-medium font-sans">{errors.companyName}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2" style={labelFontStyle}>Company Website</label>
                  <input
                    type="url"
                    value={form.companyWebsite}
                    onChange={(e) => setForm({ ...form, companyWebsite: e.target.value })}
                    className={`w-full bg-white border ${errors.companyWebsite ? 'border-rose-300' : 'border-[#ECE8E2]'} rounded-xl px-4 py-3 text-[14px] text-brand-navy`}
                  />
                  {errors.companyWebsite && <p className="mt-1 text-[10px] text-rose-500 font-medium font-sans">{errors.companyWebsite}</p>}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2" style={labelFontStyle}>Industry</label>
                  <input
                    type="text"
                    value={form.industry}
                    onChange={(e) => setForm({ ...form, industry: e.target.value })}
                    className={`w-full bg-white border ${errors.industry ? 'border-rose-300' : 'border-[#ECE8E2]'} rounded-xl px-4 py-3 text-[14px] text-brand-navy`}
                  />
                  {errors.industry && <p className="mt-1 text-[10px] text-rose-500 font-medium font-sans">{errors.industry}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2" style={labelFontStyle}>Company Size</label>
                  <select
                    value={form.companySize}
                    onChange={(e) => setForm({ ...form, companySize: e.target.value })}
                    className="w-full bg-white border border-[#ECE8E2] rounded-xl px-4 py-3 text-[14px] text-brand-navy cursor-pointer"
                  >
                    <option value="1-10 employees">1-10 employees</option>
                    <option value="11-50 employees">11-50 employees</option>
                    <option value="51-200 employees">51-200 employees</option>
                    <option value="201-500 employees">201-500 employees</option>
                    <option value="501-1000 employees">501-1000 employees</option>
                    <option value="1000+ employees">1000+ employees</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2" style={labelFontStyle}>Company Logo URL (Optional)</label>
                <input
                  type="url"
                  value={form.companyLogo}
                  onChange={(e) => setForm({ ...form, companyLogo: e.target.value })}
                  className="w-full bg-white border border-[#ECE8E2] rounded-xl px-4 py-3 text-[14px] text-brand-navy"
                  placeholder="https://example.com/logo.png"
                />
              </div>
            </div>
          )}

          {activeTab === 'hiring' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2" style={labelFontStyle}>Office Location</label>
                <input
                  type="text"
                  value={form.officeLocation}
                  onChange={(e) => setForm({ ...form, officeLocation: e.target.value })}
                  className={`w-full bg-white border ${errors.officeLocation ? 'border-rose-300' : 'border-[#ECE8E2]'} rounded-xl px-4 py-3 text-[14px] text-brand-navy`}
                />
                {errors.officeLocation && <p className="mt-1 text-[10px] text-rose-500 font-medium font-sans">{errors.officeLocation}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2" style={labelFontStyle}>Hiring Departments (Comma-separated)</label>
                <input
                  type="text"
                  value={form.hiringDepartments}
                  onChange={(e) => setForm({ ...form, hiringDepartments: e.target.value })}
                  className={`w-full bg-white border ${errors.hiringDepartments ? 'border-rose-300' : 'border-[#ECE8E2]'} rounded-xl px-4 py-3 text-[14px] text-brand-navy`}
                  placeholder="Engineering, Design, Marketing"
                />
                {errors.hiringDepartments && <p className="mt-1 text-[10px] text-rose-500 font-medium font-sans">{errors.hiringDepartments}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2" style={labelFontStyle}>Preferred Hiring Locations (Comma-separated)</label>
                <input
                  type="text"
                  value={form.preferredLocations}
                  onChange={(e) => setForm({ ...form, preferredLocations: e.target.value })}
                  className={`w-full bg-white border ${errors.preferredLocations ? 'border-rose-300' : 'border-[#ECE8E2]'} rounded-xl px-4 py-3 text-[14px] text-brand-navy`}
                  placeholder="Mumbai, Remote, Bengaluru"
                />
                {errors.preferredLocations && <p className="mt-1 text-[10px] text-rose-500 font-medium font-sans">{errors.preferredLocations}</p>}
              </div>
            </div>
          )}

          {errors.submit && (
            <div className="rounded-xl border border-rose-200 bg-rose-50/50 px-4 py-3 text-xs font-semibold text-rose-700">
              {errors.submit}
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="mt-8 flex justify-end gap-3 border-t border-[#ECE8E2] pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#ECE8E2] px-5 py-2.5 text-xs font-bold hover:bg-stone-50 cursor-pointer transition bg-white"
              style={labelFontStyle}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="button-primary px-6 py-2.5 text-xs font-bold hover:bg-[#FF6B35] cursor-pointer transition disabled:opacity-50"
              style={labelFontStyle}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
