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
import { colors, fonts } from '@/constants/theme';
import { useLanguage } from '@/i18n';

/**
 * Takes over from the native splash screen: the Gunita mark gently
 * fades in, holds for a moment, then the whole overlay fades away.
 */
export function SplashOverlay() {
  const { t } = useLanguage();
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
    <Animated.View onLayout={start} style={[styles.overlay, overlayStyle]}>
      <Animated.View style={[styles.content, contentStyle]}>
        <DeckArt glyph="G" backColors={[colors.sage, colors.clay]} scale={1.3} />
        <Text style={styles.title}>Gunita</Text>
        <Text style={styles.tagline}>{t('splash.tagline')}</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.cream,
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
    color: colors.cocoa,
  },
  tagline: {
    marginTop: 4,
    fontFamily: fonts.sans,
    fontSize: 15,
    letterSpacing: 0.5,
    color: colors.muted,
  },
});
