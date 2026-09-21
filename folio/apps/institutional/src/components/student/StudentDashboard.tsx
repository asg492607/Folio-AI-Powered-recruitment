import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Avatar, CompanyBadge } from '../Avatar';
import { 
  Sparkles, 
  Briefcase, 
  Compass, 
  Layers, 
  CheckCircle2, 
  ExternalLink, 
  AlertCircle, 
  Award, 
  BookOpen, 
  Globe, 
  RefreshCw
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { 
    activeStudent, 
    drives, 
    applications, 
    applyToDrive, 
    runPortfolioAnalysis, 
    interventions, 
    completeStudentIntervention,
    externalOpportunities 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'readiness' | 'drives' | 'applications' | 'external' | 'tasks'>('readiness');
  const [portfolioInputUrl, setPortfolioInputUrl] = useState(activeStudent.portfolioUrl);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [challengeSubmissionLink, setChallengeSubmissionLink] = useState('');
  const [submittedLinkForApp, setSubmittedLinkForApp] = useState<string | null>(null);

  // Filter student applications
  const myApplications = applications.filter(a => a.studentId === activeStudent.id);
  const myTasks = interventions.filter(t => t.studentId === activeStudent.id);

  const handleRunAnalysis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!portfolioInputUrl.trim()) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      runPortfolioAnalysis(activeStudent.id, portfolioInputUrl);
      setIsAnalyzing(false);
    }, 1200);
  };

  const handleApply = async (driveId: string) => {
    const res = await applyToDrive(driveId);
    alert(res.message);
  };

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto', padding: '24px' }}>
      {/* Student Profile Header */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Avatar name={activeStudent.name} size={64} style={{ border: '2px solid var(--accent-primary)' }} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                {activeStudent.name}
              </h1>
              <span style={{
                padding: '2px 8px',
                borderRadius: 4,
                background: activeStudent.placementStatus === 'Placed' ? 'var(--success-bg)' : 'var(--badge-purple-bg)',
                color: activeStudent.placementStatus === 'Placed' ? 'var(--success-text)' : 'var(--badge-purple-text)',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                {activeStudent.placementStatus.toUpperCase()}
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {activeStudent.designDiscipline} • Roll No: <span style={{ fontFamily: 'var(--font-mono)' }}>{activeStudent.rollNo}</span> • {activeStudent.institutionName}
            </p>
          </div>
        </div>

        {/* Career Readiness Badge & Placement Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {activeStudent.placementStatus === 'Placed' && (
            <div style={{
              padding: '10px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--success-bg)',
              border: '1px solid var(--success-border)',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <Award size={20} color="var(--success-text)" />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Placed Offer</div>
                <div style={{ fontWeight: 800, color: 'var(--success-text)', fontSize: '0.95rem' }}>
                  {activeStudent.placedCompany} (₹{activeStudent.placedPackageLpa} LPA)
                </div>
              </div>
            </div>
          )}

          <div style={{
            padding: '10px 18px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Career Readiness Index
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                {activeStudent.careerReadiness}%
              </div>
            </div>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: `conic-gradient(var(--accent-primary) ${activeStudent.careerReadiness * 3.6}deg, var(--border-subtle) 0deg)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: 'var(--bg-surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                {activeStudent.careerReadiness}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: 8,
        borderBottom: '1px solid var(--border-subtle)',
        marginBottom: 24,
        overflowX: 'auto',
        paddingBottom: 4
      }}>
        {[
          { id: 'readiness', label: 'Portfolio & Career Intelligence', icon: <Compass size={16} /> },
          { id: 'drives', label: `Eligible Campus Drives (${drives.length})`, icon: <Briefcase size={16} /> },
          { id: 'applications', label: `My Drive Progress (${myApplications.length})`, icon: <Layers size={16} /> },
          { id: 'tasks', label: `Faculty Tasks (${myTasks.length})`, icon: <BookOpen size={16} /> },
          { id: 'external', label: `Curated Industry Jobs (${externalOpportunities.length})`, icon: <Globe size={16} /> }
        ].map(t => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 16px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: isActive ? 'var(--accent-glow)' : 'transparent',
                color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Portfolio & Career Intelligence */}
      {activeTab === 'readiness' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Portfolio Intelligence Extraction Box */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                  AI Portfolio Intelligence & Extraction Engine
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Extracts typography rhythm, Figma design token depth, case study framing, and tools proficiency.
                </span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '4px 12px',
                borderRadius: '999px',
                background: 'var(--badge-purple-bg)',
                color: 'var(--badge-purple-text)',
                fontWeight: 700,
                fontSize: '0.85rem'
              }}>
                <Sparkles size={14} />
                <span>Overall Portfolio Score: {activeStudent.portfolioScore}/100</span>
              </div>
            </div>

            {/* Input to trigger re-analysis */}
            <form onSubmit={handleRunAnalysis} style={{ display: 'flex', gap: 10 }}>
              <input
                type="url"
                required
                value={portfolioInputUrl}
                onChange={(e) => setPortfolioInputUrl(e.target.value)}
                placeholder="https://behance.net/... or https://figma.com/@..."
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface-elevated)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem'
                }}
              />
              <button
                type="submit"
                disabled={isAnalyzing}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--accent-primary)',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: isAnalyzing ? 'wait' : 'pointer'
                }}
              >
                <RefreshCw size={15} className={isAnalyzing ? 'animate-spin' : ''} />
                <span>{isAnalyzing ? 'Analyzing Extract...' : 'Run Portfolio Intelligence'}</span>
              </button>
            </form>

            {/* AI Dimension Metrics Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: 12
            }}>
              <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Visual Hierarchy</span>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--success-text)', marginTop: 2 }}>
                  {activeStudent.portfolioReport?.visualHierarchy || 92}%
                </div>
              </div>
              <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>UX Case Study Rigor</span>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-primary)', marginTop: 2 }}>
                  {activeStudent.portfolioReport?.uxResearch || 86}%
                </div>
              </div>
              <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Typography & Grids</span>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>
                  {activeStudent.portfolioReport?.typography || 88}%
                </div>
              </div>
              <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Design Systems & Tokens</span>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--success-text)', marginTop: 2 }}>
                  {activeStudent.portfolioReport?.designSystems || 94}%
                </div>
              </div>
              <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tools Proficiency</span>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>
                  {activeStudent.portfolioReport?.toolsProficiency || 90}%
                </div>
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              <div style={{
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--success-bg)',
                border: '1px solid var(--success-border)'
              }}>
                <h4 style={{ margin: '0 0 8px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--success-text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={16} /> Verified Design Strengths
                </h4>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {activeStudent.portfolioReport?.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              <div style={{
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--warning-bg)',
                border: '1px solid var(--warning-border)'
              }}>
                <h4 style={{ margin: '0 0 8px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--warning-text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertCircle size={16} /> Targeted Areas for Improvement
                </h4>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {activeStudent.portfolioReport?.weaknesses.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Detected Projects Showcase */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px'
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 16px' }}>
              Detected Case Studies & Project Portfolio
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
              {activeStudent.portfolioReport?.projects.map(project => (
                <div 
                  key={project.id}
                  style={{
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-surface-elevated)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div style={{ width: '100%', height: 120, background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.15, borderRadius: '8px 8px 0 0' }} />
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: 4,
                        background: 'var(--badge-purple-bg)',
                        color: 'var(--badge-purple-text)',
                        fontSize: '0.7rem',
                        fontWeight: 700
                      }}>
                        {project.domain}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{project.role}</span>
                    </div>

                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{project.title}</h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {project.description}
                    </p>

                    {project.metrics && (
                      <div style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--success-text)',
                        background: 'var(--success-bg)',
                        padding: '4px 8px',
                        borderRadius: 4,
                        marginTop: 'auto'
                      }}>
                        ★ {project.metrics}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Eligible Campus Drives */}
      {activeTab === 'drives' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 6px' }}>
              Campus Placement Drives (Institutional Matchmaking)
            </h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Verified design studios visiting {activeStudent.institutionName} for campus recruitment.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {drives.map(drive => {
              const alreadyApplied = myApplications.some(a => a.driveId === drive.id);
              const meetsPortfolioCutoff = activeStudent.portfolioScore >= drive.eligibility.minPortfolioScore;

              return (
                <div 
                  key={drive.id}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 12
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <CompanyBadge name={drive.companyName} size={48} />
                      <div>
                        <h3 style={{ margin: '0 0 4px', fontSize: '1.15rem', fontWeight: 800 }}>{drive.roleTitle}</h3>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {drive.companyName} • {drive.location} • <strong style={{ color: 'var(--accent-primary)' }}>{drive.packageLpa}</strong>
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {alreadyApplied ? (
                        <span style={{
                          padding: '8px 16px',
                          borderRadius: 'var(--radius-md)',
                          background: 'var(--success-bg)',
                          color: 'var(--success-text)',
                          fontWeight: 700,
                          fontSize: '0.85rem'
                        }}>
                          Application Active in Rounds ✓
                        </span>
                      ) : (
                        <button
                          onClick={() => handleApply(drive.id)}
                          style={{
                            padding: '10px 20px',
                            borderRadius: 'var(--radius-md)',
                            background: meetsPortfolioCutoff ? 'var(--accent-primary)' : 'var(--border-subtle)',
                            color: meetsPortfolioCutoff ? '#fff' : 'var(--text-muted)',
                            border: 'none',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            cursor: meetsPortfolioCutoff ? 'pointer' : 'not-allowed'
                          }}
                        >
                          {meetsPortfolioCutoff ? 'Apply to Campus Drive' : `Requires ${drive.eligibility.minPortfolioScore}+ Portfolio`}
                        </button>
                      )}
                    </div>
                  </div>

                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {drive.description}
                  </p>

                  {/* Multi-Stage Selection Rounds preview */}
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Selection Round Pipeline ({drive.rounds.length} Stages):
                    </span>
                    <div style={{ display: 'flex', gap: 8, marginTop: 6, overflowX: 'auto', paddingBottom: 4 }}>
                      {drive.rounds.map((r, i) => (
                        <div 
                          key={r.id}
                          style={{
                            padding: '6px 10px',
                            borderRadius: 6,
                            background: 'var(--bg-surface-elevated)',
                            border: '1px solid var(--border-subtle)',
                            fontSize: '0.75rem',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <span style={{ fontWeight: 800, color: 'var(--accent-primary)', marginRight: 4 }}>R{i+1}</span>
                          <span>{r.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: My Application Progress & Round Tracker */}
      {activeTab === 'applications' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 6px' }}>
              Placement Drive Round Tracker
            </h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Follow your stage-by-stage progression through company rounds, view evaluator feedback, and submit design challenge deliverables.
            </p>
          </div>

          {myApplications.length === 0 ? (
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '40px 20px',
              textAlign: 'center',
              color: 'var(--text-muted)'
            }}>
              You have not applied to any campus drives yet. Explore the "Eligible Campus Drives" tab to apply!
            </div>
          ) : (
            myApplications.map(app => {
              const drive = drives.find(d => d.id === app.driveId);

              return (
                <div
                  key={app.id}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 18
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 12
                  }}>
                    <div>
                      <h3 style={{ margin: '0 0 4px', fontSize: '1.15rem', fontWeight: 800 }}>
                        {drive?.roleTitle || 'Design Opportunity'}
                      </h3>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {drive?.companyName} • Applied on {app.appliedAt} • Match Fit: <strong style={{ color: 'var(--accent-primary)' }}>{app.matchScore}%</strong>
                      </span>
                    </div>

                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '999px',
                      background: app.status === 'Offered' ? 'var(--success-bg)' : app.status === 'Rejected' ? 'var(--danger-bg)' : 'var(--badge-purple-bg)',
                      color: app.status === 'Offered' ? 'var(--success-text)' : app.status === 'Rejected' ? 'var(--danger-text)' : 'var(--badge-purple-text)',
                      fontWeight: 800,
                      fontSize: '0.8rem'
                    }}>
                      {app.status === 'In Rounds' ? `Active in Round ${app.currentRoundIndex + 1}` : app.status}
                    </span>
                  </div>

                  {/* Multi-Stage Round Stepper */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10
                  }}>
                    {drive?.rounds.map((round, idx) => {
                      const evalRecord = app.roundEvaluations[idx];
                      const isCurrent = app.currentRoundIndex === idx;
                      const isPassed = evalRecord && evalRecord.status === 'Passed';
                      const isFailed = evalRecord && evalRecord.status === 'Failed';

                      return (
                        <div 
                          key={round.id}
                          style={{
                            padding: '14px',
                            borderRadius: 'var(--radius-md)',
                            border: `1px solid ${isCurrent ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                            background: isCurrent ? 'var(--accent-glow)' : 'var(--bg-surface-elevated)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 6
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span style={{
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                background: isPassed ? 'var(--success-text)' : isCurrent ? 'var(--accent-primary)' : 'var(--border-subtle)',
                                color: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.75rem',
                                fontWeight: 800
                              }}>
                                {isPassed ? '✓' : idx + 1}
                              </span>
                              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                                Round {round.roundNumber}: {round.name}
                              </span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({round.type})</span>
                            </div>

                            <span style={{
                              padding: '2px 8px',
                              borderRadius: 4,
                              background: isPassed ? 'var(--success-bg)' : isFailed ? 'var(--danger-bg)' : isCurrent ? 'var(--badge-purple-bg)' : 'var(--badge-neutral-bg)',
                              color: isPassed ? 'var(--success-text)' : isFailed ? 'var(--danger-text)' : isCurrent ? 'var(--badge-purple-text)' : 'var(--badge-neutral-text)',
                              fontWeight: 700,
                              fontSize: '0.75rem'
                            }}>
                              {evalRecord ? evalRecord.status : idx < app.currentRoundIndex ? 'Passed' : 'Pending'}
                            </span>
                          </div>

                          {evalRecord?.evaluatorNotes && (
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: 34 }}>
                              <strong>Panel Feedback:</strong> "{evalRecord.evaluatorNotes}"
                            </div>
                          )}

                          {/* Challenge Submission field if in Design Challenge round */}
                          {isCurrent && round.type === 'Design Challenge' && (
                            <div style={{ paddingLeft: 34, marginTop: 6 }}>
                              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: 4 }}>
                                Submit Figma Prototype Link:
                              </label>
                              <div style={{ display: 'flex', gap: 8 }}>
                                <input
                                  type="url"
                                  placeholder="https://figma.com/@..."
                                  value={challengeSubmissionLink}
                                  onChange={(e) => setChallengeSubmissionLink(e.target.value)}
                                  style={{
                                    flex: 1,
                                    padding: '6px 10px',
                                    borderRadius: 6,
                                    border: '1px solid var(--border-subtle)',
                                    background: 'var(--bg-surface)',
                                    fontSize: '0.8rem',
                                    color: 'var(--text-primary)'
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSubmittedLinkForApp(challengeSubmissionLink);
                                    alert('Figma prototype submitted to company evaluators!');
                                  }}
                                  style={{
                                    padding: '6px 14px',
                                    borderRadius: 6,
                                    background: 'var(--accent-primary)',
                                    color: '#fff',
                                    border: 'none',
                                    fontWeight: 700,
                                    fontSize: '0.8rem',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Submit
                                </button>
                              </div>
                              {submittedLinkForApp && (
                                <span style={{ fontSize: '0.75rem', color: 'var(--success-text)', marginTop: 4, display: 'block' }}>
                                  ✓ Submitted Deliverable: {submittedLinkForApp}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 4: Faculty Assigned Tasks */}
      {activeTab === 'tasks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 6px' }}>
              Faculty Mentor Preparation Tasks & Interventions
            </h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Actionable tasks assigned by your academic mentor to boost your portfolio score and interview readiness.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {myTasks.length === 0 ? (
              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '40px 20px',
                textAlign: 'center',
                color: 'var(--text-muted)'
              }}>
                No pending mentor intervention tasks. Your portfolio is meeting all placement cutoffs!
              </div>
            ) : (
              myTasks.map(task => {
                const isCompleted = task.status === 'Completed';

                return (
                  <div 
                    key={task.id}
                    style={{
                      background: 'var(--bg-surface)',
                      border: `1px solid ${isCompleted ? 'var(--success-border)' : 'var(--border-subtle)'}`,
                      borderRadius: 'var(--radius-md)',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 800 }}>{task.title}</h4>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Assigned by {task.facultyName} • Due: {task.dueDate}
                        </span>
                      </div>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: 4,
                        background: isCompleted ? 'var(--success-bg)' : 'var(--warning-bg)',
                        color: isCompleted ? 'var(--success-text)' : 'var(--warning-text)',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}>
                        {task.status}
                      </span>
                    </div>

                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {task.description}
                    </p>

                    {task.feedback && (
                      <div style={{
                        padding: '10px 14px',
                        borderRadius: 6,
                        background: 'var(--bg-surface-elevated)',
                        fontSize: '0.8rem',
                        color: 'var(--text-primary)'
                      }}>
                        <strong>Mentor Note:</strong> {task.feedback}
                      </div>
                    )}

                    {!isCompleted && (
                      <div>
                        <button
                          onClick={() => completeStudentIntervention(task.id)}
                          style={{
                            padding: '8px 16px',
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--success-text)',
                            color: '#fff',
                            border: 'none',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            cursor: 'pointer'
                          }}
                        >
                          Mark Task as Completed & Notify Faculty
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Curated Industry Jobs */}
      {activeTab === 'external' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 6px' }}>
              Opportunity Intelligence (Curated Design Industry Feed)
            </h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              External design opportunities scraped and classified from Behance, Dribbble, LinkedIn Design, and Wellfound.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
            {externalOpportunities.map(opp => (
              <div 
                key={opp.id}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: 4,
                    background: 'var(--badge-purple-bg)',
                    color: 'var(--badge-purple-text)',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}>
                    {opp.source} Jobs
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{opp.postedDate}</span>
                </div>

                <div>
                  <h4 style={{ margin: '0 0 2px', fontSize: '1rem', fontWeight: 700 }}>{opp.title}</h4>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {opp.company} • {opp.location}
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--success-text)' }}>
                  {opp.stipendOrSalary}
                </div>

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {opp.requiredSkills.map(sk => (
                    <span 
                      key={sk}
                      style={{
                        padding: '2px 6px',
                        borderRadius: 4,
                        background: 'var(--bg-surface-elevated)',
                        fontSize: '0.7rem',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      {sk}
                    </span>
                  ))}
                </div>

                <a 
                  href={opp.applyUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  style={{
                    marginTop: 'auto',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--accent-glow)',
                    color: 'var(--accent-primary)',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    textAlign: 'center',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  <span>Apply on {opp.source}</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
