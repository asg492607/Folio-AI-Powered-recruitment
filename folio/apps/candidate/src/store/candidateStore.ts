import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Candidate } from '../types';
import { calculateProfileCompletion } from '../utils/profile';
import { trackEvent } from '../utils/analytics';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const defaultCandidate: Candidate = {
  id: 'guest',
  email: '',
  authProvider: 'email',
  role: 'design_student',
  personalInfo: {
    name: '',
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
  userId: string | null;
  updateCandidate: (patch: Partial<Candidate>) => void;
  applyPortfolioReport: (reportData: any) => void;
  initializeAuth: () => void;
}

// Save candidate data to Firestore (debounced via async, not blocking UI)
async function persistToFirestore(userId: string, data: Partial<Candidate>) {
  try {
    const docRef = doc(db, 'candidates', userId);
    // Use setDoc with merge so it creates if not exists or merges if exists
    await setDoc(docRef, data, { merge: true });
  } catch (e) {
    console.error('[CandidateStore] Firestore persist error:', e);
  }
}

export const useCandidateStore = create<CandidateState>()(
  persist(
    (set, get) => ({
      candidate: defaultCandidate,
      userId: null,

      updateCandidate: (patch) =>
        set((state) => {
          const next = { ...state.candidate, ...patch };
          next.profileCompletionPercent = calculateProfileCompletion(next);
          trackEvent('profile_completion_updated', { percent: next.profileCompletionPercent });

          // Persist to Firestore if logged in
          if (state.userId) {
            persistToFirestore(state.userId, { ...patch, profileCompletionPercent: next.profileCompletionPercent });
          }

          return { candidate: next };
        }),

  // Maps AI portfolio report fields into the candidate profile and saves to Firestore
  applyPortfolioReport: (reportData: any) => {
    if (!reportData) return;

    const state = get();
    const existing = state.candidate;

    // Extract skills from report
    const designTools: string[] = reportData.skills?.design_tools || [];
    const processes: string[] = reportData.skills?.methodologies_and_processes || [];
    const softSkills: string[] = reportData.skills?.soft_skills || [];
    const combinedSkills = Array.from(new Set([...designTools, ...processes, ...softSkills]));

    // Map AI-extracted projects to our project schema
    const extractedProjects = (reportData.projects || []).map((proj: any) => ({
      title: proj.name || 'Untitled Project',
      description: `${proj.details || ''}${proj.outcomes ? '\n\nOutcome: ' + proj.outcomes : ''}`.trim(),
      links: proj.images || [],
    }));

    const patch: Partial<Candidate> = {};

    // Auto-fill name if not set or if it's the default "Candidate"
    if (reportData.full_name && (!existing.personalInfo?.name || existing.personalInfo.name === 'Candidate')) {
      patch.personalInfo = { ...(existing.personalInfo || {}), name: reportData.full_name };
    }

    // Save the report itself so it doesn't disappear on navigation
    patch.lastPortfolioReport = reportData;

    // Auto-fill bio/aboutMe if not set
    if (reportData.summary && !existing.aboutMe) {
      patch.aboutMe = reportData.summary;
    }

    // Auto-fill design disciplines
    if (reportData.target_roles && reportData.target_roles.length > 0) {
      patch.designDiscipline = reportData.target_roles;
    }

    // Merge skills (de-dupe with any manual skills the user has)
    if (combinedSkills.length > 0) {
      const mergedSkills = Array.from(new Set([...existing.skills, ...combinedSkills]));
      patch.skills = mergedSkills;
    }

    // Merge projects
    if (extractedProjects.length > 0) {
      patch.projects = extractedProjects;
    }

    // Experience level from years_experience
    if (reportData.years_experience != null) {
      const yrs = reportData.years_experience;
      if (yrs === 0) patch.experienceLevel = 'student';
      else if (yrs <= 1) patch.experienceLevel = 'entry';
      else if (yrs <= 3) patch.experienceLevel = '1-3yrs';
      else patch.experienceLevel = '3+yrs';
    }

    // Apply patch
    const next = { ...existing, ...patch };
    next.profileCompletionPercent = calculateProfileCompletion(next);

    set({ candidate: next });
    trackEvent('profile_autofilled_from_portfolio', {
      skills: combinedSkills.length,
      projects: extractedProjects.length,
    });

    // Persist to Firestore
    if (state.userId) {
      persistToFirestore(state.userId, { ...patch, profileCompletionPercent: next.profileCompletionPercent });
    }
  },

  initializeAuth: () => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        set({ userId: user.uid });

        // Seed basic info from Firebase Auth
        set((state) => {
          const next = { ...state.candidate, id: user.uid, email: user.email || state.candidate.email };
          if (user.displayName) {
            next.personalInfo = { ...next.personalInfo, name: user.displayName };
          } else if (!next.personalInfo.name) {
            next.personalInfo = { ...next.personalInfo, name: user.email?.split('@')[0] || '' };
          }
          if (user.photoURL) {
            next.personalInfo = { ...next.personalInfo, avatarUrl: user.photoURL };
          }
          return { candidate: next };
        });

        // Load saved profile from Firestore (overrides defaults with real data)
        try {
          const docRef = doc(db, 'candidates', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const saved = docSnap.data() as Partial<Candidate>;
            set((state) => ({
              candidate: { ...state.candidate, ...saved, id: user.uid }
            }));
          }
        } catch (e) {
          console.error('[CandidateStore] Firestore fetch error:', e);
        }
      } else {
        set({ candidate: defaultCandidate, userId: null });
      }
    });
  }
}), { name: 'candidate-storage' }));
