import Ionicons from '@expo/vector-icons/Ionicons';
import { View } from 'react-native';

import { colors, shadows } from '@/constants/theme';
import type { Deck } from '@/data/decks';

/** The face-down side of a card, used in the bundle and on the table. */
export function CardBack({ deck, width }: { deck: Deck; width: number }) {
  const height = width * 1.4;
  const radius = Math.max(10, width * 0.12);
  const inset = Math.max(5, width * 0.06);
  const badge = width * 0.38;

  return (
    <View
      className="items-center justify-center overflow-hidden"
      style={{
        width,
        height,
        borderRadius: radius,
        backgroundColor: deck.color,
        boxShadow: shadows.card,
        experimental_backgroundImage:
          'linear-gradient(160deg, rgba(255, 251, 245, 0.45) 0%, rgba(255, 251, 245, 0) 55%, rgba(92, 64, 51, 0.12) 100%)',
      }}>
      <View
        style={{
          position: 'absolute',
          top: inset,
          left: inset,
          right: inset,
          bottom: inset,
          borderWidth: 1,
          borderColor: 'rgba(255, 251, 245, 0.7)',
          borderRadius: radius * 0.6,
        }}
      />
      <View
        className="items-center justify-center rounded-full"
        style={{ width: badge, height: badge, backgroundColor: 'rgba(255, 251, 245, 0.85)' }}>
        <Ionicons name={deck.icon} size={badge * 0.5} color={colors.cocoa} />
      </View>
    </View>
  );
}
