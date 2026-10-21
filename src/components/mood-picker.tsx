import { Pressable, Text, View } from 'react-native';

import { moods, type Mood } from '@/data/moods';
import { colors, fonts } from '@/constants/theme';
import { useLanguage } from '@/i18n';

type MoodPickerProps = {
  value: Mood | null;
  /** Tapping the selected mood again clears it. */
  onChange: (mood: Mood | null) => void;
};

/** Four moods side by side in one row, each an equal-width tile. */
export function MoodPicker({ value, onChange }: MoodPickerProps) {
  const { t } = useLanguage();

  return (
    <View className="flex-row gap-2">
      {moods.map((mood) => {
        const selected = mood.id === value;
        return (
          <Pressable
            key={mood.id}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onChange(selected ? null : mood.id)}
            className={`flex-1 items-center rounded-2xl border px-1 py-3 active:opacity-80 ${selected ? 'border-cocoa bg-cocoa' : 'border-sand bg-paper'}`}>
            <Text style={{ fontSize: 22 }}>{mood.emoji}</Text>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
              style={{
                marginTop: 6,
                fontFamily: fonts.sansMedium,
                fontSize: 12,
                color: selected ? colors.paper : colors.cocoa,
              }}>
              {t(mood.label)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
