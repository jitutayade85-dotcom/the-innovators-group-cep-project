// Check tab — paste a suspicious SMS/WhatsApp message, get an AI verdict.
// The AI runs on the server (never in the app, no keys here).

import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useMutation } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@react-native-vector-icons/material-design-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import { checkScam } from "@/src/api";
import { useLanguage } from "@/src/i18n";
import { makeStyles, radius, spacing, useTheme } from "@/src/theme";
import { VerdictCard } from "@/src/components/verdict-card";
import { BigButton } from "@/src/components/big-button";
import type { ScamCheckResult } from "@/src/types";

export default function Check() {
  const { t, lang } = useLanguage();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [text, setText] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [result, setResult] = useState<ScamCheckResult | null>(null);
  const styles = useStyles();

  const mutation = useMutation({
    mutationFn: () => checkScam(text.trim(), lang),
    onSuccess: (data) => setResult(data),
  });

  const EXAMPLES = [
    { key: "bank-otp", label: t.exBankOtp, message: t.exBankOtpText },
    { key: "lottery", label: t.exLottery, message: t.exLotteryText },
    { key: "kyc", label: t.exKyc, message: t.exKycText },
  ];

  const onCheck = () => {
    if (text.trim().length < 3) {
      setLocalError(t.emptyMessage);
      return;
    }
    setLocalError(null);
    setResult(null);
    mutation.mutate();
  };

  return (
    <View style={styles.container} testID="check-screen">
      <KeyboardAwareScrollView
        bottomOffset={16}
        contentContainerStyle={{
          paddingTop: insets.top + spacing.md,
          paddingHorizontal: spacing.lg,
          paddingBottom: insets.bottom + spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{t.checkTitle}</Text>
        <Text style={styles.subtitle}>{t.checkSub}</Text>

        {/* Message input */}
        <TextInput
          testID="check-input"
          style={styles.input}
          value={text}
          onChangeText={(v) => {
            setText(v);
            setLocalError(null);
          }}
          placeholder={t.inputPlaceholder}
          placeholderTextColor={colors.muted}
          multiline
          textAlignVertical="top"
        />

        {localError ? (
          <View style={styles.inlineError} testID="check-empty-error">
            <MaterialCommunityIcons name="alert-circle" size={20} color={colors.error} />
            <Text style={[styles.inlineErrorText, { color: colors.error }]}>{localError}</Text>
          </View>
        ) : null}

        {/* Example chips */}
        <Text style={styles.exampleLabel}>{t.tryExample}</Text>
        <View style={styles.chipRow}>
          {EXAMPLES.map((ex) => (
            <Pressable
              key={ex.key}
              testID={`check-example-${ex.key}`}
              style={styles.exampleChip}
              onPress={() => {
                setText(ex.message);
                setLocalError(null);
              }}
            >
              <Text style={styles.exampleChipText}>{ex.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Check button */}
        <BigButton
          label={mutation.isPending ? t.checking : t.checkBtn}
          onPress={onCheck}
          loading={mutation.isPending}
          disabled={mutation.isPending}
          icon="shield-search"
          testID="check-submit-button"
        />

        {/* AI error — inline retry, never an Alert */}
        {mutation.isError ? (
          <View style={[styles.resultError, { borderColor: colors.error }]} testID="check-error-card">
            <MaterialCommunityIcons name="wifi-off" size={26} color={colors.error} />
            <Text style={styles.resultErrorText}>{t.checkError}</Text>
            <BigButton label={t.retryBtn} onPress={onCheck} testID="check-error-retry-button" />
          </View>
        ) : null}

        {/* Verdict */}
        {result ? (
          <View style={{ marginTop: spacing.lg }}>
            <VerdictCard result={result} />
          </View>
        ) : null}
      </KeyboardAwareScrollView>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: { flex: 1, backgroundColor: colors.surface },
  title: { fontSize: 26, fontFamily: "PlusJakartaSans_Bold", color: colors.onSurface },
  subtitle: { fontSize: 14, fontFamily: "Geist_Regular", color: colors.muted, marginTop: 2, marginBottom: spacing.lg },
  input: {
    minHeight: 140,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.lg,
    fontSize: 16,
    lineHeight: 24,
    color: colors.onSurface,
    fontFamily: "Geist_Regular",
  },
  inlineError: { flexDirection: "row", alignItems: "center", gap: spacing.xs, marginTop: spacing.sm },
  inlineErrorText: { fontSize: 14, fontFamily: "Geist_Regular", flexShrink: 1 },
  exampleLabel: {
    fontSize: 14,
    fontFamily: "Geist_SemiBold",
    color: colors.onSurfaceSecondary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  chipRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.lg },
  exampleChip: {
    flexShrink: 0,
    height: 36,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  exampleChipText: { fontSize: 13, fontFamily: "Geist_Regular", color: colors.onSurfaceSecondary },
  resultError: {
    borderRadius: radius.lg,
    borderWidth: 2,
    padding: spacing.lg,
    gap: spacing.md,
    alignItems: "flex-start",
    marginTop: spacing.lg,
  },
  resultErrorText: { fontSize: 15, color: colors.onSurface, fontFamily: "Geist_Regular" },
}));
