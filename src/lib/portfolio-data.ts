/**
 * MOB-120 — Portfolio overview data.
 * Reconciles wallet, call account, fixed plans and marketplace holdings.
 */
import { useMemo } from "react";
import { WALLET, HOLDINGS, naira } from "./home-data";
import { CALL_ACCOUNT, CALL_ACTIVITY } from "./invest-data";
import { useHydrateLiveBalances } from "./live-balances";
import { useWalletBalance } from "./wallet-balance";

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

/** Marketplace (Explore) subscriptions currently held — empty until API hydrate. */
export let EXPLORE_HOLDINGS: ExploreHolding[] = [];

export function setExploreHoldings(rows: ExploreHolding[]) {
  EXPLORE_HOLDINGS.splice(0, EXPLORE_HOLDINGS.length, ...rows);
}
export const FIXED_TOTAL = HOLDINGS.reduce((s, h) => s + h.amount, 0);
export const EXPLORE_TOTAL = EXPLORE_HOLDINGS.reduce((s, h) => s + h.amount, 0);
export const CALL_TOTAL = CALL_ACCOUNT.balance;
export const WALLET_TOTAL = WALLET;
export const PORTFOLIO_TOTAL =
  WALLET_TOTAL + CALL_TOTAL + FIXED_TOTAL + EXPLORE_TOTAL;

/** Growth over the trailing month — zero until API provides figures. */
export const PORTFOLIO_MONTH_CHANGE = 0;
export const PORTFOLIO_MONTH_CHANGE_PCT = 0;
export const INTEREST_EARNED_YTD = 0;

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
  /** Holding detail route id (/portfolio/$holdingId). */
  holdingId: string;
};

export const UPCOMING_MATURITIES: Maturity[] = [
  ...HOLDINGS.map((h, i) => ({
    name: h.name,
    amount: h.expectedPayout,
    date: h.date,
    daysLeft: h.daysLeft,
    kind: "Fixed plan" as const,
    holdingId: `f${i + 1}`,
  })),
  ...EXPLORE_HOLDINGS.map((h) => ({
    name: h.name,
    amount: h.expectedPayout,
    date: h.date,
    daysLeft: h.daysLeft,
    kind: "Explore product" as const,
    holdingId: `e-${h.id}`,
  })),
].sort((a, b) => a.daysLeft - b.daysLeft);

export const pctOf = (value: number, total = PORTFOLIO_TOTAL) =>
  total > 0 ? Math.round((value / total) * 1000) / 10 : 0;

