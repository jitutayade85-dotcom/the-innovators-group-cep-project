// Test Yourself — a 10-question test that unlocks every 2 days.
// Shows the score and the correct answers after submitting; a pass (>=70%)
// unlocks the certificate.

import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@react-native-vector-icons/material-design-icons";

import { fetchTestQuestions } from "@/src/api";
import { useLanguage } from "@/src/i18n";
import { makeStyles, radius, spacing, useTheme } from "@/src/theme";
import { LoadingView, ErrorView } from "@/src/components/states";
import { BigButton } from "@/src/components/big-button";
import { useProgress } from "@/src/features/game/ProgressContext";
import { currentLevel, msUntilTest, PASS_PERCENT, testUnlocked } from "@/src/features/game/progress";
import type { LangCode } from "@/src/types";

export default function TestsScreen() {
  const { t, lang } = useLanguage();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { progress, markTestTaken } = useProgress();
  const styles = useStyles();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["test-questions"],
    queryFn: fetchTestQuestions,
  });

  const questions = useMemo(() => (data ?? []).slice(0, 10), [data]);
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  if (isLoading) return <LoadingView label={t.loading} />;
  if (isError) return <ErrorView message={t.errorGeneric} onRetry={() => refetch()} />;

  const unlocked = testUnlocked(progress);
  const hoursLeft = Math.ceil(msUntilTest(progress) / 3600000);

  const score = questions.reduce(
    (acc, q, i) => acc + (answers[i] === q.correct_index ? 1 : 0),
    0,
  );
  const percent = questions.length ? Math.round((score / questions.length) * 100) : 0;
  const passed = percent >= PASS_PERCENT;
  const level = currentLevel(progress.xp);

  const Header = ({ closeToExit }: { closeToExit?: boolean }) => (
    <View style={styles.headerRow}>
      <Pressable
        testID="tests-back-button"
        onPress={() => (closeToExit ? setStarted(false) : router.back())}
        style={styles.backBtn}
      >
        <MaterialCommunityIcons name={closeToExit ? "close" : "arrow-left"} size={24} color={colors.onSurface} />
      </Pressable>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{t.testsTitle}</Text>
        <Text style={styles.sub}>{t.testsSub}</Text>
      </View>
    </View>
  );

  // Locked
  if (!started && !unlocked && !submitted) {
    return (
      <View style={styles.container} testID="tests-screen">
        <ScrollView contentContainerStyle={{ paddingTop: insets.top + spacing.md, paddingHorizontal: spacing.lg }}>
          <Header />
          <View style={styles.lockedCard} testID="tests-locked">
            <MaterialCommunityIcons name="lock-clock" size={56} color={colors.muted} />
            <Text style={styles.lockedTitle}>{t.testLocked}</Text>
            <Text style={styles.lockedSub}>
              {t.testLockedIn} {hoursLeft}{t.hoursShort}
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Result
  if (submitted) {
    return (
      <View style={styles.container} testID="tests-screen">
        <ScrollView contentContainerStyle={{ paddingTop: insets.top + spacing.md, paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + spacing.xl }}>
          <View style={[styles.resultHero, { backgroundColor: passed ? colors.success : colors.warning }]} testID="tests-result">
            <MaterialCommunityIcons name={passed ? "trophy" : "school"} size={64} color={colors.surface} />
            <Text style={styles.resultScore}>{percent}%</Text>
            <Text style={styles.resultMsg}>{passed ? t.passedMsg : t.failedMsg}</Text>
            <Text style={styles.resultSub}>{t.youScored} {score}/{questions.length}</Text>
          </View>

          {passed ? (
            <View style={{ marginTop: spacing.lg }}>
              <BigButton
                label={t.getCertificate}
                icon="certificate"
                testID="tests-get-certificate"
                onPress={() => router.push(`/certificate?level=${level}&score=${percent}`)}
              />
            </View>
          ) : null}

          <Text style={styles.sectionTitle}>{t.reviewTitle}</Text>
          {questions.map((q, i) => {
            const chosen = answers[i];
            const right = q.correct_index;
            return (
              <View key={q.id} style={styles.reviewCard} testID={`tests-review-${i}`}>
                <Text style={styles.reviewQ}>{i + 1}. {q.question[lang as LangCode]}</Text>
                <View style={styles.reviewRow}>
                  <MaterialCommunityIcons name="check-circle" size={18} color={colors.success} />
                  <Text style={styles.reviewGood}>{q.options[right][lang as LangCode]}</Text>
                </View>
                {chosen !== undefined && chosen !== right ? (
                  <View style={styles.reviewRow}>
                    <MaterialCommunityIcons name="close-circle" size={18} color={colors.error} />
                    <Text style={styles.reviewBad}>{q.options[chosen][lang as LangCode]}</Text>
                  </View>
                ) : null}
                <Text style={styles.reviewExp}>{q.explanation[lang as LangCode]}</Text>
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  }

  // Start card
  if (!started) {
    return (
      <View style={styles.container} testID="tests-screen">
        <ScrollView contentContainerStyle={{ paddingTop: insets.top + spacing.md, paddingHorizontal: spacing.lg }}>
          <Header />
          <View style={styles.startCard}>
            <MaterialCommunityIcons name="clipboard-check" size={56} color={colors.brandPrimary} />
            <Text style={styles.startTitle}>{t.testsTitle}</Text>
            <Text style={styles.startSub}>{questions.length} {t.testsSub}</Text>
            <View style={{ alignSelf: "stretch", marginTop: spacing.lg }}>
              <BigButton label={t.startTest} icon="play" testID="tests-start-button" onPress={() => setStarted(true)} />
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Taking the test
  const allAnswered = questions.every((_, i) => answers[i] !== undefined);
  const submit = () => {
    markTestTaken();
    setSubmitted(true);
    setStarted(false);
  };

  return (
    <View style={styles.container} testID="tests-screen">
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + spacing.md, paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + spacing.xl }}>
        <Header closeToExit />
        {questions.map((q, i) => (
          <View key={q.id} style={styles.qCard} testID={`tests-question-${i}`}>
            <Text style={styles.qText}>
              {i + 1}. {q.question[lang as LangCode]}
            </Text>
            {q.options.map((opt, oi) => {
              const chosen = answers[i] === oi;
              return (
                <Pressable
                  key={oi}
                  testID={`tests-q${i}-opt${oi}`}
                  onPress={() => setAnswers((a) => ({ ...a, [i]: oi }))}
                  style={[styles.optBtn, chosen && { borderColor: colors.brandPrimary, backgroundColor: colors.brandTertiary }]}
                >
                  <MaterialCommunityIcons
                    name={chosen ? "radiobox-marked" : "radiobox-blank"}
                    size={22}
                    color={chosen ? colors.brandPrimary : colors.muted}
                  />
                  <Text style={[styles.optText, chosen && { color: colors.onBrandTertiary }]}>{opt[lang as LangCode]}</Text>
                </Pressable>
              );
            })}
          </View>
        ))}
        <View style={{ marginTop: spacing.md }}>
          <BigButton
            label={t.submitTest}
            icon="check-all"
            disabled={!allAnswered}
            testID="tests-submit-button"
            onPress={submit}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: { flex: 1, backgroundColor: colors.surface },
  headerRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.lg },
  backBtn: { width: 44, height: 44, borderRadius: radius.pill, backgroundColor: colors.surfaceSecondary, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 24, fontFamily: "PlusJakartaSans_Bold", color: colors.onSurface },
  sub: { fontSize: 14, fontFamily: "Geist_Regular", color: colors.muted, marginTop: 2 },
  lockedCard: { alignItems: "center", gap: spacing.sm, backgroundColor: colors.surfaceSecondary, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.xxl, marginTop: spacing.lg },
  lockedTitle: { fontSize: 18, fontFamily: "Geist_SemiBold", color: colors.onSurface },
  lockedSub: { fontSize: 15, fontFamily: "Geist_Regular", color: colors.muted },
  startCard: { alignItems: "center", gap: spacing.sm, backgroundColor: colors.surfaceSecondary, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.xxl, marginTop: spacing.lg },
  startTitle: { fontSize: 20, fontFamily: "PlusJakartaSans_Bold", color: colors.onSurface },
  startSub: { fontSize: 15, fontFamily: "Geist_Regular", color: colors.muted },
  qCard: { backgroundColor: colors.surfaceSecondary, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: spacing.sm, marginBottom: spacing.md },
  qText: { fontSize: 16, lineHeight: 24, fontFamily: "Geist_SemiBold", color: colors.onSurface, marginBottom: spacing.xs },
  optBtn: { flexDirection: "row", alignItems: "center", gap: spacing.sm, minHeight: 48, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  optText: { flex: 1, fontSize: 15, fontFamily: "Geist_Regular", color: colors.onSurface },
  resultHero: { alignItems: "center", gap: spacing.xs, borderRadius: radius.lg, padding: spacing.xl },
  resultScore: { fontSize: 44, fontFamily: "PlusJakartaSans_Bold", color: colors.surface },
  resultMsg: { fontSize: 18, fontFamily: "Geist_SemiBold", color: colors.surface },
  resultSub: { fontSize: 14, fontFamily: "Geist_Regular", color: colors.surface, opacity: 0.9 },
  sectionTitle: { fontSize: 18, fontFamily: "PlusJakartaSans_Bold", color: colors.onSurface, marginTop: spacing.xl, marginBottom: spacing.md },
  reviewCard: { backgroundColor: colors.surfaceSecondary, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: spacing.xs, marginBottom: spacing.md },
  reviewQ: { fontSize: 15, fontFamily: "Geist_SemiBold", color: colors.onSurface, marginBottom: spacing.xs },
  reviewRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  reviewGood: { flex: 1, fontSize: 14, fontFamily: "Geist_Regular", color: colors.success },
  reviewBad: { flex: 1, fontSize: 14, fontFamily: "Geist_Regular", color: colors.error },
  reviewExp: { fontSize: 13, lineHeight: 20, fontFamily: "Geist_Regular", color: colors.muted, marginTop: spacing.xs },
}));
