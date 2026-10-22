import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState, type ComponentProps, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { Button } from '@/components/button';
import { CardSpread, type SpreadSlot } from '@/components/card-spread';
import { DeckArt } from '@/components/deck-art';
import { EmptyState } from '@/components/empty-state';
import { FlipCard } from '@/components/flip-card';
import { HeartButton } from '@/components/heart-button';
import { PaperCard } from '@/components/paper-card';
import { ShuffleStack } from '@/components/shuffle-stack';
import { accents, fonts } from '@/constants/theme';
import { useColors } from '@/lib/theme';
import { depthFilterText, getCard } from '@/data/cards';
import { getDeck, type Deck } from '@/data/decks';
import { useLanguage } from '@/i18n';
import { currentPlayer, isGroupFinished, useGroup, type GroupSession } from '@/lib/group';
import { sessionTotal, useProgress, type DeckSession } from '@/lib/progress';
import { shuffle } from '@/lib/shuffle';
import { useSounds } from '@/lib/sounds';

const SHUFFLE_MS = 2000;

/**
 * handoff   → group only: "Pass the phone to …" before each turn
 * bundle    → face-down pile, waiting for the first shuffle
 * shuffling → 2-second riffle animation (tap to skip)
 * spread    → remaining cards laid out; the player picks one
 * reading   → the picked card is open on top of the table
 */
type Phase = 'handoff' | 'bundle' | 'shuffling' | 'spread' | 'reading';

export default function PlayScreen() {
  const { id, mode } = useLocalSearchParams<{ id: string; mode?: string }>();
  const { t } = useLanguage();
  const deck = getDeck(id);
  const { getSession, startSession } = useProgress();
  const { session: groupSession } = useGroup();
  const session = getSession(id);
  const insets = useSafeAreaInsets();
  const isGroup = mode === 'group';

  // Opening a solo deck with no saved session (e.g. from a link) starts a fresh one.
  useEffect(() => {
    if (!isGroup && deck && !session) startSession(deck.id, 'all');
  }, [isGroup, deck, session, startSession]);

  const notFound = (body: string) => (
    <>
      <IconButton icon="close" label={t('common.close')} onPress={() => router.back()} />
      <EmptyState
        className="mt-6"
        icon="help-circle-outline"
        title={t('common.deckNotFoundTitle')}
        body={body}
      />
    </>
  );

  return (
    <View
      className="flex-1 bg-cream px-5"
      style={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 }}>
      {!deck ? (
        notFound(t('common.deckNotFoundBody'))
      ) : isGroup ? (
        groupSession && groupSession.deckId === deck.id ? (
          <GroupGame deck={deck} session={groupSession} />
        ) : (
          notFound(t('group.notFound'))
        )
      ) : session ? (
        <SoloGame deck={deck} session={session} />
      ) : null}
    </View>
  );
}

function SoloGame({ deck, session }: { deck: Deck; session: DeckSession }) {
  const { t } = useLanguage();
  const { pickCard, startSession } = useProgress();
  const total = sessionTotal(session);
  const picked = session.picked.length;
  const finished = session.remaining.length === 0;

  return (
    <CardTable
      deck={deck}
      remaining={session.remaining}
      done={picked}
      total={total}
      statusLabel={finished ? t('play.finished') : t('play.pickedCount', { picked, total })}
      finished={finished}
      allowWrite
      onPick={(cardId) => pickCard(deck.id, cardId)}
      complete={
        <DeckComplete
          deck={deck}
          count={total}
          depthLabel={t(depthFilterText[session.depth].label)}
          onRestart={() => startSession(deck.id, session.depth)}
        />
      }
    />
  );
}

