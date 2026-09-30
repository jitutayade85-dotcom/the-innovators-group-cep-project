// alert-card.tsx — one scam alert in the feed: severity pill + text + share.

import React from "react";
import { Pressable, Share, Text, View } from "react-native";
import MaterialCommunityIcons from "@react-native-vector-icons/material-design-icons";
import dayjs from "dayjs";
import { makeStyles, radius, spacing, useTheme } from "@/src/theme";
import { useLanguage } from "@/src/i18n";
import type { Alert } from "@/src/types";

export function AlertCard({ alert }: { alert: Alert }) {
  const { colors } = useTheme();
  const { lang, t } = useLanguage();
  const styles = useStyles();

  const severity =
    alert.severity === "high"
      ? { bg: colors.error, fg: colors.onError, label: t.highRisk }
      : alert.severity === "medium"
        ? { bg: colors.warning, fg: colors.onWarning, label: t.mediumRisk }
        : { bg: colors.info, fg: colors.onInfo, label: t.lowRisk };

  const onShare = () => {
    Share.share({ message: `${alert.title[lang]}\n${alert.description[lang]}` });
  };

  return (
    <View style={styles.card} testID={`alert-card-${alert.id}`}>
      <View style={styles.topRow}>
        <View style={[styles.pill, { backgroundColor: severity.bg }]}>
          <Text style={[styles.pillText, { color: severity.fg }]}>{severity.label}</Text>
        </View>
        <Text style={styles.date}>{dayjs(alert.published_at).format("DD MMM YYYY")}</Text>
      </View>
      <Text style={styles.title}>{alert.title[lang]}</Text>
      <Text style={styles.description}>{alert.description[lang]}</Text>
      <Pressable testID={`alerts-share-${alert.id}`} onPress={onShare} style={styles.shareBtn}>
        <MaterialCommunityIcons name="share-variant" size={18} color={colors.brandPrimary} />
        <Text style={styles.shareText}>{t.share}</Text>
      </Pressable>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  card: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  pill: { borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: 4 },
  pillText: { fontSize: 12, fontFamily: "Geist_SemiBold" },
  date: { fontSize: 12, color: colors.muted, fontFamily: "Geist_Regular" },
  title: { fontSize: 17, fontFamily: "Geist_SemiBold", color: colors.onSurface },
  description: { fontSize: 14, lineHeight: 21, color: colors.onSurfaceSecondary, fontFamily: "Geist_Regular" },
  shareBtn: { flexDirection: "row", alignItems: "center", gap: spacing.xs, minHeight: 44 },
  shareText: { fontSize: 14, fontFamily: "Geist_SemiBold", color: colors.brandPrimary },
}));
