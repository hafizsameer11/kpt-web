import {
  ArrowDownLeft,
  ArrowUpRight,
  FileText,
  PlusCircle,
  type LucideIcon,
} from "lucide-react";
import { LEARN_ARTICLES } from "@/lib/learn-data";


/**
 * Single source of truth for the Home Dashboard (MOB-020 / WEB-002).
 * Every home concept renders the same reconciled figures.
 */
/** Live wallet balance — moves when the user funds or withdraws. */
export let WALLET = getWalletBalance();
export const INVESTED = 2_450_000;
export let TOTAL = WALLET + INVESTED;

subscribeWallet((value) => {
  WALLET = value;
  TOTAL = WALLET + INVESTED;
});
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
    id: "f1",
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
    id: "f2",
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
    id: "f3",
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
    | "/wallet/add-money"
    | "/call-account"
    | "/withdraw"
    | "/fixed-plans/create"
    | "/portfolio/transactions";
};

/** MOB-020 quick actions and their prototype destinations. */
export const QUICK_ACTIONS: QuickAction[] = [
  { label: "Add Money", icon: ArrowDownLeft, to: "/wallet/add-money" },
  { label: "Withdraw", icon: ArrowUpRight, to: "/withdraw" },
  { label: "New Plan", icon: PlusCircle, to: "/fixed-plans/create" },
  { label: "Statements", icon: FileText, to: "/portfolio/transactions" },
];

/** Content feed — product updates, education, announcements. */
export const FEED = LEARN_ARTICLES.slice(0, 3).map((a) => ({
  id: a.id,
  tag: a.tag,
  title: a.title,
  body: a.body,
}));


/** Weekly interest series used by the earnings chart (Mon–Sun). */
export const WEEK_SERIES = [1_320, 1_610, 1_540, 2_010, 1_880, 2_150, 1_970];
export const WEEK_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
