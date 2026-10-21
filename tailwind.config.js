/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // Keep in sync with src/constants/theme.ts
      colors: {
        cream: "#F7F1E8",
        paper: "#FFFBF5",
        beige: "#E8DCC8",
        sand: "#D9C9B0",
        cocoa: "#5C4033",
        "cocoa-soft": "#8A6A58",
        sage: "#9CAF88",
        "sage-deep": "#6F8560",
        clay: "#C9967A",
        rose: "#D4A5A0",
        dusk: "#A698AE",
        mist: "#9DB3B1",
        ink: "#2E2621",
        muted: "#8A7A6D",
        berry: "#B8615B",
        olive: "#B3B38A",
        peach: "#E6B794",
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
