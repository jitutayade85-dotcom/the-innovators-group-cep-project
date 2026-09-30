// First-launch language selection. Big buttons, native language names.
// A language name is always written in that language, so it is NOT translated.

import React from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@react-native-vector-icons/material-design-icons";

import { LANGUAGES, LangCode, useLanguage } from "@/src/i18n";
import { makeStyles, radius, spacing, useTheme } from "@/src/theme";
import { useProfile } from "@/src/features/profile/ProfileContext";

export default function LanguageOnboarding() {
  const { t, lang, setLang } = useLanguage();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { markLangChosen } = useProfile();
  const styles = useStyles();

  const choose = (code: LangCode) => setLang(code);

  const onContinue = () => {
    markLangChosen();
    router.replace("/onboarding/profile");
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.lg }]}>
      <View style={styles.logoWrap}>
        <MaterialCommunityIcons name="shield-check" size={56} color={colors.onBrandPrimary} />
      </View>
      <Text style={styles.title}>{t.onbLangTitle}</Text>
      <Text style={styles.sub}>{t.onbLangSub}</Text>

      <View style={styles.list}>
        {LANGUAGES.map((l) => {
          const active = l.code === lang;
          return (
            <Pressable
              key={l.code}
              testID={`onboarding-language-${l.code}`}
              onPress={() => choose(l.code)}
              style={[styles.option, active && { borderColor: colors.brandPrimary, backgroundColor: colors.brandTertiary }]}
            >
              <Text style={[styles.optionText, active && { color: colors.onBrandTertiary, fontFamily: "Geist_SemiBold" }]}>
                {l.nativeName}
              </Text>
              {active ? (
                <MaterialCommunityIcons name="check-circle" size={26} color={colors.brandPrimary} />
              ) : (
                <MaterialCommunityIcons name="circle-outline" size={26} color={colors.border} />
              )}
            </Pressable>
          );
        })}
      </View>

      <Pressable testID="onboarding-language-continue" onPress={onContinue} style={styles.cta}>
        <Text style={styles.ctaText}>{t.continue}</Text>
        <MaterialCommunityIcons name="arrow-right" size={22} color={colors.onBrandPrimary} />
      </Pressable>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: { flex: 1, backgroundColor: colors.surface, paddingHorizontal: spacing.lg },
  logoWrap: {
    width: 88,
    height: 88,
    borderRadius: radius.lg,
    backgroundColor: colors.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: spacing.lg,
  },
  title: { fontSize: 26, fontFamily: "PlusJakartaSans_Bold", color: colors.onSurface, textAlign: "center" },
  sub: { fontSize: 14, fontFamily: "Geist_Regular", color: colors.muted, textAlign: "center", marginTop: spacing.xs },
  list: { gap: spacing.md, marginTop: spacing.xl, flex: 1 },
  option: {
    minHeight: 60,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
  },
  optionText: { fontSize: 20, color: colors.onSurface, fontFamily: "Geist_Regular" },
  cta: {
    minHeight: 56,
    borderRadius: radius.md,
    backgroundColor: colors.brandPrimary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  ctaText: { fontSize: 18, fontFamily: "Geist_SemiBold", color: colors.onBrandPrimary },
}));
