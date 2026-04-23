'use client';

import { useEffect, useRef } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { useFlashcardsStore } from '@/stores/useFlashcardsStore';

export function useFlashcardSync() {
  const { user, isLoaded } = useAuth();
  const progressByWordId = useFlashcardsStore(s => s.progressByWordId);
  const loadProgress = useFlashcardsStore(s => s.loadProgress);

  const initialized = useRef(false);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // On first authenticated mount: pull from MongoDB.
  // If server has data → overwrite local store.
  // If server has no data yet → push local data up (first login upload).
  useEffect(() => {
    if (!isLoaded || !user || initialized.current) {
      return;
    }
    initialized.current = true;

    fetch('/api/flashcards/progress')
      .then(res => res.json())
      .then((data: { progressByWordId: Record<number, unknown> }) => {
        if (data.progressByWordId && Object.keys(data.progressByWordId).length > 0) {
          loadProgress(data.progressByWordId as Parameters<typeof loadProgress>[0]);
        } else {
          const local = useFlashcardsStore.getState().progressByWordId;
          if (Object.keys(local).length > 0) {
            fetch('/api/flashcards/progress', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ progressByWordId: local }),
            }).catch(() => {});
          }
        }
      })
      .catch(() => {});
  }, [isLoaded, user, loadProgress]);

  // After every review: debounced sync to MongoDB (1.5 s)
  useEffect(() => {
    if (!isLoaded || !user || !initialized.current) {
      return;
    }

    if (syncTimer.current) {
      clearTimeout(syncTimer.current);
    }

    syncTimer.current = setTimeout(() => {
      fetch('/api/flashcards/progress', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progressByWordId }),
      }).catch(() => {});
    }, 1500);

    return () => {
      if (syncTimer.current) {
        clearTimeout(syncTimer.current);
      }
    };
  }, [progressByWordId, isLoaded, user]);
}
