import React, { useEffect, useState } from 'react';
import { AuthContext } from '@/contexts/AuthContextValue';
import { seedUsers } from '@/data/seed';
import { Role, User } from '@/types';
import { db } from '@/services/firebase/db';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [recruiterProfile, setRecruiterProfile] = useState<any | null>(null);
  const [checkingProfile, setCheckingProfile] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('recruiter_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setCheckingProfile(false);
    }
  }, []);

  useEffect(() => {
    const checkProfile = async () => {
      if (!user) {
        setRecruiterProfile(null);
        setCheckingProfile(false);
        return;
      }
      if (user.role !== 'Recruiter') {
        setRecruiterProfile(null);
        setCheckingProfile(false);
        return;
      }
      setCheckingProfile(true);
      try {
        const docs = await db.collection('recruiterProfiles').getDocs();
        const found = docs.find((p: any) => p.userId === user.id || p.email === user.email);
        setRecruiterProfile(found || null);
      } catch (err) {
        console.error(err);
      } finally {
        setCheckingProfile(false);
      }
    };
    void checkProfile();
  }, [user]);

  const login = (email: string, password: string, role: Role) => {
    const matchingUser = seedUsers.find(
      (account) => account.email === email.trim().toLowerCase() && account.password === password && account.role === role,
    );

    if (!matchingUser) {
      return false;
    }

    const userWithoutPassword: User = {
      id: matchingUser.id,
      email: matchingUser.email,
      displayName: matchingUser.displayName,
      role: matchingUser.role,
      photoURL: matchingUser.photoURL,
    };
    setCheckingProfile(true);
    setUser(userWithoutPassword);
    localStorage.setItem('recruiter_user', JSON.stringify(userWithoutPassword));
    return true;
  };

  const logout = () => {
    setUser(null);
    setRecruiterProfile(null);
    localStorage.removeItem('recruiter_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, recruiterProfile, setRecruiterProfile, checkingProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
