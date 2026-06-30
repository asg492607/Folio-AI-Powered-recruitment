import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { PageHeader } from '../../components/PageHeader';
import { useApplicationStore } from '../../store/applicationStore';
import { useCandidateStore } from '../../store/candidateStore';
import { useOpportunityStore } from '../../store/opportunityStore';
import type { Application } from '../../types';
import { ChevronLeft, FileText, Check, CheckCircle2 } from 'lucide-react';

const schema = z.object({
  resumeUrl: z.string().min(2, 'Add a resume link or upload filename'),
  portfolioAttachmentUrl: z.string().min(1, 'Please select a portfolio item to highlight.'),
  answer0: z.string().min(10, 'Give a little more detail').optional(),
  answer1: z.string().min(10, 'Give a little more detail').optional(),
});

type ApplicationValues = z.infer<typeof schema>;

export function ApplicationForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const candidate = useCandidateStore((state) => state.candidate);
  const opportunity = useOpportunityStore((state) =>
    state.opportunities.find((o) => o.id === id)
  );
  const addApplication = useApplicationStore((state) => state.addApplication);
  
  const form = useForm<ApplicationValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      resumeUrl: 'Avni_Sharma_Resume_2025.pdf',
      portfolioAttachmentUrl: candidate.portfolioLinks[0]?.url || '',
    },
  });

  if (!opportunity) {
    return (
      <EmptyState title="Opportunity not found">
        Please go back to the opportunities page.
      </EmptyState>
    );
  }

  const activeOpportunity = opportunity;

  // The specific questions from the screenshot
  const questions = [
    {
      label: "Describe a design decision you made that you'd approach differently today.",
      placeholder: "Be specific — what you decided, why, and what you'd change."
    },
    {
      label: "Are you open to an on-site role if required? (Currently listed as remote.)",
      placeholder: "Yes / No — and any context you'd like to add."
    }
  ];

  function submit(values: ApplicationValues) {
    const application = {
      id: crypto.randomUUID(),
      candidateId: candidate.id,
      opportunityId: activeOpportunity.id,
      jobId: activeOpportunity.id, // For Recruiter App compatibility
      jobTitle: activeOpportunity.title,
      name: candidate.personalInfo?.name || 'Applicant',
      matchScore: activeOpportunity.matchPercentage || 75,
      skills: candidate.skills || [],
      location: candidate.personalInfo?.location || 'Remote',
      source: 'Direct Application',
      email: candidate.email,
      resumeUrl: values.resumeUrl,
      portfolioAttachmentUrl: values.portfolioAttachmentUrl,
      answers: questions.map((q, index) => ({
        question: q.label,
        answer: values[`answer${index}` as keyof ApplicationValues] ?? '',
      })),
      status: 'Applied', // Recruiter expects 'Applied' capitalized
      appliedAt: new Date().toISOString(),
      statusHistory: [{ status: 'Applied', timestamp: new Date().toISOString() }],
    };
    addApplication(application as any);
    toast.success('Application submitted.');
    setIsSubmitted(true);
  }

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen flex-col bg-[#FAF9F7] font-sans text-navy">
        <PageHeader title="Apply" />
        <div className="flex flex-1 flex-col items-center pt-20 px-6 text-center">
          <div className="mb-6 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#ffedd5]">
            <CheckCircle2 className="h-[34px] w-[34px] text-[#ea580c]" strokeWidth={2.5} />
          </div>
          
          <h1 className="mb-4 text-[32px] font-bold text-navy font-serif tracking-tight">
            Application submitted.
          </h1>
          <p className="mb-12 text-[17px] text-navy/60 font-medium">
            {activeOpportunity.companyName} has received your application for {activeOpportunity.title}.
          </p>

          <div className="w-full max-w-[560px] rounded-xl bg-white p-8 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] text-left border border-chalk-200">
            <h3 className="mb-6 text-[16px] font-bold text-navy">What happens next</h3>
            
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6366f1]" />
                <div>
                  <p className="text-[15.5px] font-medium text-navy/90">Recruiter reviews your portfolio</p>
                  <p className="text-[14px] text-navy/50 font-medium mt-0.5">3–5 business days</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6366f1]" />
                <div>
                  <p className="text-[15.5px] font-medium text-navy/90">You'll receive an update via notification</p>
                  <p className="text-[14px] text-navy/50 font-medium mt-0.5">After review</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6366f1]" />
                <div>
                  <p className="text-[15.5px] font-medium text-navy/90">If shortlisted, design challenge is sent</p>
                  <p className="text-[14px] text-navy/50 font-medium mt-0.5">Within 1 week</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="mt-12 flex flex-col items-center justify-center gap-4">
            <div className="flex gap-6 mt-4">
              <button onClick={() => navigate('/applications')} className="text-[15px] font-medium text-navy/70 hover:text-indigo transition-colors">
                Track application
              </button>
              <button onClick={() => navigate('/opportunities')} className="text-[15px] font-medium text-navy/70 hover:text-indigo transition-colors">
                Find more roles
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF9F7] font-sans text-navy">
      <PageHeader title="Apply" />

      <div className="flex-1 py-10 pb-20">
        <div className="mx-auto w-full max-w-[800px] px-6">
          
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="group mb-8 flex items-center text-[14px] font-medium text-navy/60 transition-colors hover:text-navy"
          >
            <ChevronLeft className="mr-1 h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Back to role
          </button>

          <h1 className="mb-10 text-[24px] font-medium tracking-tight text-navy">
            Apply — {activeOpportunity.title} at {activeOpportunity.companyName}
          </h1>

          <form className="space-y-6" onSubmit={form.handleSubmit(submit)}>
            {/* Resume Card */}
            <div className="rounded-2xl border border-chalk-200 bg-white p-6 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]">
              <h2 className="mb-5 text-[18px] font-bold text-navy">Resume</h2>
              
              <div className="flex items-center justify-between rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] p-5">
                 <div className="flex items-center gap-4">
                   <FileText className="h-5 w-5 text-[#059669]" strokeWidth={2} />
                   <div>
                     <p className="text-[14.5px] font-bold text-navy">Avni_Sharma_Resume_2025.pdf</p>
                     <p className="text-[13px] text-navy/60 font-medium mt-0.5">From your profile · Updated 2 weeks ago</p>
                   </div>
                 </div>
                 <button type="button" className="text-[14.5px] font-bold text-navy hover:text-indigo">
                   Replace
                 </button>
              </div>
            </div>

            {/* Portfolio Card */}
            <div className="rounded-2xl border border-chalk-200 bg-white p-6 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]">
              <h2 className="mb-1.5 text-[18px] font-bold text-navy">Portfolio</h2>
              <p className="mb-5 text-[14px] text-navy/60 font-medium">Select specific work to highlight.</p>

              <div className="space-y-3">
                {candidate.portfolioLinks.length === 0 ? (
                  <p className="text-[14px] text-navy/50">No portfolio links added yet.</p>
                ) : (
                  candidate.portfolioLinks.map((item, idx) => {
                    const isSelected = form.watch('portfolioAttachmentUrl') === item.url;
                    return (
                      <label key={idx} className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all ${isSelected ? 'border-indigo bg-[#fbfaff]' : 'border-chalk-200 bg-white hover:border-chalk-300'}`}>
                        <div className="flex items-center gap-3.5">
                          <div className={`flex h-5 w-5 items-center justify-center rounded-[6px] border ${isSelected ? 'border-indigo bg-indigo text-white' : 'border-chalk-300 bg-white'}`}>
                            {isSelected && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                          </div>
                          <span className="text-[15px] font-medium text-navy">
                            {item.url}
                          </span>
                        </div>
                        <input type="radio" value={item.url} {...form.register('portfolioAttachmentUrl')} className="hidden" />
                        <span className="rounded-full bg-[#f3f0ff] px-3.5 py-1 text-[12px] font-bold tracking-wide text-indigo capitalize">
                          {item.type.replace('_', ' ')}
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
            </div>

            {/* Additional Questions Card */}
            <div className="rounded-2xl border border-chalk-200 bg-white p-6 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]">
              <h2 className="mb-6 text-[18px] font-bold text-navy">Additional questions</h2>
              
              <div className="space-y-8">
                {questions.map((q, index) => (
                  <div key={index}>
                    <label className="mb-3 block text-[15px] font-bold text-navy">
                      {q.label}
                    </label>
                    <textarea
                      className="w-full rounded-xl border border-chalk-200 p-4 text-[15px] text-navy placeholder:text-navy/40 focus:border-indigo focus:outline-none focus:ring-1 focus:ring-indigo min-h-[110px] resize-y"
                      placeholder={q.placeholder}
                      {...form.register(`answer${index}` as 'answer0' | 'answer1')}
                    />
                    <p className="mt-2 text-xs text-orange-600">
                      {form.formState.errors[`answer${index}` as 'answer0' | 'answer1']?.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12 mb-6 h-px w-full bg-chalk-200" />
            
            <div className="flex items-center justify-between pb-8">
              <p className="text-[15px] text-navy/60">
                Review your application before submitting.
              </p>
              <Button type="submit" className="rounded-xl bg-[#6366f1] px-8 py-3.5 text-[15.5px] font-medium text-white hover:bg-[#4f46e5]">
                Submit application
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

