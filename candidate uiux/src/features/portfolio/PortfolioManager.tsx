import { useState, useRef, useEffect } from 'react';
import { Sparkles, CheckCircle2, Cpu } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';

// ── Analysis loading steps ────────────────────────────────────────────────────
const STEPS = [
  { id: 0, label: 'Uploading' },
  { id: 1, label: 'Parsing' },
  { id: 2, label: 'Extracting skills, tools, domains' },
  { id: 3, label: 'Generating intelligence report' },
];

function AnalyzingScreen({ onDone }: { onDone: () => void }) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    // Simulate each step completing with delays
    const timings = [1200, 2400, 4000, 6000];
    const timers: ReturnType<typeof setTimeout>[] = [];

    timings.forEach((delay, i) => {
      timers.push(
        setTimeout(() => {
          setCompletedSteps((prev) => [...prev, i]);
          if (i < STEPS.length - 1) {
            setActiveStep(i + 1);
          } else {
            // All done → tell parent after a brief pause
            setTimeout(onDone, 800);
          }
        }, delay)
      );
    });

    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF9F7] font-sans">
      <PageHeader title="Portfolio" />

      <div className="flex flex-1 flex-col items-center pt-16 px-6">
        {/* Spinning icon */}
        <div className="mb-7 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#ece9ff]">
          <Cpu
            className="h-[34px] w-[34px] text-[#6366f1] animate-[spin_2s_linear_infinite]"
            strokeWidth={1.8}
          />
        </div>

        <h2 className="mb-2 text-[22px] font-bold text-navy font-serif tracking-tight">
          Analyzing your portfolio
        </h2>
        <p className="mb-10 text-[15.5px] text-navy/50 font-medium">
          This takes 20–40 seconds. Don't close the tab.
        </p>

        {/* Steps */}
        <div className="w-full max-w-[540px] space-y-3">
          {STEPS.map((step) => {
            const isDone   = completedSteps.includes(step.id);
            const isActive = activeStep === step.id && !isDone;

            return (
              <div
                key={step.id}
                className={`flex items-center gap-4 rounded-xl px-5 py-4 transition-all ${
                  isActive ? 'bg-[#ece9ff]' : 'bg-transparent'
                }`}
              >
                {/* Step indicator */}
                {isDone ? (
                  <CheckCircle2
                    className="h-[22px] w-[22px] shrink-0 text-[#10b981]"
                    strokeWidth={2.5}
                  />
                ) : isActive ? (
                  /* Spinning circle */
                  <svg
                    className="h-[22px] w-[22px] shrink-0 animate-spin text-[#6366f1]"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12" cy="12" r="10"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeDasharray="40 20"
                    />
                  </svg>
                ) : (
                  <div className="h-[22px] w-[22px] shrink-0 rounded-full border-2 border-chalk-300 bg-transparent" />
                )}

                <span
                  className={`text-[15.5px] font-medium ${
                    isDone
                      ? 'text-[#10b981]'
                      : isActive
                      ? 'text-[#6366f1]'
                      : 'text-navy/40'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Bottom progress line */}
        <div className="mt-12 w-full max-w-[540px] h-0.5 rounded-full bg-chalk-200 overflow-hidden">
          <div
            className="h-full bg-[#6366f1] transition-all duration-700 ease-out"
            style={{ width: `${((completedSteps.length) / STEPS.length) * 100}%` }}
          />
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

// ── Case study badge ──────────────────────────────────────────────────────────
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

// ── Score colour text ─────────────────────────────────────────────────────────
function scoreTextColor(score: number) {
  if (score >= 80) return 'text-[#10b981]';
  if (score >= 65) return 'text-[#6366f1]';
  return 'text-[#f97316]';
}

// ── Portfolio Report ──────────────────────────────────────────────────────────
interface PortfolioReportProps {
  onAddSource: () => void;
}

const metrics = [
  { label: 'Visual craft',  score: 92 },
  { label: 'Process docs',  score: 68 },
  { label: 'Tool depth',    score: 85 },
  { label: 'Domain range',  score: 74 },
  { label: 'Case quality',  score: 81 },
  { label: 'Impact',        score: 63 },
];

const caseStudies = [
  {
    title: 'Razorpay Checkout Redesign',
    score: 91,
    badge: 'Strong',
    border: '#10b981',
    description: 'Clear problem framing, documented iteration rounds, and measurable outcomes. This case study raises your match score for fintech roles.',
  },
  {
    title: 'Cred Rewards Hub',
    score: 82,
    badge: 'Good',
    border: '#6366f1',
    description: 'Good visual craft but the process section ends at wireframes — showing final designs with rationale would strengthen this.',
  },
  {
    title: 'Internship Brand Project',
    score: 58,
    badge: 'Needs work',
    border: '#f97316',
    description: '2 of 4 case studies don\'t show your design process. Add wireframes or iteration steps to improve your UX match score.',
  },
  {
    title: 'Personal Dashboard Concept',
    score: 71,
    badge: 'Incomplete',
    border: '#a78bfa',
    description: 'No context for why this was designed or who it\'s for. Add a problem statement and user context.',
  },
];

function PortfolioReport({ onAddSource }: PortfolioReportProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[#FAF9F7] font-sans text-navy">
      <PageHeader title="Portfolio" />

      <div className="flex-1 p-8 pb-20">
        {/* Page heading row */}
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

        {/* Intelligence score banner */}
        <div className="mb-6 rounded-2xl bg-[#1a1a2e] px-8 py-7">
          <p className="mb-4 font-mono text-[11px] tracking-widest text-white/40 uppercase">
            Portfolio Intelligence Score
          </p>
          <div className="flex items-start gap-12">
            {/* Big score */}
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-[72px] font-extrabold leading-none text-[#10b981]">87</span>
                <span className="text-[18px] font-medium text-white/40">/ 100</span>
              </div>
              <p className="mt-2 text-[13px] text-white/50">UX/Product Design · Figma + Notion stack</p>
            </div>

            {/* Metric bars grid */}
            <div className="flex-1 grid grid-cols-3 gap-x-8 gap-y-4 pt-1">
              {metrics.map((m) => (
                <div key={m.label}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-[12.5px] text-white/60">{m.label}</span>
                    <span className={`text-[12.5px] font-bold ${scoreTextColor(m.score)}`}>{m.score}</span>
                  </div>
                  <ScoreBar score={m.score} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Case study analysis card */}
        <div className="rounded-2xl border border-chalk-200 bg-white p-6 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]">
          <h2 className="mb-5 text-[18px] font-bold text-navy">Case study analysis</h2>

          <div className="divide-y divide-chalk-100">
            {caseStudies.map((cs) => (
              <div key={cs.title} className="py-5 first:pt-0 last:pb-0">
                <div className="flex pl-4" style={{ borderLeft: `3px solid ${cs.border}` }}>
                  <div className="flex-1">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[15.5px] font-bold text-navy">{cs.title}</span>
                      <div className="flex items-center gap-3">
                        <span className={`text-[16px] font-extrabold ${scoreTextColor(cs.score)}`}>
                          {cs.score}
                        </span>
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
  const [pdfUploaded, setPdfUploaded] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisDone, setAnalysisDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      setPdfUploaded(true);
    }
  }

  function handleConnect() {
    setIsAnalyzing(true);
  }

  function handleAnalysisDone() {
    setIsAnalyzing(false);
    setAnalysisDone(true);
  }

  const hasConnectedSource = pdfUploaded;

  // Show analyzing screen
  if (isAnalyzing) {
    return <AnalyzingScreen onDone={handleAnalysisDone} />;
  }

  // After analysis completes, show full intelligence report
  if (analysisDone) {
    return <PortfolioReport onAddSource={() => { setAnalysisDone(false); setIsAnalyzing(false); }} />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-chalk">
      <PageHeader title="Portfolio" />

      <div className="p-8 pb-20 animate-slide-up">
        {/* Section heading */}
        <div className="mb-8">
          <h2 className="font-sans text-[22px] font-semibold text-navy mb-2">
            Portfolio Management
          </h2>
          <p className="text-[15px] leading-relaxed text-navy/60 max-w-3xl">
            Connect a portfolio source to get your first intelligence report. The analysis extracts your skills, tools, and design domains from actual work.
          </p>
        </div>

        {/* Source cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Behance */}
          <div className="portfolio-source-card">
            <div className="portfolio-source-icon portfolio-source-icon--behance">Be</div>
            <span className="portfolio-source-label">Behance</span>
            <button className="portfolio-source-btn portfolio-source-btn--connect" onClick={handleConnect}>
              Connect
            </button>
          </div>

          {/* Dribbble */}
          <div className="portfolio-source-card">
            <div className="portfolio-source-icon portfolio-source-icon--dribbble">Dr</div>
            <span className="portfolio-source-label">Dribbble</span>
            <button className="portfolio-source-btn portfolio-source-btn--connect" onClick={handleConnect}>
              Connect
            </button>
          </div>

          {/* Personal site */}
          <div className="portfolio-source-card">
            <div className="portfolio-source-icon portfolio-source-icon--personal">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </div>
            <span className="portfolio-source-label">Personal site</span>
            <button className="portfolio-source-btn portfolio-source-btn--connect" onClick={handleConnect}>
              Connect
            </button>
          </div>

          {/* Upload PDF */}
          <div className={`portfolio-source-card ${pdfUploaded ? 'portfolio-source-card--connected' : ''}`}>
            <div className="portfolio-source-icon portfolio-source-icon--pdf">PDF</div>
            <span className="portfolio-source-label">Upload PDF</span>
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

        {/* Generate intelligence report button */}
        {hasConnectedSource && (
          <div className="mt-8 animate-slide-up">
            <button className="portfolio-generate-btn" onClick={handleConnect}>
              <Sparkles className="portfolio-generate-btn-icon" />
              Generate intelligence report
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
