/**
 * Wallet funding fixtures (MOB-030 – MOB-035).
 * Deposit methods, dedicated virtual account and card fixtures.
 */

export const MIN_DEPOSIT = 1_000;
export const MAX_CARD_DEPOSIT = 1_000_000;
export const CARD_FEE_RATE = 0.015;

export const QUICK_DEPOSITS = [50_000, 100_000, 250_000];

/** Dedicated (virtual) account issued to every Kipit user. */
export const VIRTUAL_ACCOUNT = {
  bank: "Providus Bank",
  accountNumber: "9901234567",
  accountName: "KIPIT / ADEBAYO O. ILESANMI",
};

export type SavedCard = {
  id: string;
  brand: "Visa" | "Mastercard" | "Verve";
  last4: string;
  expiry: string;
  bank: string;
};

export const SAVED_CARDS: SavedCard[] = [
  { id: "c1", brand: "Visa", last4: "4821", expiry: "09/28", bank: "GTBank" },
  { id: "c2", brand: "Mastercard", last4: "7734", expiry: "03/27", bank: "Zenith Bank" },
];

export type DepositMethod = "transfer" | "card";

export const cardFee = (amount: number) => Math.round(amount * CARD_FEE_RATE);

export const depositReference = (amount: number) =>
  `KPT-DP-${(100000 + (amount % 899999)).toString().slice(0, 6)}`;

/** Card outcome fixtures for the prototype (MOB-035). */
export const CARD_DECLINE_REASONS: Record<string, string> = {
  insufficient: "Your bank declined the payment — insufficient funds on the card.",
  limit: "This card has exceeded its online transaction limit for today.",
  auth: "The OTP or 3-D Secure check was not completed in time.",
};
