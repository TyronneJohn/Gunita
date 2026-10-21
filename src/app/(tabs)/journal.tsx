import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Screen } from '@/components/screen';

export default function JournalScreen() {
  return (
    <Screen>
      <PageHeader eyebrow="My journal" title="Ang iyong mga gunita" />
      <EmptyState
        className="mt-6"
        icon="book-outline"
        title="Your journal is waiting"
        body="Dito mo maisusulat ang mga sagot mo. Private ito — para sa'yo lang."
      />
    </Screen>
  );
}
