import { Check } from 'lucide-react';
import type { ApplicationStatus } from '../../types';

const stages: { status: ApplicationStatus; label: string }[] = [
  { status: 'Applied', label: 'Applied' },
  { status: 'Matched', label: 'Matched' },
  { status: 'Assessment Completed', label: 'Assessment' },
  { status: 'Shortlisted', label: 'Shortlisted' },
  { status: 'Interviewing', label: 'Interview' },
  { status: 'Offered', label: 'Offered' },
  { status: 'Hired', label: 'Hired' },
];

export function StatusTimeline({ current }: { current: ApplicationStatus }) {
  const currentIndex = stages.findIndex((s) => s.status === current);
  const isRejected = current === 'Withdrawn';

  return (
    <div className="mt-8">
      <div className="relative">
        <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-chalk-200" />
        <div
          className="absolute left-0 top-1/2 h-0.5 -translate-y-1/2 bg-mint transition-all duration-page ease-folio"
          style={{
            width: isRejected
              ? '100%'
              : `${(currentIndex / (stages.length - 1)) * 100}%`,
            backgroundColor: isRejected ? '#E53E3E' : undefined, // Tailwind red-600 logic, or orange for brand
          }}
        />
        <div className="relative flex justify-between">
          {stages.map((stage, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            return (
              <div
                key={stage.status}
                className="flex flex-col items-center gap-2"
              >
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full border-2 bg-white transition-colors duration-ui ${
                    isCompleted
                      ? 'border-mint bg-mint'
                      : isCurrent
                      ? 'border-indigo shadow-glow'
                      : 'border-chalk-200'
                  }`}
                >
                  {isCompleted && <Check className="h-3 w-3 text-white" />}
                  {isCurrent && <div className="h-2 w-2 rounded-full bg-indigo" />}
                </div>
                <span
                  className={`hidden text-xs md:block font-mono ${
                    isCurrent || isCompleted ? 'text-navy font-medium' : 'text-navy/40'
                  }`}
                >
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
