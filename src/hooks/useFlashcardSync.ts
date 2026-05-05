'use client';

import { useEffect, useRef } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { type HskLevel } from '@/libs/constants/hskLevels';
import { useFlashcardsStore } from '@/stores/useFlashcardsStore';

export function useFlashcardSync() {
  const { user, isLoaded } = useAuth();
  const progressByWordId = useFlashcardsStore(s => s.progressByWordId);
  const hskLevel = useFlashcardsStore(s => s.hskLevel);
  const loadProgress = useFlashcardsStore(s => s.loadProgress);
  const loadHskLevel = useFlashcardsStore(s => s.loadHskLevel);

  const initialized = useRef(false);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const levelSyncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track the last level written from the DB so we don't echo it back immediately.
  const levelFromDb = useRef<HskLevel | null>(null);

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
      .then((data: { progressByWordId: Record<number, unknown>; hskLevel: HskLevel | null }) => {
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

        if (data.hskLevel != null) {
          levelFromDb.current = data.hskLevel;
          loadHskLevel(data.hskLevel);
        } else {
          const localLevel = useFlashcardsStore.getState().hskLevel;
          fetch('/api/flashcards/progress', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ hskLevel: localLevel }),
          }).catch(() => {});
        }
      })
      .catch(() => {});
  }, [isLoaded, user, loadProgress, loadHskLevel]);

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

  // When hskLevel changes: debounced sync to MongoDB (500 ms)
  useEffect(() => {
    if (!isLoaded || !user || !initialized.current) {
      return;
    }

    // Skip echoing back a level that was just loaded from the DB.
    if (levelFromDb.current === hskLevel) {
      levelFromDb.current = null;
      return;
    }

    if (levelSyncTimer.current) {
      clearTimeout(levelSyncTimer.current);
    }

    levelSyncTimer.current = setTimeout(() => {
      fetch('/api/flashcards/progress', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hskLevel }),
      }).catch(() => {});
    }, 500);

    return () => {
      if (levelSyncTimer.current) {
        clearTimeout(levelSyncTimer.current);
      }
    };
  }, [hskLevel, isLoaded, user]);
}
