import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { useCandidateStore } from '../../store/candidateStore';
import type { ExperienceLevel } from '../../types';

const disciplines = [
  'UI/UX', 'Product Design', 'Graphic Design', 'Motion', 
  'Illustration', 'Brand', 'Industrial', '3D/Spatial'
];

const skillOptions = [
  'Figma', 'Sketch', 'Adobe XD', 'Illustrator', 'Photoshop', 'Prototyping',
  'User Research', 'Design Systems', 'Wireframing', 'Interaction Design', 'Typography',
  'Motion Design', 'HTML/CSS', 'Accessibility'
];

export function OnboardingWizard() {
  const navigate = useNavigate();
  const { candidate, updateCandidate } = useCandidateStore();
  const [step, setStep] = useState(1); // 1-indexed for the UI (1 to 6)
  const [draft, setDraft] = useState(candidate);

  const progress = (step / 6) * 100;

  function toggleArray(key: 'designDiscipline' | 'skills', value: string) {
    setDraft((current) => ({
      ...current,
      [key]: current[key].includes(value) 
        ? current[key].filter((item) => item !== value) 
        : [...current[key], value],
    }));
  }

  function handleRadio<K extends keyof typeof draft>(key: K, value: typeof draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function finish() {
    updateCandidate(draft);
    toast.success('Profile foundation saved.');
    navigate('/portfolio');
  }

  function renderStepContent() {
    switch (step) {
      case 1:
        return (
          <div className="space-y-5 animate-slide-up">
            <div>
              <label className="label" htmlFor="name">Full name</label>
              <input 
                id="name"
                className="field mt-1.5 bg-white" 
                value={draft.personalInfo.name} 
                onChange={(e) => setDraft({ ...draft, personalInfo: { ...draft.personalInfo, name: e.target.value } })} 
              />
            </div>
            <div>
              <label className="label" htmlFor="location">City, Country</label>
              <input 
                id="location"
                className="field mt-1.5 bg-white" 
                value={draft.personalInfo.location ?? ''} 
                onChange={(e) => setDraft({ ...draft, personalInfo: { ...draft.personalInfo, location: e.target.value } })} 
              />
            </div>
            <div>
              <label className="label" htmlFor="pronouns">Pronouns (optional)</label>
              <input 
                id="pronouns"
                placeholder="she/her, they/them..."
                className="field mt-1.5 bg-white" 
                // We don't have pronouns in the base schema, but let's just pretend for UI sake or store it in location/metadata if needed.
                // For this UI mockup, it's fine to just be an uncontrolled input if it's not strictly needed, or we add it to the draft state.
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-5 animate-slide-up">
            <div>
              <label className="label" htmlFor="degree">Degree / Program</label>
              <input 
                id="degree"
                placeholder="B.Des in Communication Design"
                className="field mt-1.5 bg-white" 
                value={draft.education[0]?.degree ?? ''} 
                onChange={(e) => setDraft({ ...draft, education: [{ ...(draft.education[0] ?? { institution: '', year: 2026 }), degree: e.target.value }] })} 
              />
            </div>
            <div>
              <label className="label" htmlFor="institution">Institution</label>
              <input 
                id="institution"
                placeholder="NID Ahmedabad"
                className="field mt-1.5 bg-white" 
                value={draft.education[0]?.institution ?? ''} 
                onChange={(e) => setDraft({ ...draft, education: [{ ...(draft.education[0] ?? { degree: '', year: 2026 }), institution: e.target.value }] })} 
              />
            </div>
            <div>
              <label className="label" htmlFor="year">Graduation year</label>
              <input 
                id="year"
                placeholder="2025 or In progress"
                className="field mt-1.5 bg-white" 
                value={draft.education[0]?.year ?? 2026} 
                onChange={(e) => setDraft({ ...draft, education: [{ ...(draft.education[0] ?? { institution: '', degree: '' }), year: Number(e.target.value) }] })} 
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="flex flex-wrap gap-2.5 animate-slide-up">
            {disciplines.map((discipline) => (
              <button 
                key={discipline} 
                type="button" 
                className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-micro ease-folio border ${
                  draft.designDiscipline.includes(discipline) 
                    ? 'border-indigo bg-indigo text-white shadow-glow' 
                    : 'border-chalk-200 bg-white text-navy hover:border-indigo hover:bg-indigo-50 hover:text-indigo'
                }`} 
                onClick={() => toggleArray('designDiscipline', discipline)}
              >
                {discipline}
              </button>
            ))}
          </div>
        );
      case 4:
        return (
          <div className="flex flex-wrap gap-2.5 animate-slide-up">
            {skillOptions.map((skill) => (
              <button 
                key={skill} 
                type="button" 
                className={`rounded-full px-4 py-2 text-sm transition-all duration-micro ease-folio border ${
                  draft.skills.includes(skill) 
                    ? 'border-indigo bg-indigo text-white shadow-glow' 
                    : 'border-chalk-200 bg-white text-navy/80 hover:border-indigo hover:bg-indigo-50 hover:text-indigo'
                }`} 
                onClick={() => toggleArray('skills', skill)}
              >
                {skill}
              </button>
            ))}
          </div>
        );
      case 5:
        return (
          <div className="grid gap-3 animate-slide-up">
            {['Internship', 'Freelance projects', 'Full-time role'].map((goal) => (
              <button 
                key={goal} 
                type="button" 
                className={`flex items-center justify-between rounded-xl border p-4 text-left transition-all duration-micro ease-folio ${
                  draft.careerGoals === goal 
                    ? 'border-indigo bg-indigo-50/50 shadow-soft' 
                    : 'border-chalk-200 bg-white hover:border-indigo-200 hover:bg-chalk-50'
                }`} 
                onClick={() => handleRadio('careerGoals', goal)}
              >
                <span className={`font-sans text-base ${draft.careerGoals === goal ? 'text-indigo font-medium' : 'text-navy'}`}>
                  {goal}
                </span>
                {draft.careerGoals === goal && (
                  <svg className="w-5 h-5 text-indigo" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        );
      case 6:
        return (
          <div className="grid gap-3 animate-slide-up">
            {[
              { id: 'student', label: 'Currently studying' },
              { id: 'entry', label: 'Fresh graduate (< 6 months)' },
              { id: '1-3yrs', label: '0-2 years experience' },
              { id: '3+yrs', label: '2+ years experience' }
            ].map((level) => (
              <button 
                key={level.id} 
                type="button" 
                className={`flex items-center justify-between rounded-xl border p-4 text-left transition-all duration-micro ease-folio ${
                  draft.experienceLevel === level.id 
                    ? 'border-indigo bg-indigo-50/50 shadow-soft' 
                    : 'border-chalk-200 bg-white hover:border-indigo-200 hover:bg-chalk-50'
                }`} 
                onClick={() => handleRadio('experienceLevel', level.id as ExperienceLevel)}
              >
                <span className={`font-sans text-base ${draft.experienceLevel === level.id ? 'text-indigo font-medium' : 'text-navy'}`}>
                  {level.label}
                </span>
                {draft.experienceLevel === level.id && (
                  <svg className="w-5 h-5 text-indigo" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        );
      default:
        return null;
    }
  }

  const stepMeta = [
    { meta: 'PERSONAL', title: 'Where are you based?' },
    { meta: 'EDUCATION', title: 'What’s your educational background?' },
    { meta: 'DISCIPLINE', title: 'Pick the discipline that matches most of your work.' },
    { meta: 'SKILLS', title: 'Select the tools and skills you work with.' },
    { meta: 'GOALS', title: 'What kind of work are you looking for?' },
    { meta: 'EXPERIENCE', title: 'What best describes your experience level?' },
  ];

  const currentMeta = stepMeta[step - 1];

  return (
    <main className="min-h-screen bg-chalk flex flex-col relative font-sans">
      {/* Top Progress Bar */}
      <div className="absolute top-0 left-0 h-1.5 w-full bg-chalk-200">
        <div 
          className="h-full bg-mint transition-all duration-500 ease-out" 
          style={{ width: `${progress}%` }} 
        />
      </div>

      {/* Header */}
      <header className="flex items-center justify-center py-6 px-8 relative">
        <div className="flex items-center gap-2">
          <span className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-indigo">
            <span className="absolute h-2 w-2 rounded-full bg-indigo opacity-25" />
            <span className="h-1 w-1 rounded-full bg-orange" />
          </span>
          <span className="font-serif text-xl tracking-tight text-navy">Folio</span>
        </div>
        <div className="absolute right-8 text-[11px] font-mono tracking-widest text-navy/40 uppercase">
          STEP {step} OF 6
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center pt-16 pb-12 px-6">
        <div className="w-full max-w-[500px]">
          <div className="mb-10 text-left animate-slide-up">
            <p className="text-[11px] font-mono tracking-widest text-navy/40 uppercase mb-3">
              {currentMeta.meta}
            </p>
            <h1 className="font-sans text-3xl font-medium text-navy tracking-tight">
              {currentMeta.title}
            </h1>
          </div>

          {renderStepContent()}

          <div className="mt-14 flex flex-row items-center justify-between border-t border-chalk-200/60 pt-6">
            {step > 1 ? (
              <button 
                type="button" 
                onClick={() => setStep(s => s - 1)}
                className="flex items-center text-sm font-medium text-navy/60 hover:text-navy transition-colors"
              >
                &lt; Back
              </button>
            ) : (
              <div /> // Spacer
            )}

            {step < 6 ? (
              <Button 
                type="button" 
                className="bg-indigo hover:bg-indigo-600 text-white px-8 rounded-lg"
                onClick={() => setStep(s => s + 1)}
              >
                Continue &gt;
              </Button>
            ) : (
              <Button 
                type="button" 
                className="bg-indigo hover:bg-indigo-600 text-white px-8 rounded-lg"
                onClick={finish}
              >
                Portfolio &gt;
              </Button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
