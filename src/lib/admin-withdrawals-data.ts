/**
 * Withdrawal queue fixtures (ADM-050 / ADM-051 / ADM-052).
 * Prototype-only data for the admin console withdrawals workspace.
 */

export type WithdrawalStatus = "pending" | "processing" | "successful" | "declined";

export type WithdrawalRisk = "low" | "medium" | "high";

export type Withdrawal = {
  id: string;
  ref: string;
  status: WithdrawalStatus;
  amount: number;
  fee: number;
  bank: string;
  accountName: string;
  accountNumber: string;
  requestedAt: string;
  requestedDate: string;
  source: "Wallet" | "Call Account" | "Matured plan";
  risk: WithdrawalRisk;
  userId: string;
  userName: string;
  userEmail: string;
  userTier: 0 | 1 | 2;
  userSince: string;
  walletBalance: number;
  portfolioValue: number;
  lifetimeWithdrawn: number;
  priorWithdrawals: number;
  notes: string;
  declineReason?: string;
  timeline: { label: string; at: string; note?: string }[];
};

export const WITHDRAWAL_STATUS_LABEL: Record<WithdrawalStatus, string> = {
  pending: "Pending review",
  processing: "Processing",
  successful: "Successful",
  declined: "Declined",
};

export const WITHDRAWAL_STATUS_TONE: Record<WithdrawalStatus, string> = {
  pending: "bg-gold/25 text-gold-foreground ring-gold/40",
  processing: "bg-brand/10 text-brand ring-brand/20",
  successful: "bg-emerald-500/12 text-emerald-700 ring-emerald-500/20",
  declined: "bg-destructive/10 text-destructive ring-destructive/20",
};

export const RISK_TONE: Record<WithdrawalRisk, string> = {
  low: "bg-emerald-500/12 text-emerald-700 ring-emerald-500/20",
  medium: "bg-gold/25 text-gold-foreground ring-gold/40",
  high: "bg-destructive/10 text-destructive ring-destructive/20",
};

/** Reasons an operator may pick when declining (ADM-052). */
export const DECLINE_REASONS = [
  "Account name mismatch",
  "Suspected fraudulent activity",
  "Insufficient available balance",
  "Bank account could not be verified",
  "Pending compliance review",
  "Duplicate request",
];

