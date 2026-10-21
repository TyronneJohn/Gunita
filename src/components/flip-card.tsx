import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { AppText } from '@/components/app-text';
import { DeckArt } from '@/components/deck-art';
import { colors, fonts, shadows } from '@/constants/theme';
import { depthLabels, type Card, type Depth } from '@/data/cards';
import type { Deck } from '@/data/decks';
import { useLanguage } from '@/i18n';

type FlipCardProps = {
  card: Card;
  deck: Deck;
  /**
   * How many times the card has been flipped.
   * 0 = cover, odd = question, even (2+) = reflection.
   */
  flips: number;
  width: number;
  onPress: () => void;
};

const depthStyles: Record<Depth, { background: string; text: string }> = {
  light: { background: 'rgba(156, 175, 136, 0.25)', text: colors.sageDeep },
  deeper: { background: 'rgba(201, 150, 122, 0.25)', text: colors.cocoaSoft },
  deepest: { background: colors.cocoa, text: colors.paper },
};

/**
 * A two-sided card. Side A shows the cover first, then the reflection;
 * side B always shows the question. Side A's content only switches
 * while it is facing away, so the change is never visible.
 */
export function FlipCard({ card, deck, flips, width, onPress }: FlipCardProps) {
  const { t, pick } = useLanguage();
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.set(withTiming(flips * 180, { duration: 520, easing: Easing.out(Easing.cubic) }));
  }, [flips, rotation]);

  const sideAStyle = useAnimatedStyle(() => {
    const angle = rotation.get() % 360;
    return {
      opacity: angle < 90 || angle > 270 ? 1 : 0,
      transform: [{ perspective: 1200 }, { rotateY: `${rotation.get()}deg` }],
    };
  });

  const sideBStyle = useAnimatedStyle(() => {
    const angle = rotation.get() % 360;
    return {
      opacity: angle >= 90 && angle <= 270 ? 1 : 0,
      transform: [{ perspective: 1200 }, { rotateY: `${rotation.get() + 180}deg` }],
    };
  });

  const showReflection = flips >= 2;
  const isQuestionUp = flips % 2 === 1;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        flips === 0
          ? t('card.drawLabel')
          : isQuestionUp
            ? pick(card.question)
            : pick(card.reflection)
      }
      accessibilityHint={t('card.flipHint')}
      onPress={onPress}
      style={{ width, aspectRatio: 0.7 }}>
      <Animated.View style={[styles.face, sideAStyle]}>
        {showReflection ? <ReflectionFace card={card} deck={deck} /> : <CoverFace deck={deck} />}
      </Animated.View>
      <Animated.View style={[styles.face, sideBStyle]}>
        <QuestionFace card={card} deck={deck} />
      </Animated.View>
    </Pressable>
  );
}

/** Thin inner frame with small diamonds in each corner, like a printed card. */
function Frame({ color }: { color: string }) {
  const corners = [
    { top: 6, left: 6 },
    { top: 6, right: 6 },
    { bottom: 6, left: 6 },
    { bottom: 6, right: 6 },
  ];
  return (
    <View pointerEvents="none" style={[styles.frame, { borderColor: color }]}>
      {corners.map((position, i) => (
        <View key={i} style={[styles.diamond, position, { backgroundColor: color }]} />
      ))}
    </View>
  );
}

function CoverFace({ deck }: { deck: Deck }) {
  const { t } = useLanguage();

  return (
    <View style={[styles.fill, { backgroundColor: deck.color }, styles.coverShine]}>
      <Frame color="rgba(255, 251, 245, 0.65)" />
      <View className="flex-1 items-center justify-center px-8">
        <DeckArt icon={deck.icon} scale={1.5} />
        <AppText variant="title" tone="cocoa" className="mt-6 text-center">
          {deck.title}
        </AppText>
        <View className="my-3 h-px w-12 bg-cocoa/30" />
        <AppText variant="label" tone="cocoa" className="text-center opacity-75">
          {t('card.tapToDraw')}
        </AppText>
      </View>
      <AppText variant="overline" tone="cocoa" className="mb-8 text-center opacity-60">
        Gunita
      </AppText>
    </View>
  );
}

