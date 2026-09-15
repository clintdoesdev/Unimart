"use client";

import { useEffect } from "react";
import { useSessionStore } from "./session";

export function StoreHydrator() {
  useEffect(() => {
    useSessionStore.getState().init();
  }, []);

  return null;
}
