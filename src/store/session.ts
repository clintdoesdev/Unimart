"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AccountStatus = "guest" | "unverified" | "verified";

export interface Profile {
  fullName: string;
  email: string;
  campus: string;
  course: string;
  year: number;
}

interface SessionState {
  status: AccountStatus;
  profile: Profile | null;
  interests: string[];
  otpDigits: string;
  signUp: (profile: Omit<Profile, "course" | "year">) => void;
  verify: () => void;
  setInterests: (ids: string[]) => void;
  logout: () => void;
  isAuthed: () => boolean;
}

const DEFAULT_PROFILE: Profile = {
  fullName: "Rohan M.",
  email: "rohan.m@university.edu",
  campus: "North Campus",
  course: "CSE",
  year: 3,
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      status: "guest",
      profile: null,
      interests: [],
      otpDigits: "",
      signUp: (profile) =>
        set({
          status: "unverified",
          profile: { ...DEFAULT_PROFILE, ...profile },
        }),
      verify: () => set({ status: "verified" }),
      setInterests: (ids) => set({ interests: ids }),
      logout: () => set({ status: "guest", profile: null, interests: [] }),
      isAuthed: () => get().status === "verified",
    }),
    { name: "unimart-session", skipHydration: true }
  )
);
