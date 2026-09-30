// ProgressProvider — holds the game progress snapshot. Offline-first:
// all changes apply locally + cache instantly, then best-effort sync to server.

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { storage } from "@/src/utils/storage";
import { useProfile } from "@/src/features/profile/ProfileContext";
import {
  applyGameResults,
  emptyProgress,
  GameResult,
  Progress,
} from "@/src/features/game/progress";

const KEY = "surakshit.progress";

interface Ctx {
  progress: Progress;
  addGameResults: (r: GameResult[]) => void;
  markTestTaken: () => void;
  setProgress: (p: Progress) => void;
}

const ProgressContext = createContext<Ctx>({
  progress: emptyProgress(""),
  addGameResults: () => {},
  markTestTaken: () => {},
  setProgress: () => {},
});

async function syncToServer(p: Progress) {
  try {
    await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/progress`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(p),
    });
  } catch {
    /* offline — the local cache keeps the truth; we retry next change */
  }
}

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const { deviceId, ready } = useProfile();
  const [progress, setProgressState] = useState<Progress>(emptyProgress(""));

  useEffect(() => {
    if (!ready || !deviceId) return;
    (async () => {
      const cached = await storage.getItem<string>(KEY, "");
      if (cached) {
        try {
          setProgressState(JSON.parse(cached) as Progress);
          return;
        } catch {
          /* fall through */
        }
      }
      setProgressState(emptyProgress(deviceId));
    })();
  }, [ready, deviceId]);

  const persist = (p: Progress) => {
    setProgressState(p);
    storage.setItem(KEY, JSON.stringify(p));
    syncToServer(p);
  };

  const addGameResults = (r: GameResult[]) => {
    persist(applyGameResults({ ...progress, device_id: deviceId }, r));
  };

  const markTestTaken = () => {
    persist({ ...progress, device_id: deviceId, last_test_at: new Date().toISOString() });
  };

  const setProgress = (p: Progress) => persist({ ...p, device_id: deviceId });

  const value = useMemo(
    () => ({ progress, addGameResults, markTestTaken, setProgress }),
    [progress, deviceId],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  return useContext(ProgressContext);
}
