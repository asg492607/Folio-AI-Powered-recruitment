import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { 
    activeInstitution, 
    departments, 
    batches, 
    auditLogs, 
    drives 
  } = useApp();

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto', padding: '24px' }}>
      {/* Admin Header */}
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
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)'
          }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Institution Administration & Systems Governance
              </h1>
              <span style={{
                padding: '2px 8px',
                borderRadius: 4,
                background: 'var(--badge-purple-bg)',
                color: 'var(--badge-purple-text)',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                ROOT CONTROLLER
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {activeInstitution.name} • Institutional Code: <span style={{ fontFamily: 'var(--font-mono)' }}>{activeInstitution.code}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Institutional Structure Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '20px'
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Academic Design Departments
          </span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 4 }}>{departments.length}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            UI/UX, Industrial, Visual Comm, Motion, Design Management
          </div>
        </div>

        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '20px'
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Active Student Cohorts
          </span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 4 }}>{batches.length} Batches</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Batches 2025, 2026, 2027 under management
          </div>
        </div>

        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '20px'
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Active Corporate Drives
          </span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 4 }}>{drives.length} Drives</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--success-text)', marginTop: 4 }}>
            All multi-stage rounds synchronized
          </div>
        </div>
      </div>

      {/* Compliance & Audit Logs */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
              Institutional Compliance & System Audit Logs
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Immutable audit trail recording verifications, drive publishing, round movements, and offer acceptances.
            </span>
          </div>

          <span style={{
            fontSize: '0.75rem',
            padding: '4px 10px',
            borderRadius: 4,
            background: 'var(--badge-neutral-bg)',
            color: 'var(--badge-neutral-text)',
            fontWeight: 700
          }}>
            {auditLogs.length} Logged Events
          </span>
        </div>

        <div style={{
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ background: 'var(--table-th-bg)', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '10px 14px', fontWeight: 700 }}>Timestamp</th>
                <th style={{ padding: '10px 14px', fontWeight: 700 }}>Actor</th>
                <th style={{ padding: '10px 14px', fontWeight: 700 }}>Event Action</th>
                <th style={{ padding: '10px 14px', fontWeight: 700 }}>Details & Audit Hash</th>
                <th style={{ padding: '10px 14px', fontWeight: 700 }}>Category</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--table-border)' }}>
                  <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    {log.timestamp}
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: 600 }}>{log.actor}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{
                      padding: '2px 6px',
                      borderRadius: 4,
                      background: 'var(--badge-purple-bg)',
                      color: 'var(--badge-purple-text)',
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.7rem'
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>{log.details}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{
                      padding: '2px 6px',
                      borderRadius: 4,
                      background: 'var(--badge-neutral-bg)',
                      color: 'var(--badge-neutral-text)',
                      fontWeight: 700,
                      fontSize: '0.7rem'
                    }}>
                      {log.category}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
