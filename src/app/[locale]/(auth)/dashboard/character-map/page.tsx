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
