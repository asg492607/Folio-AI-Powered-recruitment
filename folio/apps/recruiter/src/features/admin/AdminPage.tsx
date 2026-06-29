import { useState } from 'react';
import { Cloud, Database, RotateCcw } from 'lucide-react';
import { seedUsers } from '@/data/seed';
import { hasFirebaseConfig } from '@/services/firebase/app';
import { ensureSeedData, seedFirestoreData } from '@/services/firebase/db';

const collectionKeys = ['jobs', 'candidates', 'interviews', 'campusDrives', 'notifications'];

export default function AdminPage() {
  const [seedStatus, setSeedStatus] = useState('');

  const resetLocalData = () => {
    collectionKeys.forEach((key) => localStorage.removeItem(`recruiter_app_${key}`));
    ensureSeedData();
    window.location.reload();
  };

  const handleSeedFirestore = async () => {
    await seedFirestoreData();
    setSeedStatus(hasFirebaseConfig ? 'Seed data synced to Firestore.' : 'Local fallback data reset.');
  };

  return (
    <div className="space-y-6 w-full mx-auto">
      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        {/* Left Column: Data Management */}
        <section className="rounded-2xl border border-[#ECE8E2] bg-[#FCFBF9] p-6 h-fit shadow-sm">
          <div className="flex items-start gap-4 border-b border-[#ECE8E2] pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-purple/5 text-brand-purple border border-brand-purple/10 flex-shrink-0">
              {hasFirebaseConfig ? <Cloud className="h-5 w-5" strokeWidth={1.5} /> : <Database className="h-5 w-5" strokeWidth={1.5} />}
            </div>
            <div>
              <h2 className="folio-section-title text-brand-navy">{hasFirebaseConfig ? 'Firestore Connected' : 'Database Fallback'}</h2>
              <p className="mt-1 folio-meta text-[#6D6B8D] uppercase">{hasFirebaseConfig ? 'Firebase environment values detected.' : 'Firebase keys absent, local simulation active.'}</p>
            </div>
          </div>

          {/* System Indicators Panel */}
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[10px] font-mono text-brand-mint font-semibold border-b border-[#ECE8E2] pb-4">
            <span className="flex items-center gap-1">● Database Active</span>
            <span className="flex items-center gap-1">● Storage Active</span>
            <span className="flex items-center gap-1">● Auth Active</span>
            <span className="flex items-center gap-1 text-brand-purple">● Simulation Active</span>
          </div>

          <div className="mt-4 rounded-xl border border-[#ECE8E2] bg-white p-4 text-xs leading-relaxed text-[#6D6B8D] font-sans">
            {hasFirebaseConfig
              ? 'The app is using Cloud Firestore for jobs, candidates, interviews, campus drives, and notifications. Use the seed action to create starter documents in your Firebase project.'
              : 'The app seeds browser localStorage with jobs, candidates, interviews, campus drives, and notifications. The service layer mirrors a small Firestore-style API so real Firebase calls can replace it later.'}
          </div>

          <div className="mt-6 space-y-3">
            <button 
              type="button" 
              onClick={() => void handleSeedFirestore()} 
              className="button-primary w-full py-3 flex items-center justify-center font-bold hover:bg-brand-orange transition duration-150 cursor-pointer"
            >
              <Cloud className="h-4 w-4" strokeWidth={1.5} />
              {hasFirebaseConfig ? 'Seed Firestore Data' : 'Seed Local Data'}
            </button>
            <button 
              type="button" 
              onClick={resetLocalData} 
              className="folio-mono text-[10px] font-bold text-brand-navy border border-[#ECE8E2] bg-white hover:bg-stone-50 px-4 py-2.5 rounded-lg transition duration-150 flex items-center justify-center gap-2 w-full cursor-pointer uppercase"
            >
              <RotateCcw className="h-4 w-4" strokeWidth={1.5} />
              Reset Seeded Data
            </button>
          </div>
          {seedStatus && (
            <div className="mt-4 rounded-xl bg-brand-mint/5 border border-brand-mint/15 px-4 py-2 text-xs font-sans font-semibold text-brand-mint text-center">
              {seedStatus}
            </div>
          )}
        </section>

        {/* Right Column: Pre-registered Users */}
        <section className="rounded-2xl border border-[#ECE8E2] bg-[#FCFBF9] p-6 shadow-sm">
          <div className="mb-5 border-b border-[#ECE8E2] pb-4">
            <h2 className="folio-section-title text-brand-navy">Seed Users</h2>
            <p className="mt-1 folio-meta text-[#6D6B8D] uppercase">Pre-registered accounts shown on the login screen.</p>
          </div>
          
          <div className="space-y-3.5">
            {seedUsers.map((user) => (
              <article key={user.id} className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-xl border border-[#ECE8E2] bg-white transition duration-150 hover:border-brand-purple/20">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-navy text-white text-xs font-sans font-bold flex-shrink-0">
                    {user.displayName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="folio-card-title text-brand-navy text-sm font-semibold">{user.displayName}</h3>
                    <div className="text-[11px] text-[#6D6B8D] font-mono mt-0.5">{user.email}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="inline-flex items-center rounded-md bg-stone-50 px-2.5 py-0.5 folio-meta text-[9px] font-bold text-brand-purple border border-[#ECE8E2] uppercase">
                      {user.role}
                    </span>
                    <div className="text-[9px] font-mono text-brand-mint mt-1">● Last active now</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
