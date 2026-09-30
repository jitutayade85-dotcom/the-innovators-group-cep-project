// Helplines — emergency numbers with one-tap calling (1930 first, always).

import React from "react";
import { FlatList, Linking, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@react-native-vector-icons/material-design-icons";

import { fetchHelplines } from "@/src/api";
import { useLanguage } from "@/src/i18n";
import { makeStyles, radius, spacing, useTheme } from "@/src/theme";
import { BigButton } from "@/src/components/big-button";
import { EmptyView, ErrorView, LoadingView } from "@/src/components/states";

export default function Helplines() {
  const { t, lang } = useLanguage();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = useStyles();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["helplines"],
    queryFn: fetchHelplines,
  });

  return (
    <View style={styles.container} testID="helplines-screen">
      <View style={{ paddingTop: insets.top + spacing.md, paddingHorizontal: spacing.lg, gap: spacing.sm }}>
        <View style={styles.headerRow}>
          <Pressable testID="helplines-back-button" onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.onSurface} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{t.helpTitle}</Text>
            <Text style={styles.subtitle}>{t.helpSub}</Text>
          </View>
        </View>

        {/* SOS 1930 banner */}
        <View style={styles.sos}>
          <Text style={styles.sosNumber}>1930</Text>
          <Text style={styles.sosText}>{t.sosTitle}</Text>
          <BigButton
            label={t.sosCall}
            variant="light"
            icon="phone"
            testID="helpline-call-1930"
            onPress={() => Linking.openURL("tel:1930")}
          />
        </View>
        <Text style={styles.about}>{t.aboutLine}</Text>
      </View>

      {isLoading ? (
        <LoadingView label={t.loading} />
      ) : isError ? (
        <ErrorView message={t.errorGeneric} onRetry={() => refetch()} />
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: insets.bottom + spacing.xl }}
          ListEmptyComponent={<EmptyView icon="phone-off" message={t.errorGeneric} />}
          renderItem={({ item }) => (
            <Pressable
              testID={`helpline-card-${item.id}`}
              style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
              onPress={() => {
                if (item.type === "phone" && item.number) Linking.openURL(`tel:${item.number}`);
                else if (item.url) Linking.openURL(item.url);
              }}
            >
              <View style={[styles.cardIcon, { backgroundColor: item.type === "phone" ? colors.brandTertiary : colors.surfaceTertiary }]}>
                <MaterialCommunityIcons
                  name={item.type === "phone" ? "phone" : "web"}
                  size={26}
                  color={colors.brandPrimary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.name[lang]}</Text>
                <Text style={styles.cardDesc}>{item.description[lang]}</Text>
              </View>
              {item.type === "phone" ? (
                <View testID={`helpline-call-${item.number}`} style={styles.callPill}>
                  <MaterialCommunityIcons name="phone" size={20} color={colors.onBrandPrimary} />
                </View>
              ) : (
                <MaterialCommunityIcons name="open-in-new" size={22} color={colors.muted} />
              )}
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: { flex: 1, backgroundColor: colors.surface },
  headerRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginTop: spacing.sm },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 26, fontFamily: "PlusJakartaSans_Bold", color: colors.onSurface },
  subtitle: { fontSize: 14, fontFamily: "Geist_Regular", color: colors.muted, marginTop: 2 },
  sos: {
    backgroundColor: colors.error,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    alignItems: "center",
  },
  sosNumber: { fontSize: 44, fontFamily: "PlusJakartaSans_Bold", color: colors.onError },
  sosText: {
    fontSize: 15,
    fontFamily: "Geist_Regular",
    color: colors.onError,
    textAlign: "center",
  },
  about: { fontSize: 13, fontFamily: "Geist_Regular", color: colors.muted, textAlign: "center" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  cardIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontSize: 16, fontFamily: "Geist_SemiBold", color: colors.onSurface },
  cardDesc: { fontSize: 13, fontFamily: "Geist_Regular", color: colors.muted, marginTop: 2 },
  callPill: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
}));
