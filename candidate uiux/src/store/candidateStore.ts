import { create } from 'zustand';
import { candidate as mockCandidate } from '../mocks/data';
import type { Candidate } from '../types';
import { calculateProfileCompletion } from '../utils/profile';
import { trackEvent } from '../utils/analytics';

interface CandidateState {
  candidate: Candidate;
  updateCandidate: (patch: Partial<Candidate>) => void;
}

export const useCandidateStore = create<CandidateState>((set) => ({
  candidate: mockCandidate,
  updateCandidate: (patch) =>
    set((state) => {
      const next = { ...state.candidate, ...patch };
      next.profileCompletionPercent = calculateProfileCompletion(next);
      trackEvent('profile_completion_updated', { percent: next.profileCompletionPercent });
      return { candidate: next };
    }),
}));