function GroupGame({ deck, session }: { deck: Deck; session: GroupSession }) {
  const { t } = useLanguage();
  const { pick, restart } = useGroup();
  const finished = isGroupFinished(session);
  const player = currentPlayer(session);

  return (
    <CardTable
      deck={deck}
      remaining={session.remaining}
      done={session.picks.length}
      total={session.totalTurns}
      statusLabel={
        finished || !player ? t('play.finished') : t('group.turn', { name: player.name })
      }
      finished={finished}
      turn={
        player
          ? { name: player.name, color: player.color, number: session.picks.length + 1 }
          : undefined
      }
      allowWrite={false}
      onPick={pick}
      complete={<GroupComplete deck={deck} session={session} onRestart={restart} />}
    />
  );
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

type CardTableProps = {
  deck: Deck;
  /** Card ids still on the table. */
  remaining: string[];
  /** For the progress bar: cards picked (solo) or turns played (group). */
  done: number;
  total: number;
  statusLabel: string;
  finished: boolean;
  /** Called when the player taps Done on an open card. */
  onPick: (cardId: string) => void;
  /** Shown instead of the table once finished. */
  complete: ReactNode;
  /** Group mode: whose turn it is. Adds a hand-off screen before each turn. */
  turn?: { name: string; color: string; number: number };
  allowWrite: boolean;
};

/** The shared card experience: shuffle, lay out, pick, read, reshuffle. */
function CardTable({
  deck,
  remaining,
  done,
  total,
  statusLabel,
  finished,
  onPick,
  complete,
  turn,
  allowWrite,
}: CardTableProps) {
  const { t } = useLanguage();
  const { playShuffle, stopShuffle, playFlip } = useSounds();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isGroup = !!turn;

  const [phase, setPhase] = useState<Phase>(isGroup ? 'handoff' : 'bundle');
  const [slots, setSlots] = useState<SpreadSlot[]>([]);
  const [dealId, setDealId] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [flips, setFlips] = useState(1);
  const [area, setArea] = useState({ width: 0, height: 0 });

  const selectedCard = selectedId ? getCard(selectedId) : undefined;
  // Leave room under the open card for the buttons.
  const openCardWidth = Math.min(
    width - 40,
    340,
    (height - insets.top - insets.bottom - (isGroup ? 240 : 200)) * 0.7,
  );

  const deal = () => {
    stopShuffle();
    setSlots(
      shuffle(remaining).map((id) => ({
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
    const cardsLeft = remaining.length - 1;
    onPick(selectedId);
    setSelectedId(null);
    // Group: hand the phone over first. Solo: reshuffle what's left.
    if (isGroup) setPhase('handoff');
    else if (cardsLeft > 0) startShuffle();
    else setPhase('bundle');
  };

  const showPile = phase === 'bundle' || phase === 'shuffling';

  return (
    <>
      {/* Top bar */}
      <View className="flex-row items-center justify-between">
        <IconButton icon="close" label={t('common.close')} onPress={() => router.back()} />
        <View className="flex-1 items-center px-3">
          <AppText variant="overline" tone="muted">
            {deck.title}
          </AppText>
          <AppText variant="label" tone="cocoa" numberOfLines={1}>
            {statusLabel}
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
        <View
          className="h-full rounded-full bg-cocoa"
          style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }}
        />
      </View>

      {finished ? (
        complete
      ) : phase === 'handoff' && turn ? (
        <Handoff turn={turn} total={total} onReady={startShuffle} />
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
              count={remaining.length}
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
          {turn && (
            <View className="mb-4 flex-row items-center gap-2 rounded-full bg-paper/15 px-4 py-2">
              <View className="h-3 w-3 rounded-full" style={{ backgroundColor: turn.color }} />
              <AppText variant="label" tone="paper">
                {t('group.cardOf', { name: turn.name })}
              </AppText>
            </View>
          )}
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
              {allowWrite && (
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
              )}
              {!allowWrite && (
                <View className="flex-1">
                  <Button label={t('play.doneReading')} icon="checkmark" onPress={finishReading} />
                </View>
              )}
            </View>
            {allowWrite && (
              <Button label={t('play.doneReading')} icon="checkmark" onPress={finishReading} />
            )}
          </View>
        </Animated.View>
      )}
    </>
  );
}

/** Group mode: shown between turns so nobody sees the next card early. */
function Handoff({
  turn,
  total,
  onReady,
}: {
  turn: { name: string; color: string; number: number };
  total: number;
  onReady: () => void;
}) {
  const { t } = useLanguage();

  return (
    <View className="flex-1 justify-center">
      <Animated.View
        key={turn.number}
        entering={FadeIn.duration(300)}
        style={{ alignItems: 'center' }}>
        <AppText variant="overline" tone="muted">
          {t('group.turnCount', { done: turn.number, total })}
        </AppText>
        <View
          className="mt-6 h-28 w-28 items-center justify-center rounded-full"
          style={{ backgroundColor: turn.color }}>
          <Text style={{ fontFamily: fonts.display, fontSize: 48, color: accents.onAccent }}>
            {turn.name[0]?.toUpperCase() ?? '?'}
          </Text>
        </View>
        <AppText variant="label" tone="muted" className="mt-6">
          {t('group.passTo')}
        </AppText>
        <AppText variant="display" tone="cocoa" className="mt-1 text-center" numberOfLines={2}>
          {turn.name}
        </AppText>
      </Animated.View>
      <View className="mt-12">
        <Button label={t('group.ready')} icon="arrow-forward" onPress={onReady} />
      </View>
    </View>
  );
}

function DeckComplete({
  deck,
  count,
  depthLabel,
  onRestart,
}: {
  deck: Deck;
  count: number;
  depthLabel: string;
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
          {t('play.completeBody', { count, deck: deck.title, depth: depthLabel })}
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

function GroupComplete({
  deck,
  session,
  onRestart,
}: {
  deck: Deck;
  session: GroupSession;
  onRestart: () => void;
}) {
  const { t } = useLanguage();

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingVertical: 16 }}>
      <View className="items-center">
        <View
          className="h-40 w-40 items-center justify-center rounded-full"
          style={{ backgroundColor: deck.color }}>
          <DeckArt icon="people" scale={1.1} />
        </View>
        <AppText variant="display" tone="cocoa" className="mt-6 text-center">
          {t('group.completeTitle')}
        </AppText>
        <AppText variant="body" tone="muted" className="mt-2 text-center">
          {t('group.completeBody')}
        </AppText>
      </View>

      <PaperCard className="mt-6 px-4 py-2">
        {session.players.map((player, i) => (
          <View
            key={player.id}
            className={`flex-row items-center py-2.5 ${i > 0 ? 'border-t border-beige' : ''}`}>
            <View
              className="h-8 w-8 items-center justify-center rounded-full"
              style={{ backgroundColor: player.color }}>
              <Text style={{ fontFamily: fonts.display, fontSize: 15, color: accents.onAccent }}>
                {player.name[0]?.toUpperCase() ?? '?'}
              </Text>
            </View>
            <AppText variant="label" tone="ink" numberOfLines={1} className="ml-3 flex-1">
              {player.name}
            </AppText>
            <AppText variant="caption" tone="muted">
              {t('group.cardsAnswered', {
                count: session.picks.filter((p) => p.playerId === player.id).length,
              })}
            </AppText>
          </View>
        ))}
      </PaperCard>

      <View className="mt-6 gap-3">
        <Button label={t('group.playAgain')} icon="shuffle" onPress={onRestart} />
        <Button
          variant="secondary"
          label={t('play.otherDeck')}
          onPress={() => router.dismissTo('/explore')}
        />
      </View>
    </ScrollView>
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
  const colors = useColors();
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
