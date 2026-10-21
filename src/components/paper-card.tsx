import { View, type ViewProps } from 'react-native';

import { shadows } from '@/constants/theme';

type PaperCardProps = ViewProps & {
  /** Use a deeper shadow so the card feels lifted off the page. */
  lifted?: boolean;
  className?: string;
};

/** Rounded, paper-like surface with a soft warm shadow. */
export function PaperCard({ lifted = false, className = '', style, ...rest }: PaperCardProps) {
  return (
    <View
      className={`rounded-3xl border border-sand/60 bg-paper ${className}`}
      style={[{ boxShadow: lifted ? shadows.lifted : shadows.card }, style]}
      {...rest}
    />
  );
}
