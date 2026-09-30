// Home tab — dashboard with big icon tiles (Phase 1 layout).
// Greeting with the user's name, language + settings buttons, an SOS 1930
// banner, an AI/offline quick-check card, and 5 large tiles.

import React, { useState } from "react";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import MaterialCommunityIcons from "@react-native-vector-icons/material-design-icons";

import { LANGUAGES, useLanguage } from "@/src/i18n";
import { makeStyles, radius, spacing, useTheme } from "@/src/theme";
import { LanguageSheet } from "@/src/components/language-sheet";
import { useProfile } from "@/src/features/profile/ProfileContext";
import { fileUrl } from "@/src/api";

export default function Home() {
  const { t, lang } = useLanguage();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile } = useProfile();
  const [sheetOpen, setSheetOpen] = useState(false);
  const styles = useStyles();

  const currentNative = LANGUAGES.find((l) => l.code === lang)?.nativeName ?? "English";
  const call1930 = () => Linking.openURL("tel:1930");

  const tiles = [
    { id: "scam-check", icon: "shield-search", title: t.tileScamCheck, sub: t.tileScamCheckSub, route: "/check" },
    { id: "play-game", icon: "gamepad-variant", title: t.tilePlayGame, sub: t.tilePlayGameSub, route: "/game" },
    { id: "learn-play", icon: "book-open-variant", title: t.tileLearnPlay, sub: t.tileLearnPlaySub, route: "/learn" },
    { id: "progress", icon: "chart-line", title: t.tileProgress, sub: t.tileProgressReady, route: "/progress" },
    { id: "tests", icon: "clipboard-check", title: t.tileTests, sub: t.tileTestsReady, route: "/tests" },
    { id: "sos", icon: "lifebuoy", title: t.tileSos, sub: t.tileSosSub, route: "/sos" },
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
        {/* Greeting row */}
        <View style={styles.headerRow}>
          <View style={styles.avatarWrap}>
            {profile?.photo_path ? (
              <Image source={{ uri: fileUrl(profile.photo_path) }} style={styles.avatar} contentFit="cover" />
            ) : (
              <MaterialCommunityIcons name="account" size={28} color={colors.brandPrimary} />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.appName}>{t.appName}</Text>
            <Text style={styles.greeting} numberOfLines={1}>
              {t.hello}
              {profile?.name ? `, ${profile.name}` : ""}
            </Text>
          </View>
          <Pressable testID="home-language-button" onPress={() => setSheetOpen(true)} style={styles.iconBtn}>
            <MaterialCommunityIcons name="translate" size={20} color={colors.brandPrimary} />
            <Text style={styles.iconBtnText}>{currentNative}</Text>
          </Pressable>
          <Pressable testID="home-settings-button" onPress={() => router.push("/settings")} style={styles.gearBtn}>
            <MaterialCommunityIcons name="cog" size={22} color={colors.onSurfaceSecondary} />
          </Pressable>
        </View>

        {/* SOS banner */}
        <Pressable
          testID="home-sos-banner"
          onPress={call1930}
          style={({ pressed }) => [styles.sos, pressed && { opacity: 0.9 }]}
        >
          <MaterialCommunityIcons name="phone-alert" size={28} color={colors.onError} />
          <Text style={styles.sosTitle}>{t.sosTitle}</Text>
          <View style={styles.sosBtn}>
            <Text style={styles.sosBtnText}>{t.sosCall}</Text>
          </View>
        </Pressable>

        {/* Quick check card */}
        <Pressable
          testID="home-quick-check-card"
          onPress={() => router.push("/check")}
          style={({ pressed }) => [styles.quickCard, pressed && { opacity: 0.9 }]}
        >
          <View style={styles.quickIcon}>
            <MaterialCommunityIcons name="shield-search" size={28} color={colors.onBrandPrimary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.quickTitle}>{t.quickCheckTitle}</Text>
            <Text style={styles.quickSub}>{t.quickCheckSub}</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={26} color={colors.onBrandPrimary} />
        </Pressable>

        {/* Big tiles */}
        <View style={styles.tileGrid}>
          {tiles.map((tile) => {
            const comingSoon = tile.route === null;
            return (
              <Pressable
                key={tile.id}
                testID={`home-tile-${tile.id}`}
                disabled={comingSoon}
                onPress={() => tile.route && router.push(tile.route as never)}
                style={({ pressed }) => [
                  styles.tile,
                  comingSoon && { opacity: 0.6 },
                  pressed && !comingSoon && { opacity: 0.8, transform: [{ scale: 0.98 }] },
                ]}
              >
                <View style={styles.tileIcon}>
                  <MaterialCommunityIcons name={tile.icon as never} size={30} color={colors.brandPrimary} />
                </View>
                <Text style={styles.tileTitle}>{tile.title}</Text>
                <Text style={styles.tileSub} numberOfLines={1}>
                  {tile.sub}
                </Text>
                {comingSoon ? (
                  <View style={styles.soonBadge}>
                    <Text style={styles.soonText}>{t.comingSoon}</Text>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <LanguageSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} />
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: { flex: 1, backgroundColor: colors.surface },
  headerRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.lg },
  avatarWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.brandTertiary,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatar: { width: 48, height: 48 },
  appName: {
    fontSize: 12,
    color: colors.brandSecondary,
    fontFamily: "Geist_SemiBold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  greeting: { fontSize: 22, color: colors.onSurface, fontFamily: "PlusJakartaSans_Bold" },
  iconBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minHeight: 44,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.sm,
  },
  iconBtnText: { fontSize: 13, color: colors.brandPrimary, fontFamily: "Geist_SemiBold" },
  gearBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  sos: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.error,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  sosTitle: { flex: 1, color: colors.onError, fontSize: 16, fontFamily: "Geist_SemiBold" },
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
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.brandSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  quickTitle: { color: colors.onBrandPrimary, fontSize: 17, fontFamily: "Geist_SemiBold" },
  quickSub: { color: colors.onBrandPrimary, fontSize: 13, fontFamily: "Geist_Regular", marginTop: 2, opacity: 0.85 },
  tileGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md, marginTop: spacing.lg },
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
  soonBadge: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    backgroundColor: colors.surfaceTertiary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  soonText: { fontSize: 10, color: colors.onSurfaceTertiary, fontFamily: "Geist_SemiBold" },
}));
