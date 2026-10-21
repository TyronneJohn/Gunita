import type Ionicons from '@expo/vector-icons/Ionicons';
import { useRef, useState, type ComponentProps } from 'react';
import { FlatList, Pressable, useWindowDimensions, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { Button } from '@/components/button';
import { DeckArt } from '@/components/deck-art';
import { colors } from '@/constants/theme';
import { useOnboarding } from '@/lib/onboarding';

type Slide = {
  key: string;
  eyebrow: string;
  title: string;
  body: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  accent: string;
};

const SLIDES: Slide[] = [
  {
    key: 'welcome',
    eyebrow: 'Maligayang pagdating',
    title: 'Kumusta ka, talaga?',
    body: 'Ang Gunita ay isang tahimik na lugar para huminto sandali, magtanong, at makinig sa sarili mo.',
    icon: 'leaf-outline',
    accent: colors.sage,
  },
  {
    key: 'how',
    eyebrow: 'How it works',
    title: 'Draw. Reflect. Share.',
    body: 'Pick a deck, draw a card, and flip it to reveal a gentle reflection. Answer on your own, or share it with someone you trust.',
    icon: 'albums-outline',
    accent: colors.clay,
  },
  {
    key: 'start',
    eyebrow: 'Tara na',
    title: 'Walang maling sagot dito.',
    body: "Basta totoo ka lang — that's more than enough. Tara, simulan na natin.",
    icon: 'heart-outline',
    accent: colors.rose,
  },
];

export default function OnboardingScreen() {
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
    <View className="flex-1 bg-cream" style={{ paddingTop: insets.top, paddingBottom: insets.bottom + 20 }}>
      <View className="h-12 flex-row items-center justify-end px-5">
        {!isLast && (
          <Pressable onPress={completeOnboarding} hitSlop={12} className="active:opacity-60">
            <AppText variant="label" tone="muted">
              Skip
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
          label={isLast ? 'Simulan na' : 'Next'}
          icon={isLast ? 'sparkles-outline' : 'arrow-forward'}
          onPress={goNext}
        />
      </View>
    </View>
  );
}

function SlideView({ slide, width }: { slide: Slide; width: number }) {
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
        {slide.eyebrow}
      </AppText>
      <AppText variant="display" tone="cocoa" className="text-center">
        {slide.title}
      </AppText>
      <AppText variant="body" tone="muted" className="mt-4 text-center">
        {slide.body}
      </AppText>
    </View>
  );
}