/** Reactive portfolio totals — wallet/call/holdings from live API hydrate. */
export function usePortfolioSnapshot() {
  const live = useHydrateLiveBalances();
  const wallet = useWalletBalance();
  return useMemo(() => {
    const holdings = live.holdings.map((h) => {
      const daysLeft = h.maturityDate
        ? Math.max(
            0,
            Math.ceil(
              (new Date(h.maturityDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000),
            ),
          )
        : 0;
      return {
        id: h.id,
        name: h.name,
        rate: `${h.ratePct}% p.a.`,
        amount: h.amount,
        date: h.maturityDate ?? "",
        daysLeft,
        totalDays: Math.max(daysLeft, 1),
        expectedPayout: h.amount,
        autoRenew: false,
      };
    });
    const fixedTotal = holdings.reduce((s, h) => s + h.amount, 0);
    const exploreTotal = EXPLORE_HOLDINGS.reduce((s, h) => s + h.amount, 0);
    const callTotal = live.callBalance;
    const total = wallet + callTotal + fixedTotal + exploreTotal;
    const allocation: Slice[] = [
      {
        key: "call",
        label: "Call Account",
        value: callTotal,
        color: "var(--brand)",
        to: "/call-account",
        note: `${live.callRatePct ? `${live.callRatePct}% p.a.` : "—"} · withdraw anytime`,
      },
      {
        key: "fixed",
        label: "Fixed Plans",
        value: fixedTotal,
        color: "var(--gold)",
        to: "/fixed-plans",
        note: `${holdings.length} active plans`,
      },
      {
        key: "explore",
        label: "Explore Products",
        value: exploreTotal,
        color: "color-mix(in oklab, var(--brand) 55%, white)",
        to: "/explore",
        note: `${EXPLORE_HOLDINGS.length} marketplace holdings`,
      },
      {
        key: "wallet",
        label: "Wallet",
        value: wallet,
        color: "color-mix(in oklab, var(--muted-foreground) 35%, white)",
        to: "/invest",
        note: "Idle cash, not earning a fixed rate",
      },
    ];
    const maturities: Maturity[] = [
      ...holdings.map((h) => ({
        name: h.name,
        amount: h.expectedPayout,
        date: h.date,
        daysLeft: h.daysLeft,
        kind: "Fixed plan" as const,
        holdingId: h.id,
      })),
      ...EXPLORE_HOLDINGS.map((h) => ({
        name: h.name,
        amount: h.expectedPayout,
        date: h.date,
        daysLeft: h.daysLeft,
        kind: "Explore product" as const,
        holdingId: `e-${h.id}`,
      })),
    ].sort((a, b) => a.daysLeft - b.daysLeft);
    return {
      wallet,
      callTotal,
      fixedTotal,
      exploreTotal,
      total,
      holdings,
      exploreHoldings: EXPLORE_HOLDINGS,
      allocation,
      maturities,
      pct: (value: number) => pctOf(value, total || 1),
    };
  }, [live, wallet]);
}

export { naira };

/* ── MOB-121 — Holding detail ───────────────────────────────────── */

export type HoldingDoc = { label: string; kind: string; size: string; url?: string };
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

/** Active holdings only — matured/closed rows come from API when available. */
export const INVESTMENT_HISTORY: InvestmentRecord[] = HOLDING_DETAILS.map((h) => ({
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
}));

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
  /** ISO timestamp for reliable period filters. */
  createdAt: string;
  amount: number;
  direction: "in" | "out";
  source: string;
  destination: string;
  /** Related investment, where applicable. */
  related?: { name: string; holdingId?: string };
  note?: string;
};

export const TRANSACTIONS: Transaction[] = [];

export const TXN_TYPES: TxnType[] = [
  "Deposit",
  "Investment",
  "Interest",
  "Withdrawal",
  "Adjustment",
];

export function mapApiPortfolioTransaction(row: {
  id: string;
  reference: string;
  kind: string;
  description: string;
  amount: number;
  direction: "credit" | "debit" | string;
  createdAt: string;
  accountType?: string | null;
}): Transaction {
  const k = row.kind.toUpperCase();
  const desc = String(row.description || "").toLowerCase();
  const account = String(row.accountType || "").toUpperCase();
  let type: TxnType = "Adjustment";
  if (
    k.includes("INTEREST") ||
    k.includes("ACCRUAL") ||
    k.includes("CALL_INTEREST") ||
    desc.includes("interest")
  ) {
    type = "Interest";
  } else if (k.includes("DEPOSIT") || k.includes("FUND") || k.includes("CALL_DEPOSIT")) {
    type = "Deposit";
  } else if (
    k.includes("WITHDRAW") ||
    k.includes("PAYOUT") ||
    k.includes("MATURITY") ||
    k.includes("CALL_WITHDRAW")
  ) {
    type = "Withdrawal";
  } else if (k.includes("PLACEMENT") || k.includes("INVEST") || account.includes("PLACEMENT")) {
    type = "Investment";
  }

  const created = new Date(row.createdAt);
  const credit = String(row.direction).toLowerCase() !== "debit";
  const label =
    type === "Interest"
      ? row.description || "Interest credited"
      : row.description || row.kind || "Transaction";
  return {
    id: row.id,
    reference: row.reference || row.id,
    type,
    status: "Successful",
    label,
    date: Number.isNaN(created.getTime())
      ? "—"
      : created.toLocaleDateString("en-NG", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
    time: Number.isNaN(created.getTime())
      ? ""
      : created.toLocaleTimeString("en-NG", {
          hour: "2-digit",
          minute: "2-digit",
        }),
    createdAt: row.createdAt,
    amount: Number(row.amount) || 0,
    direction: credit ? "in" : "out",
    source: credit ? (type === "Interest" ? "Investment" : "External") : "Kipit Wallet",
    destination: credit ? "Kipit Wallet" : "External",
  };
}

export const getTransaction = (id: string): Transaction | undefined =>
  ALL_TRANSACTIONS.find((t) => t.id === id);

export async function loadPortfolioTransaction(
  id: string,
): Promise<Transaction | undefined> {
  try {
    const { fetchPortfolioTransactions } = await import("./api");
    const rows = await fetchPortfolioTransactions();
    const row = (rows ?? []).find((r) => r.id === id);
    if (row) return mapApiPortfolioTransaction(row);
  } catch {
    /* no fixture fallback — only live API rows */
  }
  return undefined;
}

/* ── Derived transactions so every listed entry is tappable ─────── */

const refFor = (seed: string) => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
  let out = "";
  let n = h;
  for (let i = 0; i < 8; i++) {
    out += chars[n % chars.length];
    n = Math.floor(n / chars.length) + 7 * (i + 1);
  }
  return `KPT-${out}`;
};

