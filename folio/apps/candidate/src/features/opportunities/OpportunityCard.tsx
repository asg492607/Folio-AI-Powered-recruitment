import { Bookmark, Sparkles, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useOpportunityStore } from '../../store/opportunityStore';
import { useApplicationStore } from '../../store/applicationStore';
import type { Opportunity } from '../../types';
import { trackEvent } from '../../utils/analytics';

export function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  const savedIds = useOpportunityStore((state) => state.savedIds);
  const toggleSaved = useOpportunityStore((state) => state.toggleSaved);
  const saved = savedIds.includes(opportunity.id);

  const applications = useApplicationStore((state) => state.applications);
  const applied = applications.some((app) => app.opportunityId === opportunity.id);

  const initial = opportunity.companyName.charAt(0) || 'C';

  return (
    <article className="group relative flex flex-col rounded-2xl border border-chalk-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-card">
      <div className="flex items-center justify-between mb-4">
        {/* Company Logo Avatar */}
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy text-white text-base font-bold select-none uppercase">
          {initial}
        </div>
        
        {/* Save Bookmark Button or Applied Badge */}
        {applied ? (
          <span className="flex items-center gap-1.5 rounded-full bg-[#ecfdf5] px-2.5 py-1 text-[11px] font-bold tracking-wider text-[#059669] uppercase border border-[#a7f3d0]">
            <CheckCircle2 className="h-3 w-3" strokeWidth={3} />
            Applied
          </span>
        ) : (
          <button
            className={`p-1.5 rounded-full transition-colors ${
              saved
                ? 'text-indigo hover:text-indigo-600'
                : 'text-navy/35 hover:text-navy'
            }`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleSaved(opportunity.id);
            }}
            aria-label="Save opportunity"
          >
            <Bookmark className="h-5 w-5" fill={saved ? 'currentColor' : 'none'} strokeWidth={1.5} />
          </button>
        )}
      </div>

      <Link
        to={`/opportunities/${opportunity.id}`}
        onClick={() => trackEvent('opportunity_clicked', { opportunityId: opportunity.id })}
        className="flex flex-1 flex-col focus:outline-none"
      >
        <span className="text-navy/55 text-[13px] font-sans font-medium mb-1">
          {opportunity.companyName}
        </span>
        <h2 className="text-navy text-[17px] font-bold font-sans line-clamp-1 mb-4 group-hover:text-indigo transition-colors">
          {opportunity.title}
        </h2>

        {/* Pills */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          <span className="px-3.5 py-1 rounded-full border border-chalk-200 bg-white text-navy/60 text-[12px] font-medium font-sans">
            {opportunity.workType === 'full_time'
              ? 'Full-time'
              : opportunity.workType === 'internship'
              ? 'Internship'
              : 'Freelance'}
          </span>
          <span className="px-3.5 py-1 rounded-full border border-chalk-200 bg-white text-navy/60 text-[12px] font-medium font-sans">
            {opportunity.location || opportunity.locationType}
          </span>
        </div>

        {/* AI Match Badge */}
        {opportunity.matchPercentage && (
          <div className="mt-auto flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full bg-[#f0eeff] text-indigo text-[11px] font-bold tracking-wider font-mono">
            <Sparkles className="h-3.5 w-3.5" />
            {opportunity.matchPercentage}% MATCH
          </div>
        )}
      </Link>
    </article>
  );
}
