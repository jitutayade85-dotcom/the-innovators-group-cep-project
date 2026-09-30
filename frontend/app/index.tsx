// Gate (route "/"): decides where a first-time vs returning user lands.
//   1. No language chosen yet  -> language selection screen
//   2. No profile name yet     -> profile screen
//   3. Otherwise               -> Home
// While the profile is loading we show a simple centered loader.

import React from "react";
import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";
import { useProfile } from "@/src/features/profile/ProfileContext";
import { useTheme } from "@/src/theme";

export default function Gate() {
  const { ready, langChosen, profile } = useProfile();
  const { colors } = useTheme();

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={colors.brandPrimary} />
      </View>
    );
  }

  if (!langChosen) return <Redirect href="/onboarding/language" />;
  if (!profile?.name) return <Redirect href="/onboarding/profile" />;
  return <Redirect href="/home" />;
}
