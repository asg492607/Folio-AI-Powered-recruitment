import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  GraduationCap, 
  UserCheck, 
  BookOpen, 
  ShieldCheck, 
  ArrowRight, 
  Lock, 
  Mail, 
  CheckCircle2, 
  AlertCircle,
  Compass
} from 'lucide-react';
import type { UserRole } from '../types';

export const AuthPage: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const { login, register, institutions, switchPersona } = useApp();
  const [tab, setTab] = useState<'signin' | 'register'>('signin');
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');

  // Sign In Form State
  const [signInEmail, setSignInEmail] = useState('ananya.deshmukh22@mitid.edu.in');
  const [signInPassword, setSignInPassword] = useState('DesignMastery2026!');
  const [signInError, setSignInError] = useState('');

  // Student Registration State
  const [stuName, setStuName] = useState('');
  const [stuEmail, setStuEmail] = useState('');
  const [stuRollNo, setStuRollNo] = useState('');
  const [stuDept, setStuDept] = useState('B.Des User Experience & Interaction Design');
  const [stuPortfolioUrl, setStuPortfolioUrl] = useState('');

  // Recruiter Registration State
  const [compName, setCompName] = useState('');
  const [compDomain, setCompDomain] = useState('');
  const [compCin, setCompCin] = useState('');
  const [compIndustry, setCompIndustry] = useState('Digital Product Studio');
  const [compHrName, setCompHrName] = useState('');
  const [compHrEmail, setCompHrEmail] = useState('');
  const [compHrPhone, setCompHrPhone] = useState('');
  const [compHq, setCompHq] = useState('');
  const [compTargetInst, setCompTargetInst] = useState(institutions[0]?.id || 'inst-mitid');

  // Faculty Registration State
  const [facName, setFacName] = useState('');
  const [facEmail, setFacEmail] = useState('');
  const [facDept, setFacDept] = useState('B.Des User Experience & Interaction Design');

  // UI Feedback
  const [formSuccessMessage, setFormSuccessMessage] = useState('');
  const [formErrorMessage, setFormErrorMessage] = useState('');

  const handleRoleTabChange = (r: UserRole) => {
    setSelectedRole(r);
    setSignInError('');
    // Pre-populate realistic sample institutional credentials for easy testing
    if (r === 'student') {
      setSignInEmail('ananya.deshmukh22@mitid.edu.in');
    } else if (r === 'recruiter') {
      setSignInEmail('harshita.k@cred.club');
    } else if (r === 'placement_officer') {
      setSignInEmail('tpo.design@mitid.edu.in');
    } else if (r === 'faculty') {
      setSignInEmail('arundhati.sen@mitid.edu.in');
    } else if (r === 'admin') {
      setSignInEmail('admin@mitid.edu.in');
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError('');
    const res = await login(signInEmail, signInPassword, selectedRole);
    if (res.success) {
      onSuccess();
    } else {
      setSignInError(res.message || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrorMessage('');
    setFormSuccessMessage('');

    if (selectedRole === 'student') {
      if (!stuName.trim() || !stuEmail.trim() || !stuRollNo.trim()) {
        setFormErrorMessage('Please fill out all required academic fields.');
        return;
      }
      const res = await register('student', {
        name: stuName,
        email: stuEmail,
        rollNo: stuRollNo,
        department: stuDept,
        portfolioUrl: stuPortfolioUrl || 'https://behance.net/design-portfolio'
      });
      if (res.success) {
        onSuccess();
      } else {
        setFormErrorMessage(res.message || 'Registration failed.');
      }
    } else if (selectedRole === 'recruiter') {
      if (!compName.trim() || !compDomain.trim() || !compHrEmail.trim() || !compCin.trim()) {
        setFormErrorMessage('Please supply Company Name, Domain, HR Email, and Corporate Identification Number (CIN).');
        return;
      }
      const res = await register('recruiter', {
        companyName: compName,
        domain: compDomain,
        cin: compCin,
        industry: compIndustry,
        hrName: compHrName || 'Recruiter Lead',
        hrEmail: compHrEmail,
        hrPhone: compHrPhone || '+91 98765 43210',
        headquarters: compHq || 'Bengaluru / Mumbai',
        targetInstitutionId: compTargetInst
      });
      if (res.success) {
        onSuccess();
      } else {
        setFormErrorMessage(res.message || 'Company registration failed.');
      }
    } else if (selectedRole === 'faculty') {
      if (!facName.trim() || !facEmail.trim()) {
        setFormErrorMessage('Please fill out Faculty Name and Institutional Email.');
        return;
      }
      const res = await register('faculty', {
        name: facName,
        email: facEmail,
        department: facDept
      });
      if (res.success) {
        onSuccess();
      } else {
        setFormErrorMessage(res.message || 'Registration failed.');
      }
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 120px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      background: 'radial-gradient(ellipse at 50% 10%, rgba(79, 70, 229, 0.08) 0%, transparent 70%)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: 580,
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-dropdown)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '32px 32px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          textAlign: 'center',
          background: 'var(--bg-surface-elevated)'
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            marginBottom: 12,
            boxShadow: '0 4px 14px rgba(79, 70, 229, 0.25)'
          }}>
            <Compass size={24} />
          </div>
          <h1 style={{
            fontSize: '1.4rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            margin: '0 0 6px'
          }}>
            Institutional Placement Operating System
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            Unified Career Intelligence & Placement Infrastructure for Design Colleges
          </p>

          {/* Tab Switcher (Sign In vs Register) */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-surface)',
            padding: 4,
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            marginTop: 20
          }}>
            <button
              type="button"
              onClick={() => { setTab('signin'); setSignInError(''); }}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: tab === 'signin' ? 'var(--accent-primary)' : 'transparent',
                color: tab === 'signin' ? '#fff' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Sign In with Institutional ID
            </button>
            <button
              type="button"
              onClick={() => { setTab('register'); setFormErrorMessage(''); }}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: tab === 'register' ? 'var(--accent-primary)' : 'transparent',
                color: tab === 'register' ? '#fff' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Institutional Enrollment
            </button>
          </div>
        </div>

        {/* Persona Selectors */}
        <div style={{
          padding: '16px 32px 0',
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 6
        }}>
          {[
            { r: 'student', label: 'Student', icon: <UserCheck size={16} /> },
            { r: 'placement_officer', label: 'TPO Cell', icon: <GraduationCap size={16} /> },
            { r: 'faculty', label: 'Faculty', icon: <BookOpen size={16} /> },
            { r: 'recruiter', label: 'Recruiter', icon: <Building2 size={16} /> },
            { r: 'admin', label: 'Admin', icon: <ShieldCheck size={16} /> },
          ].map(({ r, label, icon }) => {
            const isSelected = selectedRole === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => handleRoleTabChange(r as UserRole)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  padding: '10px 4px',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                  background: isSelected ? 'var(--accent-glow)' : 'var(--bg-surface-elevated)',
                  color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {icon}
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px 32px 32px' }}>
          {tab === 'signin' ? (
            <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {signInError && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 14px',
                  background: 'var(--danger-bg)',
                  border: '1px solid var(--danger-border)',
                  color: 'var(--danger-text)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem'
                }}>
                  <AlertCircle size={16} />
                  <span>{signInError}</span>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                  Institutional Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    required
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="name@institution.edu.in"
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 38px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-surface)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                  Password / Passkey
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    required
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 38px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-surface)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>
              </div>

              <div style={{
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                lineHeight: 1.4
              }}>
                <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Institutional Node:</span> Verifying role access for <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>{selectedRole.replace('_', ' ').toUpperCase()}</span>.
              </div>

              <button
                type="submit"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--accent-primary)',
                  border: 'none',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px var(--accent-glow)'
                }}
              >
                <span>Authenticate into Portal</span>
                <ArrowRight size={16} />
              </button>

              <div style={{ textAlign: 'center', marginTop: 8 }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Need immediate access for evaluation?{' '}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    switchPersona(selectedRole);
                    onSuccess();
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-primary)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Quick Sign-In as {selectedRole.replace('_', ' ')}
                </button>
              </div>
            </form>
          ) : (
            /* Registration Form */
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {formErrorMessage && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 14px',
                  background: 'var(--danger-bg)',
                  border: '1px solid var(--danger-border)',
                  color: 'var(--danger-text)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem'
                }}>
                  <AlertCircle size={16} />
                  <span>{formErrorMessage}</span>
                </div>
              )}

              {formSuccessMessage && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 14px',
                  background: 'var(--success-bg)',
                  border: '1px solid var(--success-border)',
                  color: 'var(--success-text)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem'
                }}>
                  <CheckCircle2 size={16} />
                  <span>{formSuccessMessage}</span>
                </div>
              )}

              {/* Student Fields */}
              {selectedRole === 'student' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ananya Deshmukh"
                      value={stuName}
                      onChange={(e) => setStuName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--bg-surface)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                        College Email
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="ananya@mitid.edu.in"
                        value={stuEmail}
                        onChange={(e) => setStuEmail(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-subtle)',
                          background: 'var(--bg-surface)',
                          color: 'var(--text-primary)',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                        University Roll Number
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="MITID22UX041"
                        value={stuRollNo}
                        onChange={(e) => setStuRollNo(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-subtle)',
                          background: 'var(--bg-surface)',
                          color: 'var(--text-primary)',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                      Design Department
                    </label>
                    <select
                      value={stuDept}
                      onChange={(e) => setStuDept(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--bg-surface)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem'
                      }}
                    >
                      <option value="B.Des User Experience & Interaction Design">B.Des User Experience & Interaction Design</option>
                      <option value="B.Des Industrial & Product Design">B.Des Industrial & Product Design</option>
                      <option value="B.Des Visual Communication & Graphic Design">B.Des Visual Communication & Graphic Design</option>
                      <option value="B.Des Animation & Motion Graphics">B.Des Animation & Motion Graphics</option>
                      <option value="M.Des Design Management & Experience Strategy">M.Des Design Management & Experience Strategy</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                      Portfolio Link (Behance / Figma / Website / Dribbble)
                    </label>
                    <input
                      type="url"
                      placeholder="https://behance.net/your-portfolio"
                      value={stuPortfolioUrl}
                      onChange={(e) => setStuPortfolioUrl(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--bg-surface)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>
                </>
              )}

              {/* Recruiter / Company Registration Fields */}
              {selectedRole === 'recruiter' && (
                <>
                  <div style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--badge-purple-bg)',
                    border: '1px solid var(--badge-purple-border)',
                    fontSize: '0.78rem',
                    color: 'var(--badge-purple-text)'
                  }}>
                    <strong>Institutional Verification Workflow:</strong> When you register as a company recruiter, your profile and CIN credentials will be forwarded to the college Placement Cell (TPO) for verification before campus drives can be launched.
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 10 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                        Company / Design Studio Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. CRED Design Studio"
                        value={compName}
                        onChange={(e) => setCompName(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-subtle)',
                          background: 'var(--bg-surface)',
                          color: 'var(--text-primary)',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                        Corporate Domain
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="cred.club"
                        value={compDomain}
                        onChange={(e) => setCompDomain(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-subtle)',
                          background: 'var(--bg-surface)',
                          color: 'var(--text-primary)',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                        Corporate CIN / Tax ID
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="U72900KA2018PTC111843"
                        value={compCin}
                        onChange={(e) => setCompCin(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-subtle)',
                          background: 'var(--bg-surface)',
                          color: 'var(--text-primary)',
                          fontSize: '0.85rem',
                          fontFamily: 'var(--font-mono)'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                        Target Institution
                      </label>
                      <select
                        value={compTargetInst}
                        onChange={(e) => setCompTargetInst(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-subtle)',
                          background: 'var(--bg-surface)',
                          color: 'var(--text-primary)',
                          fontSize: '0.85rem'
                        }}
                      >
                        {institutions.map(inst => (
                          <option key={inst.id} value={inst.id}>{inst.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                        Lead Recruiter / HR Name
                      </label>
                      <input
                        type="text"
                        placeholder="Harshita Kapoor"
                        value={compHrName}
                        onChange={(e) => setCompHrName(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-subtle)',
                          background: 'var(--bg-surface)',
                          color: 'var(--text-primary)',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                        HR Work Email
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="harshita.k@cred.club"
                        value={compHrEmail}
                        onChange={(e) => setCompHrEmail(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-subtle)',
                          background: 'var(--bg-surface)',
                          color: 'var(--text-primary)',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                        HR Contact Phone
                      </label>
                      <input
                        type="tel"
                        placeholder="+91 98201 44512"
                        value={compHrPhone}
                        onChange={(e) => setCompHrPhone(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-subtle)',
                          background: 'var(--bg-surface)',
                          color: 'var(--text-primary)',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                        Design Domain / Industry
                      </label>
                      <input
                        type="text"
                        placeholder="FinTech Product Design Studio"
                        value={compIndustry}
                        onChange={(e) => setCompIndustry(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-subtle)',
                          background: 'var(--bg-surface)',
                          color: 'var(--text-primary)',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                      Studio Headquarters / Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Indiranagar, Bengaluru / Hybrid"
                      value={compHq}
                      onChange={(e) => setCompHq(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--bg-surface)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>
                </>
              )}

              {/* Faculty Fields */}
              {selectedRole === 'faculty' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                      Faculty Full Name & Title
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Prof. Arundhati Sen"
                      value={facName}
                      onChange={(e) => setFacName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--bg-surface)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                        Institutional Email
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="arundhati.sen@mitid.edu.in"
                        value={facEmail}
                        onChange={(e) => setFacEmail(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-subtle)',
                          background: 'var(--bg-surface)',
                          color: 'var(--text-primary)',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                        Department Mentorship
                      </label>
                      <select
                        value={facDept}
                        onChange={(e) => setFacDept(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-subtle)',
                          background: 'var(--bg-surface)',
                          color: 'var(--text-primary)',
                          fontSize: '0.85rem'
                        }}
                      >
                        <option value="B.Des User Experience & Interaction Design">B.Des User Experience</option>
                        <option value="B.Des Industrial & Product Design">B.Des Product Design</option>
                        <option value="B.Des Visual Communication & Graphic Design">B.Des Visual Comm</option>
                        <option value="B.Des Animation & Motion Graphics">B.Des Motion Graphics</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                style={{
                  marginTop: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--accent-primary)',
                  border: 'none',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px var(--accent-glow)'
                }}
              >
                <span>Submit Institutional Enrollment</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
