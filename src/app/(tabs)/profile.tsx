import Ionicons from '@expo/vector-icons/Ionicons';
import { useState, type ComponentProps, type ReactNode } from 'react';
import { Pressable, Switch, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Button } from '@/components/button';
import { PageHeader } from '@/components/page-header';
import { PaperCard } from '@/components/paper-card';
import { Screen } from '@/components/screen';
import { colors } from '@/constants/theme';
import { languageNames, useLanguage, type Language, type TranslationKey } from '@/i18n';
import { useOnboarding } from '@/lib/onboarding';
import { useSounds } from '@/lib/sounds';

type IconName = ComponentProps<typeof Ionicons>['name'];

const COMING_SOON: { icon: IconName; label: TranslationKey }[] = [
  { icon: 'color-palette-outline', label: 'profile.appearance' },
  { icon: 'lock-closed-outline', label: 'profile.privacy' },
];

const LANGUAGES: Language[] = ['en', 'tl'];

export default function ProfileScreen() {
  const { t, language, setLanguage } = useLanguage();
  const { resetOnboarding } = useOnboarding();
  const { enabled: soundEnabled, setEnabled: setSoundEnabled } = useSounds();
  const [languageOpen, setLanguageOpen] = useState(false);

  return (
    <Screen>
      <PageHeader
        eyebrow={t('profile.eyebrow')}
        title={t('profile.title')}
        subtitle={t('profile.subtitle')}
      />

      <PaperCard className="mt-6 px-5">
        <SettingRow icon="person-circle-outline" label={t('profile.account')}>
          <SoonBadge label={t('profile.soon')} />
        </SettingRow>

        {/* Language */}
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: languageOpen }}
          onPress={() => setLanguageOpen((open) => !open)}
          className="active:opacity-70">
          <SettingRow icon="language-outline" label={t('profile.language')} divider>
            <AppText variant="label" tone="muted" className="mr-2">
              {languageNames[language]}
            </AppText>
            <Ionicons
              name={languageOpen ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={colors.muted}
            />
          </SettingRow>
        </Pressable>
        {languageOpen && (
          <View className="mb-3 gap-2">
            {LANGUAGES.map((option) => {
              const selected = option === language;
              return (
                <Pressable
                  key={option}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  onPress={() => setLanguage(option)}
                  className={`flex-row items-center rounded-2xl border-2 px-4 py-3 active:opacity-80 ${selected ? 'border-cocoa' : 'border-sand/70'}`}>
                  <View
                    className={`h-5 w-5 items-center justify-center rounded-full border-2 ${selected ? 'border-cocoa' : 'border-sand'}`}>
                    {selected && <View className="h-2.5 w-2.5 rounded-full bg-cocoa" />}
                  </View>
                  <AppText variant="label" tone="cocoa" className="ml-3">
                    {languageNames[option]}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        )}

        <SettingRow icon="volume-medium-outline" label={t('profile.sound')} divider>
          <Switch
            accessibilityLabel={t('profile.sound')}
            value={soundEnabled}
            onValueChange={setSoundEnabled}
            trackColor={{ false: colors.sand, true: colors.sage }}
            thumbColor={soundEnabled ? colors.cocoa : colors.paper}
          />
        </SettingRow>

        {COMING_SOON.map((item) => (
          <SettingRow key={item.label} icon={item.icon} label={t(item.label)} divider>
            <SoonBadge label={t('profile.soon')} />
          </SettingRow>
        ))}
      </PaperCard>

      <View className="mt-6">
        <Button
          variant="secondary"
          icon="refresh-outline"
          label={t('profile.replayOnboarding')}
          onPress={resetOnboarding}
        />
      </View>
    </Screen>
  );
}

function SettingRow({
  icon,
  label,
  divider = false,
  children,
}: {
  icon: IconName;
  label: string;
  divider?: boolean;
  children: ReactNode;
}) {
  return (
    <View className={`flex-row items-center py-4 ${divider ? 'border-t border-beige' : ''}`}>
      <Ionicons name={icon} size={22} color={colors.cocoa} />
      <AppText variant="label" tone="ink" className="ml-3 flex-1">
        {label}
      </AppText>
      {children}
    </View>
  );
}

function SoonBadge({ label }: { label: string }) {
  return (
    <View className="rounded-full bg-beige px-2.5 py-1">
      <AppText variant="caption" tone="muted">
        {label}
      </AppText>
    </View>
  );
}
