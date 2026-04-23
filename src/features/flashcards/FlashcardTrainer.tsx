'use client';

import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { hskWords } from '@/data/hskWords';
import { FlashcardDisplay } from '@/features/flashcards/FlashcardDisplay';
import { getNextIntervalLabel } from '@/features/flashcards/srs';
import { useFlashcardSync } from '@/hooks/useFlashcardSync';
import { useFlashcardsStore } from '@/stores/useFlashcardsStore';
import type { ReviewGrade } from '@/types/Hsk';

const GRADES: ReviewGrade[] = ['again', 'hard', 'good', 'easy'];

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
    options: string;
    maxNewPerDay: string;
    maxReviewsPerDay: string;
    saveOptions: string;
  };
}) => {
  useFlashcardSync();

  const [isRevealed, setIsRevealed] = useState(false);
  const [sessionReviews, setSessionReviews] = useState(0);
  const [showOptions, setShowOptions] = useState(false);

  const progressByWordId = useFlashcardsStore(s => s.progressByWordId);
  const getDueWords = useFlashcardsStore(s => s.getDueWords);
  const getDeckStats = useFlashcardsStore(s => s.getDeckStats);
  const getProgress = useFlashcardsStore(s => s.getProgress);
  const reviewWord = useFlashcardsStore(s => s.reviewWord);
  const resetAllProgress = useFlashcardsStore(s => s.resetAllProgress);
  const maxNewPerDay = useFlashcardsStore(s => s.maxNewPerDay);
  const maxReviewsPerDay = useFlashcardsStore(s => s.maxReviewsPerDay);
  const setLimits = useFlashcardsStore(s => s.setLimits);

  const [draftNew, setDraftNew] = useState(maxNewPerDay);
  const [draftReviews, setDraftReviews] = useState(maxReviewsPerDay);

  const now = new Date();

  const dueWords = useMemo(() => {
    void progressByWordId;
    return getDueWords(hskWords, now);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getDueWords, progressByWordId]);

  const stats = useMemo(() => {
    void progressByWordId;
    return getDeckStats(hskWords, now);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getDeckStats, progressByWordId]);

  const currentWord = dueWords[0];
  const currentProgress = currentWord ? getProgress(currentWord.id) : null;

  const gradeLabel: Record<ReviewGrade, string> = {
    again: props.labels.gradeAgain,
    hard: props.labels.gradeHard,
    good: props.labels.gradeGood,
    easy: props.labels.gradeEasy,
  };

  const handleGrade = (grade: ReviewGrade) => {
    if (!currentWord) {
      return;
    }
    reviewWord(currentWord.id, grade, new Date());
    setSessionReviews(n => n + 1);
    setIsRevealed(false);
  };

  const handleSaveOptions = () => {
    setLimits(
      Math.max(1, Math.min(9999, draftNew)),
      Math.max(1, Math.min(9999, draftReviews)),
    );
    setShowOptions(false);
  };

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
    <div className="space-y-4 rounded-xl border bg-background/95 p-5 sm:p-6">

      {/* ── Stats bar ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-sm font-semibold tabular-nums">
          <span className="text-blue-500">{stats.newCount}</span>
          <span className="text-muted-foreground">+</span>
          <span className="text-red-500">{stats.learningCount}</span>
          <span className="text-muted-foreground">+</span>
          <span className="text-green-600">{stats.reviewCount}</span>
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            ({props.labels.studiedCards}: {sessionReviews})
          </span>
        </div>

        <Button
          type="button"
          variant={showOptions ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setDraftNew(maxNewPerDay);
            setDraftReviews(maxReviewsPerDay);
            setShowOptions(v => !v);
          }}
        >
          {props.labels.options}
        </Button>
      </div>

      {/* ── Options panel ──────────────────────────────────────────────── */}
      {showOptions && (
        <div className="grid gap-3 rounded-md border bg-muted/30 p-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="max-new">{props.labels.maxNewPerDay}</Label>
            <Input
              id="max-new"
              type="number"
              min={1}
              max={9999}
              value={draftNew}
              onChange={e => setDraftNew(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="max-reviews">{props.labels.maxReviewsPerDay}</Label>
            <Input
              id="max-reviews"
              type="number"
              min={1}
              max={9999}
              value={draftReviews}
              onChange={e => setDraftReviews(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="sm:col-span-2">
            <Button type="button" size="sm" onClick={handleSaveOptions}>
              {props.labels.saveOptions}
            </Button>
          </div>
        </div>
      )}

      {/* ── Card ───────────────────────────────────────────────────────── */}
      <FlashcardDisplay
        word={currentWord}
        total={hskWords.length}
        isRevealed={isRevealed}
        onToggle={() => setIsRevealed(p => !p)}
        labels={{
          answer: props.labels.answer,
          example: props.labels.example,
        }}
      />

      {/* ── Reveal button ──────────────────────────────────────────────── */}
      {!isRevealed && (
        <div className="flex justify-center">
          <Button type="button" size="lg" onClick={() => setIsRevealed(true)}>
            {props.labels.revealAnswer}
          </Button>
        </div>
      )}

      {/* ── Grade buttons with interval labels ─────────────────────────── */}
      {isRevealed && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          {GRADES.map(grade => (
            <div key={grade} className="flex flex-col items-center gap-1">
              <span className="text-xs text-muted-foreground">
                {currentProgress ? getNextIntervalLabel(currentProgress, grade) : ''}
              </span>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => handleGrade(grade)}
              >
                {gradeLabel[grade]}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
