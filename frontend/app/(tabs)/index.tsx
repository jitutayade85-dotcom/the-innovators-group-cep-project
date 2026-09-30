// Home tab — dashboard: greeting + language switcher, SOS 1930 banner,
// AI quick-check card and 4 big tiles. Very little text, big icons.

import React, { useState } from "react";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@react-native-vector-icons/material-design-icons";

import { LANGUAGES, useLanguage } from "@/src/i18n";
import { fonts, makeStyles, radius, spacing, useTheme } from "@/src/theme";
import { LanguageSheet } from "@/src/components/language-sheet";

export default function Home() {
  const { t, lang } = useLanguage();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);
  const styles = useStyles();

  const currentNative = LANGUAGES.find((l) => l.code === lang)?.nativeName ?? "English";
  const call1930 = () => Linking.openURL("tel:1930");

  const tiles = [
    { id: "learn", icon: "book-open-variant", title: t.tileLearn, sub: t.tileLearnSub, route: "/learn" },
    { id: "alerts", icon: "bell-alert", title: t.tileAlerts, sub: t.tileAlertsSub, route: "/alerts" },
    { id: "check", icon: "shield-check", title: t.tileCheck, sub: t.tileCheckSub, route: "/check" },
    { id: "helplines", icon: "phone", title: t.tileHelp, sub: t.tileHelpSub, route: "/helplines" },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.md,
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting + language switcher */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.appName}>{t.appName}</Text>
            <Text style={styles.greeting}>{t.greeting}</Text>
            <Text style={styles.greetingSub}>{t.greetingSub}</Text>
          </View>
          <Pressable
            testID="language-switcher-button"
            onPress={() => setSheetOpen(true)}
            style={styles.langBtn}
          >
            <MaterialCommunityIcons name="translate" size={20} color={colors.brandPrimary} />
            <Text style={styles.langBtnText}>{currentNative}</Text>
          </Pressable>
        </View>

        {/* Emergency SOS banner — tap anywhere calls 1930 */}
        <Pressable
          testID="home-sos-banner"
          onPress={call1930}
          style={({ pressed }) => [styles.sos, pressed && { opacity: 0.9 }]}
        >
          <MaterialCommunityIcons name="phone-alert" size={30} color={colors.onError} />
          <Text style={styles.sosTitle}>{t.sosTitle}</Text>
          <View style={styles.sosBtn}>
            <Text style={styles.sosBtnText}>{t.sosCall}</Text>
          </View>
        </Pressable>

        {/* AI quick check card */}
        <Pressable
          testID="home-quick-check-card"
          onPress={() => router.push("/check")}
          style={({ pressed }) => [styles.quickCard, pressed && { opacity: 0.9 }]}
        >
          <View style={styles.quickIcon}>
            <MaterialCommunityIcons name="shield-search" size={30} color={colors.onBrandPrimary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.quickTitle}>{t.quickCheckTitle}</Text>
            <Text style={styles.quickSub}>{t.quickCheckSub}</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={26} color={colors.onBrandPrimary} />
        </Pressable>

        {/* 4 big tiles */}
        <View style={styles.tileGrid}>
          {tiles.map((tile) => (
            <Pressable
              key={tile.id}
              testID={`home-tile-${tile.id}`}
              onPress={() => router.push(tile.route as never)}
              style={({ pressed }) => [
                styles.tile,
                pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
              ]}
            >
              <View style={styles.tileIcon}>
                <MaterialCommunityIcons name={tile.icon as never} size={30} color={colors.brandPrimary} />
              </View>
              <Text style={styles.tileTitle}>{tile.title}</Text>
              <Text style={styles.tileSub}>{tile.sub}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <LanguageSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} />
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: { flex: 1, backgroundColor: colors.surface },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  appName: {
    fontSize: 13,
    color: colors.brandSecondary,
    fontFamily: "Geist_SemiBold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  greeting: {
    fontSize: 26,
    color: colors.onSurface,
    fontFamily: "PlusJakartaSans_Bold",
    marginTop: spacing.xs,
  },
  greetingSub: { fontSize: 14, color: colors.muted, fontFamily: "Geist_Regular", marginTop: 2 },
  langBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    minHeight: 44,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.md,
  },
  langBtnText: { fontSize: 14, color: colors.brandPrimary, fontFamily: "Geist_SemiBold" },
  sos: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.error,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  sosTitle: {
    flex: 1,
    color: colors.onError,
    fontSize: 16,
    fontFamily: "Geist_SemiBold",
  },
  sosBtn: {
    backgroundColor: colors.onSurfaceInverse,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  sosBtnText: { color: colors.error, fontSize: 14, fontFamily: "Geist_SemiBold" },
  quickCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.brandPrimary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  quickIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.brandSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  quickTitle: { color: colors.onBrandPrimary, fontSize: 17, fontFamily: "Geist_SemiBold" },
  quickSub: { color: colors.onBrandPrimary, fontSize: 13, fontFamily: "Geist_Regular", marginTop: 2, opacity: 0.85 },
  tileGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  tile: {
    width: "47.5%",
    flexGrow: 1,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
    minHeight: 132,
  },
  tileIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.brandTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  tileTitle: { fontSize: 16, fontFamily: "Geist_SemiBold", color: colors.onSurface },
  tileSub: { fontSize: 12, color: colors.muted, fontFamily: "Geist_Regular" },
}));
