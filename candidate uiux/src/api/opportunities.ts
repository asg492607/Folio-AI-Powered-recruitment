import { scraperApi } from './backend';
import type { Opportunity } from '../types';

export async function fetchOpportunities(): Promise<Opportunity[]> {
  try {
    const res = await scraperApi.getOpportunities();
    // Assuming res.data is an array of opportunities
    return res.data.map((item: any) => ({
      id: item.id || Math.random().toString(),
      title: item.title || 'Unknown Role',
      companyName: item.company || 'Unknown Company',
      companyOverview: item.company_description || '',
      location: item.location || 'Remote',
      locationType: 'remote',
      workType: 'full_time',
      discipline: 'UI/UX', // Hardcoded UI/UX for design platform, or item.domain
      matchPercentage: Math.floor(Math.random() * 20) + 70,
      logo: `https://logo.clearbit.com/${(item.company || '').replace(/\s+/g, '').toLowerCase()}.com`,
      postedAt: item.posted_date || 'Just now',
      tags: [...(item.technologies || []), item.domain].filter(Boolean),
      description: item.description || 'No description provided.',
      requiredSkills: item.technologies || [],
      compensation: item.salary_range || 'Not specified',
      applyUrl: item.url || item.apply_url || '',
      teamInfo: '',
      hiringProcess: [],
      questions: []
    }));
  } catch (err) {
    console.error("Failed to fetch opportunities from live API:", err);
    return [];
  }
}

export async function fetchOpportunity(id: string): Promise<Opportunity | undefined> {
  const all = await fetchOpportunities();
  return all.find(o => o.id === id);
}
