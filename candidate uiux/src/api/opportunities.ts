import { scraperApi } from './backend';
import type { Opportunity } from '../types';

export async function fetchOpportunities(): Promise<Opportunity[]> {
  try {
    const res = await scraperApi.getOpportunities();
    // Assuming res.data is an array of opportunities
    return res.data.map((item: any) => ({
      id: item.id || Math.random().toString(),
      role: item.title || 'Unknown Role',
      company: item.company || 'Unknown Company',
      location: item.location || 'Remote',
      type: 'Full-time', // Fallback since scraper doesn't strictly provide type
      matchPercentage: Math.floor(Math.random() * 20) + 70, // Pseudo match score until matchmaking pod is linked
      logo: `https://logo.clearbit.com/${(item.company || '').replace(/\s+/g, '').toLowerCase()}.com`,
      postedAt: item.posted_date || 'Just now',
      tags: [...(item.technologies || []), item.domain].filter(Boolean),
      description: item.description || 'No description provided.',
      requirements: item.technologies || [],
      salary: item.salary_range || 'Not specified',
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
