'use client';

import { HSK_LEVEL_MAX_ID, HSK_LEVELS, type HskLevel } from '@/libs/constants/hskLevels';

export const HskLevelSelector = (props: {
  currentLevel: HskLevel;
  onSelect: (level: HskLevel) => void;
  labels: {
    totalWords: string;
    newWords: string;
  };
}) => (
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
    {HSK_LEVELS.map(level => {
      const isActive = props.currentLevel === level;
      return (
        <button
          key={level}
          type="button"
          onClick={() => props.onSelect(level)}
          className={`rounded-lg border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
            isActive
              ? 'border-primary bg-primary/10 ring-2 ring-primary'
              : 'border-border bg-background hover:bg-muted/50'
          }`}
        >
          <div className="font-semibold">HSK {level}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            {HSK_LEVEL_MAX_ID[level]}
            {' '}
            {props.labels.totalWords}
          </div>
          <div className="text-xs text-muted-foreground">
            +
            {HSK_LEVEL_MAX_ID[level] - (level > 1 ? HSK_LEVEL_MAX_ID[(level - 1) as HskLevel] : 0)}
            {' '}
            {props.labels.newWords}
          </div>
        </button>
      );
    })}
  </div>
);
