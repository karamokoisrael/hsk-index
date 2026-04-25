'use client';

import { useFlashcardSync } from '@/hooks/useFlashcardSync';

export function SyncProvider() {
  useFlashcardSync();
  return null;
}
