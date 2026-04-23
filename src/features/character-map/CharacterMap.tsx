'use client';

import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getCharacterMapItems, getPrimaryMeaning, hskWords } from '@/data/hskWords';

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
    searchPlaceholder: string;
    results: string;
    empty: string;
    basedOnWord: string;
  };
}) => {
  const [view, setView] = useState<'common' | 'explorer'>('common');
  const [query, setQuery] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState(topCommonCharacterEntries[0]?.character || '');

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
                  onClick={() => setSelectedCharacter(item.character)}
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
                </div>

                <div className="mt-5 space-y-2">
                  <div className="text-sm font-semibold">{props.labels.relatedWords}</div>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {relatedWords.map(word => (
                      <article key={word.id} className="rounded-md border bg-background p-3">
                        <div className="text-sm text-muted-foreground">{word.pinyin}</div>
                        <div className="mt-1 text-2xl font-semibold">{word.word}</div>
                        <div className="mt-2 text-sm">{getPrimaryMeaning(word)}</div>
                      </article>
                    ))}
                  </div>
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
    </div>
  );
};
