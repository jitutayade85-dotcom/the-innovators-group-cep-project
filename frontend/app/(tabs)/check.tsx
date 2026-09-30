// Check tab — "Is this message a scam?"
// Two layers, exactly as designed:
//   1. QUICK CHECK (offline): instant, rule-based, works with no internet.
//   2. AI CHECK (online): a smarter second opinion via our server. If the
//      phone is offline the AI step is skipped and we keep the quick result.

import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useMutation } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@react-native-vector-icons/material-design-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import { checkScam } from "@/src/api";
import { analyzeOffline, OfflineResult } from "@/src/features/scamCheck/engine";
import { useLanguage } from "@/src/i18n";
import { makeStyles, radius, spacing, useTheme } from "@/src/theme";
import { VerdictCard } from "@/src/components/verdict-card";
import { BigButton } from "@/src/components/big-button";
import type { LangCode, ScamCheckResult } from "@/src/types";

export default function Check() {
  const { t, lang } = useLanguage();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [text, setText] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [offline, setOffline] = useState<OfflineResult | null>(null);
  const [ai, setAi] = useState<ScamCheckResult | null>(null);
  const styles = useStyles();

  const mutation = useMutation({
    mutationFn: () => checkScam(text.trim(), lang as LangCode),
    onSuccess: (data) => setAi(data),
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
    // 1. Instant offline verdict.
    setOffline(analyzeOffline(text.trim(), lang as LangCode));
    // 2. Ask the AI for a second opinion (skipped automatically if offline).
    setAi(null);
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

        <BigButton
          label={mutation.isPending ? t.checking : t.checkBtn}
          onPress={onCheck}
          loading={mutation.isPending}
          disabled={mutation.isPending}
          icon="shield-search"
          testID="check-submit-button"
        />

        {/* 1. Offline quick result (always shown once checked) */}
        {offline ? (
          <View style={{ marginTop: spacing.lg }}>
            <VerdictCard
              testID="offline-verdict-card"
              verdict={offline.verdict}
              title={t.offlineQuickTitle}
              reason={offline.reason}
            />
          </View>
        ) : null}

        {/* AI pending indicator */}
        {mutation.isPending ? (
          <View style={styles.aiPending} testID="check-ai-pending">
            <MaterialCommunityIcons name="robot" size={20} color={colors.brandPrimary} />
            <Text style={styles.aiPendingText}>{t.checkingAi}</Text>
          </View>
        ) : null}

        {/* 2. AI second opinion (if online) */}
        {ai ? (
          <View style={{ marginTop: spacing.md }}>
            <VerdictCard
              testID="ai-verdict-card"
              verdict={ai.verdict}
              title={t.aiCheckTitle}
              confidence={ai.confidence}
              tips={ai.tips}
            />
          </View>
        ) : null}

        {/* AI failed = phone likely offline; the quick check still stands */}
        {offline && mutation.isError ? (
          <View style={styles.offlineNote} testID="check-offline-note">
            <MaterialCommunityIcons name="wifi-off" size={18} color={colors.warning} />
            <Text style={styles.offlineNoteText}>{t.offlineOnlyNote}</Text>
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
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.lg },
  exampleChip: {
    flexShrink: 0,
    minHeight: 40,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  exampleChipText: { fontSize: 13, fontFamily: "Geist_Regular", color: colors.onSurfaceSecondary },
  aiPending: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSecondary,
  },
  aiPendingText: { fontSize: 14, fontFamily: "Geist_SemiBold", color: colors.brandPrimary },
  offlineNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSecondary,
  },
  offlineNoteText: { flex: 1, fontSize: 14, fontFamily: "Geist_Regular", color: colors.onSurfaceSecondary },
}));
