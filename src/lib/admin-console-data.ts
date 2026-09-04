/**
 * Administration console — cross-cutting console data: notifications, global
 * search index, analytics series, export/report packs, operator preferences
 * and system settings. Prototype fixtures only.
 */

import { ADMIN_USERS, portfolioValue } from "./admin-users-data";

/* ------------------------------------------------------------------ */
/* Notifications centre                                                */
/* ------------------------------------------------------------------ */

export type NotificationKind =
  | "compliance"
  | "withdrawal"
  | "reconciliation"
  | "rates"
  | "system"
  | "support";

export type AdminNotification = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  time: string;
  day: "Today" | "Yesterday" | "Earlier";
  unread: boolean;
  priority: "high" | "normal";
  to?: string;
};

export const NOTIFICATION_LABEL: Record<NotificationKind, string> = {
  compliance: "Compliance",
  withdrawal: "Withdrawals",
  reconciliation: "Reconciliation",
  rates: "Rates",
  system: "System",
  support: "Support",
};

export const NOTIFICATION_TONE: Record<NotificationKind, string> = {
  compliance: "bg-brand/10 text-brand ring-brand/20",
  withdrawal: "bg-gold/20 text-gold-foreground ring-gold/40",
  reconciliation: "bg-amber-500/12 text-amber-700 ring-amber-500/25",
  rates: "bg-emerald-500/12 text-emerald-700 ring-emerald-500/25",
  system: "bg-muted text-muted-foreground ring-border",
  support: "bg-sky-500/12 text-sky-700 ring-sky-500/25",
};

export const ADMIN_NOTIFICATIONS: AdminNotification[] = [
  {
    id: "n-901",
    kind: "withdrawal",
    title: "3 withdrawals above ₦5m awaiting approval",
    body: "Largest is ₦12,400,000 for Tunde Bakare. Cut-off for today's batch is 15:30.",
    time: "09:42",
    day: "Today",
    unread: true,
    priority: "high",
    to: "/admin/withdrawals",
  },
  {
    id: "n-902",
    kind: "compliance",
    title: "AML alert escalated",
    body: "Structuring pattern flagged on account u-10318 — assigned to Compliance duty officer.",
    time: "09:15",
    day: "Today",
    unread: true,
    priority: "high",
    to: "/admin/compliance/aml",
  },
  {
    id: "n-903",
    kind: "reconciliation",
    title: "Variance detected in provider settlement",
    body: "₦148,500 unmatched between ledger and payout provider for 03 Sep.",
    time: "08:05",
    day: "Today",
    unread: true,
    priority: "high",
    to: "/admin/reconciliation",
  },
  {
    id: "n-904",
    kind: "compliance",
    title: "12 verification cases queued",
    body: "Tier 2 submissions waiting review, oldest 19 hours.",
    time: "07:30",
    day: "Today",
    unread: false,
    priority: "normal",
    to: "/admin/compliance/queue",
  },
  {
    id: "n-905",
    kind: "rates",
    title: "Rate change awaiting your approval",
    body: "180-day fixed proposed 19.5% → 20.25% by Ada Nwosu.",
    time: "16:48",
    day: "Yesterday",
    unread: false,
    priority: "normal",
    to: "/admin/rates/approvals",
  },
  {
    id: "n-906",
    kind: "support",
    title: "SLA breach risk on 2 tickets",
    body: "Both relate to delayed card funding. First response due in 40 minutes.",
    time: "14:10",
    day: "Yesterday",
    unread: false,
    priority: "normal",
    to: "/admin/support",
  },
  {
    id: "n-907",
    kind: "system",
    title: "Maintenance window scheduled",
    body: "Payout provider maintenance on Sunday 02:00–04:00. Withdrawals will queue.",
    time: "11:02",
    day: "Yesterday",
    unread: false,
    priority: "normal",
    to: "/admin/settings",
  },
  {
    id: "n-908",
    kind: "system",
    title: "New admin invited",
    body: "Ify Chukwu was invited as Compliance Officer by Seyi Adeleke.",
    time: "02 Sep",
    day: "Earlier",
    unread: false,
    priority: "normal",
    to: "/admin/team",
  },
  {
    id: "n-909",
    kind: "compliance",
    title: "Account frozen",
    body: "u-10477 frozen pending source-of-funds evidence.",
    time: "01 Sep",
    day: "Earlier",
    unread: false,
    priority: "normal",
    to: "/admin/compliance/frozen",
  },
];

