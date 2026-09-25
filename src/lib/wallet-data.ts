/**
 * Wallet funding (MOB-030 – MOB-035).
 * Virtual account + cards hydrate from kipit-api when a session exists.
 * No fixture VA or saved cards — empty until API responds.
 */

import { fetchSavedCards, fetchVirtualAccount, isAuthenticated } from "@/lib/api";

export const MIN_DEPOSIT = 1_000;
export const MAX_CARD_DEPOSIT = 1_000_000;
export const CARD_FEE_RATE = 0.015;

export const QUICK_DEPOSITS = [50_000, 100_000, 250_000];

export type VirtualAccount = {
  bank: string;
  accountNumber: string;
  accountName: string;
};

/** Dedicated (virtual) account — empty until Monnify/API hydrate succeeds. */
export let VIRTUAL_ACCOUNT: VirtualAccount = {
  bank: "",
  accountNumber: "",
  accountName: "",
};

export type SavedCard = {
  id: string;
  brand: "Visa" | "Mastercard" | "Verve" | string;
  last4: string;
  expiry: string;
  bank: string;
};

export let SAVED_CARDS: SavedCard[] = [];

export type DepositMethod = "transfer" | "card";

export const cardFee = (amount: number) => Math.round(amount * CARD_FEE_RATE);

export const depositReference = (amount: number) =>
  `KPT-DP-${(100000 + (amount % 899999)).toString().slice(0, 6)}`;

/** Card decline copy for failed payment outcomes. */
export const CARD_DECLINE_REASONS: Record<string, string> = {
  insufficient: "Your bank declined the payment — insufficient funds on the card.",
  limit: "This card has exceeded its online transaction limit for today.",
  auth: "The OTP or 3-D Secure check was not completed in time.",
};

export function clearWalletFundingFixtures() {
  VIRTUAL_ACCOUNT = { bank: "", accountNumber: "", accountName: "" };
  SAVED_CARDS = [];
}

export async function hydrateWalletFundingFromApi() {
  if (!isAuthenticated()) {
    clearWalletFundingFixtures();
    return false;
  }
  try {
    const va = await fetchVirtualAccount();
    VIRTUAL_ACCOUNT = {
      bank: va.bank,
      accountNumber: va.accountNumber,
      accountName: va.accountName,
    };
    const cards = await fetchSavedCards();
    SAVED_CARDS = cards.map((c) => ({
      id: c.id,
      brand: c.brand,
      last4: c.last4,
      expiry: "—",
      bank: c.bank,
    }));
    return true;
  } catch {
    clearWalletFundingFixtures();
    return false;
  }
}
