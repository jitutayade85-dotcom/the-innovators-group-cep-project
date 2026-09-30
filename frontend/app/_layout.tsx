// Root layout — providers + fonts + navigation stack.
// Kept from the starter: ErrorBoundary, QueryClientProvider, KeyboardProvider.

import React from "react";
import { LogBox } from "react-native";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { KeyboardProvider } from "react-native-keyboard-controller";

import { ErrorBoundary } from "@/src/components/error-boundary";
import { queryClient } from "@/src/query-client";
import { LanguageProvider } from "@/src/i18n";

// Disable logbox errors etc so that users can see the app
// and agent works as expected.
LogBox.ignoreAllLogs(true);

export default function RootLayout() {
  // Design-guideline fonts (small files, ~95KB total). If they fail to load
  // for any reason we continue with the system font instead of crashing.
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_Bold: require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    Geist_Regular: require("../assets/fonts/Geist-Regular.ttf"),
    Geist_SemiBold: require("../assets/fonts/Geist-SemiBold.ttf"),
  });

  if (!fontsLoaded && !fontError) return null; // splash screen still visible

  // One app level ErrorBoundary; a render crash shows a reload screen
  // instead of a blank app.
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <KeyboardProvider>
          <LanguageProvider>
            <Stack screenOptions={{ headerShown: false }} />
          </LanguageProvider>
        </KeyboardProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
