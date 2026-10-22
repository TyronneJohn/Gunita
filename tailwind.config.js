/** UI colors come from CSS variables so they switch with light/dark mode. */
const themed = (name) => `rgb(var(--color-${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // Keep in sync with src/constants/theme.ts
      colors: {
        cream: themed("cream"),
        paper: themed("paper"),
        beige: themed("beige"),
        sand: themed("sand"),
        cocoa: themed("cocoa"),
        "cocoa-soft": themed("cocoa-soft"),
        ink: themed("ink"),
        muted: themed("muted"),
        "sage-deep": themed("sage-deep"),
        berry: themed("berry"),
        // Accents stay the same in both modes.
        sage: "#9CAF88",
        clay: "#C9967A",
        rose: "#D4A5A0",
        dusk: "#A698AE",
        mist: "#9DB3B1",
        wheat: "#D9C9B0",
        olive: "#B3B38A",
        peach: "#E6B794",
        "on-accent": "#2E2621",
      },
      // Each weight is its own font family in React Native,
      // so we name them instead of using font-bold, etc.
      fontFamily: {
        display: ["Fraunces_600SemiBold"],
        serif: ["Fraunces_400Regular"],
        "serif-light": ["Fraunces_300Light"],
        sans: ["DMSans_400Regular"],
        "sans-medium": ["DMSans_500Medium"],
        "sans-bold": ["DMSans_700Bold"],
      },
    },
  },
  plugins: [],
};
