const toneMap: Record<string, string> = {
  Active: 'bg-brand-mint/5 text-brand-mint border border-brand-mint/15',
  Live: 'bg-brand-mint/5 text-brand-mint border border-brand-mint/15',
  Completed: 'bg-brand-mint/5 text-brand-mint border border-brand-mint/15',
  Hired: 'bg-brand-mint/5 text-brand-mint border border-brand-mint/15',
  'Assessment Completed': 'bg-brand-mint/5 text-brand-mint border border-brand-mint/15',
  
  Offered: 'bg-brand-purple/5 text-brand-purple border border-brand-purple/15',
  Matched: 'bg-brand-purple/5 text-brand-purple border border-brand-purple/15',
  Shortlisted: 'bg-brand-purple/5 text-brand-purple border border-brand-purple/15',
  Medium: 'bg-brand-purple/5 text-brand-purple border border-brand-purple/15',
  
  Interviewing: 'bg-brand-orange/5 text-brand-orange border border-brand-orange/15',
  Scheduled: 'bg-brand-orange/5 text-brand-orange border border-brand-orange/15',
  'Feedback Due': 'bg-brand-orange/5 text-brand-orange border border-brand-orange/15',
  'Assessment Pending': 'bg-brand-orange/5 text-brand-orange border border-brand-orange/15',
  Critical: 'bg-brand-orange/5 text-brand-orange border border-brand-orange/15',
  High: 'bg-brand-orange/5 text-brand-orange border border-brand-orange/15',
  
  Draft: 'bg-stone-500/5 text-stone-500 border border-stone-500/15',
  Closed: 'bg-stone-500/5 text-stone-500 border border-stone-500/15',
  Archived: 'bg-stone-500/5 text-stone-500 border border-stone-500/15',
  Applied: 'bg-stone-500/5 text-stone-500 border border-stone-500/15',
  Planning: 'bg-stone-500/5 text-stone-500 border border-stone-500/15',
  Sent: 'bg-stone-500/5 text-stone-500 border border-stone-500/15',
};

export function StatusBadge({ value }: { value: string }) {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 folio-mono text-[9px] font-bold uppercase tracking-wider ${toneMap[value] ?? 'bg-stone-500/5 text-stone-500 border border-stone-500/15'}`}>
      {value}
    </span>
  );
}