/* ------------------------------------------------------------------ */
/* Global search                                                       */
/* ------------------------------------------------------------------ */

export type SearchGroup =
  | "Customers"
  | "Transactions"
  | "Withdrawals"
  | "Products"
  | "Admin pages"
  | "Console users";

export type SearchResult = {
  id: string;
  group: SearchGroup;
  title: string;
  subtitle: string;
  meta?: string;
  to: string;
  params?: Record<string, string>;
};

const PAGE_INDEX: SearchResult[] = [
  { id: "p-dash", group: "Admin pages", title: "Executive dashboard", subtitle: "FUM, flows, alerts", to: "/admin" },
  { id: "p-users", group: "Admin pages", title: "Users", subtitle: "Customer directory", to: "/admin/users" },
  { id: "p-comp", group: "Admin pages", title: "Compliance & KYC", subtitle: "Queues, AML, reporting", to: "/admin/compliance" },
  { id: "p-frozen", group: "Admin pages", title: "Frozen accounts", subtitle: "ADM-034 restricted access", to: "/admin/compliance/frozen" },
  { id: "p-txn", group: "Admin pages", title: "Transactions", subtitle: "Ledger movements", to: "/admin/transactions" },
  { id: "p-wd", group: "Admin pages", title: "Withdrawals", subtitle: "Payout queue", to: "/admin/withdrawals" },
  { id: "p-recon", group: "Admin pages", title: "Reconciliation", subtitle: "Provider vs ledger", to: "/admin/reconciliation" },
  { id: "p-prod", group: "Admin pages", title: "Products", subtitle: "Catalogue and rates", to: "/admin/products" },
  { id: "p-rates", group: "Admin pages", title: "Rate management", subtitle: "Proposals and approvals", to: "/admin/rates" },
  { id: "p-mkt", group: "Admin pages", title: "Marketing", subtitle: "Campaigns and feed", to: "/admin/marketing" },
  { id: "p-sup", group: "Admin pages", title: "Support", subtitle: "Tickets and conversations", to: "/admin/support" },
  { id: "p-ai", group: "Admin pages", title: "Ask AI log", subtitle: "Assistant usage history", to: "/admin/ai-chat" },
  { id: "p-analytics", group: "Admin pages", title: "Reports & analytics", subtitle: "Growth, retention, product mix", to: "/admin/analytics" },
  { id: "p-reports", group: "Admin pages", title: "Reports & exports centre", subtitle: "Scheduled packs and downloads", to: "/admin/reports" },
  { id: "p-settings", group: "Admin pages", title: "System settings", subtitle: "Fees, limits, cut-offs, flags", to: "/admin/settings" },
  { id: "p-profile", group: "Admin pages", title: "My profile & preferences", subtitle: "Password, 2FA, sessions", to: "/admin/profile" },
  { id: "p-audit", group: "Admin pages", title: "Audit log", subtitle: "Immutable console trail", to: "/admin/audit" },
  { id: "p-team", group: "Admin pages", title: "Admin users", subtitle: "Console team and roles", to: "/admin/team" },
];

