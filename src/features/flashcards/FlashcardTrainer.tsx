'use client';

import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { hskWords } from '@/data/hskWords';
import { FlashcardDisplay } from '@/features/flashcards/FlashcardDisplay';
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

  const dueWords = useMemo(() => {
    void progressByWordId;
    return getDueWords(hskWords, new Date());
  }, [getDueWords, progressByWordId]);

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

      <FlashcardDisplay
        word={currentWord}
        isRevealed={isRevealed}
        onToggle={() => setIsRevealed(previous => !previous)}
        labels={{
          answer: props.labels.answer,
          example: props.labels.example,
        }}
      />

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
