import { Bookmark, Check, ChevronLeft, Clock, DollarSign, MapPin, Sparkles, Building2 } from 'lucide-react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/Button';
import { PageHeader } from '../../components/PageHeader';
import { useCandidateStore } from '../../store/candidateStore';
import { useOpportunityStore } from '../../store/opportunityStore';

export function OpportunityDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const candidate = useCandidateStore((state) => state.candidate);
  const opportunities = useOpportunityStore((state) => state.opportunities);
  const savedIds = useOpportunityStore((state) => state.savedIds);
  const toggleSaved = useOpportunityStore((state) => state.toggleSaved);

  const opportunity = opportunities.find((item) => item.id === id);
  if (!opportunity) return <Navigate to="/opportunities" replace />;

  const saved = savedIds.includes(opportunity.id);
  const matched = opportunity.requiredSkills.filter((skill) => candidate.skills.includes(skill));
  const missing = opportunity.requiredSkills.filter((skill) => !candidate.skills.includes(skill));

  const initial = opportunity.companyName.charAt(0) || 'C';

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF9F7] font-sans text-navy">
      <PageHeader title="Opportunities" />

      <div className="flex-1 border-t border-chalk-200">
        <div className="mx-auto flex w-full max-w-[1400px]">
          
          {/* Left Column (Main Content) */}
          <div className="flex-1 px-8 py-10 lg:px-12 lg:py-12 lg:pr-16">
            <button
              onClick={() => navigate('/opportunities')}
              className="group mb-8 flex items-center text-[15px] font-medium text-navy/60 transition-colors hover:text-navy"
            >
              <ChevronLeft className="mr-1 h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              Back to opportunities
            </button>

            <div className="mb-10">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-navy text-2xl font-bold uppercase text-white shadow-sm">
                {initial}
              </div>
              <h2 className="mb-1 text-[17px] font-medium text-navy/60">
                {opportunity.companyName}
              </h2>
              <h1 className="mb-5 text-[32px] font-bold tracking-tight text-navy">
                {opportunity.title}
              </h1>
              <div className="flex flex-wrap gap-2.5">
                <span className="rounded-full bg-white px-4 py-1.5 text-[13px] font-medium text-navy border border-chalk-200">
                  {opportunity.workType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
                <span className="rounded-full bg-white px-4 py-1.5 text-[13px] font-medium text-navy border border-chalk-200">
                  {opportunity.location || opportunity.locationType}
                </span>
                <span className="rounded-full bg-white px-4 py-1.5 text-[13px] font-medium text-navy border border-chalk-200">
                  {opportunity.compensation}
                </span>
              </div>
            </div>

            <section className="mb-10">
              <h3 className="mb-4 text-[22px] font-semibold text-navy">
                About {opportunity.companyName}
              </h3>
              <p className="mb-6 text-[16px] leading-relaxed text-navy/70">
                {opportunity.companyDescription || opportunity.companyOverview}
              </p>
              {opportunity.companyTags && opportunity.companyTags.length > 0 && (
                <div className="flex flex-wrap gap-2.5">
                  {opportunity.companyTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-white px-4 py-1.5 text-[13px] font-medium text-navy border border-chalk-200 shadow-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </section>

            <div className="my-10 h-px w-full bg-chalk-200/80" />

            <section className="mb-10">
              <h3 className="mb-4 text-[22px] font-semibold text-navy">Role description</h3>
              <p className="mb-6 text-[16px] leading-relaxed text-navy/70">
                {opportunity.roleDescription || opportunity.description}
              </p>

              {opportunity.keyResponsibilities && opportunity.keyResponsibilities.length > 0 && (
                <div>
                  <h4 className="mb-4 text-[16px] font-medium text-navy">Key responsibilities:</h4>
                  <div className="space-y-3 pl-0 text-[15px] leading-relaxed text-navy/60">
                    {opportunity.keyResponsibilities.map((resp, i) => (
                      <p key={i}>{resp}</p>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <div className="my-10 h-px w-full bg-chalk-200/80" />

            <section className="mb-10">
              <h3 className="mb-6 text-[22px] font-semibold text-navy">Required skills</h3>
              <div className="mb-4 flex flex-wrap gap-3">
                {matched.map((skill) => (
                  <span
                    key={skill}
                    className="flex items-center gap-1.5 rounded-full border border-[#bbf7d0] bg-[#ecfdf5] px-4 py-1.5 text-[13.5px] font-medium text-[#059669]"
                  >
                    <Check className="h-4 w-4" />
                    {skill}
                  </span>
                ))}
                {missing.map((skill) => (
                  <span
                    key={skill}
                    className="flex items-center gap-1.5 rounded-full border border-chalk-200 bg-white px-4 py-1.5 text-[13.5px] font-medium text-navy/90"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              <p className="text-[14px] text-navy/60">
                You match <span className="font-bold text-[#059669]">{matched.length}</span> of {opportunity.requiredSkills.length} required skills.
              </p>
            </section>

            <section className="mb-10">
              <h3 className="mb-6 text-[22px] font-semibold text-navy">Hiring process</h3>
              <div className="space-y-6">
                {(opportunity.hiringSteps || opportunity.hiringProcess.map((p, i) => ({ step: i + 1, title: p, duration: 'TBD' }))).map((step, idx) => (
                  <div key={idx} className="flex gap-5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f0eeff] text-[13px] font-bold text-indigo">
                      {step.step}
                    </div>
                    <div className="pt-1">
                      <h4 className="text-[16px] font-medium text-navy">{step.title}</h4>
                      <p className="mt-1 text-[14px] text-navy/50">{step.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column (Sidebar) */}
          <aside className="w-[380px] border-l border-chalk-200 shrink-0">
            <div className="sticky top-24 px-8 py-10 lg:px-10 lg:py-12">
              {opportunity.matchPercentage && (
                <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-[#c7d2fe] bg-[#eef2ff] px-3.5 py-1.5 text-[12px] font-bold tracking-wider text-indigo font-mono">
                  <Sparkles className="h-4 w-4" />
                  {opportunity.matchPercentage}% MATCH
                </div>
              )}

              <div className="mb-6 space-y-3.5">
                <Link to={`/opportunities/${opportunity.id}/apply`} className="block">
                  <Button className="w-full justify-center rounded-xl bg-[#6366f1] py-6 text-[16px] font-medium text-white hover:bg-[#4f46e5]">
                    Apply to this role
                  </Button>
                </Link>
                <Button
                  variant="secondary"
                  className="w-full justify-center rounded-xl border-chalk-200 bg-white py-6 text-[16px] font-medium text-navy hover:bg-chalk-50 shadow-sm"
                  onClick={() => toggleSaved(opportunity.id)}
                >
                  <Bookmark
                    className="mr-2 h-5 w-5"
                    fill={saved ? 'currentColor' : 'none'}
                  />
                  {saved ? 'Saved role' : 'Save role'}
                </Button>
              </div>

              <div className="rounded-2xl border border-chalk-200/80 bg-transparent p-6 shadow-sm">
                <div className="space-y-4">
                  {opportunity.sidebarDetails ? (
                    opportunity.sidebarDetails.map((detail, idx) => {
                      const IconComp =
                        detail.icon === 'dollar' ? DollarSign :
                        detail.icon === 'map-pin' ? MapPin :
                        detail.icon === 'clock' ? Clock : Building2;
                      return (
                        <div key={idx} className="flex items-center gap-4 text-navy/70">
                          <IconComp className="h-5 w-5" strokeWidth={1.5} />
                          <span className="text-[15px] text-navy/80">{detail.label}</span>
                        </div>
                      );
                    })
                  ) : (
                    <>
                      <div className="flex items-center gap-4 text-navy/70">
                        <DollarSign className="h-5 w-5" strokeWidth={1.5} />
                        <span className="text-[15px] text-navy/80">{opportunity.compensation}</span>
                      </div>
                      <div className="flex items-center gap-4 text-navy/70">
                        <MapPin className="h-5 w-5" strokeWidth={1.5} />
                        <span className="text-[15px] text-navy/80">{opportunity.locationType}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

