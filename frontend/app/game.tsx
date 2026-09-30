// "Scam ya Safe?" — the training game.
// Pick a level (locked until enough XP), then judge each realistic message as
// Scam or Safe and read why. Works fully offline (content is cached).

import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@react-native-vector-icons/material-design-icons";

import { fetchGameItems } from "@/src/api";
import { useLanguage } from "@/src/i18n";
import { makeStyles, radius, spacing, useTheme } from "@/src/theme";
import { LoadingView, ErrorView } from "@/src/components/states";
import { BigButton } from "@/src/components/big-button";
import { useProgress } from "@/src/features/game/ProgressContext";
import {
  Category,
  Level,
  LEVELS,
  LEVEL_XP,
  currentLevel,
  isLevelUnlocked,
} from "@/src/features/game/progress";
import type { GameItem, LangCode } from "@/src/types";

const TYPE_ICON: Record<string, string> = {
  sms: "message-text",
  whatsapp: "whatsapp",
  call: "phone-in-talk",
  website: "web",
};

export default function GameScreen() {
  const { t, lang } = useLanguage();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { progress, addGameResults } = useProgress();
  const styles = useStyles();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["game-items"],
    queryFn: fetchGameItems,
  });

  const [activeLevel, setActiveLevel] = useState<Level | null>(null);
  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState<null | boolean>(null); // correct?
  const [roundResults, setRoundResults] = useState<{ category: Category; correct: boolean }[]>([]);
  const [done, setDone] = useState(false);

  const catLabel: Record<string, string> = {
    phishing: t.gcatPhishing, upi: t.gcatUpi, job: t.gcatJob, trading: t.gcatTrading, loan: t.gcatLoan,
  };

  const levelItems = useMemo(
    () => (data ?? []).filter((i) => i.level === activeLevel),
    [data, activeLevel],
  );

  const startLevel = (lvl: Level) => {
    setActiveLevel(lvl);
    setIndex(0);
    setAnswered(null);
    setRoundResults([]);
    setDone(false);
  };

  const answer = (saidScam: boolean) => {
    if (answered !== null) return;
    const item = levelItems[index];
    const correct = saidScam === item.is_scam;
    setAnswered(correct);
    setRoundResults((r) => [...r, { category: item.category as Category, correct }]);
  };

  const next = () => {
    if (index + 1 >= levelItems.length) {
      addGameResults(roundResults);
      setDone(true);
    } else {
      setIndex((i) => i + 1);
      setAnswered(null);
    }
  };

  if (isLoading) return <LoadingView label={t.loading} />;
  if (isError) return <ErrorView message={t.errorGeneric} onRetry={() => refetch()} />;

  // ---- Level select ----
  if (!activeLevel) {
    return (
      <View style={styles.container} testID="game-screen">
        <ScrollView
          contentContainerStyle={{ paddingTop: insets.top + spacing.md, paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + spacing.xl }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerRow}>
            <Pressable testID="game-back-button" onPress={() => router.back()} style={styles.backBtn}>
              <MaterialCommunityIcons name="arrow-left" size={24} color={colors.onSurface} />
            </Pressable>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{t.gameTitle}</Text>
              <Text style={styles.sub}>{t.gameSub}</Text>
            </View>
          </View>

          <View style={styles.xpPill}>
            <MaterialCommunityIcons name="star-four-points" size={18} color={colors.onBrandPrimary} />
            <Text style={styles.xpPillText}>{progress.xp} {t.xpShort}</Text>
          </View>

          <View style={{ gap: spacing.md, marginTop: spacing.lg }}>
            {LEVELS.map((lvl) => {
              const unlocked = isLevelUnlocked(lvl, progress.xp);
              const isCurrent = currentLevel(progress.xp) === lvl;
              return (
                <Pressable
                  key={lvl}
                  testID={`game-level-${lvl}`}
                  disabled={!unlocked}
                  onPress={() => startLevel(lvl)}
                  style={[styles.levelCard, !unlocked && { opacity: 0.55 }, isCurrent && { borderColor: colors.brandPrimary }]}
                >
                  <View style={[styles.levelIcon, { backgroundColor: unlocked ? colors.brandTertiary : colors.surfaceTertiary }]}>
                    <MaterialCommunityIcons name={unlocked ? "medal" : "lock"} size={26} color={unlocked ? colors.brandPrimary : colors.muted} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.levelName}>{lvl.charAt(0).toUpperCase() + lvl.slice(1)}</Text>
                    <Text style={styles.levelSub}>
                      {unlocked ? "" : `${t.unlockAtXp} ${LEVEL_XP[lvl]} ${t.xpShort}`}
                    </Text>
                  </View>
                  {unlocked ? (
                    <MaterialCommunityIcons name="play-circle" size={30} color={colors.brandPrimary} />
                  ) : (
                    <Text style={styles.lockText}>{t.locked}</Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </View>
    );
  }

  // ---- Round complete ----
  if (done) {
    const correctCount = roundResults.filter((r) => r.correct).length;
    return (
      <View style={[styles.container, styles.center]} testID="game-done">
        <MaterialCommunityIcons name="trophy" size={80} color={colors.warning} />
        <Text style={styles.doneTitle}>{t.gameDoneTitle}</Text>
        <Text style={styles.doneScore}>
          {t.gameScoreLine} {correctCount}/{levelItems.length}
        </Text>
        <Text style={styles.doneXp}>+{correctCount * 10} {t.xpShort}</Text>
        <View style={{ alignSelf: "stretch", paddingHorizontal: spacing.xl, gap: spacing.md, marginTop: spacing.lg }}>
          <BigButton label={t.playAgain} icon="reload" testID="game-play-again" onPress={() => startLevel(activeLevel)} />
          <BigButton label={t.progressTitle} variant="light" icon="chart-line" testID="game-goto-progress" onPress={() => router.replace("/progress")} />
        </View>
      </View>
    );
  }

  // ---- Playing ----
  const item = levelItems[index];
  return (
    <View style={styles.container} testID="game-play">
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + spacing.md, paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Pressable testID="game-exit-button" onPress={() => setActiveLevel(null)} style={styles.backBtn}>
            <MaterialCommunityIcons name="close" size={24} color={colors.onSurface} />
          </Pressable>
          <Text style={styles.progressText}>
            {index + 1} {t.ofWord} {levelItems.length}
          </Text>
        </View>

        {/* Message mock card */}
        <View style={styles.msgCard} testID="game-item-card">
          <View style={styles.msgHeader}>
            <MaterialCommunityIcons name={TYPE_ICON[item.type] as never} size={22} color={colors.brandPrimary} />
            <Text style={styles.msgSender} numberOfLines={1}>{item.sender}</Text>
            <View style={styles.catTag}>
              <Text style={styles.catTagText}>{catLabel[item.category]}</Text>
            </View>
          </View>
          <Text style={styles.msgBody}>{item.body[lang as LangCode]}</Text>
        </View>

        {/* Answer buttons */}
        {answered === null ? (
          <View style={styles.answerRow}>
            <Pressable testID="game-answer-scam" onPress={() => answer(true)} style={[styles.answerBtn, { backgroundColor: colors.error }]}>
              <MaterialCommunityIcons name="alert-octagon" size={26} color={colors.onError} />
              <Text style={[styles.answerText, { color: colors.onError }]}>{t.scamLabel}</Text>
            </Pressable>
            <Pressable testID="game-answer-safe" onPress={() => answer(false)} style={[styles.answerBtn, { backgroundColor: colors.success }]}>
              <MaterialCommunityIcons name="shield-check" size={26} color={colors.onSuccess} />
              <Text style={[styles.answerText, { color: colors.onSuccess }]}>{t.safeLabel}</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.explainWrap} testID="game-explanation">
            <View style={[styles.resultBanner, { backgroundColor: answered ? colors.success : colors.error }]}>
              <MaterialCommunityIcons name={answered ? "thumb-up" : "thumb-down"} size={22} color={colors.surface} />
              <Text style={styles.resultBannerText}>{answered ? t.correct : t.wrong}</Text>
              <Text style={styles.resultTruth}>
                {item.is_scam ? t.scamLabel : t.safeLabel}
              </Text>
            </View>
            <Text style={styles.whyTitle}>{t.whyTitle}</Text>
            <Text style={styles.whyText}>{item.explanation[lang as LangCode]}</Text>
            <BigButton
              label={index + 1 >= levelItems.length ? t.finishQuiz : t.next}
              icon="arrow-right"
              testID="game-next-button"
              onPress={next}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: { flex: 1, backgroundColor: colors.surface },
  center: { alignItems: "center", justifyContent: "center", gap: spacing.sm },
  headerRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.md },
  backBtn: { width: 44, height: 44, borderRadius: radius.pill, backgroundColor: colors.surfaceSecondary, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 24, fontFamily: "PlusJakartaSans_Bold", color: colors.onSurface },
  sub: { fontSize: 14, fontFamily: "Geist_Regular", color: colors.muted, marginTop: 2 },
  progressText: { fontSize: 15, fontFamily: "Geist_SemiBold", color: colors.muted },
  xpPill: { flexDirection: "row", alignItems: "center", gap: spacing.xs, alignSelf: "flex-start", backgroundColor: colors.brandPrimary, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, marginTop: spacing.sm },
  xpPillText: { color: colors.onBrandPrimary, fontFamily: "Geist_SemiBold", fontSize: 15 },
  levelCard: { flexDirection: "row", alignItems: "center", gap: spacing.md, backgroundColor: colors.surfaceSecondary, borderRadius: radius.lg, borderWidth: 2, borderColor: colors.border, padding: spacing.lg, minHeight: 72 },
  levelIcon: { width: 52, height: 52, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  levelName: { fontSize: 18, fontFamily: "Geist_SemiBold", color: colors.onSurface },
  levelSub: { fontSize: 13, fontFamily: "Geist_Regular", color: colors.muted, marginTop: 2 },
  lockText: { fontSize: 13, fontFamily: "Geist_SemiBold", color: colors.muted },
  msgCard: { backgroundColor: colors.surfaceSecondary, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: spacing.md, marginBottom: spacing.lg },
  msgHeader: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  msgSender: { flex: 1, fontSize: 14, fontFamily: "Geist_SemiBold", color: colors.onSurfaceSecondary },
  catTag: { backgroundColor: colors.brandTertiary, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  catTagText: { fontSize: 11, fontFamily: "Geist_SemiBold", color: colors.onBrandTertiary },
  msgBody: { fontSize: 17, lineHeight: 26, fontFamily: "Geist_Regular", color: colors.onSurface },
  answerRow: { flexDirection: "row", gap: spacing.md },
  answerBtn: { flex: 1, minHeight: 88, borderRadius: radius.lg, alignItems: "center", justifyContent: "center", gap: spacing.xs },
  answerText: { fontSize: 20, fontFamily: "PlusJakartaSans_Bold" },
  explainWrap: { gap: spacing.md },
  resultBanner: { flexDirection: "row", alignItems: "center", gap: spacing.sm, borderRadius: radius.md, padding: spacing.md },
  resultBannerText: { flex: 1, color: colors.surface, fontSize: 16, fontFamily: "Geist_SemiBold" },
  resultTruth: { color: colors.surface, fontSize: 14, fontFamily: "PlusJakartaSans_Bold" },
  whyTitle: { fontSize: 16, fontFamily: "Geist_SemiBold", color: colors.onSurface },
  whyText: { fontSize: 15, lineHeight: 23, fontFamily: "Geist_Regular", color: colors.onSurfaceSecondary },
  doneTitle: { fontSize: 24, fontFamily: "PlusJakartaSans_Bold", color: colors.onSurface },
  doneScore: { fontSize: 18, fontFamily: "Geist_SemiBold", color: colors.onSurfaceSecondary },
  doneXp: { fontSize: 16, fontFamily: "Geist_SemiBold", color: colors.success },
}));
