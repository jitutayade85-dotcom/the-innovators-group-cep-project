// SOS screen — what to do right now if you were cheated.
// A step-by-step checklist, one-tap 1930 call, the cybercrime portal link,
// and the full helpline directory below (cached offline).

import React from "react";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@react-native-vector-icons/material-design-icons";

import { fetchHelplines } from "@/src/api";
import { useLanguage } from "@/src/i18n";
import { makeStyles, radius, spacing, useTheme } from "@/src/theme";
import { BigButton } from "@/src/components/big-button";

export default function Sos() {
  const { t, lang } = useLanguage();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = useStyles();

  const { data: helplines } = useQuery({ queryKey: ["helplines"], queryFn: fetchHelplines });

  const steps = [t.sosStep1, t.sosStep2, t.sosStep3, t.sosStep4];

  return (
    <View style={styles.container} testID="sos-screen">
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.md,
          paddingHorizontal: spacing.lg,
          paddingBottom: insets.bottom + spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Pressable testID="sos-back-button" onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.onSurface} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{t.sosScreenTitle}</Text>
            <Text style={styles.sub}>{t.sosScreenSub}</Text>
          </View>
        </View>

        {/* Big 1930 call */}
        <View style={styles.sos}>
          <Text style={styles.sosNumber}>1930</Text>
          <Text style={styles.sosText}>{t.sosTitle}</Text>
          <BigButton
            label={t.sosCall}
            variant="light"
            icon="phone"
            testID="sos-call-1930"
            onPress={() => Linking.openURL("tel:1930")}
          />
        </View>

        {/* Checklist */}
        <Text style={styles.sectionTitle}>{t.sosStepsTitle}</Text>
        <View style={styles.stepsCard}>
          {steps.map((step, i) => (
            <View key={i} style={[styles.stepRow, i < steps.length - 1 && styles.stepDivider]}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{i + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        {/* Online portal */}
        <Text style={styles.sectionTitle}>{t.sosPortalTitle}</Text>
        <BigButton
          label={t.sosPortalBtn}
          icon="open-in-new"
          testID="sos-portal-button"
          onPress={() => Linking.openURL("https://cybercrime.gov.in")}
        />

        {/* Helpline directory */}
        <Text style={styles.sectionTitle}>{t.helpTitle}</Text>
        <View style={{ gap: spacing.md }}>
          {(helplines ?? []).map((item) => (
            <Pressable
              key={item.id}
              testID={`sos-helpline-${item.id}`}
              style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
              onPress={() => {
                if (item.type === "phone" && item.number) Linking.openURL(`tel:${item.number}`);
                else if (item.url) Linking.openURL(item.url);
              }}
            >
              <View style={styles.cardIcon}>
                <MaterialCommunityIcons
                  name={item.type === "phone" ? "phone" : "web"}
                  size={24}
                  color={colors.brandPrimary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.name[lang]}</Text>
                <Text style={styles.cardDesc}>{item.description[lang]}</Text>
              </View>
              {item.type === "phone" ? (
                <View style={styles.callPill}>
                  <MaterialCommunityIcons name="phone" size={20} color={colors.onBrandPrimary} />
                </View>
              ) : (
                <MaterialCommunityIcons name="open-in-new" size={22} color={colors.muted} />
              )}
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: { flex: 1, backgroundColor: colors.surface },
  headerRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.lg },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 24, fontFamily: "PlusJakartaSans_Bold", color: colors.onSurface },
  sub: { fontSize: 14, fontFamily: "Geist_Regular", color: colors.muted, marginTop: 2 },
  sos: {
    backgroundColor: colors.error,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    alignItems: "center",
  },
  sosNumber: { fontSize: 44, fontFamily: "PlusJakartaSans_Bold", color: colors.onError },
  sosText: { fontSize: 15, fontFamily: "Geist_Regular", color: colors.onError, textAlign: "center" },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "PlusJakartaSans_Bold",
    color: colors.onSurface,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  stepsCard: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
  },
  stepRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.lg },
  stepDivider: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.brandTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: { fontSize: 16, fontFamily: "PlusJakartaSans_Bold", color: colors.onBrandTertiary },
  stepText: { flex: 1, fontSize: 16, lineHeight: 23, fontFamily: "Geist_Regular", color: colors.onSurface },
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
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.brandTertiary,
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
