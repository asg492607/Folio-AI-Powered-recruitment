const API_BASE = "/api/collections";

export const db = {
  collection: (name: string) => ({
    getDocs: async () => {
      try {
        const res = await fetch(`${API_BASE}/${name}`);
        if (!res.ok) throw new Error();
        return await res.json();
      } catch {
        return [];
      }
    },
    addDoc: async <T extends object>(data: T) => {
      const res = await fetch(`${API_BASE}/${name}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error();
      return await res.json();
    },
    updateDoc: async <T extends object>(id: string, data: Partial<T>) => {
      const res = await fetch(`${API_BASE}/${name}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error();
    },
    deleteDoc: async (id: string) => {
      const res = await fetch(`${API_BASE}/${name}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
    }
  })
};

export const seedFirestoreData = async () => {
  // Not used in production
};

