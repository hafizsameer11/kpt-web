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
  tenorDays?: number | null;
  startDate?: string | null;
  accrued?: number;
  expectedInterest?: number | null;
  valueAtMaturity?: number;
  planType?: "LOCK" | "FLEX" | null;
  interestPayout?: "AT_MATURITY" | "UPFRONT" | null;
};

export type LiveNextMaturity = {
  id: string;
  name: string;
  amount: number;
  date: string;
  daysLeft: number;
  ratePct?: number;
  tenorDays?: number | null;
  startDate?: string | null;
  accrued?: number;
  expectedInterest?: number;
  expectedPayout?: number;
  valueAtMaturity?: number;
} | null;

/** Principal + expected net interest at maturity (B4 Coming up / final value). */
export function nextMaturityPayout(nm: NonNullable<LiveNextMaturity>): number {
  const principal = Math.round(nm.amount || 0);
  if (typeof nm.valueAtMaturity === "number" && nm.valueAtMaturity >= principal) {
    return Math.round(nm.valueAtMaturity);
  }
  if (typeof nm.expectedPayout === "number" && nm.expectedPayout > principal) {
    return Math.round(nm.expectedPayout);
  }
  const fromApi = Math.round(nm.expectedInterest || 0);
  let computed = 0;
  const ratePct = nm.ratePct || 0;
  const tenorDays = nm.tenorDays || 0;
  if (ratePct > 0 && tenorDays > 0) {
    computed = Math.round((principal * (ratePct / 100) * tenorDays) / 365);
  }
  return principal + Math.max(fromApi, computed);
}

export function holdingFinalValue(h: LiveHolding): number {
  const principal = Math.round(h.amount || 0);
  if (typeof h.valueAtMaturity === "number" && h.valueAtMaturity >= principal) {
    return Math.round(h.valueAtMaturity);
  }
  return principal + Math.round(h.expectedInterest || 0);
}

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
  callCustodianNote: string;
  valueAtMaturity: number;
  profileComplete: boolean;
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
  callCustodianNote: "",
  valueAtMaturity: 0,
  profileComplete: true,
  user: null,
};

let state: LiveState = { ...EMPTY };
const listeners = new Set<() => void>();
/** B12 — coalesce concurrent hydrates into one request. */
let hydrateInFlight: Promise<LiveState> | null = null;

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
  if (hydrateInFlight) return hydrateInFlight;
  hydrateInFlight = doHydrateLiveBalances().finally(() => {
    hydrateInFlight = null;
  });
  return hydrateInFlight;
}

