// Game + progress domain logic (levels, XP, badges, streak). Pure functions,
// so everything works offline; the server copy is just a backup.

import type { LangCode } from "@/src/types";

export const LEVELS = ["bronze", "silver", "gold", "platinum", "diamond"] as const;
export type Level = (typeof LEVELS)[number];

// XP needed to UNLOCK each level.
export const LEVEL_XP: Record<Level, number> = {
  bronze: 0,
  silver: 100,
  gold: 250,
  platinum: 500,
  diamond: 1000,
};

export const CATEGORIES = ["phishing", "upi", "job", "trading", "loan"] as const;
export type Category = (typeof CATEGORIES)[number];

export const XP_CORRECT = 10;
export const PASS_PERCENT = 70;

export interface TopicStat {
  seen: number;
  correct: number;
}

export interface Progress {
  device_id: string;
  xp: number;
  streak: number;
  last_active: string | null; // YYYY-MM-DD
  last_test_at: string | null; // ISO
  scams_identified: number;
  topics: Partial<Record<Category, TopicStat>>;
  daily: Record<string, { xp: number; correct: number; played: number }>;
  badges: string[];
}

export function emptyProgress(deviceId: string): Progress {
  return {
    device_id: deviceId,
    xp: 0,
    streak: 0,
    last_active: null,
    last_test_at: null,
    scams_identified: 0,
    topics: {},
    daily: {},
    badges: [],
  };
}

export function isLevelUnlocked(level: Level, xp: number): boolean {
  return xp >= LEVEL_XP[level];
}

export function currentLevel(xp: number): Level {
  let lvl: Level = "bronze";
  for (const l of LEVELS) if (xp >= LEVEL_XP[l]) lvl = l;
  return lvl;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

// One game answer applied to a progress snapshot (returns a NEW snapshot).
export interface GameResult {
  category: Category;
  correct: boolean;
}

export function applyGameResults(p: Progress, results: GameResult[]): Progress {
  const next: Progress = JSON.parse(JSON.stringify(p));
  const today = todayStr();

  // Daily streak: +1 if a new day, reset to 1 if a day was skipped.
  if (next.last_active !== today) {
    const yest = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    next.streak = next.last_active === yest ? next.streak + 1 : 1;
    next.last_active = today;
  }

  const day = next.daily[today] ?? { xp: 0, correct: 0, played: 0 };
  for (const r of results) {
    const topic = next.topics[r.category] ?? { seen: 0, correct: 0 };
    topic.seen += 1;
    day.played += 1;
    if (r.correct) {
      topic.correct += 1;
      next.xp += XP_CORRECT;
      next.scams_identified += 1;
      day.xp += XP_CORRECT;
      day.correct += 1;
    }
    next.topics[r.category] = topic;
  }
  next.daily[today] = day;
  next.badges = computeBadges(next);
  return next;
}

export function computeBadges(p: Progress): string[] {
  const badges = new Set(p.badges);
  if (p.scams_identified >= 1) badges.add("first-win");
  if (p.scams_identified >= 10) badges.add("scam-hunter");
  if (p.scams_identified >= 25) badges.add("scam-buster");
  if (p.streak >= 7) badges.add("week-streak");
  for (const l of LEVELS) if (isLevelUnlocked(l, p.xp)) badges.add(`level-${l}`);
  return Array.from(badges);
}

// Weakest topic = lowest accuracy among topics the user has actually seen.
export function weakestTopic(p: Progress): Category | null {
  let worst: Category | null = null;
  let worstAcc = 2;
  for (const c of CATEGORIES) {
    const s = p.topics[c];
    if (s && s.seen >= 2) {
      const acc = s.correct / s.seen;
      if (acc < worstAcc) {
        worstAcc = acc;
        worst = c;
      }
    }
  }
  return worst;
}

// Tests unlock every 2 days.
const TEST_COOLDOWN_MS = 2 * 86400000;
export function testUnlocked(p: Progress): boolean {
  if (!p.last_test_at) return true;
  return Date.now() - new Date(p.last_test_at).getTime() >= TEST_COOLDOWN_MS;
}
export function msUntilTest(p: Progress): number {
  if (!p.last_test_at) return 0;
  return Math.max(0, TEST_COOLDOWN_MS - (Date.now() - new Date(p.last_test_at).getTime()));
}

// Map a weak category to a lesson category (Phase 1 lessons use these keys).
export function categoryToLessonCat(c: Category): string {
  const map: Record<Category, string> = {
    phishing: "otp",
    upi: "upi",
    job: "job",
    trading: "social",
    loan: "job",
  };
  return map[c];
}

// Badge labels (localized).
export function badgeLabel(id: string, lang: LangCode): string {
  const L: Record<string, Record<LangCode, string>> = {
    "first-win": { en: "First Win", hi: "पहली जीत", mr: "पहिली जीत", gu: "પ્રથમ જીત" },
    "scam-hunter": { en: "Scam Hunter", hi: "स्कैम हंटर", mr: "स्कॅम हंटर", gu: "સ્કેમ હન્ટર" },
    "scam-buster": { en: "Scam Buster", hi: "स्कैम बस्टर", mr: "स्कॅम बस्टर", gu: "સ્કેમ બસ્ટર" },
    "week-streak": { en: "7-Day Streak", hi: "7 दिन स्ट्रीक", mr: "7 दिवस स्ट्रीक", gu: "7 દિવસ સ્ટ્રીક" },
    "level-bronze": { en: "Bronze", hi: "ब्रॉन्ज़", mr: "ब्रॉन्झ", gu: "બ્રોન્ઝ" },
    "level-silver": { en: "Silver", hi: "सिल्वर", mr: "सिल्व्हर", gu: "સિલ્વર" },
    "level-gold": { en: "Gold", hi: "गोल्ड", mr: "गोल्ड", gu: "ગોલ્ડ" },
    "level-platinum": { en: "Platinum", hi: "प्लैटिनम", mr: "प्लॅटिनम", gu: "પ્લેટિનમ" },
    "level-diamond": { en: "Diamond", hi: "डायमंड", mr: "डायमंड", gu: "ડાયમંડ" },
  };
  return L[id]?.[lang] ?? id;
}
