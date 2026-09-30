// Settings — language switcher, edit profile, and the Android SMS-scan toggle.

import React, { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@react-native-vector-icons/material-design-icons";

import { LANGUAGES, useLanguage } from "@/src/i18n";
import { makeStyles, radius, spacing, useTheme } from "@/src/theme";
import { LanguageSheet } from "@/src/components/language-sheet";
import { isSmsSupported, startSmsScan } from "@/src/features/sms/smsScanner";
import { BigButton } from "@/src/components/big-button";

export default function Settings() {
  const { t, lang } = useLanguage();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = useStyles();

  const [langSheet, setLangSheet] = useState(false);
  const [smsExplain, setSmsExplain] = useState(false);
  const [smsMsg, setSmsMsg] = useState<string | null>(null);

  const currentNative = LANGUAGES.find((l) => l.code === lang)?.nativeName ?? "English";

  const enableSms = async () => {
    setSmsExplain(false);
    if (!isSmsSupported()) {
      setSmsMsg(t.smsUnsupportedMsg);
      return;
    }
    const status = await startSmsScan(lang, t.smsFlagTitle);
    if (status === "active") setSmsMsg(t.smsActiveMsg);
    else if (status === "denied") setSmsMsg(t.smsDeniedMsg);
    else setSmsMsg(t.smsUnsupportedMsg);
  };

  return (
    <View style={styles.container} testID="settings-screen">
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.md,
          paddingHorizontal: spacing.lg,
          paddingBottom: insets.bottom + spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Pressable testID="settings-back-button" onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.onSurface} />
          </Pressable>
          <Text style={styles.title}>{t.settingsTitle}</Text>
        </View>

        {/* Language */}
        <Pressable testID="settings-language-row" onPress={() => setLangSheet(true)} style={styles.row}>
          <View style={styles.rowIcon}>
            <MaterialCommunityIcons name="translate" size={24} color={colors.brandPrimary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>{t.settingsLanguage}</Text>
            <Text style={styles.rowSub}>{currentNative}</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={26} color={colors.muted} />
        </Pressable>

        {/* Edit profile */}
        <Pressable
          testID="settings-edit-profile-row"
          onPress={() => router.push("/onboarding/profile?edit=1")}
          style={styles.row}
        >
          <View style={styles.rowIcon}>
            <MaterialCommunityIcons name="account-edit" size={24} color={colors.brandPrimary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>{t.settingsEditProfile}</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={26} color={colors.muted} />
        </Pressable>

        {/* SMS scan (Android build only) */}
        <Pressable testID="settings-sms-row" onPress={() => setSmsExplain(true)} style={styles.row}>
          <View style={styles.rowIcon}>
            <MaterialCommunityIcons name="message-alert" size={24} color={colors.brandPrimary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>{t.settingsSmsScan}</Text>
            <Text style={styles.rowSub}>{t.settingsSmsScanSub}</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={26} color={colors.muted} />
        </Pressable>

        {smsMsg ? (
          <View style={styles.note} testID="settings-sms-note">
            <MaterialCommunityIcons name="information" size={18} color={colors.info} />
            <Text style={styles.noteText}>{smsMsg}</Text>
          </View>
        ) : null}
      </ScrollView>

      <LanguageSheet visible={langSheet} onClose={() => setLangSheet(false)} />

      {/* SMS explanation before asking permission (simple words) */}
      <Modal visible={smsExplain} transparent animationType="fade" onRequestClose={() => setSmsExplain(false)}>
        <Pressable style={styles.backdrop} onPress={() => setSmsExplain(false)}>
          <Pressable style={styles.dialog} onPress={undefined}>
            <View style={styles.dialogIcon}>
              <MaterialCommunityIcons name="shield-account" size={34} color={colors.onBrandPrimary} />
            </View>
            <Text style={styles.dialogTitle}>{t.smsExplainTitle}</Text>
            <Text style={styles.dialogBody}>{t.smsExplainBody}</Text>
            <BigButton label={t.smsEnableBtn} icon="check" testID="settings-sms-allow" onPress={enableSms} />
            <Pressable testID="settings-sms-cancel" onPress={() => setSmsExplain(false)} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>{t.smsCancel}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: { flex: 1, backgroundColor: colors.surface },
  headerRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.lg },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 26, fontFamily: "PlusJakartaSans_Bold", color: colors.onSurface },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
    minHeight: 64,
  },
  rowIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.brandTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  rowTitle: { fontSize: 16, fontFamily: "Geist_SemiBold", color: colors.onSurface },
  rowSub: { fontSize: 13, fontFamily: "Geist_Regular", color: colors.muted, marginTop: 2 },
  note: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  noteText: { flex: 1, fontSize: 14, fontFamily: "Geist_Regular", color: colors.onSurfaceSecondary },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center", padding: spacing.xl },
  dialog: {
    width: "100%",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.md,
  },
  dialogIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    backgroundColor: colors.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  dialogTitle: { fontSize: 20, fontFamily: "PlusJakartaSans_Bold", color: colors.onSurface, textAlign: "center" },
  dialogBody: { fontSize: 15, lineHeight: 22, fontFamily: "Geist_Regular", color: colors.onSurfaceSecondary, textAlign: "center" },
  cancelBtn: { minHeight: 44, alignItems: "center", justifyContent: "center" },
  cancelText: { fontSize: 15, fontFamily: "Geist_SemiBold", color: colors.muted },
}));
