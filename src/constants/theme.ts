/**
 * Design tokens. UI colors (page, surfaces, text, borders) change between
 * light and dark mode; read them with useColors() from '@/lib/theme'.
 * Accent colors (decks, players) stay the same in both modes.
 * Keep the UI color names in sync with tailwind.config.js.
 */

/** Pastel accents used for decks, players, and moods. Same in light and dark. */
export const accents = {
  sage: '#9CAF88',
  clay: '#C9967A',
  rose: '#D4A5A0',
  dusk: '#A698AE',
  mist: '#9DB3B1',
  wheat: '#D9C9B0',
  olive: '#B3B38A',
  peach: '#E6B794',
  /** Text and icons placed on top of an accent color — always dark so it stays readable. */
  onAccent: '#2E2621',
} as const;

/** UI colors for each appearance. The names describe their role in light mode. */
export const palettes = {
  light: {
    cream: '#F7F1E8', // page background
    paper: '#FFFBF5', // cards and surfaces
    beige: '#E8DCC8', // subtle fills
    sand: '#D9C9B0', // borders
    cocoa: '#5C4033', // primary buttons and strong text
    cocoaSoft: '#8A6A58',
    ink: '#2E2621', // body text
    muted: '#8A7A6D', // secondary text
    sageDeep: '#6F8560', // positive / accent text
    berry: '#B8615B', // hearts and destructive actions
  },
  dark: {
    cream: '#1C1714',
    paper: '#27201C',
    beige: '#352C26',
    sand: '#4A3F37',
    cocoa: '#EBDCCB',
    cocoaSoft: '#C9B29F',
    ink: '#F3EAE0',
    muted: '#A69686',
    sageDeep: '#A8BE93',
    berry: '#E0918A',
  },
} as const;

export type ColorScheme = keyof typeof palettes;
export type UIColors = { [K in keyof (typeof palettes)['light']]: string };
export type ThemeColors = UIColors & typeof accents;

export const fonts = {
  display: 'Fraunces_600SemiBold',
  serif: 'Fraunces_400Regular',
  serifLight: 'Fraunces_300Light',
  sans: 'DMSans_400Regular',
  sansMedium: 'DMSans_500Medium',
  sansBold: 'DMSans_700Bold',
} as const;

/** Soft "paper on a table" shadows; deeper in dark mode so cards still lift. */
export const shadowsFor = (scheme: ColorScheme) =>
  scheme === 'dark'
    ? { card: '0px 6px 18px rgba(0, 0, 0, 0.35)', lifted: '0px 12px 28px rgba(0, 0, 0, 0.45)' }
    : {
        card: '0px 6px 18px rgba(92, 64, 51, 0.10)',
        lifted: '0px 12px 28px rgba(92, 64, 51, 0.16)',
      };

/** CSS variable names behind the NativeWind classes (bg-cream, text-ink, …). */
export const cssVariableNames: Record<keyof UIColors, string> = {
  cream: '--color-cream',
  paper: '--color-paper',
  beige: '--color-beige',
  sand: '--color-sand',
  cocoa: '--color-cocoa',
  cocoaSoft: '--color-cocoa-soft',
  ink: '--color-ink',
  muted: '--color-muted',
  sageDeep: '--color-sage-deep',
  berry: '--color-berry',
};
