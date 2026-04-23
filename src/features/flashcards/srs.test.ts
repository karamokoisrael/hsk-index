import { describe, expect, it } from 'vitest';

import { createInitialProgress, isDue, scheduleNextReview } from './srs';

describe('createInitialProgress', () => {
  it('creates default SRS values', () => {
    const now = new Date('2026-01-01T00:00:00.000Z');
    const progress = createInitialProgress(now);

    expect(progress.ease).toBe(2.5);
    expect(progress.interval).toBe(0);
    expect(progress.repetitions).toBe(0);
    expect(progress.lapses).toBe(0);
    expect(progress.dueAt).toBe(now.toISOString());
  });
});

describe('scheduleNextReview', () => {
  it('resets repetitions and schedules tomorrow for again grade', () => {
    const now = new Date('2026-01-01T00:00:00.000Z');
    const current = {
      ease: 2.5,
      interval: 6,
      repetitions: 3,
      dueAt: now.toISOString(),
      lapses: 0,
    };

    const next = scheduleNextReview(current, 'again', now);

    expect(next.repetitions).toBe(0);
    expect(next.interval).toBe(1);
    expect(next.ease).toBe(2.3);
    expect(next.lapses).toBe(1);
  });

  it('increases interval for good grade', () => {
    const now = new Date('2026-01-01T00:00:00.000Z');
    const current = {
      ease: 2.5,
      interval: 3,
      repetitions: 2,
      dueAt: now.toISOString(),
      lapses: 0,
    };

    const next = scheduleNextReview(current, 'good', now);

    expect(next.repetitions).toBe(3);
    expect(next.interval).toBe(8);
    expect(next.ease).toBe(2.5);
  });
});

describe('isDue', () => {
  it('returns true when dueAt is in the past', () => {
    const now = new Date('2026-01-02T00:00:00.000Z');
    const progress = createInitialProgress(new Date('2026-01-01T00:00:00.000Z'));

    expect(isDue(progress, now)).toBe(true);
  });
});
