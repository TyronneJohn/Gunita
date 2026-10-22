import '../../global.css';

import { DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import {
  Fraunces_300Light,
  Fraunces_400Regular,
  Fraunces_600SemiBold,
} from '@expo-google-fonts/fraunces';
import { useFonts } from 'expo-font';
import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider,
  type ErrorBoundaryProps,
} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { Pressable, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { SplashOverlay } from '@/components/splash-overlay';
import { palettes } from '@/constants/theme';
import { LanguageProvider, useLanguage } from '@/i18n';
import { AuthProvider, useAuth } from '@/lib/auth';
import { FavoritesProvider, useFavorites } from '@/lib/favorites';
import { GroupProvider } from '@/lib/group';
import { JournalProvider, useJournal } from '@/lib/journal';
import { OnboardingProvider, useOnboarding } from '@/lib/onboarding';
import { ProgressProvider, useProgress } from '@/lib/progress';
import { SoundProvider } from '@/lib/sounds';
import { SyncProvider } from '@/lib/sync';
import { AppThemeProvider, useAppTheme } from '@/lib/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Fraunces_300Light,
    Fraunces_400Regular,
    Fraunces_600SemiBold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <SoundProvider>
              <OnboardingProvider>
                <ProgressProvider>
                  <FavoritesProvider>
                    <JournalProvider>
                      <SyncProvider>
                        <GroupProvider>
                          <RootNavigator fontsReady={fontsLoaded || !!fontError} />
                        </GroupProvider>
                      </SyncProvider>
                    </JournalProvider>
                  </FavoritesProvider>
                </ProgressProvider>
              </OnboardingProvider>
            </SoundProvider>
          </AuthProvider>
        </LanguageProvider>
      </AppThemeProvider>
    </GestureHandlerRootView>
  );
}

function RootNavigator({ fontsReady }: { fontsReady: boolean }) {
  const { hasOnboarded } = useOnboarding();
  const { loaded: progressLoaded } = useProgress();
  const { loaded: languageLoaded } = useLanguage();
  const { loaded: favoritesLoaded } = useFavorites();
  const { loaded: journalLoaded } = useJournal();
  const { loaded: authLoaded } = useAuth();
  const { loaded: themeLoaded, scheme, colors } = useAppTheme();

  // Keep the native splash screen up until fonts and saved state are ready.
  const ready =
    fontsReady &&
    hasOnboarded !== null &&
    progressLoaded &&
    languageLoaded &&
    favoritesLoaded &&
    journalLoaded &&
    authLoaded &&
    themeLoaded;
  if (!ready) return null;

  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...base,
    colors: {
      ...base.colors,
      background: colors.cream,
      card: colors.paper,
      primary: colors.cocoa,
      text: colors.ink,
      border: colors.sand,
    },
  };

  return (
    <ThemeProvider value={navigationTheme}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.cream },
          animation: 'fade',
        }}>
        <Stack.Protected guard={hasOnboarded}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="deck/[id]" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="play/[id]" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="question/[questionId]" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="write/[questionId]" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="group/[id]" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="privacy" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="auth/sign-in" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="auth/sign-up" options={{ animation: 'fade' }} />
          <Stack.Screen name="auth/forgot-password" options={{ animation: 'slide_from_right' }} />
        </Stack.Protected>
        <Stack.Protected guard={!hasOnboarded}>
          <Stack.Screen name="onboarding" />
        </Stack.Protected>
      </Stack>
      <SplashOverlay />
    </ThemeProvider>
  );
}

/**
 * Shown instead of crashing if something unexpected breaks while rendering.
 * It sits outside the app's providers, so it uses fixed colors, system fonts,
 * and both languages.
 */
export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  const colors = palettes.light;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.cream,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
      }}>
      <Text style={{ fontSize: 40 }}>🌿</Text>
      <Text
        style={{
          marginTop: 16,
          fontSize: 22,
          fontWeight: '600',
          color: colors.cocoa,
          textAlign: 'center',
        }}>
        Something went wrong
      </Text>
      <Text style={{ marginTop: 8, fontSize: 15, color: colors.muted, textAlign: 'center' }}>
        Don&apos;t worry, your journal is safe on this phone.{'\n'}
        Huwag mag-alala, ligtas ang journal mo sa phone na ito.
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={retry}
        style={{
          marginTop: 28,
          backgroundColor: colors.cocoa,
          borderRadius: 999,
          paddingHorizontal: 28,
          paddingVertical: 14,
        }}>
        <Text style={{ color: colors.paper, fontSize: 15, fontWeight: '700' }}>
          Try again · Subukan ulit
        </Text>
      </Pressable>
    </View>
  );
}
