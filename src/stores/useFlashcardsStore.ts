'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { hskWords } from '@/data/hskWords';
import { createInitialProgress, isDue, scheduleNextReview } from '@/features/flashcards/srs';
import type { FlashcardProgress, HskWord, PromptMode, ReviewGrade } from '@/types/Hsk';

type FlashcardsStore = {
  progressByWordId: Record<number, FlashcardProgress>;
  promptMode: PromptMode;
  setPromptMode: (mode: PromptMode) => void;
  getProgress: (wordId: number) => FlashcardProgress;
  getDueWords: (words: HskWord[], baseDate: Date) => HskWord[];
  reviewWord: (wordId: number, grade: ReviewGrade, baseDate: Date) => void;
  loadProgress: (progress: Record<number, FlashcardProgress>) => void;
  resetAllProgress: () => void;
};

export const useFlashcardsStore = create<FlashcardsStore>()(
  persist(
    (set, get) => ({
      progressByWordId: {},
      promptMode: 'word-to-meaning',
      setPromptMode: mode => set({ promptMode: mode }),
      getProgress: (wordId) => {
        const existing = get().progressByWordId[wordId];
        if (existing) {
          return existing;
        }

        return createInitialProgress(new Date());
      },
      getDueWords: (words, baseDate) => {
        const { progressByWordId } = get();

        return words
          .filter((word) => {
            const progress = progressByWordId[word.id] ?? createInitialProgress(baseDate);
            return isDue(progress, baseDate);
          })
          .sort((wordA, wordB) => {
            const a = progressByWordId[wordA.id] ?? createInitialProgress(baseDate);
            const b = progressByWordId[wordB.id] ?? createInitialProgress(baseDate);
            return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
          });
      },
      reviewWord: (wordId, grade, baseDate) => {
        const current = get().progressByWordId[wordId] ?? createInitialProgress(baseDate);
        const next = scheduleNextReview(current, grade, baseDate);

        set(state => ({
          progressByWordId: {
            ...state.progressByWordId,
            [wordId]: next,
          },
        }));
      },
      loadProgress: progress => set({ progressByWordId: progress }),
      resetAllProgress: () => set({ progressByWordId: {} }),
    }),
    {
      name: 'hsk-flashcards-store',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);

export const getDefaultDeck = () => hskWords;
