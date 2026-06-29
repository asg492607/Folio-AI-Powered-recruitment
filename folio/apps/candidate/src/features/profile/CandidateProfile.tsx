import { useState } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { useCandidateStore } from '../../store/candidateStore';
import { Link } from 'react-router-dom';

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
  const [aboutMe, setAboutMe] = useState(candidate.aboutMe || '');

  // Keep local textarea in sync with store if the store updates (e.g. from AI report)
  const storeAbout = candidate.aboutMe || '';

  const name = candidate.personalInfo?.name || '';
  const initial = name.charAt(0)?.toUpperCase() || '?';

  const scrollTo = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="flex min-h-screen flex-col bg-chalk">
      <PageHeader title="Profile" />

      <div className="flex-1 flex flex-col pt-8 pb-20 animate-slide-up">
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
                {candidate.personalInfo?.avatarUrl ? (
                  <img
                    src={candidate.personalInfo.avatarUrl}
                    alt={name}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-navy text-2xl font-medium text-white">
                    {initial}
                  </div>
                )}
                <div>
                  {name ? (
                    <h1 className="text-xl font-medium text-navy mb-1">{name}</h1>
                  ) : (
                    <h1 className="text-xl font-medium text-navy/40 mb-1 italic">Name not set</h1>
                  )}
                  <p className="text-sm text-navy/60 mb-3">
                    {candidate.role.replace('_', ' ')}
                    {candidate.personalInfo?.location ? ` · ${candidate.personalInfo.location}` : ''}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(candidate.designDiscipline || []).map((tag: string) => (
                      <span key={tag} className="rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-medium text-indigo">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Profile Completion Ring */}
              <div className="relative flex h-[60px] w-[60px] items-center justify-center shrink-0">
                <svg className="absolute inset-0 h-full w-full -rotate-90 transform" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="none" className="stroke-chalk-200" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="16" fill="none"
                    className="stroke-mint" strokeWidth="3"
                    strokeDasharray={`${candidate.profileCompletionPercent}, 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="font-sans text-xs font-bold text-navy">{candidate.profileCompletionPercent}%</span>
              </div>
            </div>

            {/* Empty State Banner — guide users to analyze portfolio */}
            {candidate.profileCompletionPercent < 30 && (
              <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[14px] font-semibold text-indigo mb-1">Your profile is mostly empty</p>
                  <p className="text-[13px] text-navy/60">
                    Connect your portfolio to let our AI auto-fill your bio, skills, and projects in seconds.
                  </p>
                </div>
                <Link
                  to="/portfolio"
                  className="shrink-0 rounded-lg bg-indigo px-4 py-2 text-[13px] font-semibold text-white hover:bg-indigo-600 transition-colors"
                >
                  Add Portfolio →
                </Link>
              </div>
            )}

            {/* About Card */}
            <div id="about" className="rounded-xl bg-white p-8 shadow-sm border border-chalk-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-navy">About</h2>
                {!isEditingAbout && (
                  <button
                    onClick={() => {
                      setAboutMe(storeAbout);
                      setIsEditingAbout(true);
                    }}
                    className="text-sm font-medium text-indigo hover:text-indigo-700"
                  >
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
                    placeholder="Write a brief professional bio..."
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
              ) : storeAbout ? (
                <p className="text-[15px] leading-relaxed text-navy/80">{storeAbout}</p>
              ) : (
                <p className="text-[15px] text-navy/40 italic">
                  No bio yet. Click "Edit" to write one, or connect your portfolio to auto-fill.
                </p>
              )}
            </div>

            {/* Education Card */}
            <div id="education" className="rounded-xl bg-white p-8 shadow-sm border border-chalk-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium text-navy">Education</h2>
                <button className="text-sm font-medium text-indigo hover:text-indigo-700">Add</button>
              </div>
              {(candidate.education || []).length === 0 ? (
                <p className="text-sm text-navy/50 italic">No education added yet.</p>
              ) : (
                <div className="space-y-5">
                  {candidate.education.map((edu: any, i: number) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy text-white text-sm font-bold">
                        {edu.institution?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <h3 className="font-medium text-navy text-[15px]">{edu.degree}</h3>
                        <p className="text-sm text-navy/60">{edu.institution} · {edu.year}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Experience Card */}
            <div id="experience" className="rounded-xl bg-white p-8 shadow-sm border border-chalk-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium text-navy">Experience</h2>
                <button className="text-sm font-medium text-indigo hover:text-indigo-700">Add</button>
              </div>
              <div className="space-y-6">
                {(candidate.experience || []).length === 0 ? (
                  <p className="text-sm text-navy/50 italic">No experience added yet. Connect your portfolio to extract it automatically.</p>
                ) : (
                  candidate.experience.map((exp: any, index: number) => (
                    <div className="flex gap-4" key={index}>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy text-white font-medium">
                        {exp.company?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <h3 className="font-medium text-navy text-[15px]">{exp.title}</h3>
                        <p className="text-sm text-navy/60 mb-2.5">
                          {exp.company} · {exp.startDate || exp.duration} – {exp.endDate || 'Present'}
                        </p>
                        <p className="text-sm text-navy/80 leading-relaxed">{exp.description}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Skills Card */}
            <div id="skills" className="rounded-xl bg-white p-8 shadow-sm border border-chalk-200">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-medium text-navy">Skills</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {(candidate.skills || []).length === 0 ? (
                  <p className="text-sm text-navy/50 italic">No skills yet. Analyze your portfolio to extract them automatically.</p>
                ) : (
                  candidate.skills.map((skill: string) => (
                    <span key={skill} className="rounded-full border border-chalk-200 bg-white px-3 py-1.5 text-xs text-navy/70">
                      {skill}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Projects Card (auto-filled from portfolio) */}
            <div id="projects" className="rounded-xl bg-white p-8 shadow-sm border border-chalk-200">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-medium text-navy">Projects</h2>
              </div>
              {(candidate.projects || []).length === 0 ? (
                <p className="text-sm text-navy/50 italic">No projects yet. Analyze your portfolio to extract case studies automatically.</p>
              ) : (
                <div className="space-y-5">
                  {candidate.projects.map((proj: any, i: number) => (
                    <div key={i} className="border-l-2 border-indigo/20 pl-4">
                      <h3 className="font-semibold text-navy text-[15px] mb-1">{proj.title}</h3>
                      <p className="text-sm text-navy/70 leading-relaxed">{proj.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Certifications Card */}
            <div id="certifications" className="rounded-xl bg-white p-8 shadow-sm border border-chalk-200">
              <h2 className="text-lg font-medium text-navy mb-6">Certifications</h2>
              {(candidate.certifications || []).length === 0 ? (
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
              ) : (
                <div className="space-y-4">
                  {candidate.certifications.map((cert: any, i: number) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo text-xs font-bold">✓</div>
                      <div>
                        <p className="font-medium text-navy text-[14px]">{cert.name}</p>
                        <p className="text-sm text-navy/60">{cert.issuer} · {cert.year}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Achievements Card */}
            <div id="achievements" className="rounded-xl bg-white p-8 shadow-sm border border-chalk-200">
              <h2 className="text-lg font-medium text-navy mb-5">Achievements</h2>
              {(candidate.achievements || []).length === 0 ? (
                <p className="text-sm text-navy/50 italic">No achievements added yet.</p>
              ) : (
                <ul className="space-y-2">
                  {candidate.achievements.map((a: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-navy/80">
                      <span className="text-indigo mt-0.5">★</span> {a}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Portfolio Links Card */}
            <div id="portfolio" className="rounded-xl bg-white p-8 shadow-sm border border-chalk-200">
              <h2 className="text-lg font-medium text-navy mb-5">Portfolio Links</h2>
              {(candidate.portfolioLinks || []).length === 0 ? (
                <p className="text-sm text-navy/50 italic">No portfolio links. <Link to="/portfolio" className="text-indigo hover:underline">Connect your portfolio →</Link></p>
              ) : (
                <ul className="space-y-3">
                  {candidate.portfolioLinks.map((link: any, i: number) => (
                    <li key={i}>
                      <a href={link.url} target="_blank" rel="noreferrer" className="text-indigo text-sm hover:underline">
                        {link.type.charAt(0).toUpperCase() + link.type.slice(1)}: {link.url}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
