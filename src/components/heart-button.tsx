import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { Pressable } from 'react-native';

import { colors } from '@/constants/theme';
import { useLanguage } from '@/i18n';
import { useFavorites } from '@/lib/favorites';

type HeartButtonProps = {
  questionId: string;
  size?: 'small' | 'large';
  /** Use "light" on dark backgrounds so the outline stays visible. */
  tone?: 'dark' | 'light';
};

/** Saves or removes a question from favorites. Just the heart, no background. */
export function HeartButton({ questionId, size = 'small', tone = 'dark' }: HeartButtonProps) {
  const { t } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();
  const saved = isFavorite(questionId);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={saved ? t('favorites.remove') : t('favorites.add')}
      accessibilityState={{ selected: saved }}
      hitSlop={10}
      onPress={() => {
        Haptics.impactAsync(
          saved ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium,
        ).catch(() => {});
        toggleFavorite(questionId);
      }}
      className={`items-center justify-center active:opacity-60 ${size === 'large' ? 'h-12 w-12' : 'h-10 w-10'}`}>
      <Ionicons
        name={saved ? 'heart' : 'heart-outline'}
        size={size === 'large' ? 30 : 24}
        color={saved ? colors.berry : tone === 'light' ? colors.paper : colors.cocoa}
      />
    </Pressable>
  );
}
