'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getPrimaryMeaning, hskWords } from '@/libs/services/hskWords';
import { FlashcardDisplay } from '@/features/flashcards/FlashcardDisplay';
import { resolveState } from '@/features/flashcards/srs';
import { CollectionsView, type CollectionLabels } from '@/features/collections/CollectionsView';
import { HSK_LEVEL_MAX_ID } from '@/libs/constants/hskLevels';
import { useFlashcardsStore } from '@/stores/useFlashcardsStore';
import { useCollectionsStore } from '@/stores/useCollectionsStore';
import type { CardState, FlashcardProgress, HskWord, ReviewGrade } from '@/types/Hsk';

const chineseCharRegex = /[\u4E00-\u9FFF]/;

const stripTones = (s: string) =>
  s.normalize('NFD').replace(/\p{Mn}/gu, '').toLowerCase();

const matchesPinyin = (pinyin: string, query: string) => {
  const stripped = stripTones(pinyin);
  const strippedQuery = stripTones(query);
  return stripped.includes(strippedQuery)
    || stripped.replace(/\s+/g, '').includes(strippedQuery.replace(/\s+/g, ''));
};

function charRelevance(item: { character: string; words: typeof hskWords }, query: string): number {
  if (item.character.includes(query)) {
    return 4;
  }
  if (item.words.some(w => w.word === item.character && matchesPinyin(w.pinyin, query))) {
    return 3;
  }
  if (item.words.some(w => w.word.length <= 2 && matchesPinyin(w.pinyin, query))) {
    return 2;
  }
  if (item.words.some(w => matchesPinyin(w.pinyin, query))) {
    return 1;
  }
  return 0;
}

function wordRelevance(word: (typeof hskWords)[number], query: string): number {
  if (word.word.includes(query)) {
    return 4;
  }
  const strippedPinyin = stripTones(word.pinyin).replace(/\s+/g, '');
  const strippedQuery = stripTones(query).replace(/\s+/g, '');
  if (strippedPinyin === strippedQuery) {
    return 3;
  }
  if (matchesPinyin(word.pinyin, query)) {
    return 2;
  }
  return 1;
}

function buildCommonCharacterEntries(words: typeof hskWords) {
  const map = new Map<string, { count: number; words: typeof hskWords }>();

  for (const word of words) {
    const seenCharacters = new Set<string>();

    for (const character of word.word) {
      if (!chineseCharRegex.test(character) || seenCharacters.has(character)) {
        continue;
      }

      seenCharacters.add(character);

      const existing = map.get(character);
      if (existing) {
        existing.count += 1;
        existing.words.push(word);
      } else {
        map.set(character, {
          count: 1,
          words: [word],
        });
      }
    }
  }

  return [...map.entries()]
    .map(([character, data]) => ({
      character,
      count: data.count,
      words: data.words,
    }))
    .sort((a, b) => b.count - a.count);
}

function wordBg(state: CardState, learningStep?: number): string {
  if (state === 'learning' && (learningStep ?? 0) > 0) return '';
  if (state === 'learning' || state === 'relearning') return 'bg-red-500/10';
  if (state === 'review') return 'bg-green-500/10';
  return 'bg-blue-500/10';
}

function getWordState(wordId: number, progressByWordId: Record<number, FlashcardProgress>): CardState {
  const p = progressByWordId[wordId];
  return p ? resolveState(p) : 'new';
}

function getDisplayWords(words: typeof hskWords): typeof hskWords {
  const byWord = new Map<string, (typeof hskWords)[number]>();
  for (const word of words) {
    if (!byWord.has(word.word)) {
      byWord.set(word.word, word);
    }
  }
  return [...byWord.values()].slice(0, 9);
}

