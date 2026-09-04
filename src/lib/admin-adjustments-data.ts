/**
 * Plan adjustment fixtures (ADM-080 – ADM-081).
 * Prototype-only data: maker-checker controlled changes to live investments,
 * with mandatory reasons and immutable before/after records.
 */

export type AdjustmentType =
  | "rate"
  | "tenor"
  | "maturity-date"
  | "principal"
  | "payout-frequency"
  | "status";

export type AdjustmentStatus = "awaiting" | "approved" | "rejected";

export type AdjustableInvestment = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  product: string;
  reference: string;
  principal: number;
  rate: number;
  tenorDays: number;
  startDate: string;
  maturityDate: string;
  payoutFrequency: string;
  status: string;
};

export type AdjustmentRequest = {
  id: string;
  investmentId: string;
  userName: string;
  product: string;
  reference: string;
  type: AdjustmentType;
  previous: string;
  proposed: string;
  reason: string;
  submittedBy: string;
  submittedAt: string;
  status: AdjustmentStatus;
  impact: string;
  decidedBy?: string;
  decidedAt?: string;
  decisionNote?: string;
};

export const ADJUSTMENT_TYPE_LABEL: Record<AdjustmentType, string> = {
  rate: "Rate",
  tenor: "Tenor",
  "maturity-date": "Maturity date",
  principal: "Principal",
  "payout-frequency": "Payout frequency",
  status: "Plan status",
};

export const ADJUSTMENT_STATUS_LABEL: Record<AdjustmentStatus, string> = {
  awaiting: "Awaiting approval",
  approved: "Approved",
  rejected: "Rejected",
};

export const ADJUSTMENT_STATUS_TONE: Record<AdjustmentStatus, string> = {
  awaiting: "bg-gold/25 text-gold-foreground ring-gold/40",
  approved: "bg-emerald-500/12 text-emerald-700 ring-emerald-500/20",
  rejected: "bg-destructive/10 text-destructive ring-destructive/20",
};

export const ADJUSTABLE_INVESTMENTS: AdjustableInvestment[] = [
  {
    id: "inv-3011",
    userId: "u-1004",
    userName: "Amaka Obi",
    userEmail: "amaka.obi@example.com",
    product: "Kipit Fixed 180",
    reference: "KPF-180-3011",
    principal: 4_500_000,
    rate: 19.5,
    tenorDays: 180,
    startDate: "2026-05-14",
    maturityDate: "2026-11-10",
    payoutFrequency: "At maturity",
    status: "Active",
  },
  {
    id: "inv-3042",
    userId: "u-1011",
    userName: "Tunde Bakare",
    userEmail: "tunde.bakare@example.com",
    product: "Kipit Fixed 90",
    reference: "KPF-090-3042",
    principal: 1_250_000,
    rate: 17.25,
    tenorDays: 90,
    startDate: "2026-07-02",
    maturityDate: "2026-09-30",
    payoutFrequency: "Monthly",
    status: "Active",
  },
  {
    id: "inv-3077",
    userId: "u-1029",
    userName: "Chiamaka Eze",
    userEmail: "chiamaka.eze@example.com",
    product: "Kipit Fixed 365",
    reference: "KPF-365-3077",
    principal: 12_000_000,
    rate: 21.0,
    tenorDays: 365,
    startDate: "2026-02-20",
    maturityDate: "2027-02-20",
    payoutFrequency: "Quarterly",
    status: "Active",
  },
  {
    id: "inv-3090",
    userId: "u-1044",
    userName: "Ibrahim Musa",
    userEmail: "ibrahim.musa@example.com",
    product: "Explore — FGN Bond 2029",
    reference: "KPE-BND-3090",
    principal: 7_800_000,
    rate: 18.4,
    tenorDays: 730,
    startDate: "2026-03-11",
    maturityDate: "2028-03-10",
    payoutFrequency: "Semi-annual",
    status: "Active",
  },
  {
    id: "inv-3105",
    userId: "u-1058",
    userName: "Ngozi Adeyemi",
    userEmail: "ngozi.adeyemi@example.com",
    product: "Kipit Call Account",
    reference: "KPC-3105",
    principal: 2_100_000,
    rate: 12.5,
    tenorDays: 0,
    startDate: "2026-06-01",
    maturityDate: "—",
    payoutFrequency: "Daily accrual",
    status: "Active",
  },
];

