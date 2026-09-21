import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import { CompanyDashboard } from './components/company/CompanyDashboard';
import { CollegeDashboard } from './components/college/CollegeDashboard';
import { StudentDashboard } from './components/student/StudentDashboard';
import { FacultyDashboard } from './components/faculty/FacultyDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Compass, Wifi, WifiOff, Loader } from 'lucide-react';

const BackendBadge: React.FC = () => {
  const { backendOnline, dataLoading } = useApp();
  if (dataLoading) {
    return (
      <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: 'var(--text-muted)', padding: '3px 10px', borderRadius: 20, background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
        <Loader size={11} style={{ animation: 'spin 1s linear infinite' }} />
        Connecting…
      </span>
    );
  }
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: backendOnline ? 'var(--success)' : 'var(--warning)', padding: '3px 10px', borderRadius: 20, background: 'var(--bg-elevated)', border: `1px solid ${backendOnline ? 'var(--success)' : 'var(--warning)'}` }}>
      {backendOnline ? <Wifi size={11} /> : <WifiOff size={11} />}
      {backendOnline ? 'Backend Online' : 'Backend Offline — Start server'}
    </span>
  );
};

const LoadingScreen: React.FC = () => (
  <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', gap: 20 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <Compass size={32} color="var(--accent-primary)" />
      <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Folio Institutional</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
      <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
      Connecting to backend…
    </div>
    <div style={{ marginTop: 8, fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', maxWidth: 320, lineHeight: 1.6 }}>
      Make sure the FastAPI backend is running:<br />
      <code style={{ background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: 6, fontSize: '0.75rem' }}>
        cd unified_backend && uvicorn main:app --reload
      </code>
    </div>
  </div>
);

const MainContent: React.FC = () => {
  const { role, setRole, activeInstitution, dataLoading, backendOnline } = useApp();
  const [isAuthView, setIsAuthView] = useState(false);

  const handleNavigateAuth = () => setIsAuthView(true);
  const handleNavigateLanding = () => { setIsAuthView(false); setRole('guest'); };
  const handleAuthSuccess = () => setIsAuthView(false);

  // Show full-page loading only on very first load (no user session)
  if (dataLoading && role === 'guest') {
    return <LoadingScreen />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        onNavigateAuth={handleNavigateAuth}
        onNavigateLanding={handleNavigateLanding}
      />

      <main style={{ flex: 1 }}>
        {isAuthView ? (
          <AuthPage onSuccess={handleAuthSuccess} />
        ) : (
          <>
            {role === 'guest' && <LandingPage onGetStarted={handleNavigateAuth} />}
            {role === 'student' && <StudentDashboard />}
            {role === 'placement_officer' && <CollegeDashboard />}
            {role === 'recruiter' && <CompanyDashboard />}
            {role === 'faculty' && <FacultyDashboard />}
            {role === 'admin' && <AdminDashboard />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)',
        padding: '18px 24px',
        marginTop: 'auto'
      }}>
        <div style={{
          maxWidth: 1440,
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Compass size={15} color="var(--accent-primary)" />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              <strong>Folio Institutional</strong> — AI-Powered Design Career & Placement Intelligence
              {activeInstitution?.name ? ` · ${activeInstitution.name}` : ''}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {backendOnline ? 'SQLite · FastAPI · React' : 'Run: uvicorn main:app --reload'}
            </span>
            <BackendBadge />
          </div>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

export default App;
