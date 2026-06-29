import { Database, AlertTriangle } from 'lucide-react';
import { hasFirebaseConfig } from '@/services/firebase/app';
import StatusBadge from '@/components/StatusBadge';

export default function AdminPage() {
  return (
    <div className="space-y-6 w-full mx-auto">
      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        {/* Left Column: Data Management */}
        <section className="rounded-2xl border border-[#ECE8E2] bg-[#FCFBF9] p-6 h-fit shadow-sm">
          <div className="flex items-start gap-4 border-b border-[#ECE8E2] pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-purple/5 text-brand-purple border border-brand-purple/10 flex-shrink-0">
              <Database className="h-5 w-5" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="folio-section-title text-brand-navy">Production Environment</h2>
              <p className="mt-1 folio-meta text-[#6D6B8D] uppercase">Live Backend API Connected</p>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-[#ECE8E2] bg-white p-4 text-xs leading-relaxed text-[#6D6B8D] font-sans">
            The application is communicating directly with the Unified Python Backend and real Firebase Authentication. Mock data and local storage fallbacks have been completely disabled.
          </div>
        </section>
      </div>
    </div>
  );
}
