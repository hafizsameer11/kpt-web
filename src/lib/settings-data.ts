/**
 * Prototype fixtures for the Settings section (MOB-140 – MOB-154).
 * No backend: values are static so flows can be demonstrated end to end.
 */

export const PROFILE = {
  firstName: "Adaeze",
  middleName: "Chidinma",
  lastName: "Okonkwo",
  dob: "14 March 1993",
  gender: "Female",
  email: "adaeze.okonkwo@gmail.com",
  phone: "+234 803 214 8890",
  tier: "Tier 2",
  memberSince: "Jan 2025",
  initials: "AO",
} as const;

/** KYC-locked fields cannot be edited in-app (MOB-141). */
export const KYC_LOCKED = ["firstName", "lastName", "dob", "gender"] as const;

export const ADDRESS = {
  street: "18B Admiralty Way",
  city: "Lekki Phase 1",
  state: "Lagos",
  lga: "Eti-Osa",
  occupation: "Product Designer",
  employment: "Employed (full-time)",
  sourceOfFunds: "Salary & business income",
} as const;

export type StatementKind = "Account statement" | "Transaction statement" | "Portfolio statement";

export const STATEMENT_KINDS: { kind: StatementKind; desc: string }[] = [
  { kind: "Account statement", desc: "Wallet inflows, outflows and balances" },
  { kind: "Transaction statement", desc: "Every transaction with references" },
  { kind: "Portfolio statement", desc: "Holdings, interest and maturities" },
];

export type Session = {
  id: string;
  device: string;
  context: string;
  lastActive: string;
  current: boolean;
};

export const SESSIONS: Session[] = [
  {
    id: "s1",
    device: "iPhone 15 Pro · Kipit iOS",
    context: "Lagos, NG · 105.112.x.x",
    lastActive: "Active now",
    current: true,
  },
  {
    id: "s2",
    device: "MacBook Pro · Chrome",
    context: "Lagos, NG · 197.210.x.x",
    lastActive: "2 hours ago",
    current: false,
  },
  {
    id: "s3",
    device: "Samsung S23 · Kipit Android",
    context: "Abuja, NG · 41.203.x.x",
    lastActive: "3 days ago",
    current: false,
  },
];

export type LinkedCard = {
  id: string;
  nickname: string;
  masked: string;
  type: "Visa" | "Mastercard" | "Verve";
  expiry: string;
};

export const LINKED_CARDS: LinkedCard[] = [
  { id: "c1", nickname: "Everyday card", masked: "•••• 4412", type: "Visa", expiry: "08/28" },
  { id: "c2", nickname: "Business card", masked: "•••• 7730", type: "Mastercard", expiry: "01/27" },
];

export const REFERRALS = {
  code: "ADAEZE-K9F2",
  link: "https://mykipit.com/join/ADAEZE-K9F2",
  total: 14,
  successful: 9,
  rewards: 45_000,
} as const;

export type ReferralStatus = "rewarded" | "pending" | "expired";

export type ReferralEntry = {
  id: string;
  name: string;
  joined: string;
  status: ReferralStatus;
  reward: number;
  note: string;
};

export const REFERRAL_LIST: ReferralEntry[] = [
  { id: "r1", name: "Chidi O.", joined: "28 Aug 2026", status: "rewarded", reward: 5_000, note: "Funded a 90-day plan" },
  { id: "r2", name: "Ngozi A.", joined: "24 Aug 2026", status: "rewarded", reward: 5_000, note: "Funded Call Account" },
  { id: "r3", name: "Tunde B.", joined: "21 Aug 2026", status: "pending", reward: 5_000, note: "Signed up, not funded yet" },
  { id: "r4", name: "Amaka N.", joined: "17 Aug 2026", status: "rewarded", reward: 5_000, note: "Funded a 180-day plan" },
  { id: "r5", name: "Segun T.", joined: "09 Aug 2026", status: "pending", reward: 5_000, note: "Verification in progress" },
  { id: "r6", name: "Halima Y.", joined: "02 Aug 2026", status: "expired", reward: 0, note: "Invite expired after 30 days" },
];

