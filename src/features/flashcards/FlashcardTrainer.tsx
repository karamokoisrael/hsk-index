'use client';

import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { getPrimaryExample, getPrimaryMeaning, hskWords } from '@/data/hskWords';
import { useFlashcardsStore } from '@/stores/useFlashcardsStore';

export const FlashcardTrainer = (props: {
  labels: {
    dueCards: string;
    studiedCards: string;
    noCardsTitle: string;
    noCardsDescription: string;
    revealAnswer: string;
    prompt: string;
    showPromptWord: string;
    showPromptMeaning: string;
    answer: string;
    example: string;
    resetProgress: string;
    gradeAgain: string;
    gradeHard: string;
    gradeGood: string;
    gradeEasy: string;
  };
}) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [sessionReviews, setSessionReviews] = useState(0);

  const progressByWordId = useFlashcardsStore(state => state.progressByWordId);
  const getDueWords = useFlashcardsStore(state => state.getDueWords);
  const reviewWord = useFlashcardsStore(state => state.reviewWord);
  const resetAllProgress = useFlashcardsStore(state => state.resetAllProgress);

  const dueWords = useMemo(
    () => getDueWords(hskWords, new Date()),
    [getDueWords, progressByWordId],
  );

  const currentWord = dueWords[0];

  if (!currentWord) {
    return (
      <div className="space-y-4 rounded-md border bg-background p-5">
        <div className="text-lg font-semibold">{props.labels.noCardsTitle}</div>
        <p className="text-sm text-muted-foreground">{props.labels.noCardsDescription}</p>

        <Button type="button" variant="outline" onClick={resetAllProgress}>
          {props.labels.resetProgress}
        </Button>
      </div>
    );
  }

  const answer = getPrimaryMeaning(currentWord);

  return (
    <div className="space-y-6 rounded-xl border bg-background/95 p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="rounded-full border bg-muted/40 px-3 py-1 text-muted-foreground">
          {props.labels.dueCards}
          :
          {' '}
          {dueWords.length}
        </span>
        <span className="rounded-full border bg-muted/40 px-3 py-1 text-muted-foreground">
          {props.labels.studiedCards}
          :
          {' '}
          {sessionReviews}
        </span>
      </div>

      <div className="mx-auto w-full max-w-2xl [perspective:1200px]">
        <div
          role="button"
          tabIndex={0}
          aria-label={isRevealed ? 'Hide flashcard answer' : 'Reveal flashcard answer'}
          onClick={() => setIsRevealed(previous => !previous)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              setIsRevealed(previous => !previous);
            }
          }}
          className={`relative min-h-[20rem] cursor-pointer rounded-2xl border bg-gradient-to-br from-background via-background to-muted/30 shadow-lg transition-transform duration-500 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary [transform-style:preserve-3d] ${isRevealed ? '[transform:rotateY(180deg)]' : ''}`}
        >
          <article className="absolute inset-0 flex items-center justify-center rounded-2xl p-6 [backface-visibility:hidden] sm:p-8">
            <div className="text-center text-6xl font-semibold sm:text-7xl">{currentWord.word}</div>
          </article>

          <article className="absolute inset-0 flex flex-col justify-between rounded-2xl border border-primary/20 bg-primary/5 p-6 [backface-visibility:hidden] [transform:rotateY(180deg)] sm:p-8">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{props.labels.answer}</div>

            <div className="space-y-4 text-center">
              <div className="text-2xl font-medium text-muted-foreground sm:text-3xl">{currentWord.word}</div>
              <div className="text-4xl font-semibold sm:text-5xl">{answer}</div>
              <div className="rounded-lg bg-background/80 px-4 py-3 text-left text-sm text-muted-foreground">
                {props.labels.example}
                :
                {' '}
                {getPrimaryExample(currentWord)}
              </div>
            </div>

            <div className="text-center text-xs text-muted-foreground">{currentWord.pinyin}</div>
          </article>
        </div>
      </div>

      {!isRevealed && (
        <div className="flex justify-center">
          <Button type="button" size="lg" onClick={() => setIsRevealed(true)}>
            {props.labels.revealAnswer}
          </Button>
        </div>
      )}

      {isRevealed && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              reviewWord(currentWord.id, 'again', new Date());
              setSessionReviews(previous => previous + 1);
              setIsRevealed(false);
            }}
          >
            {props.labels.gradeAgain}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              reviewWord(currentWord.id, 'hard', new Date());
              setSessionReviews(previous => previous + 1);
              setIsRevealed(false);
            }}
          >
            {props.labels.gradeHard}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              reviewWord(currentWord.id, 'good', new Date());
              setSessionReviews(previous => previous + 1);
              setIsRevealed(false);
            }}
          >
            {props.labels.gradeGood}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              reviewWord(currentWord.id, 'easy', new Date());
              setSessionReviews(previous => previous + 1);
              setIsRevealed(false);
            }}
          >
            {props.labels.gradeEasy}
          </Button>
        </div>
      )}
    </div>
  );
};
