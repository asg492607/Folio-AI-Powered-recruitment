import { Bookmark, Sparkles, ChevronRight, Briefcase, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCandidateStore } from '../../store/candidateStore';
import { useOpportunityStore } from '../../store/opportunityStore';
import { useApplicationStore } from '../../store/applicationStore';
import { PageHeader } from '../../components/PageHeader';
import { EmptyState } from '../../components/EmptyState';

export function Dashboard() {
  const candidate = useCandidateStore((state) => state.candidate);
  const opportunities = useOpportunityStore((state) => state.opportunities);
  const applications = useApplicationStore((state) => state.applications);
  const savedIds = useOpportunityStore((state) => state.savedIds);
  const toggleSaved = useOpportunityStore((state) => state.toggleSaved);
  const firstName = candidate.personalInfo.name.split(' ')[0] || 'Guest';

  // Top 4 by real match score
  const topMatches = [...opportunities]
    .sort((a, b) => (b.matchPercentage ?? 0) - (a.matchPercentage ?? 0))
    .slice(0, 4);

  const appliedCount = applications.length;
  const underReviewCount = applications.filter(a => ['under_review', 'viewed'].includes(a.status)).length;
  const shortlistedCount = applications.filter(a => ['shortlisted', 'interview_scheduled', 'selected'].includes(a.status)).length;

  return (
    <div className="flex min-h-screen flex-col bg-chalk">
      <PageHeader title="Dashboard" />

      <div className="p-8 pb-20 animate-slide-up">
        {/* Greeting Section */}
        <div className="mb-8">
          <h1 className="font-serif text-[32px] tracking-tight text-navy mb-1.5">
            Good morning, {firstName}.
          </h1>
          <p className="text-navy/60 font-sans text-base">
            Your portfolio intelligence is active. {opportunities.length} opportunities available.
          </p>
        </div>

        {/* Top Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="rounded-xl bg-white p-6 shadow-sm border border-chalk-200">
            <p className="text-xs font-mono tracking-widest text-navy/40 uppercase mb-2">Applied</p>
            <p className="font-sans text-4xl font-bold text-navy leading-none mb-2">{appliedCount}</p>
            <p className="text-sm text-navy/60">applications</p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-sm border border-chalk-200">
            <p className="text-xs font-mono tracking-widest text-navy/40 uppercase mb-2">Under review</p>
            <p className="font-sans text-4xl font-bold text-navy leading-none mb-2">{underReviewCount}</p>
            <p className="text-sm text-navy/60">active</p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-sm border border-chalk-200">
            <p className="text-xs font-mono tracking-widest text-navy/40 uppercase mb-2">Shortlisted</p>
            <p className="font-sans text-4xl font-bold text-navy leading-none mb-2">{shortlistedCount}</p>
            <p className="text-sm text-navy/60">this week</p>
          </div>
        </div>

        {/* Career Insight Banner */}
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-6 mb-10 shadow-soft">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-indigo" />
            <span className="text-[11px] font-mono tracking-widest text-indigo uppercase font-semibold">Career Insight</span>
          </div>
          <p className="text-[15px] leading-relaxed text-navy mb-4 max-w-4xl">
            Welcome to Folio. Connect your portfolio sources in the Portfolio tab to get personalized career insights and improve your match scores.
          </p>
          <button className="text-sm font-medium text-indigo hover:text-indigo-700 transition-colors flex items-center gap-1.5">
            Update portfolio <span className="text-lg leading-none">→</span>
          </button>
        </div>

        {/* Two Column Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column (Recommended Jobs) */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-medium text-navy">Recommended for you</h2>
              <Link to="/opportunities" className="text-sm font-medium text-indigo hover:text-indigo-700 flex items-center gap-1">
                View all <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {topMatches.length > 0 ? topMatches.map((job) => {
                const isSaved = savedIds.includes(job.id);
                const isApplied = applications.some(a => a.opportunityId === job.id);
                const initial = (job.companyName || '?').charAt(0).toUpperCase();
                const workLabel = job.workType === 'full_time' ? 'Full-time'
                  : job.workType === 'internship' ? 'Internship'
                  : job.workType === 'freelance' ? 'Freelance' : job.workType;

                return (
                  <Link
                    key={job.id}
                    to={`/opportunities/${job.id}`}
                    className="rounded-xl bg-white p-6 shadow-sm border border-chalk-200 flex flex-col hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy text-white font-bold text-sm">
                        {initial}
                      </div>
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleSaved(job.id); }}
                        className={`transition-colors ${isSaved ? 'text-indigo' : 'text-chalk-400 hover:text-indigo'}`}
                        aria-label="Save"
                      >
                        <Bookmark className="h-5 w-5" fill={isSaved ? 'currentColor' : 'none'} strokeWidth={1.5} />
                      </button>
                    </div>
                    <p className="text-sm text-navy/60 mb-0.5 truncate">{job.companyName}</p>
                    <h3 className="font-semibold text-navy text-base mb-3 group-hover:text-indigo transition-colors line-clamp-1">{job.title}</h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="rounded-full border border-chalk-200 px-3 py-1 text-xs text-navy/70">{workLabel}</span>
                      <span className="rounded-full border border-chalk-200 px-3 py-1 text-xs text-navy/70 truncate max-w-[120px]">{job.location || job.locationType}</span>
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                      {job.matchPercentage ? (
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo">
                          <Sparkles className="h-3 w-3" /> {job.matchPercentage}% MATCH
                        </span>
                      ) : <span />}
                      {isApplied && (
                        <span className="text-xs font-semibold text-[#059669] bg-[#ecfdf5] px-2.5 py-1 rounded-full border border-[#a7f3d0]">Applied</span>
                      )}
                    </div>
                  </Link>
                );
              }) : (
                <div className="col-span-2">
                  <EmptyState title="No matches yet" icon={Sparkles}>
                    We couldn't find any opportunities matching your skills. Connect your portfolio to improve matches, or{' '}
                    <Link to="/opportunities" className="text-indigo hover:underline font-medium">browse all opportunities</Link>.
                  </EmptyState>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
