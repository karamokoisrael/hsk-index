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
  const loadedFromDb = useRef(false);

  // On first authenticated mount: MongoDB is the source of truth.
  useEffect(() => {
    if (!isLoaded || !user || initialized.current) return;
    initialized.current = true;

    fetch('/api/collections')
      .then(res => res.json())
      .then((data: { collections: Collection[] }) => {
        if (!Array.isArray(data.collections)) return;
        loadedFromDb.current = true;
        loadCollections(data.collections);
      })
      .catch(() => {});
  }, [isLoaded, user, loadCollections]);

  // Re-sync on tab focus to pick up changes from other devices.
  useEffect(() => {
    if (!isLoaded || !user) return;

    const handleVisibility = () => {
      if (document.visibilityState !== 'visible' || !initialized.current) return;

      fetch('/api/collections')
        .then(res => res.json())
        .then((data: { collections: Collection[] }) => {
          if (!Array.isArray(data.collections)) return;
          loadedFromDb.current = true;
          loadCollections(data.collections);
        })
        .catch(() => {});
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
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
