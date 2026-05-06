export const HSK_LEVELS = [1, 2, 3, 4] as const;
export type HskLevel = typeof HSK_LEVELS[number];

export const HSK_LEVEL_MAX_ID: Record<HskLevel, number> = {
  1: 150,
  2: 300,
  3: 600,
  4: 1200,
};

