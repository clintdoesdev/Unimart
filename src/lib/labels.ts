import type { Condition, HandoverMethod } from "./types";

export const CAMPUSES = ["North Campus", "South Campus", "Riverside Campus", "Tech Park Campus"];

export function conditionLabel(c: Condition): string {
  return { NEW: "New", LIKE_NEW: "Like new", GOOD: "Good", FAIR: "Fair" }[c];
}

export function handoverLabel(h: HandoverMethod): string {
  return { LOCKER: "Campus pickup point", MEET: "Meet the seller", DELIVER: "Hostel delivery" }[h];
}

export function statusLabel(s: string): string {
  return s.replace(/_/g, " ");
}
