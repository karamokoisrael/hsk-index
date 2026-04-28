import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { EmailVerificationBanner } from '@/features/auth/EmailVerificationBanner';
import { DashboardHeader } from '@/features/dashboard/DashboardHeader';
import { getSession } from '@/libs/services/auth';

export async function generateMetadata(props: { params: { locale: string } }) {
  const t = await getTranslations({
    locale: props.params.locale,
    namespace: 'Dashboard',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function DashboardLayout(props: { children: React.ReactNode }) {
  const t = useTranslations('DashboardLayout');
  const session = await getSession();

  return (
    <>
      {session?.emailVerified === false && (
        <EmailVerificationBanner email={session.email} />
      )}
      <div className="shadow-md">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between px-3 py-4">
          <DashboardHeader
            menu={[
              {
                href: '/dashboard',
                label: t('home'),
              },
              {
                href: '/dashboard/flashcards',
                label: t('flashcards'),
              },
              {
                href: '/dashboard/character-map',
                label: t('character_map'),
              },
              // PRO: Link to the /dashboard/todos page
              // PRO: Link to the /dashboard/billing page
            ]}
          />
        </div>
      </div>

      <div className="min-h-[calc(100vh-72px)] bg-muted">
        <div className="mx-auto max-w-screen-xl px-3 pb-16 pt-6">
          {props.children}
        </div>
      </div>
    </>
  );
}

export const dynamic = 'force-dynamic';
