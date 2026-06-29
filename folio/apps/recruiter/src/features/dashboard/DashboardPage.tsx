import { BriefcaseBusiness, CalendarClock, CheckCircle2, UsersRound, Send, ArrowUpRight, Plus, Layers } from 'lucide-react';
import { ElementType, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatusBadge } from '@/components/StatusBadge';
import { useCollection } from '@/hooks/useCollection';
import { useAuth } from '@/contexts/useAuth';
import RecruiterProfileModal from '@/features/recruiter/RecruiterProfileModal';
import type { Candidate, Interview, Job } from '@/types';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items: jobs } = useCollection<Job>('jobs');
  const { items: candidates } = useCollection<Candidate>('candidates');
  const { items: interviews } = useCollection<Interview>('interviews');
  
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Dynamic calculations
  const activeJobs = jobs.filter((job) => job.status === 'Active').length;
  const offersCount = candidates.filter((candidate) => candidate.status === 'Offered').length;
  const avgMatch = candidates.length 
    ? Math.round(candidates.reduce((sum, candidate) => sum + candidate.matchScore, 0) / candidates.length) 
    : 0;

  // Dynamic calculations for trend lines
  const todayDateStr = '2026-06-24'; // System locked date from metadata
  const interviewsTodayCount = interviews.filter(i => i.scheduledAt.startsWith(todayDateStr)).length;
  const newCandidatesThisMonth = candidates.filter(c => c.appliedDate >= '2026-06-01').length;
  const offersPendingCount = candidates.filter(c => c.status === 'Offered').length;

  // Top matches sorting
  const topMatchedCandidates = [...candidates]
    .sort((a, b) => b.matchScore - a.matchScore);

  const labelFontStyle = { fontFamily: '"DM Sans", system-ui, sans-serif' };



  return (
     <div className="space-y-4 w-full mx-auto animate-slide-up will-change-transform">
      {/* Page Header - Premium Editorial Command Center */}
      <header className="border-b border-[#ECE8E2] pb-3 mb-2">
        <h1 className="font-serif text-[30px] tracking-tight text-brand-navy mb-1">
          Recruitment Operations
        </h1>
        <p className="max-w-3xl text-[13.5px] leading-relaxed text-[#1A1C2E99]">
          Monitor job requisitions, evaluate candidate matching metrics, and manage interview pipelines.
        </p>
        
        {/* Executive Summary Row (Figma Style Space Mono chips) */}
        <div className="flex flex-wrap items-center gap-2 mt-3 folio-mono text-[9px] uppercase tracking-wide text-brand-navy">
          <span className="bg-white border border-[#ECE8E2] rounded-lg px-2.5 py-1 shadow-sm font-bold">14.5 Days <span className="text-[#6D6B8D]/70 font-normal">Hiring Velocity</span></span>
          <span className="bg-white border border-[#ECE8E2] rounded-lg px-2.5 py-1 shadow-sm font-bold">{avgMatch}% <span className="text-[#6D6B8D]/70 font-normal">Average Match</span></span>
          <span className="bg-white border border-[#ECE8E2] rounded-lg px-2.5 py-1 shadow-sm font-bold">{interviewsTodayCount} <span className="text-[#6D6B8D]/70 font-normal">Interviews Today</span></span>
          <span className="bg-white border border-[#ECE8E2] rounded-lg px-2.5 py-1 shadow-sm font-bold">{activeJobs} <span className="text-[#6D6B8D]/70 font-normal">Active Requisitions</span></span>
        </div>

        {/* Recruiter Quick Actions Bar */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button 
            onClick={() => navigate('/jobs')} 
            className="button-primary py-2 px-4 flex items-center gap-1.5 text-[10px] font-mono tracking-wider uppercase cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            Create Job
          </button>
          <button 
            onClick={() => navigate('/pipeline')} 
            className="button-secondary py-2 px-4 flex items-center gap-1.5 text-[10px] font-mono tracking-wider uppercase cursor-pointer"
          >
            <Layers className="h-3.5 w-3.5 text-brand-purple" />
            View Pipeline
          </button>
          <button 
            onClick={() => navigate('/interviews')} 
            className="button-secondary py-2 px-4 flex items-center gap-1.5 text-[10px] font-mono tracking-wider uppercase cursor-pointer"
          >
            📅 Schedule Interview
          </button>
          <button 
            onClick={() => navigate('/offers')} 
            className="button-secondary py-2 px-4 flex items-center gap-1.5 text-[10px] font-mono tracking-wider uppercase cursor-pointer"
          >
            <Send className="h-3.5 w-3.5 text-brand-mint" />
            Manage Offers
          </button>
        </div>
      </header>

      {/* Metrics Grid */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric 
          icon={BriefcaseBusiness} 
          label="Active Job Requisitions" 
          value={activeJobs.toString()} 
          hint={`${jobs.length} total requisitions`} 
          trend="▲ View Jobs" 
          trendColor="indigo" 
          onClick={() => navigate('/jobs')}
        />
        <Metric 
          icon={UsersRound} 
          label="Total Sourced Candidates" 
          value={candidates.length.toString()} 
          hint={`${avgMatch}% average match`} 
          trend={`▲ +${newCandidatesThisMonth} this month`} 
          trendColor="purple" 
          onClick={() => navigate('/pipeline')}
        />
        <Metric 
          icon={CalendarClock} 
          label="Scheduled Interviews" 
          value={interviews.length.toString()} 
          hint="Active scheduling queue" 
          trend={interviewsTodayCount > 0 ? `▲ ${interviewsTodayCount} scheduled today` : '● No sessions today'} 
          trendColor="orange" 
          onClick={() => navigate('/interviews')}
        />
        <Metric 
          icon={CheckCircle2} 
          label="Sent Offers Desk" 
          value={offersCount.toString()} 
          hint="Compensation review desk" 
          trend={offersPendingCount > 0 ? `▲ ${offersPendingCount} pending signature` : '● All clear'} 
          trendColor="mint" 
          onClick={() => navigate('/offers')}
        />
      </section>

      {/* Optimized Main Content Sections Grid */}
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] items-start">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Priority Requisitions */}
          <div className="rounded-2xl border border-[#ECE8E2] bg-white p-5 shadow-xs">
            <div className="mb-4 border-b border-[#ECE8E2] pb-3 flex justify-between items-center">
              <div>
                <h2 className="text-[18px] font-bold text-brand-navy" style={labelFontStyle}>Priority Requisitions</h2>
                <p className="text-[10px] mt-0.5 folio-meta text-[#6D6B8D] uppercase">Open roles requiring immediate sourcing.</p>
              </div>
              <button 
                onClick={() => navigate('/jobs')} 
                className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-purple hover:underline cursor-pointer"
              >
                Manage All
              </button>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-3">
              {jobs.slice(0, 3).map((job) => (
                <div 
                  key={job.id} 
                  className="rounded-xl border border-[#ECE8E2] bg-white p-3.5 hover:border-brand-purple hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[160px] shadow-xs cursor-pointer"
                  onClick={() => navigate('/jobs')}
                >
                  <div className="space-y-1">
                    <div className="flex justify-between items-start gap-1.5">
                      <h4 className="font-sans font-bold text-brand-navy text-[12px] leading-snug line-clamp-2" style={labelFontStyle}>
                        {job.title}
                      </h4>
                      <div className="flex flex-col gap-1 items-end flex-shrink-0">
                        <StatusBadge value={job.priority} />
                        <StatusBadge value={job.status} />
                      </div>
                    </div>
                    <p className="text-[9.5px] text-[#6D6B8D] font-sans">
                      {job.department} · {job.location}
                    </p>
                  </div>
                  
                  <div className="mt-3">
                    <div className="grid grid-cols-2 gap-2 border-t border-[#ECE8E2] pt-2 text-[8.5px] font-sans">
                      <div>
                        <span className="block text-[7px] font-mono uppercase tracking-wider text-[#6D6B8D] font-bold">Sourcing Pool</span>
                        <span className="font-mono font-bold text-brand-navy">{job.applicantsCount} Candidates</span>
                      </div>
                      <div>
                        <span className="block text-[7px] font-mono uppercase tracking-wider text-[#6D6B8D] font-bold">Type</span>
                        <span className="font-sans font-bold text-brand-purple truncate block">{job.type}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-[#ECE8E2]/50 pt-2.5 mt-2.5 text-[8.5px] font-mono font-bold uppercase tracking-wider">
                      <button 
                        type="button" 
                        onClick={(e) => { e.stopPropagation(); navigate('/jobs'); }} 
                        className="text-[#6D6B8D] hover:text-brand-navy transition duration-150"
                      >
                        View Job
                      </button>
                      <button 
                        type="button" 
                        onClick={(e) => { e.stopPropagation(); navigate('/pipeline'); }} 
                        className="text-brand-purple hover:underline"
                      >
                        View Candidates
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Candidate Movement */}
          <div className="rounded-2xl border border-[#ECE8E2] bg-white p-5 shadow-xs overflow-hidden">
            <div className="mb-3 border-b border-[#ECE8E2] pb-3 flex justify-between items-center">
              <div>
                <h2 className="text-[18px] font-bold text-brand-navy" style={labelFontStyle}>Recent Candidate Movement</h2>
                <p className="text-[10px] mt-0.5 folio-meta text-[#6D6B8D] uppercase">Latest transitions in candidate evaluation status.</p>
              </div>
              <button 
                onClick={() => navigate('/pipeline')} 
                className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-purple hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>
            
            <div className="overflow-x-auto -mx-6">
              <div className="inline-block min-w-full align-middle px-6">
                <table className="w-full min-w-[450px] text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-[#ECE8E2] pb-1.5">
                      <th className="folio-label text-[8.5px] uppercase tracking-[0.15em] text-[#6D6B8D] pb-1.5 font-bold">Candidate</th>
                      <th className="folio-label text-[8.5px] uppercase tracking-[0.15em] text-[#6D6B8D] pb-1.5 font-bold">Role</th>
                      <th className="folio-label text-[8.5px] uppercase tracking-[0.15em] text-[#6D6B8D] pb-1.5 font-bold">Source</th>
                      <th className="folio-label text-[8.5px] uppercase tracking-[0.15em] text-[#6D6B8D] pb-1.5 font-bold">Status</th>
                      <th className="folio-label text-[8.5px] uppercase tracking-[0.15em] text-[#6D6B8D] pb-1.5 font-bold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ECE8E2]">
                    {candidates.slice(0, 4).map((candidate) => (
                      <tr key={candidate.id} className="hover:bg-[#151633]/[0.02] transition-colors cursor-pointer" onClick={() => navigate('/pipeline')}>
                        <td className="py-3 font-sans font-bold text-brand-navy text-[12.5px]">
                          <div className="flex items-center gap-2">
                            <div className="flex h-6.5 w-6.5 items-center justify-center rounded-full bg-brand-navy text-white text-[9.5px] font-sans font-bold flex-shrink-0">
                              {candidate.name.charAt(0)}
                            </div>
                            <span>{candidate.name}</span>
                          </div>
                        </td>
                        <td className="py-3 text-[#6D6B8D]/90 font-sans text-[11.5px]">{candidate.jobTitle}</td>
                        <td className="py-3 text-[#6D6B8D]/90 font-sans text-[11.5px]">{candidate.source}</td>
                        <td className="py-3"><StatusBadge value={candidate.status} /></td>
                        <td className="py-3 text-right">
                          <button 
                            type="button" 
                            onClick={(e) => { e.stopPropagation(); navigate('/pipeline'); }} 
                            className="text-[9px] font-mono font-bold uppercase tracking-wider text-brand-purple hover:underline"
                          >
                            View Candidate
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {user?.role === 'Recruiter' && (
            <div className="rounded-2xl border border-[#ECE8E2] bg-white p-5 shadow-xs flex flex-col justify-between h-full min-h-[220px]">
              <div>
                <div className="mb-3 border-b border-[#ECE8E2] pb-3 flex justify-between items-center">
                  <div>
                    <h2 className="text-[18px] font-bold text-brand-navy" style={labelFontStyle}>Hiring Tasks</h2>
                    <p className="text-[10px] mt-0.5 folio-meta text-[#6D6B8D] uppercase">Actionable items in current cycle.</p>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-brand-orange animate-pulse" />
                </div>
                
                <div className="space-y-3 mt-2">
                  <div className="flex items-center justify-between text-xs border-b border-stone-100 pb-2">
                    <span className="text-[#6D6B8D] font-sans">Candidates Awaiting Action</span>
                    <span className="font-mono font-bold text-brand-navy bg-brand-purple/10 text-brand-purple px-2 py-0.5 rounded-sm">
                      {candidates.filter(c => c.status === 'Applied').length} profiles
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs border-b border-stone-100 pb-2">
                    <span className="text-[#6D6B8D] font-sans">Interviews Scheduled Today</span>
                    <span className="font-mono font-bold text-brand-navy bg-brand-orange/10 text-brand-orange px-2 py-0.5 rounded-sm">
                      {interviewsTodayCount} sessions
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs pb-1">
                    <span className="text-[#6D6B8D] font-sans">Pending Offers Desk</span>
                    <span className="font-mono font-bold text-brand-navy bg-brand-mint/10 text-brand-mint px-2 py-0.5 rounded-sm">
                      {offersPendingCount} offers
                    </span>
                  </div>
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => navigate('/pipeline')}
                className="w-full rounded-xl border border-[#ECE8E2] py-2 mt-4 text-center text-xs font-bold text-brand-navy hover:bg-stone-50 transition cursor-pointer bg-white"
                style={labelFontStyle}
              >
                Resolve Sourcing Queue
              </button>
            </div>
          )}

          {/* Top Matches */}
          <div className="rounded-2xl border border-[#ECE8E2] bg-white p-5 shadow-xs">
            <div className="mb-3 border-b border-[#ECE8E2] pb-3 flex justify-between items-center">
              <div>
                <h2 className="text-[18px] font-bold text-brand-navy" style={labelFontStyle}>Top Matches</h2>
                <p className="text-[10px] mt-0.5 folio-meta text-[#6D6B8D] uppercase">Best fitting profiles in pool.</p>
              </div>
              <button 
                onClick={() => navigate('/pipeline')} 
                className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-purple hover:underline cursor-pointer"
              >
                View All Matches
              </button>
            </div>
            
            <div className="space-y-2.5">
              {topMatchedCandidates.slice(0, 4).map((candidate, idx) => (
                <div 
                  key={candidate.id} 
                  className="rounded-xl border border-[#ECE8E2] bg-white p-3 hover:border-brand-purple hover:translate-y-[-1px] transition-all duration-200 shadow-xs cursor-pointer flex flex-col gap-2"
                  onClick={() => navigate('/pipeline')}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-4.5 h-4.5 flex items-center justify-center rounded-full bg-brand-purple/10 text-brand-purple font-mono text-[9px] font-bold flex-shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <h4 className="font-sans font-bold text-brand-navy text-[12px] leading-tight truncate">{candidate.name}</h4>
                        <p className="text-[9.5px] text-[#6D6B8D] mt-0.5 font-sans truncate">{candidate.jobTitle}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {candidate.matchScore >= 85 && (
                        <span className="folio-mono text-[6.5px] uppercase tracking-wider text-brand-purple font-bold bg-brand-purple/5 border border-brand-purple/10 px-1 py-0.5 rounded">
                          AI
                        </span>
                      )}
                      <span className="folio-mono text-[9px] font-bold text-brand-mint bg-brand-mint/5 px-1.5 py-0.5 rounded border border-brand-mint/10">
                        {candidate.matchScore}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 border-t border-stone-100 pt-1.5 text-[8.5px] font-mono font-bold uppercase tracking-wider">
                    <button 
                      type="button" 
                      onClick={(e) => { e.stopPropagation(); navigate('/pipeline'); }} 
                      className="text-[#6D6B8D] hover:text-brand-navy transition duration-150"
                    >
                      View Profile
                    </button>
                    <button 
                      type="button" 
                      onClick={(e) => { e.stopPropagation(); navigate('/pipeline'); }} 
                      className="text-brand-purple hover:underline"
                    >
                      Shortlist
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recruiter Profile Modal */}
      <RecruiterProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
      />
    </div>
  );
}

function Metric({ icon: Icon, label, value, hint, trend, trendColor, onClick }: { icon: ElementType; label: string; value: string; hint: string; trend: string; trendColor: string; onClick?: () => void }) {
  let indicatorDotColor = 'bg-brand-navy';
  let trendClass = 'text-[#6D6B8D] bg-stone-50 border-[#ECE8E2]';
  
  if (trendColor === 'purple') {
    indicatorDotColor = 'bg-brand-purple';
    trendClass = 'text-brand-purple bg-brand-purple/5 border-brand-purple/10';
  } else if (trendColor === 'orange') {
    indicatorDotColor = 'bg-brand-orange';
    trendClass = 'text-brand-orange bg-brand-orange/5 border-brand-orange/10';
  } else if (trendColor === 'mint') {
    indicatorDotColor = 'bg-brand-mint';
    trendClass = 'text-brand-mint bg-brand-mint/5 border-brand-mint/10';
  } else if (trendColor === 'indigo') {
    indicatorDotColor = 'bg-indigo-600';
    trendClass = 'text-indigo-600 bg-indigo-50 border-indigo-100';
  }

  return (
    <div 
      className="p-5 rounded-xl border border-[#ECE8E2] bg-white transition-all duration-300 card-hover flex flex-col justify-between h-full min-h-[115px] shadow-xs cursor-pointer hover:border-brand-purple/35"
      onClick={onClick}
    >
      <div className="flex items-center justify-between border-b border-stone-100 pb-2 mb-2.5">
        <span className="text-[8.5px] font-mono font-bold uppercase tracking-[0.15em] text-[#6D6B8D]">
          {label}
        </span>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className={`h-1 w-1 rounded-full ${indicatorDotColor} flex-shrink-0`} />
          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
            <Icon className="h-3.5 w-3.5 text-[#6D6B8D] flex-shrink-0" strokeWidth={1.5} />
          </div>
        </div>
      </div>
      
      <div className="text-[28px] font-mono font-bold tracking-tight text-brand-navy leading-none mb-1">
        {value}
      </div>
      
      <div className="flex items-center justify-between gap-2 mt-auto pt-1 text-[10px] text-[#6D6B8D] font-sans">
        <span className="truncate">{hint}</span>
        <span className={`text-[8.5px] font-mono font-bold uppercase tracking-wider border px-1.5 py-0.5 rounded flex-shrink-0 flex items-center gap-0.5 ${trendClass}`}>
          {trend}
          {trend.includes("View") && <ArrowUpRight className="h-2 w-2" />}
        </span>
      </div>
    </div>
  );
}