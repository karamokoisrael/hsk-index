import { useTranslations } from 'next-intl';

import { FlashcardTrainer } from '@/features/flashcards/FlashcardTrainer';
import { DashboardSection } from '@/features/dashboard/DashboardSection';
import { TitleBar } from '@/features/dashboard/TitleBar';

const FlashcardsPage = () => {
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
            resetProgress: t('reset_progress'),
            gradeAgain: t('grade_again'),
            gradeHard: t('grade_hard'),
            gradeGood: t('grade_good'),
            gradeEasy: t('grade_easy'),
            options: t('options'),
            maxNewPerDay: t('max_new_per_day'),
            maxReviewsPerDay: t('max_reviews_per_day'),
            saveOptions: t('save_options'),
          }}
        />
      </DashboardSection>
    </>
  );
};

export default FlashcardsPage;
