import { useTranslations } from 'next-intl';

import { CharacterMap } from '@/features/character-map/CharacterMap';
import { DashboardSection } from '@/features/dashboard/DashboardSection';
import { TitleBar } from '@/features/dashboard/TitleBar';

const CharacterMapPage = () => {
  const t = useTranslations('CharacterMap');
  const flashcardsT = useTranslations('Flashcards');

  return (
    <>
      <TitleBar title={t('title_bar')} description={t('title_bar_description')} />

      <DashboardSection
        title={t('section_title')}
        description={t('section_description')}
      >
        <CharacterMap
          labels={{
            viewCommon: t('view_common'),
            viewExplorer: t('view_explorer'),
            commonCharacters: t('common_characters'),
            commonHint: t('common_hint'),
            appearsInWords: t('appears_in_words'),
            relatedWords: t('related_words'),
            openStudy: t('open_study'),
            studyCharacter: t('study_character'),
            close: t('close'),
            revealAnswer: flashcardsT('reveal_answer'),
            gradeAgain: flashcardsT('grade_again'),
            gradeHard: flashcardsT('grade_hard'),
            gradeGood: flashcardsT('grade_good'),
            gradeEasy: flashcardsT('grade_easy'),
            answer: t('answer'),
            example: t('example'),
            searchPlaceholder: t('search_placeholder'),
            results: t('results'),
            empty: t('empty'),
            basedOnWord: t('based_on_word'),
            hideDetails: t('hide_details'),
            showDetails: t('show_details'),
          }}
        />
      </DashboardSection>
    </>
  );
};

export default CharacterMapPage;
