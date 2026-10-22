import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState, type ComponentProps } from 'react';
import { Alert, Pressable, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { DeleteAccountButton } from '@/components/account-card';
import { FormMessage } from '@/components/form-message';
import { PageHeader } from '@/components/page-header';
import { PaperCard } from '@/components/paper-card';
import { Screen } from '@/components/screen';
import { useLanguage, type TranslationKey } from '@/i18n';
import { useAuth } from '@/lib/auth';
import { useFavorites } from '@/lib/favorites';
import { useJournal } from '@/lib/journal';
import { useProgress } from '@/lib/progress';
import { useColors } from '@/lib/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

const SECTIONS: { icon: IconName; title: TranslationKey; body: TranslationKey }[] = [
  { icon: 'phone-portrait-outline', title: 'privacy.onPhoneTitle', body: 'privacy.onPhoneBody' },
  { icon: 'cloud-outline', title: 'privacy.cloudTitle', body: 'privacy.cloudBody' },
  { icon: 'shield-checkmark-outline', title: 'privacy.neverTitle', body: 'privacy.neverBody' },
];

/** What Gunita saves, where, and a way to clear this phone's data. */
export default function PrivacyScreen() {
  const { t } = useLanguage();
  const colors = useColors();
  const { user, signOut } = useAuth();
  const journal = useJournal();
  const favorites = useFavorites();
  const progress = useProgress();
  const [cleared, setCleared] = useState(false);

  const clearData = async () => {
    // Sign out first so the next sync doesn't pull the backup straight back in.
    if (user) await signOut();
    journal.resetLocal();
    favorites.resetLocal();
    progress.resetLocal();
    setCleared(true);
  };

  const confirmClear = () => {
    Alert.alert(t('privacy.clearConfirmTitle'), t('privacy.clearConfirmBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('privacy.clearButton'), style: 'destructive', onPress: clearData },
    ]);
  };

  return (
    <Screen padBottom>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('common.back')}
        onPress={() => router.back()}
        className="h-11 w-11 items-center justify-center rounded-full border border-sand bg-paper active:opacity-70">
        <Ionicons name="chevron-back" size={22} color={colors.cocoa} />
      </Pressable>

      <PageHeader className="mt-6" eyebrow={t('privacy.eyebrow')} title={t('privacy.title')} />

      <View className="mt-6 gap-3">
        {SECTIONS.map((section) => (
          <PaperCard key={section.title} className="flex-row p-5">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-beige">
              <Ionicons name={section.icon} size={20} color={colors.cocoa} />
            </View>
            <View className="ml-4 flex-1">
              <AppText variant="heading" tone="cocoa">
                {t(section.title)}
              </AppText>
              <AppText variant="body" tone="muted" className="mt-1">
                {t(section.body)}
              </AppText>
            </View>
          </PaperCard>
        ))}
      </View>

      {/* Clear this phone's data */}
      <PaperCard className="mt-6 p-5">
        <AppText variant="heading" tone="cocoa">
          {t('privacy.clearTitle')}
        </AppText>
        <AppText variant="body" tone="muted" className="mt-1">
          {t('privacy.clearBody')}
        </AppText>
        {user && (
          <AppText variant="caption" tone="muted" className="mt-2">
            {t('privacy.clearSignedInNote')}
          </AppText>
        )}
        {cleared && (
          <View className="mt-4">
            <FormMessage tone="info" message={t('privacy.cleared')} />
          </View>
        )}
        <Pressable
          accessibilityRole="button"
          onPress={confirmClear}
          className="mt-4 h-12 flex-row items-center justify-center gap-2 rounded-full border border-berry/40 active:opacity-70">
          <Ionicons name="trash-outline" size={18} color={colors.berry} />
          <AppText variant="label" style={{ color: colors.berry }}>
            {t('privacy.clearButton')}
          </AppText>
        </Pressable>
      </PaperCard>

      {user && (
        <View className="mt-4">
          <DeleteAccountButton />
        </View>
      )}

      <AppText variant="caption" tone="muted" className="mt-6 text-center">
        {t('privacy.policySoon')}
      </AppText>
    </Screen>
  );
}
