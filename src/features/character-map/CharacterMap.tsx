'use client';

import { useState } from 'react';

import { Input } from '@/components/ui/input';
import { getCharacterMapItems } from '@/data/hskWords';

const characterMapItems = getCharacterMapItems();

export const CharacterMap = (props: {
  labels: {
    searchPlaceholder: string;
    results: string;
    empty: string;
    basedOnWord: string;
  };
}) => {
  const [query, setQuery] = useState('');

  const normalizedQuery = query.trim().toLowerCase();

  const filtered = normalizedQuery
    ? characterMapItems.filter(item => (
      item.character.includes(normalizedQuery)
      || item.word.includes(normalizedQuery)
      || item.pinyin.toLowerCase().includes(normalizedQuery)
      || item.meaning.toLowerCase().includes(normalizedQuery)
    ))
    : characterMapItems;

  return (
    <div className="space-y-4">
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
    </div>
  );
};
