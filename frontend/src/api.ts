// api.ts — all backend calls live here.
// OFFLINE RULE: every GET is saved to local storage. If the network fails
// (rural connectivity!), we return the last saved copy instead of crashing.

import { storage } from "@/src/utils/storage";
import type { Alert, Helpline, LangCode, Lesson, ScamCheckResult } from "./types";

// EXPO_PUBLIC_BACKEND_URL comes from frontend/.env (never hardcode URLs).
const BASE_URL = `${process.env.EXPO_PUBLIC_BACKEND_URL}/api`;

const TIMEOUT_MS = 20000;

// GET with offline cache. `cacheKey` must be unique per endpoint.
export async function apiGet<T>(path: string, cacheKey: string): Promise<T> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const res = await fetch(`${BASE_URL}${path}`, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as T;
    // storage stores strings/numbers/bools — arrays and objects are
    // serialized to a string here and parsed back on cache hits.
    await storage.setItem(cacheKey, JSON.stringify(data));
    return data;
  } catch (err) {
    // Network failed — try the offline copy saved from a previous session.
    const cached = await storage.getItem(cacheKey, null);
    if (cached) return JSON.parse(cached) as T;
    throw err;
  }
}

export const fetchLessons = () => apiGet<Lesson[]>("/lessons", "cache.lessons");

export const fetchLesson = (id: string) =>
  apiGet<Lesson>(`/lessons/${id}`, `cache.lesson.${id}`);

export const fetchAlerts = () => apiGet<Alert[]>("/alerts", "cache.alerts");

export const fetchHelplines = () => apiGet<Helpline[]>("/helplines", "cache.helplines");

// POST for the AI scam checker (no caching — each check is live).
export async function checkScam(text: string, lang: LangCode): Promise<ScamCheckResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45000); // AI needs a bit more time
  try {
    const res = await fetch(`${BASE_URL}/check-scam`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, lang }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as ScamCheckResult;
  } finally {
    clearTimeout(timer);
  }
}
