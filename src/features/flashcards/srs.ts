import type { FlashcardProgress, ReviewGrade } from '@/types/Hsk';

const MIN_EASE = 1.3;

const addDays = (baseDate: Date, days: number) => {
  const dueDate = new Date(baseDate);
  dueDate.setDate(dueDate.getDate() + days);
  return dueDate;
};

export const createInitialProgress = (baseDate: Date): FlashcardProgress => {
  return {
    ease: 2.5,
    interval: 0,
    repetitions: 0,
    dueAt: baseDate.toISOString(),
    lapses: 0,
  };
};

export const isDue = (progress: FlashcardProgress, baseDate: Date) => {
  const dueAt = new Date(progress.dueAt);
  return dueAt.getTime() <= baseDate.getTime();
};

export const scheduleNextReview = (
  progress: FlashcardProgress,
  grade: ReviewGrade,
  baseDate: Date,
): FlashcardProgress => {
  let nextEase = progress.ease;
  let nextInterval = progress.interval;
  let nextRepetitions = progress.repetitions;
  let nextLapses = progress.lapses;

  if (grade === 'again') {
    nextEase = Math.max(MIN_EASE, progress.ease - 0.2);
    nextInterval = 1;
    nextRepetitions = 0;
    nextLapses += 1;
  }

  if (grade === 'hard') {
    nextEase = Math.max(MIN_EASE, progress.ease - 0.15);
    nextRepetitions += 1;
    if (progress.repetitions <= 1) {
      nextInterval = 2;
    } else {
      nextInterval = Math.max(1, Math.round(progress.interval * 1.2));
    }
  }

  if (grade === 'good') {
    nextEase = progress.ease;
    nextRepetitions += 1;
    if (progress.repetitions === 0) {
      nextInterval = 1;
    } else if (progress.repetitions === 1) {
      nextInterval = 3;
    } else {
      nextInterval = Math.max(1, Math.round(progress.interval * progress.ease));
    }
  }

  if (grade === 'easy') {
    nextEase = Math.max(MIN_EASE, progress.ease + 0.15);
    nextRepetitions += 1;
    if (progress.repetitions === 0) {
      nextInterval = 4;
    } else {
      nextInterval = Math.max(
        1,
        Math.round(progress.interval * progress.ease * 1.3),
      );
    }
  }

  return {
    ease: nextEase,
    interval: nextInterval,
    repetitions: nextRepetitions,
    dueAt: addDays(baseDate, nextInterval).toISOString(),
    lastReviewedAt: baseDate.toISOString(),
    lapses: nextLapses,
  };
};
