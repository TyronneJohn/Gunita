import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Button } from '@/components/button';
import { DeckArt } from '@/components/deck-art';
import { EmptyState } from '@/components/empty-state';
import { PaperCard } from '@/components/paper-card';
import { Screen } from '@/components/screen';
import { colors } from '@/constants/theme';
import { getDeck } from '@/data/decks';

export default function DeckScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const deck = getDeck(id);

  return (
    <Screen padBottom>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        onPress={() => router.back()}
        className="h-11 w-11 items-center justify-center rounded-full border border-sand bg-paper active:opacity-70">
        <Ionicons name="chevron-back" size={22} color={colors.cocoa} />
      </Pressable>

      {!deck ? (
        <EmptyState
          className="mt-6"
          icon="help-circle-outline"
          title="Deck not found"
          body="Hindi namin mahanap ang deck na ito."
        />
      ) : (
        <>
          <View
            className="mt-5 h-56 items-center justify-center rounded-[32px]"
            style={{ backgroundColor: deck.color }}>
            <DeckArt icon={deck.icon} scale={1.4} />
          </View>

          <AppText variant="display" tone="cocoa" className="mt-6">
            {deck.title}
          </AppText>
          <AppText variant="label" tone="sage" className="mt-1">
            {deck.tagline}
          </AppText>
          <AppText variant="body" tone="muted" className="mt-4">
            {deck.description}
          </AppText>

          <PaperCard className="mt-6 flex-row items-center gap-3 p-5">
            <Ionicons name="hourglass-outline" size={22} color={colors.cocoaSoft} />
            <AppText variant="body" tone="ink" className="flex-1">
              Inihahanda pa namin ang mga cards ng deck na ito. Coming soon!
            </AppText>
          </PaperCard>

          <Button className="mt-6" label="Draw a card" icon="albums-outline" disabled />
        </>
      )}
    </Screen>
  );
}
