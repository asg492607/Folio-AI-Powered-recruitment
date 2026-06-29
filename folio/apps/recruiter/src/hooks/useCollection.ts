import { useCallback, useEffect, useState } from 'react';
import { db } from '@/services/firebase/db';

export function useCollection<T extends { id: string }>(collectionName: string) {
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const docs = await db.collection(collectionName).getDocs();
    setItems(docs as T[]);
    setIsLoading(false);
  }, [collectionName]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addItem = async (item: Omit<T, 'id'>) => {
    const created = await db.collection(collectionName).addDoc(item);
    setItems((current) => [...current, created as T]);
    return created as T;
  };

  const updateItem = async (id: string, patch: Partial<T>) => {
    await db.collection(collectionName).updateDoc<T>(id, patch);
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const deleteItem = async (id: string) => {
    await db.collection(collectionName).deleteDoc(id);
    setItems((current) => current.filter((item) => item.id !== id));
  };

  return { items, isLoading, addItem, updateItem, deleteItem, refresh };
}
