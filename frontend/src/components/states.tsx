// states.tsx — Loading / Error / Empty states shared by every screen.
// Low-literacy friendly: one big icon, one short line, one big action.

import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import MaterialCommunityIcons from "@react-native-vector-icons/material-design-icons";
import { makeStyles, radius, spacing, useTheme } from "@/src/theme";
import { BigButton } from "./big-button";

export function LoadingView({ label }: { label: string }) {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.center} testID="loading-view">
      <ActivityIndicator size="large" color={colors.brandPrimary} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

export function ErrorView({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.center} testID="error-view">
      <MaterialCommunityIcons name="wifi-off" size={44} color={colors.muted} />
      <Text style={styles.label}>{message}</Text>
      {onRetry ? (
        <BigButton label="Retry" onPress={onRetry} testID="error-retry-button" icon="refresh" />
      ) : null}
    </View>
  );
}

export function EmptyView({ icon, message }: { icon: string; message: string }) {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.center} testID="empty-view">
      <MaterialCommunityIcons name={icon as never} size={44} color={colors.muted} />
      <Text style={styles.label}>{message}</Text>
    </View>
  );
}

// Small inline note (e.g. "showing saved content while offline").
export function NoteBar({ text, color }: { text: string; color: string }) {
  const styles = useStyles();
  return (
    <View style={[styles.note, { backgroundColor: color }]}>
      <Text style={styles.noteText}>{text}</Text>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  center: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    padding: spacing.xxl,
  },
  label: {
    color: colors.muted,
    fontSize: 16,
    textAlign: "center",
    fontFamily: "Geist_Regular",
  },
  note: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  noteText: {
    color: colors.onSurfaceSecondary,
    fontSize: 13,
    fontFamily: "Geist_Regular",
    flexShrink: 1,
  },
}));
