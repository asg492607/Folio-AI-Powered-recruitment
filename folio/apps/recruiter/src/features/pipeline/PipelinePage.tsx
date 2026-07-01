import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, UsersRound, MapPin, X, Sparkles, FileText, CalendarRange } from 'lucide-react';
import { useCollection } from '@/hooks/useCollection';
import type { Candidate, Job } from '@/types';
import { CandidateChat } from './CandidateChat';

const stages: Candidate['status'][] = ['Applied', 'Matched', 'Assessment Completed', 'Shortlisted', 'Interviewing', 'Offered', 'Hired'];

export default function PipelinePage() {
  const navigate = useNavigate();
  const { items: candidates, updateItem } = useCollection<Candidate>('candidates');
  const { items: jobs } = useCollection<Job>('jobs');
  
  const [selectedJobId, setSelectedJobId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [notes, setNotes] = useState('');
  
  // Drag and Drop State
  const [draggedCandidate, setDraggedCandidate] = useState<Candidate | null>(null);
  const [dragOverStage, setDragOverStage] = useState<Candidate['status'] | null>(null);

  const handleDragStart = (e: React.DragEvent, candidate: Candidate) => {
    setDraggedCandidate(candidate);
    e.dataTransfer.effectAllowed = 'move';
    // Small delay to allow the drag ghost to generate before adding styles
    setTimeout(() => {
      if (e.target instanceof HTMLElement) {
        e.target.classList.add('opacity-50');
      }
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedCandidate(null);
    setDragOverStage(null);
    if (e.target instanceof HTMLElement) {
      e.target.classList.remove('opacity-50');
    }
  };

  const handleDrop = async (e: React.DragEvent, stage: Candidate['status']) => {
    e.preventDefault();
    setDragOverStage(null);
    if (!draggedCandidate || draggedCandidate.status === stage) {
      setDraggedCandidate(null);
      return;
    }
    
    const newHistory = [...((draggedCandidate as any).statusHistory || []), { status: stage, timestamp: new Date().toISOString() }];
    
    await updateItem(draggedCandidate.id, { 
      status: stage,
      statusHistory: newHistory
    } as any);
    
    if (selectedCandidate?.id === draggedCandidate.id) {
      setSelectedCandidate({ ...selectedCandidate, status: stage, statusHistory: newHistory } as any);
    }
    
    setDraggedCandidate(null);
  };

  const advanceCandidate = async (candidate: Candidate) => {
    const currentIndex = stages.indexOf(candidate.status);
    const textNext = stages[Math.min(currentIndex + 1, stages.length - 1)];
    const newHistory = [...((candidate as any).statusHistory || []), { status: textNext, timestamp: new Date().toISOString() }];
    
    await updateItem(candidate.id, { 
      status: textNext,
      statusHistory: newHistory
    } as any);
    
    if (selectedCandidate?.id === candidate.id) {
      setSelectedCandidate({ ...selectedCandidate, status: textNext, statusHistory: newHistory } as any);
    }
  };

  const handleCardClick = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    // Since candidate.notes might not exist, default to empty string
    setNotes((candidate as any).notes || '');
  };

  const handleNotesBlur = async () => {
    if (selectedCandidate) {
      await updateItem(selectedCandidate.id, { notes } as any);
      // Update local state of jobs/candidates if needed
    }
  };

  return (
    <div className="space-y-6 w-full mx-auto">
      {/* Page Header */}
      <header className="border-b border-[#ECE8E2] pb-6 mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="mb-2 text-[22px] font-bold text-[#1A1C2E]"
          style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}>
            Pipeline Flow
          </h1>
          <p className="max-w-3xl text-[15px] leading-relaxed text-[#1A1C2E99]">
            Coordinate automated profile intakes, examine match ratios, and advance candidates through evaluation nodes.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-shrink-0 bg-[#FCFBF9] p-2 rounded-2xl border border-[#ECE8E2] shadow-sm">
          <div className="relative">
            <input
              type="text"
              placeholder="Search candidate..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-3 pr-3 py-1.5 text-xs font-sans w-[180px] bg-white border border-[#ECE8E2] rounded-xl shadow-sm focus:outline-none focus:border-brand-purple"
            />
          </div>
          <div className="h-4 w-px bg-[#ECE8E2]" />
          <div className="flex items-center gap-2">
            <span className="folio-mono text-[9px] uppercase tracking-wider text-[#6D6B8D] font-bold">Job:</span>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="py-1.5 px-2 text-xs font-bold cursor-pointer min-w-[150px] bg-white border border-[#ECE8E2] rounded-xl shadow-sm focus:outline-none"
            >
              <option value="">All Requisitions</option>
              {jobs.map(job => (
                <option key={job.id} value={job.id}>{job.title}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Top Metrics Row - Compact */}
      <section className="grid gap-6 md:grid-cols-3">
        {/* Pipeline Health */}
        <div className="p-5 rounded-2xl border border-[#ECE8E2] bg-white transition-all duration-300 card-hover flex flex-col justify-between min-h-[130px] shadow-sm">
          <div className="flex items-start justify-between">
            <span className="folio-meta text-[#6D6B8D] uppercase">
              Pipeline Health
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-50 border border-[#ECE8E2]">
              <UsersRound className="h-3.5 w-3.5 text-[#6D6B8D]" strokeWidth={1.5} />
            </div>
          </div>
          <div className="mt-2">
            <div className="font-serif text-3xl font-normal tracking-tight text-brand-navy">
              {candidates.length}
            </div>
            <p className="text-[11px] text-[#6D6B8D] font-sans mt-1">
              active candidates in process
            </p>
          </div>
        </div>

        {/* Top Match */}
        <div className="p-5 rounded-2xl border border-[#ECE8E2] bg-white transition-all duration-300 card-hover flex flex-col justify-between min-h-[130px] shadow-sm">
          <div className="flex items-start justify-between">
            <span className="folio-meta text-[#6D6B8D] uppercase">
              Top Match Ratio
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-purple/5 border border-brand-purple/10">
              <ArrowRight className="h-3.5 w-3.5 text-brand-purple" strokeWidth={1.5} />
            </div>
          </div>
          <div className="mt-2">
            <div className="font-serif text-3xl font-normal tracking-tight text-brand-purple">
              {candidates.length ? Math.max(0, ...candidates.map((candidate) => candidate.matchScore)) : 0}%
            </div>
            <p className="text-[11px] text-[#6D6B8D] font-sans mt-1">
              highest compatibility score
            </p>
          </div>
        </div>

        {/* Offer Queue */}
        <div className="p-5 rounded-2xl border border-[#ECE8E2] bg-white transition-all duration-300 card-hover flex flex-col justify-between min-h-[130px] shadow-sm">
          <div className="flex items-start justify-between">
            <span className="folio-meta text-[#6D6B8D] uppercase">
              Offers Dispatched
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-orange/5 border border-brand-orange/10">
              <CheckCircle2 className="h-3.5 w-3.5 text-brand-orange" strokeWidth={1.5} />
            </div>
          </div>
          <div className="mt-2">
            <div className="font-serif text-3xl font-normal tracking-tight text-brand-orange">
              {candidates.filter((candidate) => candidate.status === 'Offered').length}
            </div>
            <p className="text-[11px] text-[#6D6B8D] font-sans mt-1">
              awaiting approval
            </p>
          </div>
        </div>
      </section>

      {/* Kanban Board */}
    <section className="flex gap-4 pb-6 overflow-x-auto select-none w-full scrollbar-thin scrollbar-thumb-stone-200">
      {stages.map((stage) => {
        // Filter candidates by stage, job requisition, and search query
        const stageCandidates = candidates.filter((candidate) => {
          const matchesStage = candidate.status === stage;
          const matchesJob = !selectedJobId || candidate.jobId === selectedJobId;
          const matchesSearch = !searchQuery || 
            candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            candidate.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());
          return matchesStage && matchesJob && matchesSearch;
        });

        const stageColorClass = 
          stage === 'Applied'
            ? 'text-stone-500'
            : stage === 'Matched' || stage === 'Assessment Completed'
            ? 'text-brand-purple'
            : stage === 'Shortlisted' || stage === 'Interviewing' || stage === 'Offered'
            ? 'text-brand-orange'
            : stage === 'Hired'
            ? 'text-brand-mint'
            : 'text-brand-navy';

        return (
          <div 
            key={stage} 
            className={`flex flex-col w-[280px] min-w-[260px] max-w-[300px] flex-shrink-0 bg-[#FCFBF9] rounded-xl p-4 border shadow-sm transition-all duration-300 ${dragOverStage === stage ? 'border-brand-purple bg-brand-purple/5 shadow-md scale-[1.02]' : 'border-[#ECE8E2]'}`}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
            }}
            onDragEnter={(e) => {
              e.preventDefault();
              if (draggedCandidate && draggedCandidate.status !== stage) {
                setDragOverStage(stage);
              }
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              // Only reset if we are leaving the column itself, not entering a child element
              if (e.currentTarget === e.target) {
                setDragOverStage(null);
              }
            }}
            onDrop={(e) => handleDrop(e, stage)}
          >
            {/* Column Header */}
            <div className="mb-4 flex items-center justify-between border-b border-[#ECE8E2] pb-2.5 px-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <h2 className={`folio-meta text-[11px] font-bold uppercase truncate tracking-wider ${stageColorClass}`}>
                  {stage}
                </h2>
              </div>
              <span className="flex h-5 min-w-[22px] items-center justify-center rounded-full bg-brand-navy/5 px-1.5 folio-mono text-[10px] font-bold text-brand-navy/60 border border-brand-navy/10 flex-shrink-0">
                {stageCandidates.length}
              </span>
            </div>

            {/* Column Cards / Empty states */}
            <div className="space-y-3.5 flex-1 flex flex-col justify-start pattern-grid-isolated">
              {stageCandidates.length === 0 ? (
                /* Premium Empty State System */
                <div className="flex flex-col items-center justify-center py-8 px-3 border border-dashed border-[#ECE8E2] rounded-xl bg-white/40 text-center flex-1 min-h-[150px]">
                  <span className="folio-meta text-[9px] font-bold text-stone-400 uppercase tracking-widest block">✓ Empty</span>
                  <p className="text-[10px] text-stone-400 font-sans mt-1 leading-relaxed">No candidates in this stage</p>
                </div>
              ) : (
                stageCandidates.map((candidate) => (
                  <article
                    key={candidate.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, candidate)}
                    onDragEnd={handleDragEnd}
                    onClick={() => handleCardClick(candidate)}
                    className="rounded-xl border border-[#ECE8E2] bg-white p-3.5 hover:translate-y-[-3px] transition-all duration-200 shadow-sm hover:shadow-md hover:border-brand-purple/35 flex flex-col justify-between min-h-[185px] cursor-grab active:cursor-grabbing"
                  >
                    <div>
                      {/* Top: Avatar circle & score circle badge */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-navy text-white text-[11px] font-sans font-bold flex-shrink-0 shadow-sm">
                          {candidate.name.charAt(0)}
                        </div>
                        
                        <span className="folio-mono text-[8px] font-bold text-brand-purple bg-brand-purple/10 border border-brand-purple/20 px-2 py-0.5 rounded-full flex-shrink-0">
                          {candidate.matchScore}% MATCH
                        </span>
                      </div>

                      {/* Name and Role title */}
                      <div className="mb-2.5 min-w-0">
                        <h3 className="font-sans font-bold text-brand-navy text-[13px] leading-snug truncate" title={candidate.name}>
                          {candidate.name}
                        </h3>
                        <p className="font-sans text-[10.5px] text-[#6D6B8D] mt-0.5 truncate" title={candidate.jobTitle}>
                          {candidate.jobTitle}
                        </p>
                      </div>

                      {/* Skill Pills */}
                      {candidate.skills && candidate.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2.5">
                          {candidate.skills.slice(0, 2).map((skill, index) => (
                            <span key={index} className="text-[9px] font-medium font-mono text-stone-500 bg-stone-50 border border-stone-200/60 px-1.5 py-0.5 rounded truncate max-w-[90px]">
                              {skill}
                            </span>
                          ))}
                          {candidate.skills.length > 2 && (
                            <span className="text-[9px] font-medium font-mono text-stone-400 bg-stone-50 border border-stone-200/60 px-1.5 py-0.5 rounded flex-shrink-0">
                              +{candidate.skills.length - 2}
                            </span>
                          )}
                        </div>
                      )}

                      {/* AI Recommended Badge indicator */}
                      {candidate.matchScore >= 85 && (
                        <div className="mb-2.5 inline-flex items-center gap-1 rounded bg-brand-purple/5 border border-brand-purple/10 px-1.5 py-0.5">
                          <span className="h-1 w-1 rounded-full bg-brand-purple" />
                          <span className="folio-mono text-[7px] uppercase tracking-wider text-brand-purple font-bold whitespace-nowrap">
                            AI RECOMMEND
                          </span>
                        </div>
                      )}

                      {/* Metadata location & source */}
                      <div className="flex items-center gap-1.5 text-[9px] text-stone-400 font-sans mb-3 min-w-0">
                        <span className="flex items-center gap-0.5 truncate max-w-[95px]">
                          <MapPin className="h-2.5 w-2.5 flex-shrink-0" />
                          {candidate.location}
                        </span>
                        <span className="flex-shrink-0">·</span>
                        <span className="truncate max-w-[95px]">{candidate.source}</span>
                      </div>
                    </div>

                    {/* Direct CTA or Progress Bar */}
                    <div className="mt-auto pt-2.5 border-t border-stone-100 flex flex-col gap-2">
                      {candidate.status === 'Offered' ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/offers?candidateId=${candidate.id}`);
                          }}
                          className="flex w-full items-center justify-center gap-1 rounded-lg border border-brand-purple/20 bg-brand-purple/5 px-2 py-1 text-[10px] font-bold text-brand-purple hover:bg-brand-purple hover:text-white transition duration-150 cursor-pointer shadow-sm"
                        >
                          <FileText className="h-3 w-3" />
                          Configure Offer
                        </button>
                      ) : (
                        <div className="flex items-center justify-between gap-2.5 w-full">
                          <div className="flex-1">
                            <div className="h-1 rounded-full bg-[#ECE8E2] overflow-hidden">
                              <div
                                className="h-1 rounded-full bg-brand-purple"
                                style={{ width: `${candidate.matchScore}%` }}
                              />
                            </div>
                          </div>
                          
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              void advanceCandidate(candidate);
                            }}
                            disabled={candidate.status === 'Hired'}
                            className="flex h-6 w-6 items-center justify-center rounded-lg bg-stone-50 border border-[#ECE8E2] text-brand-navy transition duration-150 hover:bg-brand-purple hover:text-white disabled:opacity-40 disabled:hover:bg-stone-50 disabled:hover:text-brand-navy cursor-pointer flex-shrink-0"
                            title="Advance stage"
                          >
                            <ArrowRight className="h-3 w-3" strokeWidth={2} />
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        );
      })}
    </section>

      {/* Drawer Overlay Backdrop */}
      {selectedCandidate && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40 transition-opacity"
          onClick={() => setSelectedCandidate(null)}
        />
      )}

      {/* Sliding Candidate Detail Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[500px] bg-[#F8F6F2] shadow-2xl z-50 border-l border-slate-200 transition-transform duration-300 ease-out transform p-6 overflow-y-auto flex flex-col justify-between
          ${selectedCandidate ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {selectedCandidate && (
          <div className="flex flex-col h-full justify-between text-brand-navy">
            <div>
              {/* Drawer Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[9px] font-mono tracking-widest text-[#5B4FE9] uppercase font-bold">
                    Candidate Intelligence
                  </span>
                  <h2 className="text-2xl text-[#1A1A2E] mt-1 font-serif font-light leading-none">
                    Profile Details
                  </h2>
                </div>
                <button 
                  onClick={() => setSelectedCandidate(null)}
                  className="p-1.5 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {/* Summary Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-5 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#151633] text-white flex items-center justify-center font-bold text-lg border shadow-sm">
                    {selectedCandidate.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-base text-[#1A1A2E] leading-snug">{selectedCandidate.name}</h3>
                    <p className="text-xs text-slate-500 leading-snug">{selectedCandidate.jobTitle}</p>
                  </div>
                  <div className="ml-auto bg-[#5B4FE9]/10 text-[#5B4FE9] text-xs font-mono px-2.5 py-1 rounded font-semibold border border-[#5B4FE9]/20">
                    {selectedCandidate.matchScore}% Match
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="text-stone-400 font-mono text-[9px] uppercase">Email:</span>
                    <span className="font-sans text-brand-navy font-bold">{selectedCandidate.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-stone-400 font-mono text-[9px] uppercase">Details:</span>
                    <span className="font-sans text-brand-navy font-bold">{selectedCandidate.location} · {selectedCandidate.source}</span>
                  </div>
                </div>
              </div>

              {/* AI Assessment Info */}
              <div className="bg-[#5B4FE9]/5 border border-[#5B4FE9]/10 rounded-2xl p-5 mb-5">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Sparkles className="w-4 h-4 text-[#5B4FE9]" />
                  <h4 className="text-[10px] font-mono font-bold tracking-wider text-[#5B4FE9] uppercase">
                    AI Match Assessment
                  </h4>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed font-sans">
                  Candidate shows strong competency alignment ({selectedCandidate.matchScore}%) for the <strong>{selectedCandidate.jobTitle}</strong> role. Resume analysis indicates key strengths in: <strong>{selectedCandidate.skills.join(', ')}</strong>.
                </p>
              </div>

              {/* Experience Timeline */}
              <div className="mb-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-xs">
                <h4 className="text-[9px] font-mono tracking-widest text-slate-400 uppercase mb-3 font-bold">
                  Experience Timeline
                </h4>
                <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-stone-200">
                  <div className="relative pl-6">
                    <span className="absolute left-[5px] top-1.5 flex h-2 w-2 rounded-full bg-brand-purple" />
                    <span className="font-bold text-brand-navy block">Senior Frontend Engineer</span>
                    <span className="text-stone-500 text-[10.5px]">Global Tech Corp · 2024 - Present (2 yrs)</span>
                  </div>
                  <div className="relative pl-6">
                    <span className="absolute left-[5px] top-1.5 flex h-2 w-2 rounded-full bg-stone-400" />
                    <span className="font-bold text-brand-navy block">Frontend Developer</span>
                    <span className="text-stone-500 text-[10.5px]">Standard Apps Inc · 2022 - 2024 (2 yrs)</span>
                  </div>
                </div>
              </div>

              {/* Interview History */}
              <div className="mb-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-xs">
                <h4 className="text-[9px] font-mono tracking-widest text-slate-400 uppercase mb-3 font-bold">
                  Evaluation History
                </h4>
                <div className="space-y-2 text-[11px] text-stone-600">
                  <div className="flex justify-between items-center py-1 border-b border-stone-50">
                    <span className="font-sans font-medium">Recruiter Screen</span>
                    <span className="font-mono text-brand-mint font-bold uppercase">Passed</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-stone-50">
                    <span className="font-sans font-medium">Technical Assessment</span>
                    <span className="font-mono text-brand-mint font-bold uppercase">Passed (85%)</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="font-sans font-medium">Competency Blueprint Fit</span>
                    <span className="font-mono text-brand-purple font-bold uppercase">High Alignment</span>
                  </div>
                </div>
              </div>

              {/* Recruiter Notes Input */}
              <div className="mb-5">
                <h4 className="text-[9px] font-mono tracking-widest text-slate-400 uppercase mb-2 font-bold">
                  Recruiter Assessment Notes (Auto-saves)
                </h4>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onBlur={handleNotesBlur}
                  className="input w-full min-h-24 resize-none font-sans text-xs p-3.5 bg-white border-slate-200 shadow-inner"
                />
              </div>

              {/* Chat Integration */}
              <div className="mb-5 h-[350px]">
                <CandidateChat applicationId={selectedCandidate.id} />
              </div>
            </div>

            {/* Drawer Sticky Bottom Actions */}
            <div className="pt-4 border-t border-slate-200 mt-auto">
              {selectedCandidate.status === 'Offered' ? (
                <button 
                  onClick={() => {
                    setSelectedCandidate(null);
                    navigate(`/offers?candidateId=${selectedCandidate.id}`);
                  }}
                  className="w-full bg-brand-purple hover:bg-brand-orange text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <FileText className="w-4 h-4" />
                  Configure Compensation Offer
                </button>
              ) : selectedCandidate.status === 'Shortlisted' ? (
                <button 
                  onClick={() => {
                    setSelectedCandidate(null);
                    navigate('/interviews');
                  }}
                  className="w-full bg-brand-orange hover:bg-brand-purple text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <CalendarRange className="w-4 h-4" />
                  Book Interview Calendar
                </button>
              ) : (
                <button 
                  onClick={() => void advanceCandidate(selectedCandidate)}
                  disabled={selectedCandidate.status === 'Hired'}
                  className="w-full button-primary py-3.5 flex items-center justify-center font-bold text-xs uppercase tracking-wider cursor-pointer disabled:opacity-40"
                >
                  Advance Candidate Stage
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
