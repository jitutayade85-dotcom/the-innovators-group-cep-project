// big-button.tsx — the one big, thumb-friendly button used across the app.
// Min height 56pt for low-literacy / low-dexterity users.

import React from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import MaterialCommunityIcons from "@react-native-vector-icons/material-design-icons";
import { makeStyles, radius, spacing, useTheme } from "@/src/theme";

interface Props {
  label: string;
  onPress: () => void;
  testID?: string;
  variant?: "primary" | "danger" | "light";
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
}

export function BigButton({
  label,
  onPress,
  testID,
  variant = "primary",
  disabled,
  loading,
  icon,
}: Props) {
  const { colors } = useTheme();
  const styles = useStyles();

  const bg =
    variant === "primary"
      ? colors.brandPrimary
      : variant === "danger"
        ? colors.error
        : colors.surface;
  const fg =
    variant === "primary"
      ? colors.onBrandPrimary
      : variant === "danger"
        ? colors.onError
        : colors.brandPrimary;

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.row}>
          {icon ? (
            <MaterialCommunityIcons name={icon as never} size={22} color={fg} />
          ) : null}
          <Text style={[styles.label, { color: fg }]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const useStyles = makeStyles(() => ({
  button: {
    minHeight: 56,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    borderWidth: 1,
    borderColor: "transparent",
  },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  label: { fontSize: 17, fontFamily: "Geist_SemiBold" },
}));
