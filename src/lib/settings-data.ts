/**
 * Settings helpers — static catalogs only. Identity/money come from the API.
 */

export let PROFILE = {
  firstName: "",
  middleName: "",
  lastName: "",
  dob: "",
  gender: "",
  email: "",
  phone: "",
  tier: "Tier 0",
  memberSince: "",
  initials: "",
};

/** KYC-locked fields cannot be edited in-app (MOB-141). */
export const KYC_LOCKED = ["firstName", "lastName", "dob", "gender"] as const;

export let ADDRESS = {
  street: "",
  city: "",
  state: "",
  lga: "",
  occupation: "",
  employment: "",
  sourceOfFunds: "",
};

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

export const SESSIONS: Session[] = [];

export type LinkedCard = {
  id: string;
  nickname: string;
  masked: string;
  type: "Visa" | "Mastercard" | "Verve";
  expiry: string;
};

export const LINKED_CARDS: LinkedCard[] = [];

export const REFERRALS = {
  code: "",
  link: "",
  total: 0,
  successful: 0,
  rewards: 0,
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

export const REFERRAL_LIST: ReferralEntry[] = [];

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

/** Map API notification prefs onto the static toggle catalogs (ids stay stable). */
export function applyNotificationPrefs<T extends ToggleItem>(
  prefs: {
    emailDeposits: boolean;
    emailWithdrawals: boolean;
    emailInvestments: boolean;
    emailMaturities: boolean;
    emailDigest: boolean;
    pushProducts: boolean;
    pushMaturities: boolean;
  },
  push: T[],
  email: T[],
): { push: T[]; email: T[] } {
  const txn =
    prefs.emailDeposits &&
    prefs.emailWithdrawals &&
    prefs.emailInvestments &&
    prefs.emailMaturities;
  return {
    push: push.map((item) => {
      if (item.id === "p-mat") return { ...item, on: prefs.pushMaturities };
      if (item.id === "p-prd") return { ...item, on: prefs.pushProducts };
      return item;
    }),
    email: email.map((item) => {
      if (item.id === "e-txn") return { ...item, on: txn };
      if (item.id === "e-dig") return { ...item, on: prefs.emailDigest };
      return item;
    }),
  };
}

/** Build a PATCH body for a single toggle id. Returns null when the toggle is local-only. */
export function notificationPatchForToggle(
  id: string,
  on: boolean,
): Partial<{
  emailDeposits: boolean;
  emailWithdrawals: boolean;
  emailInvestments: boolean;
  emailMaturities: boolean;
  emailDigest: boolean;
  pushProducts: boolean;
  pushMaturities: boolean;
}> | null {
  if (id === "p-mat") return { pushMaturities: on };
  if (id === "p-prd") return { pushProducts: on };
  if (id === "e-dig") return { emailDigest: on };
  if (id === "e-txn") {
    return {
      emailDeposits: on,
      emailWithdrawals: on,
      emailInvestments: on,
      emailMaturities: on,
    };
  }
  return null;
}

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
