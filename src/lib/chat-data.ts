/**
 * PART D — Chat-to-Trade (CHAT-001 … CHAT-010).
 *
 * A controlled, scripted assistant. It never moves money: every transactional
 * intent ends in a secure handoff to the standard investment / funding journey
 * (Global rule 3.4 — Chat-to-Trade cannot bypass secure transaction flows).
 */

import { HOLDINGS, INVESTED, NEXT_MATURITY, TOTAL, WALLET, naira } from "@/lib/home-data";
import { CALL_ACCOUNT, FIXED_PLANS } from "@/lib/invest-data";
import { EXPLORE_PRODUCTS } from "@/lib/explore-data";

export { naira };

export type ChatProduct = {
  id: string;
  name: string;
  rate: string;
  tenor: string;
  minimum: number;
  ratePct: number;
  to: string;
  blurb: string;
  learnMoreTo?: string;
};

export type StatusTone = "processing" | "successful" | "declined" | "pending";

export type ChatBlock =
  | { kind: "text"; text: string }
  | { kind: "balance" }
  | { kind: "chips"; label?: string; options: { label: string; send: string }[] }
  | { kind: "products"; intro?: string; amount?: number; products: ChatProduct[] }
  | { kind: "explain"; product: ChatProduct }
  | { kind: "handoff"; product: ChatProduct }
  | { kind: "maturity" }
  | { kind: "status" }
  | { kind: "funding" }
  | { kind: "unsupported" };

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  screen?: string;
  text?: string;
  blocks?: ChatBlock[];
};

/** CHAT-001 suggested prompts. */
export const SUGGESTED_PROMPTS = [
  "What's my balance?",
  "Help me invest",
  "What products are available?",
  "When does my investment mature?",
  "Track a transaction",
];

export const PORTFOLIO_SNAPSHOT = {
  wallet: WALLET,
  invested: INVESTED,
  total: TOTAL,
  holdings: HOLDINGS.length,
};

export const MATURITY = NEXT_MATURITY;

const pct = (rate: string) => Number(rate.match(/[\d.]+/)?.[0] ?? 0) || 0;

const fixedProducts: ChatProduct[] = FIXED_PLANS.map((plan, index) => ({
  id: `fixed-${index}`,
  name: plan.name,
  rate: plan.rate,
  tenor: plan.tenor,
  minimum: plan.minimum,
  ratePct: pct(plan.rate),
  to: "/fixed-plans/create",
  blurb: plan.blurb,
}));

const callProduct: ChatProduct = {
  id: "call",
  name: CALL_ACCOUNT.name,
  rate: CALL_ACCOUNT.rate,
  tenor: CALL_ACCOUNT.liquidity,
  minimum: CALL_ACCOUNT.minimum,
  ratePct: pct(CALL_ACCOUNT.rate),
  to: "/call-account/add-money",
  blurb: CALL_ACCOUNT.blurb,
  learnMoreTo: "/call-account",
};

const marketProducts: ChatProduct[] = EXPLORE_PRODUCTS.filter(
  (product) => product.availability !== "closed",
)
  .slice(0, 3)
  .map((product) => ({
    id: product.id,
    name: product.name,
    rate: product.rate,
    tenor: product.tenor,
    minimum: product.minimum,
    ratePct: pct(product.rate),
    to: `/explore/${product.id}/subscribe`,
    blurb: product.blurb,
    learnMoreTo: `/explore/${product.id}`,
  }));

export const ALL_PRODUCTS: ChatProduct[] = [callProduct, ...fixedProducts, ...marketProducts];

export const productById = (id: string) => ALL_PRODUCTS.find((p) => p.id === id);

/** Simple estimated return for the prototype: simple interest over the tenor. */
export function estimatedReturn(product: ChatProduct, amount: number) {
  const days = Number(product.tenor.replace(/[^0-9]/g, "")) || 365;
  return Math.round((amount * product.ratePct * days) / (100 * 365));
}

const compact = (items: (ChatProduct | undefined)[]): ChatProduct[] =>
  items.filter((item): item is ChatProduct => Boolean(item));

export const DEFAULT_AMOUNT = 500_000;

const has = (text: string, words: string[]) => words.some((w) => text.includes(w));

/** Parses "₦500,000" / "500k" / "500000" out of free text. */
export function parseAmount(text: string): number | undefined {
  const k = text.match(/([\d,.]+)\s*k\b/i);
  if (k?.[1]) return Math.round(Number(k[1].replace(/,/g, "")) * 1000);
  const m = text.match(/([\d][\d,]{2,})/);
  if (m?.[1]) return Number(m[1].replace(/,/g, ""));
  return undefined;
}

let counter = 0;
export const nextId = () => `m${++counter}-${Date.now().toString(36)}`;

