import { useState } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { useCandidateStore } from '../../store/candidateStore';

const SECTIONS = [
  { id: 'about', label: 'About' },
  { id: 'education', label: 'Education' },
  { id: 'experience', label: 'Experience' },
  { id: 'skills', label: 'Skills' },
  { id: 'certifications', label: 'Certifications' },
  { id: 'projects', label: 'Projects' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'portfolio', label: 'Portfolio Links' },
];

export function CandidateProfile() {
  const { candidate, updateCandidate } = useCandidateStore();
  const [activeSection, setActiveSection] = useState('about');
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [aboutMe, setAboutMe] = useState(candidate.aboutMe || 'Product designer with 2 years of experience in B2B SaaS. I care about design systems, information architecture, and making complex workflows feel simple.');

  const firstName = candidate.personalInfo.name.split(' ')[0] || 'Avni';
  const initial = firstName.charAt(0) || 'A';
  
  const scrollTo = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="flex min-h-screen flex-col bg-chalk">
      <PageHeader title="Profile" />

      <div className="flex-1 flex flex-col pt-8 pb-20 animate-slide-up">
        {/* Back navigation */}
        <div className="px-8 mb-6">
          <button className="text-sm font-medium text-navy/60 hover:text-navy transition-colors flex items-center gap-1.5">
            <span className="text-lg leading-none mb-0.5">‹</span> Dashboard
          </button>
        </div>

        <div className="flex flex-col lg:flex-row px-8 gap-10">
          
          {/* Left Sticky Sub-Nav */}
          <aside className="hidden lg:block w-48 shrink-0">
            <nav className="sticky top-8 flex flex-col gap-1">
              {SECTIONS.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollTo(section.id)}
                  className={`text-left px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeSection === section.id 
                      ? 'bg-indigo-50 text-indigo' 
                      : 'text-navy/60 hover:text-navy hover:bg-chalk-50'
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Right Main Content */}
          <div className="flex-1 max-w-3xl space-y-6">
            
            {/* Header Card */}
            <div className="rounded-xl bg-white p-8 shadow-sm border border-chalk-200 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-navy text-2xl font-medium text-white">
                  {initial}
                </div>
                <div>
                  <h1 className="text-xl font-medium text-navy mb-1">{candidate.personalInfo.name || 'Avni Sharma'}</h1>
                  <p className="text-sm text-navy/60 mb-3">Product Designer · Mumbai, India</p>
                  <div className="flex gap-2">
                    {['UI/UX', 'Product Design', 'Design Systems'].map(tag => (
                      <span key={tag} className="rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-medium text-indigo">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="relative flex h-[60px] w-[60px] items-center justify-center shrink-0">
                <svg className="absolute inset-0 h-full w-full -rotate-90 transform" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="none" className="stroke-chalk-200" strokeWidth="3" />
                  <circle cx="18" cy="18" r="16" fill="none" className="stroke-mint" strokeWidth="3" strokeDasharray="100" strokeDashoffset="25" strokeLinecap="round" />
                </svg>
                <span className="font-sans text-xs font-bold text-navy">75%</span>
              </div>
            </div>

            {/* About Card */}
            <div id="about" className="rounded-xl bg-white p-8 shadow-sm border border-chalk-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-navy">About</h2>
                {!isEditingAbout && (
                  <button onClick={() => setIsEditingAbout(true)} className="text-sm font-medium text-indigo hover:text-indigo-700">
                    Edit
                  </button>
                )}
              </div>
              {isEditingAbout ? (
                <div className="animate-slide-up">
                  <textarea 
                    className="w-full rounded-lg border border-chalk-200 p-4 text-sm text-navy focus:border-indigo focus:ring-1 focus:ring-indigo outline-none min-h-[120px] mb-4"
                    value={aboutMe}
                    onChange={(e) => setAboutMe(e.target.value)}
                  />
                  <div className="flex gap-3">
                    <button 
                      onClick={() => {
                        updateCandidate({ aboutMe });
                        setIsEditingAbout(false);
                      }}
                      className="rounded-lg bg-indigo px-5 py-2 text-sm font-medium text-white hover:bg-indigo-600 transition-colors"
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => setIsEditingAbout(false)}
                      className="rounded-lg px-5 py-2 text-sm font-medium text-navy/70 hover:text-navy hover:bg-chalk-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-[15px] leading-relaxed text-navy/80">
                  {aboutMe}
                </p>
              )}
            </div>

            {/* Experience Card */}
            <div id="experience" className="rounded-xl bg-white p-8 shadow-sm border border-chalk-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium text-navy">Experience</h2>
                <button className="text-sm font-medium text-indigo hover:text-indigo-700">Add</button>
              </div>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy text-white font-medium">R</div>
                  <div>
                    <h3 className="font-medium text-navy text-[15px]">Product Designer</h3>
                    <p className="text-sm text-navy/60 mb-2.5">Razorpay · Jan 2024 – Present</p>
                    <p className="text-sm text-navy/80 leading-relaxed">
                      Working on checkout and payment flows. Reduced checkout drop-off by 18% through a redesigned error recovery system.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy text-white font-medium">C</div>
                  <div>
                    <h3 className="font-medium text-navy text-[15px]">Design Intern</h3>
                    <p className="text-sm text-navy/60 mb-2.5">Cred · Jun 2023 – Dec 2023</p>
                    <p className="text-sm text-navy/80 leading-relaxed">
                      Contributed to the Rewards Hub redesign. Conducted 12 user interviews and produced the design system component library.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills Card */}
            <div id="skills" className="rounded-xl bg-white p-8 shadow-sm border border-chalk-200">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-medium text-navy">Skills</h2>
                <button className="text-sm font-medium text-indigo hover:text-indigo-700">Edit</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {['Figma', 'Prototyping', 'Design Systems', 'User Research', 'Wireframing', 'Interaction Design', 'Adobe XD', 'HTML/CSS'].map(skill => (
                  <span key={skill} className="rounded-full border border-chalk-200 bg-white px-3 py-1.5 text-xs text-navy/70">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Certifications Card */}
            <div id="certifications" className="rounded-xl bg-white p-8 shadow-sm border border-chalk-200">
              <h2 className="text-lg font-medium text-navy mb-6">Certifications</h2>
              <div className="flex flex-col items-center justify-center py-8">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <p className="text-sm text-navy/60 mb-4">No certifications added. Add one to strengthen your profile.</p>
                <button className="flex items-center gap-1.5 rounded-lg border border-chalk-200 px-4 py-2 text-sm font-medium text-navy hover:bg-chalk-50 transition-colors shadow-soft">
                  <span className="text-lg leading-none -mt-0.5">+</span> Add certification
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
