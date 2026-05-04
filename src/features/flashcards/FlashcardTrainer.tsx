'use client';

import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HSK_LEVEL_MAX_ID } from '@/libs/constants/hskLevels';
import { hskWords } from '@/libs/services/hskWords';
import { FlashcardDisplay } from '@/features/flashcards/FlashcardDisplay';
import { getNextIntervalLabel, resolveState, scheduleNextReview } from '@/features/flashcards/srs';
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
    gradeAgain: string;
    gradeHard: string;
    gradeGood: string;
    gradeEasy: string;
    options: string;
    maxNewPerDay: string;
    maxReviewsPerDay: string;
    saveOptions: string;
    addMoreCards: string;
    hskLevelCurrent: string;
    hskLevelChange: string;
  };
}) => {
  useFlashcardSync();

  const [isMounted, setIsMounted] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [sessionReviews, setSessionReviews] = useState(0);
  const [showOptions, setShowOptions] = useState(false);
  const [now, setNow] = useState(() => new Date());

  // Explicit session queue: word IDs in study order.
  // null = not yet initialized (waiting for mount + store hydration).
  const [sessionQueue, setSessionQueue] = useState<number[] | null>(null);
  // Cards in a learning step that will reappear mid-session once their timer elapses.
  const [, setPendingRequeue] = useState<{ wordId: number; dueAt: number }[]>([]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const progressByWordId = useFlashcardsStore(s => s.progressByWordId);
  const getDueWords = useFlashcardsStore(s => s.getDueWords);
  const getDeckStats = useFlashcardsStore(s => s.getDeckStats);
  const getProgress = useFlashcardsStore(s => s.getProgress);
  const reviewWord = useFlashcardsStore(s => s.reviewWord);
  const maxNewPerDay = useFlashcardsStore(s => s.maxNewPerDay);
  const maxReviewsPerDay = useFlashcardsStore(s => s.maxReviewsPerDay);
  const setLimits = useFlashcardsStore(s => s.setLimits);
  const hskLevel = useFlashcardsStore(s => s.hskLevel);
  const openHskModal = useFlashcardsStore(s => s.openHskModal);

  const [draftNew, setDraftNew] = useState(maxNewPerDay);
  const [draftReviews, setDraftReviews] = useState(maxReviewsPerDay);

  const levelWords = useMemo(
    () => hskWords.filter(w => w.id <= HSK_LEVEL_MAX_ID[hskLevel]),
    [hskLevel],
  );

  // Reset the queue whenever the HSK level changes (level selection rebuilds the deck).
  // Skip on initial render when the queue is still null — the effect below handles that.
  useEffect(() => {
    if (sessionQueue !== null) {
      setSessionQueue(null);
      setPendingRequeue([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hskLevel]);

  // Build the session queue once after mount (localStorage is hydrated by then).
  useEffect(() => {
    if (isMounted && sessionQueue === null) {
      setSessionQueue(getDueWords(levelWords, new Date()).map(w => w.id));
    }
  }, [isMounted, sessionQueue, getDueWords, levelWords]);

  // Periodic tick: refresh `now` for stats + reinsert learning cards that are now due.
  useEffect(() => {
    const id = setInterval(() => {
      const ts = Date.now();
      setNow(new Date());
      setPendingRequeue((pending) => {
        const nowDue = pending.filter(p => p.dueAt <= ts);
        const notYet = pending.filter(p => p.dueAt > ts);
        if (nowDue.length > 0) {
          setSessionQueue(q => (q ? [...nowDue.map(p => p.wordId), ...q] : null));
        }
        return notYet;
      });
    }, 30_000);
    return () => clearInterval(id);
  }, []);

  const stats = useMemo(
    () => getDeckStats(levelWords, now),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getDeckStats, progressByWordId, maxNewPerDay, maxReviewsPerDay, now, hskLevel],
  );

  const currentWordId = sessionQueue?.[0] ?? null;
  const currentWord = currentWordId != null ? (levelWords.find(w => w.id === currentWordId) ?? null) : null;
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
    const gradeTime = new Date();

    // Predict next state before updating the store (scheduleNextReview is pure).
    const nextProg = scheduleNextReview(getProgress(currentWord.id), grade, gradeTime);
    const nextState = resolveState(nextProg);
    const wordId = currentWord.id;

    reviewWord(currentWord.id, grade, gradeTime);
    setSessionReviews(n => n + 1);
    setIsRevealed(false);

    // Delay queue advancement until the flip-back animation finishes (duration-500).
    // Without this delay, React batches isRevealed=false and queue.slice(1) together,
    // making the next card's back face visible during the first half of the flip.
    setTimeout(() => {
      setSessionQueue(q => (q ? q.slice(1) : null));

      // If the card entered a learning step, schedule it to reappear this session.
      if (nextState === 'learning' || nextState === 'relearning') {
        setPendingRequeue(p => [
          ...p,
          { wordId, dueAt: new Date(nextProg.dueAt).getTime() },
        ]);
      }
    }, 500);
  };

  const resetQueue = () => {
    setSessionQueue(null);
    setPendingRequeue([]);
  };

  const handleSaveOptions = () => {
    setLimits(
      Math.max(1, Math.min(9999, draftNew)),
      Math.max(1, Math.min(9999, draftReviews)),
    );
    resetQueue();
    setShowOptions(false);
  };

  if (!isMounted || sessionQueue === null) {
    return <div className="h-96 animate-pulse rounded-xl border bg-background/95" />;
  }

  if (!currentWord) {
    return (
      <div className="space-y-4 rounded-md border bg-background p-5">
        <div className="text-lg font-semibold">{props.labels.noCardsTitle}</div>
        <p className="text-sm text-muted-foreground">{props.labels.noCardsDescription}</p>
        <Button
          type="button"
          onClick={() => {
            setLimits(maxNewPerDay + 20, maxReviewsPerDay);
            resetQueue();
          }}
        >
          {props.labels.addMoreCards}
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
            (
            {props.labels.studiedCards}
            :
            {' '}
            {sessionReviews}
            )
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
        <div className="rounded-md border bg-muted/30 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
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

            <div className="flex items-center justify-between sm:col-span-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {props.labels.hskLevelCurrent}
                  {' '}
                  {hskLevel}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={openHskModal}
                >
                  {props.labels.hskLevelChange}
                </Button>
              </div>
              <Button type="button" size="sm" onClick={handleSaveOptions}>
                {props.labels.saveOptions}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Card ───────────────────────────────────────────────────────── */}
      <FlashcardDisplay
        word={currentWord}
        total={HSK_LEVEL_MAX_ID[hskLevel]}
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
