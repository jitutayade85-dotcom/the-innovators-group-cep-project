// Certificate — shown after passing a test. Renders a certificate card with a
// QR code that opens the server verification page, and lets the user share it
// on WhatsApp (as a PDF). Sharing/print work on a real device build, not web.

import React, { useEffect, useRef, useState } from "react";
import { Platform, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@react-native-vector-icons/material-design-icons";
import QRCode from "react-native-qrcode-svg";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import { createCertificate, verifyUrl } from "@/src/api";
import { useLanguage } from "@/src/i18n";
import { makeStyles, radius, spacing, useTheme } from "@/src/theme";
import { LoadingView } from "@/src/components/states";
import { BigButton } from "@/src/components/big-button";
import { useProfile } from "@/src/features/profile/ProfileContext";

export default function CertificateScreen() {
  const { level, score } = useLocalSearchParams<{ level?: string; score?: string }>();
  const { t } = useLanguage();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile, deviceId } = useProfile();
  const styles = useStyles();

  const [cert, setCert] = useState<{ code: string; date: string } | null>(null);
  const [sharing, setSharing] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const qrRef = useRef<any>(null);

  const lvl = (Array.isArray(level) ? level[0] : level) ?? "bronze";
  const scoreNum = parseInt((Array.isArray(score) ? score[0] : score) ?? "0", 10);
  const name = profile?.name ?? "";

  // Create the certificate record on the server (for QR verification).
  useEffect(() => {
    createCertificate(deviceId, name, lvl, scoreNum)
      .then((c) => setCert({ code: c.code, date: c.date }))
      .catch(() =>
        setCert({ code: "OFFLINE", date: new Date().toLocaleDateString() }),
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!cert) return <LoadingView label={t.certGenerating} />;

  const qrData = cert.code === "OFFLINE" ? "https://cybercrime.gov.in" : verifyUrl(cert.code);

  const getQrDataUrl = (): Promise<string> =>
    new Promise((resolve) => {
      if (qrRef.current?.toDataURL) {
        qrRef.current.toDataURL((b64: string) => resolve(`data:image/png;base64,${b64}`));
      } else {
        resolve("");
      }
    });

  const share = async () => {
    if (Platform.OS === "web") {
      setNote(t.certUnavailable);
      return;
    }
    setSharing(true);
    try {
      const qrImg = await getQrDataUrl();
      const html = `
        <html><body style="font-family:sans-serif;text-align:center;padding:24px;background:#F9F8F6">
          <div style="border:6px solid #1F513F;border-radius:20px;padding:32px">
            <p style="color:#3A7D64;letter-spacing:2px;font-size:12px;margin:0">SURAKSHIT DIGITAL</p>
            <h1 style="color:#1F513F;margin:8px 0">Certificate of Achievement</h1>
            <p style="font-size:14px;color:#5A5E59">${t.certName}</p>
            <h2 style="margin:8px 0">${name}</h2>
            <p style="font-size:16px">${t.certLevelWord}: <b>${lvl}</b> &nbsp; ${t.certScoreWord}: <b>${scoreNum}%</b></p>
            <p style="color:#5A5E59">${t.certDateWord}: ${cert.date}</p>
            ${qrImg ? `<img src="${qrImg}" width="120" height="120" style="margin-top:16px"/>` : ""}
            <p style="font-size:11px;color:#747972">${t.verifiedLine} · ${cert.code}</p>
          </div>
        </body></html>`;
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: "application/pdf", dialogTitle: t.certShareText });
      } else {
        setNote(t.certUnavailable);
      }
    } catch {
      setNote(t.certUnavailable);
    } finally {
      setSharing(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.lg }]} testID="certificate-screen">
      <View style={styles.headerRow}>
        <Text style={styles.title}>{t.certTitle}</Text>
      </View>

      {/* Certificate card */}
      <View style={styles.cert} testID="certificate-card">
        <Text style={styles.brand}>SURAKSHIT DIGITAL</Text>
        <MaterialCommunityIcons name="certificate" size={44} color={colors.brandPrimary} />
        <Text style={styles.certSub}>{t.certSub}</Text>
        <Text style={styles.awardTo}>{t.certName}</Text>
        <Text style={styles.name}>{name}</Text>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>{t.certLevelWord}</Text>
            <Text style={styles.metaValue}>{lvl.charAt(0).toUpperCase() + lvl.slice(1)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>{t.certScoreWord}</Text>
            <Text style={styles.metaValue}>{scoreNum}%</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>{t.certDateWord}</Text>
            <Text style={styles.metaValue}>{cert.date}</Text>
          </View>
        </View>
        <View style={styles.qrWrap}>
          <QRCode value={qrData} size={96} getRef={(c) => (qrRef.current = c)} />
          <Text style={styles.verify}>{t.verifiedLine}</Text>
        </View>
      </View>

      <View style={{ gap: spacing.md, marginTop: spacing.xl }}>
        <BigButton label={sharing ? t.certGenerating : t.shareCert} icon="whatsapp" loading={sharing} testID="certificate-share-button" onPress={share} />
        {note ? (
          <View style={styles.note} testID="certificate-note">
            <MaterialCommunityIcons name="information" size={18} color={colors.info} />
            <Text style={styles.noteText}>{note}</Text>
          </View>
        ) : null}
        <BigButton label={t.tabHome} variant="light" icon="home" testID="certificate-home-button" onPress={() => router.replace("/home")} />
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: { flex: 1, backgroundColor: colors.surface, paddingHorizontal: spacing.lg },
  headerRow: { marginBottom: spacing.lg },
  title: { fontSize: 24, fontFamily: "PlusJakartaSans_Bold", color: colors.onSurface },
  cert: { backgroundColor: colors.surfaceSecondary, borderRadius: radius.lg, borderWidth: 3, borderColor: colors.brandPrimary, padding: spacing.xl, alignItems: "center", gap: spacing.sm },
  brand: { fontSize: 12, letterSpacing: 2, fontFamily: "Geist_SemiBold", color: colors.brandSecondary },
  certSub: { fontSize: 14, fontFamily: "Geist_Regular", color: colors.muted },
  awardTo: { fontSize: 12, fontFamily: "Geist_Regular", color: colors.muted, marginTop: spacing.sm },
  name: { fontSize: 24, fontFamily: "PlusJakartaSans_Bold", color: colors.onSurface },
  metaRow: { flexDirection: "row", gap: spacing.lg, marginTop: spacing.md },
  metaItem: { alignItems: "center" },
  metaLabel: { fontSize: 11, fontFamily: "Geist_Regular", color: colors.muted },
  metaValue: { fontSize: 15, fontFamily: "Geist_SemiBold", color: colors.onSurface },
  qrWrap: { alignItems: "center", gap: spacing.xs, marginTop: spacing.lg, backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.md },
  verify: { fontSize: 11, fontFamily: "Geist_Regular", color: colors.muted },
  note: { flexDirection: "row", alignItems: "center", gap: spacing.sm, backgroundColor: colors.surfaceSecondary, borderRadius: radius.md, padding: spacing.md },
  noteText: { flex: 1, fontSize: 13, fontFamily: "Geist_Regular", color: colors.onSurfaceSecondary },
}));
