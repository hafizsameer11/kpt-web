/**
 * Kipit Reports (MOB-129) — monthly, quarterly and annual performance reporting.
 * Empty/zero until reports hydrate from API.
 */
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
