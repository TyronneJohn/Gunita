import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { CardBack } from '@/components/card-back';
import type { Deck } from '@/data/decks';

const MAX_LAYERS = 5;
// 6 passes × 300ms plus a small stagger ≈ 2 seconds.
const PASSES = 6;
const HALF_PASS_MS = 150;
const STAGGER_MS = 40;

type ShuffleStackProps = {
  deck: Deck;
  /** How many cards are left; the stack shows up to five of them. */
  count: number;
  shuffling: boolean;
  width: number;
};

/** A bundle of face-down cards that riffles left and right while shuffling. */
export function ShuffleStack({ deck, count, shuffling, width }: ShuffleStackProps) {
  const layers = Math.max(1, Math.min(count, MAX_LAYERS));

  return (
    <View
      style={{ width: width * 2.2, height: width * 1.4 + 40 }}
      className="items-center justify-center">
      {Array.from({ length: layers }, (_, index) => (
        <StackCard
          key={index}
          index={index}
          layers={layers}
          deck={deck}
          width={width}
          shuffling={shuffling}
        />
      ))}
    </View>
  );
}

function StackCard({
  index,
  layers,
  deck,
  width,
  shuffling,
}: {
  index: number;
  layers: number;
  deck: Deck;
  width: number;
  shuffling: boolean;
}) {
  const offsetX = useSharedValue(0);
  const tilt = useSharedValue(0);

  // Resting pose: a slightly messy pile.
  const restRotate = (index - (layers - 1) / 2) * 3;
  const restY = -index * 3;

  useEffect(() => {
    if (shuffling) {
      const direction = index % 2 === 0 ? 1 : -1;
      const reach = width * (0.45 + index * 0.06);
      const pass = (to: number) =>
        withSequence(
          withTiming(direction * to, { duration: HALF_PASS_MS, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: HALF_PASS_MS, easing: Easing.in(Easing.quad) }),
        );
      offsetX.set(withDelay(index * STAGGER_MS, withRepeat(pass(reach), PASSES)));
      tilt.set(withDelay(index * STAGGER_MS, withRepeat(pass(10), PASSES)));
    } else {
      offsetX.set(withTiming(0, { duration: 200 }));
      tilt.set(withTiming(0, { duration: 200 }));
    }
  }, [shuffling, index, width, offsetX, tilt]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: offsetX.get() },
      { translateY: restY },
      { rotate: `${restRotate + tilt.get()}deg` },
    ],
  }));

  return (
    <Animated.View style={[{ position: 'absolute', zIndex: index }, style]}>
      <CardBack deck={deck} width={width} />
    </Animated.View>
  );
}
