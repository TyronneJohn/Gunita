import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Screen } from '@/components/screen';
import { useLanguage } from '@/i18n';

export default function JournalScreen() {
  const { t } = useLanguage();

  return (
    <Screen>
      <PageHeader eyebrow={t('journal.eyebrow')} title={t('journal.title')} />
      <EmptyState
        className="mt-6"
        icon="book-outline"
        title={t('journal.emptyTitle')}
        body={t('journal.emptyBody')}
      />
    </Screen>
  );
}
