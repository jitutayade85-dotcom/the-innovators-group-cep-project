// My Progress — XP, level, streak, scams spotted, a weekly/monthly bar chart
// of XP, badges, and the weakest topic with a suggested lesson.

import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@react-native-vector-icons/material-design-icons";

import { useLanguage } from "@/src/i18n";
import { makeStyles, radius, spacing, useTheme } from "@/src/theme";
import { useProgress } from "@/src/features/game/ProgressContext";
import {
  Category,
  categoryToLessonCat,
  currentLevel,
  weakestTopic,
  badgeLabel,
} from "@/src/features/game/progress";

function lastNDates(n: number): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    out.push(new Date(Date.now() - i * 86400000).toISOString().slice(0, 10));
  }
  return out;
}

export default function ProgressScreen() {
  const { t, lang } = useLanguage();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { progress } = useProgress();
  const styles = useStyles();
  const [range, setRange] = useState<"week" | "month">("week");

  const catLabel: Record<string, string> = {
    phishing: t.gcatPhishing, upi: t.gcatUpi, job: t.gcatJob, trading: t.gcatTrading, loan: t.gcatLoan,
  };

  // Build bar data. Week = 7 days; Month = 6 buckets of 5 days.
  const bars = useMemo(() => {
    if (range === "week") {
      const days = lastNDates(7);
      const labels = ["S", "M", "T", "W", "T", "F", "S"];
      return days.map((d) => {
        const dow = new Date(d).getDay();
        return { label: labels[dow], value: progress.daily[d]?.xp ?? 0 };
      });
    }
    const days = lastNDates(30);
    const buckets: { label: string; value: number }[] = [];
    for (let b = 0; b < 6; b++) {
      const slice = days.slice(b * 5, b * 5 + 5);
      const sum = slice.reduce((acc, d) => acc + (progress.daily[d]?.xp ?? 0), 0);
      buckets.push({ label: `${b * 5 + 1}`, value: sum });
    }
    return buckets;
  }, [range, progress.daily]);

  const maxVal = Math.max(1, ...bars.map((b) => b.value));
  const level = currentLevel(progress.xp);
  const weak = weakestTopic(progress);

  const stats = [
    { icon: "star-four-points", label: t.xpPoints, value: String(progress.xp) },
    { icon: "shield-check", label: t.scamsCaught, value: String(progress.scams_identified) },
    { icon: "fire", label: t.streakDays, value: String(progress.streak) },
    { icon: "medal", label: t.levelWord, value: level.charAt(0).toUpperCase() + level.slice(1) },
  ];

  return (
    <View style={styles.container} testID="progress-screen">
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + spacing.md, paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Pressable testID="progress-back-button" onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.onSurface} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{t.progressTitle}</Text>
            <Text style={styles.sub}>{t.progressSub}</Text>
          </View>
        </View>

        {/* Stat grid */}
        <View style={styles.statGrid}>
          {stats.map((s) => (
            <View key={s.label} style={styles.statCard} testID={`progress-stat-${s.icon}`}>
              <MaterialCommunityIcons name={s.icon as never} size={24} color={colors.brandPrimary} />
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Range toggle */}
        <View style={styles.toggleRow}>
          {(["week", "month"] as const).map((r) => (
            <Pressable
              key={r}
              testID={`progress-range-${r}`}
              onPress={() => setRange(r)}
              style={[styles.toggle, range === r && { backgroundColor: colors.brandPrimary }]}
            >
              <Text style={[styles.toggleText, range === r && { color: colors.onBrandPrimary }]}>
                {r === "week" ? t.weekly : t.monthly}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Bar chart (Views only — light and offline) */}
        <View style={styles.chartCard}>
          <View style={styles.chart}>
            {bars.map((b, i) => (
              <View key={i} style={styles.barCol}>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { height: `${Math.round((b.value / maxVal) * 100)}%`, backgroundColor: colors.brandSecondary }]} />
                </View>
                <Text style={styles.barLabel}>{b.label}</Text>
              </View>
            ))}
          </View>
          {progress.xp === 0 ? <Text style={styles.noData}>{t.noProgressYet}</Text> : null}
        </View>

        {/* Badges */}
        {progress.badges.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>{t.badgesTitle}</Text>
            <View style={styles.badgeRow}>
              {progress.badges.map((b) => (
                <View key={b} style={styles.badge} testID={`progress-badge-${b}`}>
                  <MaterialCommunityIcons name="medal" size={18} color={colors.warning} />
                  <Text style={styles.badgeText}>{badgeLabel(b, lang)}</Text>
                </View>
              ))}
            </View>
          </>
        ) : null}

        {/* Weak topic + suggested lesson */}
        {weak ? (
          <>
            <Text style={styles.sectionTitle}>{t.weakTopicTitle}</Text>
            <View style={styles.weakCard} testID="progress-weak-topic">
              <View style={styles.weakIcon}>
                <MaterialCommunityIcons name="target" size={24} color={colors.onError} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.weakTitle}>{catLabel[weak]}</Text>
                <Text style={styles.weakSub}>{t.suggestedLesson}</Text>
              </View>
              <Pressable
                testID="progress-suggested-lesson"
                onPress={() => router.push(`/learn?cat=${categoryToLessonCat(weak as Category)}`)}
                style={styles.goBtn}
              >
                <MaterialCommunityIcons name="arrow-right" size={22} color={colors.onBrandPrimary} />
              </Pressable>
            </View>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: { flex: 1, backgroundColor: colors.surface },
  headerRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.lg },
  backBtn: { width: 44, height: 44, borderRadius: radius.pill, backgroundColor: colors.surfaceSecondary, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 24, fontFamily: "PlusJakartaSans_Bold", color: colors.onSurface },
  sub: { fontSize: 14, fontFamily: "Geist_Regular", color: colors.muted, marginTop: 2 },
  statGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  statCard: { width: "47.5%", flexGrow: 1, backgroundColor: colors.surfaceSecondary, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: spacing.xs },
  statValue: { fontSize: 24, fontFamily: "PlusJakartaSans_Bold", color: colors.onSurface },
  statLabel: { fontSize: 13, fontFamily: "Geist_Regular", color: colors.muted },
  toggleRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.xl, marginBottom: spacing.md },
  toggle: { flex: 1, minHeight: 44, borderRadius: radius.pill, backgroundColor: colors.surfaceSecondary, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  toggleText: { fontSize: 14, fontFamily: "Geist_SemiBold", color: colors.onSurfaceSecondary },
  chartCard: { backgroundColor: colors.surfaceSecondary, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg },
  chart: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", height: 160, gap: spacing.xs },
  barCol: { flex: 1, alignItems: "center", gap: spacing.xs },
  barTrack: { width: "70%", height: 130, backgroundColor: colors.surfaceTertiary, borderRadius: radius.sm, justifyContent: "flex-end", overflow: "hidden" },
  barFill: { width: "100%", borderRadius: radius.sm },
  barLabel: { fontSize: 11, fontFamily: "Geist_Regular", color: colors.muted },
  noData: { textAlign: "center", color: colors.muted, fontFamily: "Geist_Regular", fontSize: 13, marginTop: spacing.md },
  sectionTitle: { fontSize: 18, fontFamily: "PlusJakartaSans_Bold", color: colors.onSurface, marginTop: spacing.xl, marginBottom: spacing.md },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  badge: { flexDirection: "row", alignItems: "center", gap: spacing.xs, backgroundColor: colors.surfaceSecondary, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  badgeText: { fontSize: 13, fontFamily: "Geist_SemiBold", color: colors.onSurface },
  weakCard: { flexDirection: "row", alignItems: "center", gap: spacing.md, backgroundColor: colors.surfaceSecondary, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg },
  weakIcon: { width: 48, height: 48, borderRadius: radius.md, backgroundColor: colors.error, alignItems: "center", justifyContent: "center" },
  weakTitle: { fontSize: 16, fontFamily: "Geist_SemiBold", color: colors.onSurface },
  weakSub: { fontSize: 13, fontFamily: "Geist_Regular", color: colors.muted, marginTop: 2 },
  goBtn: { width: 44, height: 44, borderRadius: radius.pill, backgroundColor: colors.brandPrimary, alignItems: "center", justifyContent: "center" },
}));
