'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { HskLevelSelector } from '@/features/flashcards/HskLevelSelector';
import { useFlashcardsStore } from '@/stores/useFlashcardsStore';

export const HskLevelModal = () => {
  const t = useTranslations('Flashcards');
  const [isMounted, setIsMounted] = useState(false);

  const hskLevel = useFlashcardsStore(s => s.hskLevel);
  const isLevelSelected = useFlashcardsStore(s => s.isLevelSelected);
  const setHskLevel = useFlashcardsStore(s => s.setHskLevel);
  const hskModalOpen = useFlashcardsStore(s => s.hskModalOpen);
  const openHskModal = useFlashcardsStore(s => s.openHskModal);
  const closeHskModal = useFlashcardsStore(s => s.closeHskModal);

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    if (isMounted && !isLevelSelected) {
      openHskModal();
    }
  }, [isMounted, isLevelSelected, openHskModal]);

  if (!isMounted) return null;

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      if (!isLevelSelected) {
        // Closing without selecting confirms the default (HSK 4)
        setHskLevel(hskLevel);
      }
      closeHskModal();
    }
  };

  return (
    <Dialog open={hskModalOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl" onOpenAutoFocus={e => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{t('hsk_level_title')}</DialogTitle>
          <DialogDescription>{t('hsk_level_subtitle')}</DialogDescription>
        </DialogHeader>
        <HskLevelSelector
          currentLevel={hskLevel}
          onSelect={(level) => {
            setHskLevel(level);
            closeHskModal();
          }}
          labels={{
            totalWords: t('hsk_level_total_words'),
            newWords: t('hsk_level_new_words'),
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
