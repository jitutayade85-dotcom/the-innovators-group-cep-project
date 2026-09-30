// Design tokens for this app — filled from /app/design_guidelines.json.
// "Material You Expressive LIGHT" personality: high-contrast botanical palette
// chosen for rural youth accessibility (low literacy, low-end phones).
//
// How the names work: a plain key is a background, and its `on` partner is the
// text or icon color that sits on top of it. Always use them as a pair.
//   <View style={{ backgroundColor: colors.brandPrimary }}>
//     <Text style={{ color: colors.onBrandPrimary }}>Continue</Text>
//   </View>
//
// Styling a screen or component: build the sheet with makeStyles so colors
// and layout live together:
//   const useStyles = makeStyles((colors) => ({ card: { ... } }));
// For color props that are not styles (icon color, placeholderTextColor),
// read useTheme().colors inside the component.

import { useMemo } from "react";
import { Appearance, StyleSheet, useColorScheme } from "react-native";

export type ColorScheme = "light" | "dark";

const light = {
  // Surfaces: backgrounds, from the screen down to small fills.
  surface: "#F9F8F6", // primary canvas, most of every screen
  onSurface: "#1A1C18", // text and icons on the canvas
  surfaceSecondary: "#F1EFEC", // cards, sheets, list rows
  onSurfaceSecondary: "#434842", // text and icons on cards, sheets, rows
  surfaceTertiary: "#E5E3DF", // input backgrounds, chips, deepest nesting
  onSurfaceTertiary: "#747972", // text on inputs and chips
  surfaceInverse: "#2F312D", // tooltips, snackbars, anything popping against the theme
  onSurfaceInverse: "#F1EFEC", // text and icons on the inverse surface
  muted: "#5A5E59", // subdued text on surface: captions, timestamps, placeholders

  // Brand: the identity color and the fills built from it.
  brand: "#1F513F",
  onBrand: "#FFFFFF",
  brandPrimary: "#1F513F", // primary CTA, active tab, selected states
  onBrandPrimary: "#FFFFFF",
  brandSecondary: "#3A7D64", // secondary CTA, less prominent accents
  onBrandSecondary: "#FFFFFF",
  brandTertiary: "#D6E8DF", // chips, tags, badges, icon circles
  onBrandTertiary: "#0B2119",

  // Status: semantic only, never decorative.
  success: "#2D6A4F",
  onSuccess: "#FFFFFF",
  warning: "#B5651D",
  onWarning: "#FFFFFF",
  error: "#BA1A1A",
  onError: "#FFFFFF",
  info: "#2B5C8F",
  onInfo: "#FFFFFF",

  // Lines
  border: "#D8D6D0",
  borderStrong: "#1F513F",
  divider: "#E8E6E0",
};

export type ThemeColors = typeof light;

export const defaultScheme = "light" satisfies ColorScheme;

export const themes: { light: ThemeColors; dark?: ThemeColors } = { light };

// Spacing on the 8pt-friendly grid used by the design guidelines.
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

// Corner radius tokens from the design guidelines.
export const radius = {
  sm: 8,
  md: 16,
  lg: 24,
  pill: 999,
} as const;

// Font families loaded in app/_layout.tsx with expo-font.
export const fonts = {
  display: "PlusJakartaSans_Bold",
  textSemi: "Geist_SemiBold",
  text: "Geist_Regular",
} as const;

export function useTheme(): { scheme: ColorScheme; colors: ThemeColors } {
  const system = useColorScheme();
  const scheme: ColorScheme = system === "dark" && themes.dark ? "dark" : "light";
  return { scheme, colors: themes[scheme] ?? themes.light };
}

// Themed StyleSheet: returns a hook that builds the sheet from the active
// scheme's colors and memoizes it until the scheme changes.
export function makeStyles<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
  factory: (colors: ThemeColors) => T & StyleSheet.NamedStyles<any>,
): () => T {
  return function useStyles(): T {
    const { colors } = useTheme();
    return useMemo(() => StyleSheet.create(factory(colors)), [colors]);
  };
}
