// smsScanner — Android-only incoming-SMS red-flag scanner.
//
// IMPORTANT: this needs a real Android BUILD (development or production).
// It CANNOT run in Expo Go or on iOS/web:
//   - Apple blocks apps from reading SMS entirely.
//   - Android needs the RECEIVE_SMS / READ_SMS permissions + native code.
// So every native call is wrapped in try/catch and the module is loaded with
// require() at call time — in Expo Go these simply report "not available"
// instead of crashing the app.
//
// When active: each incoming SMS is run through the SAME offline scam engine.
// If it looks Suspicious or Scam, we raise a local red-flag notification.

import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { analyzeOffline } from "@/src/features/scamCheck/engine";
import type { LangCode } from "@/src/types";

export type SmsStatus =
  | "unsupported" // iOS / web / Expo Go
  | "denied" // user said no
  | "active"; // listening

// Show notifications even while the app is in the foreground.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Try to load the native SMS module. Returns null in Expo Go / iOS / web.
function loadSmsModule(): any | null {
  if (Platform.OS !== "android") return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("@maniac-tech/react-native-expo-read-sms");
  } catch {
    return null;
  }
}

export function isSmsSupported(): boolean {
  return loadSmsModule() !== null;
}

async function ensureNotificationPermission(): Promise<boolean> {
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    const req = await Notifications.requestPermissionsAsync();
    return req.granted;
  } catch {
    return false;
  }
}

async function raiseFlag(title: string, body: string) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: null, // now
    });
  } catch {
    /* best effort */
  }
}

/**
 * Ask permission and start listening. Returns the resulting status.
 * `flagTitle` is the localized notification title to show on a red flag.
 */
export async function startSmsScan(
  lang: LangCode,
  flagTitle: string,
): Promise<SmsStatus> {
  const sms = loadSmsModule();
  if (!sms) return "unsupported";

  await ensureNotificationPermission();

  // The library exposes requestReadSMSPermission + startReadSMS.
  try {
    const granted: boolean = await sms.requestReadSMSPermission();
    if (!granted) return "denied";

    sms.startReadSMS(
      (rawStatus: string, sms1?: string, sms2?: string) => {
        // The library returns the message text in one of the callback args.
        const message = String(sms2 ?? sms1 ?? rawStatus ?? "");
        if (!message) return;
        const result = analyzeOffline(message, lang);
        if (result.verdict !== "safe") {
          raiseFlag(flagTitle, result.reason);
        }
      },
      (_err: string) => {
        /* listener error — ignore, do not crash */
      },
    );
    return "active";
  } catch {
    return "denied";
  }
}
