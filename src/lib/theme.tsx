import AsyncStorage from '@react-native-async-storage/async-storage';
import { vars } from 'nativewind';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useColorScheme, View } from 'react-native';

import {
  accents,
  cssVariableNames,
  palettes,
  shadowsFor,
  type ColorScheme,
  type ThemeColors,
  type UIColors,
} from '@/constants/theme';

const STORAGE_KEY = 'gunita:appearance';

/** "system" follows the phone's light/dark setting. */
export type AppearancePreference = 'system' | 'light' | 'dark';

type ThemeContextValue = {
  loaded: boolean;
  preference: AppearancePreference;
  setPreference: (preference: AppearancePreference) => void;
  /** The appearance actually shown right now. */
  scheme: ColorScheme;
  /** Switches between light and dark (used by the quick toggle on Home). */
  toggle: () => void;
  colors: ThemeColors;
  shadows: ReturnType<typeof shadowsFor>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** '#F7F1E8' → '247 241 232', the format the Tailwind color variables expect. */
function toRgbTriplet(hex: string) {
  const value = parseInt(hex.slice(1), 16);
  return `${(value >> 16) & 255} ${(value >> 8) & 255} ${value & 255}`;
}

const cssVariablesFor = (palette: UIColors) =>
  vars(
    Object.fromEntries(
      (Object.keys(cssVariableNames) as (keyof UIColors)[]).map((key) => [
        cssVariableNames[key],
        toRgbTriplet(palette[key]),
      ]),
    ),
  );

const themeVariables = {
  light: cssVariablesFor(palettes.light),
  dark: cssVariablesFor(palettes.dark),
};

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<AppearancePreference | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => setPreferenceState(value === 'light' || value === 'dark' ? value : 'system'))
      .catch(() => setPreferenceState('system'));
  }, []);

  const current = preference ?? 'system';
  const scheme: ColorScheme =
    current === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : current;

  const setPreference = (next: AppearancePreference) => {
    setPreferenceState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  };

  const value: ThemeContextValue = {
    loaded: preference !== null,
    preference: current,
    setPreference,
    scheme,
    toggle: () => setPreference(scheme === 'dark' ? 'light' : 'dark'),
    colors: { ...palettes[scheme], ...accents },
    shadows: shadowsFor(scheme),
  };

  return (
    <ThemeContext.Provider value={value}>
      <View style={[{ flex: 1 }, themeVariables[scheme]]}>{children}</View>
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useAppTheme must be used inside AppThemeProvider');
  return context;
}

/** Current UI + accent colors, for places that can't use NativeWind classes. */
export function useColors() {
  return useAppTheme().colors;
}
