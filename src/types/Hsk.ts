export type HskPartOfSpeech = {
  part_of_speech: string;
  meaning: string;
  example: string;
};

export type HskWord = {
  id: number;
  word: string;
  pinyin: string;
  parts_of_speech: HskPartOfSpeech[];
};

export type CharacterMapItem = {
  character: string;
  pinyin: string;
  meaning: string;
  word: string;
  wordId: number;
};

export type PromptMode = 'word-to-meaning' | 'meaning-to-word';

export type ReviewGrade = 'again' | 'hard' | 'good' | 'easy';

export type FlashcardProgress = {
  ease: number;
  interval: number;
  repetitions: number;
  dueAt: string;
  lastReviewedAt?: string;
  lapses: number;
};