async function doHydrateLiveBalances() {
  try {
    const [home, call, placements] = await Promise.all([
      fetchHome(),
      fetchCallAccount().catch(() => ({
        balance: 0,
        ratePct: 0,
        custodianNote: undefined as string | undefined,
      })),
      fetchPlacements().catch(() => []),
      refreshWalletFromApi(),
    ]);
    const { getWalletBalance } = await import("@/lib/wallet-balance");
    const walletBal = Math.max(0, Math.round(getWalletBalance()));
    const callBalance = Math.max(0, Math.round(call.balance ?? 0));
    const active = (placements ?? []).filter(
      (p) => String(p.status).toUpperCase() === "ACTIVE",
    );
    const planRows = active.filter((p) => {
      const k = String(p.kind).toUpperCase();
      return k === "FIXED" || k === "EXPLORE";
    });
    const enriched: LiveHolding[] = planRows.map((p) => ({
      id: p.id,
      name: p.name,
      amount: Math.round(p.principal),
      ratePct: p.ratePct,
      maturityDate: p.maturityDate,
      tenorDays: p.tenorDays,
      startDate: p.startDate ?? null,
      accrued: Math.round(p.accrued || 0),
      expectedInterest: p.expectedInterest ?? p.expectedNet ?? null,
      valueAtMaturity:
        typeof p.valueAtMaturity === "number"
          ? Math.round(p.valueAtMaturity)
          : Math.round(p.principal + (p.expectedInterest || p.expectedNet || 0)),
      planType: p.planType ?? null,
      interestPayout: p.interestPayout ?? null,
    }));
    const holdings: LiveHolding[] =
      enriched.length > 0
        ? enriched.slice(0, 8)
        : (home.holdings ?? []).map((h) => ({
            id: h.id,
            name: h.name,
            amount: h.amount,
            ratePct: h.ratePct,
            maturityDate: h.maturityDate,
            tenorDays: (h as { tenorDays?: number }).tenorDays ?? null,
          }));

    const plansMtm = planRows.reduce(
      (s, p) => s + Math.round(p.principal) + Math.round(p.accrued || 0),
      0,
    );
    const plansVam = planRows.reduce((s, p) => {
      if (typeof p.valueAtMaturity === "number") return s + Math.round(p.valueAtMaturity);
      return s + Math.round(p.principal + (p.expectedInterest || p.expectedNet || 0));
    }, 0);
    // B3: principal + accrued + Call (+ wallet in portfolio total)
    const invested = callBalance + plansMtm;
    const portfolioTotal = walletBal + invested;
    const valueAtMaturity =
      Math.max(0, Math.round(Number(home.valueAtMaturity) || 0)) ||
      walletBal + callBalance + plansVam;

    let nextMaturity: LiveNextMaturity = home.nextMaturity;
    if (nextMaturity) {
      const match = holdings.find((h) => h.id === nextMaturity!.id);
      if (match) {
        nextMaturity = {
          ...nextMaturity,
          name: match.name || nextMaturity.name,
          ...(match.ratePct ? { ratePct: match.ratePct } : {}),
          ...(match.tenorDays != null ? { tenorDays: match.tenorDays } : {}),
          ...(match.startDate != null ? { startDate: match.startDate } : {}),
          ...(match.accrued != null ? { accrued: match.accrued } : {}),
          ...(match.expectedInterest != null
            ? { expectedInterest: match.expectedInterest }
            : {}),
          ...(match.valueAtMaturity != null
            ? { valueAtMaturity: match.valueAtMaturity, expectedPayout: match.valueAtMaturity }
            : {}),
        };
      }
    }

    state = {
      greetingName: home.greetingName || home.user?.firstName || "",
      invested,
      interestThisWeek: Math.max(0, Math.round(home.interestThisWeek ?? 0)),
      interestWeekSeries: Array.from({ length: 7 }, (_, i) =>
        Math.max(0, Math.round(Number(home.interestWeekSeries?.[i]) || 0)),
      ),
      interestWeekLabels: Array.from({ length: 7 }, (_, i) => {
        const raw = String(home.interestWeekLabels?.[i] || WEEKDAY_FALLBACK[i] || "").slice(0, 1);
        return raw || WEEKDAY_FALLBACK[i]!;
      }),
      holdings,
      nextMaturity,
      callBalance,
      callRatePct: call.ratePct ?? 0,
      callCustodianNote: call.custodianNote ?? "",
      valueAtMaturity,
      profileComplete: home.profileComplete !== false,
      user: home.user ?? null,
    };
    // Keep portfolioTotal available via invested + wallet on home screen.
    void portfolioTotal;
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
      ...state.holdings.map((h) => {
        const daysLeft = h.maturityDate
          ? Math.max(
              0,
              Math.ceil((new Date(h.maturityDate).getTime() - Date.now()) / 86_400_000),
            )
          : 0;
        const tenor = Math.max(h.tenorDays || 0, daysLeft, 1);
        return {
          id: h.id,
          name: h.name,
          rate: `${h.ratePct}% p.a.`,
          amount: h.amount + (h.accrued || 0),
          date: h.maturityDate ?? "",
          daysLeft,
          totalDays: tenor,
          expectedPayout: holdingFinalValue(h),
          autoRenew: false,
        };
      }),
    );
    if (state.nextMaturity) {
      const match = state.holdings.find((h) => h.id === state.nextMaturity!.id);
      homeData.NEXT_MATURITY.name = state.nextMaturity.name;
      homeData.NEXT_MATURITY.amount = state.nextMaturity.amount;
      homeData.NEXT_MATURITY.date = state.nextMaturity.date;
      homeData.NEXT_MATURITY.daysLeft = state.nextMaturity.daysLeft;
      homeData.NEXT_MATURITY.expectedPayout = nextMaturityPayout(state.nextMaturity);
      const ratePct =
        (state.nextMaturity.ratePct && state.nextMaturity.ratePct > 0
          ? state.nextMaturity.ratePct
          : null) ??
        (match && match.ratePct > 0 ? match.ratePct : 0);
      homeData.NEXT_MATURITY.rate = ratePct > 0 ? `${ratePct}% p.a.` : "—";
      const tenorDays = Math.max(
        state.nextMaturity.tenorDays || 0,
        match?.tenorDays || 0,
        1,
      );
      homeData.NEXT_MATURITY.tenor = `${tenorDays} days`;
      homeData.NEXT_MATURITY.totalDays = tenorDays;
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
            amount: holdingFinalValue(h),
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
    if (call.custodianNote) CALL_ACCOUNT.custodianNote = call.custodianNote;
    try {
      const { fetchPortfolioTransactions } = await import("@/lib/api");
      const txns = await fetchPortfolioTransactions();
      setCallActivityFromApi(
        (txns ?? [])
          .map((t) => {
            const k = String(t.kind).toUpperCase();
            const acct = String(t.accountType || "").toUpperCase();
            const d = String(t.description || "").toLowerCase();
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
      const explore = planRows
        .filter((p) => String(p.kind).toUpperCase() === "EXPLORE")
        .map((p) => ({
          id: p.id,
          name: p.name,
          issuer: "Marketplace",
          rate: `${p.ratePct}% p.a.`,
          amount: p.principal + (p.accrued || 0),
          expectedPayout:
            typeof p.valueAtMaturity === "number"
              ? p.valueAtMaturity
              : p.principal + (p.expectedInterest || 0),
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