function QuestionFace({ card, deck }: { card: Card; deck: Deck }) {
  const { t, pick } = useLanguage();
  const depth = depthStyles[card.depth];
  return (
    <View style={[styles.fill, styles.paperGrain]}>
      <View style={{ height: 8, backgroundColor: deck.color }} />
      <View className="flex-1 px-7 pb-6 pt-5">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: deck.color }} />
            <AppText variant="overline" tone="muted">
              {deck.title}
            </AppText>
          </View>
          <View className="rounded-full px-3 py-1" style={{ backgroundColor: depth.background }}>
            <Text style={[styles.depthText, { color: depth.text }]}>{depthLabels[card.depth]}</Text>
          </View>
        </View>

        <View className="flex-1 justify-center">
          <Text style={[styles.quoteMark, { color: deck.color }]}>“</Text>
          <AppText variant="cardQuestion" tone="ink">
            {pick(card.question)}
          </AppText>
        </View>

        <View className="flex-row items-center justify-center gap-2 border-t border-beige pt-4">
          <Ionicons name="sync-outline" size={14} color={colors.muted} />
          <AppText variant="caption" tone="muted">
            {t('card.tapForReflection')}
          </AppText>
        </View>
      </View>
    </View>
  );
}

function ReflectionFace({ card, deck }: { card: Card; deck: Deck }) {
  const { t, pick } = useLanguage();

  return (
    <View style={[styles.fill, { backgroundColor: deck.color }, styles.reflectionWash]}>
      <Frame color="rgba(92, 64, 51, 0.18)" />
      <View className="flex-1 items-center px-9 pb-8 pt-9">
        <View className="flex-row items-center gap-2">
          <Ionicons name="sparkles" size={14} color={colors.cocoaSoft} />
          <AppText variant="overline" tone="cocoa" className="opacity-80">
            {t('card.reflection')}
          </AppText>
        </View>

        <View className="flex-1 items-center justify-center">
          <View
            className="mb-6 h-14 w-14 items-center justify-center rounded-full bg-paper"
            style={{ boxShadow: shadows.card }}>
            <Ionicons name={deck.icon} size={24} color={colors.cocoa} />
          </View>
          <AppText variant="reflection" tone="cocoa" className="text-center">
            {pick(card.reflection)}
          </AppText>
          <Text style={styles.signature}>— Gunita</Text>
        </View>

        <AppText variant="caption" tone="cocoa" className="opacity-60">
          {t('card.tapForQuestion')}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  face: {
    ...StyleSheet.absoluteFill,
    borderRadius: 28,
    overflow: 'hidden',
    backfaceVisibility: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(217, 201, 176, 0.6)',
    backgroundColor: colors.paper,
    boxShadow: shadows.lifted,
  },
  fill: {
    flex: 1,
  },
  coverShine: {
    experimental_backgroundImage:
      'linear-gradient(160deg, rgba(255, 251, 245, 0.45) 0%, rgba(255, 251, 245, 0) 55%, rgba(92, 64, 51, 0.12) 100%)',
  },
  paperGrain: {
    backgroundColor: colors.paper,
    experimental_backgroundImage: `linear-gradient(180deg, ${colors.paper} 0%, ${colors.cream} 100%)`,
  },
  reflectionWash: {
    experimental_backgroundImage:
      'linear-gradient(170deg, rgba(255, 251, 245, 0.55) 0%, rgba(255, 251, 245, 0.8) 100%)',
  },
  frame: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    bottom: 12,
    borderWidth: 1,
    borderRadius: 20,
  },
  diamond: {
    position: 'absolute',
    width: 6,
    height: 6,
    transform: [{ rotate: '45deg' }],
  },
  depthText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
  },
  quoteMark: {
    fontFamily: fonts.display,
    fontSize: 72,
    lineHeight: 72,
    marginBottom: -18,
  },
  signature: {
    marginTop: 20,
    fontFamily: fonts.serif,
    fontSize: 14,
    color: colors.cocoaSoft,
  },
});
