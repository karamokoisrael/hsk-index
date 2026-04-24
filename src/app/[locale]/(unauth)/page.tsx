import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import { CharacterMap } from '@/features/character-map/CharacterMap';
import { FlashcardTrainer } from '@/features/flashcards/FlashcardTrainer';
import { Navbar } from '@/templates/Navbar';

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

  return (
    <>
      <Navbar />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8">
        <section id="flashcards" className="space-y-2 scroll-mt-24">
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
                resetProgress: flashcardsT('reset_progress'),
                gradeAgain: flashcardsT('grade_again'),
                gradeHard: flashcardsT('grade_hard'),
                gradeGood: flashcardsT('grade_good'),
                gradeEasy: flashcardsT('grade_easy'),
                options: flashcardsT('options'),
                maxNewPerDay: flashcardsT('max_new_per_day'),
                maxReviewsPerDay: flashcardsT('max_reviews_per_day'),
                saveOptions: flashcardsT('save_options'),
                addMoreCards: flashcardsT('add_more_cards'),
              }}
            />
          </div>
        </section>

        <section id="character-map" className="space-y-2 scroll-mt-24">
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
              }}
            />
          </div>
        </section>
      </main>
    </>
  );
};

export default IndexPage;
