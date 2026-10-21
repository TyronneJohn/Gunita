import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import type { ComponentProps } from 'react';
import { Pressable, Text } from 'react-native';

import { colors } from '@/constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  icon?: ComponentProps<typeof Ionicons>['name'];
  disabled?: boolean;
  className?: string;
};

const containerStyles: Record<ButtonVariant, string> = {
  primary: 'bg-cocoa',
  secondary: 'border border-cocoa/25 bg-paper',
  ghost: 'bg-transparent',
};

const labelColors: Record<ButtonVariant, string> = {
  primary: colors.paper,
  secondary: colors.cocoa,
  ghost: colors.cocoa,
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled = false,
  className = '',
}: ButtonProps) {
  const handlePress = () => {
    Haptics.selectionAsync().catch(() => {});
    onPress?.();
  };

  return (
    <Pressable
      accessibilityRole="button"
      onPress={handlePress}
      disabled={disabled}
      className={`flex-row items-center justify-center gap-2 rounded-full px-6 py-4 active:opacity-80 ${containerStyles[variant]} ${disabled ? 'opacity-40' : ''} ${className}`}>
      <Text className="font-sans-bold text-[15px]" style={{ color: labelColors[variant] }}>
        {label}
      </Text>
      {icon && <Ionicons name={icon} size={18} color={labelColors[variant]} />}
    </Pressable>
  );
}
