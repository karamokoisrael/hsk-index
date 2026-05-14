'use client';

import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FlashcardDisplay } from '@/features/flashcards/FlashcardDisplay';
import { resolveState } from '@/features/flashcards/srs';
import { getPrimaryMeaning, hskWords } from '@/libs/services/hskWords';
import { HSK_LEVEL_MAX_ID } from '@/libs/constants/hskLevels';
import { useFlashcardsStore } from '@/stores/useFlashcardsStore';
import { useCollectionsStore } from '@/stores/useCollectionsStore';
import { useCollectionSync } from '@/hooks/useCollectionSync';
import type { FlashcardProgress, HskWord, ReviewGrade } from '@/types/Hsk';

export type CollectionLabels = {
  new: string;
  create: string;
  namePlaceholder: string;
  emptyState: string;
  emptyWords: string;
  noWords: string;
  studyTitle: string;
  wordsLabel: string;
  studyBtn: string;
  deleteBtn: string;
  searchWordsPlaceholder: string;
  back: string;
  revealAnswer: string;
  gradeAgain: string;
  gradeHard: string;
  gradeGood: string;
  gradeEasy: string;
  answer: string;
  example: string;
  close: string;
};

function wordBg(progress: FlashcardProgress | undefined): string {
  if (!progress) return 'bg-blue-500/10';
  const state = resolveState(progress);
  if (state === 'learning' && (progress.learningStep ?? 0) > 0) return '';
  if (state === 'learning' || state === 'relearning') return 'bg-red-500/10';
  if (state === 'review') return 'bg-green-500/10';
  return 'bg-blue-500/10';
}

const stripTones = (s: string) =>
  s.normalize('NFD').replace(/\p{Mn}/gu, '').toLowerCase();

