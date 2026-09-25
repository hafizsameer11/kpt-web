/**
 * MOB-060 — Invest landing data.
 * Rate, liquidity/tenor and minimum always travel together (Global rule 3.3).
 * Tenor bands hydrate from /v1/invest/rates — empty with loading until then.
 */
import { useEffect, useSyncExternalStore } from "react";
import { fetchInvestRates, type ApiRateBand } from "@/lib/api";

export const CALL_ACCOUNT = {
  name: "Kipit Call Account",
  rate: "—",
  liquidity: "Withdraw anytime",
  minimum: 5_000,
  balance: 0,
  accruedToday: 0,
  accruedThisMonth: 0,
  blurb:
    "Interest accrues daily on your idle cash and is credited monthly. No lock-in, no penalty.",
};

/** Sync call balance/rate labels after hydrateLiveBalances. */
export function syncCallAccountFromLive(balance: number, ratePct: number) {
  CALL_ACCOUNT.balance = Math.max(0, Math.round(balance));
  CALL_ACCOUNT.rate = ratePct ? `${ratePct}% p.a.` : "—";
  CALL_ACCOUNT.accruedToday = 0;
  CALL_ACCOUNT.accruedThisMonth = 0;
}

export type FixedPlan = {
  name: string;
  rate: string;
  tenor: string;
  minimum: number;
  tag?: string;
  blurb: string;
};

export type TenorBand = {
  name: string;
  days: string;
  rate: string;
  minimum: number;
  featured?: boolean;
};

export let FIXED_PLANS: FixedPlan[] = [];
export let TENOR_BANDS: TenorBand[] = [];
export let ratesLoading = true;

const rateListeners = new Set<() => void>();
function emitRates() {
  rateListeners.forEach((l) => l());
}
export function subscribeRates(listener: () => void) {
  rateListeners.add(listener);
  return () => {
    rateListeners.delete(listener);
  };
}

function mapBands(bands: ApiRateBand[]) {
  const fixed = bands.filter((b) => b.code !== "CALL" && b.minDays > 0);
  TENOR_BANDS = fixed.map((b, i) => {
    const days = b.maxDays ?? b.minDays;
    return {
      name: b.label,
      days: `${days} days`,
      rate: `${b.ratePct}%`,
      minimum: 0,
      featured: i === 0,
    };
  });
  FIXED_PLANS = fixed.map((b) => {
    const days = b.maxDays ?? b.minDays;
    return {
      name: b.label,
      rate: `${b.ratePct}% p.a.`,
      tenor: `${days} days`,
      minimum: 0,
      blurb: `${b.label} at ${b.ratePct}% p.a.`,
    };
  });
  const call = bands.find((b) => b.code === "CALL");
  if (call) {
    CALL_ACCOUNT.rate = `${call.ratePct}% p.a.`;
  }
}

export async function hydrateInvestRatesFromApi() {
  ratesLoading = true;
  emitRates();
  try {
    const bands = await fetchInvestRates();
    mapBands(Array.isArray(bands) ? bands : []);
  } catch {
    TENOR_BANDS = [];
    FIXED_PLANS = [];
  } finally {
    ratesLoading = false;
    emitRates();
  }
  return TENOR_BANDS;
}

export function useTenorBands() {
  const tick = useSyncExternalStore(
    subscribeRates,
    () => `${ratesLoading}:${TENOR_BANDS.length}:${TENOR_BANDS.map((b) => b.rate).join(",")}`,
    () => "0",
  );
  useEffect(() => {
    void hydrateInvestRatesFromApi();
  }, []);
  void tick;
  return { bands: TENOR_BANDS, loading: ratesLoading, plans: FIXED_PLANS };
}

/** MOB-061 — Call Account detail: how interest is earned. */
export const CALL_ACCOUNT_FACTS = [
  "Daily interest on your cleared balance.",
  "Credited monthly on the 1st.",
  "Withdraw anytime with no penalty.",
  "Managed by Kipit's SEC-licensed partner.",
];

export type CallActivityStatus = "successful" | "processing" | "pending" | "failed";

