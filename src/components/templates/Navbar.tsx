'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { UserMenu } from '@/features/auth/UserMenu';
import { CenteredMenu } from '@/features/landing/CenteredMenu';
import { Section } from '@/features/landing/Section';
import { useFlashcardsStore } from '@/stores/useFlashcardsStore';

import { Logo } from './Logo';

export const Navbar = () => {
  const t = useTranslations('Navbar');
  const { user } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const hskLevel = useFlashcardsStore(s => s.hskLevel);
  const openHskModal = useFlashcardsStore(s => s.openHskModal);

  useEffect(() => { setIsMounted(true); }, []);

  return (
    <Section className="px-3 py-6">
      <CenteredMenu
        logo={<Logo />}
        rightMenu={(
          <>
            {isMounted && (
              <li>
                <Button variant="outline" size="sm" onClick={openHskModal}>
                  HSK
                  {' '}
                  {hskLevel}
                </Button>
              </li>
            )}
            {user
              ? (
                  <li>
                    <UserMenu />
                  </li>
                )
              : (
                  <>
                    <li>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href="/sign-in">{t('sign_in')}</Link>
                      </Button>
                    </li>
                    <li>
                      <Button size="sm" asChild>
                        <Link href="/sign-up">{t('sign_up')}</Link>
                      </Button>
                    </li>
                  </>
                )}
          </>
        )}
      >
        <li>
          <Link href="/#flashcards">{t('flashcards')}</Link>
        </li>

        <li>
          <Link href="/#character-map">{t('character_map')}</Link>
        </li>

        {user && (
          <li>
            <Link href="/dashboard/character-map?view=explorer#collections">Collections</Link>
          </li>
        )}
      </CenteredMenu>
    </Section>
  );
};
