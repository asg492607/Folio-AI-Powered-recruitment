import { getAnalytics, isSupported } from 'firebase/analytics';
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
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
