import { View } from 'react-native';

import { AppText } from '@/components/app-text';

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  className?: string;
};

export function PageHeader({ eyebrow, title, subtitle, className = '' }: PageHeaderProps) {
  return (
    <View className={className}>
      {eyebrow && (
        <AppText variant="overline" tone="sage" className="mb-1">
          {eyebrow}
        </AppText>
      )}
      <AppText variant="title" tone="cocoa">
        {title}
      </AppText>
      {subtitle && (
        <AppText variant="body" tone="muted" className="mt-2">
          {subtitle}
        </AppText>
      )}
    </View>
  );
}