const OPERATIONAL_INDEX: SearchResult[] = [
  {
    id: "s-txn-1",
    group: "Transactions",
    title: "KPT-882401 · ₦2,500,000 funding",
    subtitle: "Adaeze Okonkwo · successful",
    meta: "04 Sep 2026",
    to: "/admin/transactions",
  },
  {
    id: "s-txn-2",
    group: "Transactions",
    title: "KPT-882455 · ₦640,000 fixed placement",
    subtitle: "Tunde Bakare · successful",
    meta: "04 Sep 2026",
    to: "/admin/transactions",
  },
  {
    id: "s-wd-1",
    group: "Withdrawals",
    title: "WDL-40912 · ₦12,400,000",
    subtitle: "Tunde Bakare · awaiting approval",
    meta: "GTBank ····8871",
    to: "/admin/withdrawals",
  },
  {
    id: "s-wd-2",
    group: "Withdrawals",
    title: "WDL-40915 · ₦380,000",
    subtitle: "Chioma Eze · processing",
    meta: "Zenith ····2210",
    to: "/admin/withdrawals",
  },
  {
    id: "s-prod-1",
    group: "Products",
    title: "Kipit Fixed 180-day",
    subtitle: "19.5% p.a · open",
    to: "/admin/products",
  },
  {
    id: "s-prod-2",
    group: "Products",
    title: "Kipit Call Account",
    subtitle: "11.0% p.a · open",
    to: "/admin/products",
  },
  {
    id: "s-adm-1",
    group: "Console users",
    title: "Seyi Adeleke",
    subtitle: "Global Admin · active",
    to: "/admin/team",
  },
  {
    id: "s-adm-2",
    group: "Console users",
    title: "Ada Nwosu",
    subtitle: "Treasury · active",
    to: "/admin/team",
  },
];

/** Simple prototype relevance search across customers, operations and pages. */
export function globalSearch(query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const customers: SearchResult[] = ADMIN_USERS.filter((u) =>
    [u.name, u.email, u.phone, u.id].some((f) => f.toLowerCase().includes(q)),
  ).map((u) => ({
    id: `c-${u.id}`,
    group: "Customers" as const,
    title: u.name,
    subtitle: `${u.email} · ${u.id}`,
    meta: `₦${portfolioValue(u).toLocaleString("en-NG")}`,
    to: "/admin/users/$userId",
    params: { userId: u.id },
  }));

  const rest = [...OPERATIONAL_INDEX, ...PAGE_INDEX].filter((r) =>
    [r.title, r.subtitle, r.meta ?? ""].some((f) => f.toLowerCase().includes(q)),
  );

  return [...customers, ...rest];
}

export const SEARCH_SUGGESTIONS = [
  "Adaeze",
  "WDL-40912",
  "frozen",
  "180-day",
  "reconciliation",
  "rates",
];

/* ------------------------------------------------------------------ */
/* Reports & analytics                                                 */
/* ------------------------------------------------------------------ */

export const ANALYTICS_MONTHS = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"];

export const GROWTH_SERIES = [
  { month: "Apr", signups: 1_240, funded: 780, active: 5_420 },
  { month: "May", signups: 1_410, funded: 902, active: 6_010 },
  { month: "Jun", signups: 1_180, funded: 741, active: 6_388 },
  { month: "Jul", signups: 1_690, funded: 1_105, active: 7_120 },
  { month: "Aug", signups: 2_040, funded: 1_388, active: 8_005 },
  { month: "Sep", signups: 1_520, funded: 1_046, active: 8_612 },
];

export const NET_FLOW_SERIES = [
  { month: "Apr", deposits: 412, withdrawals: 268 },
  { month: "May", deposits: 468, withdrawals: 301 },
  { month: "Jun", deposits: 402, withdrawals: 355 },
  { month: "Jul", deposits: 521, withdrawals: 318 },
  { month: "Aug", deposits: 604, withdrawals: 402 },
  { month: "Sep", deposits: 388, withdrawals: 244 },
];

export const RETENTION_SERIES = [
  { cohort: "Apr", m1: 82, m2: 71, m3: 66 },
  { cohort: "May", m1: 85, m2: 74, m3: 68 },
  { cohort: "Jun", m1: 79, m2: 69, m3: 61 },
  { cohort: "Jul", m1: 88, m2: 78, m3: 72 },
  { cohort: "Aug", m1: 86, m2: 76, m3: 70 },
];

