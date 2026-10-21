import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState, type ComponentProps } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { Button } from '@/components/button';
import { CardSpread, type SpreadSlot } from '@/components/card-spread';
import { DeckArt } from '@/components/deck-art';
import { EmptyState } from '@/components/empty-state';
import { FlipCard } from '@/components/flip-card';
import { HeartButton } from '@/components/heart-button';
import { ShuffleStack } from '@/components/shuffle-stack';
import { colors } from '@/constants/theme';
import { depthFilterText, getCard } from '@/data/cards';
import { getDeck, type Deck } from '@/data/decks';
import { useLanguage } from '@/i18n';
import { sessionTotal, useProgress, type DeckSession } from '@/lib/progress';
import { shuffle } from '@/lib/shuffle';
import { useSounds } from '@/lib/sounds';

const SHUFFLE_MS = 2000;

/**
 * bundle    → face-down pile, waiting for the first shuffle
 * shuffling → 2-second riffle animation (tap to skip)
 * spread    → remaining cards laid out; the player picks one
 * reading   → the picked card is open on top of the table
 */
type Phase = 'bundle' | 'shuffling' | 'spread' | 'reading';

export default function PlayScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useLanguage();
  const deck = getDeck(id);
  const { getSession, startSession } = useProgress();
  const session = getSession(id);
  const insets = useSafeAreaInsets();

  // Opening a deck with no saved session (e.g. from a link) starts a fresh one.
  useEffect(() => {
    if (deck && !session) startSession(deck.id, 'all');
  }, [deck, session, startSession]);

  return (
    <View
      className="flex-1 bg-cream px-5"
      style={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 }}>
      {!deck ? (
        <>
          <IconButton icon="close" label={t('common.close')} onPress={() => router.back()} />
          <EmptyState
            className="mt-6"
            icon="help-circle-outline"
            title={t('common.deckNotFoundTitle')}
            body={t('common.deckNotFoundBody')}
          />
        </>
      ) : session ? (
        <Game deck={deck} session={session} />
      ) : null}
    </View>
  );
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function Game({ deck, session }: { deck: Deck; session: DeckSession }) {
  const { t } = useLanguage();
  const { pickCard, startSession } = useProgress();
  const { playShuffle, stopShuffle, playFlip } = useSounds();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const [phase, setPhase] = useState<Phase>('bundle');
  const [slots, setSlots] = useState<SpreadSlot[]>([]);
  const [dealId, setDealId] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [flips, setFlips] = useState(1);
  const [area, setArea] = useState({ width: 0, height: 0 });

  const total = sessionTotal(session);
  const picked = session.picked.length;
  const finished = session.remaining.length === 0;
  const selectedCard = selectedId ? getCard(selectedId) : undefined;
  // Leave room under the open card for the two rows of buttons.
  const openCardWidth = Math.min(
    width - 40,
    340,
    (height - insets.top - insets.bottom - 200) * 0.7,
  );

  const deal = () => {
    stopShuffle();
    setSlots(
      shuffle(session.remaining).map((id) => ({
        id,
        rotate: randomBetween(-4, 4),
        dx: randomBetween(-3, 3),
        dy: randomBetween(-3, 3),
      })),
    );
    setDealId((n) => n + 1);
    setPhase('spread');
  };

  // Keep the latest deal() for the timer below without restarting it on re-renders.
  const dealRef = useRef(deal);
  useEffect(() => {
    dealRef.current = deal;
  });

  // After two seconds of shuffling, lay the cards out.
  useEffect(() => {
    if (phase !== 'shuffling') return;
    const timer = setTimeout(() => dealRef.current(), SHUFFLE_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  // Don't keep shuffling sounds going after leaving the screen.
  useEffect(() => stopShuffle, [stopShuffle]);

  const startShuffle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    playShuffle();
    setPhase('shuffling');
  };

  const pick = (cardId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    playFlip();
    setSelectedId(cardId);
    setFlips(1);
    setPhase('reading');
  };

  const flip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    playFlip();
    setFlips((n) => n + 1);
  };

  const finishReading = () => {
    if (!selectedId) return;
    const cardsLeft = session.remaining.length - 1;
    pickCard(deck.id, selectedId);
    setSelectedId(null);
    // Reshuffle what's left before the next pick.
    if (cardsLeft > 0) startShuffle();
    else setPhase('bundle');
  };

  const restart = () => {
    startSession(deck.id, session.depth);
    setPhase('bundle');
  };

  const showPile = phase === 'bundle' || phase === 'shuffling';

  return (
    <>
      {/* Top bar */}
      <View className="flex-row items-center justify-between">
        <IconButton icon="close" label={t('common.close')} onPress={() => router.back()} />
        <View className="items-center">
          <AppText variant="overline" tone="muted">
            {deck.title}
          </AppText>
          <AppText variant="label" tone="cocoa">
            {finished ? t('play.finished') : t('play.pickedCount', { picked, total })}
          </AppText>
        </View>
        <IconButton
          icon="shuffle"
          label={t('play.shuffle')}
          disabled={phase !== 'spread'}
          onPress={startShuffle}
        />
      </View>

      {/* Progress bar */}
      <View className="mt-4 h-1.5 overflow-hidden rounded-full bg-beige">
        <View className="h-full rounded-full bg-cocoa" style={{ width: `${(picked / total) * 100}%` }} />
      </View>

      {finished ? (
        <DeckComplete deck={deck} session={session} onRestart={restart} />
      ) : showPile ? (
        <>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('play.shuffling')}
            disabled={phase !== 'shuffling'}
            onPress={deal}
            className="flex-1 items-center justify-center">
            <ShuffleStack
              deck={deck}
              count={session.remaining.length}
              shuffling={phase === 'shuffling'}
              width={Math.min(width * 0.38, 150)}
            />
            <AppText variant="label" tone="muted" className="mt-10 text-center">
              {phase === 'shuffling' ? t('play.shuffling') : t('play.shuffleToBegin')}
            </AppText>
          </Pressable>
          {phase === 'bundle' && (
            <Button label={t('play.shuffleButton')} icon="shuffle" onPress={startShuffle} />
          )}
        </>
      ) : (
        <>
          <AppText variant="label" tone="muted" className="mb-3 mt-5 text-center">
            {t('play.pickCard')}
          </AppText>
          <View
            className="flex-1 items-center justify-center"
            onLayout={(event) => {
              const { width: w, height: h } = event.nativeEvent.layout;
              setArea({ width: w, height: h });
            }}>
            <CardSpread deck={deck} slots={slots} dealId={dealId} area={area} onPick={pick} />
          </View>
        </>
      )}

      {/* Picked card, opened over the table */}
      {phase === 'reading' && selectedCard && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={[
            StyleSheet.absoluteFill,
            styles.backdrop,
            { paddingTop: insets.top, paddingBottom: insets.bottom },
          ]}>
          <Animated.View entering={ZoomIn.duration(280)}>
            <FlipCard
              key={selectedCard.id}
              card={selectedCard}
              deck={deck}
              flips={flips}
              width={openCardWidth}
              onPress={flip}
            />
          </Animated.View>
          <View className="mt-6 gap-3" style={{ width: openCardWidth }}>
            <View className="flex-row items-center gap-3">
              <HeartButton questionId={selectedCard.id} size="large" tone="light" />
              <View className="flex-1">
                <Button
                  variant="secondary"
                  label={t('play.write')}
                  icon="create-outline"
                  onPress={() =>
                    router.push({
                      pathname: '/write/[questionId]',
                      params: { questionId: selectedCard.id },
                    })
                  }
                />
              </View>
            </View>
            <Button label={t('play.doneReading')} icon="checkmark" onPress={finishReading} />
          </View>
        </Animated.View>
      )}
    </>
  );
}

