/** Fixtures for the admin "Ask AI" usage & history console. */

export type ChatIntent =
  | "balance"
  | "product"
  | "explain"
  | "maturity"
  | "transaction"
  | "funding"
  | "unsupported";

export type ChatOutcome = "resolved" | "handoff" | "abandoned" | "escalated";

export const INTENT_LABEL: Record<ChatIntent, string> = {
  balance: "Balance & portfolio",
  product: "Product discovery",
  explain: "Explainers",
  maturity: "Maturity & payouts",
  transaction: "Transaction status",
  funding: "Funding help",
  unsupported: "Unsupported request",
};

export const OUTCOME_LABEL: Record<ChatOutcome, string> = {
  resolved: "Resolved in chat",
  handoff: "Handed off to journey",
  abandoned: "Abandoned",
  escalated: "Escalated to support",
};

export const OUTCOME_TONE: Record<ChatOutcome, string> = {
  resolved: "bg-emerald-500/12 text-emerald-700 ring-emerald-500/20",
  handoff: "bg-brand/10 text-brand ring-brand/20",
  abandoned: "bg-muted text-muted-foreground ring-border",
  escalated: "bg-destructive/10 text-destructive ring-destructive/20",
};

export type ChatTurn = {
  id: string;
  role: "user" | "assistant";
  text: string;
  at: string;
  intent?: ChatIntent;
  card?: string;
  flagged?: boolean;
};

export type ChatSession = {
  id: string;
  ref: string;
  user: { id: string; name: string; email: string };
  device: "Mobile app" | "Desktop web";
  startedAt: string;
  duration: string;
  turns: number;
  topIntent: ChatIntent;
  outcome: ChatOutcome;
  handoffTo?: string;
  satisfaction?: "positive" | "negative";
  flagged: boolean;
  transcript: ChatTurn[];
};

export const CHAT_TOTALS = {
  sessions30d: 1284,
  sessionsToday: 96,
  activeUsers30d: 731,
  messages30d: 8412,
  avgTurns: "6.6",
  containment: "72%",
  handoffRate: "21%",
  flagged: 7,
  avgResponse: "1.4s",
};

/** Sessions per day, split by outcome — last 14 days. */
export const CHAT_VOLUME = [
  { day: "22 Aug", resolved: 41, handoff: 12, abandoned: 6 },
  { day: "23 Aug", resolved: 38, handoff: 10, abandoned: 7 },
  { day: "24 Aug", resolved: 30, handoff: 9, abandoned: 5 },
  { day: "25 Aug", resolved: 47, handoff: 14, abandoned: 8 },
  { day: "26 Aug", resolved: 52, handoff: 16, abandoned: 6 },
  { day: "27 Aug", resolved: 49, handoff: 13, abandoned: 9 },
  { day: "28 Aug", resolved: 44, handoff: 15, abandoned: 7 },
  { day: "29 Aug", resolved: 36, handoff: 11, abandoned: 5 },
  { day: "30 Aug", resolved: 33, handoff: 8, abandoned: 6 },
  { day: "31 Aug", resolved: 45, handoff: 12, abandoned: 4 },
  { day: "01 Sep", resolved: 58, handoff: 18, abandoned: 9 },
  { day: "02 Sep", resolved: 61, handoff: 17, abandoned: 7 },
  { day: "03 Sep", resolved: 55, handoff: 14, abandoned: 8 },
  { day: "04 Sep", resolved: 63, handoff: 19, abandoned: 6 },
];

export const INTENT_MIX: { intent: ChatIntent; sessions: number }[] = [
  { intent: "balance", sessions: 386 },
  { intent: "product", sessions: 291 },
  { intent: "explain", sessions: 214 },
  { intent: "maturity", sessions: 158 },
  { intent: "transaction", sessions: 121 },
  { intent: "funding", sessions: 82 },
  { intent: "unsupported", sessions: 32 },
];

