import { Text, type TextProps } from 'react-native';

const variants = {
  display: 'font-display text-[40px] leading-[48px]',
  title: 'font-display text-[28px] leading-9',
  heading: 'font-display text-lg leading-6',
  question: 'font-serif text-[22px] leading-8',
  body: 'font-sans text-[15px] leading-6',
  label: 'font-sans-medium text-sm leading-5',
  caption: 'font-sans text-xs leading-[18px]',
  overline: 'font-sans-bold text-[11px] uppercase tracking-[1.5px]',
} as const;

const tones = {
  ink: 'text-ink',
  cocoa: 'text-cocoa',
  muted: 'text-muted',
  sage: 'text-sage-deep',
  paper: 'text-paper',
} as const;

export type AppTextVariant = keyof typeof variants;
export type AppTextTone = keyof typeof tones;

type AppTextProps = TextProps & {
  variant?: AppTextVariant;
  tone?: AppTextTone;
  className?: string;
};

export function AppText({ variant = 'body', tone = 'ink', className = '', ...rest }: AppTextProps) {
  return <Text className={`${variants[variant]} ${tones[tone]} ${className}`} {...rest} />;
}
