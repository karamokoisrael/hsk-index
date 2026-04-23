'use client';

import { useState } from 'react';

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

  const promptMode = useFlashcardsStore(state => state.promptMode);
  const setPromptMode = useFlashcardsStore(state => state.setPromptMode);
  const dueWords = useFlashcardsStore(state => state.getDueWords(hskWords, new Date()));
  const reviewWord = useFlashcardsStore(state => state.reviewWord);
  const resetAllProgress = useFlashcardsStore(state => state.resetAllProgress);

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

  const prompt = promptMode === 'word-to-meaning'
    ? currentWord.word
    : getPrimaryMeaning(currentWord);

  const answer = promptMode === 'word-to-meaning'
    ? getPrimaryMeaning(currentWord)
    : currentWord.word;

  return (
    <div className="space-y-4 rounded-md border bg-background p-5">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <span>{props.labels.dueCards}: {dueWords.length}</span>
        <span>{props.labels.studiedCards}: {sessionReviews}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={promptMode === 'word-to-meaning' ? 'default' : 'outline'}
          onClick={() => {
            setPromptMode('word-to-meaning');
            setIsRevealed(false);
          }}
        >
          {props.labels.showPromptWord}
        </Button>

        <Button
          type="button"
          variant={promptMode === 'meaning-to-word' ? 'default' : 'outline'}
          onClick={() => {
            setPromptMode('meaning-to-word');
            setIsRevealed(false);
          }}
        >
          {props.labels.showPromptMeaning}
        </Button>
      </div>

      <div className="rounded-md border border-dashed p-6">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{props.labels.prompt}</div>
        <div className="mt-2 text-3xl font-semibold">{prompt}</div>
        <div className="mt-2 text-sm text-muted-foreground">{currentWord.pinyin}</div>
      </div>

      {!isRevealed && (
        <Button type="button" onClick={() => setIsRevealed(true)}>
          {props.labels.revealAnswer}
        </Button>
      )}

      {isRevealed && (
        <>
          <div className="rounded-md border bg-muted/40 p-4">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">{props.labels.answer}</div>
            <div className="mt-2 text-xl font-semibold">{answer}</div>
            <div className="mt-2 text-sm text-muted-foreground">{props.labels.example}: {getPrimaryExample(currentWord)}</div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reviewWord(currentWord.id, 'again', new Date());
                setSessionReviews(sessionReviews + 1);
                setIsRevealed(false);
              }}
            >
              {props.labels.gradeAgain}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reviewWord(currentWord.id, 'hard', new Date());
                setSessionReviews(sessionReviews + 1);
                setIsRevealed(false);
              }}
            >
              {props.labels.gradeHard}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reviewWord(currentWord.id, 'good', new Date());
                setSessionReviews(sessionReviews + 1);
                setIsRevealed(false);
              }}
            >
              {props.labels.gradeGood}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reviewWord(currentWord.id, 'easy', new Date());
                setSessionReviews(sessionReviews + 1);
                setIsRevealed(false);
              }}
            >
              {props.labels.gradeEasy}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
