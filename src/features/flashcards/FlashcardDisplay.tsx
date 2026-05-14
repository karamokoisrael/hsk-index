'use client';

import { useEffect, useRef, useState } from 'react';

import type { CardState, HskWord } from '@/types/Hsk';

const STATE_GRADIENT: Record<CardState, string> = {
  new: 'from-blue-500/5 via-background to-blue-500/10',
  learning: 'from-red-500/5 via-background to-red-500/10',
  relearning: 'from-red-500/5 via-background to-red-500/10',
  review: 'from-green-500/5 via-background to-green-500/10',
};

const NEUTRAL_GRADIENT = 'from-background via-background to-muted/30';

export const FlashcardDisplay = (props: {
  word: HskWord;
  isRevealed: boolean;
  onToggle: () => void;
  total: number;
  cardState?: CardState;
  learningStep?: number;
  labels: {
    answer: string;
    example: string;
  };
  menuItems?: { label: string; onClick: () => void }[];
  className?: string;
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isGoodStep = props.cardState === 'learning' && (props.learningStep ?? 0) > 0;
  const gradient = props.cardState && !isGoodStep ? STATE_GRADIENT[props.cardState] : NEUTRAL_GRADIENT;

  useEffect(() => {
    if (!menuOpen) return;
    const handle = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [menuOpen]);

  // Close menu when card flips back
  useEffect(() => {
    if (!props.isRevealed) setMenuOpen(false);
  }, [props.isRevealed]);

  return (
    <div className={`mx-auto w-full max-w-2xl [perspective:1200px] ${props.className || ''}`}>
      <div
        role="button"
        tabIndex={0}
        aria-label={props.isRevealed ? 'Hide flashcard answer' : 'Reveal flashcard answer'}
        onClick={() => {
          if (menuOpen) { setMenuOpen(false); return; }
          props.onToggle();
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            props.onToggle();
          }
        }}
        style={{ transformStyle: 'preserve-3d' }}
        className={`relative min-h-96 cursor-pointer rounded-2xl border bg-gradient-to-br ${gradient} shadow-lg transition-transform duration-500 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${props.isRevealed ? '[transform:rotateY(180deg)]' : ''}`}
      >
        {/* Front face */}
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

        {/* Back face */}
        <article
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
          className="absolute inset-0 flex h-full flex-col gap-4 overflow-hidden rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8"
        >
          {/* Top bar: label + optional menu */}
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {props.labels.answer}
            </div>
            {props.menuItems && props.menuItems.length > 0 && (
              <div ref={menuRef} className="relative" onClick={e => e.stopPropagation()}>
                <button
                  type="button"
                  aria-label="Options"
                  className="rounded p-1.5 text-lg leading-none text-muted-foreground hover:bg-background/60 hover:text-foreground"
                  onClick={() => setMenuOpen(v => !v)}
                >
                  ⋮
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-8 z-20 min-w-48 rounded-md border bg-background shadow-lg">
                    {props.menuItems.map(item => (
                      <button
                        key={item.label}
                        type="button"
                        className="block w-full px-4 py-2.5 text-left text-sm hover:bg-muted"
                        onClick={() => {
                          item.onClick();
                          setMenuOpen(false);
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

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
            <span className="font-mono">
              {props.word.id}
              /
              {props.total}
            </span>
          </div>
        </article>
      </div>
    </div>
  );
};
