/**
 * MOB-060 — Invest landing data.
 * Rate, liquidity/tenor and minimum always travel together (Global rule 3.3).
 * Tenor bands hydrate from /v1/invest/rates — empty with loading until then.
 */
import { useEffect, useSyncExternalStore } from "react";
import {
  fetchInvestRates,
  fetchInvestRatesCatalog,
  type ApiInvestRates,
  type ApiRateBand,
} from "@/lib/api";

export const PLAN_MIN_NAIRA = 1_000;
export const LOCK_STANDARD_TENORS = [30, 60, 90, 180, 365] as const;
export const FLEX_STANDARD_TENORS = [60, 90, 180, 365] as const;
export const CUSTOM_MIN_DAYS = 31;
export const CUSTOM_MAX_DAYS = 365;
export const FLEX_BREAK_MIN_DAYS = 30;
/** Consent wording version recorded with createFixedPlan (B13). */
export const PRODUCT_CONSENT_VERSION = "2026-11-lock-flex-v1";

export const CALL_ACCOUNT = {
  name: "Kipit Call Account",
  rate: "—",
  liquidity: "Withdraw anytime",
  minimum: 1_000,
  balance: 0,
  accruedToday: 0,
  accruedThisMonth: 0,
  custodianNote:
    "Your Call Account and wallet balances are held and administered by Rand Merchant Bank, our custodian.",
  blurb:
    "Interest accrues daily on your idle cash and is credited monthly. No lock-in, no penalty.",
};

/** B8 — Kipit Lock rules (full list on Invest tab). */
export const LOCK_RULES: string[] = [
  "Our highest rates — fixed for the full period.",
  "Choose 30, 60, 90, 180 or 365 days, or a custom period of 31 days or more.",
  "Interest can be paid Upfront (into your wallet on day one — withdraw, move to Call Account, or reinvest) or At maturity (with your principal).",
  "This plan cannot be broken, liquidated or withdrawn before its maturity date.",
  "At maturity, money is paid into your wallet, rolled over, or moved to your Call Account — based on the instruction you set.",
  "Start with as little as ₦1,000.",
];

/** B8 — Kipit Flex rules (full list on Invest tab). */
export const FLEX_RULES: string[] = [
  "A fixed rate with a way out if you need the money.",
  "Choose 60, 90, 180 or 365 days, or a custom period of 31 days or more (nothing 30 days or less).",
  "Interest is paid at maturity only.",
  "You can only break the plan after 30 days from the date you invest or from your most recent top-up.",
  "Breaking the plan withdraws the full amount — partial withdrawals are not allowed.",
  "If you break early, you lose 50% of the interest accrued up to that date. Your principal is not affected.",
  "Money from a broken plan is credited to your wallet within 3 business days.",
  "If you hold to maturity, you receive full interest.",
  "Start with as little as ₦1,000.",
];

export const LOCK_HOW_IT_WORKS = LOCK_RULES.join(" ");
export const FLEX_HOW_IT_WORKS = FLEX_RULES.join(" ");

export function lockConsentText(maturityDate: string) {
  return `I understand that this Kipit Lock plan cannot be broken, liquidated or withdrawn before its maturity date of ${maturityDate}. I have read and accept the Terms and Conditions.`;
}

export function flexConsentText(breakAvailableDate: string) {
  return `I understand that this Kipit Flex plan can only be broken from ${breakAvailableDate}; that breaking it withdraws the full amount; that I will lose 50% of the interest accrued up to the date I break it; and that the money will be credited to my wallet within 3 business days. I have read and accept the Terms and Conditions.`;
}

