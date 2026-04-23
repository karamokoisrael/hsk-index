'use client';

import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getCharacterMapItems, getPrimaryMeaning, hskWords } from '@/data/hskWords';
import { FlashcardDisplay } from '@/features/flashcards/FlashcardDisplay';
import { useFlashcardsStore } from '@/stores/useFlashcardsStore';
import type { HskWord, ReviewGrade } from '@/types/Hsk';

const characterMapItems = getCharacterMapItems();
const chineseCharRegex = /[\u4E00-\u9FFF]/;

const commonCharacterEntries = (() => {
  const map = new Map<string, { count: number; words: typeof hskWords }>();

  for (const word of hskWords) {
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
})();

const topCommonCharacterEntries = commonCharacterEntries.slice(0, 24);

export const CharacterMap = (props: {
  labels: {
    viewCommon: string;
    viewExplorer: string;
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
  };
}) => {
  const [view, setView] = useState<'common' | 'explorer'>('common');
  const [query, setQuery] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState(topCommonCharacterEntries[0]?.character || '');
  const [isStudyOpen, setIsStudyOpen] = useState(false);
  const [isStudyRevealed, setIsStudyRevealed] = useState(false);
  const [selectedStudyWordId, setSelectedStudyWordId] = useState<number | null>(null);

  const reviewWord = useFlashcardsStore(state => state.reviewWord);

  const normalizedQuery = query.trim().toLowerCase();

  const filtered = normalizedQuery
    ? characterMapItems.filter(item => (
      item.character.includes(normalizedQuery)
      || item.word.includes(normalizedQuery)
      || item.pinyin.toLowerCase().includes(normalizedQuery)
      || item.meaning.toLowerCase().includes(normalizedQuery)
    ))
    : characterMapItems;

  const selectedCommonCharacter = useMemo(
    () => topCommonCharacterEntries.find(item => item.character === selectedCharacter) || topCommonCharacterEntries[0],
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

  const openStudyForCharacter = (character: string) => {
    const target = topCommonCharacterEntries.find(entry => entry.character === character);
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
    if (!selectedStudyWord) {
      return;
    }

    reviewWord(selectedStudyWord.id, grade, new Date());
    setIsStudyRevealed(false);

    const currentIndex = studyWords.findIndex(word => word.id === selectedStudyWord.id);
    if (currentIndex >= 0 && studyWords.length > 1) {
      const nextIndex = (currentIndex + 1) % studyWords.length;
      const nextWord = studyWords[nextIndex];
      if (nextWord) {
        setSelectedStudyWordId(nextWord.id);
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
      </div>

      {view === 'common' && (
        <div className="grid gap-4 lg:grid-cols-[19rem_1fr]">
          <aside className="space-y-3 rounded-md border bg-background p-4">
            <div>
              <div className="text-sm font-semibold">{props.labels.commonCharacters}</div>
              <p className="mt-1 text-xs text-muted-foreground">{props.labels.commonHint}</p>
            </div>

            <div className="grid grid-cols-6 gap-2 lg:grid-cols-4">
              {topCommonCharacterEntries.map(item => (
                <button
                  key={item.character}
                  type="button"
                  onClick={() => openStudyForCharacter(item.character)}
                  className={`rounded-md border px-2 py-2 text-center text-lg font-semibold transition hover:border-primary ${selectedCommonCharacter?.character === item.character ? 'border-primary bg-primary/10 text-primary' : 'bg-background'}`}
                >
                  {item.character}
                </button>
              ))}
            </div>
          </aside>

          <section className="rounded-md border bg-muted/20 p-4 sm:p-5">
            {!selectedCommonCharacter && (
              <div className="rounded-md border p-4 text-sm text-muted-foreground">
                {props.labels.empty}
              </div>
            )}

            {selectedCommonCharacter && (
              <>
                <div className="text-center">
                  <div className="text-7xl font-bold leading-none sm:text-8xl">{selectedCommonCharacter.character}</div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {props.labels.appearsInWords}: {selectedCommonCharacter.count}
                  </div>
                  <div className="mt-3">
                    <Button type="button" onClick={() => openStudyForCharacter(selectedCommonCharacter.character)}>
                      {props.labels.openStudy}
                    </Button>
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  <div className="text-sm font-semibold">{props.labels.relatedWords}</div>

                  <div className="grid gap-3 md:hidden">
                    {relatedWords.map(word => (
                      <article key={word.id} className="rounded-md border bg-background p-3">
                        <div className="text-sm text-muted-foreground">{word.pinyin}</div>
                        <div className="mt-1 text-2xl font-semibold">{word.word}</div>
                        <div className="mt-2 text-sm">{getPrimaryMeaning(word)}</div>
                      </article>
                    ))}
                  </div>

                  <div className="hidden gap-4 md:grid md:grid-cols-[1fr_7rem_1fr] md:items-center">
                    <div className="space-y-3">
                      {leftBranchWords.map((word, index) => (
                        <div key={word.id} className="grid grid-cols-[1fr_2.5rem] items-center gap-2">
                          <article className="rounded-md border bg-background p-3 text-right">
                            <div className="text-sm text-muted-foreground">{word.pinyin}</div>
                            <div className="mt-1 text-2xl font-semibold">{word.word}</div>
                            <div className="mt-2 text-sm">{getPrimaryMeaning(word)}</div>
                          </article>
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
                          <article className="rounded-md border bg-background p-3">
                            <div className="text-sm text-muted-foreground">{word.pinyin}</div>
                            <div className="mt-1 text-2xl font-semibold">{word.word}</div>
                            <div className="mt-2 text-sm">{getPrimaryMeaning(word)}</div>
                          </article>
                        </div>
                      ))}
                    </div>
                  </div>

                  {extraRelatedWords.length > 0 && (
                    <div className="hidden gap-3 md:grid md:grid-cols-3">
                      {extraRelatedWords.map(word => (
                        <article key={word.id} className="rounded-md border bg-background p-3">
                          <div className="text-sm text-muted-foreground">{word.pinyin}</div>
                          <div className="mt-1 text-2xl font-semibold">{word.word}</div>
                          <div className="mt-2 text-sm">{getPrimaryMeaning(word)}</div>
                        </article>
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
          <Input
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder={props.labels.searchPlaceholder}
          />

          <div className="text-sm text-muted-foreground">
            {props.labels.results}: {filtered.length}
          </div>

          {filtered.length === 0 && (
            <div className="rounded-md border p-4 text-sm text-muted-foreground">
              {props.labels.empty}
            </div>
          )}

          {filtered.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {filtered.map(item => (
                <article key={item.character} className="rounded-md border bg-background p-3">
                  <div className="text-3xl font-semibold">{item.character}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{item.pinyin}</div>
                  <div className="mt-2 line-clamp-2 text-sm">{item.meaning}</div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {props.labels.basedOnWord}: {item.word}
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}

      {isStudyOpen && selectedStudyWord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setIsStudyOpen(false)}>
          <div
            className="max-h-[90vh] w-full max-w-4xl space-y-4 overflow-y-auto rounded-xl border bg-background p-4 shadow-2xl sm:p-5"
            onClick={event => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">{props.labels.studyCharacter}</h3>
                <p className="text-sm text-muted-foreground">{selectedCommonCharacter?.character}</p>
              </div>
              <Button type="button" variant="outline" onClick={() => setIsStudyOpen(false)}>
                {props.labels.close}
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {studyWords.map(word => (
                <Button
                  key={word.id}
                  type="button"
                  variant={selectedStudyWord.id === word.id ? 'default' : 'outline'}
                  onClick={() => {
                    setSelectedStudyWordId(word.id);
                    setIsStudyRevealed(false);
                  }}
                >
                  {word.word}
                </Button>
              ))}
            </div>

            <FlashcardDisplay
              word={selectedStudyWord}
              isRevealed={isStudyRevealed}
              onToggle={() => setIsStudyRevealed(previous => !previous)}
              labels={{
                answer: props.labels.answer,
                example: props.labels.example,
              }}
            />

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
