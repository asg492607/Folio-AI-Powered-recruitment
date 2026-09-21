import React from 'react';
import { useApp } from '../context/AppContext';
import { CompanyBadge } from './Avatar';
import { 
  GraduationCap, 
  UserCheck, 
  BookOpen, 
  ShieldCheck, 
  Building2,
  ArrowRight, 
  Layers, 
  CheckCircle2, 
  Sparkles, 
  Compass,
  ChevronRight
} from 'lucide-react';
import type { UserRole } from '../types';

export const LandingPage: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
  const { switchPersona, drives } = useApp();

  const handleLaunchRole = (role: UserRole) => {
    switchPersona(role);
  };

  return (
    <div style={{ color: 'var(--text-primary)', overflow: 'hidden' }}>
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        padding: '80px 24px 70px',
        textAlign: 'center',
        background: 'radial-gradient(ellipse at 50% -10%, rgba(79, 70, 229, 0.18) 0%, transparent 65%)'
      }}>
        <div style={{ maxWidth: 1040, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 16px',
            borderRadius: '999px',
            background: 'var(--badge-purple-bg)',
            border: '1px solid var(--badge-purple-border)',
            color: 'var(--badge-purple-text)',
            fontSize: '0.8rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            marginBottom: 24
          }}>
            <Sparkles size={14} />
            COLLEGE-WIDE DESIGN CAREER & PLACEMENT OPERATING SYSTEM
          </div>

          <h1 style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            margin: '0 0 20px',
            color: 'var(--text-primary)'
          }}>
            Career Intelligence & Placement Infrastructure for <span style={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #a855f7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Design Institutions</span>
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            lineHeight: 1.6,
            color: 'var(--text-secondary)',
            maxWidth: 780,
            margin: '0 auto 36px'
          }}>
            Moving beyond simple placement counters. An AI-powered operating system that benchmarks student design readiness, verifies company credentials, orchestrates multi-stage placement rounds, and bridges talent with top design studios.
          </p>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
            marginBottom: 48
          }}>
            <button
              onClick={onGetStarted}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '14px 28px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--accent-primary)',
                color: '#fff',
                fontSize: '1rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 6px 20px var(--accent-glow)',
                transition: 'all 0.2s ease'
              }}
            >
              <span>Launch Institutional Portal</span>
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => handleLaunchRole('placement_officer')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '14px 24px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <GraduationCap size={18} color="var(--success-text)" />
              <span>Explore TPO Command Center</span>
            </button>
          </div>

          {/* Quick Role Launchers */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            boxShadow: 'var(--shadow-card)',
            textAlign: 'left'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
              flexWrap: 'wrap',
              gap: 8
            }}>
              <div>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Interactive Role Simulation
                </span>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Switch directly into any verified institutional persona to inspect workflows with live data:
                </p>
              </div>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--success-text)',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}>
                <CheckCircle2 size={14} /> Full State & Round Engine Active
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 12
            }}>
              <div 
                onClick={() => handleLaunchRole('student')}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <UserCheck size={18} color="var(--info-text)" />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Student</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Portfolio Intelligence, Live Drives & Round Tracker
                </p>
              </div>

              <div 
                onClick={() => handleLaunchRole('placement_officer')}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <GraduationCap size={18} color="var(--success-text)" />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>TPO Officer</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Company Verification Queue & Cohort Readiness
                </p>
              </div>

              <div 
                onClick={() => handleLaunchRole('faculty')}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <BookOpen size={18} color="var(--warning-text)" />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Faculty Mentor</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Intervention Engine & Portfolio Teardowns
                </p>
              </div>

              <div 
                onClick={() => handleLaunchRole('recruiter')}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <Building2 size={18} color="var(--accent-primary)" />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Recruiter</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Placement Round Builder & Candidate Pipeline
                </p>
              </div>

              <div 
                onClick={() => handleLaunchRole('admin')}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <ShieldCheck size={18} color="var(--accent-secondary)" />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Admin</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Campuses, Departments & Compliance Audit Logs
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* System Architecture Section */}
      <section style={{
        padding: '60px 24px',
        maxWidth: 1200,
        margin: '0 auto'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span style={{
            fontSize: '0.8rem',
            fontWeight: 700,
            color: 'var(--accent-primary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            CLOSED-LOOP INSTITUTIONAL FLOW
          </span>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 800,
            margin: '8px 0 12px',
            color: 'var(--text-primary)'
          }}>
            The Design Placement Operating Model
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 620, margin: '0 auto', fontSize: '0.95rem' }}>
            A coordinated ecosystem connecting institutional governance, student design capability, and corporate recruitment rounds.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20
        }}>
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px'
          }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: 'var(--badge-purple-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary)',
              marginBottom: 16
            }}>
              <Compass size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 8px' }}>
              1. Portfolio & Career Intelligence
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Deep AI evaluation of student Behance, Figma, and PDF portfolios for visual hierarchy, UX case study rigor, typography, and tokenized design systems.
            </p>
          </div>

          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px'
          }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: 'var(--success-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--success-text)',
              marginBottom: 16
            }}>
              <ShieldCheck size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 8px' }}>
              2. Company Verification by TPO
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Companies register with the institution and must have corporate CIN credentials verified by the Placement Cell before launching campus recruitment drives.
            </p>
          </div>

          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px'
          }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: 'var(--accent-glow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary)',
              marginBottom: 16
            }}>
              <Layers size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 8px' }}>
              3. Placement Round Builder Engine
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Recruiters configure custom multi-stage pipelines: Screening → Portfolio Review → Design Challenge → Studio Interview → HR Round → Offer Rollout.
            </p>
          </div>

          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px'
          }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: 'var(--warning-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--warning-text)',
              marginBottom: 16
            }}>
              <BookOpen size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 8px' }}>
              4. Faculty Intervention Engine
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Identifies students falling below capability cutoffs and enables faculty mentors to assign targeted preparation tasks and design critiques.
            </p>
          </div>
        </div>
      </section>

      {/* Active Campus Drives Spotlight */}
      <section style={{
        padding: '60px 24px',
        background: 'var(--bg-surface-elevated)',
        borderTop: '1px solid var(--border-subtle)'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: 32,
            flexWrap: 'wrap',
            gap: 16
          }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                ON-CAMPUS RECRUITMENT DRIVES
              </span>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '6px 0 0' }}>
                Active Design Recruitment Hub
              </h2>
            </div>
            <button
              onClick={() => handleLaunchRole('student')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 18px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <span>View All Campus Drives</span>
              <ChevronRight size={16} />
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 20
          }}>
            {drives.map(drive => (
              <div 
                key={drive.id}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <CompanyBadge name={drive.companyName} size={44} />
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{drive.roleTitle}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{drive.companyName}</span>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  flexWrap: 'wrap',
                  fontSize: '0.75rem'
                }}>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: 4,
                    background: 'var(--badge-purple-bg)',
                    color: 'var(--badge-purple-text)',
                    fontWeight: 600
                  }}>
                    {drive.packageLpa}
                  </span>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: 4,
                    background: 'var(--badge-neutral-bg)',
                    color: 'var(--badge-neutral-text)',
                    fontWeight: 600
                  }}>
                    {drive.jobType}
                  </span>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: 4,
                    background: 'var(--success-bg)',
                    color: 'var(--success-text)',
                    fontWeight: 600
                  }}>
                    {drive.rounds.length} Selection Rounds
                  </span>
                </div>

                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {drive.description.substring(0, 140)}...
                </p>

                <div style={{
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: 12,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)'
                }}>
                  <span>Cutoff: {drive.eligibility.minPortfolioScore}+ Portfolio Score</span>
                  <button
                    onClick={() => handleLaunchRole('student')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-primary)',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    Apply Now <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
