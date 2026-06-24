import { Badge } from './Badge';
import type { ApplicationStatus } from '../types';

// Map statuses to FolioSpace semantic brand tones
const tones: Record<
  ApplicationStatus,
  'indigo' | 'mint' | 'orange' | 'lavender' | 'chalk'
> = {
  applied: 'indigo',
  viewed: 'chalk',
  under_review: 'orange',
  shortlisted: 'mint',
  interview_scheduled: 'mint',
  selected: 'mint',
  rejected: 'orange',
};

const dotColors: Record<ApplicationStatus, string> = {
  applied: 'bg-indigo-500',
  viewed: 'bg-navy/40',
  under_review: 'bg-orange-500',
  shortlisted: 'bg-mint-500',
  interview_scheduled: 'bg-mint-500',
  selected: 'bg-mint-500',
  rejected: 'bg-orange-500',
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <Badge tone={tones[status]}>
      <span className="relative flex h-2 w-2 items-center justify-center">
        {['applied', 'under_review'].includes(status) && (
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${dotColors[status]}`}
          />
        )}
        <span
          className={`relative inline-flex h-1.5 w-1.5 rounded-full ${dotColors[status]}`}
        />
      </span>
      {status.replace(/_/g, ' ')}
    </Badge>
  );
}

