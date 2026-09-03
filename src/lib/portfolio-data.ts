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
  const d = new Date(Number(year), MONTHS.indexOf(mon ?? ""), Number(day));
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
    {
      label: "Interest accrued to date",
      date: "Ongoing",
      amount: Math.round(((h.expectedPayout - h.amount) * (h.totalDays - h.daysLeft)) / h.totalDays),
      direction: "in" as const,
    },
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

/* ── MOB-122 — Maturity calendar ────────────────────────────────── */

export type MaturityMonth = { month: string; items: Maturity[]; total: number };

/** Upcoming maturities grouped by month, nearest first. */
export const MATURITY_CALENDAR: MaturityMonth[] = (() => {
  const groups = new Map<string, Maturity[]>();
  for (const m of UPCOMING_MATURITIES) {
    const parts = m.date.split(" ");
    const key = `${parts[1]} ${parts[2]}`;
    const list = groups.get(key) ?? [];
    list.push(m);
    groups.set(key, list);
  }
  return [...groups.entries()].map(([month, items]) => ({
    month,
    items,
    total: items.reduce((s, i) => s + i.amount, 0),
  }));
})();

/* ── MOB-123 — Investment history ───────────────────────────────── */

export type InvestmentStatus = "Active" | "Matured" | "Closed";

export type InvestmentRecord = {
  id: string;
  name: string;
  kind: "Fixed plan" | "Explore product";
  status: InvestmentStatus;
  principal: number;
  rate: string;
  startDate: string;
  endDate: string;
  interest: number;
  /** Detail route id when the holding is still live. */
  holdingId?: string;
};

export const INVESTMENT_HISTORY: InvestmentRecord[] = [
  ...HOLDING_DETAILS.map((h, i) => ({
    id: `ih-${h.id}`,
    name: h.name,
    kind: h.kind,
    status: "Active" as const,
    principal: h.principal,
    rate: h.rate,
    startDate: h.startDate,
    endDate: h.maturityDate,
    interest: accruedInterest(h),
    holdingId: h.id,
    _i: i,
  })).map(({ _i, ...rest }) => rest),
  {
    id: "ih-m1",
    name: "Kipit Fixed Income",
    kind: "Fixed plan",
    status: "Matured",
    principal: 400_000,
    rate: "18.5% p.a.",
    startDate: "14 Feb 2026",
    endDate: "15 May 2026",
    interest: 18_400,
  },
  {
    id: "ih-m2",
    name: "182-Day Treasury Bill",
    kind: "Explore product",
    status: "Matured",
    principal: 1_000_000,
    rate: "21.0% p.a.",
    startDate: "03 Dec 2025",
    endDate: "03 Jun 2026",
    interest: 104_800,
  },
  {
    id: "ih-c1",
    name: "Kipit Target Savings",
    kind: "Fixed plan",
    status: "Closed",
    principal: 250_000,
    rate: "16.0% p.a.",
    startDate: "09 Jan 2026",
    endDate: "27 Mar 2026",
    interest: 6_120,
  },
];

/* ── MOB-124 / 125 / 126 — Transactions ─────────────────────────── */

export type TxnType =
  | "Deposit"
  | "Investment"
  | "Interest"
  | "Withdrawal"
  | "Adjustment";
export type TxnStatus = "Successful" | "Processing" | "Pending" | "Failed";

export type Transaction = {
  id: string;
  reference: string;
  type: TxnType;
  status: TxnStatus;
  label: string;
  date: string;
  time: string;
  amount: number;
  direction: "in" | "out";
  source: string;
  destination: string;
  /** Related investment, where applicable. */
  related?: { name: string; holdingId?: string };
  note?: string;
};

export const TRANSACTIONS: Transaction[] = [
  {
    id: "t1",
    reference: "KPT-8F2K19QD",
    type: "Interest",
    status: "Successful",
    label: "Interest credit · Call Account",
    date: "01 Sep 2026",
    time: "00:14",
    amount: 298_450,
    direction: "in",
    source: "Kipit Call Account",
    destination: "Kipit Wallet",
    note: "Monthly interest credited on the 1st.",
  },
  {
    id: "t2",
    reference: "KPT-4LM73BXA",
    type: "Investment",
    status: "Successful",
    label: "Fixed plan funded · Kipit Vault",
    date: "28 Aug 2026",
    time: "10:42",
    amount: 800_000,
    direction: "out",
    source: "Kipit Wallet",
    destination: "Kipit Vault (365d)",
    related: { name: "Kipit Vault (365d)", holdingId: "f3" },
  },
  {
    id: "t3",
    reference: "KPT-9QW20TRE",
    type: "Deposit",
    status: "Successful",
    label: "Wallet top-up · Bank transfer",
    date: "27 Aug 2026",
    time: "16:05",
    amount: 1_500_000,
    direction: "in",
    source: "GTBank ****4471",
    destination: "Kipit Wallet",
  },
  {
    id: "t4",
    reference: "KPT-1ZC58HNP",
    type: "Investment",
    status: "Processing",
    label: "Subscription · 364-Day Treasury Bill",
    date: "26 Aug 2026",
    time: "09:20",
    amount: 1_500_000,
    direction: "out",
    source: "Kipit Wallet",
    destination: "Federal Government of Nigeria",
    related: { name: "364-Day Treasury Bill", holdingId: "e-p1" },
    note: "Allotment confirms at issuer settlement.",
  },
  {
    id: "t5",
    reference: "KPT-7BD41MSK",
    type: "Withdrawal",
    status: "Pending",
    label: "Withdrawal to bank",
    date: "24 Aug 2026",
    time: "14:38",
    amount: 250_000,
    direction: "out",
    source: "Kipit Wallet",
    destination: "GTBank ****4471",
    note: "Awaiting bank settlement — usually within 1 business day.",
  },
  {
    id: "t6",
    reference: "KPT-3XN66VLC",
    type: "Interest",
    status: "Successful",
    label: "Interest accrual · Kipit Fixed Income",
    date: "20 Aug 2026",
    time: "00:11",
    amount: 11_840,
    direction: "in",
    source: "Kipit Fixed Income",
    destination: "Kipit Wallet",
    related: { name: "Kipit Fixed Income", holdingId: "f1" },
  },
  {
    id: "t7",
    reference: "KPT-6HJ90PWT",
    type: "Adjustment",
    status: "Successful",
    label: "Rate adjustment credit",
    date: "12 Aug 2026",
    time: "11:02",
    amount: 4_250,
    direction: "in",
    source: "Kipit",
    destination: "Kipit Wallet",
    note: "Goodwill adjustment applied by support.",
  },
  {
    id: "t8",
    reference: "KPT-2RS35DFY",
    type: "Withdrawal",
    status: "Failed",
    label: "Withdrawal to bank",
    date: "05 Aug 2026",
    time: "18:47",
    amount: 120_000,
    direction: "out",
    source: "Kipit Wallet",
    destination: "Zenith ****9032",
    note: "Declined by the receiving bank. Funds returned to your wallet.",
  },
];

export const TXN_TYPES: TxnType[] = [
  "Deposit",
  "Investment",
  "Interest",
  "Withdrawal",
  "Adjustment",
];

export const getTransaction = (id: string) =>
  TRANSACTIONS.find((t) => t.id === id);
