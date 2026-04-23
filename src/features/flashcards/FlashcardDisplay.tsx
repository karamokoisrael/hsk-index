'use client';

import type { HskWord } from '@/types/Hsk';

export const FlashcardDisplay = (props: {
  word: HskWord;
  isRevealed: boolean;
  onToggle: () => void;
  labels: {
    answer: string;
    example: string;
  };
  className?: string;
}) => {
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
        className={`relative min-h-96 cursor-pointer rounded-2xl border bg-gradient-to-br from-background via-background to-muted/30 shadow-lg transition-transform duration-500 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${props.isRevealed ? '[transform:rotateY(180deg)]' : ''}`}
      >
        <article className="absolute inset-0 flex items-center justify-center rounded-2xl p-6 [backface-visibility:hidden] sm:p-8">
          <div className="text-center text-6xl font-semibold sm:text-7xl">{props.word.word}</div>
        </article>

        <article className="absolute inset-0 flex h-full flex-col gap-4 overflow-hidden rounded-2xl border border-primary/20 bg-primary/5 p-6 [backface-visibility:hidden] [transform:rotateY(180deg)] sm:p-8">
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

          <div className="text-center text-xs text-muted-foreground">
            {props.word.parts_of_speech.length}
            {' '}
            meanings
          </div>
        </article>
      </div>
    </div>
  );
};