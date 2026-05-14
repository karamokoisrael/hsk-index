import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import { Navbar } from '@/components/templates/Navbar';
import { CharacterMap } from '@/features/character-map/CharacterMap';
import { FlashcardStats } from '@/features/dashboard/FlashcardStats';
import { FlashcardTrainer } from '@/features/flashcards/FlashcardTrainer';

export async function generateMetadata(props: { params: { locale: string } }) {
  const t = await getTranslations({
    locale: props.params.locale,
    namespace: 'Index',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

const IndexPage = async (props: { params: { locale: string } }) => {
  unstable_setRequestLocale(props.params.locale);

  const flashcardsT = await getTranslations({
    locale: props.params.locale,
    namespace: 'Flashcards',
  });

  const characterMapT = await getTranslations({
    locale: props.params.locale,
    namespace: 'CharacterMap',
  });

  const dashboardT = await getTranslations({
    locale: props.params.locale,
    namespace: 'DashboardIndex',
  });

  return (
    <>
      <Navbar />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8">
        <section id="flashcards" className="scroll-mt-24 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            {flashcardsT('section_title')}
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            {flashcardsT('section_description')}
          </p>
          <div className="mt-4">
            <FlashcardTrainer
              labels={{
                dueCards: flashcardsT('due_cards'),
                studiedCards: flashcardsT('studied_cards'),
                noCardsTitle: flashcardsT('no_cards_title'),
                noCardsDescription: flashcardsT('no_cards_description'),
                revealAnswer: flashcardsT('reveal_answer'),
                prompt: flashcardsT('prompt'),
                showPromptWord: flashcardsT('show_prompt_word'),
                showPromptMeaning: flashcardsT('show_prompt_meaning'),
                answer: flashcardsT('answer'),
                example: flashcardsT('example'),
                gradeAgain: flashcardsT('grade_again'),
                gradeHard: flashcardsT('grade_hard'),
                gradeGood: flashcardsT('grade_good'),
                gradeEasy: flashcardsT('grade_easy'),
                options: flashcardsT('options'),
                maxNewPerDay: flashcardsT('max_new_per_day'),
                maxReviewsPerDay: flashcardsT('max_reviews_per_day'),
                saveOptions: flashcardsT('save_options'),
                addMoreCards: flashcardsT('add_more_cards'),
                hskLevelCurrent: flashcardsT('hsk_level_current'),
                hskLevelChange: flashcardsT('hsk_level_change'),
                findCommonChars: flashcardsT('find_common_chars'),
                addToCollection: flashcardsT('add_to_collection'),
                relatedWordsTitle: flashcardsT('related_words_title'),
                noRelatedWords: flashcardsT('no_related_words'),
                addToCollectionTitle: flashcardsT('add_to_collection_title'),
                noCollections: flashcardsT('no_collections'),
              }}
            />
          </div>
        </section>

        <section id="character-map" className="scroll-mt-24 space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">
            {characterMapT('section_title')}
          </h2>
          <p className="text-sm text-muted-foreground sm:text-base">
            {characterMapT('section_description')}
          </p>
          <div className="mt-4">
            <CharacterMap
              labels={{
                viewCommon: characterMapT('view_common'),
                viewExplorer: characterMapT('view_explorer'),
                viewCollections: characterMapT('view_collections'),
                commonCharacters: characterMapT('common_characters'),
                commonHint: characterMapT('common_hint'),
                appearsInWords: characterMapT('appears_in_words'),
                relatedWords: characterMapT('related_words'),
                openStudy: characterMapT('open_study'),
                studyCharacter: characterMapT('study_character'),
                close: characterMapT('close'),
                revealAnswer: flashcardsT('reveal_answer'),
                gradeAgain: flashcardsT('grade_again'),
                gradeHard: flashcardsT('grade_hard'),
                gradeGood: flashcardsT('grade_good'),
                gradeEasy: flashcardsT('grade_easy'),
                answer: characterMapT('answer'),
                example: characterMapT('example'),
                searchPlaceholder: characterMapT('search_placeholder'),
                results: characterMapT('results'),
                empty: characterMapT('empty'),
                basedOnWord: characterMapT('based_on_word'),
                hideDetails: characterMapT('hide_details'),
                showDetails: characterMapT('show_details'),
                addToCollection: characterMapT('add_to_collection'),
                noCollectionsHint: characterMapT('no_collections_hint'),
                collectionLabels: {
                  new: characterMapT('collection_new'),
                  create: characterMapT('collection_create'),
                  namePlaceholder: characterMapT('collection_name_placeholder'),
                  emptyState: characterMapT('collection_empty_state'),
                  emptyWords: characterMapT('collection_empty_words'),
                  noWords: characterMapT('collection_no_words'),
                  studyTitle: characterMapT('collection_study_title'),
                  wordsLabel: characterMapT('collection_words_label'),
                  studyBtn: characterMapT('collection_study_btn'),
                  deleteBtn: characterMapT('collection_delete_btn'),
                  searchWordsPlaceholder: characterMapT('collection_search_words_placeholder'),
                  back: characterMapT('collection_back'),
                  revealAnswer: flashcardsT('reveal_answer'),
                  gradeAgain: flashcardsT('grade_again'),
                  gradeHard: flashcardsT('grade_hard'),
                  gradeGood: flashcardsT('grade_good'),
                  gradeEasy: flashcardsT('grade_easy'),
                  answer: characterMapT('answer'),
                  example: characterMapT('example'),
                  close: characterMapT('close'),
                },
              }}
            />
          </div>
        </section>

        <section id="progress" className="scroll-mt-24 space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">
            {dashboardT('study_stats_title')}
          </h2>
          <p className="text-sm text-muted-foreground sm:text-base">
            {dashboardT('study_stats_description')}
          </p>
          <div className="mt-4">
            <FlashcardStats
              labels={{
                todayTitle: dashboardT('study_stats_today_title'),
                overallTitle: dashboardT('study_stats_overall_title'),
                cardsTouchedToday: dashboardT('study_stats_touched_today'),
                totalMarkedOverall: dashboardT('study_stats_total_marked'),
                again: dashboardT('study_stats_again'),
                hard: dashboardT('study_stats_hard'),
                good: dashboardT('study_stats_good'),
                easy: dashboardT('study_stats_easy'),
              }}
            />
          </div>
        </section>
      </main>

      <footer className="mt-20 border-t py-6 text-center text-sm text-muted-foreground">
        ©
        {' '}
        {new Date().getFullYear()}
        {' '}
        HSK Index. All rights reserved.
      </footer>
    </>
  );
};

export default IndexPage;
