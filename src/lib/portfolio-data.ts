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
    color: "var(--brand)",
    to: "/call-account",
    note: `${CALL_ACCOUNT.rate} · withdraw anytime`,
  },
  {
    key: "fixed",
    label: "Fixed Plans",
    value: FIXED_TOTAL,
    color: "var(--gold)",
    to: "/fixed-plans",
    note: `${HOLDINGS.length} active plans`,
  },
  {
    key: "explore",
    label: "Explore Products",
    value: EXPLORE_TOTAL,
    color: "color-mix(in oklab, var(--brand) 55%, white)",
    to: "/explore",
    note: `${EXPLORE_HOLDINGS.length} marketplace holdings`,
  },
  {
    key: "wallet",
    label: "Wallet",
    value: WALLET_TOTAL,
    color: "color-mix(in oklab, var(--muted-foreground) 35%, white)",
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

/* ── MOB-121 — Holding detail ───────────────────────────────────── */

export type HoldingDoc = { label: string; kind: string; size: string };
export type HoldingTxn = {
  label: string;
  date: string;
  amount: number;
  direction: "in" | "out";
};

export type HoldingDetail = {
  id: string;
  kind: "Fixed plan" | "Explore product";
  name: string;
  issuer: string;
  rate: string;
  principal: number;
  startDate: string;
  maturityDate: string;
  totalDays: number;
  daysLeft: number;
  expectedPayout: number;
  /** Whether the user may change what happens at maturity. */
  canManageMaturity: boolean;
  maturityInstruction: string;
  documents: HoldingDoc[];
  transactions: HoldingTxn[];
};

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const fmtDate = (d: Date) =>
  `${String(d.getDate()).padStart(2, "0")} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

/** Back-computes the start date from the maturity date and tenor. */
const startFrom = (maturity: string, totalDays: number) => {
  const [day, mon, year] = maturity.split(" ");
  const d = new Date(Number(year), MONTHS.indexOf(mon), Number(day));
  d.setDate(d.getDate() - totalDays);
  return fmtDate(d);
};

const fixedHoldings: HoldingDetail[] = HOLDINGS.map((h, i) => ({
  id: `f${i + 1}`,
  kind: "Fixed plan" as const,
  name: h.name,
  issuer: "Kipit · SEC-licensed partner",
  rate: h.rate,
  principal: h.amount,
  startDate: startFrom(h.date, h.totalDays),
  maturityDate: h.date,
  totalDays: h.totalDays,
  daysLeft: h.daysLeft,
  expectedPayout: h.expectedPayout,
  canManageMaturity: true,
  maturityInstruction: h.autoRenew
    ? "Roll over principal + interest"
    : "Pay out to Kipit Wallet",
  documents: [
    { label: "Plan certificate", kind: "PDF", size: "184 KB" },
    { label: "Terms & conditions", kind: "PDF", size: "96 KB" },
  ],
  transactions: [
    { label: "Plan funded from Wallet", date: startFrom(h.date, h.totalDays), amount: h.amount, direction: "out" as const },
    { label: "Interest accrued to date", date: "Ongoing", amount: Math.round(((h.expectedPayout - h.amount) * (h.totalDays - h.daysLeft)) / h.totalDays), amount2: 0, direction: "in" as const } as HoldingTxn,
  ],
}));

const exploreHoldings: HoldingDetail[] = EXPLORE_HOLDINGS.map((h) => ({
  id: `e-${h.id}`,
  kind: "Explore product" as const,
  name: h.name,
  issuer: h.issuer,
  rate: h.rate,
  principal: h.amount,
  startDate: startFrom(h.date, h.totalDays),
  maturityDate: h.date,
  totalDays: h.totalDays,
  daysLeft: h.daysLeft,
  expectedPayout: h.expectedPayout,
  canManageMaturity: false,
  maturityInstruction: "Payout to Kipit Wallet at maturity",
  documents: [
    { label: "Offer summary", kind: "PDF", size: "212 KB" },
    { label: "Issuer information", kind: "PDF", size: "148 KB" },
    { label: "Risk disclosure", kind: "PDF", size: "88 KB" },
  ],
  transactions: [
    { label: "Subscription funded", date: startFrom(h.date, h.totalDays), amount: h.amount, direction: "out" as const },
    { label: "Allotment confirmed", date: startFrom(h.date, h.totalDays), amount: h.amount, direction: "in" as const },
  ],
}));

export const HOLDING_DETAILS: HoldingDetail[] = [...fixedHoldings, ...exploreHoldings];

export const getHolding = (id: string) =>
  HOLDING_DETAILS.find((h) => h.id === id);

/** Interest accrued so far, pro-rated across the tenor. */
export const accruedInterest = (h: HoldingDetail) =>
  Math.round(
    ((h.expectedPayout - h.principal) * (h.totalDays - h.daysLeft)) / h.totalDays,
  );
