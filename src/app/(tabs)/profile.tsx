import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Button } from '@/components/button';
import { PageHeader } from '@/components/page-header';
import { PaperCard } from '@/components/paper-card';
import { Screen } from '@/components/screen';
import { colors } from '@/constants/theme';
import { useOnboarding } from '@/lib/onboarding';

const SETTINGS: { icon: ComponentProps<typeof Ionicons>['name']; label: string }[] = [
  { icon: 'person-circle-outline', label: 'Account' },
  { icon: 'language-outline', label: 'Language' },
  { icon: 'color-palette-outline', label: 'Appearance' },
  { icon: 'lock-closed-outline', label: 'Privacy' },
];

export default function ProfileScreen() {
  const { resetOnboarding } = useOnboarding();

  return (
    <Screen>
      <PageHeader eyebrow="Profile" title="Ikaw" subtitle="Settings and account options are on the way." />

      <PaperCard className="mt-6 px-5">
        {SETTINGS.map((item, i) => (
          <View
            key={item.label}
            className={`flex-row items-center py-4 ${i > 0 ? 'border-t border-beige' : ''}`}>
            <Ionicons name={item.icon} size={22} color={colors.cocoa} />
            <AppText variant="label" tone="ink" className="ml-3 flex-1">
              {item.label}
            </AppText>
            <View className="rounded-full bg-beige px-2.5 py-1">
              <AppText variant="caption" tone="muted">
                Soon
              </AppText>
            </View>
          </View>
        ))}
      </PaperCard>

      <Button
        className="mt-6"
        variant="secondary"
        icon="refresh-outline"
        label="Ipakita ulit ang onboarding"
        onPress={resetOnboarding}
      />
    </Screen>
  );
}
