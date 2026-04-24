'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { hskWords } from '@/data/hskWords';
import {
  createInitialProgress,
  isDue,
  resolveState,
  scheduleNextReview,
} from '@/features/flashcards/srs';
import type { FlashcardProgress, HskWord, PromptMode, ReviewGrade } from '@/types/Hsk';

type DailyStats = {
  date: string;
  newCardsSeen: number;
  reviewsDone: number;
};

type DeckStats = {
  newCount: number;
  learningCount: number;
  reviewCount: number;
};

type FlashcardsStore = {
  progressByWordId: Record<number, FlashcardProgress>;
  promptMode: PromptMode;
  maxNewPerDay: number;
  maxReviewsPerDay: number;
  dailyStats: DailyStats | null;

  setPromptMode: (mode: PromptMode) => void;
  setLimits: (maxNew: number, maxReviews: number) => void;
  getProgress: (wordId: number) => FlashcardProgress;
  getDueWords: (words: HskWord[], baseDate: Date) => HskWord[];
  getDeckStats: (words: HskWord[], baseDate: Date) => DeckStats;
  reviewWord: (wordId: number, grade: ReviewGrade, baseDate: Date) => void;
  loadProgress: (progress: Record<number, FlashcardProgress>) => void;
  resetAllProgress: () => void;
};

function todayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function resolveStats(dailyStats: DailyStats | null, today: string): DailyStats {
  if (dailyStats?.date === today) {
    return dailyStats;
  }
  return { date: today, newCardsSeen: 0, reviewsDone: 0 };
}

export const useFlashcardsStore = create<FlashcardsStore>()(
  persist(
    (set, get) => ({
      progressByWordId: {},
      promptMode: 'word-to-meaning',
      maxNewPerDay: 20,
      maxReviewsPerDay: 100,
      dailyStats: null,

      setPromptMode: mode => set({ promptMode: mode }),

      setLimits: (maxNew, maxReviews) =>
        set({ maxNewPerDay: maxNew, maxReviewsPerDay: maxReviews }),

      getProgress: (wordId) => {
        const existing = get().progressByWordId[wordId];
        return existing ?? createInitialProgress(new Date());
      },

      getDueWords: (words, baseDate) => {
        const { progressByWordId, dailyStats, maxNewPerDay, maxReviewsPerDay } = get();
        const today = todayKey(baseDate);
        const stats = resolveStats(dailyStats, today);

        const newRemaining = Math.max(0, maxNewPerDay - stats.newCardsSeen);
        const reviewRemaining = Math.max(0, maxReviewsPerDay - stats.reviewsDone);

        const learningDue: HskWord[] = [];
        const reviewDue: HskWord[] = [];
        const newCards: HskWord[] = [];

        for (const word of words) {
          const progress = progressByWordId[word.id] ?? createInitialProgress(baseDate);
          const state = resolveState(progress);

          if ((state === 'learning' || state === 'relearning') && isDue(progress, baseDate)) {
            learningDue.push(word);
          } else if (state === 'review' && isDue(progress, baseDate)) {
            reviewDue.push(word);
          } else if (state === 'new') {
            newCards.push(word);
          }
        }

        const byDue = (a: HskWord, b: HskWord) => {
          const pa = progressByWordId[a.id] ?? createInitialProgress(baseDate);
          const pb = progressByWordId[b.id] ?? createInitialProgress(baseDate);
          return new Date(pa.dueAt).getTime() - new Date(pb.dueAt).getTime();
        };

        return [
          ...learningDue.sort(byDue),
          ...reviewDue.sort(byDue).slice(0, reviewRemaining),
          ...newCards.slice(0, newRemaining),
        ];
      },

      getDeckStats: (words, baseDate) => {
        const { progressByWordId, dailyStats, maxNewPerDay, maxReviewsPerDay } = get();
        const today = todayKey(baseDate);
        const stats = resolveStats(dailyStats, today);

        const newRemaining = Math.max(0, maxNewPerDay - stats.newCardsSeen);
        const reviewRemaining = Math.max(0, maxReviewsPerDay - stats.reviewsDone);

        let newCount = 0;
        let learningCount = 0;
        let reviewCount = 0;

        for (const word of words) {
          const progress = progressByWordId[word.id] ?? createInitialProgress(baseDate);
          const state = resolveState(progress);

          if (state === 'new' && newCount < newRemaining) {
            newCount++;
          } else if (state === 'learning' || state === 'relearning') {
            learningCount++;
          } else if (state === 'review' && isDue(progress, baseDate) && reviewCount < reviewRemaining) {
            reviewCount++;
          }
        }

        return { newCount, learningCount, reviewCount };
      },

      reviewWord: (wordId, grade, baseDate) => {
        const today = todayKey(baseDate);
        const current = get().progressByWordId[wordId] ?? createInitialProgress(baseDate);
        const currentState = resolveState(current);
        const next = scheduleNextReview(current, grade, baseDate);

        set((state) => {
          const stats = resolveStats(state.dailyStats, today);
          return {
            progressByWordId: {
              ...state.progressByWordId,
              [wordId]: next,
            },
            dailyStats: {
              date: today,
              newCardsSeen: currentState === 'new'
                ? stats.newCardsSeen + 1
                : stats.newCardsSeen,
              reviewsDone: currentState === 'review'
                ? stats.reviewsDone + 1
                : stats.reviewsDone,
            },
          };
        });
      },

      loadProgress: progress => set({ progressByWordId: progress }),

      resetAllProgress: () => set({ progressByWordId: {}, dailyStats: null }),
    }),
    {
      name: 'hsk-flashcards-store',
      storage: createJSONStorage(() => localStorage),
      version: 2,
    },
  ),
);

export const getDefaultDeck = () => hskWords;
