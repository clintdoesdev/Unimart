import "server-only";

const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

export function randomPickupCode(): string {
  let code = "";
  for (let i = 0; i < 4; i++) code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return code;
}

export function randomOrderNumber(): string {
  return `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
}

export const HANDOVER_COST: Record<"LOCKER" | "MEET" | "DELIVER", number> = {
  LOCKER: 0,
  MEET: 0,
  DELIVER: 30,
};

export const PROMO_CODE = "STUDENT50";
export const PROMO_DISCOUNT = 50;
