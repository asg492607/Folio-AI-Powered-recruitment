import { mockDelay } from './client';
import { candidate } from '../mocks/data';
import type { Candidate, CandidateRole } from '../types';

export async function loginWithEmail(email: string): Promise<{ token: string; candidate: Candidate }> {
  return mockDelay({ token: 'mock-token', candidate: { ...candidate, email } });
}

export async function signupWithEmail(email: string, role: CandidateRole): Promise<{ token: string; candidate: Candidate }> {
  return mockDelay({ token: 'mock-token', candidate: { ...candidate, email, role } });
}

export async function loginWithGoogle(): Promise<{ token: string; candidate: Candidate }> {
  return mockDelay({ token: 'mock-google-token', candidate: { ...candidate, authProvider: 'google' } });
}
