/**
 * Live portfolio / call balances from kipit-api. Starts at zero — no demo seed.
 */
import { useEffect, useSyncExternalStore } from "react";
import {
  fetchCallAccount,
  fetchHome,
  fetchPlacements,
  isAuthenticated,
  type ApiUser,
} from "@/lib/api";
import { refreshWalletFromApi } from "@/lib/wallet-balance";

const WEEKDAY_FALLBACK = ["M", "T", "W", "T", "F", "S", "S"];

export type LiveHolding = {
  id: string;
  name: string;
  amount: number;
  ratePct: number;
  maturityDate: string | null;
};

export type LiveNextMaturity = {
  id: string;
  name: string;
  amount: number;
  date: string;
  daysLeft: number;
  ratePct?: number;
} | null;

type LiveState = {
  greetingName: string;
  invested: number;
  interestThisWeek: number;
  interestWeekSeries: number[];
  interestWeekLabels: string[];
  holdings: LiveHolding[];
  nextMaturity: LiveNextMaturity;
  callBalance: number;
  callRatePct: number;
  user: ApiUser | null;
};

const EMPTY: LiveState = {
  greetingName: "",
  invested: 0,
  interestThisWeek: 0,
  interestWeekSeries: [0, 0, 0, 0, 0, 0, 0],
  interestWeekLabels: ["M", "T", "W", "T", "F", "S", "S"],
  holdings: [],
  nextMaturity: null,
  callBalance: 0,
  callRatePct: 0,
  user: null,
};

let state: LiveState = { ...EMPTY };
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getLiveState() {
  return state;
}

export function resetLiveBalances() {
  state = { ...EMPTY, holdings: [] };
  emit();
}

