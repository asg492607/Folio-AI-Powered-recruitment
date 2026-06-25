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
      companyName: item.company || item.companyName || 'Unknown Company',
      companyOverview: item.description?.substring(0, 200) || '',
      location: item.location || 'Remote',
      locationType: (item.remote_status || 'remote') as any,
      workType: item.category === 'internship' ? 'internship' : item.category === 'freelance' ? 'freelance' : 'full_time',
      discipline: item.domain?.replace('_', '/').replace('ux/ui', 'UI/UX') || 'UI/UX',
      matchPercentage: item.matchPercentage || 0,
      logo: `https://logo.clearbit.com/${(item.company || '').replace(/\s+/g, '').toLowerCase()}.com`,
      postedAt: item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recently',
      tags: (item.skills || []).map((s: any) => s.name || s).filter(Boolean),
      description: item.description || 'No description provided.',
      requiredSkills: (item.skills || []).map((s: any) => s.name || s).filter(Boolean),
      compensation: item.salary || 'Not specified',
      applyUrl: item.apply_url || item.applyUrl || '',
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
