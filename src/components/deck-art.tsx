import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Text, View } from 'react-native';

import { fonts } from '@/constants/theme';
import { useAppTheme } from '@/lib/theme';

type DeckArtProps = {
  icon?: ComponentProps<typeof Ionicons>['name'];
  /** A letter shown on the front card instead of an icon. */
  glyph?: string;
  /** Colors of the two tilted cards behind the front card. */
  backColors?: [string, string];
  scale?: number;
};

/** A small fanned stack of three cards — the visual motif of Gunita. */
export function DeckArt({
  icon,
  glyph,
  backColors = ['rgba(255, 251, 245, 0.45)', 'rgba(255, 251, 245, 0.7)'],
  scale = 1,
}: DeckArtProps) {
  const { colors, shadows } = useAppTheme();
  const width = 52 * scale;
  const height = 72 * scale;
  const card = { width, height, borderRadius: 12 * scale };

  return (
    <View
      style={{ width: width * 1.9, height: height * 1.3 }}
      className="items-center justify-center">
      <View
        style={[
          card,
          {
            position: 'absolute',
            backgroundColor: backColors[0],
            transform: [{ translateX: -14 * scale }, { rotate: '-12deg' }],
          },
        ]}
      />
      <View
        style={[
          card,
          {
            position: 'absolute',
            backgroundColor: backColors[1],
            transform: [{ translateX: 14 * scale }, { rotate: '9deg' }],
          },
        ]}
      />
      <View
        style={[card, { backgroundColor: colors.paper, boxShadow: shadows.card }]}
        className="items-center justify-center">
        {glyph ? (
          <Text style={{ fontFamily: fonts.display, fontSize: 30 * scale, color: colors.cocoa }}>
            {glyph}
          </Text>
        ) : (
          icon && <Ionicons name={icon} size={22 * scale} color={colors.cocoa} />
        )}
      </View>
    </View>
  );
}
