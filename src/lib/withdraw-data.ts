/**
 * Withdrawal flow data (MOB-100 → MOB-111).
 * Prototype-only fixtures — no backend calls.
 */

export type PayoutAccount = {
  id: string;
  accountName: string;
  bank: string;
  bankCode: string;
  accountNumber: string;
  primary?: boolean;
};

export const BANKS = [
  { code: "058", name: "Guaranty Trust Bank" },
  { code: "057", name: "Zenith Bank" },
  { code: "044", name: "Access Bank" },
  { code: "011", name: "First Bank of Nigeria" },
  { code: "033", name: "United Bank for Africa" },
  { code: "232", name: "Sterling Bank" },
  { code: "50211", name: "Kuda Microfinance Bank" },
  { code: "999992", name: "Opay Digital Services" },
] as const;

export const SAVED_ACCOUNTS: PayoutAccount[] = [
  {
    id: "pa1",
    accountName: "Adebayo O. Ilesanmi",
    bank: "Guaranty Trust Bank",
    bankCode: "058",
    accountNumber: "0123456789",
    primary: true,
  },
  {
    id: "pa2",
    accountName: "Adebayo O. Ilesanmi",
    bank: "Zenith Bank",
    bankCode: "057",
    accountNumber: "2087654321",
  },
];

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
  `${number.slice(0, 3)}••••${number.slice(-3)}`;

export const findAccount = (id: string) =>
  SAVED_ACCOUNTS.find((a) => a.id === id) ?? SAVED_ACCOUNTS[0]!;

export const withdrawalReference = (amount: number) =>
  `KPT-WD-${String(Math.abs(Math.round(amount)) % 100000).padStart(5, "0")}`;

export const payoutEta = "Within 5 minutes · NIP instant transfer";
