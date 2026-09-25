/**
 * Withdrawal flow data (MOB-100 → MOB-111).
 * Payout accounts + banks hydrate from kipit-api /v1/withdraw.
 */

import {
  createPayoutAccount,
  fetchPayoutAccounts,
  fetchPayoutBanks,
  isAuthenticated,
} from "@/lib/api";

export type PayoutAccount = {
  id: string;
  accountName: string;
  bank: string;
  bankCode: string;
  accountNumber: string;
  primary?: boolean;
};

export type PayoutBank = { code: string; name: string };

/** Hydrated from GET /v1/withdraw/banks — starts empty. */
export let BANKS: PayoutBank[] = [];

/** Hydrated from GET /v1/withdraw/accounts — starts empty (no fixtures). */
export let SAVED_ACCOUNTS: PayoutAccount[] = [];

/** KYC tier context — Tier 1 users cannot submit withdrawals. */
export const TIER = {
  level: 2 as 1 | 2 | 3,
  label: "Tier 2 verified",
  eligible: true,
  dailyLimit: 5_000_000,
  singleLimit: 2_000_000,
};

export const WITHDRAWAL_FEE = 0;
export const MIN_WITHDRAWAL = 1_000;

export const maskAccount = (number: string) =>
  number.length >= 6
    ? `${number.slice(0, 3)}••••${number.slice(-3)}`
    : number;

export const findAccount = (id: string): PayoutAccount | undefined =>
  SAVED_ACCOUNTS.find((a) => a.id === id);

export const withdrawalReference = (amount: number) =>
  `KPT-WD-${String(Math.abs(Math.round(amount)) % 100000).padStart(5, "0")}`;

export const payoutEta = "Within 5 minutes · NIP instant transfer";

function mapAccount(row: {
  id: string;
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
}, index: number): PayoutAccount {
  return {
    id: row.id,
    accountName: row.accountName,
    bank: row.bankName,
    bankCode: row.bankCode,
    accountNumber: row.accountNumber,
    primary: index === 0,
  };
}

/** Load banks + saved payout accounts from the API. Clears fixtures when empty. */
export async function hydratePayoutFromApi(): Promise<PayoutAccount[]> {
  if (!isAuthenticated()) {
    BANKS = [];
    SAVED_ACCOUNTS = [];
    return [];
  }
  try {
    const [banks, accounts] = await Promise.all([
      fetchPayoutBanks(),
      fetchPayoutAccounts(),
    ]);
    BANKS = banks.map((b) => ({ code: b.code, name: b.name }));
    SAVED_ACCOUNTS = accounts.map(mapAccount);
    return SAVED_ACCOUNTS;
  } catch {
    BANKS = [];
    SAVED_ACCOUNTS = [];
    return [];
  }
}

/** Create a payout account via API and append to the local cache. */
export async function addPayoutAccount(bankCode: string, accountNumber: string) {
  const created = await createPayoutAccount({ bankCode, accountNumber });
  const account: PayoutAccount = {
    id: created.id,
    accountName: created.accountName,
    bank: created.bankName,
    bankCode,
    accountNumber: created.accountNumber,
    primary: SAVED_ACCOUNTS.length === 0,
  };
  const existing = SAVED_ACCOUNTS.find((a) => a.id === account.id);
  if (!existing) SAVED_ACCOUNTS = [...SAVED_ACCOUNTS, account];
  return account;
}
