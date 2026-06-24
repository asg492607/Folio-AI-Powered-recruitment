import { Bookmark, Sparkles, Plus, ExternalLink, CheckCircle2 } from 'lucide-react';
import { useCandidateStore } from '../../store/candidateStore';
import { PageHeader } from '../../components/PageHeader';
import { seedJobsToFirestore } from '../../utils/seedJobs';
import { useUnifiedData } from '../../hooks/useUnifiedData';

export function Dashboard() {
  const candidate = useCandidateStore((state) => state.candidate);
  const firstName = candidate.personalInfo.name.split(' ')[0] || 'Avni';
  const { data } = useUnifiedData();

  return (
    <div className="flex min-h-screen flex-col bg-chalk">
      <PageHeader title="Dashboard" />

      <div className="p-8 pb-20 animate-slide-up">
        {/* Greeting Section */}
        <div className="mb-8">
          <h1 
            className="font-serif text-[32px] tracking-tight text-navy mb-1.5 cursor-pointer"
            onDoubleClick={seedJobsToFirestore}
            title="Double click to seed jobs to Firebase"
          >
            Good morning, {firstName}.
          </h1>
          <p className="text-navy/60 font-sans text-base">
            Your portfolio intelligence is active. 0 new matches since yesterday.
          </p>
        </div>

        {/* Top Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="rounded-xl bg-white p-6 shadow-sm border border-chalk-200">
            <p className="text-xs font-mono tracking-widest text-navy/40 uppercase mb-2">Applied</p>
            <p className="font-sans text-4xl font-bold text-navy leading-none mb-2">0</p>
            <p className="text-sm text-navy/60">applications</p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-sm border border-chalk-200">
            <p className="text-xs font-mono tracking-widest text-navy/40 uppercase mb-2">Under review</p>
            <p className="font-sans text-4xl font-bold text-navy leading-none mb-2">0</p>
            <p className="text-sm text-navy/60">active</p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-sm border border-chalk-200">
            <p className="text-xs font-mono tracking-widest text-navy/40 uppercase mb-2">Shortlisted</p>
            <p className="font-sans text-4xl font-bold text-navy leading-none mb-2">0</p>
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
              <button className="text-sm font-medium text-indigo hover:text-indigo-700 flex items-center gap-1">
                View all <span className="text-lg leading-none">›</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {data?.opportunities?.slice(0, 4).map((job: any) => (
                <div key={job.id} className="rounded-xl bg-white p-6 shadow-sm border border-chalk-200 flex flex-col hover:border-indigo-200 transition-colors cursor-pointer group">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-navy text-white font-medium`}>
                      {job.company_name ? job.company_name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <button className="text-chalk-400 hover:text-indigo transition-colors">
                      <Bookmark className="h-5 w-5" />
                    </button>
                  </div>
                  <p className="text-sm text-navy/60 mb-0.5">{job.company_name}</p>
                  <h3 className="font-semibold text-navy text-lg mb-4 group-hover:text-indigo transition-colors line-clamp-1" title={job.title}>{job.title}</h3>
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="rounded-full border border-chalk-200 px-3 py-1 text-xs text-navy/70">{job.work_type}</span>
                    <span className="rounded-full border border-chalk-200 px-3 py-1 text-xs text-navy/70">{job.location}</span>
                  </div>
                  <div className="mt-auto">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo">
                      <Sparkles className="h-3 w-3" /> {job.match_score ? `${Math.round(job.match_score * 100)}% MATCH` : '85% MATCH'}
                    </span>
                  </div>
                </div>
              ))}
              {(!data?.opportunities || data.opportunities.length === 0) && (
                <div className="col-span-2 text-center py-8 text-navy/50">
                  <p>No recommendations available yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column (Widgets) */}
          <div className="w-full lg:w-[340px] flex flex-col gap-6">
            
            {/* Profile Completion */}
            <div className="rounded-xl bg-white p-6 shadow-sm border border-chalk-200">
              <h2 className="text-[17px] font-medium text-navy mb-6">Profile completion</h2>
              <div className="flex items-center gap-5 mb-6">
                <div className="relative flex h-[72px] w-[72px] items-center justify-center">
                  <svg className="absolute inset-0 h-full w-full -rotate-90 transform" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="16" fill="none" className="stroke-chalk-200" strokeWidth="4" />
                    <circle cx="18" cy="18" r="16" fill="none" className="stroke-mint" strokeWidth="4" strokeDasharray="100" strokeDashoffset="25" strokeLinecap="round" />
                  </svg>
                  <span className="font-sans font-bold text-navy">75%</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-navy mb-1">75% complete</h3>
                  <p className="text-xs text-navy/60 leading-relaxed max-w-[140px]">
                    Add 2 more projects to reach 100%
                  </p>
                </div>
              </div>
              <button className="w-full rounded-lg border border-chalk-200 py-2.5 text-sm font-medium text-navy hover:bg-chalk-50 transition-colors shadow-soft">
                Complete profile
              </button>
            </div>

            {/* Next Actions */}
            <div className="rounded-xl bg-white p-6 shadow-sm border border-chalk-200">
              <h2 className="text-[17px] font-medium text-navy mb-5">Next actions</h2>
              <div className="flex flex-col gap-1">
                {[
                  { label: 'Add 1 more project' },
                  { label: 'Connect Dribbble account' },
                  { label: 'Take AI assessment' }
                ].map((action, i) => (
                  <button key={i} className="flex items-center justify-between py-3 group">
                    <span className="text-sm font-medium text-navy/80 group-hover:text-indigo transition-colors">{action.label}</span>
                    <span className="text-chalk-400 group-hover:text-indigo transition-colors">›</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Notifications */}
            <div className="rounded-xl bg-white p-6 shadow-sm border border-chalk-200">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[17px] font-medium text-navy">Notifications</h2>
                <button className="text-xs font-medium text-indigo hover:text-indigo-700">View all</button>
              </div>
              <div className="flex flex-col gap-5">
                <div className="flex gap-3">
                  <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-sm text-navy mb-0.5">Razorpay viewed your application</p>
                    <p className="text-[11px] text-navy/40 font-mono">2h ago</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-sm text-navy mb-0.5 max-w-[200px]">New 92% match: Product Designer at Figma</p>
                    <p className="text-[11px] text-navy/40 font-mono">5h ago</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-mint/10 text-mint">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-sm text-navy mb-0.5">Portfolio analysis complete</p>
                    <p className="text-[11px] text-navy/40 font-mono">1d ago</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
