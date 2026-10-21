import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { DeckTile } from '@/components/deck-tile';
import { HeartButton } from '@/components/heart-button';
import { PaperCard } from '@/components/paper-card';
import { Screen } from '@/components/screen';
import { SectionHeader } from '@/components/section-header';
import { colors } from '@/constants/theme';
import { getDailyQuestion } from '@/data/daily-questions';
import { decks, getDeck, type Deck } from '@/data/decks';
import { useLanguage } from '@/i18n';
import { formatLongDate, getGreetingKey } from '@/lib/date';
import { useJournal } from '@/lib/journal';
import { isSessionActive, useProgress } from '@/lib/progress';
import { useDeckProgressLabel } from '@/lib/use-deck-progress';

function openDeck(deck: Deck) {
  router.push({ pathname: '/deck/[id]', params: { id: deck.id } });
}

export default function HomeScreen() {
  const { t, pick, language } = useLanguage();
  const today = new Date();
  const daily = getDailyQuestion(today);
  const dailyDeck = getDeck(daily.deckId);
  const featured = decks.slice(0, 4);
  const progressLabel = useDeckProgressLabel();
  const { answeredToday } = useJournal();

  // Continue the last deck in progress, otherwise suggest the first deck.
  const { lastDeckId, getSession } = useProgress();
  const lastDeck = lastDeckId ? getDeck(lastDeckId) : undefined;
  const resumeSession = lastDeck ? getSession(lastDeck.id) : undefined;
  const resumable = lastDeck && isSessionActive(resumeSession) ? lastDeck : undefined;
  const highlight = resumable ?? decks[0];

  return (
    <Screen>
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-4">
          <AppText variant="caption" tone="muted">
            {formatLongDate(today, language)}
          </AppText>
          <AppText variant="title" tone="cocoa" className="mt-1">
            {t(getGreetingKey(today))}
          </AppText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('home.profile')}
          onPress={() => router.navigate('/profile')}
          className="h-11 w-11 items-center justify-center rounded-full border border-sand bg-paper active:opacity-70">
          <Ionicons name="person-outline" size={20} color={colors.cocoa} />
        </Pressable>
      </View>
      <AppText variant="body" tone="muted" className="mt-1">
        {t('home.subtitle')}
      </AppText>

      {/* Daily question */}
      <PaperCard lifted className="mt-6 p-6">
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            router.push({ pathname: '/question/[questionId]', params: { questionId: daily.id } })
          }
          className="active:opacity-70">
          <View className="flex-row items-center gap-2">
            <Ionicons name="sparkles-outline" size={14} color={colors.sageDeep} />
            <AppText variant="overline" tone="sage">
              {t('home.dailyQuestion')}
            </AppText>
          </View>
          <AppText variant="question" tone="ink" className="mt-4">
            {pick(daily.question)}
          </AppText>
        </Pressable>

        <View className="mt-5 flex-row items-center gap-3">
          <HeartButton questionId={daily.id} />
          {answeredToday(daily.id) ? (
            <View className="flex-row items-center gap-1.5 rounded-full bg-sage/25 px-4 py-2.5">
              <Ionicons name="checkmark-circle" size={16} color={colors.sageDeep} />
              <AppText variant="label" tone="sage">
                {t('home.answeredToday')}
              </AppText>
            </View>
          ) : (
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                router.push({ pathname: '/write/[questionId]', params: { questionId: daily.id } })
              }
              className="flex-row items-center gap-1.5 rounded-full border border-cocoa/25 px-4 py-2.5 active:opacity-70">
              <Ionicons name="create-outline" size={16} color={colors.cocoa} />
              <AppText variant="label" tone="cocoa">
                {t('home.answer')}
              </AppText>
            </Pressable>
          )}
        </View>

        <View className="mt-5 flex-row items-center justify-between border-t border-beige pt-4">
          {dailyDeck && (
            <View className="flex-row items-center gap-2">
              <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: dailyDeck.color }} />
              <AppText variant="caption" tone="muted">
                {dailyDeck.title}
              </AppText>
            </View>
          )}
          <AppText variant="caption" tone="muted">
            {t('home.newTomorrow')}
          </AppText>
        </View>
      </PaperCard>

      {/* Start / continue */}
      <Pressable
        accessibilityRole="button"
        onPress={() =>
          resumable
            ? router.push({ pathname: '/play/[id]', params: { id: resumable.id } })
            : openDeck(highlight)
        }
        className="mt-4 flex-row items-center rounded-3xl bg-cocoa p-4 active:opacity-90">
        <View
          className="h-12 w-12 items-center justify-center rounded-2xl"
          style={{ backgroundColor: highlight.color }}>
          <Ionicons name={highlight.icon} size={22} color={colors.paper} />
        </View>
        <View className="ml-4 flex-1">
          <AppText variant="overline" tone="paper" className="opacity-70">
            {resumable
              ? t('home.continue', { progress: progressLabel(resumable.id) ?? '' })
              : t('home.startHere')}
          </AppText>
          <AppText variant="heading" tone="paper">
            {t('common.deckName', { deck: highlight.title })}
          </AppText>
        </View>
        <Ionicons name={resumable ? 'play' : 'arrow-forward'} size={20} color={colors.paper} />
      </Pressable>

      {/* Featured decks */}
      <SectionHeader
        title={t('home.featured')}
        actionLabel={t('home.seeAll')}
        onAction={() => router.navigate('/explore')}
        className="mt-8"
      />
      <View className="mt-4 flex-row flex-wrap justify-between gap-y-4">
        {featured.map((deck) => (
          <DeckTile
            key={deck.id}
            deck={deck}
            progress={progressLabel(deck.id)}
            onPress={() => openDeck(deck)}
          />
        ))}
      </View>
    </Screen>
  );
}
