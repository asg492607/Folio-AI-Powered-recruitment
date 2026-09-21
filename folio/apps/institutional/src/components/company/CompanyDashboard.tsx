import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Avatar, CompanyBadge } from '../Avatar';
import { 
  Briefcase, 
  Plus, 
  Users, 
  AlertCircle, 
  ChevronRight, 
  Award, 
  Sparkles, 
  ExternalLink,
  Search,
  Check,
  X,
  Trash2
} from 'lucide-react';
import type { PlacementRoundConfig, PlacementRoundType, CampusDrive } from '../../types';

export const CompanyDashboard: React.FC = () => {
  const { 
    activeCompany, 
    activeInstitution,
    drives, 
    createPlacementDrive, 
    applications, 
    advanceCandidateRound, 
    rejectCandidate, 
    offerCandidatePlacement
  } = useApp();

  const [activeTab, setActiveTab] = useState<'drives' | 'pipeline' | 'builder'>('pipeline');
  const [selectedDriveId, setSelectedDriveId] = useState<string>(drives[0]?.id || '');
  const [selectedAppId, setSelectedAppId] = useState<string>('');
  const [filterStage, setFilterStage] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Round Evaluation Modal / Form State
  const [evalScore, setEvalScore] = useState<number>(88);
  const [evalNotes, setEvalNotes] = useState<string>('Candidate demonstrated exceptional design system component mastery and typographic consistency.');
  const [showOfferModal, setShowOfferModal] = useState<boolean>(false);
  const [offerLpa, setOfferLpa] = useState<string>('18.5 LPA');
  const [offerRoleTitle, setOfferRoleTitle] = useState<string>('Associate Product Designer');
  const [offerJoiningDate, setOfferJoiningDate] = useState<string>('2026-07-01');

  // New Drive Form State with Placement Round Builder
  const [newTitle, setNewTitle] = useState('');
  const [newDiscipline, setNewDiscipline] = useState('UI/UX & Product Design');
  const [newJobType, setNewJobType] = useState<CampusDrive['jobType']>('Full-Time FTE');
  const [newPackage, setNewPackage] = useState('18.0 LPA');
  const [newLocation, setNewLocation] = useState('Bengaluru / Hybrid');
  const [newOpenings, setNewOpenings] = useState(4);
  const [newDeadline, setNewDeadline] = useState('2026-11-15');
  const [newMinPortfolio, setNewMinPortfolio] = useState(75);
  const [newMinCgpa, setNewMinCgpa] = useState(7.5);
  const [newDescription, setNewDescription] = useState('');

  // Placement Round Builder State
  const [builderRounds, setBuilderRounds] = useState<PlacementRoundConfig[]>([
    {
      id: 'rnd-build-1',
      roundNumber: 1,
      name: 'Portfolio & Prerequisite Screening',
      type: 'Screening',
      description: 'Automated verification of portfolio score and academic criteria',
      scheduledDate: '2026-11-20',
      maxQualifiers: 40
    },
    {
      id: 'rnd-build-2',
      roundNumber: 2,
      name: 'Case Study & UX Rigor Teardown',
      type: 'Portfolio Review',
      description: 'Panel evaluation of problem framing, wireframing, and user research',
      scheduledDate: '2026-11-24',
      maxQualifiers: 15
    },
    {
      id: 'rnd-build-3',
      roundNumber: 3,
      name: '48-Hour Live Design Challenge',
      type: 'Design Challenge',
      description: 'Deliver high-fidelity interactive prototype in Figma',
      scheduledDate: '2026-11-28',
      maxQualifiers: 6
    },
    {
      id: 'rnd-build-4',
      roundNumber: 4,
      name: 'Studio Design Leadership Interview',
      type: 'Design Interview',
      description: 'System thinking, team dynamics, and craft philosophy',
      scheduledDate: '2026-12-02',
      maxQualifiers: 4
    }
  ]);

  const activeDrive = drives.find(d => d.id === selectedDriveId) || drives[0];
  const driveApplications = applications.filter(a => a.driveId === (activeDrive?.id || ''));

  const filteredApps = driveApplications.filter(app => {
    const matchesStage = filterStage === 'all' || app.status.toLowerCase() === filterStage.toLowerCase();
    const matchesSearch = app.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.studentRollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStage && matchesSearch;
  });

  const selectedApp = applications.find(a => a.id === selectedAppId) || filteredApps[0];

  const handleAddRound = () => {
    const nextNum = builderRounds.length + 1;
    const newRound: PlacementRoundConfig = {
      id: `rnd-${Date.now()}`,
      roundNumber: nextNum,
      name: `Round ${nextNum}: Technical Evaluation`,
      type: 'Design Interview',
      description: 'Custom evaluation stage defined by hiring team',
      scheduledDate: '2026-12-05',
      maxQualifiers: 4
    };
    setBuilderRounds([...builderRounds, newRound]);
  };

  const handleRemoveRound = (idx: number) => {
    if (builderRounds.length <= 1) return;
    const updated = builderRounds.filter((_, i) => i !== idx).map((r, i) => ({
      ...r,
      roundNumber: i + 1
    }));
    setBuilderRounds(updated);
  };

  const handleCreateDriveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    createPlacementDrive({
      companyId: activeCompany.id,
      companyName: activeCompany.name,
      companyLogo: activeCompany.logo,
      roleTitle: newTitle,
      designDiscipline: newDiscipline,
      jobType: newJobType,
      packageLpa: newPackage,
      location: newLocation,
      applicationDeadline: newDeadline,
      driveDate: builderRounds[0]?.scheduledDate || '2026-11-20',
      openings: newOpenings,
      eligibility: {
        minPortfolioScore: newMinPortfolio,
        minCgpa: newMinCgpa,
        minReadiness: 70,
        allowedDepartments: [
          'B.Des User Experience & Interaction Design',
          'B.Des Industrial & Product Design',
          'B.Des Visual Communication & Graphic Design'
        ],
        graduationYear: 2026,
        requiredSkills: ['Figma', 'UX Research', 'Design Systems'],
        requiredTools: ['Figma']
      },
      approvedInstitutionIds: [activeInstitution.id],
      status: 'Active',
      description: newDescription || `Exciting design opportunity at ${activeCompany.name} focusing on craft, usability, and scale.`,
      rounds: builderRounds
    });

    setActiveTab('drives');
    alert(`Placement drive "${newTitle}" with ${builderRounds.length} rounds published to ${activeInstitution.name}!`);
  };

  const handleAdvance = () => {
    if (!selectedApp || !activeDrive) return;
    const nextIdx = selectedApp.currentRoundIndex + 1;
    advanceCandidateRound(selectedApp.id, nextIdx, evalScore, evalNotes);
  };

  const handleReject = () => {
    if (!selectedApp) return;
    const reason = prompt('Please enter rejection feedback for the candidate:', 'Portfolio craft does not align with team requirements at this stage.');
    if (reason) {
      rejectCandidate(selectedApp.id, reason);
    }
  };

  const handleOfferSubmit = () => {
    if (!selectedApp) return;
    offerCandidatePlacement(selectedApp.id, {
      packageLpa: offerLpa,
      roleTitle: offerRoleTitle,
      joiningDate: offerJoiningDate,
      acceptanceDeadline: '2026-11-30'
    });
    setShowOfferModal(false);
  };

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto', padding: '24px' }}>
      {/* Recruiter Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 24,
        paddingBottom: 20,
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <CompanyBadge name={activeCompany.name} size={48} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                {activeCompany.name}
              </h1>
              <span style={{
                padding: '2px 8px',
                borderRadius: 4,
                background: activeCompany.verified ? 'var(--success-bg)' : 'var(--warning-bg)',
                color: activeCompany.verified ? 'var(--success-text)' : 'var(--warning-text)',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                {activeCompany.verified ? 'VERIFIED CAMPUS RECRUITER' : 'PENDING TPO VERIFICATION'}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {activeCompany.industry} • CIN: <span style={{ fontFamily: 'var(--font-mono)' }}>{activeCompany.cin}</span> • Partnered with {activeInstitution.name}
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setActiveTab('pipeline')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              background: activeTab === 'pipeline' ? 'var(--accent-primary)' : 'var(--bg-surface-elevated)',
              color: activeTab === 'pipeline' ? '#fff' : 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            <Users size={16} />
            <span>Candidate Evaluation Desk</span>
          </button>

          <button
            onClick={() => setActiveTab('drives')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              background: activeTab === 'drives' ? 'var(--accent-primary)' : 'var(--bg-surface-elevated)',
              color: activeTab === 'drives' ? '#fff' : 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            <Briefcase size={16} />
            <span>Campus Drives ({drives.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('builder')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              background: activeTab === 'builder' ? 'var(--accent-primary)' : 'var(--bg-surface-elevated)',
              color: activeTab === 'builder' ? '#fff' : 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            <Plus size={16} />
            <span>Create Drive & Rounds</span>
          </button>
        </div>
      </div>

      {/* Verification Warning if Pending */}
      {!activeCompany.verified && (
        <div style={{
          background: 'var(--warning-bg)',
          border: '1px solid var(--warning-border)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 20px',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <AlertCircle size={22} color="var(--warning-text)" />
          <div>
            <h4 style={{ margin: '0 0 2px', fontSize: '0.9rem', fontWeight: 700, color: 'var(--warning-text)' }}>
              Registration Awaiting Placement Cell Verification
            </h4>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {activeInstitution.tpoName} (TPO) is reviewing your corporate credentials. You can configure drive rounds now; campus publishing will be activated immediately upon TPO sign-off.
            </p>
          </div>
        </div>
      )}

      {/* Tab 1: Candidate Evaluation Desk & Pipeline */}
      {activeTab === 'pipeline' && (
        <div>
          {/* Drive Selector Bar */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 20px',
            marginBottom: 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                ACTIVE DRIVE PIPELINE:
              </span>
              <select
                value={selectedDriveId}
                onChange={(e) => setSelectedDriveId(e.target.value)}
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface-elevated)',
                  color: 'var(--text-primary)'
                }}
              >
                {drives.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.roleTitle} ({d.rounds.length} Rounds)
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Filter candidate or skill..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    padding: '6px 12px 6px 30px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <select
                value={filterStage}
                onChange={(e) => setFilterStage(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem'
                }}
              >
                <option value="all">All Stages</option>
                <option value="applied">Applied</option>
                <option value="in rounds">In Multi-Stage Rounds</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="offered">Offered</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Master-Detail Split Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 420px) 1fr',
            gap: 20,
            alignItems: 'start'
          }}>
            {/* Left: Candidate List ranked by AI Match */}
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '14px 18px',
                borderBottom: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface-elevated)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  AI-Ranked Candidates ({filteredApps.length})
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                  Sorted by Match Fit
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
                {filteredApps.length === 0 ? (
                  <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No candidates match the selected filters.
                  </div>
                ) : (
                  filteredApps.map(app => {
                    const isSelected = selectedApp?.id === app.id;

                    return (
                      <div
                        key={app.id}
                        onClick={() => setSelectedAppId(app.id)}
                        style={{
                          padding: '14px 18px',
                          borderBottom: '1px solid var(--border-subtle)',
                          background: isSelected ? 'var(--accent-glow)' : 'transparent',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 8
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Avatar name={app.studentName} size={36} />
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                                {app.studentName}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {app.department.replace('B.Des ', '').replace('M.Des ', '')}
                              </div>
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 2,
                              padding: '2px 8px',
                              borderRadius: 4,
                              background: 'var(--badge-purple-bg)',
                              color: 'var(--badge-purple-text)',
                              fontSize: '0.75rem',
                              fontWeight: 800
                            }}>
                              <Sparkles size={11} /> {app.matchScore}% Match
                            </span>
                          </div>
                        </div>

                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '0.75rem'
                        }}>
                          <span style={{ color: 'var(--text-secondary)' }}>
                            Portfolio: <strong style={{ color: 'var(--accent-primary)' }}>{app.portfolioScore}/100</strong>
                          </span>
                          <span style={{
                            padding: '2px 6px',
                            borderRadius: 4,
                            background: app.status === 'Offered' ? 'var(--success-bg)' : app.status === 'Rejected' ? 'var(--danger-bg)' : 'var(--badge-neutral-bg)',
                            color: app.status === 'Offered' ? 'var(--success-text)' : app.status === 'Rejected' ? 'var(--danger-text)' : 'var(--badge-neutral-text)',
                            fontWeight: 700
                          }}>
                            {app.status === 'In Rounds' ? `Round ${app.currentRoundIndex + 1}` : app.status}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right: Candidate Intelligence & Round Evaluation Desk */}
            {selectedApp ? (
              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: 20
              }}>
                {/* Candidate Overview Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: 12,
                  borderBottom: '1px solid var(--border-subtle)',
                  paddingBottom: 16
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <Avatar name={selectedApp.studentName} size={56} />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                          {selectedApp.studentName}
                        </h2>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: 4,
                          background: 'var(--badge-purple-bg)',
                          color: 'var(--badge-purple-text)',
                          fontWeight: 700,
                          fontSize: '0.75rem'
                        }}>
                          {selectedApp.matchScore}% AI Fit
                        </span>
                      </div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {selectedApp.studentRollNo} • {selectedApp.department} • CGPA: {selectedApp.cgpa}
                      </span>
                    </div>
                  </div>

                  <a 
                    href={selectedApp.portfolioUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--accent-primary)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      textDecoration: 'none'
                    }}
                  >
                    <span>Inspect Portfolio</span>
                    <ExternalLink size={14} />
                  </a>
                </div>

                {/* AI Portfolio Intelligence Teardown */}
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 10px' }}>
                    AI Portfolio Intelligence Breakdown
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                    gap: 10
                  }}>
                    <div style={{ padding: '10px', borderRadius: 8, background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Visual Hierarchy</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--success-text)' }}>92%</div>
                    </div>
                    <div style={{ padding: '10px', borderRadius: 8, background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>UX Case Rigor</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-primary)' }}>86%</div>
                    </div>
                    <div style={{ padding: '10px', borderRadius: 8, background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Typography & Grid</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>88%</div>
                    </div>
                    <div style={{ padding: '10px', borderRadius: 8, background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Figma Design Tokens</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--success-text)' }}>94%</div>
                    </div>
                  </div>
                </div>

                {/* Candidate Selection Round Progression Engine */}
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 12px' }}>
                    Multi-Stage Selection Progression ({activeDrive?.rounds.length} Rounds)
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {activeDrive?.rounds.map((round, idx) => {
                      const evalRecord = selectedApp.roundEvaluations[idx];
                      const isCurrentRound = selectedApp.currentRoundIndex === idx;
                      const isPassed = evalRecord && evalRecord.status === 'Passed';
                      const isFailed = evalRecord && evalRecord.status === 'Failed';

                      return (
                        <div
                          key={round.id}
                          style={{
                            padding: '14px',
                            borderRadius: 'var(--radius-md)',
                            border: `1px solid ${isCurrentRound ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                            background: isCurrentRound ? 'var(--accent-glow)' : 'var(--bg-surface-elevated)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 6
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{
                                width: 22,
                                height: 22,
                                borderRadius: '50%',
                                background: isPassed ? 'var(--success-text)' : isCurrentRound ? 'var(--accent-primary)' : 'var(--border-subtle)',
                                color: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.7rem',
                                fontWeight: 800
                              }}>
                                {isPassed ? '✓' : idx + 1}
                              </span>
                              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                                Round {round.roundNumber}: {round.name}
                              </span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                ({round.type})
                              </span>
                            </div>

                            <span style={{
                              padding: '2px 8px',
                              borderRadius: 4,
                              background: isPassed ? 'var(--success-bg)' : isFailed ? 'var(--danger-bg)' : isCurrentRound ? 'var(--badge-purple-bg)' : 'var(--badge-neutral-bg)',
                              color: isPassed ? 'var(--success-text)' : isFailed ? 'var(--danger-text)' : isCurrentRound ? 'var(--badge-purple-text)' : 'var(--badge-neutral-text)',
                              fontWeight: 700,
                              fontSize: '0.75rem'
                            }}>
                              {evalRecord ? evalRecord.status : idx < selectedApp.currentRoundIndex ? 'Passed' : 'Pending'}
                            </span>
                          </div>

                          {evalRecord?.evaluatorNotes && (
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: 30 }}>
                              <strong>Evaluator Notes:</strong> {evalRecord.evaluatorNotes}
                              {evalRecord.score && <span> (Score: {evalRecord.score}/100)</span>}
                            </div>
                          )}

                          {evalRecord?.submissionLink && (
                            <div style={{ fontSize: '0.8rem', paddingLeft: 30, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <strong>Challenge Submission:</strong>
                              <a href={evalRecord.submissionLink} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)' }}>
                                View Figma Prototype <ExternalLink size={12} />
                              </a>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recruiter Evaluation Action Bar */}
                {selectedApp.status !== 'Rejected' && selectedApp.status !== 'Offered' && (
                  <div style={{
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12
                  }}>
                    <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700 }}>
                      Evaluate & Advance Candidate (Current: Round {selectedApp.currentRoundIndex + 1})
                    </h4>

                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 10 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Score (0-100)</label>
                        <input
                          type="number"
                          value={evalScore}
                          onChange={(e) => setEvalScore(parseInt(e.target.value) || 0)}
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-subtle)',
                            background: 'var(--bg-surface-elevated)',
                            color: 'var(--text-primary)',
                            fontSize: '0.85rem',
                            fontWeight: 700
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Evaluator Feedback Notes</label>
                        <input
                          type="text"
                          value={evalNotes}
                          onChange={(e) => setEvalNotes(e.target.value)}
                          placeholder="Feedback or rationale for advancing..."
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-subtle)',
                            background: 'var(--bg-surface-elevated)',
                            color: 'var(--text-primary)',
                            fontSize: '0.85rem'
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                      <button
                        onClick={handleAdvance}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          padding: '10px 16px',
                          borderRadius: 'var(--radius-md)',
                          background: 'var(--accent-primary)',
                          color: '#fff',
                          border: 'none',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          cursor: 'pointer'
                        }}
                      >
                        <Check size={16} />
                        <span>Advance to Next Selection Round</span>
                      </button>

                      <button
                        onClick={() => setShowOfferModal(true)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '10px 16px',
                          borderRadius: 'var(--radius-md)',
                          background: 'var(--success-bg)',
                          border: '1px solid var(--success-border)',
                          color: 'var(--success-text)',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          cursor: 'pointer'
                        }}
                      >
                        <Award size={16} />
                        <span>Extend Placement Offer</span>
                      </button>

                      <button
                        onClick={handleReject}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-md)',
                          background: 'var(--danger-bg)',
                          border: '1px solid var(--danger-border)',
                          color: 'var(--danger-text)',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          cursor: 'pointer'
                        }}
                      >
                        <X size={16} />
                        <span>Disqualify</span>
                      </button>
                    </div>
                  </div>
                )}

                {selectedApp.status === 'Offered' && (
                  <div style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--success-bg)',
                    border: '1px solid var(--success-border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12
                  }}>
                    <Award size={24} color="var(--success-text)" />
                    <div>
                      <div style={{ fontWeight: 800, color: 'var(--success-text)' }}>
                        Official Placement Offer Extended!
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {selectedApp.offerDetails?.roleTitle} • {selectedApp.offerDetails?.packageLpa} • Joining: {selectedApp.offerDetails?.joiningDate}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '40px 20px',
                textAlign: 'center',
                color: 'var(--text-muted)'
              }}>
                Select a candidate from the left panel to inspect portfolio intelligence and score selection rounds.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Campus Drives List */}
      {activeTab === 'drives' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 4px' }}>
                Your Campus Recruitment Drives
              </h2>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Active drives with tailored multi-stage rounds for {activeInstitution.name}.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('builder')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 18px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--accent-primary)',
                color: '#fff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              <Plus size={16} />
              <span>Configure New Placement Drive</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {drives.map(drive => (
              <div 
                key={drive.id}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px', fontSize: '1.15rem', fontWeight: 800 }}>{drive.roleTitle}</h3>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {drive.designDiscipline} • {drive.packageLpa} • {drive.openings} Openings
                    </span>
                  </div>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: 4,
                    background: 'var(--success-bg)',
                    color: 'var(--success-text)',
                    fontSize: '0.8rem',
                    fontWeight: 700
                  }}>
                    {drive.status}
                  </span>
                </div>

                {/* Round Sequence */}
                <div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    CONFIGURED SELECTION STAGES ({drive.rounds.length}):
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, overflowX: 'auto', paddingBottom: 4 }}>
                    {drive.rounds.map((r, i) => (
                      <React.Fragment key={r.id}>
                        <div style={{
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-md)',
                          background: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '0.8rem'
                        }}>
                          <span style={{ fontWeight: 800, color: 'var(--accent-primary)', marginRight: 4 }}>R{r.roundNumber}</span>
                          <span style={{ fontWeight: 600 }}>{r.name}</span>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{r.type}</div>
                        </div>
                        {i < drive.rounds.length - 1 && <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Placement Round Builder */}
      {activeTab === 'builder' && (
        <form onSubmit={handleCreateDriveSubmit} style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 24
        }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 6px' }}>
              Create Campus Placement Drive & Configure Selection Rounds
            </h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Define hiring criteria, salary packages, and compose the multi-stage round engine for {activeInstitution.name}.
            </p>
          </div>

          {/* Drive General Info */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>Job / Role Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Associate Product Designer"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-surface-elevated)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>Design Discipline</label>
              <select
                value={newDiscipline}
                onChange={(e) => setNewDiscipline(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-surface-elevated)', color: 'var(--text-primary)' }}
              >
                <option value="UI/UX & Product Design">UI/UX & Product Design</option>
                <option value="Industrial & Product Design">Industrial & Product Design</option>
                <option value="Visual Communication & Branding">Visual Communication & Branding</option>
                <option value="Motion & 3D Design">Motion & 3D Design</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>Package (LPA) or Stipend</label>
              <input
                type="text"
                required
                placeholder="e.g. 18.5 LPA or ₹65,000 / mo"
                value={newPackage}
                onChange={(e) => setNewPackage(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-surface-elevated)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>Min Portfolio Cutoff (0-100)</label>
              <input
                type="number"
                value={newMinPortfolio}
                onChange={(e) => setNewMinPortfolio(parseInt(e.target.value) || 70)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-surface-elevated)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>Job / Engagement Type</label>
              <select
                value={newJobType}
                onChange={(e) => setNewJobType(e.target.value as any)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-surface-elevated)', color: 'var(--text-primary)' }}
              >
                <option value="Full-Time FTE">Full-Time FTE</option>
                <option value="6-Month Pre-Placement Offer (PPO)">6-Month Pre-Placement Offer (PPO)</option>
                <option value="Graduation Internship">Graduation Internship</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>Location</label>
              <input
                type="text"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="e.g. Bengaluru / Hybrid"
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-surface-elevated)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>Open Positions</label>
              <input
                type="number"
                value={newOpenings}
                onChange={(e) => setNewOpenings(parseInt(e.target.value) || 1)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-surface-elevated)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>Application Deadline</label>
              <input
                type="date"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-surface-elevated)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>Min CGPA Requirement</label>
              <input
                type="number"
                step="0.1"
                value={newMinCgpa}
                onChange={(e) => setNewMinCgpa(parseFloat(e.target.value) || 7.0)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-surface-elevated)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>Role Description & Studio Context</label>
            <textarea
              rows={2}
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Describe your design studio mission, product challenges, and craft expectations..."
              style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-surface-elevated)', color: 'var(--text-primary)', fontFamily: 'inherit' }}
            />
          </div>

          {/* Placement Round Builder Engine */}
          <div style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: 20
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>
                  Placement Round Builder Engine ({builderRounds.length} Stages)
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Compose and reorder each recruitment round. Candidates will progress through each stage sequentially.
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddRound}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--accent-glow)',
                  color: 'var(--accent-primary)',
                  border: '1px solid var(--accent-primary)',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                <Plus size={14} />
                <span>Add Round</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {builderRounds.map((round, idx) => (
                <div
                  key={round.id}
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-surface-elevated)',
                    display: 'grid',
                    gridTemplateColumns: '40px 1.4fr 1.2fr 120px 40px',
                    gap: 12,
                    alignItems: 'center'
                  }}
                >
                  <span style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'var(--accent-primary)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.8rem'
                  }}>
                    R{round.roundNumber}
                  </span>

                  <div>
                    <input
                      type="text"
                      value={round.name}
                      onChange={(e) => {
                        const updated = [...builderRounds];
                        updated[idx].name = e.target.value;
                        setBuilderRounds(updated);
                      }}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: 6,
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--bg-surface)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem',
                        fontWeight: 600
                      }}
                    />
                  </div>

                  <div>
                    <select
                      value={round.type}
                      onChange={(e) => {
                        const updated = [...builderRounds];
                        updated[idx].type = e.target.value as PlacementRoundType;
                        setBuilderRounds(updated);
                      }}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: 6,
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--bg-surface)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem'
                      }}
                    >
                      <option value="Screening">Eligibility Screening</option>
                      <option value="Portfolio Review">Portfolio Teardown</option>
                      <option value="Design Challenge">48-Hr Design Challenge</option>
                      <option value="Design Interview">Technical / Design Interview</option>
                      <option value="HR Round">HR & Culture Round</option>
                      <option value="Final Selection">Final Selection / Offer</option>
                    </select>
                  </div>

                  <div>
                    <input
                      type="date"
                      value={round.scheduledDate}
                      onChange={(e) => {
                        const updated = [...builderRounds];
                        updated[idx].scheduledDate = e.target.value;
                        setBuilderRounds(updated);
                      }}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        borderRadius: 6,
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--bg-surface)',
                        color: 'var(--text-primary)',
                        fontSize: '0.8rem'
                      }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveRound(idx)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--danger-text)',
                      cursor: 'pointer',
                      padding: 4
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            style={{
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-primary)',
              color: '#fff',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              boxShadow: '0 4px 14px var(--accent-glow)'
            }}
          >
            Publish Campus Placement Drive with Configured Rounds
          </button>
        </form>
      )}

      {/* Offer Modal */}
      {showOfferModal && selectedApp && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'var(--modal-backdrop)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 300,
          padding: 20
        }}>
          <div style={{
            width: '100%',
            maxWidth: 480,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-dropdown)',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Award size={24} color="var(--success-text)" />
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                  Extend Official Placement Offer
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Candidate: {selectedApp.studentName} ({selectedApp.studentRollNo})
                </span>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>Design Role Title</label>
              <input
                type="text"
                value={offerRoleTitle}
                onChange={(e) => setOfferRoleTitle(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-surface-elevated)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>Compensation Package (LPA)</label>
              <input
                type="text"
                value={offerLpa}
                onChange={(e) => setOfferLpa(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-surface-elevated)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>Expected Joining Date</label>
              <input
                type="date"
                value={offerJoiningDate}
                onChange={(e) => setOfferJoiningDate(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-surface-elevated)', color: 'var(--text-primary)' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <button
                type="button"
                onClick={() => setShowOfferModal(false)}
                style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'transparent', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleOfferSubmit}
                style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: 'var(--success-text)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
              >
                Confirm & Rollout Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
