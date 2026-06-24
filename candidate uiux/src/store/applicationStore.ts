import { create } from 'zustand';
import { applications as mockApplications } from '../mocks/data';
import type { Application } from '../types';
import { trackEvent } from '../utils/analytics';

interface ApplicationState {
  applications: Application[];
  addApplication: (application: Application) => void;
}

export const useApplicationStore = create<ApplicationState>((set) => ({
  applications: mockApplications,
  addApplication: (application) =>
    set((state) => {
      trackEvent('application_submitted', { applicationId: application.id, opportunityId: application.opportunityId });
      return { applications: [application, ...state.applications] };
    }),
}));
