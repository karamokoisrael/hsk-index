'use client';

import { useCollectionSync } from '@/hooks/useCollectionSync';
import { useFlashcardSync } from '@/hooks/useFlashcardSync';

export function SyncProvider() {
  useFlashcardSync();
  useCollectionSync();
  return null;
}
