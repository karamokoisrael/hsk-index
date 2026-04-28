import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';

import { ResetPasswordForm } from '@/features/auth/ResetPasswordForm';

export async function generateMetadata(props: { params: { locale: string } }) {
  const t = await getTranslations({
    locale: props.params.locale,
    namespace: 'ResetPassword',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

const ResetPasswordPage = () => {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
};

export default ResetPasswordPage;
