import { Pressable, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { DeckArt } from '@/components/deck-art';
import { shadows } from '@/constants/theme';
import type { Deck } from '@/data/decks';

type DeckTileProps = {
  deck: Deck;
  /** "featured" is a fixed-width tile for horizontal lists; "grid" fills its column. */
  variant?: 'featured' | 'grid';
  onPress?: () => void;
};

export function DeckTile({ deck, variant = 'grid', onPress }: DeckTileProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${deck.title} deck`}
      onPress={onPress}
      className="active:opacity-90"
      style={{ width: variant === 'featured' ? 172 : '48%' }}>
      <View
        className="overflow-hidden rounded-3xl"
        style={{ backgroundColor: deck.color, boxShadow: shadows.card }}>
        <View className="h-32 items-center justify-center">
          <DeckArt icon={deck.icon} scale={0.85} />
        </View>
        <View className="bg-paper px-4 pb-4 pt-3">
          <AppText variant="heading" tone="cocoa">
            {deck.title}
          </AppText>
          <AppText variant="caption" tone="muted" numberOfLines={2} className="mt-0.5">
            {deck.tagline}
          </AppText>
        </View>
      </View>
    </Pressable>
  );
}
