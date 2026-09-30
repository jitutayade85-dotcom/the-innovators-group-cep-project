// verdict-card.tsx — result card for the scam checker.
// Flexible: shows a reason line (offline quick check) and/or a confidence bar
// with tips (AI check). We never claim "100%": the worst label is "Scam!" with
// wording that says high risk, be careful.

import React from "react";
import { Text, View } from "react-native";
import MaterialCommunityIcons from "@react-native-vector-icons/material-design-icons";
import { makeStyles, radius, spacing, useTheme } from "@/src/theme";
import { useLanguage } from "@/src/i18n";
import type { ScamVerdict } from "@/src/types";

interface Props {
  verdict: ScamVerdict;
  title?: string;
  reason?: string;
  confidence?: number;
  tips?: string[];
  testID?: string;
}

export function VerdictCard({ verdict, title, reason, confidence, tips, testID }: Props) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const styles = useStyles();

  const config =
    verdict === "safe"
      ? { color: colors.success, icon: "shield-check", label: t.verdictSafe }
      : verdict === "suspicious"
        ? { color: colors.warning, icon: "shield-alert", label: t.verdictSuspicious }
        : { color: colors.error, icon: "alert-octagon", label: t.verdictScam };

  return (
    <View style={[styles.card, { borderColor: config.color }]} testID={testID ?? "verdict-card"}>
      {title ? <Text style={styles.cardLabel}>{title}</Text> : null}

      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: config.color }]}>
          <MaterialCommunityIcons name={config.icon as never} size={32} color={colors.surface} />
        </View>
        <Text style={[styles.verdict, { color: config.color }]}>{config.label}</Text>
      </View>

      {reason ? <Text style={styles.reason}>{reason}</Text> : null}

      {typeof confidence === "number" ? (
        <>
          <View style={styles.confRow}>
            <Text style={styles.confLabel}>{t.confidence}</Text>
            <Text style={[styles.confValue, { color: config.color }]}>{confidence}%</Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${confidence}%`, backgroundColor: config.color }]} />
          </View>
        </>
      ) : null}

      {tips && tips.length > 0 ? (
        <>
          <Text style={styles.tipsTitle}>{t.whatToDoNow}</Text>
          {tips.map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <MaterialCommunityIcons name="check-circle" size={20} color={config.color} />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </>
      ) : null}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  card: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    borderWidth: 2,
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardLabel: {
    fontSize: 12,
    fontFamily: "Geist_SemiBold",
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  iconWrap: { width: 56, height: 56, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  verdict: { fontSize: 24, fontFamily: "PlusJakartaSans_Bold", flexShrink: 1 },
  reason: { fontSize: 16, lineHeight: 24, color: colors.onSurface, fontFamily: "Geist_Regular" },
  confRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  confLabel: { fontSize: 13, color: colors.muted, fontFamily: "Geist_Regular" },
  confValue: { fontSize: 14, fontFamily: "Geist_SemiBold" },
  track: { height: 8, borderRadius: radius.pill, backgroundColor: colors.surfaceTertiary },
  fill: { height: 8, borderRadius: radius.pill },
  tipsTitle: { fontSize: 16, fontFamily: "Geist_SemiBold", color: colors.onSurface, marginTop: spacing.xs },
  tipRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
  tipText: { flex: 1, fontSize: 15, lineHeight: 22, color: colors.onSurface, fontFamily: "Geist_Regular" },
}));
