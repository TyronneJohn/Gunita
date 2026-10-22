import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState, type ComponentProps, type ReactNode } from 'react';
import { Pressable, Switch, View } from 'react-native';

import { AccountCard, DeleteAccountButton } from '@/components/account-card';
import { AppText } from '@/components/app-text';
import { Button } from '@/components/button';
import { PageHeader } from '@/components/page-header';
import { PaperCard } from '@/components/paper-card';
import { Screen } from '@/components/screen';
import { languageNames, useLanguage, type Language, type TranslationKey } from '@/i18n';
import { useAuth } from '@/lib/auth';
import { useOnboarding } from '@/lib/onboarding';
import { useSounds } from '@/lib/sounds';
import { useAppTheme, type AppearancePreference } from '@/lib/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

const LANGUAGES: Language[] = ['en', 'tl'];

const APPEARANCES: { id: AppearancePreference; label: TranslationKey; icon: IconName }[] = [
  { id: 'system', label: 'appearance.system', icon: 'phone-portrait-outline' },
  { id: 'light', label: 'appearance.light', icon: 'sunny-outline' },
  { id: 'dark', label: 'appearance.dark', icon: 'moon-outline' },
];

export default function ProfileScreen() {
  const { t, language, setLanguage } = useLanguage();
  const { resetOnboarding } = useOnboarding();
  const { enabled: soundEnabled, setEnabled: setSoundEnabled } = useSounds();
  const { enabled: authEnabled, user } = useAuth();
  const { colors, preference, setPreference } = useAppTheme();
  const [open, setOpen] = useState<'language' | 'appearance' | null>(null);

  const toggleOpen = (section: 'language' | 'appearance') =>
    setOpen((current) => (current === section ? null : section));

  const appearanceLabel = APPEARANCES.find((option) => option.id === preference)?.label;

  return (
    <Screen>
      <PageHeader
        eyebrow={t('profile.eyebrow')}
        title={t('profile.title')}
        subtitle={t('profile.subtitle')}
      />

      {/* Account: back-up invite when signed out, email + sign out when signed in */}
      {authEnabled && (
        <View className="mt-6">
          <AccountCard />
        </View>
      )}

      <PaperCard className={`px-5 ${authEnabled ? 'mt-4' : 'mt-6'}`}>
        {!authEnabled && (
          <SettingRow icon="person-circle-outline" label={t('profile.account')}>
            <SoonBadge label={t('profile.soon')} />
          </SettingRow>
        )}

        {/* Language */}
        <ExpandableRow
          icon="language-outline"
          label={t('profile.language')}
          value={languageNames[language]}
          expanded={open === 'language'}
          divider={!authEnabled}
          onPress={() => toggleOpen('language')}
        />
        {open === 'language' && (
          <ChoiceList
            options={LANGUAGES.map((option) => ({ id: option, label: languageNames[option] }))}
            selected={language}
            onSelect={setLanguage}
          />
        )}

        {/* Appearance */}
        <ExpandableRow
          icon="color-palette-outline"
          label={t('profile.appearance')}
          value={appearanceLabel ? t(appearanceLabel) : ''}
          expanded={open === 'appearance'}
          divider
          onPress={() => toggleOpen('appearance')}
        />
        {open === 'appearance' && (
          <ChoiceList
            options={APPEARANCES.map((option) => ({
              id: option.id,
              label: t(option.label),
              icon: option.icon,
              hint: option.id === 'system' ? t('appearance.systemHint') : undefined,
            }))}
            selected={preference}
            onSelect={setPreference}
          />
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

        {/* Privacy */}
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/privacy')}
          className="active:opacity-70">
          <SettingRow icon="lock-closed-outline" label={t('profile.privacy')} divider>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </SettingRow>
        </Pressable>
      </PaperCard>

      <View className="mt-6">
        <Button
          variant="secondary"
          icon="refresh-outline"
          label={t('profile.replayOnboarding')}
          onPress={resetOnboarding}
        />
      </View>

      {user && (
        <View className="mt-8">
          <DeleteAccountButton />
        </View>
      )}
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
  const { colors } = useAppTheme();

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

/** A setting row that opens a list of choices underneath it. */
function ExpandableRow({
  icon,
  label,
  value,
  expanded,
  divider,
  onPress,
}: {
  icon: IconName;
  label: string;
  value: string;
  expanded: boolean;
  divider: boolean;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ expanded }}
      onPress={onPress}
      className="active:opacity-70">
      <SettingRow icon={icon} label={label} divider={divider}>
        <AppText variant="label" tone="muted" className="mr-2">
          {value}
        </AppText>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={colors.muted} />
      </SettingRow>
    </Pressable>
  );
}

function ChoiceList<T extends string>({
  options,
  selected,
  onSelect,
}: {
  options: { id: T; label: string; icon?: IconName; hint?: string }[];
  selected: T;
  onSelect: (id: T) => void;
}) {
  const { colors } = useAppTheme();

  return (
    <View className="mb-3 gap-2">
      {options.map((option) => {
        const isSelected = option.id === selected;
        return (
          <Pressable
            key={option.id}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelect(option.id)}
            className={`flex-row items-center rounded-2xl border-2 px-4 py-3 active:opacity-80 ${isSelected ? 'border-cocoa' : 'border-sand/70'}`}>
            <View
              className={`h-5 w-5 items-center justify-center rounded-full border-2 ${isSelected ? 'border-cocoa' : 'border-sand'}`}>
              {isSelected && <View className="h-2.5 w-2.5 rounded-full bg-cocoa" />}
            </View>
            {option.icon && (
              <Ionicons
                name={option.icon}
                size={18}
                color={colors.cocoa}
                style={{ marginLeft: 12 }}
              />
            )}
            <View className="ml-3 flex-1">
              <AppText variant="label" tone="cocoa">
                {option.label}
              </AppText>
              {option.hint && (
                <AppText variant="caption" tone="muted">
                  {option.hint}
                </AppText>
              )}
            </View>
          </Pressable>
        );
      })}
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
