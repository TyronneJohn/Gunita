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

import { SplashOverlay } from '@/components/splash-overlay';
import { colors } from '@/constants/theme';
import { OnboardingProvider, useOnboarding } from '@/lib/onboarding';

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
    <OnboardingProvider>
      <ThemeProvider value={gunitaTheme}>
        <RootNavigator fontsReady={fontsLoaded || !!fontError} />
      </ThemeProvider>
    </OnboardingProvider>
  );
}

function RootNavigator({ fontsReady }: { fontsReady: boolean }) {
  const { hasOnboarded } = useOnboarding();

  // Keep the native splash screen up until fonts and saved state are ready.
  if (!fontsReady || hasOnboarded === null) return null;

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
        </Stack.Protected>
        <Stack.Protected guard={!hasOnboarded}>
          <Stack.Screen name="onboarding" />
        </Stack.Protected>
      </Stack>
      <SplashOverlay />
    </>
  );
}
