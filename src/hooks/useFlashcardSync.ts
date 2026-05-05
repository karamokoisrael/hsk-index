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
  // Track the last level written from the DB so we don't echo it back immediately.
  const levelFromDb = useRef<HskLevel | null>(null);

  // On first authenticated mount: pull from MongoDB.
  // If levels mismatch (local changed but DB not yet synced), push local state.
  // If server has progress → overwrite local store.
  // If server has no data → push local data up (first login upload).
  useEffect(() => {
    if (!isLoaded || !user || initialized.current) {
      return;
    }
    initialized.current = true;

    fetch('/api/flashcards/progress')
      .then(res => res.json())
      .then((data: { progressByWordId: Record<number, unknown>; hskLevel: HskLevel | null }) => {
        const localLevel = useFlashcardsStore.getState().hskLevel;
        const localProgress = useFlashcardsStore.getState().progressByWordId;

        // If the DB level differs from local, a level change happened locally but
        // wasn't fully synced. Push local state (level + progress) and don't overwrite.
        if (data.hskLevel != null && data.hskLevel !== localLevel) {
          fetch('/api/flashcards/progress', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ progressByWordId: localProgress, hskLevel: localLevel }),
          }).catch(() => {});
          return;
        }

        // Same level (or DB has no level yet): pull progress from DB.
        if (data.progressByWordId && Object.keys(data.progressByWordId).length > 0) {
          loadProgress(data.progressByWordId as Parameters<typeof loadProgress>[0]);
        } else {
          if (Object.keys(localProgress).length > 0) {
            fetch('/api/flashcards/progress', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ progressByWordId: localProgress }),
            }).catch(() => {});
          }
        }

        if (data.hskLevel != null) {
          levelFromDb.current = data.hskLevel;
          loadHskLevel(data.hskLevel);
        } else {
          fetch('/api/flashcards/progress', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ hskLevel: localLevel }),
          }).catch(() => {});
        }
      })
      .catch(() => {});
  }, [isLoaded, user, loadProgress, loadHskLevel]);

  // When hskLevel changes: immediately cancel any pending progress debounce and sync
  // BOTH level and progress atomically. This prevents DB inconsistency if the tab is
  // closed between the level and progress writes.
  useEffect(() => {
    if (!isLoaded || !user || !initialized.current) {
      return;
    }

    // Skip echoing back a level that was just loaded from the DB.
    if (levelFromDb.current === hskLevel) {
      levelFromDb.current = null;
      return;
    }

    // Cancel the pending progress debounce — this PUT covers both.
    if (syncTimer.current) {
      clearTimeout(syncTimer.current);
      syncTimer.current = null;
    }

    const currentProgress = useFlashcardsStore.getState().progressByWordId;
    fetch('/api/flashcards/progress', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ progressByWordId: currentProgress, hskLevel }),
    }).catch(() => {});
  }, [hskLevel, isLoaded, user]);

  // After every review: debounced sync to MongoDB (1.5 s).
  // Skipped automatically when the level effect already handled the write.
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
