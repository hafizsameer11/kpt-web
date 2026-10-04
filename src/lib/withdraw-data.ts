/**
 * Withdrawal flow data (MOB-100 → MOB-111).
 * Payout accounts + banks hydrate from kipit-api /v1/withdraw.
 */

import {
  createPayoutAccount,
  deletePayoutAccount,
  fetchPayoutAccounts,
  fetchPayoutBanks,
  isAuthenticated,
  resolvePayoutAccount,
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

export type ResolvedPayoutAccount = {
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  nameMatched: boolean;
};

/** Resolve + name-match without creating a server row. */
export async function resolvePayoutAccountViaApi(
  bankCode: string,
  accountNumber: string,
): Promise<ResolvedPayoutAccount> {
  const resolved = await resolvePayoutAccount({ bankCode, accountNumber });
  return {
    bankCode: resolved.bankCode || bankCode,
    bankName: resolved.bankName,
    accountNumber: resolved.accountNumber,
    accountName: resolved.accountName,
    nameMatched: resolved.nameMatched,
  };
}

/** Create a payout account via API and append to the local cache. */
export async function addPayoutAccount(
  bankCode: string,
  accountNumber: string,
  opts?: { commitLocal?: boolean },
) {
  const created = await createPayoutAccount({ bankCode, accountNumber });
  const account: PayoutAccount = {
    id: created.id,
    accountName: created.accountName,
    bank: created.bankName,
    bankCode,
    accountNumber: created.accountNumber,
    primary: SAVED_ACCOUNTS.length === 0,
  };
  if (opts?.commitLocal !== false) {
    const existing = SAVED_ACCOUNTS.find((a) => a.id === account.id);
    if (!existing) SAVED_ACCOUNTS = [...SAVED_ACCOUNTS, account];
  }
  return account;
}

/** Soft-delete on server and drop from local cache (abandon before Confirm). */
export async function discardPayoutAccount(id: string) {
  await deletePayoutAccount(id);
  SAVED_ACCOUNTS = SAVED_ACCOUNTS.filter((a) => a.id !== id);
}

/** Remove a saved payout account and return the refreshed list. */
export async function removePayoutAccountViaApi(id: string) {
  await discardPayoutAccount(id);
  return hydratePayoutFromApi();
}

/** Commit a verified account into the local list after user Confirm. */
export function commitPayoutAccountLocal(account: PayoutAccount) {
  if (SAVED_ACCOUNTS.some((a) => a.id === account.id)) return;
  SAVED_ACCOUNTS = [
    ...SAVED_ACCOUNTS,
    { ...account, primary: SAVED_ACCOUNTS.length === 0 },
  ];
}
