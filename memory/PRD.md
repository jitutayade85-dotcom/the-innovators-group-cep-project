# Surakshit Digital — PRD

## Original Problem Statement
Build "Surakshit Digital", a cyber-safety awareness app for rural youth in India.
Low-end phones, low literacy → simple UI, big icons, less text, offline-friendly.
Languages: Marathi, Hindi, English, Gujarati (never hardcode text). No API keys in
the app (all AI runs on the server). User asked for Flutter+Firebase but agreed to
build on this platform's stack.

## Architecture (as built)
- **Frontend:** Expo (React Native), expo-router file-based routing, @tanstack/react-query,
  react-native-keyboard-controller, expo-image, expo-image-picker, expo-notifications,
  @react-native-vector-icons/material-design-icons. Theme in `src/theme.ts`
  (Material You Expressive Light, botanical green). Fonts: Plus Jakarta Sans + Geist.
- **Backend:** FastAPI (`/api` prefix) + MongoDB (motor). AI via emergentintegrations
  (`gpt-5.4-mini`) using EMERGENT_LLM_KEY (server-side only). Photos via Emergent
  Object Storage.
- **i18n:** `src/i18n/` — en/hi/mr/gu dictionaries + LanguageProvider (persisted).
  English default with in-app switcher. Content localized in the DB too.
- **Offline:** every GET cached in device storage; scam quick-check runs fully offline.

## User Personas
- Rural youth, first-time smartphone users, low digital literacy, patchy connectivity.
- Prefer their own language; scared/confused by scam SMS, UPI/OTP fraud, fake jobs.

## Core Requirements (static)
- 4 languages, big touch targets (≥56pt), minimal text, offline-friendly.
- No secrets in the app; AI on server. Never say "100% scam" (max = "high risk").

## Implemented (with dates)
### 2026-06 — MVP
- Home, Learn (lessons + quiz + Done badge), Check (AI scam checker), Alerts feed,
  Helplines. 4-language switcher. Offline caching. Backend seeded content
  (6 lessons, 5 alerts, 5 helplines). AI `/api/check-scam` returns verdict+confidence+tips.
- Fixed: theme setColorScheme crash, missing useStyles, prompt `.format` KeyError,
  Mongo `_id`→`id` (response_model_by_alias=False), language sheet safe-area overflow.

### 2026-06 — Phase 1
- First-launch **language selection** screen + onboarding gate (`app/index.tsx`).
- **Profile** (name required; age/place/photo/language optional) saved to backend
  (keyed by anonymous device_id) + cached locally; photo via Object Storage
  (`/api/upload`, `/api/files/{path}`).
- New **Home** with 5 big tiles: Scam Check, Learn & Play, SOS Help, My Progress
  (Coming soon), Tests (Coming soon).
- **Scam Check** upgraded: offline rule-based quick check (per-language keyword
  patterns in `patterns.json`) shown instantly, then AI second opinion when online.
- **Settings**: language switcher, edit profile, Android SMS-scan toggle with a
  plain-words permission explanation.
- **SOS** screen: step-by-step checklist, one-tap 1930, cybercrime.gov.in, helplines.
- **Android SMS red-flag scanner** (`smsScanner.ts`): gated — build-only; on
  web/Expo Go it safely reports "needs installed Android app".
- Verified: backend 10/10 pytest, frontend all flows green (iteration_4.json).

## Backlog (prioritized)
- **P0:** none open.
- **P1:** OTP / Firebase phone login (needs user's Firebase config + native build);
  My Progress screen (lessons completed, streak); Tests (multi-question mock tests).
- **P2:** narrated/audio lessons (TTS), share safety tips as image, more scam
  patterns + regional scam feed, dark mode.

## Native-build-only (cannot test in Expo Go)
- Android incoming-SMS scanning + local red-flag notifications.
- Any future Firebase phone OTP.

## Next Tasks
- Build My Progress + Tests screens (replace the two "Coming soon" tiles).
- On user request: wire Firebase phone OTP and generate an Android build for SMS scan.
