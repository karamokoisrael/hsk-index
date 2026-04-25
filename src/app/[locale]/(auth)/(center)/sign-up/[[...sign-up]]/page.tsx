import { getTranslations } from 'next-intl/server';

import { SignUpForm } from '@/features/auth/SignUpForm';
import { AppConfig } from '@/utils/AppConfig';

export async function generateMetadata(props: { params: { locale: string } }) {
  const t = await getTranslations({
    locale: props.params.locale,
    namespace: 'SignUp',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

const SignUpPage = (props: { params: { locale: string } }) => {
  const isDefault = props.params.locale === AppConfig.defaultLocale;
  const dashboardUrl = isDefault ? '/' : `/${props.params.locale}`;

  return <SignUpForm dashboardUrl={dashboardUrl} />;
};

export default SignUpPage;
