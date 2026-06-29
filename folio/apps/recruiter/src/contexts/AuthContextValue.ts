import { createContext } from 'react';
import type { Role, User } from '@/types';

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: Role) => Promise<boolean>;
  logout: () => void;
  recruiterProfile: any | null;
  setRecruiterProfile: React.Dispatch<React.SetStateAction<any | null>>;
  checkingProfile: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
