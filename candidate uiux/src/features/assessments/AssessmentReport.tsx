import { ChevronLeft } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';

interface Dimension {
  label: string;
  score: number;
}

const dimensions: Dimension[] = [
  { label: 'Design Thinking', score: 82 },
  { label: 'Visual Craft',    score: 91 },
  { label: 'Systems',         score: 76 },
  { label: 'User Empathy',    score: 85 },
  { label: 'Tech Depth',      score: 68 },
  { label: 'Communication',   score: 79 },
  { label: 'Framing',         score: 73 },
  { label: 'Iteration',       score: 88 },
];

const detailCards = [
  {
    label: 'Visual Craft',
    badge: 'Strong',
    score: 91,
    description:
      'Your visual decisions are precise and deliberate. Alignment, hierarchy, and density choices consistently communicate intent. This is your strongest differentiator in a competitive pool.',
  },
  {
    label: 'Design Thinking',
    badge: 'Strong',
    score: 82,
    description:
      'Strong problem framing and structured approach to ambiguous briefs. Your answers show awareness of constraints before jumping to solutions.',
  },
  {
    label: 'Technical Depth',
    badge: 'Needs work',
    score: 68,
    description:
      'Your understanding of implementation constraints is developing. Strengthening your knowledge of component states, edge cases, and handoff documentation would raise this score.',
  },
];

const OVERALL = 81;

// ── Radar Chart helpers ───────────────────────────────────────────────────────
const CX = 150;
const CY = 150;
const R  = 110; // max radius
const N  = dimensions.length;

function angleOf(i: number) {
  return (i / N) * 2 * Math.PI - Math.PI / 2;
}
function point(r: number, i: number) {
  const a = angleOf(i);
  return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) };
}
function polygonPath(scores: number[], maxR: number) {
  return scores
    .map((s, i) => {
      const r = (s / 100) * maxR;
      const p = point(r, i);
      return `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`;
    })
    .join(' ') + ' Z';
}

// ── Bar colour ────────────────────────────────────────────────────────────────
function barColor(score: number) {
  if (score >= 85) return '#10b981'; // teal
  if (score >= 75) return '#6366f1'; // indigo
  return '#f97316';                  // orange
}
function scoreColor(score: number) {
  if (score >= 85) return 'text-[#10b981]';
  if (score >= 75) return 'text-[#6366f1]';
  return 'text-[#f97316]';
}

// ── Badge ─────────────────────────────────────────────────────────────────────
function Badge({ label }: { label: string }) {
  const isStrong = label === 'Strong';
  return (
    <span
      className={`rounded-full px-3 py-1 text-[12px] font-semibold ${
        isStrong
          ? 'bg-[#d1fae5] text-[#059669]'
          : 'bg-[#ffedd5] text-[#ea580c]'
      }`}
    >
      {label}
    </span>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
interface AssessmentReportProps {
  onBack: () => void;
}

export function AssessmentReport({ onBack }: AssessmentReportProps) {
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];
  const scores = dimensions.map((d) => d.score);

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF9F7] font-sans text-navy">
      <PageHeader title="Assessment" />

      <div className="flex-1 py-10">
        <div className="mx-auto w-full max-w-[900px] px-8">

          {/* Back */}
          <button
            className="group mb-6 flex items-center text-[14px] font-medium text-navy/60 hover:text-navy transition-colors"
            onClick={onBack}
          >
            <ChevronLeft className="mr-1 h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Back to assessment
          </button>

          {/* Title row */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-[26px] font-bold text-navy tracking-tight">Assessment Report</h1>
              <p className="mt-1 font-mono text-[13px] text-navy/50">
                Completed Jun 14, 2025 · 29 min
              </p>
            </div>
            <div className="text-right">
              <p className="text-[64px] font-extrabold leading-none text-[#6366f1]">{OVERALL}</p>
              <p className="mt-1 text-[13px] text-navy/50">Overall score</p>
            </div>
          </div>

          {/* Top two cards */}
          <div className="mb-6 grid grid-cols-2 gap-5">

            {/* Radar card */}
            <div className="rounded-2xl border border-chalk-200 bg-white p-6 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]">
              <p className="mb-4 text-[14px] font-semibold text-navy">8-Dimension profile</p>

              <div className="flex justify-center">
                <svg width="300" height="300" viewBox="0 0 300 300">
                  {/* grid */}
                  {gridLevels.map((level) => (
                    <polygon
                      key={level}
                      points={Array.from({ length: N }, (_, i) => {
                        const p = point(level * R, i);
                        return `${p.x},${p.y}`;
                      }).join(' ')}
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="1"
                    />
                  ))}
                  {/* axes */}
                  {Array.from({ length: N }, (_, i) => {
                    const p = point(R, i);
                    return (
                      <line
                        key={i}
                        x1={CX} y1={CY}
                        x2={p.x} y2={p.y}
                        stroke="#e2e8f0"
                        strokeWidth="1"
                      />
                    );
                  })}
                  {/* data polygon */}
                  <path
                    d={polygonPath(scores, R)}
                    fill="rgba(99,102,241,0.15)"
                    stroke="#6366f1"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  {/* dots */}
                  {scores.map((s, i) => {
                    const r = (s / 100) * R;
                    const p = point(r, i);
                    return (
                      <circle key={i} cx={p.x} cy={p.y} r="4" fill="#6366f1" />
                    );
                  })}
                  {/* labels */}
                  {dimensions.map((d, i) => {
                    const p = point(R + 20, i);
                    const anchor =
                      p.x < CX - 5 ? 'end' : p.x > CX + 5 ? 'start' : 'middle';
                    return (
                      <text
                        key={i}
                        x={p.x}
                        y={p.y + 4}
                        textAnchor={anchor}
                        fontSize="10"
                        fill="#64748b"
                        fontFamily="sans-serif"
                      >
                        {d.label}
                      </text>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Breakdown card */}
            <div className="rounded-2xl border border-chalk-200 bg-white p-6 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]">
              <p className="mb-5 text-[15px] font-bold text-navy">Breakdown</p>
              <div className="space-y-4">
                {dimensions.map((d) => (
                  <div key={d.label}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-[13.5px] text-navy/80">{d.label}</span>
                      <span className={`text-[13.5px] font-bold ${scoreColor(d.score)}`}>{d.score}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-[#f1f5f9]">
                      <div
                        className="h-1.5 rounded-full transition-all"
                        style={{ width: `${d.score}%`, backgroundColor: barColor(d.score) }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Detail cards */}
          <div className="space-y-4">
            {detailCards.map((card) => (
              <div
                key={card.label}
                className="rounded-2xl border border-chalk-200 bg-white p-6 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-[15.5px] font-bold text-navy">{card.label}</span>
                    <Badge label={card.badge} />
                  </div>
                  <span className={`text-[18px] font-extrabold ${scoreColor(card.score)}`}>
                    {card.score}
                  </span>
                </div>
                <p className="text-[14.5px] leading-relaxed text-navy/60">{card.description}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
