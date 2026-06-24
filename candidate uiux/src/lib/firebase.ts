import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBfYViwYovvYgQZm0b2gbduztbp_t60Iqw",
  authDomain: "mitiod-8f18c.firebaseapp.com",
  projectId: "mitiod-8f18c",
  storageBucket: "mitiod-8f18c.firebasestorage.app",
  messagingSenderId: "237229832944",
  appId: "1:237229832944:web:41de777f5c2c1ea4156035",
  measurementId: "G-5NLNQSFSVK"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
