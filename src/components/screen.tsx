import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ScreenProps = {
  children: ReactNode;
  /** Wrap content in a ScrollView. Defaults to true. */
  scroll?: boolean;
  /** Add the bottom safe-area inset (for screens without a tab bar). */
  padBottom?: boolean;
  className?: string;
};

/** Cream page wrapper with safe-area spacing and side gutters. */
export function Screen({
  children,
  scroll = true,
  padBottom = false,
  className = '',
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const paddingTop = insets.top + 12;
  const paddingBottom = (padBottom ? insets.bottom : 0) + 28;

  if (!scroll) {
    return (
      <View className={`flex-1 bg-cream px-5 ${className}`} style={{ paddingTop, paddingBottom }}>
        {children}
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-cream"
      contentContainerStyle={{ paddingTop, paddingBottom }}
      showsVerticalScrollIndicator={false}>
      <View className={`px-5 ${className}`}>{children}</View>
    </ScrollView>
  );
}
