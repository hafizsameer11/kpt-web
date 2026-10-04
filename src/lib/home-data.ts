import {
  ArrowDownLeft,
  ArrowUpRight,
  FileText,
  PlusCircle,
  type LucideIcon,
} from "lucide-react";
import { getWalletBalance, subscribeWallet } from "@/lib/wallet-balance";


/**
 * Single source of truth for the Home Dashboard (MOB-020 / WEB-002).
 * Money figures hydrate from kipit-api via live-balances / wallet-balance.
 */
/** Live wallet balance — moves when the user funds or withdraws. */
export let WALLET = getWalletBalance();
/** Invested total — updated by hydrateLiveBalances. */
export let INVESTED = 0;
export let TOTAL = WALLET + INVESTED;

subscribeWallet((value) => {
  WALLET = value;
  TOTAL = WALLET + INVESTED;
});

export function setInvestedTotal(value: number) {
  INVESTED = Math.max(0, Math.round(value));
  TOTAL = WALLET + INVESTED;
}

export const WEEK_EARNINGS = 0;
export const MONTH_CHANGE = 0;
export const MONTH_CHANGE_PCT = 0;

export const naira = (value: number) =>
  `₦${value.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;

/** Next maturity — filled from API; empty until hydrate. */
export let NEXT_MATURITY = {
  name: "",
  tenor: "",
  amount: 0,
  rate: "",
  date: "",
  daysLeft: 0,
  totalDays: 0,
  expectedPayout: 0,
};

export let HOLDINGS: {
  id: string;
  name: string;
  rate: string;
  amount: number;
  date: string;
  daysLeft: number;
  totalDays: number;
  expectedPayout: number;
  autoRenew: boolean;
}[] = [];

/** Upcoming interest / maturity payouts — filled from live holdings when available. */
export let PAYOUTS: { label: string; date: string; amount: number }[] = [];

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

/** Content feed — empty until /v1/home/feed or /v1/me/home hydrate. */
export let FEED: { id: string; tag: string; title: string; body: string }[] = [];

const feedListeners = new Set<() => void>();
export function subscribeFeed(listener: () => void) {
  feedListeners.add(listener);
  return () => {
    feedListeners.delete(listener);
  };
}
function emitFeed() {
  feedListeners.forEach((l) => l());
}

export function setHomeFeed(
  items: { id: string; tag?: string | null; title: string; body?: string | null }[],
) {
  FEED = items.map((a) => ({
    id: a.id,
    tag: a.tag || "Update",
    title: a.title,
    body: a.body || "",
  }));
  emitFeed();
}

function feedFromLearnArticles() {
  return import("@/lib/learn-data").then(({ LEARN_ARTICLES }) =>
    LEARN_ARTICLES.slice(0, 4).map((a) => ({
      id: a.id,
      tag: a.tag,
      title: a.title,
      body: a.body,
    })),
  );
}

export async function hydrateHomeFeedFromApi() {
  try {
    const { fetchHome, fetchHomeFeed, isAuthenticated } = await import("@/lib/api");
    if (!isAuthenticated()) {
      setHomeFeed(await feedFromLearnArticles());
      return FEED;
    }
    try {
      const cards = await fetchHomeFeed();
      if (Array.isArray(cards) && cards.length) {
        setHomeFeed(cards);
        return FEED;
      }
    } catch {
      /* fall through to /v1/me/home */
    }
    const home = await fetchHome();
    if (home.feed?.length) {
      setHomeFeed(home.feed);
    } else {
      setHomeFeed(await feedFromLearnArticles());
    }
  } catch {
    try {
      setHomeFeed(await feedFromLearnArticles());
    } catch {
      FEED = [];
      emitFeed();
    }
  }
  return FEED;
}

/** Weekly interest series — zeros until API provides a chart series. */
export const WEEK_SERIES = [0, 0, 0, 0, 0, 0, 0];
export const WEEK_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
