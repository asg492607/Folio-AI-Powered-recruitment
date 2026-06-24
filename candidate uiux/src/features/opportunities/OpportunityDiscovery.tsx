import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EmptyState } from '../../components/EmptyState';
import { PageHeader } from '../../components/PageHeader';
import { useOpportunityStore } from '../../store/opportunityStore';
import { OpportunityCard } from './OpportunityCard';
import { Search, Sparkles, X, SlidersHorizontal } from 'lucide-react';

const disciplinesList = ['UI/UX', 'Graphic', 'Product', 'Motion', 'Illustration'];
const workTypesList = [
  { value: 'internship', label: 'Internship' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'full_time', label: 'Full-time' },
];
const locationTypesList = [
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'On-site' },
];

export function OpportunityDiscovery() {
  const opportunities = useOpportunityStore((state) => state.opportunities);
  const savedIds = useOpportunityStore((state) => state.savedIds);
  const [params, setParams] = useSearchParams();
  
  // Search query state
  const [query, setQuery] = useState(params.get('q') ?? '');

  // Checkbox filters state - UI/UX is checked by default as shown in the screenshot
  const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>(['UI/UX']);
  const [selectedWorkTypes, setSelectedWorkTypes] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  
  // View mode state (grid vs list view)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filtering logic
  const filtered = useMemo(() => {
    return opportunities.filter((opportunity) => {
      const matchesQuery =
        !query ||
        [opportunity.title, opportunity.companyName, opportunity.description]
          .join(' ')
          .toLowerCase()
          .includes(query.toLowerCase());

      const matchesDiscipline =
        selectedDisciplines.length === 0 ||
        selectedDisciplines.some(
          (d) =>
            opportunity.discipline.toLowerCase() === d.toLowerCase() ||
            (d === 'UI/UX' && opportunity.discipline === 'UI/UX')
        );

      const matchesWorkType =
        selectedWorkTypes.length === 0 ||
        selectedWorkTypes.includes(opportunity.workType);

      const matchesLocationType =
        selectedLocations.length === 0 ||
        selectedLocations.includes(opportunity.locationType);

      return matchesQuery && matchesDiscipline && matchesWorkType && matchesLocationType;
    });
  }, [opportunities, query, selectedDisciplines, selectedWorkTypes, selectedLocations]);

  // Recommended AI Match opportunities (e.g. top 3 matches with high matchPercentage)
  const aiRecommended = useMemo(() => {
    return opportunities
      .filter((o) => o.matchPercentage && o.matchPercentage >= 80)
      .sort((a, b) => (b.matchPercentage ?? 0) - (a.matchPercentage ?? 0))
      .slice(0, 3);
  }, [opportunities]);

  // Handlers for toggling checkboxes
  const toggleDiscipline = (val: string) => {
    setSelectedDisciplines((prev) =>
      prev.includes(val) ? prev.filter((item) => item !== val) : [...prev, val]
    );
  };

  const toggleWorkType = (val: string) => {
    setSelectedWorkTypes((prev) =>
      prev.includes(val) ? prev.filter((item) => item !== val) : [...prev, val]
    );
  };

  const toggleLocation = (val: string) => {
    setSelectedLocations((prev) =>
      prev.includes(val) ? prev.filter((item) => item !== val) : [...prev, val]
    );
  };

  const clearAllFilters = () => {
    setSelectedDisciplines([]);
    setSelectedWorkTypes([]);
    setSelectedLocations([]);
    setQuery('');
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF9F7]">
      {/* Top Page Header */}
      <PageHeader title="Opportunities" />

      {/* Main Content Container */}
      <div className="mx-auto max-w-[1200px] w-full px-6 py-8 animate-slide-up">
        {/* Full-width Search Bar */}
        <div className="relative w-full mb-8">
          <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-navy/40" />
          <input
            className="w-full h-14 pl-14 pr-6 rounded-xl bg-white border border-chalk-200 shadow-soft focus:outline-none focus:border-indigo transition-all font-sans text-[15px] text-navy"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
            }}
            placeholder="Search roles, companies, skills..."
          />
        </div>

        {/* Two Columns Grid */}
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          {/* Left Column: Filters Sidebar */}
          <aside className="h-fit rounded-2xl border border-chalk-200 bg-white p-6 shadow-soft">
            <div className="flex items-center gap-2 mb-6 text-navy">
              <SlidersHorizontal className="h-4 w-4" />
              <h2 className="text-[15px] font-bold font-sans">Filters</h2>
            </div>

            {/* Discipline Section */}
            <div className="mb-6 border-b border-chalk-100 pb-5">
              <h3 className="text-[10px] font-bold tracking-wider text-navy/40 uppercase font-mono mb-3">
                Discipline
              </h3>
              <div className="flex flex-col gap-2">
                {disciplinesList.map((d) => (
                  <label
                    key={d}
                    className="flex items-center gap-3 cursor-pointer select-none py-0.5 hover:text-indigo transition-colors group"
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={selectedDisciplines.includes(d)}
                      onChange={() => toggleDiscipline(d)}
                    />
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                        selectedDisciplines.includes(d)
                          ? 'bg-indigo border-indigo text-white'
                          : 'border-chalk-300 bg-white group-hover:border-indigo/55'
                      }`}
                    >
                      {selectedDisciplines.includes(d) && (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <span
                      className={`text-[13px] font-sans transition-colors ${
                        selectedDisciplines.includes(d)
                          ? 'font-medium text-navy'
                          : 'text-navy/70'
                      }`}
                    >
                      {d}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Work Type Section */}
            <div className="mb-6 border-b border-chalk-100 pb-5">
              <h3 className="text-[10px] font-bold tracking-wider text-navy/40 uppercase font-mono mb-3">
                Work type
              </h3>
              <div className="flex flex-col gap-2">
                {workTypesList.map((t) => (
                  <label
                    key={t.value}
                    className="flex items-center gap-3 cursor-pointer select-none py-0.5 hover:text-indigo transition-colors group"
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={selectedWorkTypes.includes(t.value)}
                      onChange={() => toggleWorkType(t.value)}
                    />
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                        selectedWorkTypes.includes(t.value)
                          ? 'bg-indigo border-indigo text-white'
                          : 'border-chalk-300 bg-white group-hover:border-indigo/55'
                      }`}
                    >
                      {selectedWorkTypes.includes(t.value) && (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <span
                      className={`text-[13px] font-sans transition-colors ${
                        selectedWorkTypes.includes(t.value)
                          ? 'font-medium text-navy'
                          : 'text-navy/70'
                      }`}
                    >
                      {t.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Location Section */}
            <div>
              <h3 className="text-[10px] font-bold tracking-wider text-navy/40 uppercase font-mono mb-3">
                Location
              </h3>
              <div className="flex flex-col gap-2">
                {locationTypesList.map((l) => (
                  <label
                    key={l.value}
                    className="flex items-center gap-3 cursor-pointer select-none py-0.5 hover:text-indigo transition-colors group"
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={selectedLocations.includes(l.value)}
                      onChange={() => toggleLocation(l.value)}
                    />
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                        selectedLocations.includes(l.value)
                          ? 'bg-indigo border-indigo text-white'
                          : 'border-chalk-300 bg-white group-hover:border-indigo/55'
                      }`}
                    >
                      {selectedLocations.includes(l.value) && (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <span
                      className={`text-[13px] font-sans transition-colors ${
                        selectedLocations.includes(l.value)
                          ? 'font-medium text-navy'
                          : 'text-navy/70'
                      }`}
                    >
                      {l.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Right Column: AI recommendations, chips, count, grid */}
          <section className="flex flex-col">
            {/* AI Recommended Section */}
            {aiRecommended.length > 0 && (
              <div className="mb-6 bg-[#f7f6ff] border border-[#e1ddff] rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-[11px] font-bold tracking-wider text-indigo uppercase font-mono">
                  <Sparkles className="h-4 w-4" />
                  AI Recommended for you
                </div>
                <div className="grid gap-5 md:grid-cols-3">
                  {aiRecommended.map((opportunity) => (
                    <OpportunityCard key={opportunity.id} opportunity={opportunity} />
                  ))}
                </div>
              </div>
            )}

            {/* Filter Tags & Count Row */}
            <div className="flex flex-col gap-4 mb-6">
              {/* Active Tag Chips */}
              {(selectedDisciplines.length > 0 ||
                selectedWorkTypes.length > 0 ||
                selectedLocations.length > 0 ||
                query) && (
                <div className="flex flex-wrap items-center gap-2">
                  {selectedDisciplines.map((d) => (
                    <button
                      key={d}
                      onClick={() => toggleDiscipline(d)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f0eeff] text-indigo text-[12px] font-semibold hover:bg-[#e1ddff] transition-all"
                    >
                      <span>{d}</span>
                      <X className="h-3.5 w-3.5" />
                    </button>
                  ))}
                  {selectedWorkTypes.map((val) => {
                    const label = workTypesList.find((w) => w.value === val)?.label || val;
                    return (
                      <button
                        key={val}
                        onClick={() => toggleWorkType(val)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f0eeff] text-indigo text-[12px] font-semibold hover:bg-[#e1ddff] transition-all"
                      >
                        <span>{label}</span>
                        <X className="h-3.5 w-3.5" />
                      </button>
                    );
                  })}
                  {selectedLocations.map((val) => {
                    const label = locationTypesList.find((l) => l.value === val)?.label || val;
                    return (
                      <button
                        key={val}
                        onClick={() => toggleLocation(val)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f0eeff] text-indigo text-[12px] font-semibold hover:bg-[#e1ddff] transition-all"
                      >
                        <span>{label}</span>
                        <X className="h-3.5 w-3.5" />
                      </button>
                    );
                  })}
                  {query && (
                    <button
                      onClick={() => setQuery('')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f0eeff] text-indigo text-[12px] font-semibold hover:bg-[#e1ddff] transition-all"
                    >
                      <span>"{query}"</span>
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    onClick={clearAllFilters}
                    className="text-[12px] font-semibold text-navy/55 hover:text-navy ml-2 transition-all"
                  >
                    Clear all
                  </button>
                </div>
              )}

              {/* Opportunities Count and Toggles */}
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-sans font-medium text-navy/60">
                  {filtered.length} opportunities
                </span>
                
                {/* Grid / List view icons container */}
                <div className="flex items-center gap-1 border border-chalk-200 bg-white rounded-lg p-0.5 shadow-sm">
                  <button
                    className={`p-1.5 rounded-md transition-all ${
                      viewMode === 'grid'
                        ? 'bg-navy text-white shadow-sm'
                        : 'text-navy/40 hover:text-navy'
                    }`}
                    onClick={() => setViewMode('grid')}
                    aria-label="Grid view"
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                    </svg>
                  </button>
                  <button
                    className={`p-1.5 rounded-md transition-all ${
                      viewMode === 'list'
                        ? 'bg-navy text-white shadow-sm'
                        : 'text-navy/40 hover:text-navy'
                    }`}
                    onClick={() => setViewMode('list')}
                    aria-label="List view"
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="8" y1="6" x2="21" y2="6" />
                      <line x1="8" y1="12" x2="21" y2="12" />
                      <line x1="8" y1="18" x2="21" y2="18" />
                      <line x1="3" y1="6" x2="3.01" y2="6" />
                      <line x1="3" y1="12" x2="3.01" y2="12" />
                      <line x1="3" y1="18" x2="3.01" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Opportunities Cards Grid */}
            {filtered.length === 0 ? (
              <EmptyState title="No matching opportunities">
                Adjust filters or save roles to see them here.
              </EmptyState>
            ) : (
              <div
                className={`grid gap-6 ${
                  viewMode === 'grid'
                    ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                    : 'grid-cols-1'
                }`}
              >
                {filtered.map((opportunity) => (
                  <OpportunityCard key={opportunity.id} opportunity={opportunity} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
