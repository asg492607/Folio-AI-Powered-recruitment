import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from "firebase/firestore";
import type { Candidate, CandidateRole } from '../types';

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

export async function loginWithEmail(email: string, password?: string): Promise<{ token: string; candidate: Candidate }> {
  const pwd = password || 'password123';
  const userCredential = await signInWithEmailAndPassword(auth, email, pwd);
  const user = userCredential.user;
  const token = await user.getIdToken();
  
  const docRef = doc(db, "candidates", user.uid);
  const docSnap = await getDoc(docRef);
  let candidateData = defaultCandidate;
  if (docSnap.exists()) {
    candidateData = docSnap.data() as Candidate;
  }
  
  return { token, candidate: { ...candidateData, id: user.uid, email: user.email || email } };
}

export async function signupWithEmail(email: string, role: CandidateRole, password?: string): Promise<{ token: string; candidate: Candidate }> {
  const pwd = password || 'password123';
  const userCredential = await createUserWithEmailAndPassword(auth, email, pwd);
  const user = userCredential.user;
  const token = await user.getIdToken();
  
  const candidateData: Candidate = { ...defaultCandidate, id: user.uid, email: user.email || email, role };
  await setDoc(doc(db, "candidates", user.uid), candidateData);
  
  return { token, candidate: candidateData };
}

export async function loginWithGoogle(): Promise<{ token: string; candidate: Candidate }> {
  const provider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(auth, provider);
  const user = userCredential.user;
  const token = await user.getIdToken();
  
  const docRef = doc(db, "candidates", user.uid);
  const docSnap = await getDoc(docRef);
  let candidateData: Candidate = { ...defaultCandidate, id: user.uid, email: user.email || '', authProvider: 'google' as const };
  
  if (docSnap.exists()) {
    candidateData = docSnap.data() as Candidate;
  } else {
    await setDoc(docRef, candidateData);
  }
  
  return { token, candidate: candidateData };
}
