import React, { useEffect, useState } from 'react';
import { AuthContext } from '@/contexts/AuthContextValue';
import { Role, User } from '@/types';
import { db } from '@/services/firebase/db';
import { getAuth, signInWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged, createUserWithEmailAndPassword } from 'firebase/auth';
import { firebaseApp } from '@/services/firebase/app';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [recruiterProfile, setRecruiterProfile] = useState<any | null>(null);
  const [checkingProfile, setCheckingProfile] = useState(true);

  useEffect(() => {
    if (!firebaseApp) {
      setCheckingProfile(false);
      return;
    }
    const auth = getAuth(firebaseApp);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const u: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Recruiter',
          role: 'Recruiter',
        };
        setUser(u);
      } else {
        setUser(null);
        setRecruiterProfile(null);
        setCheckingProfile(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const checkProfile = async () => {
      if (!user) {
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

  const login = async (email: string, password: string, role: Role) => {
    if (!firebaseApp) return false;
    try {
      const auth = getAuth(firebaseApp);
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error) {
      console.error("Login failed", error);
      return false;
    }
  };

  const logout = async () => {
    if (firebaseApp) {
      const auth = getAuth(firebaseApp);
      await firebaseSignOut(auth);
    }
    setUser(null);
    setRecruiterProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, recruiterProfile, setRecruiterProfile, checkingProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
