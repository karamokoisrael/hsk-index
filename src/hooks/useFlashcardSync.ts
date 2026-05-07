'use client';

import { useEffect, useRef } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { type HskLevel } from '@/libs/constants/hskLevels';
import { type DailyHistoryEntry, useFlashcardsStore } from '@/stores/useFlashcardsStore';
import type { FlashcardProgress } from '@/types/Hsk';

type ProgressMap = Record<number, FlashcardProgress>;
type StudyHistory = Record<string, DailyHistoryEntry>;
type ApiResponse = { progressByWordId: ProgressMap; hskLevel: HskLevel | null; studyHistory: StudyHistory };

function hasProgress(progress: ProgressMap): boolean {
  return Object.keys(progress).length > 0;
}

export function useFlashcardSync() {
  const { user, isLoaded } = useAuth();
  const progressByWordId = useFlashcardsStore(s => s.progressByWordId);
  const hskLevel = useFlashcardsStore(s => s.hskLevel);
  const studyHistory = useFlashcardsStore(s => s.studyHistory);
  const loadProgress = useFlashcardsStore(s => s.loadProgress);
  const loadHskLevel = useFlashcardsStore(s => s.loadHskLevel);
  const loadStudyHistory = useFlashcardsStore(s => s.loadStudyHistory);

  const initialized = useRef(false);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const levelFromDb = useRef<HskLevel | null>(null);

  // On first authenticated mount: DB is the source of truth.
  useEffect(() => {
    if (!isLoaded || !user || initialized.current) return;
    initialized.current = true;

    fetch('/api/flashcards/progress')
      .then(res => res.json())
      .then((data: ApiResponse) => {
        if (hasProgress(data.progressByWordId)) {
          loadProgress(data.progressByWordId);
        }
        if (data.hskLevel != null) {
          levelFromDb.current = data.hskLevel;
          loadHskLevel(data.hskLevel);
        }
        if (data.studyHistory && Object.keys(data.studyHistory).length > 0) {
          loadStudyHistory(data.studyHistory);
        }
      })
      .catch(() => {});
  }, [isLoaded, user, loadProgress, loadHskLevel, loadStudyHistory]);

  // Re-sync on tab focus to pick up changes from other devices.
  // Server data always overwrites local state on refresh.
  useEffect(() => {
    if (!isLoaded || !user) return;

    const handleVisibility = () => {
      if (document.visibilityState !== 'visible' || !initialized.current) return;

      fetch('/api/flashcards/progress')
        .then(res => res.json())
        .then((data: ApiResponse) => {
          if (hasProgress(data.progressByWordId)) {
            loadProgress(data.progressByWordId);
          }
          if (data.hskLevel != null) {
            levelFromDb.current = data.hskLevel;
            loadHskLevel(data.hskLevel);
          }
          if (data.studyHistory && Object.keys(data.studyHistory).length > 0) {
            loadStudyHistory(data.studyHistory);
          }
        })
        .catch(() => {});
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isLoaded, user, loadProgress, loadHskLevel, loadStudyHistory]);

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

    const currentState = useFlashcardsStore.getState();
    fetch('/api/flashcards/progress', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        progressByWordId: currentState.progressByWordId,
        hskLevel,
        studyHistory: currentState.studyHistory,
      }),
    }).catch(() => {});
  }, [hskLevel, isLoaded, user]);

  // After every review: debounced sync to MongoDB (1.5 s).
  useEffect(() => {
    if (!isLoaded || !user || !initialized.current) return;

    if (syncTimer.current) clearTimeout(syncTimer.current);

    syncTimer.current = setTimeout(() => {
      const currentState = useFlashcardsStore.getState();

      if (!hasProgress(currentState.progressByWordId) && !currentState.isLevelSelected) {
        fetch('/api/flashcards/progress')
          .then(res => res.json())
          .then((data: ApiResponse) => {
            if (hasProgress(data.progressByWordId)) {
              loadProgress(data.progressByWordId);
            }
            if (data.hskLevel != null) {
              levelFromDb.current = data.hskLevel;
              loadHskLevel(data.hskLevel);
            }
            if (data.studyHistory && Object.keys(data.studyHistory).length > 0) {
              loadStudyHistory(data.studyHistory);
            }
          })
          .catch(() => {});
        return;
      }

      fetch('/api/flashcards/progress', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progressByWordId, hskLevel, studyHistory }),
      }).catch(() => {});
    }, 1500);

    return () => {
      if (syncTimer.current) clearTimeout(syncTimer.current);
    };
  }, [progressByWordId, isLoaded, user]);
}
