'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type Collection = {
  id: string;
  name: string;
  characters: string[];
  isPublic?: boolean;
};

type CollectionsStore = {
  collections: Collection[];
  loadCollections: (collections: Collection[]) => void;
  createCollection: (name: string) => string;
  deleteCollection: (id: string) => void;
  renameCollection: (id: string, name: string) => void;
  addCharacter: (collectionId: string, character: string) => void;
  removeCharacter: (collectionId: string, character: string) => void;
};

export const useCollectionsStore = create<CollectionsStore>()(
  persist(
    set => ({
      collections: [],

      loadCollections: collections => set({ collections }),

      createCollection: (name) => {
        const id = crypto.randomUUID();
        set(state => ({
          collections: [...state.collections, { id, name, characters: [] }],
        }));
        return id;
      },

      // Public collections cannot be deleted
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

      addCharacter: (collectionId, character) =>
        set(state => ({
          collections: state.collections.map(c =>
            c.id === collectionId && !c.isPublic && !c.characters.includes(character)
              ? { ...c, characters: [...c.characters, character] }
              : c,
          ),
        })),

      removeCharacter: (collectionId, character) =>
        set(state => ({
          collections: state.collections.map(c =>
            c.id === collectionId && !c.isPublic
              ? { ...c, characters: c.characters.filter(ch => ch !== character) }
              : c,
          ),
        })),
    }),
    {
      name: 'hsk-collections-store',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