export const ADJUSTMENT_REQUESTS: AdjustmentRequest[] = [
  {
    id: "adj-2081",
    investmentId: "inv-3011",
    userName: "Amaka Obi",
    product: "Kipit Fixed 180",
    reference: "KPF-180-3011",
    type: "rate",
    previous: "19.50%",
    proposed: "20.25%",
    reason:
      "Relationship pricing approved for a top-20 depositor after a ₦4.5m rollover commitment.",
    submittedBy: "Deborah Okon · Treasury",
    submittedAt: "2026-09-03 14:22",
    status: "awaiting",
    impact: "Adds ~₦16,900 to interest payable at maturity.",
  },
  {
    id: "adj-2082",
    investmentId: "inv-3042",
    userName: "Tunde Bakare",
    product: "Kipit Fixed 90",
    reference: "KPF-090-3042",
    type: "maturity-date",
    previous: "30 Sep 2026",
    proposed: "14 Oct 2026",
    reason:
      "Customer requested a two-week extension in writing; funding date was booked one day late by operations.",
    submittedBy: "Femi Ade · Operations",
    submittedAt: "2026-09-03 09:41",
    status: "awaiting",
    impact: "Extends tenor by 14 days; interest accrues at the existing rate.",
  },
  {
    id: "adj-2083",
    investmentId: "inv-3077",
    userName: "Chiamaka Eze",
    product: "Kipit Fixed 365",
    reference: "KPF-365-3077",
    type: "payout-frequency",
    previous: "Quarterly",
    proposed: "Monthly",
    reason: "Signed instruction received to switch coupon frequency for cash flow needs.",
    submittedBy: "Deborah Okon · Treasury",
    submittedAt: "2026-09-02 16:05",
    status: "awaiting",
    impact: "Changes payout schedule only; total interest unchanged.",
  },
  {
    id: "adj-2079",
    investmentId: "inv-3090",
    userName: "Ibrahim Musa",
    product: "Explore — FGN Bond 2029",
    reference: "KPE-BND-3090",
    type: "principal",
    previous: "₦7,500,000",
    proposed: "₦7,800,000",
    reason: "Under-allocation at booking; ₦300,000 was debited but not placed.",
    submittedBy: "Femi Ade · Operations",
    submittedAt: "2026-08-29 11:18",
    status: "approved",
    impact: "Corrects principal to match the settled wallet debit.",
    decidedBy: "Seyi Adeleke · Global Admin",
    decidedAt: "2026-08-29 12:02",
    decisionNote: "Ledger and provider statement both confirm the ₦300,000 debit.",
  },
  {
    id: "adj-2075",
    investmentId: "inv-3105",
    userName: "Ngozi Adeyemi",
    product: "Kipit Call Account",
    reference: "KPC-3105",
    type: "rate",
    previous: "12.50%",
    proposed: "15.00%",
    reason: "Retention offer requested by growth team.",
    submittedBy: "Kelechi Nwosu · Growth",
    submittedAt: "2026-08-26 10:30",
    status: "rejected",
    impact: "Would price the call account above the approved band ceiling.",
    decidedBy: "Seyi Adeleke · Global Admin",
    decidedAt: "2026-08-26 15:44",
    decisionNote: "Outside approved band. Raise a rate change proposal instead.",
  },
];

export function findAdjustment(id: string) {
  return ADJUSTMENT_REQUESTS.find((r) => r.id === id);
}

export function findAdjustableInvestment(id: string) {
  return ADJUSTABLE_INVESTMENTS.find((i) => i.id === id);
}