export const PRODUCT_MIX = [
  { id: "fixed", label: "Fixed plans", value: 1_286, tone: "var(--brand)" },
  { id: "explore", label: "Explore", value: 574, tone: "var(--gold)" },
  { id: "call", label: "Call account", value: 412, tone: "#4C7DF0" },
  { id: "wallet", label: "Wallet", value: 184, tone: "#9AB0D6" },
];

export const CHANNEL_MIX = [
  { channel: "Bank transfer", value: 62 },
  { channel: "Card", value: 21 },
  { channel: "USSD", value: 9 },
  { channel: "Wallet transfer", value: 8 },
];

export const ANALYTICS_KPIS = [
  { label: "New customers", value: "1,520", delta: "-25.5%", up: false, helper: "Sep vs Aug" },
  { label: "Funded rate", value: "68.8%", delta: "+0.7 pts", up: true, helper: "Signups that funded" },
  { label: "Avg. ticket size", value: "₦482,000", delta: "+6.2%", up: true, helper: "Per placement" },
  { label: "Net flow", value: "₦144m", delta: "+11.4%", up: true, helper: "Deposits less payouts" },
  { label: "Rollover rate", value: "74.2%", delta: "+2.9 pts", up: true, helper: "Matured plans renewed" },
  { label: "Churn (90d)", value: "4.1%", delta: "-0.4 pts", up: true, helper: "Fully withdrawn" },
];

/* ------------------------------------------------------------------ */
/* Reports & exports centre                                            */
/* ------------------------------------------------------------------ */

export type ReportCategory = "Finance" | "Compliance" | "Operations" | "Growth";

export type ReportPack = {
  id: string;
  name: string;
  category: ReportCategory;
  description: string;
  formats: string[];
  cadence: "Daily" | "Weekly" | "Monthly" | "On demand";
  lastRun: string;
  owner: string;
};

export const REPORT_PACKS: ReportPack[] = [
  {
    id: "rp-ledger",
    name: "Transaction ledger",
    category: "Finance",
    description: "Every wallet, placement, interest and payout movement with references.",
    formats: ["CSV", "XLSX"],
    cadence: "Daily",
    lastRun: "Today 06:00",
    owner: "Finance ops",
  },
  {
    id: "rp-fum",
    name: "Funds under management",
    category: "Finance",
    description: "Closing FUM by product, tenor and customer tier.",
    formats: ["XLSX", "PDF"],
    cadence: "Daily",
    lastRun: "Today 06:05",
    owner: "Treasury",
  },
  {
    id: "rp-interest",
    name: "Interest accrual & payout",
    category: "Finance",
    description: "Accrued versus paid interest, with maturity liabilities.",
    formats: ["XLSX"],
    cadence: "Monthly",
    lastRun: "01 Sep 2026",
    owner: "Treasury",
  },
  {
    id: "rp-recon",
    name: "Reconciliation variances",
    category: "Finance",
    description: "Unmatched provider settlements and their resolution status.",
    formats: ["CSV"],
    cadence: "Daily",
    lastRun: "Today 07:15",
    owner: "Finance ops",
  },
  {
    id: "rp-kyc",
    name: "KYC status register",
    category: "Compliance",
    description: "Tier distribution, pending cases and rejection reasons.",
    formats: ["CSV", "PDF"],
    cadence: "Weekly",
    lastRun: "31 Aug 2026",
    owner: "Compliance",
  },
  {
    id: "rp-aml",
    name: "AML screening & alerts",
    category: "Compliance",
    description: "Screening hits, escalations and outcomes for the regulator pack.",
    formats: ["PDF"],
    cadence: "Monthly",
    lastRun: "01 Sep 2026",
    owner: "Compliance",
  },
  {
    id: "rp-frozen",
    name: "Restricted accounts",
    category: "Compliance",
    description: "Frozen accounts, reasons, balances held and duration.",
    formats: ["CSV"],
    cadence: "Weekly",
    lastRun: "31 Aug 2026",
    owner: "Compliance",
  },
  {
    id: "rp-withdrawals",
    name: "Withdrawal processing",
    category: "Operations",
    description: "Queue ageing, approvals, declines and provider outcomes.",
    formats: ["CSV", "XLSX"],
    cadence: "Daily",
    lastRun: "Today 06:10",
    owner: "Payments ops",
  },
  {
    id: "rp-support",
    name: "Support performance",
    category: "Operations",
    description: "Ticket volume, first response and resolution against SLA.",
    formats: ["CSV"],
    cadence: "Weekly",
    lastRun: "31 Aug 2026",
    owner: "Customer care",
  },
  {
    id: "rp-audit",
    name: "Console audit extract",
    category: "Operations",
    description: "All admin actions for the selected period, with before/after values.",
    formats: ["CSV"],
    cadence: "On demand",
    lastRun: "28 Aug 2026",
    owner: "Risk",
  },
  {
    id: "rp-growth",
    name: "Acquisition & activation",
    category: "Growth",
    description: "Signups, funded rate, channel mix and referral performance.",
    formats: ["XLSX"],
    cadence: "Weekly",
    lastRun: "31 Aug 2026",
    owner: "Growth",
  },
  {
    id: "rp-ai",
    name: "Ask AI usage",
    category: "Growth",
    description: "Assistant sessions, intents, handoffs and flagged conversations.",
    formats: ["CSV"],
    cadence: "Weekly",
    lastRun: "31 Aug 2026",
    owner: "Product",
  },
];

