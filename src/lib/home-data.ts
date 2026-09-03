import {
  ArrowDownLeft,
  ArrowUpRight,
  FileText,
  PlusCircle,
  type LucideIcon,
} from "lucide-react";

/**
 * Single source of truth for the Home Dashboard (MOB-020 / WEB-002).
 * Every home concept renders the same reconciled figures.
 */
export const WALLET = 500_000;
export const INVESTED = 2_450_000;
export const TOTAL = WALLET + INVESTED; // ₦2,950,000
export const WEEK_EARNINGS = 12_480;
export const MONTH_CHANGE = 38_200;
export const MONTH_CHANGE_PCT = 1.58;

export const naira = (value: number) =>
  `₦${value.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;

/** Next maturity — name, amount, maturity date, days remaining (MOB-020). */
export const NEXT_MATURITY = {
  name: "Kipit Fixed Income",
  tenor: "90 days",
  amount: 750_000,
  rate: "19.2% p.a.",
  date: "24 Sep 2026",
  daysLeft: 22,
  totalDays: 90,
  expectedPayout: 785_500,
};

export const HOLDINGS = [
  {
    name: "Kipit Fixed Income",
    rate: "19.2% p.a.",
    amount: 750_000,
    date: "24 Sep 2026",
    daysLeft: 22,
    totalDays: 90,
    expectedPayout: 785_500,
    autoRenew: true,
  },
  {
    name: "Kipit Target Savings",
    rate: "16.0% p.a.",
    amount: 900_000,
    date: "12 Dec 2026",
    daysLeft: 101,
    totalDays: 180,
    expectedPayout: 971_000,
    autoRenew: false,
  },
  {
    name: "Kipit Vault (365d)",
    rate: "21.5% p.a.",
    amount: 800_000,
    date: "03 Jun 2027",
    daysLeft: 274,
    totalDays: 365,
    expectedPayout: 972_000,
    autoRenew: false,
  },
];


/** Upcoming interest / maturity payouts. */
export const PAYOUTS = [
  { label: "Interest credit · Fixed Income", date: "08 Sep 2026", amount: 11_840 },
  { label: "Interest credit · Target Savings", date: "15 Sep 2026", amount: 12_000 },
  { label: "Maturity · Kipit Fixed Income", date: "24 Sep 2026", amount: 785_500 },
  { label: "Interest credit · Vault", date: "03 Oct 2026", amount: 14_330 },
];

export type QuickAction = {
  label: string;
  icon: LucideIcon;
  to:
    | "/call-account/add-money"
    | "/call-account"
    | "/withdraw"
    | "/fixed-plans/create"
    | "/portfolio/transactions";
};

/** MOB-020 quick actions and their prototype destinations. */
export const QUICK_ACTIONS: QuickAction[] = [
  { label: "Add Money", icon: ArrowDownLeft, to: "/call-account/add-money" },
  { label: "Withdraw", icon: ArrowUpRight, to: "/withdraw" },
  { label: "New Plan", icon: PlusCircle, to: "/fixed-plans/create" },
  { label: "Statements", icon: FileText, to: "/portfolio/transactions" },
];

/** Content feed — product updates, education, announcements. */
export const FEED = [
  {
    tag: "Product update",
    title: "Kipit Fixed Income now settles same-day",
    body: "Maturity payouts land in your wallet within minutes of maturity.",
  },
  {
    tag: "Education",
    title: "Understanding tenor and effective yield",
    body: "A 3-minute read on how rate and tenor shape your real return.",
  },
  {
    tag: "Announcement",
    title: "Tier 2 verification is now instant",
    body: "Upgrade with your BVN and NIN to raise your transaction limits.",
  },
];

/** Weekly interest series used by the earnings chart (Mon–Sun). */
export const WEEK_SERIES = [1_320, 1_610, 1_540, 2_010, 1_880, 2_150, 1_970];
export const WEEK_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
