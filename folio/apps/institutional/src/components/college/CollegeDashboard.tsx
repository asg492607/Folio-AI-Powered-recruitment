import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Avatar, CompanyBadge } from '../Avatar';
import { 
  GraduationCap, 
  Building2, 
  Briefcase, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Search, 
  ChevronRight, 
  ShieldCheck, 
  Layers, 
  Activity, 
  Download,
  ExternalLink
} from 'lucide-react';

export const CollegeDashboard: React.FC = () => {
  const { 
    activeInstitution, 
    companies, 
    verifyCompany, 
    drives, 
    students, 
    applications
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'verifications' | 'drives' | 'cohorts' | 'registry'>('overview');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedBatch, setSelectedBatch] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Pending Verifications
  const pendingCompanies = companies.filter(c => c.verificationStatus === 'pending');
  const verifiedCompanies = companies.filter(c => c.verificationStatus === 'verified');

  // Stats
  const totalStudents = students.length;
  const placedStudents = students.filter(s => s.placementStatus === 'Placed').length;
  const averageReadiness = Math.round(students.reduce((acc, s) => acc + s.careerReadiness, 0) / (totalStudents || 1));

  // Filtered Students for Cohort View
  const filteredStudents = students.filter(s => {
    const matchesDept = selectedDept === 'all' || s.department.toLowerCase().includes(selectedDept.toLowerCase());
    const matchesBatch = selectedBatch === 'all' || s.graduationYear.toString() === selectedBatch;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.skills.some(sk => sk.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDept && matchesBatch && matchesSearch;
  });

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto', padding: '24px' }}>
      {/* Top Header */}
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
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
            }}>
              <GraduationCap size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  Placement & Career Services Cell (TPO)
                </h1>
                <span style={{
                  fontSize: '0.75rem',
                  padding: '2px 8px',
                  borderRadius: 4,
                  background: 'var(--success-bg)',
                  color: 'var(--success-text)',
                  fontWeight: 700
                }}>
                  NIRF RANK #{activeInstitution.nirfRank || 4}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {activeInstitution.name} • {activeInstitution.campus}
              </p>
            </div>
          </div>
        </div>

        {/* Quick TPO Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {pendingCompanies.length > 0 && (
            <button
              onClick={() => setActiveTab('verifications')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--warning-bg)',
                border: '1px solid var(--warning-border)',
                color: 'var(--warning-text)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              <AlertTriangle size={15} />
              <span>{pendingCompanies.length} Company Approvals Pending</span>
            </button>
          )}

          <div style={{
            fontSize: '0.8rem',
            padding: '8px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)'
          }}>
            TPO Officer: <strong style={{ color: 'var(--text-primary)' }}>{activeInstitution.tpoName}</strong>
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
          { id: 'overview', label: 'Institutional Overview', icon: <Activity size={16} /> },
          { 
            id: 'verifications', 
            label: `Company Verifications (${pendingCompanies.length})`, 
            icon: <Building2 size={16} />,
            badge: pendingCompanies.length > 0 ? pendingCompanies.length : undefined
          },
          { id: 'drives', label: `Placement Drives (${drives.length})`, icon: <Briefcase size={16} /> },
          { id: 'cohorts', label: 'Cohort Intelligence & Readiness', icon: <Layers size={16} /> },
          { id: 'registry', label: 'Verified Placement Registry', icon: <ShieldCheck size={16} /> }
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
              {t.badge && (
                <span style={{
                  padding: '1px 6px',
                  borderRadius: 10,
                  background: 'var(--warning-text)',
                  color: '#fff',
                  fontSize: '0.7rem',
                  fontWeight: 800
                }}>
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* KPI Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16
          }}>
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Enrolled Design Students
              </span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {activeInstitution.totalStudents.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--success-text)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle2 size={13} /> 100% Portfolios & Resumes Digitized
              </div>
            </div>

            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Cohort Career Readiness
              </span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                {averageReadiness}%
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Aggregated across UI/UX, Product & Visual Design
              </div>
            </div>

            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Verified Partner Companies
              </span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {verifiedCompanies.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--info-text)' }}>
                {pendingCompanies.length} pending verification review
              </div>
            </div>

            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Institutional Placement Rate
              </span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--success-text)' }}>
                {activeInstitution.placementPercentage}%
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Median package: 18.5 LPA • {placedStudents} Students Placed
              </div>
            </div>
          </div>

          {/* Pending Verifications Alert Box */}
          {pendingCompanies.length > 0 && (
            <div style={{
              background: 'var(--warning-bg)',
              border: '1px solid var(--warning-border)',
              borderRadius: 'var(--radius-md)',
              padding: '18px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <AlertTriangle size={24} color="var(--warning-text)" />
                <div>
                  <h4 style={{ margin: '0 0 2px', fontSize: '0.95rem', fontWeight: 700, color: 'var(--warning-text)' }}>
                    Action Required: {pendingCompanies.length} Company Registration(s) Awaiting Placement Cell Verification
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Companies cannot launch campus placement drives until corporate CIN and credentials are verified by TPO.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('verifications')}
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--warning-text)',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Review Approvals
              </button>
            </div>
          )}

          {/* Active Drives Live Pipeline */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px'
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px' }}>
              Active Placement Drives & Selection Funnels
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {drives.map(drive => {
                const driveApps = applications.filter(a => a.driveId === drive.id);
                const offeredCount = driveApps.filter(a => a.status === 'Offered').length;
                const inRoundsCount = driveApps.filter(a => a.status === 'In Rounds').length;

                return (
                  <div 
                    key={drive.id}
                    style={{
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '18px',
                      background: 'var(--bg-surface-elevated)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 10
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <CompanyBadge name={drive.companyName} size={40} />
                        <div>
                          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>{drive.roleTitle}</h4>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {drive.companyName} • {drive.packageLpa} • {drive.location}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: 4,
                          background: 'var(--badge-purple-bg)',
                          color: 'var(--badge-purple-text)',
                          fontSize: '0.75rem',
                          fontWeight: 700
                        }}>
                          {drive.rounds.length} Selection Rounds
                        </span>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: 4,
                          background: 'var(--success-bg)',
                          color: 'var(--success-text)',
                          fontSize: '0.75rem',
                          fontWeight: 700
                        }}>
                          Campus Approved
                        </span>
                      </div>
                    </div>

                    {/* Funnel Progress */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                      gap: 8,
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.8rem'
                    }}>
                      <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Total Applied</div>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{driveApps.length}</div>
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>In Multi-Stage Rounds</div>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--accent-primary)' }}>{inRoundsCount}</div>
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Offers Extended</div>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--success-text)' }}>{offeredCount}</div>
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Open Positions</div>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{drive.openings}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Company Verifications */}
      {activeTab === 'verifications' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 6px' }}>
              Company Recruitment Registration & Verification Desk
            </h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Evaluate external design studios and enterprises registering to conduct campus placement drives.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {companies.map(company => {
              const isPending = company.verificationStatus === 'pending';
              const isVerified = company.verificationStatus === 'verified';

              return (
                <div 
                  key={company.id}
                  style={{
                    background: 'var(--bg-surface)',
                    border: `1px solid ${isPending ? 'var(--warning-border)' : 'var(--border-subtle)'}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: 12
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <CompanyBadge name={company.name} size={48} />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>{company.name}</h3>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: 4,
                            background: isVerified ? 'var(--success-bg)' : isPending ? 'var(--warning-bg)' : 'var(--danger-bg)',
                            color: isVerified ? 'var(--success-text)' : isPending ? 'var(--warning-text)' : 'var(--danger-text)',
                            fontSize: '0.75rem',
                            fontWeight: 700
                          }}>
                            {company.verificationStatus.toUpperCase()}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {company.industry} • Registered on {company.registeredAt}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons for Pending */}
                    {isPending && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button
                          onClick={() => verifyCompany(company.id, 'verified')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '8px 16px',
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--success-text)',
                            color: '#fff',
                            border: 'none',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            cursor: 'pointer'
                          }}
                        >
                          <CheckCircle2 size={16} />
                          <span>Verify & Approve Drive Rights</span>
                        </button>
                        <button
                          onClick={() => verifyCompany(company.id, 'rejected', 'CIN credentials non-compliant')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '8px 14px',
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--danger-bg)',
                            border: '1px solid var(--danger-border)',
                            color: 'var(--danger-text)',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            cursor: 'pointer'
                          }}
                        >
                          <XCircle size={16} />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Verification Credentials Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 12,
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.8rem'
                  }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Corporate Identification (CIN / GSTIN):</span>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, marginTop: 2 }}>{company.cin}</div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Corporate Domain & Web:</span>
                      <div style={{ fontWeight: 600, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <a href={`https://${company.domain}`} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>
                          {company.domain}
                        </a>
                        <ExternalLink size={12} />
                      </div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>HR / Talent Partner:</span>
                      <div style={{ fontWeight: 600, marginTop: 2 }}>{company.hrName} ({company.hrEmail})</div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Targeted Design Disciplines:</span>
                      <div style={{ fontWeight: 600, marginTop: 2 }}>{company.targetDisciplines.join(', ')}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Placement Drives */}
      {activeTab === 'drives' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 6px' }}>
              Campus Placement Drives Oversight
            </h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Manage corporate campus drives, verify academic eligibility cutoffs, and monitor student round movements.
            </p>
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <CompanyBadge name={drive.companyName} size={48} />
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>{drive.roleTitle}</h3>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {drive.companyName} • {drive.designDiscipline} • Package: <strong style={{ color: 'var(--text-primary)' }}>{drive.packageLpa}</strong>
                      </span>
                    </div>
                  </div>

                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '999px',
                    background: 'var(--success-bg)',
                    color: 'var(--success-text)',
                    fontSize: '0.8rem',
                    fontWeight: 700
                  }}>
                    Approved for {activeInstitution.name}
                  </span>
                </div>

                {/* Selection Round Sequence */}
                <div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Configured Selection Round Workflow ({drive.rounds.length} Stages):
                  </span>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginTop: 8,
                    overflowX: 'auto',
                    paddingBottom: 4
                  }}>
                    {drive.rounds.map((round, idx) => (
                      <React.Fragment key={round.id}>
                        <div style={{
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-md)',
                          background: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '0.8rem',
                          whiteSpace: 'nowrap'
                        }}>
                          <span style={{ fontWeight: 700, color: 'var(--accent-primary)', marginRight: 6 }}>
                            R{round.roundNumber}
                          </span>
                          <span style={{ fontWeight: 600 }}>{round.name}</span>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{round.type}</div>
                        </div>
                        {idx < drive.rounds.length - 1 && (
                          <ChevronRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Eligibility requirements */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  flexWrap: 'wrap',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: 12
                }}>
                  <span><strong>Min Portfolio Score:</strong> {drive.eligibility.minPortfolioScore}/100</span>
                  <span><strong>Min CGPA:</strong> {drive.eligibility.minCgpa}</span>
                  <span><strong>Batch:</strong> {drive.eligibility.graduationYear}</span>
                  <span><strong>Deadline:</strong> {drive.applicationDeadline}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Cohort Intelligence */}
      {activeTab === 'cohorts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16
          }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 6px' }}>
                Design Cohort Readiness & Skill Gap Matrix
              </h2>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Track student portfolio readiness across departments and flag candidates requiring faculty mentor intervention.
              </p>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-muted)' }} />
                <input 
                  type="text"
                  placeholder="Search student or skill..."
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
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem'
                }}
              >
                <option value="all">All Departments</option>
                <option value="user experience">User Experience (UX)</option>
                <option value="product design">Industrial & Product</option>
                <option value="visual communication">Visual Communication</option>
                <option value="animation">Motion & Animation</option>
              </select>

              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem'
                }}
              >
                <option value="all">All Batches</option>
                <option value="2025">Batch 2025</option>
                <option value="2026">Batch 2026</option>
                <option value="2027">Batch 2027</option>
              </select>
            </div>
          </div>

          {/* Student Readiness Table */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'var(--table-th-bg)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-muted)' }}>Student & Roll No</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-muted)' }}>Department</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-muted)' }}>Portfolio Score</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-muted)' }}>Career Readiness</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-muted)' }}>Status</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-muted)' }}>Intervention Need</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(student => {
                  const needsIntervention = student.portfolioScore < 70 || student.careerReadiness < 70;
                  return (
                    <tr 
                      key={student.id}
                      style={{ borderBottom: '1px solid var(--table-border)', transition: 'background 0.15s ease' }}
                    >
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar name={student.name} size={34} />
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{student.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                              {student.rollNo}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>
                        {student.department.replace('B.Des ', '').replace('M.Des ', '')} ({student.graduationYear})
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 700, color: student.portfolioScore >= 80 ? 'var(--success-text)' : 'var(--warning-text)' }}>
                            {student.portfolioScore}/100
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>({student.portfolioType})</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{
                            width: 60,
                            height: 6,
                            borderRadius: 3,
                            background: 'var(--border-subtle)',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              width: `${student.careerReadiness}%`,
                              height: '100%',
                              background: student.careerReadiness >= 80 ? 'var(--success-text)' : 'var(--accent-primary)'
                            }} />
                          </div>
                          <span style={{ fontWeight: 700 }}>{student.careerReadiness}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: 4,
                          background: student.placementStatus === 'Placed' ? 'var(--success-bg)' : 'var(--badge-neutral-bg)',
                          color: student.placementStatus === 'Placed' ? 'var(--success-text)' : 'var(--badge-neutral-text)',
                          fontWeight: 700,
                          fontSize: '0.75rem'
                        }}>
                          {student.placementStatus}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        {needsIntervention ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '3px 8px',
                            borderRadius: 4,
                            background: 'var(--danger-bg)',
                            color: 'var(--danger-text)',
                            fontSize: '0.75rem',
                            fontWeight: 700
                          }}>
                            <AlertTriangle size={12} />
                            Flagged for Mentor
                          </span>
                        ) : (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            color: 'var(--success-text)',
                            fontSize: '0.75rem',
                            fontWeight: 600
                          }}>
                            <CheckCircle2 size={12} /> Placement Ready
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Registry */}
      {activeTab === 'registry' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16
          }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 6px' }}>
                Institutional Placement Registry & Verified Records
              </h2>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Official immutable placement records recognized for AICTE & NIRF university benchmarking.
              </p>
            </div>

            <button
              onClick={() => alert('Exporting Official Placement Verification Report (PDF/Excel)...')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--accent-primary)',
                color: '#fff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              <Download size={16} />
              <span>Export Placement Report</span>
            </button>
          </div>

          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'var(--table-th-bg)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-muted)' }}>Student Name</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-muted)' }}>Roll No</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-muted)' }}>Department</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-muted)' }}>Hiring Studio / Org</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-muted)' }}>Package (LPA)</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-muted)' }}>Verification Hash</th>
                </tr>
              </thead>
              <tbody>
                {students.filter(s => s.placementStatus === 'Placed').map(student => (
                  <tr key={student.id} style={{ borderBottom: '1px solid var(--table-border)' }}>
                    <td style={{ padding: '14px 18px', fontWeight: 700 }}>{student.name}</td>
                    <td style={{ padding: '14px 18px', fontFamily: 'var(--font-mono)' }}>{student.rollNo}</td>
                    <td style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>{student.department}</td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: 4,
                        background: 'var(--badge-purple-bg)',
                        color: 'var(--badge-purple-text)',
                        fontWeight: 700
                      }}>
                        {student.placedCompany || 'CRED Design Studio'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 800, color: 'var(--success-text)' }}>
                      ₹{student.placedPackageLpa || 22.0} LPA
                    </td>
                    <td style={{ padding: '14px 18px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      0x{(student.rollNo + student.id).slice(-8).toUpperCase()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
