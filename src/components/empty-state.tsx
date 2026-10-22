import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps, ReactNode } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/app-text';
import { PaperCard } from '@/components/paper-card';
import { useColors } from '@/lib/theme';

type EmptyStateProps = {
  icon: ComponentProps<typeof Ionicons>['name'];
  title: string;
  body: string;
  children?: ReactNode;
  className?: string;
};

export function EmptyState({ icon, title, body, children, className = '' }: EmptyStateProps) {
  const colors = useColors();
  return (
    <PaperCard className={`items-center px-6 py-10 ${className}`}>
      <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-beige">
        <Ionicons name={icon} size={28} color={colors.cocoa} />
      </View>
      <AppText variant="heading" tone="cocoa" className="text-center">
        {title}
      </AppText>
      <AppText variant="body" tone="muted" className="mt-2 text-center">
        {body}
      </AppText>
      {children}
    </PaperCard>
  );
}
