import { Pressable, View } from 'react-native';

import { AppText } from '@/components/app-text';

type SectionHeaderProps = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
};

export function SectionHeader({ title, actionLabel, onAction, className = '' }: SectionHeaderProps) {
  return (
    <View className={`flex-row items-end justify-between ${className}`}>
      <AppText variant="heading" tone="cocoa">
        {title}
      </AppText>
      {actionLabel && (
        <Pressable onPress={onAction} hitSlop={12} className="active:opacity-60">
          <AppText variant="label" tone="sage">
            {actionLabel}
          </AppText>
        </Pressable>
      )}
    </View>
  );
}
