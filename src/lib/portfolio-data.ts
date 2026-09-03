/**
 * MOB-120 — Portfolio overview data.
 * Reconciles wallet, call account, fixed plans and marketplace holdings.
 */
import { WALLET, HOLDINGS, naira } from "./home-data";
import { CALL_ACCOUNT } from "./invest-data";

export type ExploreHolding = {
  id: string;
  name: string;
  issuer: string;
  rate: string;
  amount: number;
  expectedPayout: number;
  date: string;
  daysLeft: number;
  totalDays: number;
};

/** Marketplace (Explore) subscriptions currently held. */
export const EXPLORE_HOLDINGS: ExploreHolding[] = [
  {
    id: "p1",
    name: "364-Day Treasury Bill",
    issuer: "Federal Government of Nigeria",
    rate: "22.4% p.a.",
    amount: 1_500_000,
    expectedPayout: 1_836_000,
    date: "18 Mar 2027",
    daysLeft: 196,
    totalDays: 364,
  },
  {
    id: "p3",
    name: "Dangote Cement CP Series 12",
    issuer: "Dangote Cement Plc",
    rate: "24.1% p.a.",
    amount: 1_000_000,
    expectedPayout: 1_119_000,
    date: "02 Dec 2026",
    daysLeft: 90,
    totalDays: 180,
  },
];

export const FIXED_TOTAL = HOLDINGS.reduce((s, h) => s + h.amount, 0);
export const EXPLORE_TOTAL = EXPLORE_HOLDINGS.reduce((s, h) => s + h.amount, 0);
export const CALL_TOTAL = CALL_ACCOUNT.balance;
export const WALLET_TOTAL = WALLET;
export const PORTFOLIO_TOTAL =
  WALLET_TOTAL + CALL_TOTAL + FIXED_TOTAL + EXPLORE_TOTAL;

/** Growth over the trailing month (prototype figures). */
export const PORTFOLIO_MONTH_CHANGE = 412_600;
export const PORTFOLIO_MONTH_CHANGE_PCT = 1.44;
export const INTEREST_EARNED_YTD = 1_284_900;

export type Slice = {
  key: string;
  label: string;
  value: number;
  /** Tailwind-friendly CSS colour for the donut + legend dot. */
  color: string;
  to: "/invest" | "/call-account" | "/fixed-plans" | "/explore";
  note: string;
};

export const ALLOCATION: Slice[] = [
  {
    key: "call",
    label: "Call Account",
    value: CALL_TOTAL,
    color: "hsl(var(--brand))",
    to: "/call-account",
    note: `${CALL_ACCOUNT.rate} · withdraw anytime`,
  },
  {
    key: "fixed",
    label: "Fixed Plans",
    value: FIXED_TOTAL,
    color: "hsl(var(--gold))",
    to: "/fixed-plans",
    note: `${HOLDINGS.length} active plans`,
  },
  {
    key: "explore",
    label: "Explore Products",
    value: EXPLORE_TOTAL,
    color: "hsl(var(--brand) / 0.55)",
    to: "/explore",
    note: `${EXPLORE_HOLDINGS.length} marketplace holdings`,
  },
  {
    key: "wallet",
    label: "Wallet",
    value: WALLET_TOTAL,
    color: "hsl(var(--muted-foreground) / 0.45)",
    to: "/invest",
    note: "Idle cash, not earning a fixed rate",
  },
];

export type Maturity = {
  name: string;
  amount: number;
  date: string;
  daysLeft: number;
  kind: "Fixed plan" | "Explore product";
};

export const UPCOMING_MATURITIES: Maturity[] = [
  ...HOLDINGS.map((h) => ({
    name: h.name,
    amount: h.expectedPayout,
    date: h.date,
    daysLeft: h.daysLeft,
    kind: "Fixed plan" as const,
  })),
  ...EXPLORE_HOLDINGS.map((h) => ({
    name: h.name,
    amount: h.expectedPayout,
    date: h.date,
    daysLeft: h.daysLeft,
    kind: "Explore product" as const,
  })),
].sort((a, b) => a.daysLeft - b.daysLeft);

export const pctOf = (value: number) =>
  Math.round((value / PORTFOLIO_TOTAL) * 1000) / 10;

export { naira };
