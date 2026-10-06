import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBfYViwYovvYgQZm0b2gbduztbp_t60Iqw",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mitiod-8f18c.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mitiod-8f18c",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mitiod-8f18c.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "237229832944",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:237229832944:web:41de777f5c2c1ea4156035",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-5NLNQSFSVK"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
