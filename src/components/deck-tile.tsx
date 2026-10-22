import { Pressable, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { DeckArt } from '@/components/deck-art';
import { useAppTheme } from '@/lib/theme';
import type { Deck } from '@/data/decks';
import { useLanguage } from '@/i18n';

type DeckTileProps = {
  deck: Deck;
  /** "featured" is a fixed-width tile for horizontal lists; "grid" fills its column. */
  variant?: 'featured' | 'grid';
  onPress?: () => void;
  /** Short progress label shown on the art, e.g. "4/12". */
  progress?: string;
};

export function DeckTile({ deck, variant = 'grid', onPress, progress }: DeckTileProps) {
  const { t, pick } = useLanguage();
  const { shadows } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('common.deckName', { deck: deck.title })}
      onPress={onPress}
      className="active:opacity-90"
      style={{ width: variant === 'featured' ? 172 : '48%' }}>
      <View
        className="overflow-hidden rounded-3xl"
        style={{ backgroundColor: deck.color, boxShadow: shadows.card }}>
        <View className="h-32 items-center justify-center">
          <DeckArt icon={deck.icon} scale={0.85} />
          {progress && (
            <View className="absolute right-3 top-3 rounded-full bg-paper/90 px-2.5 py-1">
              <AppText variant="caption" tone="cocoa">
                {progress}
              </AppText>
            </View>
          )}
        </View>
        <View className="bg-paper px-4 pb-4 pt-3">
          <AppText variant="heading" tone="cocoa">
            {deck.title}
          </AppText>
          <AppText variant="caption" tone="muted" numberOfLines={2} className="mt-0.5">
            {pick(deck.tagline)}
          </AppText>
        </View>
      </View>
    </Pressable>
  );
}
