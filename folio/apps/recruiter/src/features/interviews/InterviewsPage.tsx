import { useState } from 'react';
import { CalendarPlus, CheckCircle2, Clock3, Video, Briefcase, X } from 'lucide-react';
import type { ElementType } from 'react';
import { useCollection } from '@/hooks/useCollection';
import type { Candidate, Interview } from '@/types';

export default function InterviewsPage() {
  const { items: interviews, addItem, updateItem } = useCollection<Interview>('interviews');
  const { items: candidates, updateItem: updateCandidate } = useCollection<Candidate>('candidates');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  // Form states
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [interviewer, setInterviewer] = useState('');
  const [stage, setStage] = useState<Interview['stage']>('Technical');
  const [mode, setMode] = useState<Interview['mode']>('Video');

  const openSchedulingModal = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setDate(new Date(Date.now() + 86400000).toISOString().slice(0, 10)); // Tomorrow
    setTime('10:00');
    setInterviewer('');
    setStage('Technical');
    setMode('Video');
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate) return;

    await addItem({
      candidateId: selectedCandidate.id,
      candidateName: selectedCandidate.name,
      jobTitle: selectedCandidate.jobTitle,
      interviewer: interviewer || 'Hiring Panel',
      stage,
      scheduledAt: `${date}T${time}`,
      mode,
      status: 'Scheduled',
    });

    // Update candidate status to Interviewing
    await updateCandidate(selectedCandidate.id, { status: 'Interviewing' });
    setIsModalOpen(false);
    setSelectedCandidate(null);
  };


  const formatDateTime = (iso: string) => {
    try {
      const date = new Date(iso);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' · ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
      return iso.replace('T', ' ');
    }
  };

  return (
    <div className="space-y-6 w-full mx-auto">
      {/* Page Header */}
      <header className="border-b border-[#ECE8E2] pb-5 mb-4">
        <h1
          className="mb-2 text-[22px] font-semibold text-[#1A1C2E]"
          style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
        >
          Interview Management
        </h1>
        <p className="max-w-3xl text-[15px] leading-relaxed text-[#1A1C2E99]">
          Coordinate technical panels, review feedback markers, and schedule assessments for pipeline candidates.
        </p>
      </header>

      {/* Grid */}
      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        {/* Left: Schedule Timeline */}
        <section className="rounded-2xl border border-stone-200/60 bg-white p-6 h-fit shadow-sm">
          <div className="mb-5 border-b border-[#ECE8E2] pb-4">
            <h2 className="font-sans font-bold text-lg text-brand-navy">Interview Schedule</h2>
            <p className="mt-0.5 folio-mono text-[8.5px] text-[#6D6B8D] uppercase tracking-wider font-bold">Chronological list of sessions.</p>
          </div>
          
          <div className="space-y-6 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-[1.5px] before:bg-stone-200">
            {interviews.length === 0 ? (
              <div className="text-center py-6 text-xs folio-mono text-stone-400 font-bold">
                ✓ No interviews scheduled
              </div>
            ) : (
              interviews.map((interview) => {
                const statusColor = 
                  interview.status === 'Scheduled' || interview.status === 'Feedback Due'
                    ? 'bg-brand-orange'
                    : 'bg-brand-mint';

                return (
                  <article key={interview.id} className="relative pl-10 hover:translate-x-[2px] transition-transform duration-200">
                    {/* Timeline Node dot */}
                    <span className="absolute left-[11px] top-1.5 flex h-[9px] w-[9px] items-center justify-center rounded-full bg-white border-2 border-brand-purple ring-4 ring-[#F2EFEA]" />

                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex-1 min-w-[240px]">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h3 className="font-sans font-bold text-brand-navy text-sm leading-tight">
                            {interview.candidateName}
                          </h3>
                          <span className="flex items-center gap-1">
                            <span className={`h-1.5 w-1.5 rounded-full ${statusColor}`} />
                            <span className="folio-mono text-[8.5px] uppercase tracking-[0.1em] text-[#6D6B8D] font-bold">
                              {interview.status}
                            </span>
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-[11px] text-[#6D6B8D]">
                          <Briefcase className="h-3.5 w-3.5 opacity-70" strokeWidth={1.5} />
                          <span>{interview.jobTitle}</span>
                          <span>·</span>
                          <span className="font-bold text-brand-navy">{interview.stage}</span>
                        </div>
                      </div>
                      
                      {/* Selector */}
                      <div className="flex-shrink-0">
                        <select 
                          className="input py-2 text-xs font-bold folio-mono uppercase cursor-pointer max-w-[130px]" 
                          value={interview.status} 
                          onChange={(event) => void updateItem(interview.id, { status: event.target.value as Interview['status'] })}
                        >
                          <option>Scheduled</option>
                          <option>Feedback Due</option>
                          <option>Completed</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-4 pt-3.5 border-t border-[#ECE8E2]/60 grid gap-4 text-xs sm:grid-cols-4">
                      <Info icon={Clock3} label="Time" value={formatDateTime(interview.scheduledAt)} />
                      <Info icon={Video} label="Mode" value={interview.mode} />
                      <Info icon={CheckCircle2} label="Interviewer" value={interview.interviewer} />
                      <Info icon={CalendarPlus} label="ID Reference" value={`#${interview.candidateId.substring(0, 8)}`} />
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>

        {/* Right Column: Schedulers queue */}
        <section className="rounded-2xl border border-stone-200/60 bg-white p-6 h-fit shadow-sm">
          <div className="mb-5 border-b border-[#ECE8E2] pb-4">
            <h2 className="font-sans font-bold text-lg text-brand-navy">Ready to Schedule</h2>
            <p className="mt-0.5 folio-mono text-[8.5px] text-[#6D6B8D] uppercase tracking-wider font-bold">Candidates awaiting calendar bookings.</p>
          </div>
          <div className="space-y-3.5">
            {candidates.filter((candidate) => ['Shortlisted', 'Interviewing'].includes(candidate.status)).length === 0 ? (
              <div className="text-center py-6 text-xs folio-mono text-stone-400 font-bold border border-dashed border-[#ECE8E2] rounded-xl bg-stone-50/50">
                ✓ No candidates waiting
              </div>
            ) : (
              candidates
                .filter((candidate) => ['Shortlisted', 'Interviewing'].includes(candidate.status))
                .map((candidate) => (
                  <div key={candidate.id} className="rounded-xl border border-[#ECE8E2] bg-white p-4 hover:border-brand-purple transition-all duration-300 card-hover">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-navy text-white text-[10px] font-sans font-bold flex-shrink-0">
                          {candidate.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-sans font-bold text-brand-navy text-sm leading-tight">{candidate.name}</div>
                          <div className="mt-0.5 text-[10.5px] text-[#6D6B8D]">{candidate.jobTitle}</div>
                        </div>
                      </div>
                      <span className="flex h-5 min-w-[20px] items-center justify-center rounded-md bg-stone-50 px-2 py-0.5 folio-mono text-[7.5px] font-bold text-brand-orange border border-[#ECE8E2] uppercase">
                        {candidate.status}
                      </span>
                    </div>
                    <button 
                      onClick={() => openSchedulingModal(candidate)} 
                      className="mt-3.5 flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#ECE8E2] bg-stone-50/50 px-4 py-2 text-xs font-bold text-brand-navy hover:border-brand-purple hover:bg-brand-purple hover:text-white transition duration-150 cursor-pointer" 
                      type="button"
                    >
                      <CalendarPlus className="h-3.5 w-3.5" strokeWidth={1.5} />
                      Schedule Session
                    </button>
                  </div>
                ))
            )}
          </div>
        </section>
      </div>

      {/* Interview Scheduling Modal */}
      {isModalOpen && selectedCandidate && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
          <div className="bg-[#F8F6F2] rounded-2xl border border-stone-200 shadow-2xl w-full max-w-md p-6 relative animate-in fade-in zoom-in-95 duration-200 text-brand-navy">
            {/* Modal Header */}
            <div className="flex justify-between items-start mb-5 pb-3 border-b border-[#ECE8E2]">
              <div>
                <p className="folio-mono text-[9px] uppercase tracking-wider text-[#5B4FE9] font-bold">
                  Schedule Assessment
                </p>
                <h3 className="font-serif text-xl font-normal text-[#1A1A2E] mt-1">
                  Book Interview Slot
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-stone-200/50 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {/* Candidate Context Details */}
            <div className="bg-white rounded-xl p-3 border border-[#ECE8E2] mb-5 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-navy text-white text-xs font-sans font-bold flex-shrink-0">
                {selectedCandidate.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-sans font-bold text-xs text-brand-navy leading-tight">
                  {selectedCandidate.name}
                </h4>
                <p className="text-[10px] text-[#6D6B8D] mt-0.5">
                  {selectedCandidate.jobTitle}
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={(e) => void handleModalSubmit(e)} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                {/* Date */}
                <div>
                  <label className="folio-mono text-[8px] uppercase tracking-wider text-[#6D6B8D] font-bold block mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="input py-2 text-xs font-sans"
                  />
                </div>
                {/* Time */}
                <div>
                  <label className="folio-mono text-[8px] uppercase tracking-wider text-[#6D6B8D] font-bold block mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="input py-2 text-xs font-sans"
                  />
                </div>
              </div>

              {/* Interview Type */}
              <div>
                <label className="folio-mono text-[8px] uppercase tracking-wider text-[#6D6B8D] font-bold block mb-1">
                  Interview Type
                </label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value as Interview['stage'])}
                  className="input py-2 text-xs cursor-pointer font-bold select-custom font-sans"
                >
                  <option value="Recruiter Screen">Recruiter Screen</option>
                  <option value="Technical">Technical</option>
                  <option value="Hiring Manager">Hiring Manager</option>
                  <option value="Culture">Culture</option>
                </select>
              </div>

              {/* Interviewer */}
              <div>
                <label className="folio-mono text-[8px] uppercase tracking-wider text-[#6D6B8D] font-bold block mb-1">
                  Interviewer Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hiring Panel or Interviewer Name"
                  value={interviewer}
                  onChange={(e) => setInterviewer(e.target.value)}
                  className="input py-2 text-xs font-sans"
                />
              </div>

              {/* Mode */}
              <div>
                <label className="folio-mono text-[8px] uppercase tracking-wider text-[#6D6B8D] font-bold block mb-1">
                  Mode
                </label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as Interview['mode'])}
                  className="input py-2 text-xs cursor-pointer font-bold select-custom font-sans"
                >
                  <option value="Video">Video</option>
                  <option value="On-site">On-site</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#ECE8E2] flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="button-secondary py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="button-primary py-2"
                >
                  Confirm & Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-1.5">
      <Icon className="mt-0.5 h-3.5 w-3.5 text-brand-lavender" strokeWidth={1.5} />
      <div>
        <div className="folio-label text-[8px] uppercase tracking-[0.15em] text-[#6D6B8D] font-bold">{label}</div>
        <div className="mt-0.5 folio-mono text-xs font-bold text-brand-navy">{value}</div>
      </div>
    </div>
  );
}
