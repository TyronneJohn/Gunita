import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { DeckArt } from '@/components/deck-art';
import { accents, fonts } from '@/constants/theme';
import { useColors } from '@/lib/theme';
import { useLanguage } from '@/i18n';

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  /** Optional row under the form, e.g. "New here? Create account". */
  footer?: ReactNode;
};

/** Shared frame for the sign in, sign up and forgot password screens. */
export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const colors = useColors();

  return (
    <KeyboardAvoidingView behavior="padding" className="flex-1 bg-cream">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 20,
          paddingTop: insets.top + 14,
          paddingBottom: insets.bottom + 24,
        }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
          onPress={() => router.back()}
          hitSlop={8}
          className="h-11 w-11 items-center justify-center rounded-full border border-sand bg-paper active:opacity-70">
          <Ionicons name="close" size={20} color={colors.cocoa} />
        </Pressable>

        <View className="mt-8 items-center">
          <DeckArt glyph="G" backColors={[accents.sage, accents.clay]} scale={0.8} />
        </View>

        <AppText variant="title" tone="cocoa" className="mt-6 text-center">
          {title}
        </AppText>
        <AppText variant="body" tone="muted" className="mt-2 text-center">
          {subtitle}
        </AppText>

        <View className="mt-8 gap-5">{children}</View>

        {footer && <View className="mt-auto items-center pt-8">{footer}</View>}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/** "New here? Create account" style row with an inline link. */
export function AuthFooterLink({
  prompt,
  action,
  onPress,
}: {
  prompt: string;
  action: string;
  onPress: () => void;
}) {
  return (
    <View className="flex-row items-center gap-1.5">
      <AppText variant="label" tone="muted">
        {prompt}
      </AppText>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        hitSlop={8}
        className="active:opacity-60">
        <AppText variant="label" tone="cocoa" style={{ fontFamily: fonts.sansBold }}>
          {action}
        </AppText>
      </Pressable>
    </View>
  );
}
