import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { useApplicationStore } from '../../store/applicationStore';
import { useOpportunityStore } from '../../store/opportunityStore';
import type { Application, ApplicationStatus } from '../../types';
import { useEffect } from 'react';
import { useCandidateStore } from '../../store/candidateStore';
import { ApplicationChat } from './ApplicationChat';

const stages: { status: ApplicationStatus; label: string; step: number }[] = [
  { status: 'applied', label: 'Applied', step: 1 },
  { status: 'viewed', label: 'Viewed', step: 2 },
  { status: 'under_review', label: 'Under Review', step: 3 },
  { status: 'shortlisted', label: 'Shortlisted', step: 4 },
  { status: 'interview_scheduled', label: 'Interview', step: 5 },
  { status: 'selected', label: 'Decision', step: 6 },
];

const statusLabels: Record<string, string> = {
  applied: 'APPLIED',
  viewed: 'VIEWED',
  under_review: 'UNDER REVIEW',
  shortlisted: 'SHORTLISTED',
  interview_scheduled: 'INTERVIEW',
  selected: 'SELECTED',
  rejected: 'REJECTED',
};

const statusColors: Record<string, string> = {
  applied: 'app-status-badge--applied',
  viewed: 'app-status-badge--viewed',
  under_review: 'app-status-badge--review',
  shortlisted: 'app-status-badge--shortlisted',
  interview_scheduled: 'app-status-badge--interview',
  selected: 'app-status-badge--selected',
  rejected: 'app-status-badge--rejected',
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getTimeLabel(status: string, timestamp: string, isCurrent: boolean) {
  if (isCurrent) return 'Now';
  const date = new Date(timestamp);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 1) return 'Today';
  if (diffDays < 7) return 'Done';
  return formatDate(timestamp);
}

