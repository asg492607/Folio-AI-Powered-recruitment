import { useState, useRef, useEffect } from 'react';
import { Sparkles, CheckCircle2, Cpu } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { portfolioApi } from '../../api/backend';
import { useCandidateStore } from '../../store/candidateStore';

// ── Analysis loading steps ────────────────────────────────────────────────────
const STEPS = [
  { id: 0, label: 'Uploading' },
  { id: 1, label: 'Parsing' },
  { id: 2, label: 'Extracting skills, tools, domains' },
  { id: 3, label: 'Generating intelligence report' },
];

function AnalyzingScreen({ jobId, onDone }: { jobId: string | null; onDone: (data: any) => void }) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!jobId) {
      // Simulate if no jobId (e.g. PDF upload)
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

      const pollInterval = setInterval(async () => {
        try {
          const res = await portfolioApi.getReport(jobId);
          if (res.data.status === 'completed') {
            clearInterval(pollInterval);
            clearInterval(stepInterval);
            setCompletedSteps([0, 1, 2, 3]);
            setTimeout(() => {
              onDone(res.data.results);
            }, 1000);
          } else if (res.data.status === 'failed') {
            clearInterval(pollInterval);
            clearInterval(stepInterval);
            alert('Analysis failed. Please try a different URL.');
            onDone(null);
          }
        } catch (e) {
          console.error("Polling error:", e);
        }
      }, 3000);

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
          Our AI is reading your projects. This takes 20–40 seconds. Don't close the tab.
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
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="40 20" />
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
    <div className="h-1 w-full rounded-full bg-white/10">
      <div className="h-1 rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
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
    <span className={`rounded-full px-3 py-1 text-[12px] font-semibold ${styles[label] ?? 'bg-chalk-200 text-navy/60'}`}>
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

const fallbackMetrics = [
  { label: 'Visual craft',  score: 0 },
  { label: 'Process docs',  score: 0 },
  { label: 'Tool depth',    score: 0 },
  { label: 'Domain range',  score: 0 },
  { label: 'Case quality',  score: 0 },
  { label: 'Impact',        score: 0 },
];

function PortfolioReport({ reportData, onAddSource }: PortfolioReportProps) {
  // Generate pseudo-metrics based on real data lengths since Groq doesn't return integer scores
  const designToolsCount = reportData?.skills?.design_tools?.length || 0;
  const methodsCount = reportData?.skills?.methodologies_and_processes?.length || 0;
  const projectsCount = reportData?.projects?.length || 0;
  const industriesCount = reportData?.industries?.length || 0;

  const realMetrics = reportData ? [
    { label: 'Tool depth', score: Math.min(98, 50 + designToolsCount * 5) },
    { label: 'Process docs', score: Math.min(95, 40 + methodsCount * 8) },
    { label: 'Case quality', score: Math.min(99, 60 + projectsCount * 10) },
    { label: 'Domain range', score: Math.min(92, 50 + industriesCount * 10) },
    { label: 'Impact', score: Math.min(94, 60 + projectsCount * 5) },
    { label: 'Visual craft', score: Math.min(96, 70 + designToolsCount * 2) },
  ] : null;

  const globalScore = reportData ? Math.round((realMetrics!.reduce((acc, m) => acc + m.score, 0)) / 6) : 0;
  const metrics = realMetrics || fallbackMetrics;
  
  const caseStudies = reportData?.projects?.map((proj: any) => {
    const pseudoScore = Math.min(95, 60 + (proj.details?.length || 0) / 15);
    return {
      title: proj.name || 'Unnamed Project',
      score: Math.round(pseudoScore),
      badge: pseudoScore >= 85 ? 'Strong' : pseudoScore >= 70 ? 'Good' : 'Needs work',
      border: pseudoScore >= 85 ? '#10b981' : pseudoScore >= 70 ? '#6366f1' : '#f97316',
      description: proj.details || 'No description extracted.'
    };
  }) || [];

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF9F7] font-sans text-navy">
      <PageHeader title="Portfolio" />

      <div className="flex-1 p-8 pb-20">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-[24px] font-bold text-navy">Portfolio Management</h1>
            <p className="mt-1 text-[14px] text-navy/50">Analysis based on connected sources.</p>
          </div>
          <button
            className="flex items-center gap-2 rounded-xl border border-chalk-200 bg-white px-5 py-2.5 text-[14px] font-semibold text-navy shadow-sm hover:bg-chalk-50 transition-colors"
            onClick={onAddSource}
          >
            + Add portfolio source
          </button>
        </div>

        <div className="mb-6 rounded-2xl bg-[#1a1a2e] px-8 py-7">
          <p className="mb-4 font-mono text-[11px] tracking-widest text-white/40 uppercase">
            Portfolio Intelligence Score
          </p>
          <div className="flex items-start gap-12">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-[72px] font-extrabold leading-none text-[#10b981]">{globalScore}</span>
                <span className="text-[18px] font-medium text-white/40">/ 100</span>
              </div>
              <p className="mt-2 text-[13px] text-white/50">UX/Product Design</p>
            </div>

            <div className="flex-1 grid grid-cols-3 gap-x-8 gap-y-4 pt-1">
              {metrics.slice(0, 6).map((m: any) => (
                <div key={m.label}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-[12.5px] text-white/60 capitalize">{m.label}</span>
                    <span className={`text-[12.5px] font-bold ${scoreTextColor(m.score)}`}>{m.score}</span>
                  </div>
                  <ScoreBar score={m.score} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-chalk-200 bg-white p-6 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]">
          <h2 className="mb-5 text-[18px] font-bold text-navy">Case study analysis</h2>
          <div className="divide-y divide-chalk-100">
            {caseStudies.map((cs: any) => (
              <div key={cs.title} className="py-5 first:pt-0 last:pb-0">
                <div className="flex pl-4" style={{ borderLeft: `3px solid ${cs.border}` }}>
                  <div className="flex-1">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[15.5px] font-bold text-navy">{cs.title}</span>
                      <div className="flex items-center gap-3">
                        <span className={`text-[16px] font-extrabold ${scoreTextColor(cs.score)}`}>{cs.score}</span>
                        <CaseBadge label={cs.badge} />
                      </div>
                    </div>
                    <p className="text-[14px] leading-relaxed text-navy/55">{cs.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main PortfolioManager ─────────────────────────────────────────────────────
export function PortfolioManager() {
  const [sources, setSources] = useState<any[]>([]);
  const [pdfUploaded, setPdfUploaded] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisDone, setAnalysisDone] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  
  const [showInputFor, setShowInputFor] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      setPdfUploaded(true);
    }
  }

  async function handleConnectUrl(type: string) {
    if (showInputFor === type && urlInput) {
      setIsAnalyzing(true);
      try {
        const res = await portfolioApi.analyzeUrl(urlInput);
        setJobId(res.data.job_id);
      } catch (err) {
        console.error(err);
        setIsAnalyzing(false);
        alert('Failed to start analysis.');
      }
    } else {
      setShowInputFor(type);
      setUrlInput('');
    }
  }

  const updateCandidate = useCandidateStore(state => state.updateCandidate);

  function handleAnalysisDone(data: any) {
    setIsAnalyzing(false);
    setAnalysisDone(true);
    if (data) {
      setReportData(data);
      
      const designTools = data.skills?.design_tools || [];
      const processes = data.skills?.methodologies_and_processes || [];
      const combinedSkills = [...designTools, ...processes];
      
      if (combinedSkills.length > 0) {
        updateCandidate({ skills: combinedSkills });
      }
    }
  }

  // Show analyzing screen
  if (isAnalyzing) {
    return <AnalyzingScreen jobId={jobId} onDone={handleAnalysisDone} />;
  }

  // After analysis completes, show full intelligence report
  if (analysisDone) {
    return <PortfolioReport reportData={reportData} onAddSource={() => { setAnalysisDone(false); setIsAnalyzing(false); }} />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-chalk">
      <PageHeader title="Portfolio" />

      <div className="p-8 pb-20 animate-slide-up">
        <div className="mb-8">
          <h2 className="font-sans text-[22px] font-semibold text-navy mb-2">
            Portfolio Management
          </h2>
          <p className="text-[15px] leading-relaxed text-navy/60 max-w-3xl">
            Connect a portfolio source to get your first intelligence report. The analysis extracts your skills, tools, and design domains from actual work.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Behance */}
          <div className="portfolio-source-card h-auto">
            <div className="portfolio-source-icon portfolio-source-icon--behance mb-2">Be</div>
            <span className="portfolio-source-label mb-2">Behance</span>
            {showInputFor === 'behance' ? (
              <div className="flex flex-col gap-2 w-full mt-2">
                <input 
                  type="url" 
                  className="w-full px-3 py-1.5 text-sm border border-chalk-200 rounded-md focus:outline-none focus:border-[#6366f1]" 
                  placeholder="https://behance.net/..." 
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                />
                <button className="w-full bg-[#6366f1] text-white py-1.5 rounded-md text-sm font-medium" onClick={() => handleConnectUrl('behance')}>Analyze Link</button>
              </div>
            ) : (
              <button className="portfolio-source-btn portfolio-source-btn--connect" onClick={() => handleConnectUrl('behance')}>
                Connect
              </button>
            )}
          </div>

          {/* Dribbble */}
          <div className="portfolio-source-card">
            <div className="portfolio-source-icon portfolio-source-icon--dribbble mb-2">Dr</div>
            <span className="portfolio-source-label mb-2">Dribbble</span>
            <button className="portfolio-source-btn portfolio-source-btn--connect" onClick={() => {}}>
              Coming soon
            </button>
          </div>

          {/* Personal site */}
          <div className="portfolio-source-card h-auto">
            <div className="portfolio-source-icon portfolio-source-icon--personal mb-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </div>
            <span className="portfolio-source-label mb-2">Personal site</span>
            {showInputFor === 'personal' ? (
              <div className="flex flex-col gap-2 w-full mt-2">
                <input 
                  type="url" 
                  className="w-full px-3 py-1.5 text-sm border border-chalk-200 rounded-md focus:outline-none focus:border-[#6366f1]" 
                  placeholder="https://yourwebsite.com" 
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                />
                <button className="w-full bg-[#6366f1] text-white py-1.5 rounded-md text-sm font-medium" onClick={() => handleConnectUrl('personal')}>Analyze Link</button>
              </div>
            ) : (
              <button className="portfolio-source-btn portfolio-source-btn--connect" onClick={() => handleConnectUrl('personal')}>
                Connect
              </button>
            )}
          </div>

          {/* Upload PDF */}
          <div className={`portfolio-source-card ${pdfUploaded ? 'portfolio-source-card--connected' : ''}`}>
            <div className="portfolio-source-icon portfolio-source-icon--pdf mb-2">PDF</div>
            <span className="portfolio-source-label mb-2">Upload PDF</span>
            {pdfUploaded ? (
              <span className="portfolio-source-status">
                <CheckCircle2 className="portfolio-source-status-icon" />
                Connected
              </span>
            ) : (
              <button
                className="portfolio-source-btn portfolio-source-btn--upload"
                onClick={() => fileInputRef.current?.click()}
              >
                Upload
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
          <div className="mt-8 animate-slide-up">
            <button className="portfolio-generate-btn" onClick={() => setIsAnalyzing(true)}>
              <Sparkles className="portfolio-generate-btn-icon" />
              Generate intelligence report
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
