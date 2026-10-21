import { router } from 'expo-router';
import { View } from 'react-native';

import { AppText } from '@/components/app-text';
import { EmptyState } from '@/components/empty-state';
import { JournalEntryCard } from '@/components/journal-entry-card';
import { PageHeader } from '@/components/page-header';
import { Screen } from '@/components/screen';
import { useLanguage } from '@/i18n';
import { formatMonthYear } from '@/lib/date';
import { useJournal, type JournalEntry } from '@/lib/journal';

export default function JournalScreen() {
  const { t, language } = useLanguage();
  const { entries } = useJournal();

  // Group entries by month, newest first.
  const groups: { label: string; entries: JournalEntry[] }[] = [];
  for (const entry of entries) {
    const label = formatMonthYear(new Date(entry.createdAt), language);
    const last = groups[groups.length - 1];
    if (last?.label === label) last.entries.push(entry);
    else groups.push({ label, entries: [entry] });
  }

  return (
    <Screen>
      <PageHeader eyebrow={t('journal.eyebrow')} title={t('journal.title')} />
      {entries.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon="book-outline"
          title={t('journal.emptyTitle')}
          body={t('journal.emptyBody')}
        />
      ) : (
        groups.map((group) => (
          <View key={group.label} className="mt-7">
            <AppText variant="overline" tone="muted" className="mb-3">
              {group.label}
            </AppText>
            <View className="gap-3">
              {group.entries.map((entry) => (
                <JournalEntryCard
                  key={entry.id}
                  entry={entry}
                  onPress={() =>
                    router.push({
                      pathname: '/write/[questionId]',
                      params: { questionId: entry.questionId, entryId: entry.id },
                    })
                  }
                />
              ))}
            </View>
          </View>
        ))
      )}
    </Screen>
  );
}
