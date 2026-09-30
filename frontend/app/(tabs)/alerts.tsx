// Alerts tab — live (or cached) feed of trending scams in India.

import React from "react";
import { FlatList, RefreshControl, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@react-native-vector-icons/material-design-icons";

import { fetchAlerts } from "@/src/api";
import { useLanguage } from "@/src/i18n";
import { makeStyles, radius, spacing, useTheme } from "@/src/theme";
import { AlertCard } from "@/src/components/alert-card";
import { EmptyView, ErrorView, LoadingView } from "@/src/components/states";

export default function Alerts() {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useStyles();

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["alerts"],
    queryFn: fetchAlerts,
  });

  return (
    <View style={styles.container} testID="alerts-screen">
      <View style={{ paddingTop: insets.top + spacing.md, paddingHorizontal: spacing.lg, gap: spacing.md }}>
        <View>
          <Text style={styles.title}>{t.alertsTitle}</Text>
          <Text style={styles.subtitle}>{t.alertsSub}</Text>
        </View>
        {/* Warning banner */}
        <View style={styles.banner}>
          <MaterialCommunityIcons name="megaphone" size={24} color={colors.onWarning} />
          <Text style={styles.bannerText}>{t.alertsSub}</Text>
        </View>
      </View>

      {isLoading ? (
        <LoadingView label={t.loading} />
      ) : isError ? (
        <ErrorView message={t.errorGeneric} onRetry={() => refetch()} />
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.brandPrimary} />
          }
          ListEmptyComponent={<EmptyView icon="bell-off-outline" message={t.errorGeneric} />}
          renderItem={({ item }) => <AlertCard alert={item} />}
        />
      )}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: { flex: 1, backgroundColor: colors.surface },
  title: { fontSize: 26, fontFamily: "PlusJakartaSans_Bold", color: colors.onSurface },
  subtitle: { fontSize: 14, fontFamily: "Geist_Regular", color: colors.muted, marginTop: 2 },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.warning,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  bannerText: {
    flex: 1,
    color: colors.onWarning,
    fontSize: 14,
    fontFamily: "Geist_SemiBold",
    flexShrink: 1,
  },
}));
