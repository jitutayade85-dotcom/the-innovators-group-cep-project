// Shared API types matching the backend models (see /app/backend/models.py).
// Field names here must match the JSON the backend sends.

export type LangCode = "en" | "hi" | "mr" | "gu";

// Localized text object: { en: "...", hi: "...", mr: "...", gu: "..." }
export type Localized = Record<LangCode, string>;

export interface LessonStep {
  text: Localized;
}

export interface QuizQuestion {
  question: Localized;
  options: Localized[];
  correct_index: number;
}

export interface Lesson {
  id: string;
  title: Localized;
  summary: Localized;
  icon: string;
  category: string; // otp | upi | whatsapp | password | social | job
  minutes: number;
  order: number;
  steps: LessonStep[];
  quiz: QuizQuestion;
}

export interface Alert {
  id: string;
  severity: "high" | "medium" | "low";
  title: Localized;
  description: Localized;
  published_at: string; // ISO date string
}

export interface Helpline {
  id: string;
  name: Localized;
  description: Localized;
  type: "phone" | "web";
  number: string | null;
  url: string | null;
  order: number;
}

export type ScamVerdict = "safe" | "suspicious" | "scam";

export interface ScamCheckResult {
  verdict: ScamVerdict;
  confidence: number;
  tips: string[];
}

export interface Profile {
  id?: string;
  device_id: string;
  name: string;
  lang: LangCode;
  age?: number | null;
  place?: string | null;
  photo_path?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ProfileInput {
  device_id: string;
  name: string;
  lang: LangCode;
  age?: number | null;
  place?: string | null;
  photo_path?: string | null;
}

export interface GameItem {
  id: string;
  type: "sms" | "whatsapp" | "call" | "website";
  level: string;
  category: string;
  is_scam: boolean;
  sender: string;
  body: Localized;
  explanation: Localized;
  order: number;
}

export interface TestQuestion {
  id: string;
  level: string;
  category: string;
  question: Localized;
  options: Localized[];
  correct_index: number;
  explanation: Localized;
  order: number;
}
