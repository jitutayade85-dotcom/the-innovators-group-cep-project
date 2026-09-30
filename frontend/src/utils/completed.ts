// completed.ts — which lessons the user finished (offline, on-device).
// Used to show a "Done" badge on lesson cards.

import { useEffect, useState } from "react";
import { storage } from "@/src/utils/storage";

const STORAGE_KEY = "surakshit.completedLessons";

export function useCompletedLessons() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    storage.getItem(STORAGE_KEY, "").then((raw) => {
      if (raw) {
        try {
          setIds(JSON.parse(raw) as string[]);
        } catch {
          setIds([]);
        }
      }
    });
  }, []);

  const markCompleted = (id: string) => {
    setIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      storage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  return { completedIds: ids, markCompleted };
}
