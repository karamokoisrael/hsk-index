'use client';

import { useEffect, useRef } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { useCollectionsStore, type Collection } from '@/stores/useCollectionsStore';

export function useCollectionSync() {
  const { user, isLoaded } = useAuth();
  const collections = useCollectionsStore(s => s.collections);
  const loadCollections = useCollectionsStore(s => s.loadCollections);

  const initialized = useRef(false);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Skip echoing back the list we just loaded from DB.
  const loadedFromDb = useRef(false);

  // On first authenticated mount: pull from MongoDB (user collections + public ones).
  // If the server has no user collections yet, push local ones up.
  useEffect(() => {
    if (!isLoaded || !user || initialized.current) return;
    initialized.current = true;

    fetch('/api/collections')
      .then(res => res.json())
      .then((data: { collections: Collection[] }) => {
        if (!Array.isArray(data.collections)) return;

        const userCollectionsFromDb = data.collections.filter(c => !c.isPublic);
        const publicCollections = data.collections.filter(c => c.isPublic);

        if (userCollectionsFromDb.length > 0) {
          // Server has user collections — they are authoritative.
          loadedFromDb.current = true;
          loadCollections(data.collections);
        } else {
          // No server data yet — push local user collections up, then merge with public.
          const local = useCollectionsStore.getState().collections.filter(c => !c.isPublic);
          const merged = [...local, ...publicCollections];

          loadedFromDb.current = true;
          loadCollections(merged);

          if (local.length > 0) {
            fetch('/api/collections', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ collections: local }),
            }).catch(() => {});
          }
        }
      })
      .catch(() => {});
  }, [isLoaded, user, loadCollections]);

  // Debounced sync of user-owned collections to MongoDB after every local change.
  useEffect(() => {
    if (!isLoaded || !user || !initialized.current) return;

    // Don't echo back what we just loaded from DB.
    if (loadedFromDb.current) {
      loadedFromDb.current = false;
      return;
    }

    if (syncTimer.current) clearTimeout(syncTimer.current);

    syncTimer.current = setTimeout(() => {
      const userCollections = useCollectionsStore.getState().collections.filter(c => !c.isPublic);
      fetch('/api/collections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collections: userCollections }),
      }).catch(() => {});
    }, 1500);

    return () => {
      if (syncTimer.current) clearTimeout(syncTimer.current);
    };
  }, [collections, isLoaded, user]);
}