export type ScheduledReport = {
  id: string;
  pack: string;
  cadence: string;
  recipients: string;
  next: string;
  active: boolean;
};

export const SCHEDULED_REPORTS: ScheduledReport[] = [
  {
    id: "sc-1",
    pack: "Transaction ledger",
    cadence: "Daily 06:00",
    recipients: "finance@kipit.ng",
    next: "Tomorrow 06:00",
    active: true,
  },
  {
    id: "sc-2",
    pack: "Funds under management",
    cadence: "Daily 06:05",
    recipients: "treasury@kipit.ng, exec@kipit.ng",
    next: "Tomorrow 06:05",
    active: true,
  },
  {
    id: "sc-3",
    pack: "KYC status register",
    cadence: "Weekly Mon 07:00",
    recipients: "compliance@kipit.ng",
    next: "Mon 07:00",
    active: true,
  },
  {
    id: "sc-4",
    pack: "AML screening & alerts",
    cadence: "Monthly 1st 08:00",
    recipients: "compliance@kipit.ng",
    next: "01 Oct 08:00",
    active: false,
  },
];

export const RECENT_EXPORTS = [
  { id: "ex-1", name: "Transaction ledger — 04 Sep", by: "Scheduled", size: "2.4 MB", when: "Today 06:00", status: "Ready" },
  { id: "ex-2", name: "Withdrawal processing — 04 Sep", by: "Scheduled", size: "740 KB", when: "Today 06:10", status: "Ready" },
  { id: "ex-3", name: "Restricted accounts — Aug", by: "Ify Chukwu", size: "88 KB", when: "Yesterday 15:22", status: "Ready" },
  { id: "ex-4", name: "Console audit extract — Aug", by: "Seyi Adeleke", size: "1.1 MB", when: "28 Aug 10:04", status: "Expired" },
];

/* ------------------------------------------------------------------ */
/* Operator profile                                                    */
/* ------------------------------------------------------------------ */

export type OperatorSession = {
  id: string;
  device: string;
  location: string;
  ip: string;
  lastSeen: string;
  current: boolean;
};

export const OPERATOR_SESSIONS: OperatorSession[] = [
  {
    id: "os-1",
    device: "Chrome 128 · macOS",
    location: "Lagos, Nigeria",
    ip: "102.89.44.18",
    lastSeen: "Active now",
    current: true,
  },
  {
    id: "os-2",
    device: "Safari · iPhone 15",
    location: "Lagos, Nigeria",
    ip: "197.210.76.221",
    lastSeen: "Yesterday 20:11",
    current: false,
  },
  {
    id: "os-3",
    device: "Edge 127 · Windows 11",
    location: "Abuja, Nigeria",
    ip: "105.112.9.64",
    lastSeen: "31 Aug 09:48",
    current: false,
  },
];

