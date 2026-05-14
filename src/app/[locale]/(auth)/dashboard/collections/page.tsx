'use client';

import { useTranslations } from 'next-intl';

import { CollectionsView } from '@/features/collections/CollectionsView';
import { DashboardSection } from '@/features/dashboard/DashboardSection';
import { TitleBar } from '@/features/dashboard/TitleBar';

const CollectionsPage = () => {
  const t = useTranslations('CharacterMap');
  const flashcardsT = useTranslations('Flashcards');

  return (
    <>
      <TitleBar
        title={t('title_bar') || 'Collections'}
        description={t('title_bar_description') || 'Manage your personal character and word collections'}
      />

      <DashboardSection
        title={t('section_title') || 'My Collections'}
        description={t('section_description') || 'Create and organize collections for focused studying'}
      >
        <CollectionsView
          labels={{
            new: t('collection_new'),
            create: t('collection_create'),
            namePlaceholder: t('collection_name_placeholder'),
            emptyState: t('collection_empty_state'),
            emptyWords: t('collection_empty_words'),
            noWords: t('collection_no_words'),
            studyTitle: t('collection_study_title'),
            wordsLabel: t('collection_words_label'),
            studyBtn: t('collection_study_btn'),
            deleteBtn: t('collection_delete_btn'),
            searchWordsPlaceholder: t('collection_search_words_placeholder'),
            back: t('collection_back'),
            revealAnswer: flashcardsT('reveal_answer'),
            gradeAgain: flashcardsT('grade_again'),
            gradeHard: flashcardsT('grade_hard'),
            gradeGood: flashcardsT('grade_good'),
            gradeEasy: flashcardsT('grade_easy'),
            answer: t('answer'),
            example: t('example'),
            close: t('close'),
            hideDetails: t('collection_hide_details'),
            showDetails: t('collection_show_details'),
          }}
        />
      </DashboardSection>
    </>
  );
};

export default CollectionsPage;