function DeckComplete({
  deck,
  session,
  onRestart,
}: {
  deck: Deck;
  session: DeckSession;
  onRestart: () => void;
}) {
  const { t } = useLanguage();

  return (
    <View className="flex-1 justify-center">
      <View className="items-center">
        <View
          className="h-56 w-56 items-center justify-center rounded-full"
          style={{ backgroundColor: deck.color }}>
          <DeckArt icon="checkmark" scale={1.4} />
        </View>
        <AppText variant="display" tone="cocoa" className="mt-8 text-center">
          {t('play.completeTitle')}
        </AppText>
        <AppText variant="body" tone="muted" className="mt-3 text-center">
          {t('play.completeBody', {
            count: sessionTotal(session),
            deck: deck.title,
            depth: t(depthFilterText[session.depth].label),
          })}
        </AppText>
      </View>
      <View className="mt-10 gap-3">
        <Button label={t('play.shuffleAgain')} icon="shuffle" onPress={onRestart} />
        <Button
          variant="secondary"
          label={t('play.otherDeck')}
          onPress={() => router.dismissTo('/explore')}
        />
      </View>
    </View>
  );
}

function IconButton({
  icon,
  label,
  onPress,
  disabled = false,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
      className={`h-11 w-11 items-center justify-center rounded-full border border-sand bg-paper active:opacity-70 ${disabled ? 'opacity-40' : ''}`}>
      <Ionicons name={icon} size={20} color={colors.cocoa} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(46, 38, 33, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
});
