'use client';

import { useEffect, useRef } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { type HskLevel } from '@/libs/constants/hskLevels';
import { useFlashcardsStore } from '@/stores/useFlashcardsStore';
import type { FlashcardProgress } from '@/types/Hsk';

type ProgressMap = Record<number, FlashcardProgress>;
type ApiResponse = { progressByWordId: ProgressMap; hskLevel: HskLevel | null };

/**
 * Merge two progress maps by keeping the entry with the later lastReviewedAt
 * for each word. Words present in only one map are kept as-is.
 */
function mergeProgress(local: ProgressMap, remote: ProgressMap): ProgressMap {
  const merged: ProgressMap = { ...remote };
  for (const [idStr, localProg] of Object.entries(local)) {
    const id = Number(idStr);
    const remoteProg = remote[id];
    const localTs = localProg.lastReviewedAt ? new Date(localProg.lastReviewedAt).getTime() : 0;
    const remoteTs = remoteProg?.lastReviewedAt ? new Date(remoteProg.lastReviewedAt).getTime() : 0;
    if (!remoteProg || localTs > remoteTs) {
      merged[id] = localProg;
    }
  }
  return merged;
}

export function useFlashcardSync() {
  const { user, isLoaded } = useAuth();
  const progressByWordId = useFlashcardsStore(s => s.progressByWordId);
  const hskLevel = useFlashcardsStore(s => s.hskLevel);
  const loadProgress = useFlashcardsStore(s => s.loadProgress);
  const loadHskLevel = useFlashcardsStore(s => s.loadHskLevel);

  const initialized = useRef(false);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const levelFromDb = useRef<HskLevel | null>(null);

  // On first authenticated mount: DB is the source of truth for returning users.
  // Only upload local data when DB is empty AND the user has explicitly acted here.
  useEffect(() => {
    if (!isLoaded || !user || initialized.current) return;
    initialized.current = true;

    fetch('/api/flashcards/progress')
      .then(res => res.json())
      .then((data: ApiResponse) => {
        const dbHasData =
          data.hskLevel != null ||
          (data.progressByWordId && Object.keys(data.progressByWordId).length > 0);

        if (dbHasData) {
          if (data.progressByWordId && Object.keys(data.progressByWordId).length > 0) {
            loadProgress(data.progressByWordId);
          }
          if (data.hskLevel != null) {
            levelFromDb.current = data.hskLevel;
            loadHskLevel(data.hskLevel);
          }
        } else {
          // New user — only upload if this device has real activity.
          const { hskLevel: localLevel, progressByWordId: localProgress, isLevelSelected } =
            useFlashcardsStore.getState();
          if (isLevelSelected || Object.keys(localProgress).length > 0) {
            fetch('/api/flashcards/progress', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ progressByWordId: localProgress, hskLevel: localLevel }),
            }).catch(() => {});
          }
        }
      })
      .catch(() => {});
  }, [isLoaded, user, loadProgress, loadHskLevel]);

  // Re-sync on tab focus to pick up changes from other devices.
  // Uses per-word merge so in-flight local reviews are never lost.
  useEffect(() => {
    if (!isLoaded || !user) return;

    const handleVisibility = () => {
      if (document.visibilityState !== 'visible' || !initialized.current) return;

      fetch('/api/flashcards/progress')
        .then(res => res.json())
        .then((data: ApiResponse) => {
          if (data.progressByWordId && Object.keys(data.progressByWordId).length > 0) {
            const local = useFlashcardsStore.getState().progressByWordId;
            const merged = mergeProgress(local, data.progressByWordId);
            loadProgress(merged);
          }
          if (data.hskLevel != null) {
            levelFromDb.current = data.hskLevel;
            loadHskLevel(data.hskLevel);
          }
        })
        .catch(() => {});
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isLoaded, user, loadProgress, loadHskLevel]);

  // When hskLevel changes: immediately sync both level and progress atomically.
  useEffect(() => {
    if (!isLoaded || !user || !initialized.current) return;

    if (levelFromDb.current === hskLevel) {
      levelFromDb.current = null;
      return;
    }

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
  useEffect(() => {
    if (!isLoaded || !user || !initialized.current) return;

    if (syncTimer.current) clearTimeout(syncTimer.current);

    syncTimer.current = setTimeout(() => {
      fetch('/api/flashcards/progress', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progressByWordId }),
      }).catch(() => {});
    }, 1500);

    return () => {
      if (syncTimer.current) clearTimeout(syncTimer.current);
    };
  }, [progressByWordId, isLoaded, user]);
}
