"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SavedState {
  ids: string[];
  toggle: (id: string) => void;
  isSaved: (id: string) => boolean;
}

export const useSavedStore = create<SavedState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) =>
        set((state) => ({
          ids: state.ids.includes(id)
            ? state.ids.filter((x) => x !== id)
            : [...state.ids, id],
        })),
      isSaved: (id) => get().ids.includes(id),
    }),
    { name: "unimart-saved", skipHydration: true }
  )
);
