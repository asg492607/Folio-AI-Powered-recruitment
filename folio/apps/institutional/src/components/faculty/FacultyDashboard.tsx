import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Avatar } from '../Avatar';
import { 
  BookOpen, 
  Plus, 
  ExternalLink,
  Search
} from 'lucide-react';

export const FacultyDashboard: React.FC = () => {
  const { 
    currentUser, 
    students, 
    interventions, 
    assignFacultyIntervention, 
    activeInstitution 
  } = useApp();

  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [taskDueDate, setTaskDueDate] = useState('2026-10-15');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const selectedStudent = students.find(s => s.id === selectedStudentId) || students[0];
  const assignedTasks = interventions.filter(i => i.studentId === selectedStudent?.id);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    s.rollNo.toLowerCase().includes(searchFilter.toLowerCase()) ||
    s.department.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleAssignTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !selectedStudent) return;

    assignFacultyIntervention({
      studentId: selectedStudent.id,
      title: taskTitle,
      description: taskDescription,
      priority: taskPriority,
      dueDate: taskDueDate
    });

    setTaskTitle('');
    setTaskDescription('');
    setShowAssignModal(false);
    alert(`Intervention task assigned to ${selectedStudent.name}!`);
  };

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)'
          }}>
            <BookOpen size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Faculty Mentorship & Intervention Desk
              </h1>
              <span style={{
                padding: '2px 8px',
                borderRadius: 4,
                background: 'var(--warning-bg)',
                color: 'var(--warning-text)',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                ACADEMIC MENTOR
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {currentUser?.name || 'Prof. Arundhati Sen'} • {activeInstitution.name}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAssignModal(true)}
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
            cursor: 'pointer',
            boxShadow: '0 4px 12px var(--accent-glow)'
          }}
        >
          <Plus size={16} />
          <span>Assign Targeted Preparation Task</span>
        </button>
      </div>

      {/* Main Split View */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(320px, 400px) 1fr',
        gap: 20,
        alignItems: 'start'
      }}>
        {/* Left: Cohort Students List */}
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
            flexDirection: 'column',
            gap: 8
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Assigned Design Cohort ({students.length})
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Click to review</span>
            </div>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-muted)' }} />
              <input 
                type="text"
                placeholder="Filter students..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 12px 6px 30px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface)',
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
            {filteredStudents.map(student => {
              const isSelected = selectedStudent?.id === student.id;
              const needsIntervention = student.portfolioScore < 70 || student.careerReadiness < 70;

              return (
                <div
                  key={student.id}
                  onClick={() => setSelectedStudentId(student.id)}
                  style={{
                    padding: '14px 18px',
                    borderBottom: '1px solid var(--border-subtle)',
                    background: isSelected ? 'var(--accent-glow)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={student.name} size={34} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                          {student.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {student.rollNo} • {student.department.replace('B.Des ', '').replace('M.Des ', '')}
                        </div>
                      </div>
                    </div>

                    <span style={{
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      color: student.portfolioScore >= 80 ? 'var(--success-text)' : 'var(--warning-text)'
                    }}>
                      {student.portfolioScore} Score
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      Readiness: <strong>{student.careerReadiness}%</strong>
                    </span>
                    {needsIntervention && (
                      <span style={{
                        padding: '1px 6px',
                        borderRadius: 4,
                        background: 'var(--danger-bg)',
                        color: 'var(--danger-text)',
                        fontWeight: 700
                      }}>
                        Intervention Alert
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Student Intelligence Report & Intervention Desk */}
        {selectedStudent && (
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 20
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: 16
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
                    {selectedStudent.name}
                  </h2>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: 4,
                    background: selectedStudent.portfolioScore >= 75 ? 'var(--success-bg)' : 'var(--warning-bg)',
                    color: selectedStudent.portfolioScore >= 75 ? 'var(--success-text)' : 'var(--warning-text)',
                    fontWeight: 700,
                    fontSize: '0.75rem'
                  }}>
                    {selectedStudent.portfolioScore >= 75 ? 'Placement Ready' : 'Needs Mentorship'}
                  </span>
                </div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {selectedStudent.department} • Batch of {selectedStudent.graduationYear} • CGPA: {selectedStudent.cgpa}
                </span>
              </div>

              <a 
                href={selectedStudent.portfolioUrl} 
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
                <span>Review Portfolio</span>
                <ExternalLink size={14} />
              </a>
            </div>

            {/* AI Portfolio Dimension Breakdown */}
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 10px' }}>
                AI Evaluated Dimension Matrix
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
                <div style={{ padding: '10px', borderRadius: 8, background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Visual Hierarchy</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--success-text)' }}>
                    {selectedStudent.portfolioReport?.visualHierarchy || 85}%
                  </div>
                </div>
                <div style={{ padding: '10px', borderRadius: 8, background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>UX Case Study Rigor</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                    {selectedStudent.portfolioReport?.uxResearch || 80}%
                  </div>
                </div>
                <div style={{ padding: '10px', borderRadius: 8, background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Typography & Grids</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {selectedStudent.portfolioReport?.typography || 82}%
                  </div>
                </div>
                <div style={{ padding: '10px', borderRadius: 8, background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Design Systems</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--success-text)' }}>
                    {selectedStudent.portfolioReport?.designSystems || 88}%
                  </div>
                </div>
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
              <div style={{
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--success-bg)',
                border: '1px solid var(--success-border)',
                fontSize: '0.8rem'
              }}>
                <div style={{ fontWeight: 700, color: 'var(--success-text)', marginBottom: 6 }}>
                  Verified Strengths
                </div>
                <ul style={{ margin: 0, paddingLeft: 16, color: 'var(--text-secondary)' }}>
                  {selectedStudent.portfolioReport?.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              <div style={{
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--warning-bg)',
                border: '1px solid var(--warning-border)',
                fontSize: '0.8rem'
              }}>
                <div style={{ fontWeight: 700, color: 'var(--warning-text)', marginBottom: 6 }}>
                  Targeted Weaknesses
                </div>
                <ul style={{ margin: 0, paddingLeft: 16, color: 'var(--text-secondary)' }}>
                  {selectedStudent.portfolioReport?.weaknesses.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Active Interventions for this Student */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', margin: 0 }}>
                  Assigned Preparation Tasks ({assignedTasks.length})
                </h4>
                <button
                  onClick={() => setShowAssignModal(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-primary)',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={14} /> Add Task
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {assignedTasks.length === 0 ? (
                  <div style={{
                    padding: '20px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    textAlign: 'center',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)'
                  }}>
                    No active intervention tasks assigned to this student. Click "Assign Targeted Preparation Task" above to create one.
                  </div>
                ) : (
                  assignedTasks.map(task => (
                    <div
                      key={task.id}
                      style={{
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--bg-surface-elevated)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{task.title}</span>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: 4,
                          background: task.status === 'Completed' ? 'var(--success-bg)' : 'var(--warning-bg)',
                          color: task.status === 'Completed' ? 'var(--success-text)' : 'var(--warning-text)',
                          fontSize: '0.7rem',
                          fontWeight: 700
                        }}>
                          {task.status}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {task.description}
                      </p>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        Due by: {task.dueDate} • Priority: {task.priority}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Assign Task Modal */}
      {showAssignModal && (
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
          <form onSubmit={handleAssignTask} style={{
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
              <BookOpen size={24} color="var(--warning-text)" />
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                  Assign Targeted Preparation Task
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Student: {selectedStudent?.name} ({selectedStudent?.rollNo})
                </span>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>Task Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Expand UX Research & Add Usability Findings"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-surface-elevated)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>Instructions & Case Study Context</label>
              <textarea
                rows={3}
                required
                placeholder="Detail the specific project improvements, typography adjustments, or component tokens required..."
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-surface-elevated)', color: 'var(--text-primary)', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>Priority</label>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as any)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-surface-elevated)', color: 'var(--text-primary)' }}
                >
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>Completion Due Date</label>
                <input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-surface-elevated)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'transparent', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: 'var(--accent-primary)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
              >
                Assign Task to Student
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
