// api.ts — all backend calls live here.
// OFFLINE RULE: every GET is saved to local storage. If the network fails
// (rural connectivity!), we return the last saved copy instead of crashing.

import { Platform } from "react-native";
import { storage } from "@/src/utils/storage";
import type {
  Alert,
  Helpline,
  LangCode,
  Lesson,
  Profile,
  ProfileInput,
  ScamCheckResult,
} from "./types";

// EXPO_PUBLIC_BACKEND_URL comes from frontend/.env (never hardcode URLs).
const ROOT_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
const BASE_URL = `${ROOT_URL}/api`;

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

export const fetchGameItems = () =>
  apiGet<import("./types").GameItem[]>("/game-items", "cache.gameItems");

export const fetchTestQuestions = () =>
  apiGet<import("./types").TestQuestion[]>("/test-questions", "cache.testQuestions");

export async function createCertificate(
  deviceId: string,
  name: string,
  level: string,
  score: number,
): Promise<{ code: string; date: string; verify_url: string }> {
  const res = await fetch(`${BASE_URL}/certificate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ device_id: deviceId, name, level, score }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export function verifyUrl(code: string): string {
  return `${ROOT_URL}/api/verify/${code}`;
}

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

// --- Profile ---
export async function fetchProfile(deviceId: string): Promise<Profile> {
  const res = await fetch(`${BASE_URL}/profile/${deviceId}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as Profile;
}

export async function saveProfile(body: ProfileInput): Promise<Profile> {
  const res = await fetch(`${BASE_URL}/profile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as Profile;
}

// Upload a profile photo (multipart). Native and web need different body shapes.
export async function uploadPhoto(
  deviceId: string,
  uri: string,
): Promise<{ path: string; url: string }> {
  const form = new FormData();
  form.append("device_id", deviceId);
  const name = `photo-${Date.now()}.jpg`;
  if (Platform.OS === "web") {
    const blob = await (await fetch(uri)).blob();
    form.append("file", blob, name);
  } else {
    // React Native multipart file shape
    form.append("file", { uri, name, type: "image/jpeg" } as any);
  }
  const res = await fetch(`${BASE_URL}/upload`, { method: "POST", body: form });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as { path: string; url: string };
}

// Build a full URL to display a stored photo.
export function fileUrl(path: string): string {
  return `${ROOT_URL}/api/files/${path}`;
}
