"use client";

import { create } from "zustand";
import { apiGet, apiPatch, apiPost } from "@/lib/api";
import type { Profile, VendorInfo } from "@/lib/types";

export type AccountStatus = "guest" | "unverified" | "verified";

interface MeResponse {
  user: Profile | null;
  vendor?: VendorInfo | null;
}

interface SessionState {
  status: AccountStatus;
  profile: Profile | null;
  vendor: VendorInfo | null;
  interests: string[];
  hydrated: boolean;
  init: () => Promise<void>;
  refresh: () => Promise<void>;
  signUp: (input: { fullName: string; email: string; campus: string; password: string }) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  verifyOtp: (email: string, code: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  setInterests: (ids: string[]) => Promise<void>;
  logout: () => Promise<void>;
}

function deriveStatus(user: Profile | null): AccountStatus {
  if (!user) return "guest";
  return user.emailVerifiedAt ? "verified" : "unverified";
}

export const useSessionStore = create<SessionState>()((set, get) => ({
  status: "guest",
  profile: null,
  vendor: null,
  interests: [],
  hydrated: false,

  init: async () => {
    await get().refresh();
    set({ hydrated: true });
  },

  refresh: async () => {
    const { user, vendor } = await apiGet<MeResponse>("/api/auth/me");
    set({
      status: deriveStatus(user),
      profile: user,
      vendor: vendor ?? null,
      interests: user?.interests ?? [],
    });
  },

  signUp: async (input) => {
    await apiPost("/api/auth/signup", input);
  },

  login: async (email, password) => {
    await apiPost("/api/auth/login", { email, password });
    await get().refresh();
  },

  verifyOtp: async (email, code) => {
    await apiPost("/api/auth/verify-otp", { email, code });
    await get().refresh();
  },

  resendOtp: async (email) => {
    await apiPost("/api/auth/resend-otp", { email });
  },

  setInterests: async (ids) => {
    set({ interests: ids });
    await apiPatch("/api/auth/interests", { interests: ids });
  },

  logout: async () => {
    await apiPost("/api/auth/logout");
    set({ status: "guest", profile: null, vendor: null, interests: [] });
  },
}));
