import { router } from 'expo-router';
import { View } from 'react-native';

import { DeckTile } from '@/components/deck-tile';
import { PageHeader } from '@/components/page-header';
import { Screen } from '@/components/screen';
import { decks } from '@/data/decks';
import { useLanguage } from '@/i18n';
import { useDeckProgressLabel } from '@/lib/use-deck-progress';

export default function ExploreScreen() {
  const { t } = useLanguage();
  const progressLabel = useDeckProgressLabel();

  return (
    <Screen>
      <PageHeader
        eyebrow={t('explore.eyebrow')}
        title={t('explore.title')}
        subtitle={t('explore.subtitle')}
      />
      <View className="mt-6 flex-row flex-wrap justify-between gap-y-4">
        {decks.map((deck) => (
          <DeckTile
            key={deck.id}
            deck={deck}
            progress={progressLabel(deck.id)}
            onPress={() => router.push({ pathname: '/deck/[id]', params: { id: deck.id } })}
          />
        ))}
      </View>
    </Screen>
  );
}