export const WITHDRAWALS: Withdrawal[] = [
  {
    id: "wd-5001",
    ref: "KPT-WDL-90341",
    status: "pending",
    amount: 4_500_000,
    fee: 0,
    bank: "GTBank",
    accountName: "Adebayo Ilesanmi",
    accountNumber: "0123456789",
    requestedAt: "04 Sep 2026 · 09:41",
    requestedDate: "2026-09-04",
    source: "Wallet",
    risk: "high",
    userId: "u-10241",
    userName: "Adebayo Ilesanmi",
    userEmail: "adebayo.i@gmail.com",
    userTier: 2,
    userSince: "Mar 2024",
    walletBalance: 5_120_000,
    portfolioValue: 28_400_000,
    lifetimeWithdrawn: 12_300_000,
    priorWithdrawals: 9,
    notes: "Largest single request from this customer. Confirm payout account age before processing.",
    timeline: [
      { label: "Request created", at: "04 Sep 2026 · 09:41", note: "Initiated from mobile app" },
      { label: "Tier 2 verified", at: "04 Sep 2026 · 09:41" },
      { label: "Awaiting operator review", at: "04 Sep 2026 · 09:42" },
    ],
  },
  {
    id: "wd-5002",
    ref: "KPT-WDL-90338",
    status: "pending",
    amount: 320_000,
    fee: 0,
    bank: "Zenith Bank",
    accountName: "Chiamaka Obi",
    accountNumber: "2233445566",
    requestedAt: "04 Sep 2026 · 08:12",
    requestedDate: "2026-09-04",
    source: "Call Account",
    risk: "low",
    userId: "u-10242",
    userName: "Chiamaka Obi",
    userEmail: "chiamaka.obi@outlook.com",
    userTier: 2,
    userSince: "Jul 2024",
    walletBalance: 410_000,
    portfolioValue: 3_950_000,
    lifetimeWithdrawn: 1_120_000,
    priorWithdrawals: 4,
    notes: "Routine liquidity withdrawal from Call Account.",
    timeline: [
      { label: "Request created", at: "04 Sep 2026 · 08:12" },
      { label: "Awaiting operator review", at: "04 Sep 2026 · 08:13" },
    ],
  },
  {
    id: "wd-5003",
    ref: "KPT-WDL-90329",
    status: "processing",
    amount: 1_250_000,
    fee: 0,
    bank: "Access Bank",
    accountName: "Tunde Bakare",
    accountNumber: "0099887766",
    requestedAt: "03 Sep 2026 · 16:55",
    requestedDate: "2026-09-03",
    source: "Matured plan",
    risk: "medium",
    userId: "u-10243",
    userName: "Tunde Bakare",
    userEmail: "tunde.bakare@yahoo.com",
    userTier: 2,
    userSince: "Jan 2024",
    walletBalance: 1_310_000,
    portfolioValue: 9_800_000,
    lifetimeWithdrawn: 6_400_000,
    priorWithdrawals: 12,
    notes: "Payout instruction sent to settlement bank, awaiting confirmation.",
    timeline: [
      { label: "Request created", at: "03 Sep 2026 · 16:55" },
      { label: "Approved by operator", at: "03 Sep 2026 · 17:10", note: "Seyi Adeleke" },
      { label: "Sent to settlement bank", at: "03 Sep 2026 · 17:12" },
    ],
  },
  {
    id: "wd-5004",
    ref: "KPT-WDL-90310",
    status: "successful",
    amount: 780_000,
    fee: 0,
    bank: "UBA",
    accountName: "Zainab Yusuf",
    accountNumber: "1029384756",
    requestedAt: "03 Sep 2026 · 11:02",
    requestedDate: "2026-09-03",
    source: "Wallet",
    risk: "low",
    userId: "u-10244",
    userName: "Zainab Yusuf",
    userEmail: "zainab.y@gmail.com",
    userTier: 2,
    userSince: "Sep 2023",
    walletBalance: 220_000,
    portfolioValue: 5_600_000,
    lifetimeWithdrawn: 4_180_000,
    priorWithdrawals: 7,
    notes: "Settled same day.",
    timeline: [
      { label: "Request created", at: "03 Sep 2026 · 11:02" },
      { label: "Approved by operator", at: "03 Sep 2026 · 11:20", note: "Ngozi Eze" },
      { label: "Marked successful", at: "03 Sep 2026 · 12:04", note: "Bank confirmation received" },
    ],
  },
  {
    id: "wd-5005",
    ref: "KPT-WDL-90298",
    status: "declined",
    amount: 2_100_000,
    fee: 0,
    bank: "First Bank",
    accountName: "E. Nwosu Ventures",
    accountNumber: "3141592653",
    requestedAt: "02 Sep 2026 · 19:30",
    requestedDate: "2026-09-02",
    source: "Wallet",
    risk: "high",
    userId: "u-10245",
    userName: "Emeka Nwosu",
    userEmail: "emeka.nwosu@gmail.com",
    userTier: 2,
    userSince: "Feb 2025",
    walletBalance: 2_240_000,
    portfolioValue: 7_150_000,
    lifetimeWithdrawn: 900_000,
    priorWithdrawals: 2,
    notes: "Payout account is a business account that does not match the verified customer name.",
    declineReason: "Account name mismatch",
    timeline: [
      { label: "Request created", at: "02 Sep 2026 · 19:30" },
      { label: "Flagged by screening", at: "02 Sep 2026 · 19:31", note: "Name mismatch" },
      { label: "Declined", at: "02 Sep 2026 · 20:15", note: "Seyi Adeleke · funds returned to wallet" },
    ],
  },
  {
    id: "wd-5006",
    ref: "KPT-WDL-90277",
    status: "pending",
    amount: 95_000,
    fee: 0,
    bank: "Kuda",
    accountName: "Folake Adeyemi",
    accountNumber: "5566778899",
    requestedAt: "02 Sep 2026 · 14:08",
    requestedDate: "2026-09-02",
    source: "Wallet",
    risk: "low",
    userId: "u-10246",
    userName: "Folake Adeyemi",
    userEmail: "folake.a@gmail.com",
    userTier: 2,
    userSince: "May 2025",
    walletBalance: 140_000,
    portfolioValue: 1_050_000,
    lifetimeWithdrawn: 260_000,
    priorWithdrawals: 3,
    notes: "Small routine payout.",
    timeline: [
      { label: "Request created", at: "02 Sep 2026 · 14:08" },
      { label: "Awaiting operator review", at: "02 Sep 2026 · 14:09" },
    ],
  },
];

export function withdrawalById(id: string) {
  return WITHDRAWALS.find((w) => w.id === id);
}

export const WITHDRAWAL_TOTALS = {
  pendingCount: WITHDRAWALS.filter((w) => w.status === "pending").length,
  pendingValue: WITHDRAWALS.filter((w) => w.status === "pending").reduce((s, w) => s + w.amount, 0),
  processingValue: WITHDRAWALS.filter((w) => w.status === "processing").reduce(
    (s, w) => s + w.amount,
    0,
  ),
  settledToday: WITHDRAWALS.filter((w) => w.status === "successful").reduce(
    (s, w) => s + w.amount,
    0,
  ),
};
