import { Badge } from './Badge';
import type { ApplicationStatus } from '../types';

// Map statuses to FolioSpace semantic brand tones
const tones: Record<
  ApplicationStatus,
  'indigo' | 'mint' | 'orange' | 'lavender' | 'chalk'
> = {
  'Applied': 'indigo',
  'Matched': 'chalk',
  'Assessment Completed': 'orange',
  'Shortlisted': 'mint',
  'Interviewing': 'mint',
  'Offered': 'mint',
  'Hired': 'mint',
  'Withdrawn': 'orange',
};

const dotColors: Record<ApplicationStatus, string> = {
  'Applied': 'bg-indigo-500',
  'Matched': 'bg-navy/40',
  'Assessment Completed': 'bg-orange-500',
  'Shortlisted': 'bg-mint-500',
  'Interviewing': 'bg-mint-500',
  'Offered': 'bg-mint-500',
  'Hired': 'bg-mint-500',
  'Withdrawn': 'bg-orange-500',
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <Badge tone={tones[status]}>
      <span className="relative flex h-2 w-2 items-center justify-center">
        {['Applied', 'Assessment Completed'].includes(status) && (
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${dotColors[status]}`}
          />
        )}
        <span
          className={`relative inline-flex h-1.5 w-1.5 rounded-full ${dotColors[status]}`}
        />
      </span>
      {status}
    </Badge>
  );
}

