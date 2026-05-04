import type { CharacterMapItem, HskWord } from '@/types/Hsk';

import rawHskWords from '../../data/ref.json';

const characterRegex = /[\u4E00-\u9FFF]/;

export const hskWords = rawHskWords as HskWord[];

// IDs run 1–1200 with one gap; use the last entry's id as the authoritative total.
export const totalWords: number = (hskWords[hskWords.length - 1]?.id) ?? hskWords.length;

export const getPrimaryMeaning = (word: HskWord) => {
  const firstMeaning = word.parts_of_speech[0]?.meaning;
  return firstMeaning || '';
};

export const getPrimaryExample = (word: HskWord) => {
  const firstExample = word.parts_of_speech[0]?.example;
  return firstExample || '';
};

export const getCharacterMapItems = (): CharacterMapItem[] => {
  const map = new Map<string, CharacterMapItem>();

  for (const word of hskWords) {
    for (const character of word.word) {
      if (!characterRegex.test(character)) {
        continue;
      }

      if (map.has(character)) {
        continue;
      }

      map.set(character, {
        character,
        pinyin: word.pinyin,
        meaning: getPrimaryMeaning(word),
        word: word.word,
        wordId: word.id,
      });
    }
  }

  return [...map.values()];
};
