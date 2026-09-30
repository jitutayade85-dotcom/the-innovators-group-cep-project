// Learn tab — category chips (sticky row) + big lesson cards.
// Pull-to-refresh; content is cached for offline use.

import React, { useMemo, useState } from "react";
import { FlatList, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fetchLessons } from "@/src/api";
import { useLanguage } from "@/src/i18n";
import { makeStyles, radius, spacing, useTheme } from "@/src/theme";
import { useCompletedLessons } from "@/src/utils/completed";
import { LessonCard } from "@/src/components/lesson-card";
import { EmptyView, ErrorView, LoadingView } from "@/src/components/states";
import type { Dict } from "@/src/i18n/en";

const CATEGORIES = ["all", "otp", "upi", "whatsapp", "password", "social", "job"];
const CAT_LABEL: Record<string, keyof Dict> = {
  all: "all",
  otp: "catOtp",
  upi: "catUpi",
  whatsapp: "catWhatsapp",
  password: "catPassword",
  social: "catSocial",
  job: "catJob",
};

export default function Learn() {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { completedIds } = useCompletedLessons();
  const [cat, setCat] = useState("all");
  const styles = useStyles();

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["lessons"],
    queryFn: fetchLessons,
  });

  const filtered = useMemo(
    () => (data ?? []).filter((l) => cat === "all" || l.category === cat),
    [data, cat],
  );

  return (
    <View style={styles.container} testID="learn-screen">
      {/* Header + chip row stay fixed (chrome), list scrolls below */}
      <View style={{ paddingTop: insets.top + spacing.md }}>
        <View style={{ paddingHorizontal: spacing.lg }}>
          <Text style={styles.title}>{t.learnTitle}</Text>
          <Text style={styles.subtitle}>{t.learnSub}</Text>
        </View>

        {/* Chip row: one horizontal scroller, chips never wrap */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.md }}
          style={{ flexGrow: 0 }}
        >
          {CATEGORIES.map((key) => {
            const active = cat === key;
            return (
              <Pressable
                key={key}
                testID={`learn-chip-${key}`}
                onPress={() => setCat(key)}
                style={[
                  styles.chip,
                  active && { backgroundColor: colors.brandTertiary, borderColor: colors.borderStrong },
                ]}
              >
                <Text style={[styles.chipText, active && { color: colors.onBrandTertiary }]}>
                  {t[CAT_LABEL[key]]}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {isLoading ? (
        <LoadingView label={t.loading} />
      ) : isError ? (
        <ErrorView message={t.errorGeneric} onRetry={() => refetch()} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.brandPrimary} />
          }
          ListEmptyComponent={<EmptyView icon="book-outline" message={t.errorGeneric} />}
          renderItem={({ item }) => (
            <LessonCard
              lesson={item}
              completed={completedIds.includes(item.id)}
              onPress={() => router.push(`/lesson/${item.id}`)}
            />
          )}
        />
      )}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: { flex: 1, backgroundColor: colors.surface },
  title: { fontSize: 26, fontFamily: "PlusJakartaSans_Bold", color: colors.onSurface },
  subtitle: { fontSize: 14, fontFamily: "Geist_Regular", color: colors.muted, marginTop: 2 },
  chip: {
    height: 36,
    flexShrink: 0,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: "transparent",
    backgroundColor: colors.surfaceTertiary,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  chipText: { fontSize: 14, fontFamily: "Geist_Regular", color: colors.onSurfaceTertiary },
}));
