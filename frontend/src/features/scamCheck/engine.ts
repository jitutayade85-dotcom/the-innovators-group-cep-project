// Offline, rule-based scam checker.
// Works with NO internet: it scans the message for danger keywords + patterns
// kept in patterns.json (one block per language). This is the first line of
// defence; the online AI check is a second opinion when the phone is online.
//
// We NEVER say "100% scam" — the worst verdict is "high risk, be careful".

import patterns from "./patterns.json";
import type { LangCode, ScamVerdict } from "@/src/types";

export interface OfflineResult {
  verdict: ScamVerdict; // safe | suspicious | scam
  reason: string; // one short line in the user's language
}

type Weight = "high" | "medium";
interface Signal {
  id: string;
  weight: Weight;
  reason: string;
  keywords: string[];
}
interface LangPack {
  signals: Signal[];
  urgency: string[];
  safeReason: string;
  suspiciousReason: string;
  scamReason: string;
  linkReason: string;
}

// URL shorteners are a big red flag in scam SMS.
const SHORTENER =
  /\b(bit\.ly|tinyurl|t\.co|is\.gd|goo\.gl|rebrand\.ly|cutt\.ly|rb\.gy|shorturl|ow\.ly|buff\.ly|wa\.me)\b/i;
const ANY_LINK = /(https?:\/\/|www\.)\S+/i;

export function analyzeOffline(text: string, lang: LangCode): OfflineResult {
  const packs = patterns as unknown as Record<string, LangPack>;
  const pack = packs[lang] ?? packs.en;
  const t = text.toLowerCase();

  const matched: Signal[] = [];
  let highHits = 0;
  let medHits = 0;

  for (const signal of pack.signals) {
    if (signal.keywords.some((kw) => t.includes(kw.toLowerCase()))) {
      matched.push(signal);
      if (signal.weight === "high") highHits += 1;
      else medHits += 1;
    }
  }

  const urgency = pack.urgency.some((w) => t.includes(w.toLowerCase()));
  const shortLink = SHORTENER.test(text);
  const hasLink = ANY_LINK.test(text);

  // Decide the verdict from the strongest signals.
  let verdict: ScamVerdict = "safe";
  if (highHits >= 1 || shortLink || (hasLink && urgency) || (medHits >= 1 && urgency)) {
    verdict = "scam";
  } else if (medHits >= 1 || urgency || hasLink) {
    verdict = "suspicious";
  }

  // Pick a clear, localized reason.
  const firstHigh = matched.find((m) => m.weight === "high");
  let reason: string;
  if (verdict === "scam") {
    reason = firstHigh?.reason ?? (shortLink || hasLink ? pack.linkReason : pack.scamReason);
  } else if (verdict === "suspicious") {
    reason = matched[0]?.reason ?? (hasLink ? pack.linkReason : pack.suspiciousReason);
  } else {
    reason = pack.safeReason;
  }

  return { verdict, reason };
}