export const TOP_QUESTIONS = [
  { text: "What is my balance?", asked: 214, resolvedPct: 96 },
  { text: "Best rate for 90 days", asked: 168, resolvedPct: 88 },
  { text: "When does my plan mature?", asked: 143, resolvedPct: 92 },
  { text: "How do I add money?", asked: 127, resolvedPct: 90 },
  { text: "What is a call account?", asked: 111, resolvedPct: 94 },
  { text: "Where is my withdrawal?", asked: 84, resolvedPct: 71 },
  { text: "Can you invest ₦500,000 for me?", asked: 46, resolvedPct: 0 },
];

export const HANDOFF_DESTINATIONS = [
  { label: "Fixed plan setup", count: 118 },
  { label: "Add money / funding", count: 94 },
  { label: "Explore product detail", count: 77 },
  { label: "Withdrawal request", count: 41 },
  { label: "Support ticket", count: 23 },
];

export const CHAT_SESSIONS: ChatSession[] = [
  {
    id: "cs-1041",
    ref: "AIC-1041",
    user: { id: "usr-01", name: "Amaka Obi", email: "amaka.obi@gmail.com" },
    device: "Mobile app",
    startedAt: "04 Sep 2026, 11:42",
    duration: "3m 12s",
    turns: 8,
    topIntent: "product",
    outcome: "handoff",
    handoffTo: "Fixed plan setup",
    satisfaction: "positive",
    flagged: false,
    transcript: [
      { id: "t1", role: "user", text: "What is the best rate for 90 days?", at: "11:42", intent: "product" },
      {
        id: "t2",
        role: "assistant",
        text: "Kipit Fixed 90 is paying 19.5% p.a. right now, with a ₦100,000 minimum.",
        at: "11:42",
        card: "Product recommendation",
      },
      { id: "t3", role: "user", text: "What would ₦500,000 earn?", at: "11:43", intent: "product" },
      {
        id: "t4",
        role: "assistant",
        text: "About ₦24,041 in interest over 90 days, maturing at ₦524,041.",
        at: "11:43",
        card: "Estimated return",
      },
      { id: "t5", role: "user", text: "Okay, set it up", at: "11:44", intent: "product" },
      {
        id: "t6",
        role: "assistant",
        text: "I can't move money in chat. I've opened the secure Fixed plan setup for you to confirm.",
        at: "11:44",
        card: "Secure handoff",
      },
    ],
  },
  {
    id: "cs-1040",
    ref: "AIC-1040",
    user: { id: "usr-04", name: "Tunde Bakare", email: "tunde.bakare@outlook.com" },
    device: "Desktop web",
    startedAt: "04 Sep 2026, 11:05",
    duration: "1m 48s",
    turns: 4,
    topIntent: "balance",
    outcome: "resolved",
    satisfaction: "positive",
    flagged: false,
    transcript: [
      { id: "t1", role: "user", text: "How much do I have invested?", at: "11:05", intent: "balance" },
      {
        id: "t2",
        role: "assistant",
        text: "You hold ₦3,420,000 invested and ₦186,500 in your wallet.",
        at: "11:05",
        card: "Balance summary",
      },
      { id: "t3", role: "user", text: "Thanks", at: "11:07" },
      { id: "t4", role: "assistant", text: "Anytime. Want a maturity breakdown?", at: "11:07" },
    ],
  },
  {
    id: "cs-1039",
    ref: "AIC-1039",
    user: { id: "usr-07", name: "Ngozi Eze", email: "ngozi.eze@yahoo.com" },
    device: "Mobile app",
    startedAt: "04 Sep 2026, 10:22",
    duration: "5m 04s",
    turns: 11,
    topIntent: "transaction",
    outcome: "escalated",
    handoffTo: "Support ticket TCK-2291",
    satisfaction: "negative",
    flagged: true,
    transcript: [
      { id: "t1", role: "user", text: "Where is my withdrawal from yesterday?", at: "10:22", intent: "transaction" },
      {
        id: "t2",
        role: "assistant",
        text: "Your ₦250,000 withdrawal is still processing with the payout bank.",
        at: "10:22",
        card: "Transaction status",
      },
      { id: "t3", role: "user", text: "It has been 26 hours, this is unacceptable", at: "10:25", intent: "transaction", flagged: true },
      {
        id: "t4",
        role: "assistant",
        text: "I've raised this with the support team — ticket TCK-2291 has been created.",
        at: "10:26",
        card: "Escalation",
      },
    ],
  },
  {
    id: "cs-1038",
    ref: "AIC-1038",
    user: { id: "usr-02", name: "Chidi Nwosu", email: "chidi.nwosu@gmail.com" },
    device: "Mobile app",
    startedAt: "04 Sep 2026, 09:51",
    duration: "2m 30s",
    turns: 6,
    topIntent: "explain",
    outcome: "resolved",
    flagged: false,
    transcript: [
      { id: "t1", role: "user", text: "What is a call account?", at: "09:51", intent: "explain" },
      {
        id: "t2",
        role: "assistant",
        text: "A call account earns daily interest and stays withdrawable at any time — no fixed tenor.",
        at: "09:51",
      },
      { id: "t3", role: "user", text: "Is it safer than fixed?", at: "09:53", intent: "explain" },
      {
        id: "t4",
        role: "assistant",
        text: "It is more flexible, but fixed plans typically pay a higher rate for locking funds.",
        at: "09:53",
      },
    ],
  },
  {
    id: "cs-1037",
    ref: "AIC-1037",
    user: { id: "usr-09", name: "Fatima Bello", email: "fatima.bello@gmail.com" },
    device: "Desktop web",
    startedAt: "03 Sep 2026, 18:14",
    duration: "0m 54s",
    turns: 2,
    topIntent: "funding",
    outcome: "abandoned",
    flagged: false,
    transcript: [
      { id: "t1", role: "user", text: "How do I add money?", at: "18:14", intent: "funding" },
      {
        id: "t2",
        role: "assistant",
        text: "Transfer to your dedicated account 0123456789 (Kipit / Providus), or pay by card.",
        at: "18:14",
        card: "Funding instructions",
      },
    ],
  },
  {
    id: "cs-1036",
    ref: "AIC-1036",
    user: { id: "usr-05", name: "Emeka Okafor", email: "emeka.okafor@gmail.com" },
    device: "Mobile app",
    startedAt: "03 Sep 2026, 16:02",
    duration: "4m 21s",
    turns: 9,
    topIntent: "maturity",
    outcome: "handoff",
    handoffTo: "Portfolio records",
    satisfaction: "positive",
    flagged: false,
    transcript: [
      { id: "t1", role: "user", text: "When does my plan mature?", at: "16:02", intent: "maturity" },
      {
        id: "t2",
        role: "assistant",
        text: "Kipit Fixed 180 matures on 21 Oct 2026, paying out ₦1,092,400.",
        at: "16:02",
        card: "Maturity detail",
      },
      { id: "t3", role: "user", text: "Show me all my plans", at: "16:04", intent: "maturity" },
      { id: "t4", role: "assistant", text: "Opening your portfolio records.", at: "16:04", card: "Secure handoff" },
    ],
  },
  {
    id: "cs-1035",
    ref: "AIC-1035",
    user: { id: "usr-11", name: "Bisi Adeyemi", email: "bisi.adeyemi@gmail.com" },
    device: "Mobile app",
    startedAt: "03 Sep 2026, 12:38",
    duration: "1m 12s",
    turns: 3,
    topIntent: "unsupported",
    outcome: "abandoned",
    flagged: true,
    transcript: [
      { id: "t1", role: "user", text: "Move ₦2,000,000 from my wallet to my bank now", at: "12:38", intent: "unsupported", flagged: true },
      {
        id: "t2",
        role: "assistant",
        text: "I can't move money. Withdrawals must be confirmed by you in the secure withdrawal flow.",
        at: "12:38",
        card: "Guardrail",
      },
    ],
  },
];

export function sessionById(id: string) {
  return CHAT_SESSIONS.find((s) => s.id === id);
}
