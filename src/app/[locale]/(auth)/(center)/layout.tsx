import { redirect } from 'next/navigation';

import { getSession } from '@/libs/Auth';
import { AppConfig } from '@/utils/AppConfig';

export default async function CenteredLayout(props: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const session = await getSession();

  if (session) {
    const isDefault = props.params.locale === AppConfig.defaultLocale;
    redirect(isDefault ? '/dashboard' : `/${props.params.locale}/dashboard`);
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      {props.children}
    </div>
  );
}
