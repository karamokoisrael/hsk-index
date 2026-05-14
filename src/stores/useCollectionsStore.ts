'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { hskWords } from '@/libs/services/hskWords';

export type Collection = {
  id: string;
  name: string;
  wordIds: number[];
  isPublic?: boolean;
};

type CollectionsStore = {
  collections: Collection[];
  loadCollections: (collections: any[]) => void;
  createCollection: (name: string) => string;
  deleteCollection: (id: string) => void;
  renameCollection: (id: string, name: string) => void;
  addWord: (collectionId: string, wordId: number) => void;
  removeWord: (collectionId: string, wordId: number) => void;
};

function migrateCollection(col: any): Collection {
  if (Array.isArray(col.wordIds)) return col as Collection;
  if (Array.isArray(col.characters)) {
    const charSet = new Set(col.characters as string[]);
    const wordIds = hskWords
      .filter(w => [...w.word].some(c => charSet.has(c)))
      .map(w => w.id);
    return { id: col.id, name: col.name, wordIds, isPublic: col.isPublic };
  }
  return { id: col.id, name: col.name, wordIds: [], isPublic: col.isPublic };
}

export const useCollectionsStore = create<CollectionsStore>()(
  persist(
    set => ({
      collections: [],

      loadCollections: collections => set({ collections: collections.map(migrateCollection) }),

      createCollection: (name) => {
        const id = crypto.randomUUID();
        set(state => ({
          collections: [...state.collections, { id, name, wordIds: [] }],
        }));
        return id;
      },

      deleteCollection: id =>
        set(state => ({
          collections: state.collections.filter(c => c.id !== id || c.isPublic),
        })),

      renameCollection: (id, name) =>
        set(state => ({
          collections: state.collections.map(c =>
            c.id === id && !c.isPublic ? { ...c, name } : c,
          ),
        })),

      addWord: (collectionId, wordId) =>
        set(state => ({
          collections: state.collections.map(c =>
            c.id === collectionId && !c.isPublic && !c.wordIds.includes(wordId)
              ? { ...c, wordIds: [...c.wordIds, wordId] }
              : c,
          ),
        })),

      removeWord: (collectionId, wordId) =>
        set(state => ({
          collections: state.collections.map(c =>
            c.id === collectionId && !c.isPublic
              ? { ...c, wordIds: c.wordIds.filter(id => id !== wordId) }
              : c,
          ),
        })),
    }),
    {
      name: 'hsk-collections-store',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      migrate: (persistedState: any) => ({
        ...persistedState,
        collections: (persistedState.collections ?? []).map(migrateCollection),
      }),
    },
  ),
);
