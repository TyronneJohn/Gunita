import { router } from 'expo-router';
import { View } from 'react-native';

import { DeckTile } from '@/components/deck-tile';
import { PageHeader } from '@/components/page-header';
import { Screen } from '@/components/screen';
import { decks } from '@/data/decks';

export default function ExploreScreen() {
  return (
    <Screen>
      <PageHeader
        eyebrow="Explore"
        title="Pumili ng deck"
        subtitle="Each deck is a different kind of kwentuhan — with yourself, your barkada, or someone you love."
      />
      <View className="mt-6 flex-row flex-wrap justify-between gap-y-4">
        {decks.map((deck) => (
          <DeckTile
            key={deck.id}
            deck={deck}
            onPress={() => router.push({ pathname: '/deck/[id]', params: { id: deck.id } })}
          />
        ))}
      </View>
    </Screen>
  );
}
