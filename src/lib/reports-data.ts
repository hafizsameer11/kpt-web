/**
 * Kipit Reports (MOB-129) — monthly, quarterly and annual performance reporting.
 * Hydrates from /v1/me/home + portfolio transactions (parity with KipitApp reportData).
 */
import { fetchHome, fetchPortfolioTransactions, getAccessToken } from "@/lib/api";

export type ReportPeriod = "Monthly" | "Quarterly" | "Annual";

export type Report = {
  period: ReportPeriod;
  label: string;
  range: string;
  openingValue: number;
  closingValue: number;
  growthPct: number;
  interestEarned: number;
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
  growthPct: 0,
  interestEarned: 0,
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

export async function hydrateReportsFromApi() {
  if (!getAccessToken()) return REPORTS;
  try {
    const [home, txns] = await Promise.all([
      fetchHome().catch(() => null),
      fetchPortfolioTransactions().catch(() => []),
    ]);
    const closing = home ? home.total.balance : 0;
    const now = new Date();
    for (const period of REPORT_PERIODS) {
      const start = periodStart(period);
      const rows = (Array.isArray(txns) ? txns : []).filter((t) => {
        const d = new Date(t.createdAt);
        return !Number.isNaN(d.getTime()) && d >= start && d <= now;
      });
      let contributions = 0;
      let withdrawals = 0;
      let interestEarned = 0;
      for (const row of rows) {
        const amount = Number(row.amount) || 0;
        const kind = String(row.kind || "").toUpperCase();
        const credit = String(row.direction).toLowerCase() !== "debit";
        if (kind.includes("INTEREST") || kind.includes("ACCRUAL")) {
          interestEarned += Math.abs(amount);
        } else if (credit) {
          contributions += Math.abs(amount);
        } else {
          withdrawals += Math.abs(amount);
        }
      }
      const opening = Math.max(0, closing - contributions - interestEarned + withdrawals);
      const growthPct = opening > 0 ? ((closing - opening) / opening) * 100 : 0;
      const buckets = period === "Monthly" ? 4 : period === "Quarterly" ? 3 : 6;
      const series: number[] = [];
      const seriesLabels: string[] = [];
      for (let i = 0; i < buckets; i++) {
        const pct = (i + 1) / buckets;
        series.push(Math.round(opening + (closing - opening) * pct));
        seriesLabels.push(period === "Annual" ? `M${i + 1}` : `W${i + 1}`);
      }
      const best = [...(home?.holdings ?? [])].sort((a, b) => b.ratePct - a.ratePct)[0];
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
        growthPct: Math.round(growthPct * 10) / 10,
        interestEarned: Math.round(interestEarned),
        averageRate: best ? `${best.ratePct}%` : "—",
        bestPerformer: best?.name || "—",
        contributions: Math.round(contributions),
        withdrawals: Math.round(withdrawals),
        series,
        seriesLabels,
        summary:
          closing > 0
            ? `Portfolio closed at ₦${Math.round(closing).toLocaleString("en-NG")} with ₦${Math.round(interestEarned).toLocaleString("en-NG")} interest in period.`
            : "No report data yet.",
      };
    }
  } catch {
    /* keep last */
  }
  return REPORTS;
}
