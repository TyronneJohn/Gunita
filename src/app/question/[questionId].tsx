import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, useWindowDimensions, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Button } from '@/components/button';
import { EmptyState } from '@/components/empty-state';
import { FlipCard } from '@/components/flip-card';
import { HeartButton } from '@/components/heart-button';
import { JournalEntryCard } from '@/components/journal-entry-card';
import { Screen } from '@/components/screen';
import { useColors } from '@/lib/theme';
import { getQuestion } from '@/data/questions';
import { useLanguage } from '@/i18n';
import { useJournal } from '@/lib/journal';
import { useSounds } from '@/lib/sounds';

/** One question on its own: flip the card, save it, and see past answers. */
export default function QuestionScreen() {
  const { questionId } = useLocalSearchParams<{ questionId: string }>();
  const { t } = useLanguage();
  const colors = useColors();
  const { getEntriesForQuestion } = useJournal();
  const { playFlip } = useSounds();
  const { width } = useWindowDimensions();
  const question = getQuestion(questionId);
  // Start with the question facing up.
  const [flips, setFlips] = useState(1);

  const answers = getEntriesForQuestion(questionId);
  const cardWidth = Math.min(width - 40, 340);

  const write = (entryId?: string) =>
    router.push({
      pathname: '/write/[questionId]',
      params: entryId ? { questionId, entryId } : { questionId },
    });

  return (
    <Screen padBottom>
      <View className="flex-row items-center justify-between">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
          onPress={() => router.back()}
          className="h-11 w-11 items-center justify-center rounded-full border border-sand bg-paper active:opacity-70">
          <Ionicons name="chevron-back" size={22} color={colors.cocoa} />
        </Pressable>
        {question && <HeartButton questionId={questionId} />}
      </View>

      {!question ? (
        <EmptyState
          className="mt-6"
          icon="help-circle-outline"
          title={t('question.notFoundTitle')}
          body={t('question.notFoundBody')}
        />
      ) : (
        <>
          <View className="mt-6 items-center">
            <FlipCard
              card={question.card}
              deck={question.deck}
              flips={flips}
              width={cardWidth}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                playFlip();
                setFlips((n) => n + 1);
              }}
            />
          </View>

          <View className="mt-6">
            <Button label={t('play.write')} icon="create-outline" onPress={() => write()} />
          </View>

          <AppText variant="heading" tone="cocoa" className="mt-8">
            {t('question.yourAnswers')}
          </AppText>
          {answers.length === 0 ? (
            <AppText variant="body" tone="muted" className="mt-2">
              {t('question.noAnswers')}
            </AppText>
          ) : (
            <View className="mt-4 gap-3">
              {answers.map((entry) => (
                <JournalEntryCard
                  key={entry.id}
                  entry={entry}
                  showQuestion={false}
                  onPress={() => write(entry.id)}
                />
              ))}
            </View>
          )}
        </>
      )}
    </Screen>
  );
}
