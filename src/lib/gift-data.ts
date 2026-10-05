/**
 * Gift investments (MOB-127 / MOB-128).
 * Hydrated from GET /v1/gifts — starts empty.
 */

import { fetchGifts, fetchGift, getAccessToken } from "./api";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim());
}

/** Nigerian mobile: 11 digits starting with 0, or 10 without leading 0, or 234… */
export function normalizeNgPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("0") && /^0[789]/.test(digits)) {
    return `234${digits.slice(1)}`;
  }
  if (digits.length === 10 && /^[789]/.test(digits)) {
    return `234${digits}`;
  }
  if (digits.length === 13 && digits.startsWith("234") && /^234[789]/.test(digits)) {
    return digits;
  }
  return null;
}

/** Normalize NG phone for POST /v1/gifts (digits with 234 country code when possible). */
export function normalizeGiftPhone(raw: string): string | null {
  return normalizeNgPhone(raw);
}

/** Accept phone or email for gift recipient contact (same rules as mobile). */
export function parseGiftContact(raw: string): { phone?: string; email?: string } | null {
  const value = raw.trim();
  if (!value) return null;
  if (isValidEmail(value)) return { email: value.toLowerCase() };
  const phone = normalizeNgPhone(value);
  if (phone) return { phone };
  return null;
}

export type GiftStatus = "Pending" | "Claimed" | "Expired";

export type Gift = {
  id: string;
  recipient: string;
  phone: string;
  product: string;
  tenor: string;
  rate: string;
  amount: number;
  message: string;
  sentDate: string;
  claimedDate?: string;
  expiresDate?: string;
  status: GiftStatus;
  maturityDate: string;
  expectedPayout: number;
  claimCode?: string;
  claimLink?: string;
};

export let GIFTS: Gift[] = [];

export const getGift = (id: string) => GIFTS.find((g) => g.id === id);

export const GIFT_TABS = ["Sent", "Pending", "Claimed"] as const;
export type GiftTab = (typeof GIFT_TABS)[number];

export const giftsForTab = (tab: GiftTab) =>
  tab === "Sent" ? GIFTS : GIFTS.filter((g) => g.status === tab);

function mapGift(row: Awaited<ReturnType<typeof fetchGifts>>[number]): Gift {
  const mapped: Gift = {
    id: row.id,
    recipient: row.recipient,
    phone: row.phone,
    product: row.product,
    tenor: row.tenor,
    rate: row.rate,
    amount: row.amount,
    message: row.message,
    sentDate: row.sentDate,
    status: row.status,
    maturityDate: row.maturityDate,
    expectedPayout: row.expectedPayout,
  };
  if (row.claimedDate) mapped.claimedDate = row.claimedDate;
  if (row.expiresDate) mapped.expiresDate = row.expiresDate;
  if (row.claimCode) mapped.claimCode = row.claimCode;
  if ("claimLink" in row && typeof (row as { claimLink?: string }).claimLink === "string") {
    mapped.claimLink = (row as { claimLink: string }).claimLink;
  }
  return mapped;
}

export async function hydrateGiftsFromApi() {
  try {
    if (!getAccessToken()) {
      GIFTS = [];
      return [];
    }
    const rows = await fetchGifts();
    GIFTS = rows.map(mapGift);
    return GIFTS;
  } catch {
    GIFTS = [];
    return [];
  }
}

export async function hydrateGiftFromApi(id: string) {
  try {
    if (!getAccessToken()) return null;
    const row = await fetchGift(id);
    const mapped = mapGift(row);
    const idx = GIFTS.findIndex((g) => g.id === id);
    if (idx >= 0) GIFTS[idx] = mapped;
    else GIFTS = [...GIFTS, mapped];
    return mapped;
  } catch {
    return getGift(id) ?? null;
  }
}
