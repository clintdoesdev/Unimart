"use client";

import { useEffect } from "react";
import { useSessionStore } from "./session";
import { useCartStore } from "./cart";
import { useSavedStore } from "./saved";
import { useChatStore } from "./chat";
import { useOrdersStore } from "./orders";
import { useSellingStore } from "./selling";
import { useWalletStore } from "./wallet";
import { useNotificationsStore } from "./notifications";
import { useHydrationStore } from "./hydration";

export function StoreHydrator() {
  useEffect(() => {
    Promise.all([
      useSessionStore.persist.rehydrate(),
      useCartStore.persist.rehydrate(),
      useSavedStore.persist.rehydrate(),
      useChatStore.persist.rehydrate(),
      useOrdersStore.persist.rehydrate(),
      useSellingStore.persist.rehydrate(),
      useWalletStore.persist.rehydrate(),
      useNotificationsStore.persist.rehydrate(),
    ]).finally(() => {
      useHydrationStore.getState().setHydrated();
    });
  }, []);

  return null;
}
