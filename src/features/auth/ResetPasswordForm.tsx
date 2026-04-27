'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const ResetPasswordForm = () => {
  const t = useTranslations('ResetPassword');
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(t('password_mismatch'));
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      if (res.ok) {
        setSuccess(true);
        return;
      }

      let message = t('generic_error');
      try {
        const data = await res.json();
        if (res.status === 400 || res.status === 404) {
          message = t('invalid_token');
        } else {
          message = data.error ?? message;
        }
      } catch {}
      setError(message);
    } catch {
      setError(t('generic_error'));
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="w-full max-w-md space-y-6 rounded-xl border bg-background p-8 shadow-sm">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
          <p className="text-sm text-destructive">{t('invalid_token')}</p>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/forgot-password" className="font-medium text-primary underline underline-offset-4">
            {t('request_new_link')}
          </Link>
        </p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="w-full max-w-md space-y-6 rounded-xl border bg-background p-8 shadow-sm">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
          <p className="text-sm text-muted-foreground">{t('success')}</p>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/sign-in" className="font-medium text-primary underline underline-offset-4">
            {t('back_to_sign_in')}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-6 rounded-xl border bg-background p-8 shadow-sm">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">{t('password_label')}</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            placeholder="••••••••"
            minLength={8}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password">{t('confirm_password_label')}</Label>
          <Input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? t('loading_button') : t('submit_button')}
        </Button>
      </form>
    </div>
  );
};