export async function hydrateLiveBalances() {
  if (!isAuthenticated()) {
    resetLiveBalances();
    return state;
  }
  try {
    const [home, call] = await Promise.all([
      fetchHome(),
      fetchCallAccount().catch(() => ({ balance: 0, ratePct: 0 })),
      refreshWalletFromApi(),
    ]);
    state = {
      greetingName: home.greetingName || home.user?.firstName || "",
      invested: Math.max(0, Math.round(home.invested?.balance ?? 0)),
      interestThisWeek: Math.max(0, Math.round(home.interestThisWeek ?? 0)),
      interestWeekSeries: Array.from({ length: 7 }, (_, i) =>
        Math.max(0, Math.round(Number(home.interestWeekSeries?.[i]) || 0)),
      ),
      interestWeekLabels: Array.from({ length: 7 }, (_, i) => {
        const raw = String(home.interestWeekLabels?.[i] || WEEKDAY_FALLBACK[i] || "").slice(0, 1);
        return raw || WEEKDAY_FALLBACK[i]!;
      }),
      holdings: home.holdings ?? [],
      nextMaturity: home.nextMaturity,
      callBalance: Math.max(0, Math.round(call.balance ?? 0)),
      callRatePct: call.ratePct ?? 0,
      user: home.user ?? null,
    };
    const { setInvestedTotal, setWeekInterestSeries } = await import("@/lib/home-data");
    setInvestedTotal(state.invested);
    setWeekInterestSeries(state.interestWeekSeries);
    const homeData = await import("@/lib/home-data");
    if (home.feed?.length) {
      homeData.setHomeFeed(home.feed);
    } else {
      void homeData.hydrateHomeFeedFromApi();
    }
    homeData.HOLDINGS.splice(
      0,
      homeData.HOLDINGS.length,
      ...state.holdings.map((h) => ({
        id: h.id,
        name: h.name,
        rate: `${h.ratePct}% p.a.`,
        amount: h.amount,
        date: h.maturityDate ?? "",
        daysLeft: 0,
        totalDays: 0,
        expectedPayout: h.amount,
        autoRenew: false,
      })),
    );
    if (state.nextMaturity) {
      const match = state.holdings.find((h) => h.id === state.nextMaturity!.id);
      homeData.NEXT_MATURITY.name = state.nextMaturity.name;
      homeData.NEXT_MATURITY.amount = state.nextMaturity.amount;
      homeData.NEXT_MATURITY.date = state.nextMaturity.date;
      homeData.NEXT_MATURITY.daysLeft = state.nextMaturity.daysLeft;
      homeData.NEXT_MATURITY.expectedPayout = state.nextMaturity.amount;
      const ratePct =
        (state.nextMaturity.ratePct && state.nextMaturity.ratePct > 0
          ? state.nextMaturity.ratePct
          : null) ??
        (match && match.ratePct > 0 ? match.ratePct : 0);
      homeData.NEXT_MATURITY.rate = ratePct > 0 ? `${ratePct}% p.a.` : "—";
      homeData.NEXT_MATURITY.tenor =
        state.nextMaturity.daysLeft >= 0
          ? `${Math.max(state.nextMaturity.daysLeft, 1)} days left`
          : "";
      homeData.NEXT_MATURITY.totalDays = Math.max(state.nextMaturity.daysLeft, 1);
    } else {
      homeData.NEXT_MATURITY.name = "";
      homeData.NEXT_MATURITY.amount = 0;
      homeData.NEXT_MATURITY.date = "";
      homeData.NEXT_MATURITY.daysLeft = 0;
      homeData.NEXT_MATURITY.expectedPayout = 0;
      homeData.NEXT_MATURITY.rate = "—";
      homeData.NEXT_MATURITY.tenor = "";
    }
    homeData.PAYOUTS.splice(
      0,
      homeData.PAYOUTS.length,
      ...state.holdings
        .filter((h) => h.maturityDate)
        .map((h) => {
          const d = new Date(h.maturityDate!);
          return {
            label: h.name,
            date: Number.isNaN(d.getTime())
              ? "—"
              : d.toLocaleDateString("en-NG", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }),
            amount: h.amount,
            _days: Number.isNaN(d.getTime())
              ? 9999
              : Math.max(0, Math.ceil((d.getTime() - Date.now()) / 86_400_000)),
          };
        })
        .sort((a, b) => a._days - b._days)
        .slice(0, 5)
        .map(({ label, date, amount }) => ({ label, date, amount })),
    );
    const { syncCallAccountFromLive, setCallActivityFromApi, CALL_ACCOUNT } =
      await import("@/lib/invest-data");
    syncCallAccountFromLive(state.callBalance, state.callRatePct);
    try {
      const { fetchPortfolioTransactions } = await import("@/lib/api");
      const txns = await fetchPortfolioTransactions();
      setCallActivityFromApi(
        (txns ?? [])
          .map((t) => {
            const k = String(t.kind).toUpperCase();
            const acct = String(t.accountType || "").toUpperCase();
            const d = String(t.description || "").toLowerCase();
            // Call ledger only — never count wallet maturity payouts as Call interest.
            const isCallInterest =
              k === "INTEREST" &&
              !/maturity/i.test(d) &&
              (acct === "USER_CALL" || d.includes("call account"));
            const isCallDeposit = k === "CALL_DEPOSIT";
            const isCallWithdraw = k === "CALL_WITHDRAW";
            if (!isCallInterest && !isCallDeposit && !isCallWithdraw) return null;
            const kind: "deposit" | "withdrawal" | "interest" = isCallInterest
              ? "interest"
              : isCallWithdraw
                ? "withdrawal"
                : "deposit";
            return {
              id: t.id,
              kind,
              label: t.description || t.kind,
              date: t.createdAt?.slice(0, 10) || "",
              amount: Math.abs(t.amount),
              status: "successful" as const,
            };
          })
          .filter((row): row is NonNullable<typeof row> => row != null),
      );
    } catch {
      /* call activity optional */
    }
    // Call screen: daily Call interest only (not maturity / overall home interest).
    const callToday =
      typeof home.callInterestToday === "number"
        ? home.callInterestToday
        : typeof home.interestToday === "number"
          ? home.interestToday
          : null;
    if (callToday != null) {
      CALL_ACCOUNT.accruedToday = Math.max(0, Math.round(callToday));
    }
    try {
      const placements = await fetchPlacements();
      const explore = (placements ?? [])
        .filter((p) => {
          const kind = String(p.kind).toUpperCase();
          return kind === "EXPLORE";
        })
        .map((p) => ({
          id: p.id,
          name: p.name,
          issuer: "Marketplace",
          rate: `${p.ratePct}% p.a.`,
          amount: p.principal,
          expectedPayout: p.principal + (p.accrued || 0),
          date: p.maturityDate ?? "",
          daysLeft: 0,
          totalDays: p.tenorDays || 0,
        }));
      const portfolio = await import("@/lib/portfolio-data");
      portfolio.setExploreHoldings(explore);
    } catch {
      /* explore hydrate optional */
    }
    emit();
  } catch {
    /* keep prior live state */
  }
  return state;
}

export function useLiveBalances() {
  return useSyncExternalStore(subscribe, getLiveState, () => EMPTY);
}

/** Hydrate from API on mount and subscribe to live balances. */
export function useHydrateLiveBalances() {
  const state = useLiveBalances();
  useEffect(() => {
    void hydrateLiveBalances();
  }, []);
  return state;
}

export function callRateLabel(ratePct = state.callRatePct) {
  if (!ratePct) return "—";
  return `${ratePct}% p.a.`;
}

/** Call balance + rate from API (hydrates on mount). */
export function useCallAccountLive() {
  const live = useHydrateLiveBalances();
  return {
    balance: live.callBalance,
    rateLabel: callRateLabel(live.callRatePct),
    ratePct: live.callRatePct,
  };
}
