/**
 * Administration console demo data (ADM-010–013).
 * Prototype-only figures modelled on the PRD executive dashboard spec.
 */

export const naira = (value: number) =>
  `₦${value.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;

export const compactNaira = (value: number) => {
  if (value >= 1_000_000_000) return `₦${(value / 1_000_000_000).toFixed(2)}b`;
  if (value >= 1_000_000) return `₦${(value / 1_000_000).toFixed(1)}m`;
  if (value >= 1_000) return `₦${Math.round(value / 1_000)}k`;
  return naira(value);
};

/* ── ADM-010 primary metrics ─────────────────────────────────────────── */

export const WALLET_BALANCES = 184_500_000;
export const CALL_PRINCIPAL = 412_800_000;
export const FIXED_PRINCIPAL = 1_286_400_000;
export const EXPLORE_PRINCIPAL = 574_300_000;

export const FUM =
  WALLET_BALANCES + CALL_PRINCIPAL + FIXED_PRINCIPAL + EXPLORE_PRINCIPAL;

export const INTEREST_ACCRUED = 96_420_000;
export const INTEREST_PAYABLE = 21_860_000;

export const FUM_CHANGE_PCT = 4.8;
export const FUM_SERIES = [1_980, 2_040, 2_115, 2_190, 2_260, 2_340, 2_458];
export const FUM_LABELS = ["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];

export type Metric = {
  id: string;
  label: string;
  value: number;
  helper: string;
  changePct?: number;
};

export const PRIMARY_METRICS: Metric[] = [
  {
    id: "wallet",
    label: "Wallet balances",
    value: WALLET_BALANCES,
    helper: "Uninvested customer cash",
    changePct: 2.1,
  },
  {
    id: "call",
    label: "Call principal",
    value: CALL_PRINCIPAL,
    helper: "Daily-accrual Call Account",
    changePct: 3.4,
  },
  {
    id: "fixed",
    label: "Fixed principal",
    value: FIXED_PRINCIPAL,
    helper: "Kipit fixed-return plans",
    changePct: 5.6,
  },
  {
    id: "explore",
    label: "Explore principal",
    value: EXPLORE_PRINCIPAL,
    helper: "Marketplace subscriptions",
    changePct: 6.9,
  },
];

/* ── ADM-011 FUM breakdown ───────────────────────────────────────────── */

export type Slice = { id: string; label: string; value: number; tone: string };

export const FUM_BREAKDOWN: Slice[] = [
  { id: "fixed", label: "Fixed plans", value: FIXED_PRINCIPAL, tone: "bg-brand" },
  { id: "explore", label: "Explore products", value: EXPLORE_PRINCIPAL, tone: "bg-gold" },
  { id: "call", label: "Call money", value: CALL_PRINCIPAL, tone: "bg-brand/60" },
  { id: "wallet", label: "Wallet balances", value: WALLET_BALANCES, tone: "bg-brand/30" },
];

export const PRINCIPAL_BY_TENOR = [
  { band: "30 days", value: 186_200_000, rate: "18.5%" },
  { band: "90 days", value: 342_900_000, rate: "20.0%" },
  { band: "180 days", value: 401_500_000, rate: "21.5%" },
  { band: "365 days", value: 355_800_000, rate: "23.0%" },
];

export const PRINCIPAL_BY_PRODUCT = [
  { product: "FGN Treasury Bills", value: 214_600_000 },
  { product: "Corporate Commercial Paper", value: 168_300_000 },
  { product: "FGN Savings Bond", value: 112_900_000 },
  { product: "Money Market Fund", value: 78_500_000 },
];

/* ── ADM-012 maturity tracker ────────────────────────────────────────── */

export type MaturityRow = {
  id: string;
  user: string;
  product: string;
  principal: number;
  expected: number;
  date: string;
  window: "week" | "month";
};

export const MATURITIES: MaturityRow[] = [
  {
    id: "m1",
    user: "Adaeze Okonkwo",
    product: "Fixed plan · 90 days",
    principal: 4_500_000,
    expected: 4_721_000,
    date: "Sep 06, 2026",
    window: "week",
  },
  {
    id: "m2",
    user: "Tunde Bakare",
    product: "FGN Treasury Bills",
    principal: 12_000_000,
    expected: 12_648_000,
    date: "Sep 07, 2026",
    window: "week",
  },
  {
    id: "m3",
    user: "Chinelo Eze",
    product: "Fixed plan · 30 days",
    principal: 1_250_000,
    expected: 1_269_000,
    date: "Sep 09, 2026",
    window: "week",
  },
  {
    id: "m4",
    user: "Ibrahim Sule",
    product: "Corporate Commercial Paper",
    principal: 8_000_000,
    expected: 8_412_000,
    date: "Sep 18, 2026",
    window: "month",
  },
  {
    id: "m5",
    user: "Grace Aluko",
    product: "Fixed plan · 180 days",
    principal: 6_300_000,
    expected: 6_977_000,
    date: "Sep 24, 2026",
    window: "month",
  },
  {
    id: "m6",
    user: "Femi Adeyemi",
    product: "FGN Savings Bond",
    principal: 3_100_000,
    expected: 3_286_000,
    date: "Sep 29, 2026",
    window: "month",
  },
];

/* ── ADM-013 operational alerts ──────────────────────────────────────── */

export type Alert = {
  id: string;
  label: string;
  count: number;
  helper: string;
  severity: "critical" | "warning" | "info";
  to: string;
};

export const ALERTS: Alert[] = [
  {
    id: "kyc",
    label: "Pending KYC",
    count: 24,
    helper: "6 escalated to compliance",
    severity: "warning",
    to: "/admin",
  },
  {
    id: "withdrawals",
    label: "Pending withdrawals",
    count: 11,
    helper: "₦38.4m awaiting processing",
    severity: "critical",
    to: "/admin",
  },
  {
    id: "recon",
    label: "Failed reconciliation",
    count: 3,
    helper: "Provider vs ledger variance",
    severity: "critical",
    to: "/admin",
  },
  {
    id: "failed",
    label: "Failed transactions",
    count: 7,
    helper: "Card and transfer failures today",
    severity: "warning",
    to: "/admin",
  },
  {
    id: "maturities",
    label: "Upcoming maturities",
    count: 18,
    helper: "Due in the next 7 days",
    severity: "info",
    to: "/admin",
  },
];

/* ── Supporting activity feed ────────────────────────────────────────── */

export type AdminActivityKind = "kyc" | "payout" | "rate" | "content" | "decline";

export const RECENT_ACTIVITY: {
  id: string;
  kind: AdminActivityKind;
  team: string;
  who: string;
  action: string;
  detail: string;
  at: string;
  amount?: number;
}[] = [
  {
    id: "a1",
    kind: "kyc",
    team: "Compliance",
    who: "Ngozi",
    action: "Approved Tier 2 KYC",
    detail: "Adaeze Okonkwo · NIN + liveness matched",
    at: "8 min ago",
  },
  {
    id: "a2",
    kind: "payout",
    team: "Operations",
    who: "Kelechi",
    action: "Processed withdrawal",
    detail: "WD-88213 · GTBank ****4471",
    at: "26 min ago",
    amount: 2_400_000,
  },
  {
    id: "a3",
    kind: "rate",
    team: "Global Admin",
    who: "Seyi",
    action: "Approved rate change",
    detail: "180d fixed · 21.0% → 21.5%",
    at: "1 hr ago",
  },
  {
    id: "a4",
    kind: "content",
    team: "Marketing",
    who: "Zainab",
    action: "Published home feed card",
    detail: "'September outlook' · live to all users",
    at: "3 hrs ago",
  },
  {
    id: "a5",
    kind: "decline",
    team: "Operations",
    who: "Kelechi",
    action: "Declined withdrawal",
    detail: "WD-88197 · account name mismatch",
    at: "5 hrs ago",
    amount: 860_000,
  },
];

export const TODAY_FLOWS = {
  deposits: 42_800_000,
  placements: 61_500_000,
  interestCredits: 4_120_000,
  withdrawals: 18_900_000,
};

/* ── Chart series (prototype) ────────────────────────────────────────── */

/** FUM trend in ₦m, split by pool, for the stacked area chart. */
export const FUM_TREND = FUM_LABELS.map((month, i) => {
  const total = FUM_SERIES[i] ?? 0;
  return {
    month,
    total,
    fixed: Math.round(total * 0.525),
    explore: Math.round(total * 0.233),
    call: Math.round(total * 0.167),
    wallet: Math.round(total * 0.075),
  };
});

/** Last 7 days of money movement in ₦m. */
export const FLOW_TREND = [
  { day: "Fri", deposits: 31.2, withdrawals: 12.4 },
  { day: "Sat", deposits: 18.7, withdrawals: 6.1 },
  { day: "Sun", deposits: 14.3, withdrawals: 4.8 },
  { day: "Mon", deposits: 46.9, withdrawals: 22.6 },
  { day: "Tue", deposits: 38.4, withdrawals: 15.9 },
  { day: "Wed", deposits: 44.1, withdrawals: 19.3 },
  { day: "Thu", deposits: 42.8, withdrawals: 18.9 },
];

/** Interest accrued vs paid out, ₦m per month. */
export const INTEREST_TREND = FUM_LABELS.map((month, i) => ({
  month,
  accrued: Math.round((70 + i * 4.6) * 10) / 10,
  paid: Math.round((52 + i * 3.4) * 10) / 10,
}));

/** Maturities due, ₦m per week. */
export const MATURITY_SCHEDULE = [
  { week: "W1", value: 148.6 },
  { week: "W2", value: 92.4 },
  { week: "W3", value: 214.8 },
  { week: "W4", value: 121.5 },
  { week: "W5", value: 176.2 },
  { week: "W6", value: 88.9 },
];

/** Small sparkline series keyed by metric id (₦m). */
export const METRIC_SPARKS: Record<string, number[]> = {
  // 14 days of daily balances — real books wobble, so these do too.
  wallet: [162.4, 158.9, 166.2, 171.8, 164.5, 169.1, 176.4, 170.2, 173.8, 181.6, 174.9, 179.3, 186.1, 184.5],
  call: [352.1, 361.4, 356.8, 370.2, 383.6, 374.1, 389.5, 396.8, 388.2, 401.7, 394.6, 409.3, 418.2, 412.8],
  fixed: [1064, 1082, 1074, 1103, 1128, 1119, 1147, 1172, 1161, 1198, 1226, 1214, 1263, 1286.4],
  explore: [452.3, 468.1, 459.7, 481.4, 474.2, 496.8, 512.3, 503.6, 528.9, 519.4, 544.7, 561.2, 552.8, 574.3],
};
