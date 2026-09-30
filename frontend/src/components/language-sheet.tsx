// language-sheet.tsx — bottom sheet to switch app language (4 languages).
// A language name is always written in that language, so this component is
// intentionally NOT translated.

import React from "react";
import { Modal, Pressable, Text, View } from "react-native";
import MaterialCommunityIcons from "@react-native-vector-icons/material-design-icons";
import { makeStyles, radius, spacing, useTheme } from "@/src/theme";
import { LANGUAGES, LangCode, useLanguage } from "@/src/i18n";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function LanguageSheet({ visible, onClose }: Props) {
  const { colors } = useTheme();
  const { lang, setLang } = useLanguage();
  const styles = useStyles();

  const pick = (code: LangCode) => {
    setLang(code);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={undefined}>
          <Text style={styles.title}>🌐 Language / भाषा / भाषा / ભાષા</Text>
          {LANGUAGES.map((l) => {
            const active = l.code === lang;
            return (
              <Pressable
                key={l.code}
                testID={`language-option-${l.code}`}
                onPress={() => pick(l.code)}
                style={[styles.option, active && { backgroundColor: colors.brandTertiary }]}
              >
                <Text style={[styles.optionText, active && { color: colors.onBrandTertiary, fontFamily: "Geist_SemiBold" }]}>
                  {l.nativeName}
                </Text>
                {active ? (
                  <MaterialCommunityIcons name="check-circle" size={24} color={colors.brandPrimary} />
                ) : null}
              </Pressable>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const useStyles = makeStyles((colors) => ({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  title: {
    fontSize: 18,
    fontFamily: "PlusJakartaSans_Bold",
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },
  option: {
    minHeight: 56,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSecondary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
  },
  optionText: { fontSize: 17, color: colors.onSurface, fontFamily: "Geist_Regular" },
}));
