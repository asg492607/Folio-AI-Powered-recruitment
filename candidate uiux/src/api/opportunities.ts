import { opportunities } from '../mocks/data';
import type { Opportunity } from '../types';
import { mockDelay } from './client';

export async function fetchOpportunities(): Promise<Opportunity[]> {
  return mockDelay(opportunities);
}

export async function fetchOpportunity(id: string): Promise<Opportunity | undefined> {
  return mockDelay(opportunities.find((opportunity) => opportunity.id === id));
}
