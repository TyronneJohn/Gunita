import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { DeckTile } from '@/components/deck-tile';
import { PaperCard } from '@/components/paper-card';
import { Screen } from '@/components/screen';
import { SectionHeader } from '@/components/section-header';
import { colors } from '@/constants/theme';
import { getDailyQuestion } from '@/data/daily-questions';
import { decks, getDeck, type Deck } from '@/data/decks';
import { formatLongDate, getGreeting } from '@/lib/date';

function openDeck(deck: Deck) {
  router.push({ pathname: '/deck/[id]', params: { id: deck.id } });
}

export default function HomeScreen() {
  const today = new Date();
  const daily = getDailyQuestion(today);
  const dailyDeck = getDeck(daily.deckId);
  const featured = decks.slice(0, 4);

  return (
    <Screen>
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-4">
          <AppText variant="caption" tone="muted">
            {formatLongDate(today)}
          </AppText>
          <AppText variant="title" tone="cocoa" className="mt-1">
            {getGreeting(today)}
          </AppText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Profile"
          onPress={() => router.navigate('/profile')}
          className="h-11 w-11 items-center justify-center rounded-full border border-sand bg-paper active:opacity-70">
          <Ionicons name="person-outline" size={20} color={colors.cocoa} />
        </Pressable>
      </View>
      <AppText variant="body" tone="muted" className="mt-1">
        Kumusta ka today? Huminga muna tayo sandali.
      </AppText>

      {/* Daily question */}
      <PaperCard lifted className="mt-6 p-6">
        <View className="flex-row items-center gap-2">
          <Ionicons name="sparkles-outline" size={14} color={colors.sageDeep} />
          <AppText variant="overline" tone="sage">
            Tanong ng araw
          </AppText>
        </View>
        <AppText variant="question" tone="ink" className="mt-4">
          {daily.text}
        </AppText>
        <View className="mt-6 flex-row items-center justify-between border-t border-beige pt-4">
          {dailyDeck && (
            <View className="flex-row items-center gap-2">
              <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: dailyDeck.color }} />
              <AppText variant="caption" tone="muted">
                {dailyDeck.title}
              </AppText>
            </View>
          )}
          <AppText variant="caption" tone="muted">
            Bagong tanong bukas
          </AppText>
        </View>
      </PaperCard>

      {/* Start / continue */}
      <Pressable
        accessibilityRole="button"
        onPress={() => openDeck(decks[0])}
        className="mt-4 flex-row items-center rounded-3xl bg-cocoa p-4 active:opacity-90">
        <View
          className="h-12 w-12 items-center justify-center rounded-2xl"
          style={{ backgroundColor: decks[0].color }}>
          <Ionicons name={decks[0].icon} size={22} color={colors.paper} />
        </View>
        <View className="ml-4 flex-1">
          <AppText variant="overline" tone="paper" className="opacity-70">
            Simulan dito
          </AppText>
          <AppText variant="heading" tone="paper">
            {decks[0].title} deck
          </AppText>
        </View>
        <Ionicons name="arrow-forward" size={20} color={colors.paper} />
      </Pressable>

      {/* Featured decks */}
      <SectionHeader
        title="Featured decks"
        actionLabel="See all"
        onAction={() => router.navigate('/explore')}
        className="mt-8"
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="-mx-5 mt-4"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 12, gap: 14 }}>
        {featured.map((deck) => (
          <DeckTile key={deck.id} deck={deck} variant="featured" onPress={() => openDeck(deck)} />
        ))}
      </ScrollView>
    </Screen>
  );
}
