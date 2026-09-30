// navigation.ts — shared navigation constants.
// iOS 26+ uses the native (Liquid Glass) tab bar; everything else uses the
// classic JS tab bar from expo-router.
import { Platform } from "react-native";

export const usesNativeTabs =
  Platform.OS === "ios" && parseInt(String(Platform.Version), 10) >= 26;
