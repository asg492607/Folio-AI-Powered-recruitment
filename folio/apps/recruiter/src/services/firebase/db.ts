import { seedCampusDrives, seedCandidates, seedInterviews, seedJobs, seedNotifications } from '@/data/seed';
import { doc, setDoc } from 'firebase/firestore';
import { firestore, hasFirebaseConfig } from '@/services/firebase/app';

type CollectionName = 'jobs' | 'candidates' | 'interviews' | 'campusDrives' | 'notifications' | 'recruiterProfiles';

const seedData: Record<CollectionName, unknown[]> = {
  jobs: seedJobs,
  candidates: seedCandidates,
  interviews: seedInterviews,
  campusDrives: seedCampusDrives,
  notifications: seedNotifications,
  recruiterProfiles: [],
};

const storageKey = (key: string) => `recruiter_app_${key}`;

export const ensureSeedData = () => {
  if (hasFirebaseConfig) {
    return;
  }

  (Object.keys(seedData) as CollectionName[]).forEach((key) => {
    if (!localStorage.getItem(storageKey(key))) {
      localStorage.setItem(storageKey(key), JSON.stringify(seedData[key]));
    }
  });
};

const getStorage = (key: string) => {
  ensureSeedData();
  const data = localStorage.getItem(storageKey(key));
  return data ? JSON.parse(data) : [];
};

const setStorage = <T,>(key: string, data: T[]) => {
  localStorage.setItem(storageKey(key), JSON.stringify(data));
};

const API_BASE = "http://localhost:8000/api/collections";

export const db = {
  collection: (name: string) => ({
    getDocs: async () => {
      try {
        const res = await fetch(`${API_BASE}/${name}`);
        if (!res.ok) return getStorage(name);
        return await res.json();
      } catch {
        return getStorage(name);
      }
    },
    addDoc: async <T extends object>(data: T) => {
      try {
        const res = await fetch(`${API_BASE}/${name}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error();
        return await res.json();
      } catch {
        const items = getStorage(name);
        const newItem = { id: Math.random().toString(36).substr(2, 9), ...data };
        setStorage(name, [...items, newItem]);
        return newItem;
      }
    },
    updateDoc: async <T extends object>(id: string, data: Partial<T>) => {
      try {
        await fetch(`${API_BASE}/${name}/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      } catch {
        const items = getStorage(name);
        const index = items.findIndex((item: { id: string }) => item.id === id);
        if (index !== -1) {
          items[index] = { ...items[index], ...data };
          setStorage(name, items);
        }
      }
    },
    deleteDoc: async (id: string) => {
      try {
        await fetch(`${API_BASE}/${name}/${id}`, { method: 'DELETE' });
      } catch {
        const items = getStorage(name);
        setStorage(name, items.filter((item: { id: string }) => item.id !== id));
      }
    }
  })
};

export const seedFirestoreData = async () => {
  const activeFirestore = firestore;

  if (!activeFirestore) {
    ensureSeedData();
    return;
  }

  await Promise.all(
    (Object.keys(seedData) as CollectionName[]).flatMap((collectionName) =>
      seedData[collectionName].map((item) => {
        const record = item as { id: string };
        return setDoc(doc(activeFirestore, collectionName, record.id), record, { merge: true });
      }),
    ),
  );
};
