import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Button } from '@/components/button';
import { DeckArt } from '@/components/deck-art';
import { EmptyState } from '@/components/empty-state';
import { Screen } from '@/components/screen';
import { colors } from '@/constants/theme';
import { depthFilterText, getDeckCards, type DepthFilter } from '@/data/cards';
import { getDeck } from '@/data/decks';
import { useLanguage } from '@/i18n';
import { useProgress } from '@/lib/progress';

const DEPTH_FILTERS: DepthFilter[] = ['light', 'deeper', 'all'];

export default function DeckScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, pick } = useLanguage();
  const deck = getDeck(id);
  const { startSession } = useProgress();
  // Nothing is selected until the player picks a depth.
  const [depth, setDepth] = useState<DepthFilter | null>(null);
  const [mode, setMode] = useState<'solo' | 'group'>('solo');

  const next = () => {
    if (!depth) return;
    if (mode === 'group') {
      router.push({ pathname: '/group/[id]', params: { id, depth } });
      return;
    }
    startSession(id, depth);
    router.push({ pathname: '/play/[id]', params: { id } });
  };

  return (
    <Screen padBottom>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('common.back')}
        onPress={() => router.back()}
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
          <View
            className="mt-5 h-56 items-center justify-center rounded-[32px]"
            style={{ backgroundColor: deck.color }}>
            <DeckArt icon={deck.icon} scale={1.4} />
          </View>

          <AppText variant="display" tone="cocoa" className="mt-6">
            {deck.title}
          </AppText>
          <AppText variant="label" tone="sage" className="mt-1">
            {pick(deck.tagline)}
          </AppText>
          <AppText variant="body" tone="muted" className="mt-4">
            {pick(deck.description)}
          </AppText>

          {/* Depth filter */}
          <AppText variant="heading" tone="cocoa" className="mt-8">
            {t('deck.howDeep')}
          </AppText>
          <View className="mt-4 gap-3">
            {DEPTH_FILTERS.map((option) => {
              const selected = option === depth;
              return (
                <Pressable
                  key={option}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  onPress={() => setDepth(selected ? null : option)}
                  className={`flex-row items-center rounded-2xl border-2 px-4 py-4 active:opacity-80 ${selected ? 'border-cocoa bg-paper' : 'border-sand/70 bg-paper'}`}>
                  <View
                    className={`h-6 w-6 items-center justify-center rounded-full border-2 ${selected ? 'border-cocoa' : 'border-sand'}`}>
                    {selected && <View className="h-3 w-3 rounded-full bg-cocoa" />}
                  </View>
                  <View className="ml-4 flex-1">
                    <AppText variant="label" tone="cocoa">
                      {t(depthFilterText[option].label)}
                    </AppText>
                    <AppText variant="caption" tone="muted" className="mt-0.5">
                      {t(depthFilterText[option].description)}
                    </AppText>
                  </View>
                  <View className="rounded-full bg-beige px-3 py-1">
                    <AppText variant="caption" tone="cocoa">
                      {t('deck.cardCount', { count: getDeckCards(deck.id, option).length })}
                    </AppText>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* Solo or group */}
          <AppText variant="heading" tone="cocoa" className="mt-8">
            {t('deck.modeTitle')}
          </AppText>
          <View className="mt-4 flex-row gap-3">
            {(
              [
                {
                  id: 'solo',
                  icon: 'person-outline',
                  label: 'deck.solo',
                  description: 'deck.soloDescription',
                },
                {
                  id: 'group',
                  icon: 'people-outline',
                  label: 'deck.group',
                  description: 'deck.groupDescription',
                },
              ] as const
            ).map((option) => {
              const selected = option.id === mode;
              return (
                <Pressable
                  key={option.id}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  onPress={() => setMode(option.id)}
                  className={`flex-1 rounded-2xl border-2 p-4 active:opacity-80 ${selected ? 'border-cocoa bg-paper' : 'border-sand/70 bg-paper'}`}>
                  <View
                    className={`h-10 w-10 items-center justify-center rounded-full ${selected ? 'bg-cocoa' : 'bg-beige'}`}>
                    <Ionicons
                      name={option.icon}
                      size={20}
                      color={selected ? colors.paper : colors.cocoa}
                    />
                  </View>
                  <AppText variant="label" tone="cocoa" className="mt-3">
                    {t(option.label)}
                  </AppText>
                  <AppText variant="caption" tone="muted" className="mt-0.5">
                    {t(option.description)}
                  </AppText>
                </Pressable>
              );
            })}
          </View>

          <View className="mt-8">
            <Button label={t('deck.next')} icon="arrow-forward" disabled={!depth} onPress={next} />
          </View>
        </>
      )}
    </Screen>
  );
}
