// Tab navigation: 4 tabs — Home, Learn, Check, Alerts.
// iOS 26+ gets the native (Liquid Glass) tab bar; Android, older iOS and web
// get the classic JS tab bar.

import { Platform } from "react-native";
import { Tabs } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import MaterialCommunityIcons from "@react-native-vector-icons/material-design-icons";

import { usesNativeTabs } from "@/src/navigation";
import { useTheme } from "@/src/theme";
import { useLanguage } from "@/src/i18n";

export default function TabsLayout() {
  const { colors } = useTheme();
  const { t } = useLanguage();

  if (usesNativeTabs) {
    return (
      <NativeTabs>
        <NativeTabs.Trigger name="home">
          <NativeTabs.Trigger.Icon sf="house.fill" />
          <NativeTabs.Trigger.Label>{t.tabHome}</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="learn">
          <NativeTabs.Trigger.Icon sf="book.fill" />
          <NativeTabs.Trigger.Label>{t.tabLearn}</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="check">
          <NativeTabs.Trigger.Icon sf="checkmark.shield.fill" />
          <NativeTabs.Trigger.Label>{t.tabCheck}</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="alerts">
          <NativeTabs.Trigger.Icon sf="bell.fill" />
          <NativeTabs.Trigger.Label>{t.tabAlerts}</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brandPrimary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { ...(Platform.OS === "web" ? { height: 64 } : {}) },
        tabBarItemStyle: { alignSelf: "center" },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t.tabHome,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: t.tabLearn,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="book-open-variant" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="check"
        options={{
          title: t.tabCheck,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="shield-check" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: t.tabAlerts,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="bell-alert" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
