/**
 * Kipit Reports (MOB-129 / B21) — monthly, quarterly and annual performance reporting.
 * Interest = accrued across plans + Call for the period; growth = return only.
 */
import {
  fetchCallAccount,
  fetchHome,
  fetchPlacements,
  fetchPortfolioTransactions,
  getAccessToken,
} from "@/lib/api";
import {
  interestBreakdownFromNetRate,
  NET_FROM_GROSS,
  type InterestBreakdown,
} from "@/lib/wht";

export type ReportPeriod = "Monthly" | "Quarterly" | "Annual";

export type Report = {
  period: ReportPeriod;
  label: string;
  range: string;
  openingValue: number;
  closingValue: number;
  /** Return only (net interest), not contributions. */
  growthAmount: number;
  growthPct: number;
  interestEarned: number;
  interestGross: number;
  interestWht: number;
  interestNet: number;
  interestBreakdown: InterestBreakdown | null;
  averageRate: string;
  bestPerformer: string;
  contributions: number;
  withdrawals: number;
  /** Portfolio value trend used by the report chart. */
  series: number[];
  seriesLabels: string[];
  summary: string;
};

const emptyReport = (period: ReportPeriod, label: string, range: string): Report => ({
  period,
  label,
  range,
  openingValue: 0,
  closingValue: 0,
  growthAmount: 0,
  growthPct: 0,
  interestEarned: 0,
  interestGross: 0,
  interestWht: 0,
  interestNet: 0,
  interestBreakdown: null,
  averageRate: "—",
  bestPerformer: "—",
  contributions: 0,
  withdrawals: 0,
  series: [],
  seriesLabels: [],
  summary: "No report data yet.",
});

export const REPORTS: Record<ReportPeriod, Report> = {
  Monthly: emptyReport("Monthly", "This month", "—"),
  Quarterly: emptyReport("Quarterly", "This quarter", "—"),
  Annual: emptyReport("Annual", "Year to date", "—"),
};

export const REPORT_PERIODS: ReportPeriod[] = ["Monthly", "Quarterly", "Annual"];

function periodStart(period: ReportPeriod) {
  const now = new Date();
  if (period === "Monthly") return new Date(now.getFullYear(), now.getMonth(), 1);
  if (period === "Quarterly") {
    const q = Math.floor(now.getMonth() / 3) * 3;
    return new Date(now.getFullYear(), q, 1);
  }
  return new Date(now.getFullYear(), 0, 1);
}

function fmtRange(start: Date, end: Date) {
  const opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" };
  return `${start.toLocaleDateString("en-NG", opts)} — ${end.toLocaleDateString("en-NG", opts)}`;
}

function daysBetween(a: Date, b: Date) {
  const ms = b.getTime() - a.getTime();
  return Math.max(0, Math.floor(ms / (24 * 60 * 60 * 1000)));
}

