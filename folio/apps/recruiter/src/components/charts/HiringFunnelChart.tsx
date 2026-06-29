import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, LabelList } from 'recharts';
import type { Candidate } from '@/types';

interface HiringFunnelChartProps {
  candidates?: Candidate[];
}

const stages: Candidate['status'][] = ['Applied', 'Matched', 'Shortlisted', 'Interviewing', 'Offered', 'Hired'];

const defaultData = [
  { stage: 'Applied', count: 120 },
  { stage: 'Matched', count: 84 },
  { stage: 'Shortlisted', count: 42 },
  { stage: 'Interviewing', count: 19 },
  { stage: 'Offered', count: 7 },
  { stage: 'Hired', count: 3 }
];

export default function HiringFunnelChart({ candidates }: HiringFunnelChartProps = {}) {
  // Defensive fallback for candidates array
  const safeCandidates = candidates ?? [];

  // If candidates array is empty, default to the static ATS values to ensure the chart renders rich details.
  const hasCandidates = safeCandidates.length > 0;
  
  const rawData = hasCandidates
    ? stages.map((stage) => {
        const count = safeCandidates.filter((candidate) => candidate && candidate.status === stage).length;
        return { stage, count };
      })
    : defaultData;

  const appliedCount = rawData.find(d => d.stage === 'Applied')?.count || 1;

  const data = rawData.map((d) => {
    const pctVal = appliedCount > 0 ? Math.round((d.count / appliedCount) * 100) : 0;
    return {
      ...d,
      pct: `${pctVal}%`
    };
  });

  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 16, right: 8, left: -22, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ECE8E2" vertical={false} />
          <XAxis dataKey="stage" tick={{ fill: '#6D6B8D', fontSize: 8.5, fontFamily: '"Space Mono", monospace', fontWeight: 'bold' }} interval={0} />
          <YAxis allowDecimals={false} tick={{ fill: '#6D6B8D', fontSize: 8.5, fontFamily: '"Space Mono", monospace' }} />
          <Tooltip cursor={{ fill: '#F2EFEA' }} contentStyle={{ backgroundColor: '#FCFBF9', border: '1px solid rgba(21, 22, 51, 0.08)', borderRadius: '12px', fontFamily: '"DM Sans", sans-serif' }} />
          <Bar dataKey="count" fill="#5B4FE9" radius={[4, 4, 0, 0]}>
            <LabelList dataKey="pct" position="top" style={{ fill: '#5B4FE9', fontSize: 8, fontFamily: '"Space Mono", monospace', fontWeight: 'bold' }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
