import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Screen } from '@/components/screen';

export default function FavoritesScreen() {
  return (
    <Screen>
      <PageHeader eyebrow="Favorites" title="Mga paborito mo" />
      <EmptyState
        className="mt-6"
        icon="heart-outline"
        title="Wala pang naka-save"
        body="Kapag may tanong na tumatak sa'yo, tap the heart on the card and it will live here."
      />
    </Screen>
  );
}
