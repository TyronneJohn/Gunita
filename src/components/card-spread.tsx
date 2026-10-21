import { Pressable, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { CardBack } from '@/components/card-back';
import type { Deck } from '@/data/decks';

export type SpreadSlot = {
  id: string;
  /** Small random tilt and nudge so the cards look laid out by hand. */
  rotate: number;
  dx: number;
  dy: number;
};

const COLUMNS = 3;
const GAP = 14;
const MAX_CARD_WIDTH = 120;
const DEAL_STAGGER_MS = 90;

type CardSpreadProps = {
  deck: Deck;
  slots: SpreadSlot[];
  /** Changes on every new deal so the cards animate in again. */
  dealId: number;
  /** Size of the area the spread must fit in. */
  area: { width: number; height: number };
  onPick: (cardId: string) => void;
};

/** Face-down cards laid out one by one in a loose 3-column grid. */
export function CardSpread({ deck, slots, dealId, area, onPick }: CardSpreadProps) {
  if (area.width === 0 || slots.length === 0) return null;

  const rows = Math.ceil(slots.length / COLUMNS);
  const byWidth = (area.width - GAP * (COLUMNS - 1)) / COLUMNS;
  const byHeight = (area.height - GAP * (rows - 1)) / rows / 1.4;
  const cardWidth = Math.floor(Math.min(byWidth, byHeight, MAX_CARD_WIDTH));

  return (
    <View
      className="flex-row flex-wrap justify-center"
      style={{ width: cardWidth * COLUMNS + GAP * (COLUMNS - 1), gap: GAP }}>
      {slots.map((slot, i) => (
        <Animated.View
          key={`${dealId}-${slot.id}`}
          entering={FadeInUp.delay(i * DEAL_STAGGER_MS).duration(260)}>
          <Pressable
            accessibilityRole="button"
            onPress={() => onPick(slot.id)}
            className="active:opacity-80"
            style={{
              transform: [
                { translateX: slot.dx },
                { translateY: slot.dy },
                { rotate: `${slot.rotate}deg` },
              ],
            }}>
            <CardBack deck={deck} width={cardWidth} />
          </Pressable>
        </Animated.View>
      ))}
    </View>
  );
}
