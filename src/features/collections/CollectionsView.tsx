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
  emptyChars: string;
  noWords: string;
  studyTitle: string;
  charsLabel: string;
  wordsLabel: string;
  studyBtn: string;
  deleteBtn: string;
  addCharPlaceholder: string;
  addCharBtn: string;
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

function getCollectionWords(characters: string[], levelMaxId: number): HskWord[] {
  if (characters.length === 0) return [];
  const charSet = new Set(characters);
  const seen = new Set<number>();
  const result: HskWord[] = [];
  for (const word of hskWords) {
    if (word.id > levelMaxId) continue;
    if (seen.has(word.id)) continue;
    if ([...word.word].some(c => charSet.has(c))) {
      seen.add(word.id);
      result.push(word);
    }
  }
  return result;
}

function wordBg(progress: FlashcardProgress | undefined): string {
  if (!progress) return 'bg-blue-500/10';
  const state = resolveState(progress);
  if (state === 'learning' && (progress.learningStep ?? 0) > 0) return '';
  if (state === 'learning' || state === 'relearning') return 'bg-red-500/10';
  if (state === 'review') return 'bg-green-500/10';
  return 'bg-blue-500/10';
}

const chineseCharRegex = /[一-鿿]/;

export const CollectionsView = ({ labels }: { labels: CollectionLabels }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [charInput, setCharInput] = useState('');
  const [isStudyOpen, setIsStudyOpen] = useState(false);
  const [studyWordId, setStudyWordId] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  useCollectionSync();

  const { collections, createCollection, deleteCollection, addCharacter, removeCharacter } = useCollectionsStore();
  const reviewWord = useFlashcardsStore(s => s.reviewWord);
  const progressByWordId = useFlashcardsStore(s => s.progressByWordId);
  const hskLevel = useFlashcardsStore(s => s.hskLevel);

  const levelMaxId = HSK_LEVEL_MAX_ID[hskLevel];
  const activeCollection = collections.find(c => c.id === activeId) ?? null;

  const collectionWords = useMemo(
    () => (activeCollection ? getCollectionWords(activeCollection.characters, levelMaxId) : []),
    [activeCollection, levelMaxId],
  );

  const studyWord = useMemo(
    () => collectionWords.find(w => w.id === studyWordId) ?? collectionWords[0] ?? null,
    [collectionWords, studyWordId],
  );

  const handleCreate = () => {
    const name = newName.trim();
    if (!name) return;
    const id = createCollection(name);
    setNewName('');
    setActiveId(id);
  };

  const handleAddChar = () => {
    const char = charInput.trim();
    if (!char || !activeId || !chineseCharRegex.test(char)) return;
    addCharacter(activeId, char[0]!);
    setCharInput('');
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
            ← {labels.back}
          </Button>
          <h3 className="text-lg font-semibold">{activeCollection.name}</h3>
          {activeCollection.isPublic && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              Public
            </span>
          )}
        </div>

        {/* Characters */}
        <div className="rounded-md border bg-background p-4 space-y-3">
          <div className="text-sm font-medium text-muted-foreground">{labels.charsLabel}</div>
          <div className="flex flex-wrap gap-2">
            {activeCollection.characters.length === 0 && (
              <p className="text-sm text-muted-foreground">{labels.emptyChars}</p>
            )}
            {activeCollection.characters.map(char => (
              <span
                key={char}
                className="flex items-center gap-1 rounded-md border bg-muted/40 px-2 py-1 text-lg font-semibold"
              >
                {char}
                {!activeCollection.isPublic && (
                <button
                  type="button"
                  onClick={() => removeCharacter(activeCollection.id, char)}
                  className="ml-1 text-muted-foreground hover:text-destructive text-sm leading-none"
                >
                  ×
                </button>
                )}
              </span>
            ))}
          </div>

          {/* Add character input — only for user-owned collections */}
          {!activeCollection.isPublic && (
            <div className="flex gap-2">
              <Input
                value={charInput}
                onChange={e => setCharInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddChar()}
                placeholder={labels.addCharPlaceholder}
                className="w-44"
                maxLength={1}
              />
              <Button type="button" variant="outline" size="sm" onClick={handleAddChar}>
                {labels.addCharBtn}
              </Button>
            </div>
          )}
        </div>

        {/* Words */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {collectionWords.length} {labels.wordsLabel}
            </span>
            {collectionWords.length > 0 && (
              <Button type="button" size="sm" onClick={openStudy}>
                {labels.studyBtn}
              </Button>
            )}
          </div>

          {collectionWords.length === 0 && (
            <div className="rounded-md border p-4 text-sm text-muted-foreground">
              {labels.noWords}
            </div>
          )}

          {collectionWords.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {collectionWords.map(word => (
                <button
                  key={word.id}
                  type="button"
                  onClick={() => {
                    setStudyWordId(word.id);
                    setIsRevealed(false);
                    setIsStudyOpen(true);
                  }}
                  className={`rounded-md border p-3 text-left transition hover:border-primary ${wordBg(progressByWordId[word.id])}`}
                >
                  <div className="text-xs text-muted-foreground">{word.pinyin}</div>
                  <div className="mt-1 text-2xl font-semibold">{word.word}</div>
                  <div className="mt-2 line-clamp-2 text-sm">{getPrimaryMeaning(word)}</div>
                </button>
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

              {/* Word tabs */}
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
      {/* Create form */}
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
            const wordCount = getCollectionWords(col.characters, levelMaxId).length;
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
                      className="text-xs text-muted-foreground hover:text-destructive shrink-0"
                    >
                      {labels.deleteBtn}
                    </button>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {col.characters.slice(0, 12).map(char => (
                    <span key={char} className="rounded border px-1.5 py-0.5 text-base font-semibold">
                      {char}
                    </span>
                  ))}
                  {col.characters.length > 12 && (
                    <span className="text-sm text-muted-foreground self-center">+{col.characters.length - 12}</span>
                  )}
                  {col.characters.length === 0 && (
                    <span className="text-xs text-muted-foreground">{labels.emptyChars}</span>
                  )}
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  {wordCount} {labels.wordsLabel}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
