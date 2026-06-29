import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { db } from '@/services/firebase/db';

const cleanCommaString = (input: string): string[] => {
  return input
    .split(',')
    .map((s) => s.trim())
    .filter((val, idx, arr) => val !== '' && arr.indexOf(val) === idx);
};

export default function RecruiterProfilePage() {
  const { user, setRecruiterProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    fullName: user?.displayName || '',
    designation: 'Senior Recruiter',
    email: user?.email || '',
    phoneNumber: '',
    companyName: 'Folio Tech Solutions',
    companyWebsite: 'https://folio.com',
    companyLogo: '',
    industry: 'Fintech',
    companySize: '51-200 employees',
    officeLocation: 'Bengaluru, India',
    linkedinUrl: '',
    hiringDepartments: 'Engineering, Design, Product',
    preferredLocations: 'Bengaluru, Mumbai, Remote',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const validateStep = (currentStep: number) => {
    const next: Record<string, string> = {};
    if (currentStep === 1) {
      if (!form.fullName.trim()) next.fullName = 'Full Name is required.';
      if (!form.designation.trim()) next.designation = 'Designation is required.';
      if (!form.email.trim()) next.email = 'Email is required.';
      if (!form.phoneNumber.trim()) next.phoneNumber = 'Phone Number is required.';
    } else if (currentStep === 2) {
      if (!form.companyName.trim()) next.companyName = 'Company Name is required.';
      if (!form.companyWebsite.trim()) next.companyWebsite = 'Company Website is required.';
      if (!form.industry.trim()) next.industry = 'Industry is required.';
    } else if (currentStep === 3) {
      if (!form.officeLocation.trim()) next.officeLocation = 'Office Location is required.';
      if (!form.hiringDepartments.trim()) next.hiringDepartments = 'At least one hiring department is required.';
      if (!form.preferredLocations.trim()) next.preferredLocations = 'At least one preferred hiring location is required.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    setStep((s) => Math.max(1, s - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 4) {
      handleNext();
      return;
    }

    setErrors({});
    setIsSaving(true);

    try {
      const profileData = {
        userId: user?.id,
        ...form,
        hiringDepartments: cleanCommaString(form.hiringDepartments),
        preferredLocations: cleanCommaString(form.preferredLocations),
        updatedAt: new Date().toISOString(),
      };

      // Save using existing db service
      const saved = await db.collection('recruiterProfiles').addDoc(profileData);
      
      // Update global context state
      setRecruiterProfile(saved);
      
      // Redirect to Dashboard
      navigate('/');
    } catch (err) {
      console.error('Error saving profile:', err);
      setErrors({ submit: 'Failed to save profile. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const labelFontStyle = { fontFamily: '"DM Sans", system-ui, sans-serif' };
  
  // Progress calculations
  const progressPercent = (step / 4) * 100;

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <span className="text-[10px] font-mono tracking-widest text-[#6D6B8D] uppercase font-bold block mb-2">RECRUITER INFO</span>
            <h2 className="text-[32px] font-serif text-[#151633] font-bold leading-tight mb-8" style={labelFontStyle}>Tell us about yourself</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2" style={labelFontStyle}>Full name</label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className={`w-full bg-white border ${errors.fullName ? 'border-rose-300' : 'border-[#ECE8E2]'} rounded-xl px-4 py-3.5 text-[14px] text-[#151633] focus:outline-none focus:border-[#5B4FE9] transition duration-150`}
                  placeholder="Avni Sharma"
                />
                {errors.fullName && <p className="mt-1.5 text-[10px] text-rose-500 font-medium font-sans">{errors.fullName}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2" style={labelFontStyle}>Designation</label>
                <input
                  type="text"
                  value={form.designation}
                  onChange={(e) => setForm({ ...form, designation: e.target.value })}
                  className={`w-full bg-white border ${errors.designation ? 'border-rose-300' : 'border-[#ECE8E2]'} rounded-xl px-4 py-3.5 text-[14px] text-[#151633] focus:outline-none focus:border-[#5B4FE9] transition duration-150`}
                  placeholder="Senior Recruiter"
                />
                {errors.designation && <p className="mt-1.5 text-[10px] text-rose-500 font-medium font-sans">{errors.designation}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2" style={labelFontStyle}>Email address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={`w-full bg-white border ${errors.email ? 'border-rose-300' : 'border-[#ECE8E2]'} rounded-xl px-4 py-3.5 text-[14px] text-[#151633] focus:outline-none focus:border-[#5B4FE9] transition duration-150`}
                  placeholder="you@example.com"
                />
                {errors.email && <p className="mt-1.5 text-[10px] text-rose-500 font-medium font-sans">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2" style={labelFontStyle}>Phone number</label>
                <input
                  type="tel"
                  value={form.phoneNumber}
                  onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                  className={`w-full bg-white border ${errors.phoneNumber ? 'border-rose-300' : 'border-[#ECE8E2]'} rounded-xl px-4 py-3.5 text-[14px] text-[#151633] focus:outline-none focus:border-[#5B4FE9] transition duration-150`}
                  placeholder="+91 98765 43210"
                />
                {errors.phoneNumber && <p className="mt-1.5 text-[10px] text-rose-500 font-medium font-sans">{errors.phoneNumber}</p>}
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <span className="text-[10px] font-mono tracking-widest text-[#6D6B8D] uppercase font-bold block mb-2">COMPANY DETAILS</span>
            <h2 className="text-[32px] font-serif text-[#151633] font-bold leading-tight mb-8" style={labelFontStyle}>What's your company profile?</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2" style={labelFontStyle}>Company name</label>
                <input
                  type="text"
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  className={`w-full bg-white border ${errors.companyName ? 'border-rose-300' : 'border-[#ECE8E2]'} rounded-xl px-4 py-3.5 text-[14px] text-[#151633] focus:outline-none focus:border-[#5B4FE9] transition duration-150`}
                  placeholder="Razorpay"
                />
                {errors.companyName && <p className="mt-1.5 text-[10px] text-rose-500 font-medium font-sans">{errors.companyName}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2" style={labelFontStyle}>Company website</label>
                <input
                  type="url"
                  value={form.companyWebsite}
                  onChange={(e) => setForm({ ...form, companyWebsite: e.target.value })}
                  className={`w-full bg-white border ${errors.companyWebsite ? 'border-rose-300' : 'border-[#ECE8E2]'} rounded-xl px-4 py-3.5 text-[14px] text-[#151633] focus:outline-none focus:border-[#5B4FE9] transition duration-150`}
                  placeholder="https://razorpay.com"
                />
                {errors.companyWebsite && <p className="mt-1.5 text-[10px] text-rose-500 font-medium font-sans">{errors.companyWebsite}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2" style={labelFontStyle}>Company logo URL (optional)</label>
                <input
                  type="url"
                  value={form.companyLogo}
                  onChange={(e) => setForm({ ...form, companyLogo: e.target.value })}
                  className="w-full bg-white border border-[#ECE8E2] rounded-xl px-4 py-3.5 text-[14px] text-[#151633] focus:outline-none focus:border-[#5B4FE9] transition duration-150"
                  placeholder="https://example.com/logo.png"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2" style={labelFontStyle}>Industry</label>
                <input
                  type="text"
                  value={form.industry}
                  onChange={(e) => setForm({ ...form, industry: e.target.value })}
                  className={`w-full bg-white border ${errors.industry ? 'border-rose-300' : 'border-[#ECE8E2]'} rounded-xl px-4 py-3.5 text-[14px] text-[#151633] focus:outline-none focus:border-[#5B4FE9] transition duration-150`}
                  placeholder="Fintech / Software"
                />
                {errors.industry && <p className="mt-1.5 text-[10px] text-rose-500 font-medium font-sans">{errors.industry}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2" style={labelFontStyle}>Company size</label>
                <select
                  value={form.companySize}
                  onChange={(e) => setForm({ ...form, companySize: e.target.value })}
                  className="w-full bg-white border border-[#ECE8E2] rounded-xl px-4 py-3.5 text-[14px] text-[#151633] focus:outline-none focus:border-[#5B4FE9] transition duration-150 cursor-pointer"
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
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <span className="text-[10px] font-mono tracking-widest text-[#6D6B8D] uppercase font-bold block mb-2">SOURCING INFO</span>
            <h2 className="text-[32px] font-serif text-[#151633] font-bold leading-tight mb-8" style={labelFontStyle}>Where are you hiring?</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2" style={labelFontStyle}>Office location</label>
                <input
                  type="text"
                  value={form.officeLocation}
                  onChange={(e) => setForm({ ...form, officeLocation: e.target.value })}
                  className={`w-full bg-white border ${errors.officeLocation ? 'border-rose-300' : 'border-[#ECE8E2]'} rounded-xl px-4 py-3.5 text-[14px] text-[#151633] focus:outline-none focus:border-[#5B4FE9] transition duration-150`}
                  placeholder="Mumbai, India"
                />
                {errors.officeLocation && <p className="mt-1.5 text-[10px] text-rose-500 font-medium font-sans">{errors.officeLocation}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2" style={labelFontStyle}>LinkedIn profile URL (optional)</label>
                <input
                  type="url"
                  value={form.linkedinUrl}
                  onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
                  className="w-full bg-white border border-[#ECE8E2] rounded-xl px-4 py-3.5 text-[14px] text-[#151633] focus:outline-none focus:border-[#5B4FE9] transition duration-150"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2" style={labelFontStyle}>Hiring departments (comma-separated)</label>
                <input
                  type="text"
                  value={form.hiringDepartments}
                  onChange={(e) => setForm({ ...form, hiringDepartments: e.target.value })}
                  className={`w-full bg-white border ${errors.hiringDepartments ? 'border-rose-300' : 'border-[#ECE8E2]'} rounded-xl px-4 py-3.5 text-[14px] text-[#151633] focus:outline-none focus:border-[#5B4FE9] transition duration-150`}
                  placeholder="Engineering, Design, Product"
                />
                {errors.hiringDepartments && <p className="mt-1.5 text-[10px] text-rose-500 font-medium font-sans">{errors.hiringDepartments}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2" style={labelFontStyle}>Preferred hiring locations (comma-separated)</label>
                <input
                  type="text"
                  value={form.preferredLocations}
                  onChange={(e) => setForm({ ...form, preferredLocations: e.target.value })}
                  className={`w-full bg-white border ${errors.preferredLocations ? 'border-rose-300' : 'border-[#ECE8E2]'} rounded-xl px-4 py-3.5 text-[14px] text-[#151633] focus:outline-none focus:border-[#5B4FE9] transition duration-150`}
                  placeholder="Mumbai, Bengaluru, Remote"
                />
                {errors.preferredLocations && <p className="mt-1.5 text-[10px] text-rose-500 font-medium font-sans">{errors.preferredLocations}</p>}
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <span className="text-[10px] font-mono tracking-widest text-[#6D6B8D] uppercase font-bold block mb-2">REVIEW</span>
            <h2 className="text-[32px] font-serif text-[#151633] font-bold leading-tight mb-8" style={labelFontStyle}>Review your details</h2>
            <div className="space-y-6 bg-white border border-[#ECE8E2] rounded-2xl p-6 shadow-xs text-xs divide-y divide-[#ECE8E2]/60 text-brand-navy">
              <div className="pb-4">
                <h3 className="font-mono text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-2">Recruiter Info</h3>
                <div className="grid grid-cols-2 gap-y-2 font-sans text-xs">
                  <div><span className="text-slate-400 mr-1.5">Full Name:</span> <span className="font-bold">{form.fullName}</span></div>
                  <div><span className="text-slate-400 mr-1.5">Designation:</span> <span className="font-bold">{form.designation}</span></div>
                  <div><span className="text-slate-400 mr-1.5">Email:</span> <span className="font-bold text-slate-600">{form.email}</span></div>
                  <div><span className="text-slate-400 mr-1.5">Phone:</span> <span className="font-bold">{form.phoneNumber}</span></div>
                </div>
              </div>
              
              <div className="py-4">
                <h3 className="font-mono text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-2">Company Info</h3>
                <div className="grid grid-cols-2 gap-y-2 font-sans text-xs">
                  <div><span className="text-slate-400 mr-1.5">Company Name:</span> <span className="font-bold">{form.companyName}</span></div>
                  <div><span className="text-slate-400 mr-1.5">Website:</span> <span className="font-bold text-[#5B4FE9]">{form.companyWebsite}</span></div>
                  <div><span className="text-slate-400 mr-1.5">Industry:</span> <span className="font-bold">{form.industry}</span></div>
                  <div><span className="text-slate-400 mr-1.5">Size:</span> <span className="font-bold">{form.companySize}</span></div>
                </div>
              </div>
              
              <div className="pt-4">
                <h3 className="font-mono text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-2">Sourcing Preferences</h3>
                <div className="space-y-2 font-sans text-xs">
                  <div><span className="text-slate-400 mr-1.5">Office Location:</span> <span className="font-bold">{form.officeLocation}</span></div>
                  <div><span className="text-slate-400 mr-1.5">LinkedIn URL:</span> <span className="font-bold truncate max-w-[200px] inline-block">{form.linkedinUrl || 'Not specified'}</span></div>
                  <div><span className="text-slate-400 mr-1.5">Hiring Departments:</span> <span className="font-bold">{form.hiringDepartments}</span></div>
                  <div><span className="text-slate-400 mr-1.5">Preferred Locations:</span> <span className="font-bold">{form.preferredLocations}</span></div>
                </div>
              </div>
            </div>
            {errors.submit && (
              <div className="rounded-xl border border-rose-200 bg-rose-50/50 px-4 py-3 text-xs font-semibold text-rose-700">
                {errors.submit}
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F2EFEA] flex flex-col justify-between text-brand-navy">
      {/* Top Progress bar */}
      <div className="h-1.5 w-full bg-stone-200">
        <div 
          className="h-full bg-[#5B4FE9] transition-all duration-300 ease-out" 
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Onboarding Header */}
      <header className="px-8 py-5 border-b border-[#ECE8E2]/60 bg-white/60 backdrop-blur-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative flex h-8 w-8 items-center justify-center">
            {/* Outer Ring */}
            <div className="absolute inset-0 rounded-full border-[2.5px] border-[#5B4FE9]" />
            {/* Middle Circle */}
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#2b2864]">
              {/* Orange Dot */}
              <div className="h-2 w-2 rounded-full bg-[#FF6B35]" />
            </div>
          </div>
          <span className="text-lg tracking-wide text-[#151633]" style={{ fontFamily: "DM Serif Display" }}>
            <span>Fo</span>
            <span className="text-[#8B82FF]">lio</span>
          </span>
        </div>
        <span className="text-[10px] font-mono tracking-widest text-[#6D6B8D] uppercase font-bold">
          STEP {step} OF 4
        </span>
      </header>

      {/* Form Workspace Center */}
      <main className="flex-1 w-full max-w-xl mx-auto pt-12 pb-24 px-6 flex flex-col justify-center">
        <form onSubmit={handleSubmit} className="w-full">
          {renderStep()}

          {/* Navigation Controls Bar */}
          <div className="mt-12 pt-6 border-t border-[#ECE8E2]/60 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-700 transition cursor-pointer"
                style={labelFontStyle}
              >
                &lt; Back
              </button>
            ) : (
              <div />
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="bg-[#5B4FE9] hover:bg-[#4F42E3] text-white py-3.5 px-6 rounded-xl text-xs font-bold tracking-wider uppercase transition duration-150 cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
              style={labelFontStyle}
            >
              {isSaving ? 'Finishing...' : step === 4 ? 'Finish' : 'Continue >'}
            </button>
          </div>
        </form>
      </main>

      <footer className="py-4 text-center text-[10px] text-stone-400 border-t border-[#ECE8E2]/40 bg-stone-50/50">
        &copy; {new Date().getFullYear()} Folio Recruiter Workspace. All rights reserved.
      </footer>
    </div>
  );
}
