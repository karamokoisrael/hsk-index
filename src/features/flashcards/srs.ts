import type { CardState, FlashcardProgress, ReviewGrade } from '@/types/Hsk';

const MIN_EASE = 1.3;
const MAX_EASE = 3.0;

// Learning steps in minutes (new cards pass through these before graduating to review)
const LEARNING_STEPS_MIN = [1, 10];
// Relearning steps in minutes (review cards that lapse go here)
const RELEARN_STEPS_MIN = [10];

const GRADUATING_INTERVAL_DAYS = 1; // Good on last learning step → 1 day
const EASY_INTERVAL_DAYS = 4;       // Easy on any learning step → 4 days
const HARD_MULTIPLIER = 1.2;
const EASY_BONUS = 1.3;

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

// Infer state for cards persisted before the state field existed
export function resolveState(progress: FlashcardProgress): CardState {
  if (progress.state) {
    return progress.state;
  }
  return progress.repetitions === 0 && progress.interval === 0 ? 'new' : 'review';
}

export const createInitialProgress = (baseDate: Date): FlashcardProgress => ({
  ease: 2.5,
  interval: 0,
  repetitions: 0,
  dueAt: baseDate.toISOString(),
  lapses: 0,
  state: 'new',
  learningStep: 0,
});

export const isDue = (progress: FlashcardProgress, baseDate: Date): boolean =>
  new Date(progress.dueAt).getTime() <= baseDate.getTime();

// Returns the interval string shown above each grade button, e.g. "<1m", "10m", "3d"
export function getNextIntervalLabel(
  progress: FlashcardProgress,
  grade: ReviewGrade,
): string {
  const state = resolveState(progress);
  const step = progress.learningStep ?? 0;

  if (state === 'new') {
    if (grade === 'again' || grade === 'hard') {
      return `<${LEARNING_STEPS_MIN[0]}m`;
    }
    if (grade === 'good') {
      return LEARNING_STEPS_MIN.length > 1
        ? `<${LEARNING_STEPS_MIN[1]}m`
        : `${GRADUATING_INTERVAL_DAYS}d`;
    }
    // easy
    return `${EASY_INTERVAL_DAYS}d`;
  }

  if (state === 'learning') {
    if (grade === 'again') {
      return `<${LEARNING_STEPS_MIN[0]}m`;
    }
    if (grade === 'hard') {
      return `<${LEARNING_STEPS_MIN[step] ?? LEARNING_STEPS_MIN[0]}m`;
    }
    if (grade === 'good') {
      const next = step + 1;
      return next >= LEARNING_STEPS_MIN.length
        ? `${GRADUATING_INTERVAL_DAYS}d`
        : `<${LEARNING_STEPS_MIN[next]}m`;
    }
    // easy
    return `${EASY_INTERVAL_DAYS}d`;
  }

  if (state === 'relearning') {
    if (grade === 'again') {
      return `<${RELEARN_STEPS_MIN[0]}m`;
    }
    if (grade === 'hard') {
      return `<${RELEARN_STEPS_MIN[Math.min(step, RELEARN_STEPS_MIN.length - 1)]}m`;
    }
    // good or easy → graduate back to review
    return `${Math.max(1, progress.interval)}d`;
  }

  // review state
  const ease = progress.ease;
  const interval = Math.max(1, progress.interval);

  if (grade === 'again') {
    return `<${RELEARN_STEPS_MIN[0]}m`;
  }
  if (grade === 'hard') {
    return `${Math.max(1, Math.round(interval * HARD_MULTIPLIER))}d`;
  }
  if (grade === 'good') {
    return `${Math.max(1, Math.round(interval * ease))}d`;
  }
  // easy
  return `${Math.max(1, Math.round(interval * ease * EASY_BONUS))}d`;
}

