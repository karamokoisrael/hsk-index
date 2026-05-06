import { getTranslations } from 'next-intl/server';

import { Navbar } from '@/components/templates/Navbar';
import { EmailVerificationBanner } from '@/features/auth/EmailVerificationBanner';
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

export default async function AccountLayout(props: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <>
      {session?.emailVerified === false && (
        <EmailVerificationBanner email={session.email} />
      )}
      <Navbar />

      <div className="min-h-[calc(100vh-72px)] bg-muted">
        <div className="mx-auto max-w-screen-xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
          {props.children}
        </div>
      </div>
    </>
  );
}

export const dynamic = 'force-dynamic';