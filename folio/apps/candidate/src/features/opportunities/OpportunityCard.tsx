import { Bookmark, Sparkles, CheckCircle2, Star, ChevronRight, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useOpportunityStore } from '../../store/opportunityStore';
import { useApplicationStore } from '../../store/applicationStore';
import type { Opportunity } from '../../types';
import { trackEvent } from '../../utils/analytics';
import React, { useState } from 'react';

export function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  const savedIds = useOpportunityStore((state) => state.savedIds);
  const toggleSaved = useOpportunityStore((state) => state.toggleSaved);
  const saved = savedIds.includes(opportunity.id);

  const applications = useApplicationStore((state) => state.applications);
  const applied = applications.some((app) => app.opportunityId === opportunity.id);

  const initial = opportunity.companyName.charAt(0) || 'C';
  
  // Local state for interactive rating (mock for now)
  const [hasRated, setHasRated] = useState(false);

  const handleRate = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!hasRated) {
      setHasRated(true);
      trackEvent('opportunity_rated', { opportunityId: opportunity.id });
    }
  };

  return (
    <article className="group relative flex flex-col rounded-3xl border border-chalk-200 bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-card w-full">
      <div className="p-6">
        {/* Header: Logo and Bookmark */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1A1A2E] text-white text-2xl font-bold uppercase shadow-sm">
            {initial}
          </div>
          
          {applied ? (
            <span className="flex items-center gap-1.5 rounded-full bg-[#ecfdf5] px-2.5 py-1 text-[11px] font-bold tracking-wider text-[#059669] uppercase border border-[#a7f3d0]">
              <CheckCircle2 className="h-3 w-3" strokeWidth={3} />
              Applied
            </span>
          ) : (
            <button
              className={`p-2 rounded-full transition-colors ${
                saved
                  ? 'text-indigo hover:text-indigo-600 bg-indigo-50'
                  : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50'
              }`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleSaved(opportunity.id);
              }}
              aria-label="Save opportunity"
            >
              <Bookmark className="h-5 w-5" fill={saved ? 'currentColor' : 'none'} strokeWidth={1.5} />
            </button>
          )}
        </div>

        <Link
          to={`/opportunities/${opportunity.id}`}
          onClick={() => trackEvent('opportunity_clicked', { opportunityId: opportunity.id })}
          className="flex flex-col focus:outline-none"
        >
          {/* Company & Role */}
          <span className="text-[#8c8c8c] text-[15px] font-medium mb-1.5 font-sans">
            {opportunity.companyName}
          </span>
          <h2 className="text-[#1A1A2E] text-[22px] font-bold font-sans line-clamp-1 mb-5 group-hover:text-indigo transition-colors tracking-tight">
            {opportunity.title}
          </h2>

          {/* Pills */}
          <div className="flex flex-wrap gap-2.5 mb-6">
            <span className="px-4 py-1.5 rounded-full border border-[#e8e8e8] bg-white text-[#666] text-[13px] font-medium font-sans hover:border-chalk-300 transition-colors">
              {opportunity.workType === 'full_time'
                ? 'Full-time'
                : opportunity.workType === 'internship'
                ? 'Internship'
                : 'Freelance'}
            </span>
            <span className="px-4 py-1.5 rounded-full border border-[#e8e8e8] bg-white text-[#666] text-[13px] font-medium font-sans hover:border-chalk-300 transition-colors">
              {opportunity.location || opportunity.locationType}
            </span>
          </div>

          <div className="w-full h-px bg-[#f0f0f0] my-5" />

          {/* Ratings & Reviews */}
          <div className="flex items-center justify-between mb-6">
            <button 
              className={`flex items-center gap-2 group/rating ${hasRated ? 'scale-105' : ''} transition-all duration-300`}
              onClick={handleRate}
            >
              <Star 
                className={`h-5 w-5 ${hasRated ? 'text-yellow-400 fill-yellow-400' : 'text-[#1A1A2E] group-hover/rating:text-yellow-400'} transition-colors`} 
                strokeWidth={2.5} 
                fill={hasRated ? 'currentColor' : '#1A1A2E'} 
              />
              <span className="font-bold text-[#1A1A2E] text-[16px]">{hasRated ? (opportunity.rating ? (opportunity.rating + 0.1).toFixed(1) : '4.7') : (opportunity.rating || '4.6')}</span>
              <span className="text-[#8c8c8c] text-[13px]">({opportunity.reviewCount || '1.8k'} Reviews)</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <img src="https://i.pravatar.cc/100?img=1" className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm" alt="Employee" />
                <img src="https://i.pravatar.cc/100?img=11" className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm" alt="Employee" />
                <img src="https://i.pravatar.cc/100?img=33" className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm" alt="Employee" />
                <div className="w-8 h-8 rounded-full border-2 border-white bg-[#e0ddff] text-[#6366f1] text-[10px] font-bold flex items-center justify-center shadow-sm z-10">
                  +{opportunity.employeesRecommend || '1.2k'}
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[#8c8c8c] text-[11px] leading-tight">employees</span>
                <span className="text-[#8c8c8c] text-[11px] leading-tight">recommend</span>
              </div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="bg-[#f7f6f2] rounded-2xl p-5 flex items-start gap-4">
            <div className="h-8 w-8 rounded-full bg-[#1A1A2E] text-white flex items-center justify-center shrink-0 mt-1 shadow-sm">
              <Quote className="h-4 w-4 fill-white" />
            </div>
            <div className="flex flex-col">
              <p className="text-[#1A1A2E] font-bold text-[14px] leading-snug mb-1.5">
                "{opportunity.testimonial || 'Amazing culture & work-life balance.'}"
              </p>
              <p className="text-[#8c8c8c] text-[12px]">
                – {opportunity.testimonialAuthor || 'Product Designer, 2 yrs at Razorpay'}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-[#8c8c8c] ml-auto shrink-0 mt-3" />
          </div>
        </Link>
      </div>

      {/* Match Percentage Footer */}
      {opportunity.matchPercentage !== undefined && opportunity.matchPercentage > 0 && (
        <Link 
          to={`/opportunities/${opportunity.id}`}
          className="w-full bg-[#eef0ff] hover:bg-[#e0e4ff] transition-colors p-4 flex items-center justify-between group/match"
        >
          <div className="flex items-center gap-2 text-[#5a5ef0]">
            <Sparkles className="h-5 w-5" />
            <span className="text-[14px] font-bold tracking-widest font-mono uppercase">
              {opportunity.matchPercentage}% MATCH
            </span>
          </div>
          <ChevronRight className="h-5 w-5 text-[#5a5ef0] group-hover/match:translate-x-1 transition-transform" />
        </Link>
      )}
    </article>
  );
}