export const REFERRAL_STATUS_META: Record<ReferralStatus, { label: string; className: string }> = {
  rewarded: { label: "Reward earned", className: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" },
  pending: { label: "Pending funding", className: "bg-amber-50 text-amber-700 ring-amber-600/20" },
  expired: { label: "Expired", className: "bg-muted text-muted-foreground ring-border" },
};

export type ToggleItem = { id: string; label: string; desc: string; on: boolean };

export const PUSH_TOGGLES: ToggleItem[] = [
  { id: "p-dep", label: "Deposits", desc: "When money lands in your wallet", on: true },
  { id: "p-wdr", label: "Withdrawals", desc: "Payout requests and outcomes", on: true },
  { id: "p-inv", label: "Investments", desc: "New plans and subscriptions", on: true },
  { id: "p-mat", label: "Maturities", desc: "Upcoming and completed maturities", on: true },
  { id: "p-prd", label: "Product updates", desc: "New products on the marketplace", on: false },
  { id: "p-sec", label: "Security alerts", desc: "New device sign-ins and PIN changes", on: true },
  { id: "p-kyc", label: "Verification updates", desc: "When your KYC is approved or needs attention", on: true },
];

export const EMAIL_TOGGLES: ToggleItem[] = [
  { id: "e-txn", label: "Transaction alerts", desc: "An email for every transaction", on: true },
  { id: "e-dig", label: "Portfolio digest", desc: "Weekly performance summary", on: true },
  { id: "e-mkt", label: "Marketing communications", desc: "Offers and announcements", on: false },
];

export type Faq = { q: string; a: string; category: string };

export const FAQ_CATEGORIES = [
  "Getting started",
  "Deposits",
  "Withdrawals",
  "Investments",
  "Security",
] as const;

export const FAQS: Faq[] = [
  {
    category: "Getting started",
    q: "How do I complete my verification?",
    a: "Open Settings → Verification and submit your BVN, a valid ID and a selfie. Tier 2 is usually approved within minutes.",
  },
  {
    category: "Deposits",
    q: "How long does a deposit take to reflect?",
    a: "Bank transfers into your Kipit wallet reflect instantly in most cases, and within 10 minutes at the outside.",
  },
  {
    category: "Withdrawals",
    q: "Why was my withdrawal declined?",
    a: "A payout can be declined if the destination account is dormant or cannot receive transfers. The amount is returned to your wallet immediately.",
  },
  {
    category: "Investments",
    q: "Can I break a fixed plan before maturity?",
    a: "Yes. Early liquidation is allowed, but the applicable interest is recalculated at the early-exit rate stated in your plan terms.",
  },
  {
    category: "Security",
    q: "What should I do if I lose my phone?",
    a: "Sign in on another device and use Settings → Security → Active sessions to log out every other session, then change your PIN.",
  },
];

export const POPULAR_QUESTIONS = [
  "How long does a withdrawal take?",
  "How is interest calculated?",
  "How do I change my transaction PIN?",
];

export const TICKET_CATEGORIES = [
  "Deposits & wallet",
  "Withdrawals & payouts",
  "Investments & plans",
  "Account & verification",
  "Something else",
] as const;

export type LegalDoc = { title: string; version: string; accepted: string; desc: string };

export const LEGAL_DOCS: LegalDoc[] = [
  {
    title: "Terms & Conditions",
    version: "v3.2",
    accepted: "Accepted 12 Jan 2025",
    desc: "The agreement covering your use of Kipit.",
  },
  {
    title: "Privacy Policy",
    version: "v2.4",
    accepted: "Accepted 12 Jan 2025",
    desc: "How we collect, use and protect your data.",
  },
  {
    title: "Risk Disclosure",
    version: "v1.8",
    accepted: "Accepted 12 Jan 2025",
    desc: "Investment risks you should understand.",
  },
  {
    title: "Product Terms",
    version: "v2.1",
    accepted: "Accepted 04 Mar 2026",
    desc: "Specific terms for each Kipit product.",
  },
];

export function ticketReference() {
  return `KPT-TKT-${Math.floor(100000 + Math.random() * 899999)}`;
}