function parseDay(iso: string | null | undefined) {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

function clampRange(start: Date, end: Date, from: Date, to: Date) {
  const s = start > from ? start : from;
  const e = end < to ? end : to;
  return s <= e ? { start: s, end: e } : null;
}

export async function hydrateReportsFromApi() {
  if (!getAccessToken()) return REPORTS;
  try {
    const [home, txns, placements, call] = await Promise.all([
      fetchHome().catch(() => null),
      fetchPortfolioTransactions().catch(() => []),
      fetchPlacements().catch(() => []),
      fetchCallAccount().catch(() => null),
    ]);
    const closing = home ? home.total.balance : 0;
    const now = new Date();
    const active = (Array.isArray(placements) ? placements : []).filter((p) =>
      ["ACTIVE", "BREAK_PENDING"].includes(String(p.status).toUpperCase()),
    );

    for (const period of REPORT_PERIODS) {
      const start = periodStart(period);
      const periodDays = Math.max(1, daysBetween(start, now));

      let contributions = 0;
      let withdrawals = 0;
      for (const row of Array.isArray(txns) ? txns : []) {
        const d = new Date(row.createdAt);
        if (Number.isNaN(d.getTime()) || d < start || d > now) continue;
        const amount = Number(row.amount) || 0;
        const kind = String(row.kind || "").toUpperCase();
        const credit = String(row.direction).toLowerCase() !== "debit";
        if (kind.includes("INTEREST") || kind.includes("ACCRUAL")) continue;
        if (credit) contributions += Math.abs(amount);
        else withdrawals += Math.abs(amount);
      }

      let interestNet = 0;
      let interestGross = 0;
      let interestWht = 0;
      let rateWeight = 0;
      let rateSum = 0;

      for (const p of active) {
        const pStart = parseDay(p.startDate) ?? start;
        const pEnd = parseDay(p.maturityDate) ?? now;
        const overlap = clampRange(pStart, pEnd < now ? pEnd : now, start, now);
        if (!overlap) continue;
        const days = Math.max(1, daysBetween(overlap.start, overlap.end));
        const bd = interestBreakdownFromNetRate({
          principal: p.principal || 0,
          netRatePct: p.ratePct || 0,
          days,
          payout: p.interestPayout ?? "AT_MATURITY",
        });
        // Prefer API accrued when the whole life falls in-period; else prorate for period.
        const useApiAccrued =
          pStart >= start &&
          p.accruedNet != null &&
          Number.isFinite(p.accruedNet) &&
          daysBetween(pStart, now) <= periodDays + 1;
        const net = useApiAccrued
          ? Number(p.accruedNet ?? p.accrued ?? bd.netInterest)
          : bd.netInterest;
        const gross = useApiAccrued
          ? Number(p.accruedGross ?? net / NET_FROM_GROSS)
          : bd.grossInterest;
        const wht = useApiAccrued ? Number(p.accruedWht ?? gross - net) : bd.withholdingTax;
        interestNet += net;
        interestGross += gross;
        interestWht += wht;
        rateSum += (p.ratePct || 0) * (p.principal || 0);
        rateWeight += p.principal || 0;
      }

      const callBal = call?.balance ?? 0;
      const callRate = call?.ratePct ?? 0;
      if (callBal > 0 && callRate > 0) {
        const callBd = interestBreakdownFromNetRate({
          principal: callBal,
          netRatePct: callRate,
          days: periodDays,
        });
        interestNet += callBd.netInterest;
        interestGross += callBd.grossInterest;
        interestWht += callBd.withholdingTax;
        rateSum += callRate * callBal;
        rateWeight += callBal;
      }

      interestNet = Math.round(interestNet);
      interestGross = Math.round(interestGross);
      interestWht = Math.round(interestWht);

      // Opening excludes period return; contributions/withdrawals stay separate (B21).
      const opening = Math.max(0, closing - contributions - interestNet + withdrawals);
      const growthAmount = interestNet;
      const growthPct = opening > 0 ? (growthAmount / opening) * 100 : 0;

      const buckets = period === "Monthly" ? 4 : period === "Quarterly" ? 3 : 6;
      const series: number[] = [];
      const seriesLabels: string[] = [];
      for (let i = 0; i < buckets; i++) {
        const pct = (i + 1) / buckets;
        series.push(Math.round(opening + growthAmount * pct + contributions * pct - withdrawals * pct));
        seriesLabels.push(period === "Annual" ? `M${i + 1}` : `W${i + 1}`);
      }

      const best = [...active].sort((a, b) => (b.ratePct || 0) - (a.ratePct || 0))[0];
      const avgRate = rateWeight > 0 ? rateSum / rateWeight : best?.ratePct;
      const breakdown =
        interestNet > 0
          ? interestBreakdownFromNetRate({
              principal: Math.max(opening, 1),
              netRatePct: avgRate ?? 0,
              days: periodDays,
            })
          : null;
      // Override amounts with period totals so UI matches download.
      const interestBreakdown: InterestBreakdown | null = breakdown
        ? {
            ...breakdown,
            grossInterest: interestGross,
            withholdingTax: interestWht,
            netInterest: interestNet,
            valueAtMaturity: opening + interestNet,
          }
        : interestNet > 0
          ? {
              principal: opening,
              days: periodDays,
              netRatePct: avgRate ?? 0,
              grossRatePct: (avgRate ?? 0) / NET_FROM_GROSS,
              whtRatePct: 10,
              grossInterest: interestGross,
              withholdingTax: interestWht,
              netInterest: interestNet,
              valueAtMaturity: opening + interestNet,
            }
          : null;

      REPORTS[period] = {
        period,
        label:
          period === "Monthly"
            ? "This month"
            : period === "Quarterly"
              ? "This quarter"
              : "Year to date",
        range: fmtRange(start, now),
        openingValue: Math.round(opening),
        closingValue: Math.round(closing),
        growthAmount: Math.round(growthAmount),
        growthPct: Math.round(growthPct * 10) / 10,
        interestEarned: interestNet,
        interestGross,
        interestWht,
        interestNet,
        interestBreakdown,
        averageRate: avgRate != null ? `${avgRate.toFixed(2)}%` : "—",
        bestPerformer: best?.name || "—",
        contributions: Math.round(contributions),
        withdrawals: Math.round(withdrawals),
        series,
        seriesLabels,
        summary:
          closing > 0
            ? `Return of ₦${interestNet.toLocaleString("en-NG")} net interest (₦${interestGross.toLocaleString("en-NG")} gross less ₦${interestWht.toLocaleString("en-NG")} WHT). Contributions and withdrawals are shown separately.`
            : "No report data yet.",
      };
    }
  } catch {
    /* keep last */
  }
  return REPORTS;
}
