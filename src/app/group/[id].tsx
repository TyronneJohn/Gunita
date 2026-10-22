import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { Button } from '@/components/button';
import { EmptyState } from '@/components/empty-state';
import { PaperCard } from '@/components/paper-card';
import { accents, fonts } from '@/constants/theme';
import { useColors } from '@/lib/theme';
import { depthFilterText, getDeckCards, type DepthFilter } from '@/data/cards';
import { getDeck } from '@/data/decks';
import { useLanguage } from '@/i18n';
import { loadLastPlayers, MAX_PLAYERS, MIN_PLAYERS, playerColors, useGroup } from '@/lib/group';

const CARDS_PER_PLAYER: (number | null)[] = [1, 2, 3, null];
const DEPTHS: DepthFilter[] = ['light', 'deeper', 'all'];

/** Group mode setup: who's playing and how long the session is. */
export default function GroupSetupScreen() {
  const { id, depth: depthParam } = useLocalSearchParams<{ id: string; depth?: string }>();
  const { t } = useLanguage();
  const colors = useColors();
  const { startGroup } = useGroup();
  const insets = useSafeAreaInsets();
  const deck = getDeck(id);
  const depth: DepthFilter = DEPTHS.includes(depthParam as DepthFilter)
    ? (depthParam as DepthFilter)
    : 'all';

  const [names, setNames] = useState<string[]>(['', '']);
  const [cardsPerPlayer, setCardsPerPlayer] = useState<number | null>(2);
  const [shuffleOrder, setShuffleOrder] = useState(true);

  // Start with the players from the last group game, if any.
  useEffect(() => {
    loadLastPlayers().then((saved) => {
      if (saved.length >= MIN_PLAYERS) setNames(saved.slice(0, MAX_PLAYERS));
    });
  }, []);

  const filledNames = names.map((name) => name.trim()).filter(Boolean);
  const canStart = filledNames.length >= MIN_PLAYERS;

  const updateName = (index: number, value: string) =>
    setNames((prev) => prev.map((name, i) => (i === index ? value : name)));

  const start = () => {
    if (!canStart) return;
    startGroup({
      deckId: id,
      depth,
      players: filledNames.map((name, i) => ({
        id: `player-${i}`,
        name,
        color: playerColors[i % playerColors.length],
      })),
      cardsPerPlayer,
      shuffleOrder,
    });
    router.replace({ pathname: '/play/[id]', params: { id, mode: 'group' } });
  };

  return (
    <KeyboardAvoidingView behavior="padding" className="flex-1 bg-cream">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: insets.top + 14,
          paddingBottom: insets.bottom + 24,
        }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
          onPress={() => router.back()}
          hitSlop={8}
          className="h-11 w-11 items-center justify-center rounded-full border border-sand bg-paper active:opacity-70">
          <Ionicons name="chevron-back" size={22} color={colors.cocoa} />
        </Pressable>

        {!deck ? (
          <EmptyState
            className="mt-6"
            icon="help-circle-outline"
            title={t('common.deckNotFoundTitle')}
            body={t('common.deckNotFoundBody')}
          />
        ) : (
          <>
            {/* Deck and depth */}
            <View className="mt-6 flex-row items-center gap-2">
              <View
                className="h-7 w-7 items-center justify-center rounded-full"
                style={{ backgroundColor: deck.color }}>
                <Ionicons name={deck.icon} size={14} color={accents.onAccent} />
              </View>
              <AppText variant="overline" tone="cocoa">
                {deck.title}
              </AppText>
              <AppText variant="caption" tone="muted">
                · {t(depthFilterText[depth].label)} ·{' '}
                {t('deck.cardCount', { count: getDeckCards(deck.id, depth).length })}
              </AppText>
            </View>

            <AppText variant="title" tone="cocoa" className="mt-3">
              {t('group.title')}
            </AppText>
            <AppText variant="body" tone="muted" className="mt-2">
              {t('group.subtitle')}
            </AppText>

            {/* Players */}
            <View className="mt-6 gap-3">
              {names.map((name, index) => {
                const color = playerColors[index % playerColors.length];
                return (
                  <View
                    key={index}
                    className="h-14 flex-row items-center rounded-2xl border border-sand bg-paper pl-2 pr-3">
                    <View
                      className="h-10 w-10 items-center justify-center rounded-full"
                      style={{ backgroundColor: color }}>
                      <Text
                        style={{
                          fontFamily: fonts.display,
                          fontSize: 16,
                          color: accents.onAccent,
                        }}>
                        {name.trim()[0]?.toUpperCase() ?? index + 1}
                      </Text>
                    </View>
                    <TextInput
                      value={name}
                      onChangeText={(value) => updateName(index, value)}
                      placeholder={t('group.playerPlaceholder', { number: index + 1 })}
                      placeholderTextColor={colors.muted}
                      maxLength={20}
                      autoCapitalize="words"
                      returnKeyType="next"
                      style={{
                        flex: 1,
                        marginLeft: 12,
                        fontFamily: fonts.sans,
                        fontSize: 16,
                        color: colors.ink,
                      }}
                    />
                    {names.length > MIN_PLAYERS && (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={t('group.removePlayer')}
                        onPress={() => setNames((prev) => prev.filter((_, i) => i !== index))}
                        hitSlop={10}
                        className="active:opacity-60">
                        <Ionicons name="close-circle" size={22} color={colors.sand} />
                      </Pressable>
                    )}
                  </View>
                );
              })}

              {names.length < MAX_PLAYERS && (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setNames((prev) => [...prev, ''])}
                  className="h-14 flex-row items-center justify-center gap-2 rounded-2xl border border-dashed border-cocoa/30 active:opacity-70">
                  <Ionicons name="add" size={20} color={colors.cocoa} />
                  <AppText variant="label" tone="cocoa">
                    {t('group.addPlayer')}
                  </AppText>
                </Pressable>
              )}
            </View>

            {/* Session length */}
            <AppText variant="label" tone="muted" className="mb-3 mt-8">
              {t('group.cardsPerPlayer')}
            </AppText>
            <View className="flex-row gap-2">
              {CARDS_PER_PLAYER.map((option) => {
                const selected = option === cardsPerPlayer;
                return (
                  <Pressable
                    key={option ?? 'all'}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    onPress={() => setCardsPerPlayer(option)}
                    className={`h-12 flex-1 items-center justify-center rounded-2xl border active:opacity-80 ${selected ? 'border-cocoa bg-cocoa' : 'border-sand bg-paper'}`}>
                    <AppText variant="label" tone={selected ? 'paper' : 'cocoa'}>
                      {option ?? t('group.allCards')}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>

            {/* Turn order */}
            <PaperCard className="mt-6 flex-row items-center px-4 py-3">
              <Ionicons name="shuffle" size={20} color={colors.cocoa} />
              <AppText variant="label" tone="ink" className="ml-3 flex-1">
                {t('group.shuffleOrder')}
              </AppText>
              <Switch
                accessibilityLabel={t('group.shuffleOrder')}
                value={shuffleOrder}
                onValueChange={setShuffleOrder}
                trackColor={{ false: colors.sand, true: colors.sage }}
                thumbColor={shuffleOrder ? colors.cocoa : colors.paper}
              />
            </PaperCard>

            <View className="mt-8">
              <Button
                label={t('group.start')}
                icon="arrow-forward"
                disabled={!canStart}
                onPress={start}
              />
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