export function ApplicationTracking() {
  const navigate = useNavigate();
  const applications = useApplicationStore((state) => state.applications);
  const opportunities = useOpportunityStore((state) => state.opportunities);
  const [selectedId, setSelectedId] = useState<string>(applications[0]?.id || '');
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const [withdrawnIds, setWithdrawnIds] = useState<string[]>([]);
  const fetchApplications = useApplicationStore((state) => state.fetchApplications);
  const candidate = useCandidateStore((state) => state.candidate);

  useEffect(() => {
    if (candidate?.id) {
      fetchApplications(candidate.id);
    }
  }, [candidate?.id, fetchApplications]);

  const selectedApp = applications.find((a) => a.id === selectedId) || applications[0];
  const selectedOpp = selectedApp
    ? opportunities.find((o) => o.id === selectedApp.opportunityId)
    : undefined;

  const currentStageIndex = selectedApp
    ? stages.findIndex((s) => s.status === selectedApp.status)
    : -1;

  return (
    <div className="flex min-h-screen flex-col bg-chalk">
      <PageHeader title="Applications" />

      <div className="p-8 pb-20 animate-slide-up">
        <h2 className="font-sans text-[22px] font-semibold text-navy mb-6">Applications</h2>

        <div className="app-tracking-layout">
          {/* Left: Application list */}
          <div className="app-list">
            {applications.map((app) => {
              const opp = opportunities.find((o) => o.id === app.opportunityId);
              const isSelected = app.id === selectedId;
              const isWithdrawn = withdrawnIds.includes(app.id);
              return (
                <button
                  key={app.id}
                  className={`app-list-item ${isSelected ? 'app-list-item--active' : ''}`}
                  onClick={() => { setSelectedId(app.id); setShowWithdrawConfirm(false); }}
                >
                  <div className="app-list-item-info">
                    <span className="app-list-item-title">{opp?.title ?? 'Role'}</span>
                    <span className="app-list-item-company">{opp?.companyName ?? 'Company'}</span>
                    <span className="app-list-item-date">Applied {formatDate(app.appliedAt)}</span>
                  </div>
                  <span className={`app-status-badge ${isWithdrawn ? 'app-status-badge--withdrawn' : statusColors[app.status]}`}>
                    {isWithdrawn ? 'WITHDRAWN' : statusLabels[app.status]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right: Detail panel */}
          {selectedApp && selectedOpp && (
            <div className="app-detail">
              {/* Company avatar + title */}
              <div className="app-detail-header">
                <div className="app-detail-avatar">
                  {selectedOpp.companyName.charAt(0)}
                </div>
                <div>
                  <h3 className="app-detail-title">{selectedOpp.title}</h3>
                  <p className="app-detail-company">{selectedOpp.companyName}</p>
                </div>
              </div>

              {/* Stepper timeline */}
              <div className="app-stepper">
                {stages.map((stage, index) => {
                  const isCompleted = index < currentStageIndex;
                  const isCurrent = index === currentStageIndex;
                  const isPending = index > currentStageIndex;
                  return (
                    <div key={stage.status} className="app-stepper-step">
                      {/* Connector line (not on first) */}
                      {index > 0 && (
                        <div className={`app-stepper-line ${isCompleted || isCurrent ? 'app-stepper-line--done' : ''}`} />
                      )}
                      {/* Circle */}
                      <div
                        className={`app-stepper-circle ${isCompleted
                            ? 'app-stepper-circle--done'
                            : isCurrent
                              ? 'app-stepper-circle--current'
                              : 'app-stepper-circle--pending'
                          }`}
                      >
                        {isCompleted ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          <span className="app-stepper-number">{stage.step}</span>
                        )}
                      </div>
                      {/* Label */}
                      <span
                        className={`app-stepper-label ${
                          isCompleted
                            ? 'app-stepper-label--done'
                            : isCurrent
                              ? 'app-stepper-label--current'
                              : ''
                        }`}
                      >
                        {stage.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Status history */}
              <div className="app-history">
                {selectedApp.statusHistory.map((entry, index) => {
                  const isLast = index === selectedApp.statusHistory.length - 1 && !withdrawnIds.includes(selectedApp.id);
                  const label = statusLabels[entry.status] || entry.status;
                  const displayLabel = label.charAt(0) + label.slice(1).toLowerCase();
                  return (
                    <div key={entry.status} className={`app-history-item ${isLast ? 'app-history-item--current' : ''}`}>
                      <div className={`app-history-icon ${isLast ? 'app-history-icon--current' : 'app-history-icon--done'}`}>
                        <CheckCircle2 className="app-history-check" />
                      </div>
                      <span className="app-history-label">{displayLabel}</span>
                      <span className="app-history-time">
                        {getTimeLabel(entry.status, entry.timestamp, isLast)}
                      </span>
                    </div>
                  );
                })}
                {withdrawnIds.includes(selectedApp.id) && (
                  <div className="app-history-item app-history-item--withdrawn">
                    <div className="app-history-icon app-history-icon--withdrawn">
                      <CheckCircle2 className="app-history-check" />
                    </div>
                    <span className="app-history-label" style={{ color: '#e53935' }}>Withdrawn</span>
                    <span className="app-history-time">Now</span>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="app-detail-actions">
                <button className="app-detail-btn app-detail-btn--outline">View role</button>
                {withdrawnIds.includes(selectedApp.id) ? (
                  <span className="app-detail-withdrawn-text">Withdrawn</span>
                ) : showWithdrawConfirm ? (
                  <div className="app-withdraw-confirm">
                    <span className="app-withdraw-confirm-text">Withdraw from this role?</span>
                    <button
                      className="app-withdraw-confirm-btn app-withdraw-confirm-btn--yes"
                      onClick={() => {
                        setWithdrawnIds([...withdrawnIds, selectedApp.id]);
                        setShowWithdrawConfirm(false);
                      }}
                    >
                      Confirm
                    </button>
                    <button
                      className="app-withdraw-confirm-btn app-withdraw-confirm-btn--no"
                      onClick={() => setShowWithdrawConfirm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    className="app-detail-btn app-detail-btn--text"
                    onClick={() => setShowWithdrawConfirm(true)}
                  >
                    Withdraw
                  </button>
                )}
              </div>
              </div>

              {/* Assessment Gating */}
              {(selectedApp.status || '').toLowerCase() === 'matched' && (
                <div className="mt-8 rounded-2xl bg-[#5B4FE9]/5 border border-[#5B4FE9]/10 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in shadow-sm">
                  <div className="flex gap-4 items-center">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-[#5B4FE9]/10 flex items-center justify-center text-[#5B4FE9]">
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <h4 className="text-[#1A1A2E] font-bold text-sm mb-0.5">AI Assessment Requested</h4>
                      <p className="text-stone-500 text-xs">The recruiter has requested you to complete an AI capability assessment.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate('/assessments', { state: { jobId: selectedOpp.id, companyName: selectedOpp.companyName } })}
                    className="shrink-0 bg-[#5B4FE9] hover:bg-[#5B4FE9]/90 text-white rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors shadow-md"
                  >
                    Start Assessment <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Chat Integration */}
            <div className="mt-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <ApplicationChat applicationId={selectedApp.id} />
            </div>
          </div>)}
        </div>
      </div>
    </div>
  );
}
