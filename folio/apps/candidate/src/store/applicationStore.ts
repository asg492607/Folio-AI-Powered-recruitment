import { create } from 'zustand';
import type { Application } from '../types';
import { trackEvent } from '../utils/analytics';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const COLLECTIONS_URL = `${API_BASE}/api/collections/candidates`;

interface ApplicationState {
  applications: Application[];
  fetchApplications: (candidateId: string) => Promise<void>;
  addApplication: (application: Application) => Promise<void>;
}

export const useApplicationStore = create<ApplicationState>((set) => ({
  applications: [],
  
  fetchApplications: async (candidateId) => {
    try {
      const response = await axios.get(COLLECTIONS_URL);
      if (response.data) {
        // Filter applications for this candidate
        const myApps = response.data.filter((app: Application) => app.candidateId === candidateId);
        set({ applications: myApps });
      }
    } catch (e) {
      console.error('[ApplicationStore] Failed to fetch applications:', e);
    }
  },

  addApplication: async (application) => {
    try {
      await axios.post(COLLECTIONS_URL, application);
      trackEvent('application_submitted', { applicationId: application.id, opportunityId: application.opportunityId });
      set((state) => ({ applications: [application, ...state.applications] }));
    } catch (e) {
      console.error('[ApplicationStore] Failed to submit application:', e);
    }
  },
}));
