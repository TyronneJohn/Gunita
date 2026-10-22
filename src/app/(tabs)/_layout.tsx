import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';

import { fonts } from '@/constants/theme';
import { useColors } from '@/lib/theme';
import { useLanguage, type TranslationKey } from '@/i18n';

type IconName = ComponentProps<typeof Ionicons>['name'];

const TABS: { name: string; title: TranslationKey; icon: IconName; activeIcon: IconName }[] = [
  { name: 'index', title: 'tabs.home', icon: 'home-outline', activeIcon: 'home' },
  { name: 'explore', title: 'tabs.explore', icon: 'compass-outline', activeIcon: 'compass' },
  { name: 'favorites', title: 'tabs.favorites', icon: 'heart-outline', activeIcon: 'heart' },
  { name: 'journal', title: 'tabs.journal', icon: 'book-outline', activeIcon: 'book' },
  { name: 'profile', title: 'tabs.profile', icon: 'person-outline', activeIcon: 'person' },
];

export default function TabLayout() {
  const { t } = useLanguage();
  const colors = useColors();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.cocoa,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.paper,
          borderTopColor: colors.beige,
          elevation: 0,
        },
        tabBarLabelStyle: { fontFamily: fonts.sansMedium, fontSize: 11 },
        sceneStyle: { backgroundColor: colors.cream },
      }}>
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: t(tab.title),
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? tab.activeIcon : tab.icon} size={22} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
