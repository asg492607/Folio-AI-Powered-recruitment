import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  GraduationCap, 
  UserCheck, 
  ChevronDown, 
  LogOut, 
  RotateCcw,
  Sparkles,
  Sun,
  Moon,
  ShieldCheck,
  Compass,
  BookOpen,
  Menu,
  X
} from 'lucide-react';
import type { UserRole } from '../types';

export const Navbar: React.FC<{ onNavigateAuth: () => void; onNavigateLanding: () => void }> = ({ 
  onNavigateAuth, 
  onNavigateLanding 
}) => {
  const { 
    theme,
    toggleTheme,
    role, 
    currentUser,
    switchPersona,
    logout,
    activeInstitution,
    institutions,
    setActiveInstitution,
    activeCompany,
    setActiveCompany,
    companies,
    activeStudent,
    setActiveStudent,
    students,
    resetAllData 
  } = useApp();

  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getRoleDisplayName = () => {
    if (currentUser) {
      return `${currentUser.name} (${currentUser.role.replace('_', ' ').toUpperCase()})`;
    }
    switch (role) {
      case 'recruiter':
        return `${activeCompany.name} (Recruiter)`;
      case 'placement_officer':
        return `${activeInstitution.name} (TPO Cell)`;
      case 'faculty':
        return 'Prof. Arundhati Sen (Faculty)';
      case 'student':
        return `${activeStudent.name} (Design Student)`;
      case 'admin':
        return 'Institution Admin';
      default:
        return 'Guest Explorer';
    }
  };

  const getRoleIcon = () => {
    switch (role) {
      case 'recruiter':
        return <Building2 size={16} color="var(--accent-primary)" />;
      case 'placement_officer':
        return <GraduationCap size={16} color="var(--success-text)" />;
      case 'faculty':
        return <BookOpen size={16} color="var(--warning-text)" />;
      case 'student':
        return <UserCheck size={16} color="var(--info-text)" />;
      case 'admin':
        return <ShieldCheck size={16} color="var(--accent-secondary)" />;
      default:
        return <Sparkles size={16} color="var(--text-muted)" />;
    }
  };

  const handleRoleSelect = (newRole: UserRole) => {
    switchPersona(newRole);
    setSwitcherOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'var(--bg-surface-glass)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Institutional Top Bar */}
      <div style={{
        background: 'var(--bg-surface-elevated)',
        borderBottom: '1px solid var(--border-subtle)',
        fontSize: '0.75rem',
        padding: '6px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
        color: 'var(--text-secondary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '2px 8px',
            borderRadius: '999px',
            background: 'var(--accent-glow)',
            color: 'var(--accent-primary)',
            fontWeight: 600,
            fontSize: '0.7rem'
          }}>
            <ShieldCheck size={12} />
            Institutional Verified Node
          </span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{activeInstitution.name}</span>
          <span style={{ color: 'var(--text-muted)' }}>• Code: {activeInstitution.code}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <select 
            value={activeInstitution.id}
            onChange={(e) => {
              const inst = institutions.find(i => i.id === e.target.value);
              if (inst) setActiveInstitution(inst);
            }}
            style={{
              fontSize: '0.75rem',
              padding: '2px 8px',
              borderRadius: '4px',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)'
            }}
          >
            {institutions.map(inst => (
              <option key={inst.id} value={inst.id}>{inst.name}</option>
            ))}
          </select>
          <span style={{ color: 'var(--text-muted)' }}>AI Design Career & Placement OS</span>
        </div>
      </div>

      {/* Main Navbar */}
      <div style={{
        maxWidth: 1440,
        margin: '0 auto',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16
      }}>
        {/* Brand Logo */}
        <div 
          onClick={onNavigateLanding}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 12, 
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div style={{
            width: 38,
            height: 38,
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
            color: '#fff'
          }}>
            <Compass size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ 
                fontFamily: 'var(--font-main)',
                fontWeight: 800, 
                fontSize: '1.25rem',
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)'
              }}>
                FOLIO
              </span>
              <span style={{
                background: 'var(--badge-purple-bg)',
                color: 'var(--badge-purple-text)',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: '4px',
                letterSpacing: '0.04em'
              }}>
                CAMPUS OS
              </span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.1 }}>
              Design Placement Intelligence System
            </div>
          </div>
        </div>

        {/* Desktop Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }} className="desktop-nav-controls">
          {/* Persona / Role Switcher */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setSwitcherOpen(!switcherOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 14px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {getRoleIcon()}
              <span>{getRoleDisplayName()}</span>
              <ChevronDown size={14} style={{ opacity: 0.7 }} />
            </button>

            {switcherOpen && (
              <div 
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 8px)',
                  width: 320,
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-dropdown)',
                  padding: 10,
                  zIndex: 200
                }}
              >
                <div style={{ 
                  padding: '6px 10px 10px', 
                  borderBottom: '1px solid var(--border-subtle)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--text-muted)'
                }}>
                  Institutional Role Switcher
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
                  <button
                    onClick={() => handleRoleSelect('student')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: role === 'student' ? 'var(--accent-glow)' : 'transparent',
                      border: 'none',
                      color: role === 'student' ? 'var(--accent-primary)' : 'var(--text-primary)',
                      fontWeight: role === 'student' ? 700 : 500,
                      fontSize: '0.85rem',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    <UserCheck size={16} color="var(--info-text)" />
                    <div>
                      <div>Student Candidate</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                        {activeStudent.name} • {activeStudent.designDiscipline}
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleSelect('placement_officer')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: role === 'placement_officer' ? 'var(--accent-glow)' : 'transparent',
                      border: 'none',
                      color: role === 'placement_officer' ? 'var(--accent-primary)' : 'var(--text-primary)',
                      fontWeight: role === 'placement_officer' ? 700 : 500,
                      fontSize: '0.85rem',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    <GraduationCap size={16} color="var(--success-text)" />
                    <div>
                      <div>Placement Officer (TPO)</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                        Company Verification & Drive Governance
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleSelect('faculty')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: role === 'faculty' ? 'var(--accent-glow)' : 'transparent',
                      border: 'none',
                      color: role === 'faculty' ? 'var(--accent-primary)' : 'var(--text-primary)',
                      fontWeight: role === 'faculty' ? 700 : 500,
                      fontSize: '0.85rem',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    <BookOpen size={16} color="var(--warning-text)" />
                    <div>
                      <div>Faculty Mentor</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                        Portfolio Reviews & Student Interventions
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleSelect('recruiter')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: role === 'recruiter' ? 'var(--accent-glow)' : 'transparent',
                      border: 'none',
                      color: role === 'recruiter' ? 'var(--accent-primary)' : 'var(--text-primary)',
                      fontWeight: role === 'recruiter' ? 700 : 500,
                      fontSize: '0.85rem',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    <Building2 size={16} color="var(--accent-primary)" />
                    <div>
                      <div>Recruiter / Company</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                        {activeCompany.name} ({activeCompany.verificationStatus})
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleSelect('admin')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: role === 'admin' ? 'var(--accent-glow)' : 'transparent',
                      border: 'none',
                      color: role === 'admin' ? 'var(--accent-primary)' : 'var(--text-primary)',
                      fontWeight: role === 'admin' ? 700 : 500,
                      fontSize: '0.85rem',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    <ShieldCheck size={16} color="var(--accent-secondary)" />
                    <div>
                      <div>Institution Admin</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                        Campuses, Departments & Compliance
                      </div>
                    </div>
                  </button>
                </div>

                <div style={{
                  marginTop: 10,
                  paddingTop: 8,
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <button
                    onClick={resetAllData}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      padding: '4px 6px'
                    }}
                  >
                    <RotateCcw size={12} />
                    Reset Data
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setSwitcherOpen(false);
                      onNavigateLanding();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      background: 'none',
                      border: 'none',
                      color: 'var(--danger-text)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: '4px 6px'
                    }}
                  >
                    <LogOut size={12} />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Student / Company picker if applicable */}
          {role === 'student' && (
            <select
              value={activeStudent.id}
              onChange={(e) => {
                const stu = students.find(s => s.id === e.target.value);
                if (stu) {
                  setActiveStudent(stu);
                  switchPersona('student', stu.id);
                }
              }}
              style={{
                fontSize: '0.8rem',
                padding: '6px 10px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)'
              }}
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.department.split(' ')[0]})</option>
              ))}
            </select>
          )}

          {role === 'recruiter' && (
            <select
              value={activeCompany.id}
              onChange={(e) => {
                const comp = companies.find(c => c.id === e.target.value);
                if (comp) {
                  setActiveCompany(comp);
                  switchPersona('recruiter', comp.id);
                }
              }}
              style={{
                fontSize: '0.8rem',
                padding: '6px 10px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)'
              }}
            >
              {companies.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.verified ? '✓' : '(Pending)'}
                </option>
              ))}
            </select>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle visual theme"
            style={{
              padding: '8px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Auth Button */}
          {currentUser ? (
            <button
              onClick={() => {
                logout();
                onNavigateLanding();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                background: 'transparent',
                color: 'var(--text-secondary)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <LogOut size={14} />
              Sign Out
            </button>
          ) : (
            <button
              onClick={onNavigateAuth}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--accent-primary)',
                border: 'none',
                color: '#fff',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)'
              }}
            >
              Institutional Login
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div style={{ display: 'none' }} className="mobile-menu-btn">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              padding: 8,
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer'
            }}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          padding: '16px 24px',
          background: 'var(--bg-surface)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            Switch Role:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button onClick={() => handleRoleSelect('student')} style={{ padding: '8px', fontSize: '0.8rem', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>Student</button>
            <button onClick={() => handleRoleSelect('placement_officer')} style={{ padding: '8px', fontSize: '0.8rem', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>TPO Cell</button>
            <button onClick={() => handleRoleSelect('faculty')} style={{ padding: '8px', fontSize: '0.8rem', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>Faculty</button>
            <button onClick={() => handleRoleSelect('recruiter')} style={{ padding: '8px', fontSize: '0.8rem', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>Recruiter</button>
          </div>
          <button 
            onClick={() => {
              onNavigateAuth();
              setMobileMenuOpen(false);
            }}
            style={{
              marginTop: 8,
              padding: '10px',
              borderRadius: 8,
              background: 'var(--accent-primary)',
              color: '#fff',
              fontWeight: 600,
              border: 'none'
            }}
          >
            Institutional Portal Login
          </button>
        </div>
      )}
    </header>
  );
};
