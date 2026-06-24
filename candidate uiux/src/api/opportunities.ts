import { scraperApi, portfolioApi } from './backend';
import type { Opportunity } from '../types';

export async function fetchOpportunities(skills?: string[]): Promise<Opportunity[]> {
  try {
    let resData: any[] = [];
    
    if (skills && skills.length > 0) {
      // Use AI Matchmaking Engine
      const matchRes = await portfolioApi.matchJobs("Candidate portfolio skills", skills, 25);
      resData = matchRes.data.results.map((r: any) => {
        const item = r.metadata || {};
        return {
          ...item,
          id: r.job_id,
          title: r.title,
          company: r.company,
          matchPercentage: Math.round(r.final_score * 100),
        };
      });
    } else {
      // Fallback to basic scraper fetching
      const res = await scraperApi.getOpportunities();
      resData = res.data;
    }
    
    return resData.map((item: any) => ({
      id: item.id || Math.random().toString(),
      title: item.title || 'Unknown Role',
      companyName: item.company || 'Unknown Company',
      companyOverview: item.company_description || '',
      location: item.location || 'Remote',
      locationType: 'remote',
      workType: 'full_time',
      discipline: 'UI/UX', 
      matchPercentage: item.matchPercentage || 0, // 0 if not matched by AI
      logo: `https://logo.clearbit.com/${(item.company || '').replace(/\s+/g, '').toLowerCase()}.com`,
      postedAt: item.posted_date || 'Just now',
      tags: [...(item.technologies || []), item.domain].filter(Boolean),
      description: item.description || 'No description provided.',
      requiredSkills: item.technologies || [],
      compensation: item.salary_range || 'Not specified',
      applyUrl: item.url || item.apply_url || item.applyUrl || '',
      teamInfo: '',
      hiringProcess: [],
      questions: []
    }));
  } catch (err) {
    console.error("Failed to fetch opportunities from live API:", err);
    return [];
  }
}

export async function fetchOpportunity(id: string, skills?: string[]): Promise<Opportunity | undefined> {
  const all = await fetchOpportunities(skills);
  return all.find(o => o.id === id);
}
