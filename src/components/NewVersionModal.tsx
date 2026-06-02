'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Sparkles } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export const NewVersionModal = () => {
  const t = useTranslations('NewVersionModal');
  const [open, setOpen] = useState(true);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md" onOpenAutoFocus={e => e.preventDefault()}>
        <DialogHeader>
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="size-5 text-yellow-500" />
            <DialogTitle className="text-xl">{t('title')}</DialogTitle>
          </div>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        <ul className="space-y-2 py-2">
          <li className="flex items-start gap-2 text-sm">
            <span className="mt-0.5 text-green-500">✓</span>
            <span>{t('feature_hsk3')}</span>
          </li>
          <li className="flex items-start gap-2 text-sm">
            <span className="mt-0.5 text-green-500">✓</span>
            <span>{t('feature_levels')}</span>
          </li>
          <li className="flex items-start gap-2 text-sm">
            <span className="mt-0.5 text-green-500">✓</span>
            <span>{t('feature_audio')}</span>
          </li>
        </ul>

        <div className="flex flex-col gap-2 pt-1 sm:flex-row">
          <Button asChild className="flex-1">
            <a href="https://hsk-tools.karamokoisrael.tech/">
              {t('cta')}
            </a>
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>
            {t('dismiss')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
