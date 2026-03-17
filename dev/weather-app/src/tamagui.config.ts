import { createTamagui, createTokens, createFont } from "@tamagui/core";

const bodyFont = createFont({
  family: "System",
  size: { 1: 12, 2: 14, 3: 16, 4: 20, 5: 24, 6: 32 },
  lineHeight: { 1: 18, 2: 20, 3: 24, 4: 28, 5: 32, 6: 40 },
  weight: { 4: "400", 6: "600", 7: "700" },
  letterSpacing: { 4: 0 },
});

const tokens = createTokens({
  size: { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, true: 16 },
  space: { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, true: 16 },
  radius: { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, true: 8 },
  zIndex: { 0: 0, 1: 100, 2: 200 },
  color: {
    background: "#f0f4f8",
    text: "#1a1a2e",
    primary: "#667eea",
    white: "#ffffff",
    black: "#000000",
  },
});

const config = createTamagui({
  tokens,
  themes: {
    light: {
      background: tokens.color.background,
      color: tokens.color.text,
    },
  },
  fonts: {
    heading: bodyFont,
    body: bodyFont,
  },
});

export type AppConfig = typeof config;

declare module "@tamagui/core" {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;