export type CallActivity = {
  id: string;
  kind: "deposit" | "withdrawal" | "interest";
  label: string;
  date: string;
  amount: number;
  status: CallActivityStatus;
};

/** Recent Call Account activity — empty until API hydrate. */
export const CALL_ACTIVITY: CallActivity[] = [];

/** Accrual trend (14 daily interest amounts, oldest → today). */
export const CALL_ACCRUAL_TREND: number[] = Array.from({ length: 14 }, () => 0);

const TREND_DAYS = 14;

function localYmd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Parse API `YYYY-MM-DD` (or ISO) as a civil calendar key — no UTC shift. */
export function activityDateKey(raw: string) {
  const day = (raw || "").slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : "";
}

/**
 * Last `days` of daily Call interest (oldest → today), matching activity rows.
 * Dedupes by id so a journal entry can't inflate the chart.
 */
export function buildCallAccrualTrend(
  rows: CallActivity[],
  days = TREND_DAYS,
): number[] {
  const byDate = new Map<string, number>();
  const seen = new Set<string>();
  for (const row of rows) {
    if (row.kind !== "interest" || row.status === "failed") continue;
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    const key = activityDateKey(row.date);
    if (!key) continue;
    byDate.set(key, (byDate.get(key) ?? 0) + Math.max(0, Math.round(row.amount)));
  }

  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const series: number[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    series.push(byDate.get(localYmd(d)) ?? 0);
  }
  return series;
}

function applyAccrualTotals(rows: CallActivity[], series: number[]) {
  CALL_ACCRUAL_TREND.length = 0;
  CALL_ACCRUAL_TREND.push(...series);

  const todayKey = localYmd(new Date());
  const byDate = new Map<string, number>();
  const seen = new Set<string>();
  for (const row of rows) {
    if (row.kind !== "interest" || row.status === "failed") continue;
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    const key = activityDateKey(row.date);
    if (!key) continue;
    byDate.set(key, (byDate.get(key) ?? 0) + Math.max(0, Math.round(row.amount)));
  }

  CALL_ACCOUNT.accruedToday = byDate.get(todayKey) ?? 0;

  const now = new Date();
  const monthKey = localYmd(new Date(now.getFullYear(), now.getMonth(), 1));
  let monthTotal = 0;
  for (const [key, amt] of byDate) {
    if (key >= monthKey && key <= todayKey) monthTotal += amt;
  }
  CALL_ACCOUNT.accruedThisMonth = monthTotal;
}

/**
 * Hydrate Call activity. Chart + totals use the same interest rows as the list
 * (interest prioritized so a busy ledger can't hide credits from the series).
 */
export function setCallActivityFromApi(rows: CallActivity[]) {
  const interest = rows.filter((r) => r.kind === "interest");
  const other = rows.filter((r) => r.kind !== "interest");
  const display = [...interest, ...other].slice(0, 20);

  CALL_ACTIVITY.length = 0;
  CALL_ACTIVITY.push(...display);

  // Full interest history from this fetch powers the 14-day series.
  const series = buildCallAccrualTrend(interest, TREND_DAYS);
  applyAccrualTotals(interest, series);
}

/** Matured fixed plans — empty until API hydrate. */
export const MATURED_PLANS: {
  name: string;
  rate: string;
  principal: number;
  payout: number;
  tenor: string;
  maturedOn: string;
  status: string;
}[] = [];

/** Auto-invest rules — recurring funding schedules for Kipit plans. */
export type AutoInvestFrequency = "Weekly" | "Every 2 weeks" | "Monthly";

export type AutoInvestRule = {
  id: string;
  destination: string;
  rate: string;
  amount: number;
  frequency: AutoInvestFrequency;
  nextRun: string;
  fundedFrom: string;
  investedToDate: number;
  active: boolean;
};

export const AUTO_INVEST_FREQUENCIES: AutoInvestFrequency[] = [
  "Weekly",
  "Every 2 weeks",
  "Monthly",
];

export let AUTO_INVEST_DESTINATIONS: { name: string; rate: string; minimum: number }[] = [
  { name: "Kipit Call Account", rate: "—", minimum: 5_000 },
];

export const AUTO_INVEST_RULES: AutoInvestRule[] = [];
