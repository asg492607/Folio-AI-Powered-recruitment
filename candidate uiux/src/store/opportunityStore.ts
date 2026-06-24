import { create } from 'zustand';
import type { Opportunity } from '../types';
import { trackEvent } from '../utils/analytics';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

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
      const saved = state.savedIds.includes(id) ? state.savedIds.filter((savedId) => savedId !== id) : [...state.savedIds, id];
      trackEvent('opportunity_saved', { opportunityId: id, saved: saved.includes(id) });
      return { savedIds: saved };
    }),
  fetchOpportunities: async () => {
    set({ loading: true, error: null });
    try {
      const querySnapshot = await getDocs(collection(db, "jobs"));
      const ops: Opportunity[] = [];
      querySnapshot.forEach((doc) => {
        ops.push({ id: doc.id, ...doc.data() } as Opportunity);
      });
      set({ opportunities: ops, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },
  subscribeToOpportunities: () => {
    set({ loading: true, error: null });
    const unsubscribe = onSnapshot(collection(db, 'jobs'), (snapshot) => {
      const ops: Opportunity[] = [];
      snapshot.forEach((doc) => {
        ops.push({ id: doc.id, ...doc.data() } as Opportunity);
      });
      set({ opportunities: ops, loading: false });
    }, (error) => {
      set({ error: error.message, loading: false });
    });
    return unsubscribe;
  }
}));
