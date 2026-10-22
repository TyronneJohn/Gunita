import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { HeartButton } from '@/components/heart-button';
import { PaperCard } from '@/components/paper-card';
import { accents } from '@/constants/theme';
import { useColors } from '@/lib/theme';
import { depthLabels } from '@/data/cards';
import { getQuestion } from '@/data/questions';
import { useLanguage } from '@/i18n';
import { useJournal } from '@/lib/journal';

type FavoriteRowProps = {
  questionId: string;
  onPress: () => void;
};

/** Same layout as a journal entry, with the deck badge where the date would be. */
export function FavoriteRow({ questionId, onPress }: FavoriteRowProps) {
  const { t, pick } = useLanguage();
  const { getEntriesForQuestion } = useJournal();
  const colors = useColors();
  const question = getQuestion(questionId);
  if (!question) return null;

  const { card, deck } = question;
  const answers = getEntriesForQuestion(questionId).filter((entry) => !entry.draft).length;

  return (
    <Pressable accessibilityRole="button" onPress={onPress} className="active:opacity-80">
      <PaperCard className="flex-row p-4">
        {/* Deck badge, in the same spot as the journal's date */}
        <View className="w-12 items-center pt-0.5">
          <View
            className="h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: deck.color }}>
            <Ionicons name={deck.icon} size={18} color={accents.onAccent} />
          </View>
          <AppText variant="caption" tone="muted" className="mt-1.5">
            {depthLabels[card.depth]}
          </AppText>
        </View>

        <View className="mx-3 w-0.5 rounded-full" style={{ backgroundColor: deck.color }} />

        <View className="min-w-0 flex-1">
          <View className="flex-row items-center gap-2">
            <AppText variant="overline" tone="muted" numberOfLines={1} className="flex-1">
              {deck.title}
            </AppText>
            <View className="-my-2 -mr-2">
              <HeartButton questionId={questionId} />
            </View>
          </View>

          <AppText variant="heading" tone="cocoa" numberOfLines={2} className="mt-1">
            {pick(card.question)}
          </AppText>

          <View className="mt-3 flex-row">
            <View className="flex-row items-center gap-1 rounded-full bg-beige px-2.5 py-1">
              <Ionicons
                name={answers > 0 ? 'book' : 'book-outline'}
                size={12}
                color={colors.cocoa}
              />
              <AppText variant="caption" tone="cocoa">
                {answers > 0
                  ? t('journal.answerCount', { count: answers })
                  : t('favorites.noAnswer')}
              </AppText>
            </View>
          </View>
        </View>
      </PaperCard>
    </Pressable>
  );
}