const callStatus: Record<string, TxnStatus> = {
  successful: "Successful",
  processing: "Processing",
  pending: "Pending",
  failed: "Failed",
};

/** Call Account activity rows (MOB-061) as full transactions. */
export const CALL_ACTIVITY_TXNS: Transaction[] = CALL_ACTIVITY.map((a) => {
  const credit = a.kind !== "withdrawal";
  const type: TxnType =
    a.kind === "interest" ? "Interest" : a.kind === "deposit" ? "Deposit" : "Withdrawal";
  return {
    id: `ca-${a.id}`,
    reference: refFor(`ca-${a.id}`),
    type,
    status: callStatus[a.status] ?? "Successful",
    label: `${a.label} · Call Account`,
    date: a.date,
    time: "09:00",
    createdAt: "",
    amount: a.amount,
    direction: credit ? "in" : "out",
    source: credit ? (a.kind === "interest" ? "Kipit Call Account" : "Kipit Wallet") : "Kipit Call Account",
    destination: credit ? "Kipit Call Account" : "Kipit Wallet",
  };
});

/** Per-holding transaction rows (MOB-121) as full transactions. */
export const HOLDING_TXNS: Transaction[] = HOLDING_DETAILS.flatMap((h) =>
  h.transactions.map((t, i) => ({
    id: `h-${h.id}-${i}`,
    reference: refFor(`h-${h.id}-${i}`),
    type: (t.label.toLowerCase().includes("interest") ? "Interest" : "Investment") as TxnType,
    status: "Successful" as TxnStatus,
    label: `${t.label} · ${h.name}`,
    date: t.date,
    time: "10:00",
    createdAt: "",
    amount: t.amount,
    direction: t.direction,
    source: t.direction === "out" ? "Kipit Wallet" : h.name,
    destination: t.direction === "out" ? h.name : "Kipit Wallet",
    related: { name: h.name, holdingId: h.id },
  })),
);

/** Every transaction the prototype can open a detail/receipt for. */
export const ALL_TRANSACTIONS: Transaction[] = [
  ...TRANSACTIONS,
  ...CALL_ACTIVITY_TXNS,
  ...HOLDING_TXNS,
];

/** Transaction id for a Call Account activity row. */
export const callActivityTxnId = (activityId: string) => `ca-${activityId}`;
/** Transaction id for a holding transaction row. */
export const holdingTxnId = (holdingId: string, index: number) =>
  `h-${holdingId}-${index}`;
