/**
 * MOB-060 — Invest landing data.
 * Rate, liquidity/tenor and minimum always travel together (Global rule 3.3).
 */
export const CALL_ACCOUNT = {
  name: "Kipit Call Account",
  rate: "14.5% p.a.",
  liquidity: "Withdraw anytime",
  minimum: 5_000,
  balance: 500_000,
  accruedToday: 198,
  accruedThisMonth: 4_120,
  blurb:
    "Interest accrues daily on your idle cash and is credited monthly. No lock-in, no penalty.",
};

export type FixedPlan = {
  name: string;
  rate: string;
  tenor: string;
  minimum: number;
  tag?: string;
  blurb: string;
};

export const FIXED_PLANS: FixedPlan[] = [
  {
    name: "Kipit Fixed Income",
    rate: "19.2% p.a.",
    tenor: "90 days",
    minimum: 100_000,
    tag: "Most popular",
    blurb: "A short, predictable tenor with interest paid at maturity.",
  },
  {
    name: "Kipit Target Savings",
    rate: "16.0% p.a.",
    tenor: "180 days",
    minimum: 50_000,
    blurb: "Set a goal and fund it on a schedule with auto-invest.",
  },
  {
    name: "Kipit Vault",
    rate: "21.5% p.a.",
    tenor: "365 days",
    minimum: 250_000,
    tag: "Highest rate",
    blurb: "Our longest tenor and best rate for money you can lock away.",
  },
  {
    name: "Kipit Starter",
    rate: "12.8% p.a.",
    tenor: "30 days",
    minimum: 10_000,
    blurb: "A one-month plan to try a fixed investment with a small amount.",
  },
];

/** Tenor bands surfaced on the Fixed plan landing (MOB-065 / MOB-067). */
export const TENOR_BANDS = [
  { name: "Kipit Starter", days: "30 days", rate: "12.8%", minimum: 10_000 },
  { name: "Kipit Fixed Income", days: "90 days", rate: "19.2%", minimum: 100_000 },
  { name: "Kipit Target Savings", days: "180 days", rate: "16.0%", minimum: 50_000 },
  { name: "Kipit Vault", days: "365 days", rate: "21.5%", minimum: 250_000 },
];
