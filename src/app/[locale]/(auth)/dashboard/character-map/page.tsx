import { useTranslations } from 'next-intl';

import { CharacterMap } from '@/features/character-map/CharacterMap';
import { DashboardSection } from '@/features/dashboard/DashboardSection';
import { TitleBar } from '@/features/dashboard/TitleBar';

const CharacterMapPage = () => {
  const t = useTranslations('CharacterMap');

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
            markLearned: t('mark_learned'),
            markNotLearned: t('mark_not_learned'),
            close: t('close'),
            answer: t('answer'),
            example: t('example'),
            searchPlaceholder: t('search_placeholder'),
            results: t('results'),
            empty: t('empty'),
            basedOnWord: t('based_on_word'),
          }}
        />
      </DashboardSection>
    </>
  );
};

export default CharacterMapPage;
