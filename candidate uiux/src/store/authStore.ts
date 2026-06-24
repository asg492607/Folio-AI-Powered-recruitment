import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Candidate } from '../types';

interface AuthState {
  token: string | null;
  candidate: Candidate | null;
  setSession: (token: string, candidate: Candidate) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      candidate: null,
      setSession: (token, candidate) => set({ token, candidate }),
      logout: () => set({ token: null, candidate: null }),
    }),
    { name: 'candidate-experience-auth' },
  ),
);
