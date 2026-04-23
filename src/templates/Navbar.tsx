import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { CenteredMenu } from '@/features/landing/CenteredMenu';
import { Section } from '@/features/landing/Section';

import { Logo } from './Logo';

export const Navbar = () => {
  const t = useTranslations('Navbar');

  return (
    <Section className="px-3 py-6">
      <CenteredMenu logo={<Logo />} rightMenu={<></>}>
        <li>
          <Link href="/#flashcards">{t('flashcards')}</Link>
        </li>

        <li>
          <Link href="/#character-map">{t('character_map')}</Link>
        </li>
      </CenteredMenu>
    </Section>
  );
};
