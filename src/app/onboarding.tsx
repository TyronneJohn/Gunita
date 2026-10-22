import type Ionicons from '@expo/vector-icons/Ionicons';
import { useRef, useState, type ComponentProps } from 'react';
import { FlatList, Pressable, useWindowDimensions, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { Button } from '@/components/button';
import { DeckArt } from '@/components/deck-art';
import { accents } from '@/constants/theme';
import { useLanguage, type TranslationKey } from '@/i18n';
import { useOnboarding } from '@/lib/onboarding';

type Slide = {
  key: string;
  eyebrow: TranslationKey;
  title: TranslationKey;
  body: TranslationKey;
  icon: ComponentProps<typeof Ionicons>['name'];
  accent: string;
};

const SLIDES: Slide[] = [
  {
    key: 'welcome',
    eyebrow: 'onboarding.welcomeEyebrow',
    title: 'onboarding.welcomeTitle',
    body: 'onboarding.welcomeBody',
    icon: 'leaf-outline',
    accent: accents.sage,
  },
  {
    key: 'how',
    eyebrow: 'onboarding.howEyebrow',
    title: 'onboarding.howTitle',
    body: 'onboarding.howBody',
    icon: 'albums-outline',
    accent: accents.clay,
  },
  {
    key: 'start',
    eyebrow: 'onboarding.startEyebrow',
    title: 'onboarding.startTitle',
    body: 'onboarding.startBody',
    icon: 'heart-outline',
    accent: accents.rose,
  },
];

export default function OnboardingScreen() {
  const { t } = useLanguage();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useOnboarding();
  const listRef = useRef<FlatList<Slide>>(null);
  const [index, setIndex] = useState(0);

  const isLast = index === SLIDES.length - 1;

  const goNext = () => {
    if (isLast) {
      completeOnboarding();
      return;
    }
    listRef.current?.scrollToIndex({ index: index + 1, animated: true });
    setIndex(index + 1);
  };

  return (
    <View
      className="flex-1 bg-cream"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom + 20 }}>
      <View className="h-12 flex-row items-center justify-end px-5">
        {!isLast && (
          <Pressable onPress={completeOnboarding} hitSlop={12} className="active:opacity-60">
            <AppText variant="label" tone="muted">
              {t('onboarding.skip')}
            </AppText>
          </Pressable>
        )}
      </View>

      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(slide) => slide.key}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) =>
          setIndex(Math.round(event.nativeEvent.contentOffset.x / width))
        }
        renderItem={({ item }) => <SlideView slide={item} width={width} />}
      />

      <View className="px-5">
        <View className="mb-6 flex-row justify-center gap-2">
          {SLIDES.map((slide, i) => (
            <View
              key={slide.key}
              className={`h-2 rounded-full ${i === index ? 'w-6 bg-cocoa' : 'w-2 bg-sand'}`}
            />
          ))}
        </View>
        <Button
          label={isLast ? t('onboarding.begin') : t('onboarding.next')}
          icon={isLast ? 'sparkles-outline' : 'arrow-forward'}
          onPress={goNext}
        />
      </View>
    </View>
  );
}

function SlideView({ slide, width }: { slide: Slide; width: number }) {
  const { t } = useLanguage();

  return (
    <View style={{ width }} className="flex-1 items-center justify-center px-8">
      <Animated.View entering={FadeInDown.duration(600)}>
        <View
          className="mb-10 h-64 w-64 items-center justify-center rounded-full"
          style={{ backgroundColor: `${slide.accent}55` }}>
          <View
            className="h-48 w-48 items-center justify-center rounded-full"
            style={{ backgroundColor: slide.accent }}>
            <DeckArt icon={slide.icon} scale={1.2} />
          </View>
        </View>
      </Animated.View>
      <AppText variant="overline" tone="sage" className="mb-2 text-center">
        {t(slide.eyebrow)}
      </AppText>
      <AppText variant="display" tone="cocoa" className="text-center">
        {t(slide.title)}
      </AppText>
      <AppText variant="body" tone="muted" className="mt-4 text-center">
        {t(slide.body)}
      </AppText>
    </View>
  );
}
