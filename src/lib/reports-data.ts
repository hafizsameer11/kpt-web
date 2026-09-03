/**
 * Kipit Reports (MOB-129) — monthly, quarterly and annual performance reporting.
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

export const REPORTS: Record<ReportPeriod, Report> = {
  Monthly: {
    period: "Monthly",
    label: "August 2026",
    range: "01 Aug – 31 Aug 2026",
    openingValue: 2_911_800,
    closingValue: 2_950_000,
    growthPct: 1.31,
    interestEarned: 38_200,
    averageRate: "18.4% p.a.",
    bestPerformer: "Kipit Vault (365d)",
    contributions: 250_000,
    withdrawals: 0,
    series: [2_911_800, 2_920_400, 2_929_100, 2_936_700, 2_950_000],
    seriesLabels: ["W1", "W2", "W3", "W4", "W5"],
    summary:
      "Your portfolio grew steadily through August, driven by daily Call Account accruals and interest on three active fixed plans.",
  },
  Quarterly: {
    period: "Quarterly",
    label: "Q3 2026",
    range: "01 Jul – 30 Sep 2026",
    openingValue: 2_720_500,
    closingValue: 2_950_000,
    growthPct: 8.44,
    interestEarned: 114_600,
    averageRate: "18.9% p.a.",
    bestPerformer: "Kipit Fixed Income",
    contributions: 400_000,
    withdrawals: 285_100,
    series: [2_720_500, 2_806_300, 2_911_800, 2_950_000],
    seriesLabels: ["Jul", "Aug", "Sep", "Now"],
    summary:
      "Q3 return was led by the 90-day Fixed Income plan. Reinvesting matured principal kept idle cash low across the quarter.",
  },
  Annual: {
    period: "Annual",
    label: "2026 year to date",
    range: "01 Jan – 03 Sep 2026",
    openingValue: 1_850_000,
    closingValue: 2_950_000,
    growthPct: 59.46,
    interestEarned: 402_350,
    averageRate: "18.1% p.a.",
    bestPerformer: "Kipit Vault (365d)",
    contributions: 900_000,
    withdrawals: 202_350,
    series: [
      1_850_000, 1_962_000, 2_105_000, 2_240_000, 2_388_000, 2_512_000,
      2_720_500, 2_911_800, 2_950_000,
    ],
    seriesLabels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"],
    summary:
      "Year to date your portfolio has compounded through nine months of continuous placement, with interest accounting for the majority of growth.",
  },
};

export const REPORT_PERIODS: ReportPeriod[] = ["Monthly", "Quarterly", "Annual"];
