'use client';

import type { CardState, HskWord } from '@/types/Hsk';

const STATE_GRADIENT: Record<CardState, string> = {
  new: 'from-blue-500/5 via-background to-blue-500/10',
  learning: 'from-red-500/5 via-background to-red-500/10',
  relearning: 'from-red-500/5 via-background to-red-500/10',
  review: 'from-green-500/5 via-background to-green-500/10',
};

export const FlashcardDisplay = (props: {
  word: HskWord;
  isRevealed: boolean;
  onToggle: () => void;
  total: number;
  cardState?: CardState;
  labels: {
    answer: string;
    example: string;
  };
  className?: string;
}) => {
  const gradient = props.cardState ? STATE_GRADIENT[props.cardState] : 'from-background via-background to-muted/30';

  return (
    <div className={`mx-auto w-full max-w-2xl [perspective:1200px] ${props.className || ''}`}>
      <div
        role="button"
        tabIndex={0}
        aria-label={props.isRevealed ? 'Hide flashcard answer' : 'Reveal flashcard answer'}
        onClick={props.onToggle}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            props.onToggle();
          }
        }}
        style={{ transformStyle: 'preserve-3d' }}
        className={`relative min-h-96 cursor-pointer rounded-2xl border bg-gradient-to-br ${gradient} shadow-lg transition-transform duration-500 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${props.isRevealed ? '[transform:rotateY(180deg)]' : ''}`}
      >
        <article
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            visibility: props.isRevealed ? 'hidden' : 'visible',
          }}
          className="absolute inset-0 flex items-center justify-center rounded-2xl p-6 sm:p-8"
        >
          <div className="text-center text-6xl font-semibold sm:text-7xl">{props.word.word}</div>
        </article>

        <article
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
          className="absolute inset-0 flex h-full flex-col gap-4 overflow-hidden rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8"
        >
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{props.labels.answer}</div>

          <div className="space-y-3 text-center">
            <div className="text-3xl font-semibold sm:text-4xl">{props.word.word}</div>
            <div className="text-base text-muted-foreground sm:text-lg">{props.word.pinyin}</div>
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1 text-left">
            {props.word.parts_of_speech.map(part => (
              <div key={`${props.word.id}-${part.part_of_speech}-${part.meaning}-${part.example}`} className="rounded-lg bg-background/80 px-4 py-3">
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {part.part_of_speech}
                </div>
                <div className="text-lg font-semibold leading-snug text-foreground">{part.meaning}</div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {props.labels.example}
                  :
                  {' '}
                  {part.example}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {props.word.parts_of_speech.length}
              {' '}
              meanings
            </span>
            <span className="font-mono">{props.word.id}/{props.total}</span>
          </div>
        </article>
      </div>
    </div>
  );
};