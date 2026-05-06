import { useTranslations } from 'next-intl';

import { FlashcardTrainer } from '@/features/flashcards/FlashcardTrainer';
import { StudyHistoryTable } from '@/features/flashcards/StudyHistoryTable';
import { DashboardSection } from '@/features/dashboard/DashboardSection';
import { TitleBar } from '@/features/dashboard/TitleBar';

const FlashcardsPage = (props: { params: { locale: string } }) => {
  const t = useTranslations('Flashcards');

  return (
    <>
      <TitleBar title={t('title_bar')} description={t('title_bar_description')} />

      <DashboardSection
        title={t('section_title')}
        description={t('section_description')}
      >
        <FlashcardTrainer
          labels={{
            dueCards: t('due_cards'),
            studiedCards: t('studied_cards'),
            noCardsTitle: t('no_cards_title'),
            noCardsDescription: t('no_cards_description'),
            revealAnswer: t('reveal_answer'),
            prompt: t('prompt'),
            showPromptWord: t('show_prompt_word'),
            showPromptMeaning: t('show_prompt_meaning'),
            answer: t('answer'),
            example: t('example'),
            gradeAgain: t('grade_again'),
            gradeHard: t('grade_hard'),
            gradeGood: t('grade_good'),
            gradeEasy: t('grade_easy'),
            options: t('options'),
            maxNewPerDay: t('max_new_per_day'),
            maxReviewsPerDay: t('max_reviews_per_day'),
            saveOptions: t('save_options'),
            addMoreCards: t('add_more_cards'),
            hskLevelCurrent: t('hsk_level_current'),
            hskLevelChange: t('hsk_level_change'),
          }}
        />
      </DashboardSection>

      <DashboardSection title={t('history_title')} description="">
        <StudyHistoryTable
          locale={props.params.locale}
          labels={{
            title: t('history_title'),
            date: t('history_date'),
            again: t('history_again'),
            hard: t('history_hard'),
            good: t('history_good'),
            easy: t('history_easy'),
            total: t('history_total'),
            empty: t('history_empty'),
            showMore: t('history_show_more'),
            showLess: t('history_show_less'),
          }}
        />
      </DashboardSection>
    </>
  );
};

export default FlashcardsPage;