export const OPERATOR_ACTIVITY = [
  { id: "oa-1", action: "Approved withdrawal WDL-40908", when: "Today 09:12" },
  { id: "oa-2", action: "Published rate change · 180-day fixed", when: "Yesterday 16:52" },
  { id: "oa-3", action: "Invited admin user Ify Chukwu", when: "02 Sep 11:02" },
  { id: "oa-4", action: "Exported console audit extract", when: "28 Aug 10:04" },
];

/* ------------------------------------------------------------------ */
/* System settings                                                     */
/* ------------------------------------------------------------------ */

export type FeeSetting = { id: string; label: string; value: string; note: string };

export const FEE_SETTINGS: FeeSetting[] = [
  { id: "f-withdraw", label: "Withdrawal fee", value: "50", note: "Flat ₦ per payout" },
  { id: "f-card", label: "Card funding fee", value: "1.4", note: "% of amount, capped ₦2,000" },
  { id: "f-early", label: "Early liquidation penalty", value: "25", note: "% of accrued interest" },
  { id: "f-transfer", label: "Wallet transfer fee", value: "0", note: "Flat ₦ per transfer" },
];

export const LIMIT_SETTINGS: FeeSetting[] = [
  { id: "l-t1-day", label: "Tier 1 daily withdrawal", value: "200000", note: "₦ per day" },
  { id: "l-t2-day", label: "Tier 2 daily withdrawal", value: "5000000", note: "₦ per day" },
  { id: "l-single", label: "Single payout maximum", value: "10000000", note: "₦, above needs maker-checker" },
  { id: "l-min-fixed", label: "Minimum fixed placement", value: "100000", note: "₦ per plan" },
  { id: "l-min-call", label: "Minimum call deposit", value: "10000", note: "₦ per deposit" },
];

export const CUTOFF_SETTINGS: FeeSetting[] = [
  { id: "c-payout", label: "Withdrawal batch cut-off", value: "15:30", note: "Requests after this settle next day" },
  { id: "c-value", label: "Value date cut-off", value: "17:00", note: "Interest starts same day before this" },
  { id: "c-recon", label: "Reconciliation run", value: "07:00", note: "Daily automated match" },
  { id: "c-interest", label: "Interest accrual run", value: "00:15", note: "Nightly job" },
];

export type FeatureFlag = {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  audience: string;
};

export const FEATURE_FLAGS: FeatureFlag[] = [
  {
    id: "ff-ai",
    label: "Ask AI assistant",
    description: "In-app assistant for balances, products and guidance.",
    enabled: true,
    audience: "All customers",
  },
  {
    id: "ff-auto",
    label: "Auto-invest rules",
    description: "Recurring placements from wallet balance.",
    enabled: true,
    audience: "Tier 1 and above",
  },
  {
    id: "ff-gift",
    label: "Gift investments",
    description: "Send an investment to another customer.",
    enabled: true,
    audience: "All customers",
  },
  {
    id: "ff-card",
    label: "Card funding",
    description: "Fund wallet with a debit card.",
    enabled: false,
    audience: "Internal testers",
  },
  {
    id: "ff-market",
    label: "Explore marketplace",
    description: "Third-party products listed in Explore.",
    enabled: true,
    audience: "Tier 2 only",
  },
  {
    id: "ff-referral",
    label: "Referral bonuses",
    description: "Reward paid on referred customer's first placement.",
    enabled: false,
    audience: "Paused",
  },
];

export const MAINTENANCE_DEFAULT = {
  enabled: false,
  message:
    "Kipit is undergoing scheduled maintenance. Your money is safe — please try again shortly.",
  window: "Sun 02:00 – 04:00",
};
