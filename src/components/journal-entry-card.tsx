import { Pressable, Text, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { PaperCard } from '@/components/paper-card';
import { colors } from '@/constants/theme';
import { getMood } from '@/data/moods';
import { getQuestion } from '@/data/questions';
import { useLanguage } from '@/i18n';
import { getDateParts } from '@/lib/date';
import type { JournalEntry } from '@/lib/journal';

type JournalEntryCardProps = {
  entry: JournalEntry;
  onPress: () => void;
  /** Hide the question when the list is already about one question. */
  showQuestion?: boolean;
};

export function JournalEntryCard({ entry, onPress, showQuestion = true }: JournalEntryCardProps) {
  const { t, pick, language } = useLanguage();
  const question = getQuestion(entry.questionId);
  const mood = getMood(entry.mood);
  const date = getDateParts(new Date(entry.createdAt), language);

  return (
    <Pressable accessibilityRole="button" onPress={onPress} className="active:opacity-80">
      <PaperCard className="flex-row p-4">
        {/* Calendar-style date */}
        <View className="w-12 items-center pt-0.5">
          <AppText variant="overline" tone="muted">
            {date.month}
          </AppText>
          <AppText variant="title" tone="cocoa">
            {date.day}
          </AppText>
          <AppText variant="caption" tone="muted">
            {date.weekday}
          </AppText>
        </View>

        <View
          className="mx-3 w-0.5 rounded-full"
          style={{ backgroundColor: question?.deck.color ?? colors.beige }}
        />

        <View className="min-w-0 flex-1">
          <View className="flex-row items-center gap-2">
            <AppText variant="overline" tone="muted" numberOfLines={1} className="flex-1">
              {question?.deck.title ?? ''}
            </AppText>
            {entry.draft && (
              <View className="rounded-full bg-beige px-2.5 py-0.5">
                <AppText variant="caption" tone="cocoa">
                  {t('journal.draft')}
                </AppText>
              </View>
            )}
          </View>

          {showQuestion && question && (
            <AppText variant="heading" tone="cocoa" numberOfLines={2} className="mt-1">
              {pick(question.card.question)}
            </AppText>
          )}

          {mood && (
            <View className="mt-3 flex-row">
              <View className="flex-row items-center gap-1 rounded-full bg-beige px-2.5 py-1">
                <Text style={{ fontSize: 12 }}>{mood.emoji}</Text>
                <AppText variant="caption" tone="cocoa">
                  {t(mood.label)}
                </AppText>
              </View>
            </View>
          )}
        </View>
      </PaperCard>
    </Pressable>
  );
}
