import { create } from 'zustand';
import type { Opportunity } from '../types';
import { trackEvent } from '../utils/analytics';
import { fetchOpportunities } from '../api/opportunities';
import { useCandidateStore } from './candidateStore';
import { useNotificationStore } from './notificationStore';

interface OpportunityState {
  opportunities: Opportunity[];
  savedIds: string[];
  loading: boolean;
  error: string | null;
  toggleSaved: (id: string) => void;
  fetchOpportunities: () => Promise<void>;
  subscribeToOpportunities: () => () => void;
}

export const useOpportunityStore = create<OpportunityState>((set) => ({
  opportunities: [],
  savedIds: [],
  loading: false,
  error: null,

  toggleSaved: (id) =>
    set((state) => {
      const saved = state.savedIds.includes(id)
        ? state.savedIds.filter((savedId) => savedId !== id)
        : [...state.savedIds, id];
      trackEvent('opportunity_saved', { opportunityId: id, saved: saved.includes(id) });
      return { savedIds: saved };
    }),

  fetchOpportunities: async () => {
    set({ loading: true, error: null });
    try {
      const candidateSkills = useCandidateStore.getState().candidate.skills;
      const ops = await fetchOpportunities(candidateSkills);
      set({ opportunities: ops, loading: false });

      // Push a notification if there's a high-match opportunity (>=80%)
      const topMatch = ops.find((o) => (o.matchPercentage || 0) >= 80);
      if (topMatch && topMatch.matchPercentage) {
        const { pushNotification } = useNotificationStore.getState();
        pushNotification({
          type: 'new_opportunity',
          message: `New ${topMatch.matchPercentage}% match: ${topMatch.title} at ${topMatch.companyName}`,
          linkTo: `/opportunities/${topMatch.id}`,
        });
      }
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  subscribeToOpportunities: () => {
    set({ loading: true, error: null });

    // Initial fetch
    const candidateSkills = useCandidateStore.getState().candidate.skills;
    fetchOpportunities(candidateSkills)
      .then((ops) => {
        set({ opportunities: ops, loading: false });
        // Notify on first load if high match found
        const topMatch = ops.find((o) => (o.matchPercentage || 0) >= 80);
        if (topMatch && topMatch.matchPercentage) {
          const { pushNotification } = useNotificationStore.getState();
          pushNotification({
            type: 'new_opportunity',
            message: `New ${topMatch.matchPercentage}% match: ${topMatch.title} at ${topMatch.companyName}`,
            linkTo: `/opportunities/${topMatch.id}`,
          });
        }
      })
      .catch((err) => set({ error: (err as Error).message, loading: false }));

    // Poll live API every 2 minutes
    const interval = setInterval(() => {
      const skills = useCandidateStore.getState().candidate.skills;
      fetchOpportunities(skills).then((ops) => set({ opportunities: ops }));
    }, 120000);

    return () => clearInterval(interval);
  }
}));