function charAggregateBg(words: typeof hskWords, progressByWordId: Record<number, FlashcardProgress>): string {
  const displayed = getDisplayWords(words);
  let hasNew = false;
  let hasGoodStep = false;
  for (const word of displayed) {
    const p = progressByWordId[word.id];
    const s = p ? resolveState(p) : 'new';
    if (s === 'relearning' || (s === 'learning' && (p?.learningStep ?? 0) === 0)) return 'bg-red-500/10';
    if (s === 'learning') { hasGoodStep = true; continue; }
    if (s === 'new') hasNew = true;
  }
  if (hasGoodStep) return '';
  return hasNew ? 'bg-blue-500/10' : 'bg-green-500/10';
}

export const CharacterMap = (props: {
  initialView?: 'common' | 'explorer' | 'collections';
  labels: {
    viewCommon: string;
    viewExplorer: string;
    viewCollections?: string;
    addToCollection?: string;
    noCollectionsHint?: string;
    commonCharacters: string;
    commonHint: string;
    appearsInWords: string;
    relatedWords: string;
    openStudy: string;
    studyCharacter: string;
    close: string;
    revealAnswer: string;
    gradeAgain: string;
    gradeHard: string;
    gradeGood: string;
    gradeEasy: string;
    answer: string;
    example: string;
    searchPlaceholder: string;
    results: string;
    empty: string;
    basedOnWord: string;
    hideDetails: string;
    showDetails: string;
    collectionLabels?: CollectionLabels;
  };
}) => {
  const reviewWord = useFlashcardsStore(state => state.reviewWord);
  const progressByWordId = useFlashcardsStore(state => state.progressByWordId);
  const hskLevel = useFlashcardsStore(s => s.hskLevel);
  const { collections, addCharacter, createCollection } = useCollectionsStore();

  const levelWords = useMemo(
    () => hskWords.filter(w => w.id <= HSK_LEVEL_MAX_ID[hskLevel]),
    [hskLevel],
  );
  const commonCharacterEntries = useMemo(
    () => buildCommonCharacterEntries(levelWords),
    [levelWords],
  );

  const [isMounted, setIsMounted] = useState(false);
  const [showDetails, setShowDetails] = useState(true);
  const [view, setView] = useState<'common' | 'explorer' | 'collections'>(props.initialView ?? 'common');
  const [addToColOpen, setAddToColOpen] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [query, setQuery] = useState('');
  const [charQuery, setCharQuery] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState(commonCharacterEntries[0]?.character || '');
  const [isStudyOpen, setIsStudyOpen] = useState(false);
  const [isStudyRevealed, setIsStudyRevealed] = useState(false);
  const [selectedStudyWordId, setSelectedStudyWordId] = useState<number | null>(null);
  const [explorerStudyWord, setExplorerStudyWord] = useState<HskWord | null>(null);
  const detailRef = useRef<HTMLElement>(null);

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    setSelectedCharacter(commonCharacterEntries[0]?.character || '');
  }, [hskLevel]); // eslint-disable-line react-hooks/exhaustive-deps

  const characterBgs = useMemo(() => {
    if (!isMounted) return new Map<string, string>();
    const map = new Map<string, string>();
    for (const entry of commonCharacterEntries) {
      map.set(entry.character, charAggregateBg(entry.words, progressByWordId));
    }
    return map;
  }, [isMounted, progressByWordId]);

  const normalizedCharQuery = charQuery.trim().toLowerCase();
  const filteredCharacters = normalizedCharQuery
    ? commonCharacterEntries
      .filter(item =>
        item.character.includes(normalizedCharQuery)
        || item.words.some(w =>
          matchesPinyin(w.pinyin, normalizedCharQuery)
          || w.parts_of_speech.some(p => p.meaning.toLowerCase().includes(normalizedCharQuery)),
        ),
      )
      .sort((a, b) => {
        const diff = charRelevance(b, normalizedCharQuery) - charRelevance(a, normalizedCharQuery);
        return diff !== 0 ? diff : b.count - a.count;
      })
    : commonCharacterEntries;

  const normalizedQuery = query.trim().toLowerCase();

  const filteredWords = normalizedQuery
    ? levelWords
      .filter(word =>
        word.word.includes(normalizedQuery)
        || matchesPinyin(word.pinyin, normalizedQuery)
        || word.parts_of_speech.some(p => p.meaning.toLowerCase().includes(normalizedQuery)),
      )
      .sort((a, b) => wordRelevance(b, normalizedQuery) - wordRelevance(a, normalizedQuery))
    : levelWords;

  const selectedCommonCharacter = useMemo(
    () => commonCharacterEntries.find(item => item.character === selectedCharacter) || commonCharacterEntries[0],
    [selectedCharacter],
  );

  const relatedWords = useMemo(() => {
    if (!selectedCommonCharacter) {
      return [];
    }

    const byWord = new Map<string, (typeof hskWords)[number]>();

    for (const word of selectedCommonCharacter.words) {
      if (!byWord.has(word.word)) {
        byWord.set(word.word, word);
      }
    }

    return [...byWord.values()].slice(0, 9);
  }, [selectedCommonCharacter]);

  const selectCharacter = (character: string) => {
    const target = commonCharacterEntries.find(entry => entry.character === character);
    if (!target) {
      return;
    }

    const words = target.words.filter(word => word.word.includes(character));
    const firstWord = words[0];
    if (!firstWord) {
      return;
    }

    setSelectedCharacter(character);
    setSelectedStudyWordId(firstWord.id);
    setIsStudyRevealed(false);
    setAddToColOpen(false);

    if (window.innerWidth < 1024 && detailRef.current) {
      setTimeout(() => detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    }
  };

  const openStudyForWord = (wordId: number) => {
    setExplorerStudyWord(null);
    setSelectedStudyWordId(wordId);
    setIsStudyRevealed(false);
    setIsStudyOpen(true);
  };

  const openExplorerWord = (word: HskWord) => {
    setExplorerStudyWord(word);
    setSelectedStudyWordId(word.id);
    setIsStudyRevealed(false);
    setIsStudyOpen(true);
  };

  const studyWords = useMemo(() => {
    if (!selectedCommonCharacter) {
      return [] as HskWord[];
    }

    const unique = new Map<number, HskWord>();
    for (const word of selectedCommonCharacter.words) {
      if (word.word.includes(selectedCommonCharacter.character) && !unique.has(word.id)) {
        unique.set(word.id, word);
      }
    }

    return [...unique.values()].slice(0, 10);
  }, [selectedCommonCharacter]);

  const selectedStudyWord = useMemo(
    () => studyWords.find(word => word.id === selectedStudyWordId) || studyWords[0],
    [selectedStudyWordId, studyWords],
  );

  const markStudyWord = (grade: ReviewGrade) => {
    const activeWord = explorerStudyWord ?? selectedStudyWord;
    if (!activeWord) return;

    reviewWord(activeWord.id, grade, new Date());
    setIsStudyRevealed(false);

    if (!explorerStudyWord) {
      const currentIndex = studyWords.findIndex(word => word.id === activeWord.id);
      if (currentIndex >= 0 && studyWords.length > 1) {
        const nextIndex = (currentIndex + 1) % studyWords.length;
        const nextWord = studyWords[nextIndex];
        if (nextWord) setSelectedStudyWordId(nextWord.id);
      }
    }
  };

  const branchWords = relatedWords.slice(0, 6);
  const leftBranchWords = branchWords.slice(0, 3);
  const rightBranchWords = branchWords.slice(3, 6);
  const extraRelatedWords = relatedWords.slice(6);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant={view === 'common' ? 'default' : 'outline'} onClick={() => setView('common')}>
          {props.labels.viewCommon}
        </Button>

        <Button type="button" variant={view === 'explorer' ? 'default' : 'outline'} onClick={() => setView('explorer')}>
          {props.labels.viewExplorer}
        </Button>

        {props.labels.viewCollections && (
          <Button type="button" variant={view === 'collections' ? 'default' : 'outline'} onClick={() => setView('collections')}>
            {props.labels.viewCollections}
          </Button>
        )}
      </div>

      {view === 'common' && (
        <div className="grid gap-4 lg:grid-cols-[19rem_1fr]">
          <aside className="space-y-3 rounded-md border bg-background p-4">
            <div>
              <div className="text-sm font-semibold">{props.labels.commonCharacters}</div>
              <p className="mt-1 text-xs text-muted-foreground">{props.labels.commonHint}</p>
            </div>

            <Input
              value={charQuery}
              onChange={e => setCharQuery(e.target.value)}
              placeholder={props.labels.searchPlaceholder}
              className="h-8 text-sm"
            />

            <div className="max-h-[70vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-6 gap-2 lg:grid-cols-4">
                {filteredCharacters.map(item => (
                  <button
                    key={item.character}
                    type="button"
                    onClick={() => selectCharacter(item.character)}
                    className={`rounded-md border px-2 py-2 text-center text-lg font-semibold transition hover:border-primary ${isMounted ? (characterBgs.get(item.character) ?? '') : ''} ${selectedCommonCharacter?.character === item.character ? 'border-primary text-primary' : ''}`}
                  >
                    {item.character}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <section ref={detailRef} className="rounded-md border bg-muted/20 p-4 sm:p-5">
            {!selectedCommonCharacter && (
              <div className="rounded-md border p-4 text-sm text-muted-foreground">
                {props.labels.empty}
              </div>
            )}

            {selectedCommonCharacter && (
              <>
                {/* Character header row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="text-center flex-1">
                    <div className="text-7xl font-bold leading-none sm:text-8xl">{selectedCommonCharacter.character}</div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      {props.labels.appearsInWords}: {selectedCommonCharacter.count}
                    </div>
                  </div>

                  {/* Add to collection — prominent, top-right of panel */}
                  {props.labels.addToCollection && (
                    <div className="relative shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setAddToColOpen(v => !v)}
                      >
                        + {props.labels.addToCollection}
                      </Button>
                      {addToColOpen && (
                        <div className="absolute right-0 z-20 mt-1 w-56 rounded-md border bg-background shadow-lg">
                          {/* Existing user-owned collections */}
                          {collections.filter(c => !c.isPublic).map((col) => {
                            const inCol = col.characters.includes(selectedCommonCharacter.character);
                            return (
                              <button
                                key={col.id}
                                type="button"
                                onClick={() => {
                                  addCharacter(col.id, selectedCommonCharacter.character);
                                  setAddToColOpen(false);
                                }}
                                disabled={inCol}
                                className="flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-muted disabled:opacity-50"
                              >
                                <span>{col.name}</span>
                                {inCol && <span className="text-green-600">✓</span>}
                              </button>
                            );
                          })}

                          {/* Inline create */}
                          <div className="border-t p-2 flex gap-1">
                            <input
                              value={newColName}
                              onChange={e => setNewColName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && newColName.trim()) {
                                  const id = createCollection(newColName.trim());
                                  addCharacter(id, selectedCommonCharacter.character);
                                  setNewColName('');
                                  setAddToColOpen(false);
                                }
                                e.stopPropagation();
                              }}
                              placeholder={props.labels.collectionLabels?.namePlaceholder ?? 'New collection'}
                              className="min-w-0 flex-1 rounded border px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-primary bg-background"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (!newColName.trim()) return;
                                const id = createCollection(newColName.trim());
                                addCharacter(id, selectedCommonCharacter.character);
                                setNewColName('');
                                setAddToColOpen(false);
                              }}
                              className="shrink-0 rounded border px-2 py-1 text-sm font-bold hover:bg-muted"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-5 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold">{props.labels.relatedWords}</div>
                    <button
                      type="button"
                      onClick={() => setShowDetails(v => !v)}
                      className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                    >
                      {showDetails ? props.labels.hideDetails : props.labels.showDetails}
                    </button>
                  </div>

                  <div className="grid gap-3 md:hidden">
                    {relatedWords.map(word => (
                      <button
                        key={word.id}
                        type="button"
                        onClick={() => openStudyForWord(word.id)}
                        className={`rounded-md border p-3 text-left transition hover:border-primary ${isMounted ? wordBg(getWordState(word.id, progressByWordId), progressByWordId[word.id]?.learningStep) : 'bg-background'}`}
                      >
                        {showDetails && <div className="text-sm text-muted-foreground">{word.pinyin}</div>}
                        <div className={`text-2xl font-semibold ${showDetails ? 'mt-1' : ''}`}>{word.word}</div>
                        {showDetails && <div className="mt-2 text-sm">{getPrimaryMeaning(word)}</div>}
                      </button>
                    ))}
                  </div>

                  <div className="hidden gap-4 md:grid md:grid-cols-[1fr_7rem_1fr] md:items-center">
                    <div className="space-y-3">
                      {leftBranchWords.map((word, index) => (
                        <div key={word.id} className="grid grid-cols-[1fr_2.5rem] items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openStudyForWord(word.id)}
                            className={`rounded-md border p-3 text-right transition hover:border-primary ${isMounted ? wordBg(getWordState(word.id, progressByWordId), progressByWordId[word.id]?.learningStep) : 'bg-background'}`}
                          >
                            {showDetails && <div className="text-sm text-muted-foreground">{word.pinyin}</div>}
                            <div className={`text-2xl font-semibold ${showDetails ? 'mt-1' : ''}`}>{word.word}</div>
                            {showDetails && <div className="mt-2 text-sm">{getPrimaryMeaning(word)}</div>}
                          </button>
                          <div className="text-center text-2xl text-primary/80">
                            {index === 0 ? '↘' : index === 1 ? '→' : '↗'}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-md border bg-background p-4 text-center">
                      <div className="text-6xl font-bold leading-none">{selectedCommonCharacter.character}</div>
                      <div className="mt-2 text-xs text-muted-foreground">{selectedCommonCharacter.count}</div>
                    </div>

                    <div className="space-y-3">
                      {rightBranchWords.map((word, index) => (
                        <div key={word.id} className="grid grid-cols-[2.5rem_1fr] items-center gap-2">
                          <div className="text-center text-2xl text-primary/80">
                            {index === 0 ? '↙' : index === 1 ? '←' : '↖'}
                          </div>
                          <button
                            type="button"
                            onClick={() => openStudyForWord(word.id)}
                            className={`rounded-md border p-3 text-left transition hover:border-primary ${isMounted ? wordBg(getWordState(word.id, progressByWordId), progressByWordId[word.id]?.learningStep) : 'bg-background'}`}
                          >
                            {showDetails && <div className="text-sm text-muted-foreground">{word.pinyin}</div>}
                            <div className={`text-2xl font-semibold ${showDetails ? 'mt-1' : ''}`}>{word.word}</div>
                            {showDetails && <div className="mt-2 text-sm">{getPrimaryMeaning(word)}</div>}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {extraRelatedWords.length > 0 && (
                    <div className="hidden gap-3 md:grid md:grid-cols-3">
                      {extraRelatedWords.map(word => (
                        <button
                          key={word.id}
                          type="button"
                          onClick={() => openStudyForWord(word.id)}
                          className={`rounded-md border p-3 text-left transition hover:border-primary ${isMounted ? wordBg(getWordState(word.id, progressByWordId), progressByWordId[word.id]?.learningStep) : 'bg-background'}`}
                        >
                          {showDetails && <div className="text-sm text-muted-foreground">{word.pinyin}</div>}
                          <div className={`text-2xl font-semibold ${showDetails ? 'mt-1' : ''}`}>{word.word}</div>
                          {showDetails && <div className="mt-2 text-sm">{getPrimaryMeaning(word)}</div>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      )}

      {view === 'explorer' && (
        <>
          <div className="flex items-center gap-3">
            <Input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder={props.labels.searchPlaceholder}
              className="flex-1"
            />
            <button
              type="button"
              onClick={() => setShowDetails(v => !v)}
              className="shrink-0 text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            >
              {showDetails ? props.labels.hideDetails : props.labels.showDetails}
            </button>
          </div>

          <div className="text-sm text-muted-foreground">
            {props.labels.results}: {filteredWords.length}
          </div>

          {filteredWords.length === 0 && (
            <div className="rounded-md border p-4 text-sm text-muted-foreground">
              {props.labels.empty}
            </div>
          )}

          {filteredWords.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {filteredWords.map(word => (
                <button
                  key={word.id}
                  type="button"
                  onClick={() => openExplorerWord(word)}
                  className={`rounded-md border p-3 text-left transition hover:border-primary ${isMounted ? wordBg(getWordState(word.id, progressByWordId), progressByWordId[word.id]?.learningStep) : 'bg-background'}`}
                >
                  {showDetails && <div className="text-xs text-muted-foreground">{word.pinyin}</div>}
                  <div className={`text-2xl font-semibold ${showDetails ? 'mt-1' : ''}`}>{word.word}</div>
                  {showDetails && <div className="mt-2 line-clamp-2 text-sm">{getPrimaryMeaning(word)}</div>}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {view === 'collections' && props.labels.collectionLabels && (
        <CollectionsView labels={props.labels.collectionLabels} />
      )}

      {isStudyOpen && (explorerStudyWord ?? selectedStudyWord) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => { setIsStudyOpen(false); setExplorerStudyWord(null); }}>
          <div
            className="max-h-[90vh] w-full max-w-4xl space-y-4 overflow-y-auto rounded-xl border bg-background p-4 shadow-2xl sm:p-5"
            onClick={event => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">{props.labels.studyCharacter}</h3>
                <p className="text-sm text-muted-foreground">
                  {explorerStudyWord ? explorerStudyWord.word : selectedCommonCharacter?.character}
                </p>
              </div>
              <Button type="button" variant="outline" onClick={() => { setIsStudyOpen(false); setExplorerStudyWord(null); }}>
                {props.labels.close}
              </Button>
            </div>

            {!explorerStudyWord && (
              <div className="flex flex-wrap gap-2">
                {studyWords.map(word => (
                  <Button
                    key={word.id}
                    type="button"
                    variant={selectedStudyWord?.id === word.id ? 'default' : 'outline'}
                    className={selectedStudyWord?.id !== word.id && isMounted ? wordBg(getWordState(word.id, progressByWordId), progressByWordId[word.id]?.learningStep) : ''}
                    onClick={() => {
                      setSelectedStudyWordId(word.id);
                      setIsStudyRevealed(false);
                    }}
                  >
                    {word.word}
                  </Button>
                ))}
              </div>
            )}

            {(() => {
              const activeWord = explorerStudyWord ?? selectedStudyWord;
              if (!activeWord) return null;
              return (
                <FlashcardDisplay
                  word={activeWord}
                  total={hskWords.length}
                  isRevealed={isStudyRevealed}
                  onToggle={() => setIsStudyRevealed(previous => !previous)}
                  cardState={isMounted ? getWordState(activeWord.id, progressByWordId) : undefined}
                  learningStep={isMounted ? progressByWordId[activeWord.id]?.learningStep : undefined}
                  labels={{
                    answer: props.labels.answer,
                    example: props.labels.example,
                  }}
                />
              );
            })()}

            {!isStudyRevealed && (
              <div className="flex justify-center">
                <Button type="button" size="lg" onClick={() => setIsStudyRevealed(true)}>
                  {props.labels.revealAnswer}
                </Button>
              </div>
            )}

            {isStudyRevealed && (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                <Button type="button" variant="outline" className="w-full" onClick={() => markStudyWord('again')}>
                  {props.labels.gradeAgain}
                </Button>
                <Button type="button" variant="outline" className="w-full" onClick={() => markStudyWord('hard')}>
                  {props.labels.gradeHard}
                </Button>
                <Button type="button" variant="outline" className="w-full" onClick={() => markStudyWord('good')}>
                  {props.labels.gradeGood}
                </Button>
                <Button type="button" variant="outline" className="w-full" onClick={() => markStudyWord('easy')}>
                  {props.labels.gradeEasy}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
