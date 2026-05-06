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
import { Button } from '@/components/ui/button';
import { HskLevelSelector } from '@/features/flashcards/HskLevelSelector';
import { useFlashcardsStore } from '@/stores/useFlashcardsStore';
import type { HskLevel } from '@/libs/constants/hskLevels';

export const HskLevelModal = () => {
  const t = useTranslations('Flashcards');
  const [isMounted, setIsMounted] = useState(false);
  const [pendingLevel, setPendingLevel] = useState<HskLevel | null>(null);

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
        setHskLevel(hskLevel);
      }
      setPendingLevel(null);
      closeHskModal();
    }
  };

  const handleSelect = (level: HskLevel) => {
    if (isLevelSelected) {
      setPendingLevel(level);
    } else {
      setHskLevel(level);
      closeHskModal();
    }
  };

  const handleConfirm = () => {
    if (pendingLevel !== null) {
      setHskLevel(pendingLevel);
    }
    setPendingLevel(null);
    closeHskModal();
  };

  return (
    <Dialog open={hskModalOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl" onOpenAutoFocus={e => e.preventDefault()}>
        {pendingLevel !== null
          ? (
              <>
                <DialogHeader>
                  <DialogTitle>{t('hsk_level_title')}</DialogTitle>
                  <DialogDescription className="text-destructive">
                    {t('hsk_level_reset_warning')}
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setPendingLevel(null)}>
                    {t('hsk_level_reset_back')}
                  </Button>
                  <Button variant="destructive" onClick={handleConfirm}>
                    {t('hsk_level_reset_confirm')}
                  </Button>
                </div>
              </>
            )
          : (
              <>
                <DialogHeader>
                  <DialogTitle>{t('hsk_level_title')}</DialogTitle>
                  <DialogDescription>{t('hsk_level_subtitle')}</DialogDescription>
                </DialogHeader>
                <HskLevelSelector
                  currentLevel={hskLevel}
                  onSelect={handleSelect}
                  labels={{
                    totalWords: t('hsk_level_total_words'),
                    newWords: t('hsk_level_new_words'),
                  }}
                />
              </>
            )}
      </DialogContent>
    </Dialog>
  );
};