/** Sync call balance/rate labels after hydrateLiveBalances. */
export function syncCallAccountFromLive(balance: number, ratePct: number) {
  CALL_ACCOUNT.balance = Math.max(0, Math.round(balance));
  CALL_ACCOUNT.rate = ratePct ? `${ratePct}% p.a.` : "—";
  // accruedToday / accruedThisMonth come from Call activity hydration — don't wipe them.
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
export let INVEST_CATALOG: ApiInvestRates | null = null;

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

export type PlanFamily = "LOCK" | "FLEX";

export type CatalogTenor = {
  days: number;
  rate: string;
  ratePct: number;
  grossRatePct?: number | undefined;
  minimum: number;
  upfrontRate?: string | undefined;
  upfrontRatePct?: number | undefined;
};

function bandToCatalogTenor(band: ApiRateBand, minimum: number): CatalogTenor {
  const days =
    band.maxDays && band.maxDays > 0 ? band.maxDays : Math.max(band.minDays, 1);
  return {
    days,
    rate: band.rateLabel ?? `${band.ratePct}% net`,
    ratePct: band.ratePct,
    grossRatePct: band.grossRatePct,
    minimum: band.minimum && band.minimum > 0 ? band.minimum : minimum,
  };
}

/** Fallback minima when API omits `minimum` (B8/B9: ₦1,000 for Lock/Flex). */
function fallbackMinimum(code: string, minDays: number) {
  if (code === "CALL" || minDays <= 0) return 1_000;
  return 1_000;
}

function planDisplayName(b: ApiRateBand) {
  const days = b.maxDays && b.maxDays > 0 ? b.maxDays : Math.max(b.minDays, 1);
  if (b.family === "FLEX" || b.code.startsWith("FLEX_")) return `Kipit Flex, ${days} days`;
  if (b.family === "LOCK" || b.code.startsWith("LOCK_")) return `Kipit Lock, ${days} days`;
  // Legacy bands display as Kipit Lock (B4/B8).
  return `Kipit Lock, ${days} days`;
}

/** Prefer maxDays (band upper bound) as the displayed tenor when present. */
function tenorDays(b: ApiRateBand) {
  if (b.maxDays != null && b.maxDays > 0) return b.maxDays;
  return Math.max(b.minDays, 1);
}

function mapBands(bands: ApiRateBand[]) {
  // Prefer Lock at-maturity + Flex catalogue; fall back to any non-CALL bands.
  const lockFlex = bands.filter(
    (b) =>
      b.code !== "CALL" &&
      b.minDays > 0 &&
      (b.family === "LOCK" || b.family === "FLEX") &&
      (b.payout == null || b.payout === "AT_MATURITY"),
  );
  const legacy = bands.filter((b) => b.code !== "CALL" && b.minDays > 0 && !b.family);
  const fixed = lockFlex.length ? lockFlex : legacy;
  TENOR_BANDS = fixed.map((b) => {
    const name = planDisplayName(b);
    const days = tenorDays(b);
    const minimum = b.minimum && b.minimum > 0 ? b.minimum : fallbackMinimum(b.code, b.minDays);
    const rateLabel = b.rateLabel ?? `${b.ratePct}% net`;
    return {
      name,
      days: `${days} days`,
      rate: rateLabel,
      minimum,
      featured: days === 90,
    };
  });
  FIXED_PLANS = fixed.map((b) => {
    const name = planDisplayName(b);
    const days = tenorDays(b);
    const minimum = b.minimum && b.minimum > 0 ? b.minimum : fallbackMinimum(b.code, b.minDays);
    const rateLabel = b.rateLabel ?? `${b.ratePct}% net`;
    return {
      name,
      rate: `${rateLabel} p.a.`,
      tenor: `${days} days`,
      minimum,
      blurb: `${name} at ${rateLabel} p.a.`,
    };
  });
  const call = bands.find((b) => b.code === "CALL" || b.family === "CALL");
  if (call) {
    CALL_ACCOUNT.rate = call.rateLabel
      ? `${call.rateLabel} p.a.`
      : `${call.ratePct}% net p.a.`;
    if (call.minimum && call.minimum > 0) CALL_ACCOUNT.minimum = call.minimum;
    else CALL_ACCOUNT.minimum = 1_000;
  }
  AUTO_INVEST_DESTINATIONS = [
    {
      name: CALL_ACCOUNT.name,
      rate: CALL_ACCOUNT.rate.replace(/\s*p\.a\./i, "").trim() || "—",
      minimum: CALL_ACCOUNT.minimum,
    },
    ...FIXED_PLANS.map((p) => ({
      name: p.name,
      rate: p.rate.replace(/\s*p\.a\./i, "").trim(),
      minimum: p.minimum,
    })),
  ];
}

export async function hydrateInvestRatesFromApi() {
  ratesLoading = true;
  emitRates();
  try {
    const catalog = await fetchInvestRatesCatalog();
    INVEST_CATALOG = catalog;
    const bands = Array.isArray(catalog.bands) ? catalog.bands : [];
    mapBands(bands);
    if (catalog.minimum > 0) {
      CALL_ACCOUNT.minimum = Math.min(CALL_ACCOUNT.minimum || catalog.minimum, catalog.minimum);
    }
    if (catalog.call) {
      CALL_ACCOUNT.rate = catalog.call.rateLabel
        ? `${catalog.call.rateLabel} p.a.`
        : `${catalog.call.ratePct}% net p.a.`;
      if (catalog.call.minimum > 0) CALL_ACCOUNT.minimum = catalog.call.minimum;
    }
  } catch {
    try {
      const bands = await fetchInvestRates();
      mapBands(Array.isArray(bands) ? bands : []);
      INVEST_CATALOG = null;
    } catch {
      TENOR_BANDS = [];
      FIXED_PLANS = [];
      INVEST_CATALOG = null;
      AUTO_INVEST_DESTINATIONS = [
        {
          name: CALL_ACCOUNT.name,
          rate: CALL_ACCOUNT.rate.replace(/\s*p\.a\./i, "").trim() || "—",
          minimum: CALL_ACCOUNT.minimum,
        },
      ];
    }
  } finally {
    ratesLoading = false;
    emitRates();
  }
  return TENOR_BANDS;
}

/** Standard Lock/Flex tenors from the rates catalog (B8/B9). */
export function catalogTenorsFor(family: PlanFamily): CatalogTenor[] {
  const catalog = INVEST_CATALOG;
  const minimum = catalog?.minimum ?? PLAN_MIN_NAIRA;
  if (family === "LOCK" && catalog?.lock?.tenors?.length) {
    return catalog.lock.tenors
      .filter((t) => t.days != null && t.days > 0)
      .map((t) => {
        const base = bandToCatalogTenor(t.atMaturity, minimum);
        const upfront = t.upfront
          ? bandToCatalogTenor(t.upfront, minimum)
          : undefined;
        return {
          ...base,
          days: t.days!,
          upfrontRate: upfront?.rate,
          upfrontRatePct: upfront?.ratePct,
        };
      });
  }
  if (family === "FLEX" && catalog?.flex?.tenors?.length) {
    return catalog.flex.tenors
      .filter((t) => t.days != null && t.days > 0)
      .map((t) => ({
        ...bandToCatalogTenor(t.atMaturity, minimum),
        days: t.days!,
      }));
  }
  // Fallback from flat bands / defaults
  const standards = family === "LOCK" ? LOCK_STANDARD_TENORS : FLEX_STANDARD_TENORS;
  return standards.map((days) => {
    const match = TENOR_BANDS.find(
      (b) =>
        Number(b.days.replace(/\D/g, "")) === days &&
        (family === "FLEX"
          ? b.name.includes("Flex")
          : !b.name.includes("Flex")),
    );
    return {
      days,
      rate: match?.rate ?? "—",
      ratePct: match ? Number(match.rate.replace(/[^0-9.]/g, "")) || 0 : 0,
      minimum: match?.minimum ?? PLAN_MIN_NAIRA,
    };
  });
}

export function rateForCustomDays(
  family: PlanFamily,
  days: number,
  payout: "AT_MATURITY" | "UPFRONT" = "AT_MATURITY",
): CatalogTenor | null {
  const standards = catalogTenorsFor(family);
  if (!standards.length || days <= 0) return null;
  const sorted = [...standards].sort((a, b) => b.days - a.days);
  const match = sorted.find((t) => days >= t.days) ?? sorted[sorted.length - 1]!;
  if (family === "LOCK" && payout === "UPFRONT" && match.upfrontRatePct != null) {
    return {
      ...match,
      rate: match.upfrontRate ?? match.rate,
      ratePct: match.upfrontRatePct,
    };
  }
  return match;
}

/** Best advertised Lock at-maturity rate (for idle-cash estimate, B11). */
export function bestLockRatePct(): number {
  const lock = catalogTenorsFor("LOCK");
  return lock.reduce((max, t) => Math.max(max, t.ratePct || 0), 0);
}

export function useTenorBands() {
  const tick = useSyncExternalStore(
    subscribeRates,
    () =>
      `${ratesLoading}:${TENOR_BANDS.length}:${TENOR_BANDS.map((b) => b.rate).join(",")}:${INVEST_CATALOG?.lock?.tenors?.length ?? 0}`,
    () => "0",
  );
  useEffect(() => {
    void hydrateInvestRatesFromApi();
  }, []);
  void tick;
  return {
    bands: TENOR_BANDS,
    loading: ratesLoading,
    plans: FIXED_PLANS,
    catalog: INVEST_CATALOG,
    lockTenors: catalogTenorsFor("LOCK"),
    flexTenors: catalogTenorsFor("FLEX"),
    minimum: INVEST_CATALOG?.minimum ?? PLAN_MIN_NAIRA,
  };
}

/** MOB-061 — Call Account detail: how interest is earned. */
export const CALL_ACCOUNT_FACTS = [
  "Daily interest on your cleared balance.",
  "Credited monthly on the 1st.",
  "Withdraw anytime with no penalty.",
  "Managed by Kipit Asset Management Limited",
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
export type MaturedPlan = {
  id: string;
  name: string;
  rate: string;
  principal: number;
  payout: number;
  tenor: string;
  maturedOn: string;
  status: string;
};

export const MATURED_PLANS: MaturedPlan[] = [];

export function setMaturedPlans(rows: MaturedPlan[]) {
  MATURED_PLANS.splice(0, MATURED_PLANS.length, ...rows);
}

/** Auto-invest rules — recurring funding schedules for Kipit plans. */
export type AutoInvestFrequency =
  | "Every 10 minutes"
  | "Every hour"
  | "Weekly"
  | "Every 2 weeks"
  | "Monthly";

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
  "Every 10 minutes",
  "Every hour",
  "Weekly",
  "Every 2 weeks",
  "Monthly",
];

export let AUTO_INVEST_DESTINATIONS: { name: string; rate: string; minimum: number }[] = [
  { name: "Kipit Call Account", rate: "—", minimum: 1_000 },
];

export const AUTO_INVEST_RULES: AutoInvestRule[] = [];
