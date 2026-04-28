import { getTranslations } from 'next-intl/server';

import { ForgotPasswordForm } from '@/features/auth/ForgotPasswordForm';

export async function generateMetadata(props: { params: { locale: string } }) {
  const t = await getTranslations({
    locale: props.params.locale,
    namespace: 'ForgotPassword',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

const ForgotPasswordPage = () => {
  return <ForgotPasswordForm />;
};

export default ForgotPasswordPage;
