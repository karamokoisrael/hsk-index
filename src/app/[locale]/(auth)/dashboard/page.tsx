import { useTranslations } from 'next-intl';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { DashboardSection } from '@/features/dashboard/DashboardSection';
import { FlashcardStats } from '@/features/dashboard/FlashcardStats';
import { TitleBar } from '@/features/dashboard/TitleBar';

const DashboardIndexPage = () => {
  const t = useTranslations('DashboardIndex');

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

      <div className="grid gap-4 md:grid-cols-2">
        <DashboardSection
          title={t('flashcards_title')}
          description={t('flashcards_description')}
        >
          <Button asChild>
            <Link href="/dashboard/flashcards">{t('flashcards_button')}</Link>
          </Button>
        </DashboardSection>

        <DashboardSection
          title={t('character_map_title')}
          description={t('character_map_description')}
        >
          <Button asChild>
            <Link href="/dashboard/character-map">{t('character_map_button')}</Link>
          </Button>
        </DashboardSection>
      </div>
    </>
  );
};

export default DashboardIndexPage;
