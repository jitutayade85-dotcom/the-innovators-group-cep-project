// Profile screen — used both for first-time setup and later editing
// (pass ?edit=1 to show a back button and return instead of going Home).
// Only name + language are mandatory. Age, place and photo are optional.

import React, { useState } from "react";
import { Linking, Pressable, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import MaterialCommunityIcons from "@react-native-vector-icons/material-design-icons";

import { LANGUAGES, LangCode, useLanguage } from "@/src/i18n";
import { makeStyles, radius, spacing, useTheme } from "@/src/theme";
import { useProfile } from "@/src/features/profile/ProfileContext";
import { fileUrl, uploadPhoto } from "@/src/api";
import { BigButton } from "@/src/components/big-button";

export default function ProfileScreen() {
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const isEdit = edit === "1";
  const { t, lang, setLang } = useLanguage();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile, deviceId, saveProfile } = useProfile();
  const styles = useStyles();

  const [name, setName] = useState(profile?.name ?? "");
  const [age, setAge] = useState(profile?.age ? String(profile.age) : "");
  const [place, setPlace] = useState(profile?.place ?? "");
  const [localPhoto, setLocalPhoto] = useState<string | null>(null);
  const [nameError, setNameError] = useState(false);
  const [saving, setSaving] = useState(false);

  const shownPhoto = localPhoto ?? (profile?.photo_path ? fileUrl(profile.photo_path) : null);

  const pickPhoto = async () => {
    // Permission handling: check, then request; guide to Settings if blocked.
    const current = await ImagePicker.getMediaLibraryPermissionsAsync();
    let granted = current.granted;
    if (!granted) {
      const req = await ImagePicker.requestMediaLibraryPermissionsAsync();
      granted = req.granted;
      if (!granted && !req.canAskAgain) {
        Linking.openSettings();
        return;
      }
      if (!granted) return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });
    if (!result.canceled && result.assets[0]) {
      setLocalPhoto(result.assets[0].uri);
    }
  };

  const onSave = async () => {
    if (name.trim().length === 0) {
      setNameError(true);
      return;
    }
    setSaving(true);
    try {
      let photoPath = profile?.photo_path ?? null;
      if (localPhoto) {
        try {
          const up = await uploadPhoto(deviceId, localPhoto);
          photoPath = up.path;
        } catch {
          /* photo upload failed (offline?) — save the rest anyway */
        }
      }
      await saveProfile({
        name: name.trim(),
        lang: lang as LangCode,
        age: age ? parseInt(age, 10) : null,
        place: place.trim() || null,
        photo_path: photoPath,
      });
      if (isEdit) router.back();
      else router.replace("/home");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container} testID="profile-screen">
      <KeyboardAwareScrollView
        bottomOffset={16}
        contentContainerStyle={{
          paddingTop: insets.top + spacing.lg,
          paddingHorizontal: spacing.lg,
          paddingBottom: insets.bottom + spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}
      >
        {isEdit ? (
          <Pressable testID="profile-back-button" onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.onSurface} />
          </Pressable>
        ) : null}

        <Text style={styles.title}>{t.profileTitle}</Text>
        <Text style={styles.sub}>{t.profileSub}</Text>

        {/* Photo */}
        <Pressable testID="profile-photo-button" onPress={pickPhoto} style={styles.photoWrap}>
          {shownPhoto ? (
            <Image source={{ uri: shownPhoto }} style={styles.photo} contentFit="cover" />
          ) : (
            <MaterialCommunityIcons name="camera-plus" size={36} color={colors.brandPrimary} />
          )}
        </Pressable>
        <Text style={styles.photoLabel}>{shownPhoto ? t.changePhoto : t.addPhoto}</Text>

        {/* Name (required) */}
        <Text style={styles.label}>{t.nameLabel}</Text>
        <TextInput
          testID="profile-name-input"
          style={[styles.input, nameError && { borderColor: colors.error }]}
          value={name}
          onChangeText={(v) => {
            setName(v);
            setNameError(false);
          }}
          placeholder={t.namePlaceholder}
          placeholderTextColor={colors.muted}
        />
        {nameError ? (
          <Text style={[styles.errorText, { color: colors.error }]} testID="profile-name-error">
            {t.nameRequired}
          </Text>
        ) : null}

        {/* Age (optional) */}
        <Text style={styles.label}>{t.ageLabel}</Text>
        <TextInput
          testID="profile-age-input"
          style={styles.input}
          value={age}
          onChangeText={setAge}
          placeholder={t.agePlaceholder}
          placeholderTextColor={colors.muted}
          keyboardType="number-pad"
          maxLength={3}
        />

        {/* Place (optional) */}
        <Text style={styles.label}>{t.placeLabel}</Text>
        <TextInput
          testID="profile-place-input"
          style={styles.input}
          value={place}
          onChangeText={setPlace}
          placeholder={t.placePlaceholder}
          placeholderTextColor={colors.muted}
        />

        {/* Language */}
        <Text style={styles.label}>{t.settingsLanguage}</Text>
        <View style={styles.langRow}>
          {LANGUAGES.map((l) => {
            const active = l.code === lang;
            return (
              <Pressable
                key={l.code}
                testID={`profile-lang-${l.code}`}
                onPress={() => setLang(l.code)}
                style={[styles.langChip, active && { backgroundColor: colors.brandTertiary, borderColor: colors.brandPrimary }]}
              >
                <Text style={[styles.langChipText, active && { color: colors.onBrandTertiary, fontFamily: "Geist_SemiBold" }]}>
                  {l.nativeName}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={{ marginTop: spacing.xl }}>
          <BigButton
            label={saving ? t.savingProfile : t.saveProfile}
            icon="check"
            loading={saving}
            disabled={saving}
            testID="profile-save-button"
            onPress={onSave}
          />
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: { flex: 1, backgroundColor: colors.surface },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  title: { fontSize: 26, fontFamily: "PlusJakartaSans_Bold", color: colors.onSurface },
  sub: { fontSize: 14, fontFamily: "Geist_Regular", color: colors.muted, marginTop: 2, marginBottom: spacing.lg },
  photoWrap: {
    width: 104,
    height: 104,
    borderRadius: radius.pill,
    backgroundColor: colors.brandTertiary,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    overflow: "hidden",
  },
  photo: { width: 104, height: 104 },
  photoLabel: {
    textAlign: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    color: colors.brandPrimary,
    fontSize: 14,
    fontFamily: "Geist_SemiBold",
  },
  label: {
    fontSize: 14,
    fontFamily: "Geist_SemiBold",
    color: colors.onSurfaceSecondary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  input: {
    minHeight: 56,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.lg,
    fontSize: 17,
    color: colors.onSurface,
    fontFamily: "Geist_Regular",
  },
  errorText: { fontSize: 13, fontFamily: "Geist_Regular", marginTop: spacing.xs },
  langRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  langChip: {
    flexShrink: 0,
    minHeight: 44,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  langChipText: { fontSize: 15, fontFamily: "Geist_Regular", color: colors.onSurface },
}));
