import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { EmptyState } from '@/components/empty-state';
import { MoodPicker } from '@/components/mood-picker';
import { PaperCard } from '@/components/paper-card';
import { accents, fonts } from '@/constants/theme';
import { useColors } from '@/lib/theme';
import { depthLabels, type Card } from '@/data/cards';
import type { Deck } from '@/data/decks';
import { getMood, type Mood } from '@/data/moods';
import { getQuestion } from '@/data/questions';
import { useLanguage } from '@/i18n';
import { formatLongDate } from '@/lib/date';
import { newEntryId, useJournal } from '@/lib/journal';

const AUTOSAVE_DELAY_MS = 600;

export default function WriteScreen() {
  const { questionId, entryId } = useLocalSearchParams<{
    questionId: string;
    entryId?: string;
  }>();
  const { t, pick, language } = useLanguage();
  const colors = useColors();
  const { getEntry, saveEntry, deleteEntry } = useJournal();
  const insets = useSafeAreaInsets();
  const question = getQuestion(questionId);

  // Read the entry once; after that this screen owns the text being edited.
  const [existing] = useState(() => (entryId ? getEntry(entryId) : undefined));
  const [id] = useState(() => existing?.id ?? newEntryId());
  const [answer, setAnswer] = useState(existing?.answer ?? '');
  const [mood, setMood] = useState<Mood | null>(existing?.mood ?? null);
  // Saved entries open as a page to read; new answers and drafts open for writing.
  const [mode, setMode] = useState<'read' | 'edit'>(existing && !existing.draft ? 'read' : 'edit');
  const [isDraft, setIsDraft] = useState(existing ? existing.draft : true);
  const createdAt = existing?.createdAt ?? Date.now();

  // Latest values for the save-on-leave below.
  const latest = useRef({
    answer,
    mood,
    isDraft,
    dirty: false,
    finished: false,
  });
  useEffect(() => {
    latest.current = { ...latest.current, answer, mood, isDraft };
  }, [answer, mood, isDraft]);

  const updateAnswer = (text: string) => {
    latest.current.dirty = true;
    setAnswer(text);
  };
  const updateMood = (next: Mood | null) => {
    latest.current.dirty = true;
    setMood(next);
  };

  // Auto-save while typing.
  useEffect(() => {
    if (!latest.current.dirty || !answer.trim()) return;
    const timer = setTimeout(
      () => saveEntry({ id, questionId, answer, mood, draft: isDraft }),
      AUTOSAVE_DELAY_MS,
    );
    return () => clearTimeout(timer);
  }, [answer, mood, id, questionId, isDraft, saveEntry]);

  // Leaving without tapping Save keeps what was written,
  // and cleans up a draft that ended up empty.
  useEffect(() => {
    return () => {
      const { answer: text, mood: lastMood, isDraft: draft, dirty, finished } = latest.current;
      if (finished || !dirty) return;
      if (text.trim()) saveEntry({ id, questionId, answer: text, mood: lastMood, draft });
      else if (draft) deleteEntry(id);
    };
    // Runs once, on leaving the screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = () => {
    saveEntry({ id, questionId, answer: answer.trim(), mood, draft: false });
    latest.current.dirty = false;
    setIsDraft(false);
    if (existing) {
      setMode('read');
    } else {
      latest.current.finished = true;
      router.back();
    }
  };

  const confirmDelete = () => {
    Alert.alert(t('write.deleteTitle'), t('write.deleteBody'), [
      { text: t('write.cancel'), style: 'cancel' },
      {
        text: t('write.deleteConfirm'),
        style: 'destructive',
        onPress: () => {
          latest.current.finished = true;
          deleteEntry(id);
          router.back();
        },
      },
    ]);
  };

  const canSave = answer.trim().length > 0;
  const selectedMood = getMood(mood);

  return (
    <KeyboardAvoidingView behavior="padding" className="flex-1 bg-cream">
      {/* Header: both sides get the same width so the title is always in the true center. */}
      <View
        className="flex-row items-center px-5"
        style={{ paddingTop: insets.top + 14, paddingBottom: 20 }}>
        <View style={styles.headerSide}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={mode === 'read' ? t('common.back') : t('common.close')}
            onPress={() => router.back()}
            hitSlop={8}
            className="h-11 w-11 items-center justify-center rounded-full border border-sand bg-paper active:opacity-70">
            <Ionicons
              name={mode === 'read' ? 'chevron-back' : 'close'}
              size={20}
              color={colors.cocoa}
            />
          </Pressable>
        </View>

        <View className="flex-1 items-center">
          {mode === 'edit' && (
            <AppText variant="label" tone="muted" numberOfLines={1}>
              {existing ? t('write.editTitle') : t('write.newTitle')}
            </AppText>
          )}
        </View>

        <View style={[styles.headerSide, { alignItems: 'flex-end' }]}>
          {mode === 'read' ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => setMode('edit')}
              hitSlop={6}
              className="h-11 items-center justify-center rounded-full border border-cocoa/25 bg-paper px-5 active:opacity-70">
              <Text style={[styles.headerButtonText, { color: colors.cocoa }]}>
                {t('write.edit')}
              </Text>
            </Pressable>
          ) : (
            <Pressable
              accessibilityRole="button"
              onPress={save}
              disabled={!canSave}
              hitSlop={6}
              className={`h-11 items-center justify-center rounded-full bg-cocoa px-5 active:opacity-80 ${canSave ? '' : 'opacity-40'}`}>
              <Text style={[styles.headerButtonText, { color: colors.paper }]}>
                {t('write.save')}
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      {!question ? (
        <View className="px-5">
          <EmptyState
            icon="help-circle-outline"
            title={t('question.notFoundTitle')}
            body={t('question.notFoundBody')}
          />
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 0,
            paddingBottom: insets.bottom + 32,
          }}>
          <QuestionHeader card={question.card} deck={question.deck} />

          {mode === 'read' ? (
            <>
              {/* Date and mood */}
              <View className="mt-7 flex-row flex-wrap items-center gap-2">
                <AppText variant="label" tone="muted">
                  {formatLongDate(new Date(createdAt), language)}
                </AppText>
                {selectedMood && (
                  <View className="flex-row items-center gap-1 rounded-full bg-beige px-3 py-1">
                    <Text style={{ fontSize: 13 }}>{selectedMood.emoji}</Text>
                    <AppText variant="caption" tone="cocoa">
                      {t(selectedMood.label)}
                    </AppText>
                  </View>
                )}
              </View>

              {/* The answer, like a page in a notebook */}
              <PaperCard className="mt-3 px-6 pb-8 pt-4">
                <Text style={[styles.quoteMark, { color: question.deck.color }]}>“</Text>
                <Text style={[styles.answerText, { color: colors.ink }]}>{answer}</Text>
              </PaperCard>

              <Pressable
                accessibilityRole="button"
                onPress={confirmDelete}
                className="mt-8 flex-row items-center justify-center gap-2 py-3 active:opacity-60">
                <Ionicons name="trash-outline" size={18} color={colors.berry} />
                <AppText variant="label" style={{ color: colors.berry }}>
                  {t('write.delete')}
                </AppText>
              </Pressable>
            </>
          ) : (
            <>
              <AppText variant="label" tone="muted" className="mb-3 mt-7">
                {t('write.moodPrompt')}
              </AppText>

              <MoodPicker value={mood} onChange={updateMood} />

              <PaperCard className="mt-6 px-5 py-4">
                <TextInput
                  value={answer}
                  onChangeText={updateAnswer}
                  placeholder={t('write.placeholder')}
                  placeholderTextColor={colors.muted}
                  multiline
                  autoFocus={!existing}
                  textAlignVertical="top"
                  style={[styles.answerText, { minHeight: 240, color: colors.ink }]}
                />
              </PaperCard>
              <View className="mt-3 flex-row items-center gap-1.5">
                <Ionicons name="cloud-done-outline" size={14} color={colors.muted} />
                <AppText variant="caption" tone="muted">
                  {t('write.autosaved')}
                </AppText>
              </View>

              {existing && (
                <Pressable
                  accessibilityRole="button"
                  onPress={confirmDelete}
                  className="mt-8 flex-row items-center justify-center gap-2 py-3 active:opacity-60">
                  <Ionicons name="trash-outline" size={18} color={colors.berry} />
                  <AppText variant="label" style={{ color: colors.berry }}>
                    {t('write.delete')}
                  </AppText>
                </Pressable>
              )}
            </>
          )}
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}

/** The question in a soft card tinted with its deck's color. */
function QuestionHeader({ card, deck }: { card: Card; deck: Deck }) {
  const { pick } = useLanguage();

  return (
    <View
      className="overflow-hidden rounded-[28px] p-6"
      style={{
        backgroundColor: deck.color,
        experimental_backgroundImage:
          'linear-gradient(170deg, rgba(255, 251, 245, 0.55) 0%, rgba(255, 251, 245, 0.8) 100%)',
      }}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View
            className="h-7 w-7 items-center justify-center rounded-full"
            style={{ backgroundColor: '#FFFBF5' }}>
            <Ionicons name={deck.icon} size={14} color={accents.onAccent} />
          </View>
          <AppText variant="overline" style={{ color: accents.onAccent }}>
            {deck.title}
          </AppText>
        </View>
        <AppText variant="caption" className="opacity-70" style={{ color: accents.onAccent }}>
          {depthLabels[card.depth]}
        </AppText>
      </View>
      <AppText variant="question" className="mt-4" style={{ color: accents.onAccent }}>
        {pick(card.question)}
      </AppText>
    </View>
  );
}

const styles = {
  headerSide: {
    width: 96,
  },
  headerButtonText: {
    fontFamily: fonts.sansBold,
    fontSize: 15,
  },
  quoteMark: {
    fontFamily: fonts.display,
    fontSize: 56,
    lineHeight: 56,
    marginBottom: -14,
  },
  answerText: {
    fontFamily: fonts.serif,
    fontSize: 18,
    lineHeight: 30,
  },
} as const;
