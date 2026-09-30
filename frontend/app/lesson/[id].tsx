// Lesson detail — big hero icon, simple steps, and a built-in quiz with a
// sticky "Take Quiz" button. Works as a stack screen (no tab bar here).

import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@react-native-vector-icons/material-design-icons";

import { fetchLesson } from "@/src/api";
import { useLanguage } from "@/src/i18n";
import { makeStyles, radius, spacing, useTheme } from "@/src/theme";
import { useCompletedLessons } from "@/src/utils/completed";
import { BigButton } from "@/src/components/big-button";
import { ErrorView, LoadingView } from "@/src/components/states";

type Mode = "lesson" | "quiz" | "result";

export default function LessonDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lessonId = Array.isArray(id) ? id[0] : id ?? "";
  const { t, lang } = useLanguage();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { markCompleted } = useCompletedLessons();
  const styles = useStyles();

  const { data: lesson, isLoading, isError, refetch } = useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: () => fetchLesson(lessonId),
    enabled: !!lessonId,
  });

  const [mode, setMode] = useState<Mode>("lesson");
  const [selected, setSelected] = useState<number | null>(null);

  // Reset when a different lesson is opened.
  useEffect(() => {
    setMode("lesson");
    setSelected(null);
  }, [lessonId]);

  // Reaching the result screen = lesson completed (shows the Done badge).
  useEffect(() => {
    if (mode === "result" && lessonId) markCompleted(lessonId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, lessonId]);

  if (isLoading) return <LoadingView label={t.loading} />;
  if (isError || !lesson) return <ErrorView message={t.errorGeneric} onRetry={() => refetch()} />;

  const isCorrect = selected === lesson.quiz.correct_index;
  const score = isCorrect ? 1 : 0;

  return (
    <View style={styles.container} testID="lesson-detail-screen">
      <ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + (mode === "lesson" ? 96 : spacing.xxl),
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Pressable
            testID="lesson-back-button"
            onPress={() => (mode === "lesson" ? router.back() : setMode("lesson"))}
            style={[styles.backBtn, { top: insets.top + spacing.sm }]}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.onSurface} />
          </Pressable>
          <View style={{ paddingTop: insets.top + spacing.xxl, alignItems: "center", gap: spacing.md }}>
            <MaterialCommunityIcons name={lesson.icon as never} size={72} color={colors.onBrandPrimary} />
            <View style={styles.minutesPill}>
              <MaterialCommunityIcons name="clock-outline" size={15} color={colors.onBrandTertiary} />
              <Text style={styles.minutesText}>
                {lesson.minutes} {t.minutes}
              </Text>
            </View>
          </View>
        </View>

        {mode === "lesson" ? (
          <View style={{ padding: spacing.lg, gap: spacing.lg }}>
            <View style={{ gap: spacing.xs }}>
              <Text style={styles.title}>{lesson.title[lang]}</Text>
              <Text style={styles.summary}>{lesson.summary[lang]}</Text>
            </View>

            <Text style={styles.sectionTitle}>{t.whatToDo}</Text>
            {lesson.steps.map((step, i) => (
              <View key={i} style={styles.stepRow}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{i + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step.text[lang]}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {mode === "quiz" ? (
          <View style={{ padding: spacing.lg, gap: spacing.lg }}>
            <Text style={styles.sectionTitle}>{t.quizTitle}</Text>
            <View style={styles.questionCard}>
              <Text style={styles.questionText}>{lesson.quiz.question[lang]}</Text>
            </View>

            {lesson.quiz.options.map((option, i) => {
              const chosen = selected === i;
              const isRight = i === lesson.quiz.correct_index;
              const answered = selected !== null;
              let bg = colors.surface;
              let borderColor = colors.border;
              let fg = colors.onSurface;
              if (answered && isRight) {
                bg = colors.success;
                borderColor = colors.success;
                fg = colors.onSuccess;
              } else if (answered && chosen && !isRight) {
                bg = colors.error;
                borderColor = colors.error;
                fg = colors.onError;
              }
              return (
                <Pressable
                  key={i}
                  testID={`quiz-option-${i}`}
                  disabled={answered}
                  onPress={() => setSelected(i)}
                  style={[styles.optionBtn, { backgroundColor: bg, borderColor }]}
                >
                  <Text style={[styles.optionText, { color: fg }]}>{option[lang]}</Text>
                  {answered && isRight ? (
                    <MaterialCommunityIcons name="check-circle" size={22} color={fg} />
                  ) : null}
                  {answered && chosen && !isRight ? (
                    <MaterialCommunityIcons name="close-circle" size={22} color={fg} />
                  ) : null}
                </Pressable>
              );
            })}

            {selected !== null ? (
              <View style={styles.feedback}>
                <MaterialCommunityIcons
                  name={isCorrect ? "hand-thumbs-up" : "hand-thumbs-down"}
                  size={24}
                  color={isCorrect ? colors.success : colors.error}
                />
                <Text
                  style={[
                    styles.feedbackText,
                    { color: isCorrect ? colors.success : colors.error },
                  ]}
                >
                  {isCorrect ? t.correct : t.wrong}
                </Text>
              </View>
            ) : null}

            {selected !== null ? (
              <BigButton
                label={t.finishQuiz}
                onPress={() => setMode("result")}
                testID="quiz-finish-button"
              />
            ) : null}
          </View>
        ) : null}

        {mode === "result" ? (
          <View style={{ padding: spacing.xl, alignItems: "center", gap: spacing.lg }}>
            <MaterialCommunityIcons name="shield-check" size={88} color={colors.success} />
            <Text style={styles.resultTitle}>{t.wellDone}</Text>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>{t.scoreTitle}</Text>
              <Text style={styles.scoreValue}>{score} / 1</Text>
            </View>
            <BigButton
              label={t.retry}
              variant="light"
              icon="refresh"
              testID="quiz-retry-button"
              onPress={() => {
                setMode("quiz");
                setSelected(null);
              }}
            />
            <BigButton
              label={t.backToLessons}
              icon="book-open-variant"
              testID="quiz-more-lessons-button"
              onPress={() => router.back()}
            />
          </View>
        ) : null}
      </ScrollView>

      {/* Sticky quiz CTA (lesson mode only) */}
      {mode === "lesson" ? (
        <View style={[styles.ctaWrap, { bottom: insets.bottom + 16 }]}>
          <BigButton
            label={t.takeQuiz}
            icon="help-circle"
            testID="lesson-take-quiz-button"
            onPress={() => setMode("quiz")}
          />
        </View>
      ) : null}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: { flex: 1, backgroundColor: colors.surface },
  hero: {
    backgroundColor: colors.brandPrimary,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
    paddingBottom: spacing.xl,
  },
  backBtn: {
    position: "absolute",
    left: spacing.lg,
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  minutesPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.brandTertiary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  minutesText: { fontSize: 13, fontFamily: "Geist_SemiBold", color: colors.onBrandTertiary },
  title: { fontSize: 24, fontFamily: "PlusJakartaSans_Bold", color: colors.onSurface },
  summary: { fontSize: 15, lineHeight: 22, fontFamily: "Geist_Regular", color: colors.onSurfaceSecondary },
  sectionTitle: { fontSize: 18, fontFamily: "PlusJakartaSans_Bold", color: colors.onSurface },
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.brandTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: { fontSize: 15, fontFamily: "Geist_SemiBold", color: colors.onBrandTertiary },
  stepText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: "Geist_Regular",
    color: colors.onSurface,
    paddingTop: 4,
  },
  questionCard: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  questionText: { fontSize: 17, lineHeight: 25, fontFamily: "Geist_SemiBold", color: colors.onSurface },
  optionBtn: {
    minHeight: 56,
    borderRadius: radius.md,
    borderWidth: 2,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  optionText: { flex: 1, fontSize: 16, fontFamily: "Geist_Regular" },
  feedback: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  feedbackText: { fontSize: 16, fontFamily: "Geist_SemiBold" },
  resultTitle: { fontSize: 20, fontFamily: "PlusJakartaSans_Bold", color: colors.onSurface, textAlign: "center" },
  scoreCard: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: "center",
    gap: spacing.xs,
    minWidth: 160,
  },
  scoreLabel: { fontSize: 13, fontFamily: "Geist_Regular", color: colors.muted },
  scoreValue: { fontSize: 32, fontFamily: "PlusJakartaSans_Bold", color: colors.brandPrimary },
  ctaWrap: { position: "absolute", left: spacing.lg, right: spacing.lg },
}));
