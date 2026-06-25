import { scraperApi, portfolioApi } from './backend';
import type { Opportunity } from '../types';

export async function fetchOpportunities(skills?: string[]): Promise<Opportunity[]> {
  try {
    let resData: any[] = [];
    
    // Bypass our backend entirely and use the job-scratcher link directly as requested
    const axios = (await import('axios')).default;
    const res = await axios.get('https://job-scratcher.onrender.com/api/v1/opportunities');
    resData = res.data;
    
    return resData.map((item: any) => {
      // Calculate a match score if skills are provided
      let calculatedMatch = 0;
      if (skills && skills.length > 0) {
        const textToSearch = ((item.description || '') + ' ' + (item.title || '') + ' ' + (item.skills || '')).toLowerCase();
        let matches = 0;
        skills.forEach(skill => {
          if (textToSearch.includes(skill.toLowerCase())) {
            matches++;
          }
        });
        // Base score of 40, plus up to 58 based on skill overlap
        const ratio = matches / skills.length;
        calculatedMatch = Math.round(40 + (ratio * 58));
      } else {
        calculatedMatch = item.matchPercentage || 0;
      }

      return {
        id: item.id || Math.random().toString(),
        title: item.title || 'Unknown Role',
        companyName: item.company || item.companyName || 'Unknown Company',
        companyOverview: item.description?.substring(0, 200) || '',
        location: item.location || 'Remote',
        locationType: (item.remote_status || 'remote') as any,
        workType: item.category === 'internship' ? 'internship' : item.category === 'freelance' ? 'freelance' : 'full_time',
        discipline: item.domain?.replace('_', '/').replace('ux/ui', 'UI/UX') || 'UI/UX',
        matchPercentage: calculatedMatch,
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
    };
    });
  } catch (err) {
    console.error("Failed to fetch opportunities from live API:", err);
    return [];
  }
}

export async function fetchOpportunity(id: string, skills?: string[]): Promise<Opportunity | undefined> {
  const all = await fetchOpportunities(skills);
  return all.find(o => o.id === id);
}
