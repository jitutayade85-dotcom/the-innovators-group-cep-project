// ProfileProvider — holds the user's profile and onboarding state.
// No login yet: we identify the phone with a random device_id kept on device.
// Everything is cached locally so the app opens instantly and works offline.

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { storage } from "@/src/utils/storage";
import { fetchProfile, saveProfile as saveProfileApi } from "@/src/api";
import type { Profile, ProfileInput } from "@/src/types";

const DEVICE_KEY = "surakshit.deviceId";
const PROFILE_KEY = "surakshit.profile";
const LANG_CHOSEN_KEY = "surakshit.langChosen";

function makeDeviceId() {
  return `dev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

interface ProfileContextValue {
  ready: boolean;
  deviceId: string;
  profile: Profile | null;
  langChosen: boolean;
  markLangChosen: () => void;
  saveProfile: (data: Omit<ProfileInput, "device_id">) => Promise<Profile>;
}

const ProfileContext = createContext<ProfileContextValue>({
  ready: false,
  deviceId: "",
  profile: null,
  langChosen: false,
  markLangChosen: () => {},
  saveProfile: async () => {
    throw new Error("not ready");
  },
});

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [deviceId, setDeviceId] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [langChosen, setLangChosen] = useState(false);

  useEffect(() => {
    (async () => {
      // 1. Ensure a stable device id.
      const existing = await storage.getItem<string>(DEVICE_KEY, "");
      let id = existing || "";
      if (!id) {
        id = makeDeviceId();
        await storage.setItem(DEVICE_KEY, id);
      }
      setDeviceId(id);

      // 2. Load the language-chosen flag.
      const chosen = await storage.getItem(LANG_CHOSEN_KEY, false);
      setLangChosen(!!chosen);

      // 3. Load the cached profile first (instant / offline), then refresh.
      const cached = await storage.getItem<string>(PROFILE_KEY, "");
      if (cached) {
        try {
          setProfile(JSON.parse(cached) as Profile);
        } catch {
          /* ignore corrupt cache */
        }
      }
      try {
        const fresh = await fetchProfile(id);
        setProfile(fresh);
        await storage.setItem(PROFILE_KEY, JSON.stringify(fresh));
      } catch {
        /* offline or no server profile yet — keep the cache */
      }

      setReady(true);
    })();
  }, []);

  const markLangChosen = () => {
    setLangChosen(true);
    storage.setItem(LANG_CHOSEN_KEY, true);
  };

  const saveProfile = async (data: Omit<ProfileInput, "device_id">) => {
    const body: ProfileInput = { ...data, device_id: deviceId };
    let saved: Profile;
    try {
      saved = await saveProfileApi(body);
    } catch {
      // Offline: keep a local-only profile so the app still works.
      saved = { ...body } as Profile;
    }
    setProfile(saved);
    await storage.setItem(PROFILE_KEY, JSON.stringify(saved));
    return saved;
  };

  const value = useMemo(
    () => ({ ready, deviceId, profile, langChosen, markLangChosen, saveProfile }),
    [ready, deviceId, profile, langChosen],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  return useContext(ProfileContext);
}