export function assistantReply(raw: string, amountInFlight?: number): ChatMessage {
  const text = raw.toLowerCase().trim();
  const amount = parseAmount(raw) ?? amountInFlight;

  // CHAT-006 — secure handoff
  if (text.startsWith("continue:")) {
    const product = productById(text.slice("continue:".length).trim());
    if (product) {
      return {
        id: nextId(),
        role: "assistant",
        screen: "CHAT-006",
        blocks: [
          {
            kind: "text",
            text: "You're ready to continue. We'll take you to the secure investment screen to review and authorize this transaction.",
          },
          { kind: "handoff", product },
        ],
      };
    }
  }

  // CHAT-005 — controlled product explanation
  if (text.startsWith("explain:")) {
    const product = productById(text.slice("explain:".length).trim());
    if (product) {
      return {
        id: nextId(),
        role: "assistant",
        screen: "CHAT-005",
        blocks: [{ kind: "explain", product }],
      };
    }
  }

  // CHAT-003 → CHAT-004 — discovery answers
  if (text.startsWith("match:")) {
    const [, tenor, access] = text.split(":");
    const invest = amount ?? DEFAULT_AMOUNT;
    let picks: ChatProduct[];
    if (access === "yes") {
      picks = compact([callProduct, fixedProducts[0]]);
    } else if (tenor === "short") {
      picks = compact([fixedProducts[0], callProduct, marketProducts[0]]);
    } else {
      picks = compact([marketProducts[0], fixedProducts[1] ?? fixedProducts[0], fixedProducts[0]]).slice(0, 3);
    }
    return {
      id: nextId(),
      role: "assistant",
      screen: "CHAT-004",
      blocks: [
        {
          kind: "products",
          intro:
            access === "yes"
              ? `Because you may need access before maturity, these keep your money reachable. Estimates use ${naira(invest)}.`
              : `Here's what fits ${naira(invest)} over a ${tenor === "short" ? "shorter" : "longer"} tenor.`,
          amount: invest,
          products: picks,
        },
      ],
    };
  }

  // CHAT-009 — funding help
  if (has(text, ["fund", "add money", "top up", "top-up", "how do i pay", "bank transfer"])) {
    return {
      id: nextId(),
      role: "assistant",
      screen: "CHAT-009",
      blocks: [
        { kind: "text", text: "You can fund your Kipit wallet by bank transfer or card." },
        { kind: "funding" },
      ],
    };
  }

  // CHAT-002 — balance
  if (has(text, ["balance", "how much", "portfolio value", "worth", "wallet"])) {
    return {
      id: nextId(),
      role: "assistant",
      screen: "CHAT-002",
      blocks: [
        { kind: "text", text: `Your current portfolio value is ${naira(TOTAL)}.` },
        { kind: "balance" },
      ],
    };
  }

  // CHAT-007 — maturity
  if (has(text, ["mature", "maturity", "matures", "payout date"])) {
    return {
      id: nextId(),
      role: "assistant",
      screen: "CHAT-007",
      blocks: [
        { kind: "text", text: `Your next maturity is on ${NEXT_MATURITY.date}.` },
        { kind: "maturity" },
      ],
    };
  }

  // CHAT-008 — transaction status
  if (
    has(text, [
      "track",
      "transaction",
      "where is my deposit",
      "deposit",
      "withdrawal",
      "withdraw",
      "status",
      "processed",
    ])
  ) {
    return {
      id: nextId(),
      role: "assistant",
      screen: "CHAT-008",
      blocks: [
        { kind: "text", text: "Here are your most recent money movements." },
        { kind: "status" },
      ],
    };
  }

  // CHAT-003 — investment discovery
  if (has(text, ["invest", "plan", "grow", "put money", "save"]) && !has(text, ["product"])) {
    return {
      id: nextId(),
      role: "assistant",
      screen: "CHAT-003",
      blocks: [
        {
          kind: "text",
          text: amount
            ? `Great — ${naira(amount)} to invest. Two quick questions.`
            : "Happy to help. Two quick questions so I can narrow it down.",
        },
        {
          kind: "chips",
          label: "How long do you want to invest?",
          options: [
            { label: "Under 6 months", send: "match:short:" },
            { label: "6 months or more", send: "match:long:" },
            { label: "I need access anytime", send: "match:short:yes" },
          ],
        },
      ],
    };
  }

  // CHAT-004 — product catalogue
  if (has(text, ["product", "available", "rates", "options", "offer"])) {
    return {
      id: nextId(),
      role: "assistant",
      screen: "CHAT-004",
      blocks: [
        {
          kind: "products",
          intro: "These are open right now. Rate, tenor and minimum are shown together.",
          amount: amount ?? DEFAULT_AMOUNT,
          products: compact([callProduct, fixedProducts[0], marketProducts[0]]),
        },
      ],
    };
  }

  // CHAT-010 — unsupported request
  return {
    id: nextId(),
    role: "assistant",
    screen: "CHAT-010",
    blocks: [
      {
        kind: "text",
        text: "I can help you with your Kipit account, investments, transactions and available products.",
      },
      { kind: "unsupported" },
    ],
  };
}

export const CHAT_STATUSES: {
  label: string;
  tone: StatusTone;
  detail: string;
  amount: number;
  time: string;
  to: string;
}[] = [
  {
    label: "Withdrawal to GTBank ••4521",
    tone: "processing",
    detail: "Sent for payout — usually settles same day.",
    amount: 50_000,
    time: "Today, 10:12",
    to: "/withdraw/tracker",
  },
  {
    label: "Deposit — bank transfer",
    tone: "successful",
    detail: "Credited to your wallet.",
    amount: 200_000,
    time: "Today, 09:14",
    to: "/portfolio/transactions",
  },
  {
    label: "Card payment",
    tone: "declined",
    detail: "Your bank declined the payment. Nothing was charged.",
    amount: 30_000,
    time: "26 Aug",
    to: "/wallet/failed",
  },
  {
    label: "Explore subscription — 364-Day T-Bill",
    tone: "pending",
    detail: "Awaiting allocation at the next auction.",
    amount: 500_000,
    time: "24 Aug",
    to: "/portfolio",
  },
];

export const FUNDING_ACCOUNT = {
  name: "Kipit / Adaeze Okafor",
  number: "9902 4471 08",
  bank: "Providus Bank",
};
