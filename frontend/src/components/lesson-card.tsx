// lesson-card.tsx — one row in the Learn list. Big icon + 2 lines of text.

import React from "react";
import { Pressable, Text, View } from "react-native";
import MaterialCommunityIcons from "@react-native-vector-icons/material-design-icons";
import { makeStyles, radius, spacing, useTheme } from "@/src/theme";
import { useLanguage } from "@/src/i18n";
import type { Lesson } from "@/src/types";

interface Props {
  lesson: Lesson;
  completed: boolean;
  onPress: () => void;
}

export function LessonCard({ lesson, completed, onPress }: Props) {
  const { colors } = useTheme();
  const { lang, t } = useLanguage();
  const styles = useStyles();

  return (
    <Pressable
      testID={`lesson-card-${lesson.id}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
    >
      <View style={styles.iconWrap}>
        <MaterialCommunityIcons name={lesson.icon as never} size={30} color={colors.brandPrimary} />
      </View>
      <View style={styles.textCol}>
        <Text style={styles.title} numberOfLines={2}>
          {lesson.title[lang]}
        </Text>
        <Text style={styles.summary} numberOfLines={2}>
          {lesson.summary[lang]}
        </Text>
        <View style={styles.metaRow}>
          <MaterialCommunityIcons name="clock-outline" size={15} color={colors.muted} />
          <Text style={styles.metaText}>
            {lesson.minutes} {t.minutes}
          </Text>
          {completed ? (
            <View style={styles.doneBadge}>
              <MaterialCommunityIcons name="check-circle" size={15} color={colors.success} />
              <Text style={[styles.metaText, { color: colors.success }]}>{t.completedMark}</Text>
            </View>
          ) : null}
        </View>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={26} color={colors.muted} />
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.brandTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  textCol: { flex: 1, gap: 2 },
  title: { fontSize: 16, fontFamily: "Geist_SemiBold", color: colors.onSurface },
  summary: { fontSize: 13, color: colors.muted, fontFamily: "Geist_Regular" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs, marginTop: spacing.xs },
  metaText: { fontSize: 12, color: colors.muted, fontFamily: "Geist_Regular" },
  doneBadge: { flexDirection: "row", alignItems: "center", gap: 2, marginLeft: spacing.sm },
}));
