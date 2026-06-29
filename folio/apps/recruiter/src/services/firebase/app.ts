import { getAnalytics, isSupported } from 'firebase/analytics';
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBfYViwYovvYgQZm0b2gbduztbp_t60Iqw",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mitiod-8f18c.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mitiod-8f18c",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mitiod-8f18c.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "237229832944",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:237229832944:web:41de777f5c2c1ea4156035",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-5NLNQSFSVK",
};

export const hasFirebaseConfig = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.storageBucket &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId,
);

export const firebaseApp: FirebaseApp | null = hasFirebaseConfig ? initializeApp(firebaseConfig) : null;
export const firestore = firebaseApp ? getFirestore(firebaseApp) : null;

export const initializeAnalytics = async () => {
  if (!firebaseApp || !firebaseConfig.measurementId) {
    return null;
  }

  const supported = await isSupported();
  return supported ? getAnalytics(firebaseApp) : null;
};
