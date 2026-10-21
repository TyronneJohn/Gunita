import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Button } from '@/components/button';
import { PaperCard } from '@/components/paper-card';
import { colors, fonts } from '@/constants/theme';
import { useLanguage, type TranslationKey } from '@/i18n';
import { useAuth } from '@/lib/auth';
import { useSync, type SyncStatus } from '@/lib/sync';

const syncLabels: Record<
  SyncStatus,
  { icon: keyof typeof Ionicons.glyphMap; key: TranslationKey }
> = {
  idle: { icon: 'checkmark-circle', key: 'account.signedIn' },
  syncing: { icon: 'sync-outline', key: 'account.syncing' },
  synced: { icon: 'cloud-done', key: 'account.backedUp' },
  error: { icon: 'cloud-offline-outline', key: 'account.syncError' },
};

/**
 * Signed out: invites the player to back up their journal.
 * Signed in: shows the account email with a sign out button.
 * Hidden entirely when Supabase isn't configured.
 */
export function AccountCard() {
  const { t } = useLanguage();
  const { enabled, user, signOut } = useAuth();
  const { status } = useSync();
  const syncLabel = syncLabels[status];
  const syncColor = status === 'error' ? colors.berry : colors.sageDeep;

  if (!enabled) return null;

  if (!user) {
    return (
      <PaperCard className="p-5">
        <View className="flex-row items-start">
          <View className="h-11 w-11 items-center justify-center rounded-full bg-sage/25">
            <Ionicons name="cloud-upload-outline" size={22} color={colors.sageDeep} />
          </View>
          <View className="ml-3 flex-1">
            <AppText variant="heading" tone="cocoa">
              {t('account.backupTitle')}
            </AppText>
            <AppText variant="body" tone="muted" className="mt-1">
              {t('account.backupBody')}
            </AppText>
          </View>
        </View>
        <View className="mt-5 gap-3">
          <Button label={t('auth.createAccount')} onPress={() => router.push('/auth/sign-up')} />
          <Button
            variant="secondary"
            label={t('auth.signIn')}
            onPress={() => router.push('/auth/sign-in')}
          />
        </View>
      </PaperCard>
    );
  }

  const confirmSignOut = () => {
    Alert.alert(t('account.signOutTitle'), t('account.signOutBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('account.signOut'), onPress: () => signOut() },
    ]);
  };

  return (
    <PaperCard className="p-5">
      <View className="flex-row items-center">
        <View className="h-12 w-12 items-center justify-center rounded-full bg-cocoa">
          <Text style={{ fontFamily: fonts.display, fontSize: 20, color: colors.paper }}>
            {user.email?.[0]?.toUpperCase() ?? '?'}
          </Text>
        </View>
        <View className="ml-3 min-w-0 flex-1">
          <AppText variant="label" tone="ink" numberOfLines={1}>
            {user.email}
          </AppText>
          <View className="mt-1 flex-row items-center gap-1">
            <Ionicons name={syncLabel.icon} size={14} color={syncColor} />
            <AppText variant="caption" style={{ color: syncColor }}>
              {t(syncLabel.key)}
            </AppText>
          </View>
        </View>
      </View>
      <View className="mt-5">
        <Button variant="secondary" label={t('account.signOut')} onPress={confirmSignOut} />
      </View>
    </PaperCard>
  );
}

/** Danger-zone link that permanently deletes the signed-in account. */
export function DeleteAccountButton() {
  const { t } = useLanguage();
  const { user, deleteAccount } = useAuth();
  const { forgetOwner } = useSync();
  const [busy, setBusy] = useState(false);

  if (!user) return null;

  const confirmDelete = () => {
    Alert.alert(t('account.deleteTitle'), t('account.deleteBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('account.deleteConfirm'),
        style: 'destructive',
        onPress: async () => {
          setBusy(true);
          const { error } = await deleteAccount();
          setBusy(false);
          if (error) Alert.alert(t('common.error'), t(error));
          // The phone's entries stay, and a future account may adopt them.
          else await forgetOwner();
        },
      },
    ]);
  };

  return (
    <Pressable
      accessibilityRole="button"
      onPress={confirmDelete}
      disabled={busy}
      className={`flex-row items-center justify-center gap-2 py-3 active:opacity-60 ${busy ? 'opacity-40' : ''}`}>
      <Ionicons name="trash-outline" size={18} color={colors.berry} />
      <AppText variant="label" style={{ color: colors.berry }}>
        {t('account.delete')}
      </AppText>
    </Pressable>
  );
}
