import { getTranslations } from 'next-intl/server';

import { SignInForm } from '@/features/auth/SignInForm';
import { AppConfig } from '@/utils/appConfig';

export async function generateMetadata(props: { params: { locale: string } }) {
  const t = await getTranslations({
    locale: props.params.locale,
    namespace: 'SignIn',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

const SignInPage = (props: { params: { locale: string } }) => {
  const isDefault = props.params.locale === AppConfig.defaultLocale;
  const dashboardUrl = isDefault ? '/' : `/${props.params.locale}`;

  return <SignInForm dashboardUrl={dashboardUrl} />;
};

export default SignInPage;
