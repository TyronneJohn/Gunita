import * as SplashScreen from 'expo-splash-screen';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { DeckArt } from '@/components/deck-art';
import { accents, fonts } from '@/constants/theme';
import { useLanguage } from '@/i18n';
import { useColors } from '@/lib/theme';

/**
 * Takes over from the native splash screen: the Gunita mark gently
 * fades in, holds for a moment, then the whole overlay fades away.
 */
export function SplashOverlay() {
  const { t } = useLanguage();
  const colors = useColors();
  const [visible, setVisible] = useState(true);
  const overlayOpacity = useSharedValue(1);
  const contentOpacity = useSharedValue(0);
  const contentLift = useSharedValue(12);

  const hide = () => setVisible(false);

  const start = () => {
    SplashScreen.hideAsync()
      .catch(() => {})
      .finally(() => {
        contentOpacity.set(withTiming(1, { duration: 600 }));
        contentLift.set(withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) }));
        overlayOpacity.set(
          withDelay(
            1500,
            withTiming(0, { duration: 500 }, (finished) => {
              if (finished) scheduleOnRN(hide);
            }),
          ),
        );
      });
  };

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.get() }));
  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.get(),
    transform: [{ translateY: contentLift.get() }],
  }));

  if (!visible) return null;

  return (
    <Animated.View
      onLayout={start}
      style={[styles.overlay, { backgroundColor: colors.cream }, overlayStyle]}>
      <Animated.View style={[styles.content, contentStyle]}>
        <DeckArt glyph="G" backColors={[accents.sage, accents.clay]} scale={1.3} />
        <Text style={[styles.title, { color: colors.cocoa }]}>Gunita</Text>
        <Text style={[styles.tagline, { color: colors.muted }]}>{t('splash.tagline')}</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    marginTop: 20,
    fontFamily: fonts.display,
    fontSize: 44,
  },
  tagline: {
    marginTop: 4,
    fontFamily: fonts.sans,
    fontSize: 15,
    letterSpacing: 0.5,
  },
});
