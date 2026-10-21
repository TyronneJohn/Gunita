import '../../global.css';

import { DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import {
  Fraunces_300Light,
  Fraunces_400Regular,
  Fraunces_600SemiBold,
} from '@expo-google-fonts/fraunces';
import { useFonts } from 'expo-font';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { SplashOverlay } from '@/components/splash-overlay';
import { colors } from '@/constants/theme';
import { LanguageProvider, useLanguage } from '@/i18n';
import { AuthProvider, useAuth } from '@/lib/auth';
import { FavoritesProvider, useFavorites } from '@/lib/favorites';
import { GroupProvider } from '@/lib/group';
import { JournalProvider, useJournal } from '@/lib/journal';
import { OnboardingProvider, useOnboarding } from '@/lib/onboarding';
import { ProgressProvider, useProgress } from '@/lib/progress';
import { SoundProvider } from '@/lib/sounds';
import { SyncProvider } from '@/lib/sync';

SplashScreen.preventAutoHideAsync();

const gunitaTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.cream,
    card: colors.paper,
    primary: colors.cocoa,
    text: colors.ink,
    border: colors.sand,
  },
};

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
      <LanguageProvider>
        <AuthProvider>
          <SoundProvider>
            <OnboardingProvider>
              <ProgressProvider>
                <FavoritesProvider>
                  <JournalProvider>
                    <SyncProvider>
                      <GroupProvider>
                        <ThemeProvider value={gunitaTheme}>
                          <RootNavigator fontsReady={fontsLoaded || !!fontError} />
                        </ThemeProvider>
                      </GroupProvider>
                    </SyncProvider>
                  </JournalProvider>
                </FavoritesProvider>
              </ProgressProvider>
            </OnboardingProvider>
          </SoundProvider>
        </AuthProvider>
      </LanguageProvider>
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

  // Keep the native splash screen up until fonts and saved state are ready.
  const ready =
    fontsReady &&
    hasOnboarded !== null &&
    progressLoaded &&
    languageLoaded &&
    favoritesLoaded &&
    journalLoaded &&
    authLoaded;
  if (!ready) return null;

  return (
    <>
      <StatusBar style="dark" />
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
          <Stack.Screen name="auth/sign-in" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="auth/sign-up" options={{ animation: 'fade' }} />
          <Stack.Screen name="auth/forgot-password" options={{ animation: 'slide_from_right' }} />
        </Stack.Protected>
        <Stack.Protected guard={!hasOnboarded}>
          <Stack.Screen name="onboarding" />
        </Stack.Protected>
      </Stack>
      <SplashOverlay />
    </>
  );
}
