import { router } from 'expo-router';
import { View } from 'react-native';

import { EmptyState } from '@/components/empty-state';
import { FavoriteRow } from '@/components/favorite-row';
import { PageHeader } from '@/components/page-header';
import { Screen } from '@/components/screen';
import { useLanguage } from '@/i18n';
import { useFavorites } from '@/lib/favorites';

export default function FavoritesScreen() {
  const { t } = useLanguage();
  const { favorites } = useFavorites();

  return (
    <Screen>
      <PageHeader
        eyebrow={t('favorites.eyebrow')}
        title={t('favorites.title')}
        subtitle={
          favorites.length > 0 ? t('favorites.count', { count: favorites.length }) : undefined
        }
      />
      {favorites.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon="heart-outline"
          title={t('favorites.emptyTitle')}
          body={t('favorites.emptyBody')}
        />
      ) : (
        <View className="mt-6 gap-3">
          {favorites.map((questionId) => (
            <FavoriteRow
              key={questionId}
              questionId={questionId}
              onPress={() =>
                router.push({ pathname: '/question/[questionId]', params: { questionId } })
              }
            />
          ))}
        </View>
      )}
    </Screen>
  );
}