export const CollectionsView = ({ labels }: { labels: CollectionLabels }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [wordSearch, setWordSearch] = useState('');
  const [isStudyOpen, setIsStudyOpen] = useState(false);
  const [studyWordId, setStudyWordId] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);
  useCollectionSync();

  const { collections, createCollection, deleteCollection, addWord, removeWord } = useCollectionsStore();
  const reviewWord = useFlashcardsStore(s => s.reviewWord);
  const progressByWordId = useFlashcardsStore(s => s.progressByWordId);
  const hskLevel = useFlashcardsStore(s => s.hskLevel);

  const levelMaxId = HSK_LEVEL_MAX_ID[hskLevel];
  const levelWords = useMemo(() => hskWords.filter(w => w.id <= levelMaxId), [levelMaxId]);

  const activeCollection = collections.find(c => c.id === activeId) ?? null;

  const collectionWords = useMemo((): HskWord[] => {
    if (!activeCollection) return [];
    return activeCollection.wordIds
      .map(id => levelWords.find(w => w.id === id))
      .filter((w): w is HskWord => w !== undefined);
  }, [activeCollection, levelWords]);

  const studyWord = useMemo(
    () => collectionWords.find(w => w.id === studyWordId) ?? collectionWords[0] ?? null,
    [collectionWords, studyWordId],
  );

  const wordSuggestions = useMemo(() => {
    const q = wordSearch.trim().toLowerCase();
    if (!q || !activeCollection) return [];
    const inCol = new Set(activeCollection.wordIds);
    const stripped = stripTones(q).replace(/\s/g, '');
    return levelWords
      .filter((w) => {
        if (inCol.has(w.id)) return false;
        return (
          w.word.includes(q)
          || stripTones(w.pinyin).replace(/\s/g, '').includes(stripped)
          || w.parts_of_speech.some(p => p.meaning.toLowerCase().includes(q))
        );
      })
      .slice(0, 8);
  }, [wordSearch, activeCollection, levelWords]);

  const handleCreate = () => {
    const name = newName.trim();
    if (!name) return;
    const id = createCollection(name);
    setNewName('');
    setActiveId(id);
  };

  const handleGrade = (grade: ReviewGrade) => {
    if (!studyWord) return;
    reviewWord(studyWord.id, grade, new Date());
    setIsRevealed(false);
    const idx = collectionWords.findIndex(w => w.id === studyWord.id);
    const next = collectionWords[(idx + 1) % collectionWords.length];
    if (next) setStudyWordId(next.id);
  };

  const openStudy = () => {
    setStudyWordId(collectionWords[0]?.id ?? null);
    setIsRevealed(false);
    setIsStudyOpen(true);
  };

  if (!isMounted) {
    return <div className="h-64 animate-pulse rounded-xl border bg-background/95" />;
  }

  // ── Detail view ──────────────────────────────────────────────────────────────
  if (activeCollection) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" size="sm" onClick={() => setActiveId(null)}>
            ←
            {' '}
            {labels.back}
          </Button>
          <h3 className="text-lg font-semibold">{activeCollection.name}</h3>
          {activeCollection.isPublic && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              Public
            </span>
          )}
        </div>

        {/* Word search to add */}
        {!activeCollection.isPublic && (
          <div className="relative max-w-sm">
            <Input
              value={wordSearch}
              onChange={e => setWordSearch(e.target.value)}
              placeholder={labels.searchWordsPlaceholder}
            />
            {wordSuggestions.length > 0 && (
              <div className="absolute top-full left-0 z-20 mt-1 w-full max-w-sm overflow-y-auto rounded-md border bg-background shadow-lg" style={{ maxHeight: '16rem' }}>
                {wordSuggestions.map(word => (
                  <button
                    key={word.id}
                    type="button"
                    onClick={() => {
                      addWord(activeId!, word.id);
                      setWordSearch('');
                    }}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-muted"
                  >
                    <span className="text-xl font-semibold">{word.word}</span>
                    <span className="text-muted-foreground">{word.pinyin}</span>
                    <span className="line-clamp-1 flex-1 text-muted-foreground">{getPrimaryMeaning(word)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Words */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {collectionWords.length}
              {' '}
              {labels.wordsLabel}
            </span>
            {collectionWords.length > 0 && (
              <Button type="button" size="sm" onClick={openStudy}>
                {labels.studyBtn}
              </Button>
            )}
          </div>

          {collectionWords.length === 0 && (
            <div className="rounded-md border p-4 text-sm text-muted-foreground">
              {labels.emptyWords}
            </div>
          )}

          {collectionWords.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {collectionWords.map(word => (
                <div
                  key={word.id}
                  className={`group relative rounded-md border p-3 ${wordBg(progressByWordId[word.id])}`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setStudyWordId(word.id);
                      setIsRevealed(false);
                      setIsStudyOpen(true);
                    }}
                    className="block w-full text-left"
                  >
                    <div className="text-xs text-muted-foreground">{word.pinyin}</div>
                    <div className="mt-1 text-2xl font-semibold">{word.word}</div>
                    <div className="mt-2 line-clamp-2 text-sm">{getPrimaryMeaning(word)}</div>
                  </button>
                  {!activeCollection.isPublic && (
                    <button
                      type="button"
                      onClick={() => removeWord(activeCollection.id, word.id)}
                      className="absolute right-1.5 top-1.5 hidden text-xs text-muted-foreground hover:text-destructive group-hover:block"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Study modal */}
        {isStudyOpen && studyWord && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setIsStudyOpen(false)}
          >
            <div
              className="max-h-[90vh] w-full max-w-4xl space-y-4 overflow-y-auto rounded-xl border bg-background p-4 shadow-2xl sm:p-5"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">{labels.studyTitle}</h3>
                  <p className="text-sm text-muted-foreground">{activeCollection.name}</p>
                </div>
                <Button type="button" variant="outline" onClick={() => setIsStudyOpen(false)}>
                  {labels.close}
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {collectionWords.map(word => (
                  <Button
                    key={word.id}
                    type="button"
                    variant={studyWord.id === word.id ? 'default' : 'outline'}
                    className={studyWord.id !== word.id ? wordBg(progressByWordId[word.id]) : ''}
                    onClick={() => { setStudyWordId(word.id); setIsRevealed(false); }}
                  >
                    {word.word}
                  </Button>
                ))}
              </div>

              <FlashcardDisplay
                word={studyWord}
                total={hskWords.length}
                isRevealed={isRevealed}
                onToggle={() => setIsRevealed(p => !p)}
                cardState={progressByWordId[studyWord.id] ? resolveState(progressByWordId[studyWord.id]!) : 'new'}
                learningStep={progressByWordId[studyWord.id]?.learningStep}
                labels={{ answer: labels.answer, example: labels.example }}
              />

              {!isRevealed && (
                <div className="flex justify-center">
                  <Button type="button" size="lg" onClick={() => setIsRevealed(true)}>
                    {labels.revealAnswer}
                  </Button>
                </div>
              )}

              {isRevealed && (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                  {([
                    { grade: 'again' as ReviewGrade, label: labels.gradeAgain },
                    { grade: 'hard' as ReviewGrade, label: labels.gradeHard },
                    { grade: 'good' as ReviewGrade, label: labels.gradeGood },
                    { grade: 'easy' as ReviewGrade, label: labels.gradeEasy },
                  ]).map(({ grade, label }) => (
                    <Button
                      key={grade}
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => handleGrade(grade)}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── List view ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleCreate()}
          placeholder={labels.namePlaceholder}
          className="max-w-xs"
        />
        <Button type="button" onClick={handleCreate} disabled={!newName.trim()}>
          {labels.create}
        </Button>
      </div>

      {collections.length === 0 && (
        <div className="rounded-md border p-6 text-center text-sm text-muted-foreground">
          {labels.emptyState}
        </div>
      )}

      {collections.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((col) => {
            const words = col.wordIds
              .map(id => levelWords.find(w => w.id === id))
              .filter((w): w is HskWord => w !== undefined);
            return (
              <button
                key={col.id}
                type="button"
                onClick={() => setActiveId(col.id)}
                className="group rounded-md border bg-background p-4 text-left transition hover:border-primary"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold group-hover:text-primary">{col.name}</div>
                    {col.isPublic && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        Public
                      </span>
                    )}
                  </div>
                  {!col.isPublic && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); deleteCollection(col.id); }}
                      className="shrink-0 text-xs text-muted-foreground hover:text-destructive"
                    >
                      {labels.deleteBtn}
                    </button>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {words.slice(0, 8).map(word => (
                    <span key={word.id} className="rounded border px-1.5 py-0.5 text-sm font-semibold">
                      {word.word}
                    </span>
                  ))}
                  {words.length > 8 && (
                    <span className="self-center text-sm text-muted-foreground">
                      +
                      {words.length - 8}
                    </span>
                  )}
                  {words.length === 0 && (
                    <span className="text-xs text-muted-foreground">{labels.emptyWords}</span>
                  )}
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  {words.length}
                  {' '}
                  {labels.wordsLabel}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
