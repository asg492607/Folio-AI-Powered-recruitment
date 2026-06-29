import { Building2, CalendarDays, GraduationCap, UsersRound, Clock, Briefcase } from 'lucide-react';
import { useCollection } from '@/hooks/useCollection';
import type { CampusDrive } from '@/types';

export default function CampusPage() {
  const { items: drives, updateItem } = useCollection<CampusDrive>('campusDrives');

  const formatCampusDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const activeDrives = drives.filter((d) => d.status === 'Live').length;
  const totalRegistrations = drives.reduce((sum, d) => sum + d.registrations, 0);
  const totalShortlisted = drives.reduce((sum, d) => sum + d.shortlisted, 0);
  const shortlistRatio = totalRegistrations ? Math.round((totalShortlisted / totalRegistrations) * 100) : 0;
  const upcomingDrives = drives.filter((d) => d.status === 'Planning');

  return (
    <div className="space-y-6 w-full mx-auto">
      {/* Metrics Row - Rich Aesthetics, Premium KPI Cards */}
      <section className="grid gap-6 sm:grid-cols-3">
        {/* Active Campaigns */}
        <div className="p-5 rounded-2xl border border-[#ECE8E2] bg-white transition-all duration-300 card-hover flex flex-col justify-between min-h-[140px] shadow-sm">
          <div className="flex items-start justify-between">
            <span className="folio-meta text-[#6D6B8D] uppercase">
              Active campaigns
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-50 border border-[#ECE8E2]">
              <Building2 className="h-3.5 w-3.5 text-[#6D6B8D]" strokeWidth={1.5} />
            </div>
          </div>
          <div className="mt-2">
            <div className="font-serif text-4xl font-normal tracking-tight text-brand-navy">
              {activeDrives}
            </div>
            <div className="mt-2 flex items-center gap-1 text-[11px] text-[#6D6B8D] font-mono">
              <span className="text-brand-purple font-semibold">● 4 active targets</span>
              <span>· this term</span>
            </div>
          </div>
        </div>

        {/* Student Registrations */}
        <div className="p-5 rounded-2xl border border-[#ECE8E2] bg-white transition-all duration-300 card-hover flex flex-col justify-between min-h-[140px] shadow-sm">
          <div className="flex items-start justify-between">
            <span className="folio-meta text-[#6D6B8D] uppercase">
              Registrations
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-purple/5 border border-brand-purple/10">
              <UsersRound className="h-3.5 w-3.5 text-brand-purple" strokeWidth={1.5} />
            </div>
          </div>
          <div className="mt-2">
            <div className="font-serif text-4xl font-normal tracking-tight text-brand-purple">
              {totalRegistrations}
            </div>
            <div className="mt-2 flex items-center gap-1 text-[11px] text-[#6D6B8D] font-mono">
              <span className="text-brand-mint font-semibold">▲ +12% MoM</span>
              <span>· conversion growth</span>
            </div>
          </div>
        </div>

        {/* Shortlist Conversion */}
        <div className="p-5 rounded-2xl border border-[#ECE8E2] bg-white transition-all duration-300 card-hover flex flex-col justify-between min-h-[140px] shadow-sm">
          <div className="flex items-start justify-between">
            <span className="folio-meta text-[#6D6B8D] uppercase">
              Shortlist Ratio
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-mint/5 border border-brand-mint/10">
              <GraduationCap className="h-3.5 w-3.5 text-brand-mint" strokeWidth={1.5} />
            </div>
          </div>
          <div className="mt-2">
            <div className="font-serif text-4xl font-normal tracking-tight text-brand-mint">
              {shortlistRatio}%
            </div>
            <div className="mt-2 flex items-center gap-1 text-[11px] text-[#6D6B8D] font-mono">
              <span className="text-brand-orange font-semibold">● Target: 30%</span>
              <span>· ideal pipeline fit</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid: Campaigns & Timeline Activity */}
      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        {/* Left Column: Drives Directory */}
        <div className="rounded-2xl border border-[#ECE8E2] bg-[#FCFBF9] p-6 shadow-sm">
          <div className="mb-6 border-b border-[#ECE8E2] pb-4 flex justify-between items-center">
            <div>
              <h2 className="mb-2 text-[22px] font-bold text-[#1A1C2E]"
          style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}>Recruitment Campaigns</h2>
              <p className="text-[11px] mt-0.5 folio-meta text-[#6D6B8D] uppercase block tracking-wider font-bold">Active and historic campus drives.</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {drives.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-12 border border-dashed border-[#ECE8E2] rounded-2xl bg-stone-50/50">
                <Building2 className="h-10 w-10 text-stone-400 mb-3" strokeWidth={1.5} />
                <h3 className="font-sans font-semibold text-sm text-brand-navy">No campaigns found</h3>
                <p className="mt-1 text-xs text-[#6D6B8D] max-w-xs">No active university outreach drives have been registered in RecruiterOS yet.</p>
              </div>
            ) : (
              drives.map((drive) => {
                const statusColor = 
                  drive.status === 'Planning'
                    ? 'bg-stone-400'
                    : drive.status === 'Live'
                    ? 'bg-brand-orange'
                    : 'bg-brand-mint';

                return (
                  <article key={drive.id} className="p-4 rounded-xl border border-[#ECE8E2] bg-white transition duration-150 hover:border-brand-purple/20 hover:shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h3 className="folio-card-title text-brand-navy leading-snug">{drive.institution}</h3>
                        <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#6D6B8D] font-sans">
                          <span className="flex items-center gap-1 text-stone-700 font-medium">
                            <Briefcase className="h-3 w-3 opacity-75" strokeWidth={1.5} />
                            {drive.role}
                          </span>
                          <span className="text-[#ECE8E2]">·</span>
                          <span className="flex items-center gap-1">
                            <CalendarDays className="h-3 w-3 opacity-75" strokeWidth={1.5} />
                            <span className="font-mono text-xs">{formatCampusDate(drive.date)}</span>
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5">
                          <span className={`h-1.5 w-1.5 rounded-full ${statusColor}`} />
                          <span className="folio-meta text-[10px] text-[#6D6B8D] uppercase font-bold">
                            {drive.status}
                          </span>
                        </span>
                        <select 
                          className="input py-1.5 px-3 text-[10px] font-bold folio-mono uppercase cursor-pointer max-w-[130px] border-[#ECE8E2] rounded-lg" 
                          value={drive.status} 
                          onChange={(event) => void updateItem(drive.id, { status: event.target.value as CampusDrive['status'] })}
                        >
                          <option>Planning</option>
                          <option>Live</option>
                          <option>Completed</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-4 pt-3.5 border-t border-[#ECE8E2]/60 grid grid-cols-3 gap-4 text-xs">
                      <CampusNumber label="Registrations" value={drive.registrations} />
                      <CampusNumber label="Shortlisted" value={drive.shortlisted} />
                      <div>
                        <div className="folio-meta text-[9px] uppercase text-[#6D6B8D] mb-1">Campaign Owner</div>
                        <div className="font-sans font-bold text-brand-navy text-xs truncate">{drive.owner}</div>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Upcoming Activity Timeline */}
        <div className="rounded-2xl border border-[#ECE8E2] bg-[#FCFBF9] p-6 h-fit shadow-sm">
          <div className="mb-6 border-b border-[#ECE8E2] pb-4">
            <h2 className="mb-2 text-[22px] font-bold text-[#1A1C2E]"
          style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}>Upcoming Activity</h2>
            <p className="text-[11px] mt-0.5 folio-meta text-[#6D6B8D] uppercase block tracking-wider font-bold">Drives currently in planning stage.</p>
          </div>
          <div className="space-y-4">
            {upcomingDrives.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-10 px-4 border border-dashed border-[#ECE8E2] rounded-2xl bg-stone-50/50">
                <GraduationCap className="h-8 w-8 text-stone-400 mb-2.5" strokeWidth={1.5} />
                <h3 className="font-sans font-semibold text-xs text-brand-navy">No campaigns planned yet</h3>
                <p className="mt-1 text-[11px] text-[#6D6B8D] max-w-[180px] leading-normal">Upcoming outreach campaigns will appear here once scheduled.</p>
              </div>
            ) : (
              upcomingDrives.map((drive) => (
                <div key={drive.id} className="flex gap-3 items-start p-3 rounded-xl border border-[#ECE8E2] bg-white">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-orange/5 text-brand-orange border border-brand-orange/10 flex-shrink-0">
                    <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-sans font-semibold text-brand-navy text-xs leading-snug truncate">{drive.institution}</h4>
                    <p className="text-[11px] text-[#6D6B8D] font-sans mt-0.5 truncate">{drive.role} · {drive.date}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function CampusNumber({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="folio-meta text-[9px] uppercase text-[#6D6B8D] mb-1">{label}</div>
      <div className="folio-mono font-bold text-brand-navy text-xs">{value}</div>
    </div>
  );
}
