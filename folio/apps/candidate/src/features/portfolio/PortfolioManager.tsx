import { useState, useRef, useEffect } from 'react';
import { Sparkles, CheckCircle2, Cpu, Briefcase, ShieldCheck, Check, Target, Rocket, RefreshCw, Plus } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { portfolioApi } from '../../api/backend';
import { useCandidateStore } from '../../store/candidateStore';
import { useNotificationStore } from '../../store/notificationStore';

// ── Analysis loading steps ────────────────────────────────────────────────────
const STEPS = [
  { id: 0, label: 'Connecting to Portfolio Source' },
  { id: 1, label: 'Parsing Profile & Case Studies' },
  { id: 2, label: 'Extracting Skills, Tools & Artifacts' },
  { id: 3, label: 'Synthesizing Intelligence Report' },
];

function AnalyzingScreen({ jobId, onDone }: { jobId: string | null; onDone: (data: any) => void }) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!jobId) {
      // Local fallback animation if no background jobId
      const timings = [1200, 2400, 4000, 6000];
      const timers: ReturnType<typeof setTimeout>[] = [];

      timings.forEach((delay, i) => {
        timers.push(
          setTimeout(() => {
            setCompletedSteps((prev) => [...prev, i]);
            if (i < STEPS.length - 1) {
              setActiveStep(i + 1);
            } else {
              setTimeout(() => onDone(null), 800);
            }
          }, delay)
        );
      });

      return () => timers.forEach(clearTimeout);
    } else {
      // Poll the real backend
      let stepIndex = 0;
      const stepInterval = setInterval(() => {
        if (stepIndex < 3) {
          setCompletedSteps((prev) => Array.from(new Set([...prev, stepIndex])));
          setActiveStep(stepIndex + 1);
          stepIndex++;
        }
      }, 2000);

      let pollCount = 0;
      const MAX_POLLS = 30;

      const pollInterval = setInterval(async () => {
        try {
          pollCount++;
          if (pollCount > MAX_POLLS) {
            clearInterval(pollInterval);
            clearInterval(stepInterval);
            console.error('Polling timeout reached.');
            alert('Analysis timed out. Please try again later.');
            onDone(null);
            return;
          }

          const res = await portfolioApi.getReport(jobId);
          if (res.data.status === 'completed') {
            clearInterval(pollInterval);
            clearInterval(stepInterval);
            setCompletedSteps([0, 1, 2, 3]);
            setTimeout(() => {
              onDone(res.data.results);
            }, 800);
          } else if (res.data.status === 'failed' || res.data.status === 'error') {
            clearInterval(pollInterval);
            clearInterval(stepInterval);
            console.error('Analysis status:', res.data.status, res.data);
            alert('Analysis failed. Please verify the URL is publicly accessible or upload a PDF.');
            onDone(null);
          }
        } catch (e) {
          console.error("Polling error:", e);
        }
      }, 2500);

      return () => {
        clearInterval(pollInterval);
        clearInterval(stepInterval);
      };
    }
  }, [jobId, onDone]);

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF9F7] font-sans">
      <PageHeader title="Portfolio" />

      <div className="flex flex-1 flex-col items-center pt-16 px-6">
        <div className="mb-7 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#ece9ff]">
          <Cpu className="h-[34px] w-[34px] text-[#6366f1] animate-[spin_2s_linear_infinite]" strokeWidth={1.8} />
        </div>

        <h2 className="mb-2 text-[22px] font-bold text-navy font-serif tracking-tight">
          Analyzing your portfolio
        </h2>
        <p className="mb-10 text-[15.5px] text-navy/50 font-medium">
          Our AI is reading your projects, case studies, and artifacts. This takes 15–30 seconds.
        </p>

        <div className="w-full max-w-[540px] space-y-3">
          {STEPS.map((step) => {
            const isDone = completedSteps.includes(step.id);
            const isActive = activeStep === step.id && !isDone;

            return (
              <div
                key={step.id}
                className={`flex items-center gap-4 rounded-xl px-5 py-4 transition-all ${
                  isActive ? 'bg-[#ece9ff]' : 'bg-transparent'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="h-[22px] w-[22px] shrink-0 text-[#10b981]" strokeWidth={2.5} />
                ) : isActive ? (
                  <svg className="h-[22px] w-[22px] shrink-0 animate-spin text-[#6366f1]" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="40 20" />
                  </svg>
                ) : (
                  <div className="h-[22px] w-[22px] shrink-0 rounded-full border-2 border-chalk-300 bg-transparent" />
                )}
                <span className={`text-[15.5px] font-medium ${isDone ? 'text-[#10b981]' : isActive ? 'text-[#6366f1]' : 'text-navy/40'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Score bar helper ──────────────────────────────────────────────────────────
function ScoreBar({ score, max = 100 }: { score: number; max?: number }) {
  const pct = (score / max) * 100;
  const color = score >= 80 ? '#10b981' : score >= 65 ? '#6366f1' : '#f97316';
  return (
    <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
      <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  );
}

function CaseBadge({ label }: { label: string }) {
  const styles: Record<string, string> = {
    Strong:     'bg-[#d1fae5] text-[#059669]',
    Good:       'bg-[#ccfbf1] text-[#0d9488]',
    'Needs work': 'bg-[#ffedd5] text-[#ea580c]',
    Incomplete: 'bg-[#ede9fe] text-[#7c3aed]',
  };
  return (
    <span className={`rounded-full px-3 py-0.5 text-[12px] font-semibold ${styles[label] ?? 'bg-chalk-200 text-navy/60'}`}>
      {label}
    </span>
  );
}

function scoreTextColor(score: number) {
  if (score >= 80) return 'text-[#10b981]';
  if (score >= 65) return 'text-[#6366f1]';
  return 'text-[#f97316]';
}

// ── Portfolio Report ──────────────────────────────────────────────────────────
interface PortfolioReportProps {
  reportData: any;
  onAddSource: () => void;
}

function PortfolioReport({ reportData, onAddSource }: PortfolioReportProps) {
  const designToolsCount = reportData?.skills?.design_tools?.length || 0;
  const methodsCount = reportData?.skills?.methodologies_and_processes?.length || 0;
  const projectsCount = reportData?.projects?.length || 0;
  const industriesCount = reportData?.industries?.length || 0;

  const realMetrics = reportData ? [
    { label: 'Tool depth', score: Math.min(98, Math.max(40, 40 + designToolsCount * 6)) },
    { label: 'Process docs', score: Math.min(95, Math.max(35, 35 + methodsCount * 8)) },
    { label: 'Case quality', score: Math.min(99, Math.max(45, 45 + projectsCount * 12)) },
    { label: 'Domain range', score: Math.min(92, Math.max(40, 40 + industriesCount * 10)) },
    { label: 'Impact', score: Math.min(94, Math.max(45, 45 + (projectsCount > 0 ? 15 : 0) + (reportData?.strengths?.length || 0) * 5)) },
    { label: 'Visual craft', score: Math.min(98, Math.max(50, 50 + designToolsCount * 4)) },
  ] : [
    { label: 'Visual craft',  score: 0 },
    { label: 'Process docs',  score: 0 },
    { label: 'Tool depth',    score: 0 },
    { label: 'Domain range',  score: 0 },
    { label: 'Case quality',  score: 0 },
    { label: 'Impact',        score: 0 },
  ];

  const globalScore = reportData ? Math.round((realMetrics.reduce((acc, m) => acc + m.score, 0)) / 6) : 0;
  
  const caseStudies = reportData?.projects?.map((proj: any) => {
    const pseudoScore = Math.min(98, 60 + (proj.details?.length || proj.description?.length || 0) / 25 + (proj.outcomes ? 10 : 0));
    return {
      title: proj.name || proj.title || 'Portfolio Case Study',
      type: proj.type || '',
      role: proj.role || '',
      client_or_organization: proj.client_or_organization || '',
      timeline: proj.timeline || '',
      team_size: proj.team_size || '',
      score: Math.round(pseudoScore),
      badge: pseudoScore >= 85 ? 'Strong' : pseudoScore >= 70 ? 'Good' : 'Needs work',
      border: pseudoScore >= 85 ? '#10b981' : pseudoScore >= 70 ? '#6366f1' : '#f97316',
      description: proj.details || proj.description || 'Project extracted from portfolio content.',
      challenges: proj.challenges || '',
      outcomes: proj.outcomes || '',
      tools: Array.isArray(proj.technologies) ? proj.technologies : (Array.isArray(proj.tools) ? proj.tools : []),
      images: Array.isArray(proj.images) ? proj.images : []
    };
  }) || [];

  const artifactsFound = reportData?.design_artifacts?.artifacts_found || [];
  const targetRoles = reportData?.target_roles || [];
  const industries = reportData?.industries || [];
  const strengths = reportData?.strengths || [];

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF9F7] font-sans text-navy">
      <PageHeader title="Portfolio" />

      <div className="flex-1 p-4 sm:p-8 pb-20 max-w-5xl mx-auto w-full space-y-6">
        {/* Header with Title & Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[22px] sm:text-[26px] font-bold text-navy font-serif">Portfolio Intelligence</h1>
            <p className="mt-1 text-[13.5px] sm:text-[14px] text-navy/60">
              Deep analysis synthesized from connected candidate sources ({caseStudies.length} {caseStudies.length === 1 ? 'project' : 'projects'} extracted).
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 sm:px-5 py-2 sm:py-2.5 text-[13.5px] sm:text-[14px] font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors shrink-0 cursor-pointer"
              onClick={onAddSource}
            >
              <Plus className="w-4 h-4" />
              Add Source
            </button>
            <button
              className="flex items-center gap-2 rounded-xl border border-chalk-200 bg-white px-4 sm:px-5 py-2 sm:py-2.5 text-[13.5px] sm:text-[14px] font-semibold text-navy shadow-sm hover:bg-chalk-50 transition-colors shrink-0 cursor-pointer"
              onClick={onAddSource}
            >
              <RefreshCw className="w-4 h-4 text-navy/60" />
              Re-analyze
            </button>
          </div>
        </div>

        {/* Candidate Profile Header Card */}
        {reportData?.full_name && (
          <div className="rounded-2xl border border-chalk-200 bg-white p-5 sm:p-6 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-[20px] sm:text-[22px] font-bold text-navy">{reportData.full_name}</h2>
                  {reportData?.candidate_id && (
                    <span className="rounded bg-chalk-100 px-2 py-0.5 font-mono text-[11px] font-medium text-navy/50">
                      {reportData.candidate_id}
                    </span>
                  )}
                </div>
                {reportData?.headline && (
                  <p className="text-[14px] font-medium text-indigo-600 mt-0.5">
                    {reportData.headline}
                  </p>
                )}
              </div>

              {/* Target Roles */}
              {targetRoles.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
                  <span className="text-[11.5px] font-semibold uppercase tracking-wider text-navy/40 mr-1 flex items-center gap-1">
                    <Target className="w-3.5 h-3.5" /> Target Roles:
                  </span>
                  {targetRoles.map((r: string) => (
                    <span key={r} className="rounded-full bg-indigo-50 border border-indigo-100 px-3 py-1 text-[12px] font-semibold text-indigo-700">
                      {r}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Strengths & Industries row */}
            {(strengths.length > 0 || industries.length > 0) && (
              <div className="mt-4 pt-4 border-t border-chalk-100 flex flex-wrap gap-4 text-[13px]">
                {industries.length > 0 && (
                  <div className="flex items-center gap-1.5 text-navy/70">
                    <span className="font-semibold text-navy/40 text-[11.5px] uppercase">Industries:</span>
                    <span className="font-medium">{industries.join(', ')}</span>
                  </div>
                )}
                {strengths.length > 0 && (
                  <div className="flex items-center gap-1.5 text-navy/70">
                    <span className="font-semibold text-navy/40 text-[11.5px] uppercase">Core Strengths:</span>
                    <span className="font-medium">{strengths.join(' • ')}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Intelligence Score Banner */}
        <div className="rounded-2xl bg-[#1a1a2e] p-5 sm:p-8 text-white">
          <p className="mb-3 sm:mb-4 font-mono text-[10.5px] sm:text-[11px] tracking-widest text-white/40 uppercase">
            Portfolio Intelligence Score
          </p>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-12">
            <div className="shrink-0">
              <div className="flex items-baseline gap-2">
                <span className="text-[52px] sm:text-[72px] font-extrabold leading-none text-[#10b981]">{globalScore}</span>
                <span className="text-[16px] sm:text-[18px] font-medium text-white/40">/ 100</span>
              </div>
              <p className="mt-1.5 sm:mt-2 text-[12.5px] sm:text-[13px] text-white/70 font-medium">
                {reportData?.headline || reportData?.target_roles?.[0] || 'Candidate Intelligence'}
              </p>
            </div>

            <div className="w-full flex-1 grid grid-cols-2 sm:grid-cols-3 gap-x-4 sm:gap-x-8 gap-y-3 sm:gap-y-4 pt-1 border-t md:border-t-0 border-white/10 pt-4 md:pt-0">
              {realMetrics.slice(0, 6).map((m: any) => (
                <div key={m.label} className="min-w-0">
                  <div className="mb-1 flex items-center justify-between gap-1">
                    <span className="text-[11.5px] sm:text-[12.5px] text-white/60 capitalize truncate">{m.label}</span>
                    <span className={`text-[11.5px] sm:text-[12.5px] font-bold ${scoreTextColor(m.score)}`}>{m.score}</span>
                  </div>
                  <ScoreBar score={m.score} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Executive Summary Card */}
        {reportData?.summary && (
          <div className="rounded-2xl border border-chalk-200 bg-white p-5 sm:p-6 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)]">
            <h2 className="mb-2.5 text-[16.5px] sm:text-[18px] font-bold text-navy flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              Executive Summary
            </h2>
            <p className="text-[14px] sm:text-[14.5px] leading-relaxed text-navy/70 font-normal">
              {reportData.summary}
            </p>
            
            {/* Skills Taxonomy Breakdown */}
            <div className="mt-5 pt-4 border-t border-chalk-100 space-y-3">
              {(reportData?.skills?.design_tools?.length > 0 || (reportData?.tools && reportData.tools.length > 0)) && (
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-navy/40 block mb-1.5">
                    Tools & Technologies
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {Array.from(new Set([...(reportData?.skills?.design_tools || []), ...(reportData?.tools || [])])).map((t: any) => (
                      <span key={t} className="rounded-md bg-indigo-50/80 border border-indigo-100 px-2.5 py-1 text-[12px] font-semibold text-indigo-700">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {reportData?.skills?.methodologies_and_processes?.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-navy/40 block mb-1.5">
                    Methodologies & Processes
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {reportData.skills.methodologies_and_processes.map((m: string) => (
                      <span key={m} className="rounded-md bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-[12px] font-semibold text-emerald-700">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {reportData?.skills?.soft_skills?.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-navy/40 block mb-1.5">
                    Soft Skills & Leadership
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {reportData.skills.soft_skills.map((s: string) => (
                      <span key={s} className="rounded-md bg-amber-50 border border-amber-100 px-2.5 py-1 text-[12px] font-semibold text-amber-700">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Design Artifacts Verification Audit */}
        {artifactsFound.length > 0 && (
          <div className="rounded-2xl border border-chalk-200 bg-white p-5 sm:p-6 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)]">
            <h2 className="mb-3 text-[16.5px] sm:text-[18px] font-bold text-navy flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Verified Artifacts
            </h2>
            <div className="flex flex-wrap gap-2">
              {artifactsFound.map((art: string) => (
                <div key={art} className="flex items-center gap-1.5 rounded-lg bg-emerald-50/80 border border-emerald-200/80 px-3 py-1.5 text-[12.5px] font-semibold text-emerald-800">
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                  <span className="capitalize">{art}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Case Studies Breakdown */}
        <div className="rounded-2xl border border-chalk-200 bg-white p-5 sm:p-6 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)]">
          <div className="mb-4 sm:mb-6 flex items-center justify-between">
            <h2 className="text-[16.5px] sm:text-[18px] font-bold text-navy flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              Project Analysis ({caseStudies.length})
            </h2>
            <span className="text-[12px] text-navy/50 font-medium">Deep AI Extraction</span>
          </div>

          <div className="divide-y divide-chalk-100">
            {caseStudies.length > 0 ? caseStudies.map((cs: any) => (
              <div key={cs.title} className="py-6 first:pt-0 last:pb-0">
                <div className="pl-4 sm:pl-5 space-y-3" style={{ borderLeft: `3.5px solid ${cs.border}` }}>
                  {/* Title and Badge Row */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[16px] sm:text-[17px] font-bold text-navy">{cs.title}</span>
                        {cs.type && (
                          <span className="rounded bg-indigo-50 border border-indigo-100/80 px-2 py-0.5 text-[11.5px] font-medium text-indigo-700">
                            {cs.type}
                          </span>
                        )}
                      </div>
                      {cs.role && (
                        <p className="text-[13px] text-navy/60 font-medium mt-0.5">
                          {cs.role} {cs.client_or_organization ? `• ${cs.client_or_organization}` : ''}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                      <span className={`text-[16px] sm:text-[17px] font-extrabold ${scoreTextColor(cs.score)}`}>{cs.score}</span>
                      <CaseBadge label={cs.badge} />
                    </div>
                  </div>

                  {/* Project Details / Scope */}
                  {cs.description && (
                    <p className="text-[13.5px] sm:text-[14px] leading-relaxed text-navy/70">
                      {cs.description}
                    </p>
                  )}

                  {/* Challenges Section */}
                  {cs.challenges && (
                    <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3.5 text-[13px] text-slate-800">
                      <span className="font-semibold text-slate-900 block mb-0.5">Key Challenge & Solution:</span>
                      <p className="leading-relaxed text-slate-700">{cs.challenges}</p>
                    </div>
                  )}

                  {/* Outcomes / Impact Section */}
                  {cs.outcomes && (
                    <div className="rounded-xl bg-emerald-50/80 border border-emerald-200/70 p-3.5 text-[13px] text-emerald-900">
                      <span className="font-semibold text-emerald-950 block mb-0.5 flex items-center gap-1.5">
                        <Rocket className="w-3.5 h-3.5 text-emerald-600" /> Key Impact & Deliverables:
                      </span>
                      <p className="leading-relaxed text-emerald-800">{cs.outcomes}</p>
                    </div>
                  )}

                  {/* Project Technologies */}
                  {cs.tools && cs.tools.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] font-bold text-navy/40 uppercase tracking-wider mr-1">Tools & Stack:</span>
                      {cs.tools.map((t: string) => (
                        <span key={t} className="rounded bg-chalk-100 border border-chalk-200/60 px-2 py-0.5 text-[11.5px] font-medium text-navy/75">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )) : (
              <p className="py-4 text-[13.5px] text-navy/50">No projects extracted from this portfolio.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main PortfolioManager ─────────────────────────────────────────────────────
export function PortfolioManager() {
  const candidate = useCandidateStore(state => state.candidate);
  const updateCandidate = useCandidateStore(state => state.updateCandidate);
  
  const pdfUploaded = candidate.portfolioLinks.some(link => link.type === 'pdf');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisDone, setAnalysisDone] = useState(!!candidate.lastPortfolioReport);
  const [jobId, setJobId] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(candidate.lastPortfolioReport || null);
  
  const [showInputFor, setShowInputFor] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (candidate.lastPortfolioReport && !reportData) {
      setReportData(candidate.lastPortfolioReport);
      setAnalysisDone(true);
    }
  }, [candidate.lastPortfolioReport]);

  function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedPdfFile(file);
      const otherLinks = candidate.portfolioLinks.filter(l => l.type !== 'pdf');
      updateCandidate({
        portfolioLinks: [...otherLinks, { type: 'pdf', url: file.name }]
      });
    }
  }

  async function handleGenerateReport() {
    if (selectedPdfFile) {
      setIsAnalyzing(true);
      try {
        const formData = new FormData();
        formData.append('file', selectedPdfFile);
        const res = await portfolioApi.analyzePdf(formData);
        if (res.data && res.data.job_id) {
          setJobId(res.data.job_id);
        } else if (res.data) {
          handleAnalysisDone(res.data);
        }
      } catch (err: any) {
        console.error('PDF analysis error:', err);
        setIsAnalyzing(false);
        const msg = err.response?.data?.detail || 'Failed to analyze PDF. Please check backend connection.';
        alert(msg);
      }
    } else {
      setIsAnalyzing(true);
    }
  }

  async function handleConnectUrl(type: string) {
    if (showInputFor === type && urlInput.trim()) {
      setIsAnalyzing(true);
      try {
        let finalUrl = urlInput.trim();
        if (type === 'linkedin' && !finalUrl.includes('linkedin.com') && !finalUrl.startsWith('http')) {
          finalUrl = `https://linkedin.com/in/${finalUrl.replace(/^@/, '')}`;
        } else if (type === 'behance' && !finalUrl.includes('behance.net') && !finalUrl.startsWith('http')) {
          finalUrl = `https://behance.net/${finalUrl.replace(/^@/, '')}`;
        } else if (type === 'dribbble' && !finalUrl.includes('dribbble.com') && !finalUrl.startsWith('http')) {
          finalUrl = `https://dribbble.com/${finalUrl.replace(/^@/, '')}`;
        } else if (type === 'figma' && !finalUrl.includes('figma.com') && !finalUrl.startsWith('http')) {
          finalUrl = `https://figma.com/${finalUrl.replace(/^@/, '')}`;
        } else if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
          finalUrl = `https://${finalUrl}`;
        }

        const res = await portfolioApi.analyzeUrl(finalUrl);
        if (res.data && res.data.job_id) {
          setJobId(res.data.job_id);
        } else if (res.data) {
          handleAnalysisDone(res.data);
        }
      } catch (err: any) {
        console.error(err);
        setIsAnalyzing(false);
        const msg = err.response?.data?.detail || 'Failed to start portfolio analysis. Please verify the URL.';
        alert(msg);
      }
    } else {
      setShowInputFor(type);
      setUrlInput('');
    }
  }

  const applyPortfolioReport = useCandidateStore(state => state.applyPortfolioReport);
  const pushNotification = useNotificationStore(state => state.pushNotification);

  function handleAnalysisDone(data: any) {
    setIsAnalyzing(false);
    setAnalysisDone(true);
    if (data) {
      setReportData(data);
      applyPortfolioReport(data);
      pushNotification({
        type: 'profile_suggestion',
        message: 'Portfolio analysis complete! Your profile has been updated with extracted skills and case studies.',
        linkTo: '/profile',
      });
    }
  }

  // Show analyzing screen
  if (isAnalyzing) {
    return <AnalyzingScreen jobId={jobId} onDone={handleAnalysisDone} />;
  }

  // After analysis completes, show full intelligence report
  if (analysisDone) {
    return (
      <PortfolioReport 
        reportData={reportData} 
        onAddSource={() => { setAnalysisDone(false); setIsAnalyzing(false); }} 
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF9F7]">
      <PageHeader title="Portfolio" />

      <div className="p-8 pb-20 max-w-6xl mx-auto w-full animate-slide-up">
        <div className="mb-8">
          <h2 className="font-serif text-[26px] font-bold text-navy mb-2">
            Portfolio Management
          </h2>
          <p className="text-[15px] leading-relaxed text-navy/65 max-w-3xl">
            Connect your candidate sources (LinkedIn, Behance, Dribbble, Figma, personal portfolio, or PDF deck) to generate a comprehensive intelligence report. The analysis extracts your real skills, tools, and project case studies.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
          {/* LinkedIn */}
          <div className="portfolio-source-card h-auto bg-white rounded-2xl p-5 border border-chalk-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="portfolio-source-icon mb-3 flex items-center justify-center rounded-xl bg-[#0a66c2] text-white p-2 h-11 w-11">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.25c-.9 0-1.63.73-1.63 1.63s.73 1.63 1.63 1.63 1.63-.73 1.63-1.63-.73-1.63-1.63-1.63Z" />
                </svg>
              </div>
              <span className="portfolio-source-label text-[16px] font-bold text-navy block mb-1">LinkedIn</span>
              <p className="text-[12.5px] text-navy/55 mb-4">Profile history, roles & portfolio footprints</p>
            </div>
            {showInputFor === 'linkedin' ? (
              <div className="flex flex-col gap-2 w-full mt-2">
                <input 
                  type="url" 
                  className="w-full px-3 py-2 text-sm border border-blue-200 rounded-lg focus:outline-none focus:border-[#0a66c2]" 
                  placeholder="https://linkedin.com/in/username" 
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                />
                <button className="w-full bg-[#0a66c2] text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm" onClick={() => handleConnectUrl('linkedin')}>Analyze Profile</button>
              </div>
            ) : (
              <button className="w-full py-2 px-3 rounded-lg border border-[#0a66c2]/30 text-[#0a66c2] font-semibold text-sm hover:bg-[#0a66c2] hover:text-white transition-all shadow-sm" onClick={() => handleConnectUrl('linkedin')}>
                Connect LinkedIn
              </button>
            )}
          </div>

          {/* Behance */}
          <div className="portfolio-source-card h-auto bg-white rounded-2xl p-5 border border-chalk-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="portfolio-source-icon mb-3 flex items-center justify-center rounded-xl bg-[#0057ff] text-white p-2 font-bold text-lg h-11 w-11">
                Be
              </div>
              <span className="portfolio-source-label text-[16px] font-bold text-navy block mb-1">Behance</span>
              <p className="text-[12.5px] text-navy/55 mb-4">Gallery projects, visual craft & case studies</p>
            </div>
            {showInputFor === 'behance' ? (
              <div className="flex flex-col gap-2 w-full mt-2">
                <input 
                  type="url" 
                  className="w-full px-3 py-2 text-sm border border-indigo-200 rounded-lg focus:outline-none focus:border-[#0057ff]" 
                  placeholder="https://behance.net/username" 
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                />
                <button className="w-full bg-[#0057ff] text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm" onClick={() => handleConnectUrl('behance')}>Analyze Behance</button>
              </div>
            ) : (
              <button className="w-full py-2 px-3 rounded-lg border border-[#0057ff]/30 text-[#0057ff] font-semibold text-sm hover:bg-[#0057ff] hover:text-white transition-all shadow-sm" onClick={() => handleConnectUrl('behance')}>
                Connect Behance
              </button>
            )}
          </div>

          {/* Dribbble */}
          <div className="portfolio-source-card h-auto bg-white rounded-2xl p-5 border border-chalk-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="portfolio-source-icon mb-3 flex items-center justify-center rounded-xl bg-[#ea4c89] text-white p-2 font-bold text-lg h-11 w-11">
                Dr
              </div>
              <span className="portfolio-source-label text-[16px] font-bold text-navy block mb-1">Dribbble</span>
              <p className="text-[12.5px] text-navy/55 mb-4">UI shots, animations & visual design work</p>
            </div>
            {showInputFor === 'dribbble' ? (
              <div className="flex flex-col gap-2 w-full mt-2">
                <input 
                  type="url" 
                  className="w-full px-3 py-2 text-sm border border-pink-200 rounded-lg focus:outline-none focus:border-[#ea4c89]" 
                  placeholder="https://dribbble.com/username" 
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                />
                <button className="w-full bg-[#ea4c89] text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#d83777] transition-colors shadow-sm" onClick={() => handleConnectUrl('dribbble')}>Analyze Dribbble</button>
              </div>
            ) : (
              <button className="w-full py-2 px-3 rounded-lg border border-[#ea4c89]/30 text-[#ea4c89] font-semibold text-sm hover:bg-[#ea4c89] hover:text-white transition-all shadow-sm" onClick={() => handleConnectUrl('dribbble')}>
                Connect Dribbble
              </button>
            )}
          </div>

          {/* Figma */}
          <div className="portfolio-source-card h-auto bg-white rounded-2xl p-5 border border-chalk-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="portfolio-source-icon mb-3 flex items-center justify-center rounded-xl bg-[#a259ff] text-white p-2 font-bold text-lg h-11 w-11">
                <svg width="20" height="20" viewBox="0 0 38 57" fill="currentColor">
                  <path d="M19 28.5C19 23.2533 23.2533 19 28.5 19C33.7467 19 38 23.2533 38 28.5C38 33.7467 33.7467 38 28.5 38C23.2533 38 19 33.7467 19 28.5Z"/>
                  <path d="M0 47.5C0 42.2533 4.25329 38 9.5 38H19V47.5C19 52.7467 14.7467 57 9.5 57C4.25329 57 0 52.7467 0 47.5Z"/>
                  <path d="M19 0V19H28.5C33.7467 19 38 14.7467 38 9.5C38 4.25329 33.7467 0 28.5 0H19Z"/>
                  <path d="M0 9.5C0 14.7467 4.25329 19 9.5 19H19V0H9.5C4.25329 0 0 4.25329 0 9.5Z"/>
                  <path d="M0 28.5C0 33.7467 4.25329 38 9.5 38H19V19H9.5C4.25329 19 0 23.2533 0 28.5Z"/>
                </svg>
              </div>
              <span className="portfolio-source-label text-[16px] font-bold text-navy block mb-1">Figma</span>
              <p className="text-[12.5px] text-navy/55 mb-4">Design systems, token libraries & prototypes</p>
            </div>
            {showInputFor === 'figma' ? (
              <div className="flex flex-col gap-2 w-full mt-2">
                <input 
                  type="url" 
                  className="w-full px-3 py-2 text-sm border border-purple-200 rounded-lg focus:outline-none focus:border-[#a259ff]" 
                  placeholder="https://figma.com/file/..." 
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                />
                <button className="w-full bg-[#a259ff] text-white py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors shadow-sm" onClick={() => handleConnectUrl('figma')}>Analyze Figma</button>
              </div>
            ) : (
              <button className="w-full py-2 px-3 rounded-lg border border-[#a259ff]/30 text-[#a259ff] font-semibold text-sm hover:bg-[#a259ff] hover:text-white transition-all shadow-sm" onClick={() => handleConnectUrl('figma')}>
                Connect Figma
              </button>
            )}
          </div>

          {/* Personal Portfolio */}
          <div className="portfolio-source-card h-auto bg-white rounded-2xl p-5 border border-chalk-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="portfolio-source-icon mb-3 flex items-center justify-center rounded-xl bg-[#6366f1] text-white p-2 h-11 w-11">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              </div>
              <span className="portfolio-source-label text-[16px] font-bold text-navy block mb-1">Personal Portfolio</span>
              <p className="text-[12.5px] text-navy/55 mb-4">Custom domain, Framer, Webflow, or Bento</p>
            </div>
            {showInputFor === 'personal' ? (
              <div className="flex flex-col gap-2 w-full mt-2">
                <input 
                  type="url" 
                  className="w-full px-3 py-2 text-sm border border-indigo-200 rounded-lg focus:outline-none focus:border-[#6366f1]" 
                  placeholder="https://yourportfolio.com" 
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                />
                <button className="w-full bg-[#6366f1] text-white py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm" onClick={() => handleConnectUrl('personal')}>Analyze Portfolio</button>
              </div>
            ) : (
              <button className="w-full py-2 px-3 rounded-lg border border-[#6366f1]/30 text-[#6366f1] font-semibold text-sm hover:bg-[#6366f1] hover:text-white transition-all shadow-sm" onClick={() => handleConnectUrl('personal')}>
                Connect Website
              </button>
            )}
          </div>

          {/* Upload PDF */}
          <div className={`portfolio-source-card h-auto bg-white rounded-2xl p-5 border shadow-sm flex flex-col justify-between ${pdfUploaded ? 'border-emerald-300 bg-emerald-50/20' : 'border-chalk-200'}`}>
            <div>
              <div className="portfolio-source-icon mb-3 flex items-center justify-center rounded-xl bg-[#f43f5e] text-white p-2 font-bold text-sm h-11 w-11">
                PDF
              </div>
              <span className="portfolio-source-label text-[16px] font-bold text-navy block mb-1">PDF Portfolio</span>
              <p className="text-[12.5px] text-navy/55 mb-4">Case study decks & presentation portfolios</p>
            </div>
            {pdfUploaded ? (
              <span className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-100 text-emerald-800 text-sm font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Uploaded
              </span>
            ) : (
              <button
                className="w-full py-2 px-3 rounded-lg border border-[#f43f5e]/30 text-[#f43f5e] font-semibold text-sm hover:bg-[#f43f5e] hover:text-white transition-all shadow-sm"
                onClick={() => fileInputRef.current?.click()}
              >
                Upload PDF Deck
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="sr-only"
              onChange={handlePdfUpload}
            />
          </div>
        </div>

        {pdfUploaded && (
          <div className="mt-8 animate-slide-up flex justify-center">
            <button className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 text-[15px] font-bold text-white shadow-lg hover:bg-indigo-700 transition-all hover:shadow-indigo-200" onClick={handleGenerateReport}>
              <Sparkles className="w-5 h-5 text-amber-300" />
              Generate Intelligence Report
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
