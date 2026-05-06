'use client';

import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardSection } from '@/features/dashboard/DashboardSection';
import { FlashcardStats } from '@/features/dashboard/FlashcardStats';
import { TitleBar } from '@/features/dashboard/TitleBar';

const AccountPage = () => {
  const t = useTranslations('DashboardIndex');
  const { user, signOut } = useAuth();

  return (
    <>
      <TitleBar
        title={t('title_bar')}
        description={t('title_bar_description')}
      />

      <DashboardSection
        title={t('study_stats_title')}
        description={t('study_stats_description')}
      >
        <FlashcardStats
          labels={{
            todayTitle: t('study_stats_today_title'),
            overallTitle: t('study_stats_overall_title'),
            cardsTouchedToday: t('study_stats_touched_today'),
            totalMarkedOverall: t('study_stats_total_marked'),
            again: t('study_stats_again'),
            hard: t('study_stats_hard'),
            good: t('study_stats_good'),
            easy: t('study_stats_easy'),
          }}
        />
      </DashboardSection>

      <DashboardSection
        title={t('account_title')}
        description={t('account_description')}
      >
        <div className="space-y-4 rounded-md border bg-background p-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t('email_label')}
            </p>
            <p className="mt-1 text-sm font-medium">{user?.email ?? '—'}</p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t('user_id_label')}
            </p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              {user?.userId ?? '—'}
            </p>
          </div>

          <div className="pt-1">
            <Button type="button" variant="outline" onClick={signOut}>
              {t('sign_out')}
            </Button>
          </div>
        </div>
      </DashboardSection>
    </>
  );
};

export default AccountPage;