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
            viewCollections: t('view_collections'),
            addToCollection: t('add_to_collection'),
            noCollectionsHint: t('no_collections_hint'),
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
            collectionLabels: {
              new: t('collection_new'),
              create: t('collection_create'),
              namePlaceholder: t('collection_name_placeholder'),
              emptyState: t('collection_empty_state'),
              emptyChars: t('collection_empty_chars'),
              noWords: t('collection_no_words'),
              studyTitle: t('collection_study_title'),
              charsLabel: t('collection_chars_label'),
              wordsLabel: t('collection_words_label'),
              studyBtn: t('collection_study_btn'),
              deleteBtn: t('collection_delete_btn'),
              addCharPlaceholder: t('collection_add_char_placeholder'),
              addCharBtn: t('collection_add_char_btn'),
              back: t('collection_back'),
              revealAnswer: flashcardsT('reveal_answer'),
              gradeAgain: flashcardsT('grade_again'),
              gradeHard: flashcardsT('grade_hard'),
              gradeGood: flashcardsT('grade_good'),
              gradeEasy: flashcardsT('grade_easy'),
              answer: t('answer'),
              example: t('example'),
              close: t('close'),
            },
          }}
        />
      </DashboardSection>
    </>
  );
};

export default CharacterMapPage;
