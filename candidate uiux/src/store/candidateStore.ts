import { create } from 'zustand';
import type { Candidate } from '../types';
import { calculateProfileCompletion } from '../utils/profile';
import { trackEvent } from '../utils/analytics';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const defaultCandidate: Candidate = {
  id: 'guest',
  email: '',
  authProvider: 'email',
  role: 'design_student',
  personalInfo: {
    name: 'Candidate',
    phone: '',
    location: '',
    avatarUrl: ''
  },
  education: [],
  designDiscipline: [],
  skills: [],
  careerGoals: '',
  experienceLevel: 'student',
  aboutMe: '',
  experience: [],
  certifications: [],
  projects: [],
  portfolioLinks: [],
  achievements: [],
  profileCompletionPercent: 0
};

interface CandidateState {
  candidate: Candidate;
  updateCandidate: (patch: Partial<Candidate>) => void;
  initializeAuth: () => void;
}

export const useCandidateStore = create<CandidateState>((set) => ({
  candidate: defaultCandidate,
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
             next.personalInfo = { ...next.personalInfo, name: user.email?.split('@')[0] || 'User' };
          }
          if (user.photoURL) {
             next.personalInfo = { ...next.personalInfo, avatarUrl: user.photoURL };
          }
          return { candidate: next };
        });

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
        set({ candidate: defaultCandidate });
      }
    });
  }
}));