export const scheduleNextReview = (
  progress: FlashcardProgress,
  grade: ReviewGrade,
  baseDate: Date,
): FlashcardProgress => {
  const state = resolveState(progress);
  const step = progress.learningStep ?? 0;

  let nextEase = progress.ease;
  let nextInterval = progress.interval;
  let nextReps = progress.repetitions;
  let nextLapses = progress.lapses;
  let nextState: CardState = state;
  let nextStep = step;
  let nextDue: Date;

  // ── New ──────────────────────────────────────────────────────────────────
  if (state === 'new') {
    if (grade === 'again' || grade === 'hard') {
      nextState = 'learning';
      nextStep = 0;
      nextDue = addMinutes(baseDate, LEARNING_STEPS_MIN[0]!);
    } else if (grade === 'good') {
      if (LEARNING_STEPS_MIN.length > 1) {
        nextState = 'learning';
        nextStep = 1;
        nextDue = addMinutes(baseDate, LEARNING_STEPS_MIN[1]!);
      } else {
        nextState = 'review';
        nextInterval = GRADUATING_INTERVAL_DAYS;
        nextReps += 1;
        nextDue = addDays(baseDate, GRADUATING_INTERVAL_DAYS);
      }
    } else {
      // easy
      nextState = 'review';
      nextInterval = EASY_INTERVAL_DAYS;
      nextReps += 1;
      nextDue = addDays(baseDate, EASY_INTERVAL_DAYS);
    }

  // ── Learning ─────────────────────────────────────────────────────────────
  } else if (state === 'learning') {
    if (grade === 'again') {
      nextStep = 0;
      nextDue = addMinutes(baseDate, LEARNING_STEPS_MIN[0]!);
    } else if (grade === 'hard') {
      nextStep = step;
      nextDue = addMinutes(baseDate, LEARNING_STEPS_MIN[step] ?? LEARNING_STEPS_MIN[0]!);
    } else if (grade === 'good') {
      const nextStepIdx = step + 1;
      if (nextStepIdx >= LEARNING_STEPS_MIN.length) {
        nextState = 'review';
        nextInterval = GRADUATING_INTERVAL_DAYS;
        nextReps += 1;
        nextDue = addDays(baseDate, GRADUATING_INTERVAL_DAYS);
      } else {
        nextStep = nextStepIdx;
        nextDue = addMinutes(baseDate, LEARNING_STEPS_MIN[nextStepIdx]!);
      }
    } else {
      // easy
      nextState = 'review';
      nextInterval = EASY_INTERVAL_DAYS;
      nextReps += 1;
      nextDue = addDays(baseDate, EASY_INTERVAL_DAYS);
    }

  // ── Relearning ───────────────────────────────────────────────────────────
  } else if (state === 'relearning') {
    if (grade === 'again') {
      nextStep = 0;
      nextDue = addMinutes(baseDate, RELEARN_STEPS_MIN[0]!);
    } else if (grade === 'hard') {
      nextStep = Math.min(step, RELEARN_STEPS_MIN.length - 1);
      nextDue = addMinutes(baseDate, RELEARN_STEPS_MIN[nextStep]!);
    } else {
      // good or easy → graduate back to review
      nextState = 'review';
      nextInterval = Math.max(1, progress.interval);
      nextReps += 1;
      nextDue = addDays(baseDate, nextInterval);
    }

  // ── Review ───────────────────────────────────────────────────────────────
  } else {
    if (grade === 'again') {
      nextState = 'relearning';
      nextStep = 0;
      nextEase = Math.max(MIN_EASE, progress.ease - 0.2);
      nextLapses += 1;
      nextDue = addMinutes(baseDate, RELEARN_STEPS_MIN[0]!);
    } else if (grade === 'hard') {
      nextState = 'review';
      nextEase = Math.max(MIN_EASE, progress.ease - 0.15);
      nextInterval = Math.max(1, Math.round(progress.interval * HARD_MULTIPLIER));
      nextReps += 1;
      nextDue = addDays(baseDate, nextInterval);
    } else if (grade === 'good') {
      nextState = 'review';
      nextInterval = Math.max(1, Math.round(progress.interval * progress.ease));
      nextReps += 1;
      nextDue = addDays(baseDate, nextInterval);
    } else {
      // easy
      nextState = 'review';
      nextEase = Math.min(MAX_EASE, progress.ease + 0.15);
      nextInterval = Math.max(1, Math.round(progress.interval * progress.ease * EASY_BONUS));
      nextReps += 1;
      nextDue = addDays(baseDate, nextInterval);
    }
  }

  return {
    ease: nextEase,
    interval: nextInterval,
    repetitions: nextReps,
    dueAt: nextDue.toISOString(),
    lastReviewedAt: baseDate.toISOString(),
    lapses: nextLapses,
    state: nextState,
    learningStep: nextStep,
  };
};
