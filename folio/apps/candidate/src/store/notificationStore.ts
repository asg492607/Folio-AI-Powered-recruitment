import { create } from 'zustand';
import type { Notification } from '../types';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';

interface NotificationState {
  notifications: Notification[];
  userId: string | null;
  markAsRead: (id: string) => void;
  markAllRead: () => void;
  pushNotification: (notification: Omit<Notification, 'id' | 'candidateId' | 'createdAt' | 'read'>) => void;
  initializeAuth: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  userId: null,

  markAsRead: async (id) => {
    // Optimistic UI update
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      ),
    }));
    // Persist to Firestore
    const { userId } = get();
    if (userId) {
      try {
        await updateDoc(doc(db, 'candidates', userId, 'notifications', id), { read: true });
      } catch (e) {
        console.error('[NotificationStore] markAsRead error:', e);
      }
    }
  },

  markAllRead: async () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    }));
    const { userId, notifications } = get();
    if (userId && notifications.length > 0) {
      try {
        const batch = writeBatch(db);
        notifications
          .filter((n) => !n.read)
          .forEach((n) => {
            batch.update(doc(db, 'candidates', userId, 'notifications', n.id), { read: true });
          });
        await batch.commit();
      } catch (e) {
        console.error('[NotificationStore] markAllRead error:', e);
      }
    }
  },

  // Push a real notification to Firestore (and triggers live update)
  pushNotification: async (notifData) => {
    const { userId } = get();
    if (!userId) return;
    try {
      await addDoc(collection(db, 'candidates', userId, 'notifications'), {
        ...notifData,
        candidateId: userId,
        read: false,
        createdAt: new Date().toISOString(),
      });
    } catch (e) {
      console.error('[NotificationStore] pushNotification error:', e);
    }
  },

  // Subscribe to real-time Firestore notifications
  initializeAuth: () => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        set({ userId: user.uid, notifications: [] });
        const q = query(
          collection(db, 'candidates', user.uid, 'notifications'),
          orderBy('createdAt', 'desc'),
        );
        // Real-time subscription — auto-updates UI when Firestore changes
        onSnapshot(q, (snapshot) => {
          const notifs: Notification[] = snapshot.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<Notification, 'id'>),
          }));
          set({ notifications: notifs });
        });
      } else {
        set({ notifications: [], userId: null });
      }
    });
  },
}));
