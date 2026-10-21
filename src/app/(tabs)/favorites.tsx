import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Screen } from '@/components/screen';
import { useLanguage } from '@/i18n';

export default function FavoritesScreen() {
  const { t } = useLanguage();

  return (
    <Screen>
      <PageHeader eyebrow={t('favorites.eyebrow')} title={t('favorites.title')} />
      <EmptyState
        className="mt-6"
        icon="heart-outline"
        title={t('favorites.emptyTitle')}
        body={t('favorites.emptyBody')}
      />
    </Screen>
  );
}
