import { describe, expect, it } from 'vitest';

import { createInitialProgress, getNextIntervalLabel, isDue, scheduleNextReview } from './srs';

const T = new Date('2026-01-01T10:00:00.000Z');

describe('createInitialProgress', () => {
  it('creates a new card with correct defaults', () => {
    const p = createInitialProgress(T);
    expect(p.ease).toBe(2.5);
    expect(p.interval).toBe(0);
    expect(p.repetitions).toBe(0);
    expect(p.lapses).toBe(0);
    expect(p.state).toBe('new');
    expect(p.learningStep).toBe(0);
    expect(p.dueAt).toBe(T.toISOString());
  });
});

describe('isDue', () => {
  it('returns true when dueAt is in the past', () => {
    const p = createInitialProgress(new Date('2026-01-01T00:00:00.000Z'));
    expect(isDue(p, T)).toBe(true);
  });

  it('returns false when dueAt is in the future', () => {
    const future = new Date('2026-01-10T00:00:00.000Z');
    const p = createInitialProgress(future);
    expect(isDue(p, T)).toBe(false);
  });
});

describe('scheduleNextReview — new card', () => {
  const newCard = createInitialProgress(T);

  it('again → learning step 0, due in 1 minute', () => {
    const next = scheduleNextReview(newCard, 'again', T);
    expect(next.state).toBe('learning');
    expect(next.learningStep).toBe(0);
    const expectedDue = new Date(T.getTime() + 1 * 60 * 1000);
    expect(next.dueAt).toBe(expectedDue.toISOString());
  });

  it('hard → same as again for a new card', () => {
    const next = scheduleNextReview(newCard, 'hard', T);
    expect(next.state).toBe('learning');
    expect(next.learningStep).toBe(0);
  });

  it('good → learning step 1, due in 10 minutes', () => {
    const next = scheduleNextReview(newCard, 'good', T);
    expect(next.state).toBe('learning');
    expect(next.learningStep).toBe(1);
    const expectedDue = new Date(T.getTime() + 10 * 60 * 1000);
    expect(next.dueAt).toBe(expectedDue.toISOString());
  });

  it('easy → graduates directly to review, 4-day interval', () => {
    const next = scheduleNextReview(newCard, 'easy', T);
    expect(next.state).toBe('review');
    expect(next.interval).toBe(4);
    expect(next.repetitions).toBe(1);
  });
});

describe('scheduleNextReview — learning card', () => {
  const atStep0: typeof createInitialProgress extends (d: Date) => infer R ? R : never = {
    ease: 2.5, interval: 0, repetitions: 0, lapses: 0,
    dueAt: T.toISOString(), state: 'learning', learningStep: 0,
  };

  const atStep1 = { ...atStep0, learningStep: 1 };

  it('again on step 0 → stays at step 0', () => {
    const next = scheduleNextReview(atStep0, 'again', T);
    expect(next.state).toBe('learning');
    expect(next.learningStep).toBe(0);
  });

  it('hard on step 0 → stays at step 0', () => {
    const next = scheduleNextReview(atStep0, 'hard', T);
    expect(next.state).toBe('learning');
    expect(next.learningStep).toBe(0);
  });

  it('good on step 0 → advances to step 1', () => {
    const next = scheduleNextReview(atStep0, 'good', T);
    expect(next.state).toBe('learning');
    expect(next.learningStep).toBe(1);
  });

  it('good on last step → graduates to review with 1-day interval', () => {
    const next = scheduleNextReview(atStep1, 'good', T);
    expect(next.state).toBe('review');
    expect(next.interval).toBe(1);
    expect(next.repetitions).toBe(1);
  });

  it('easy on any learning step → graduates to review with 4-day interval', () => {
    const next = scheduleNextReview(atStep0, 'easy', T);
    expect(next.state).toBe('review');
    expect(next.interval).toBe(4);
  });
});

describe('scheduleNextReview — review card', () => {
  const reviewCard = {
    ease: 2.5, interval: 6, repetitions: 3, lapses: 0,
    dueAt: T.toISOString(), state: 'review' as const, learningStep: 0,
  };

  it('again → moves to relearning, ease decreases, lapse increments', () => {
    const next = scheduleNextReview(reviewCard, 'again', T);
    expect(next.state).toBe('relearning');
    expect(next.learningStep).toBe(0);
    expect(next.ease).toBeCloseTo(2.3);
    expect(next.lapses).toBe(1);
    // due in relearn step (10 min)
    const expectedDue = new Date(T.getTime() + 10 * 60 * 1000);
    expect(next.dueAt).toBe(expectedDue.toISOString());
  });

  it('hard → ease decreases, interval = interval × 1.2', () => {
    const next = scheduleNextReview(reviewCard, 'hard', T);
    expect(next.state).toBe('review');
    expect(next.ease).toBeCloseTo(2.35);
    expect(next.interval).toBe(7); // round(6 * 1.2) = 7
  });

  it('good → interval = interval × ease', () => {
    const next = scheduleNextReview(reviewCard, 'good', T);
    expect(next.state).toBe('review');
    expect(next.interval).toBe(15); // round(6 * 2.5) = 15
    expect(next.ease).toBe(2.5); // unchanged
  });

  it('easy → ease increases, interval = interval × ease × 1.3', () => {
    const next = scheduleNextReview(reviewCard, 'easy', T);
    expect(next.state).toBe('review');
    expect(next.ease).toBeCloseTo(2.65);
    expect(next.interval).toBe(20); // round(6 * 2.5 * 1.3) = 20 (19.5 → 20)
  });
});

describe('scheduleNextReview — relearning card', () => {
  const relearningCard = {
    ease: 2.3, interval: 6, repetitions: 3, lapses: 1,
    dueAt: T.toISOString(), state: 'relearning' as const, learningStep: 0,
  };

  it('good → graduates back to review with previous interval', () => {
    const next = scheduleNextReview(relearningCard, 'good', T);
    expect(next.state).toBe('review');
    expect(next.interval).toBe(6);
  });

  it('again → stays in relearning at step 0', () => {
    const next = scheduleNextReview(relearningCard, 'again', T);
    expect(next.state).toBe('relearning');
    expect(next.learningStep).toBe(0);
  });
});

describe('getNextIntervalLabel', () => {
  it('new card + again → <1m', () => {
    expect(getNextIntervalLabel(createInitialProgress(T), 'again')).toBe('<1m');
  });

  it('new card + good → <10m', () => {
    expect(getNextIntervalLabel(createInitialProgress(T), 'good')).toBe('<10m');
  });

  it('new card + easy → 4d', () => {
    expect(getNextIntervalLabel(createInitialProgress(T), 'easy')).toBe('4d');
  });

  it('review card + good with 6-day interval → 15d', () => {
    const p = { ease: 2.5, interval: 6, repetitions: 3, lapses: 0, dueAt: T.toISOString(), state: 'review' as const, learningStep: 0 };
    expect(getNextIntervalLabel(p, 'good')).toBe('15d');
  });
});
