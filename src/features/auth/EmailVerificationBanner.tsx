'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

export function EmailVerificationBanner({ email }: { email: string }) {
  const t = useTranslations('EmailVerification');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');

  const handleResend = async () => {
    setStatus('loading');
    try {
      const res = await fetch('/api/auth/resend-verification', { method: 'POST' });
      setStatus(res.ok ? 'sent' : 'error');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="border-b bg-amber-50 px-4 py-2.5 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
      <div className="mx-auto flex max-w-screen-xl items-center justify-between gap-4">
        <span>
          {t('message', { email })}
        </span>
        <div className="shrink-0">
          {status === 'sent'
            ? (
                <span className="text-green-700 dark:text-green-400">{t('sent')}</span>
              )
            : status === 'error'
              ? (
                  <span className="text-destructive">{t('error')}</span>
                )
              : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResend}
                    disabled={status === 'loading'}
                    className="h-7 border-amber-400 bg-transparent text-amber-800 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/40"
                  >
                    {status === 'loading' ? t('resending') : t('resend')}
                  </Button>
                )}
        </div>
      </div>
    </div>
  );
}
