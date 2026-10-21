/**
 * Raw design tokens for places that can't use NativeWind classes
 * (tab bar options, icon colors, shadows). Keep in sync with tailwind.config.js.
 */

export const colors = {
  cream: '#F7F1E8',
  paper: '#FFFBF5',
  beige: '#E8DCC8',
  sand: '#D9C9B0',
  cocoa: '#5C4033',
  cocoaSoft: '#8A6A58',
  sage: '#9CAF88',
  sageDeep: '#6F8560',
  clay: '#C9967A',
  rose: '#D4A5A0',
  dusk: '#A698AE',
  mist: '#9DB3B1',
  ink: '#2E2621',
  muted: '#8A7A6D',
  /** Filled heart for favorites. */
  berry: '#B8615B',
} as const;

export const fonts = {
  display: 'Fraunces_600SemiBold',
  serif: 'Fraunces_400Regular',
  serifLight: 'Fraunces_300Light',
  sans: 'DMSans_400Regular',
  sansMedium: 'DMSans_500Medium',
  sansBold: 'DMSans_700Bold',
} as const;

/** Soft, warm "paper on a table" shadows. */
export const shadows = {
  card: '0px 6px 18px rgba(92, 64, 51, 0.10)',
  lifted: '0px 12px 28px rgba(92, 64, 51, 0.16)',
} as const;
