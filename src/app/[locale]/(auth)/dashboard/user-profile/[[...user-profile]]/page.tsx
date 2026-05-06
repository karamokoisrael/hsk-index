import { getTranslations } from 'next-intl/server';

import { DashboardSection } from '@/features/dashboard/DashboardSection';
import { TitleBar } from '@/features/dashboard/TitleBar';
import { getSession } from '@/libs/services/auth';

export async function generateMetadata(props: { params: { locale: string } }) {
  const t = await getTranslations({
    locale: props.params.locale,
    namespace: 'UserProfile',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

const UserProfilePage = async () => {
  const t = await getTranslations('UserProfile');
  const session = await getSession();

  return (
    <>
      <TitleBar
        title={t('title_bar')}
        description={t('title_bar_description')}
      />

      <DashboardSection
        title={t('section_title')}
        description={t('section_description')}
      >
        <div className="space-y-3 rounded-md border bg-background p-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t('email_label')}
            </p>
            <p className="mt-1 text-sm font-medium">{session?.email}</p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t('user_id_label')}
            </p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              {session?.userId}
            </p>
          </div>
        </div>
      </DashboardSection>
    </>
  );
};

export default UserProfilePage;
