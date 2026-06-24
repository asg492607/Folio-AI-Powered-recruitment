import { create } from 'zustand';
import { candidate as mockCandidate } from '../mocks/data';
import type { Candidate } from '../types';
import { calculateProfileCompletion } from '../utils/profile';
import { trackEvent } from '../utils/analytics';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface CandidateState {
  candidate: Candidate;
  updateCandidate: (patch: Partial<Candidate>) => void;
  initializeAuth: () => void;
}

export const useCandidateStore = create<CandidateState>((set) => ({
  candidate: { ...mockCandidate, personalInfo: { ...mockCandidate.personalInfo, name: 'Loading...' } }, // Default to loading state
  updateCandidate: (patch) =>
    set((state) => {
      const next = { ...state.candidate, ...patch };
      next.profileCompletionPercent = calculateProfileCompletion(next);
      trackEvent('profile_completion_updated', { percent: next.profileCompletionPercent });
      return { candidate: next };
    }),
  initializeAuth: () => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        set((state) => {
          const next = { ...state.candidate, email: user.email || state.candidate.email };
          if (user.displayName) {
             next.personalInfo = { ...next.personalInfo, name: user.displayName };
          } else {
             // Fallback to email prefix
             next.personalInfo = { ...next.personalInfo, name: user.email?.split('@')[0] || 'User' };
          }
          if (user.photoURL) {
             next.personalInfo = { ...next.personalInfo, avatarUrl: user.photoURL };
          }
          return { candidate: next };
        });

        // Optionally fetch from firestore if we are saving candidate data there
        try {
          const docRef = doc(db, 'candidates', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
             set((state) => ({ candidate: { ...state.candidate, ...docSnap.data() } }));
          }
        } catch (e) {
          console.error("Firestore candidate fetch error:", e);
        }
      } else {
        // Logged out
        set({ candidate: mockCandidate });
      }
    });
  }
}));
