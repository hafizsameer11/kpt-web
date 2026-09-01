import { useRef, useState } from "react";
import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Compass,
  Eye,
  EyeOff,
  FileText,
  Home,
  Landmark,
  Lightbulb,
  PieChart,
  PiggyBank,
  Plus,
  Search,
  Settings,
  TrendingDown,
  TrendingUp,
  Wallet,
  Zap,
  type LucideIcon,
} from "lucide-react";
import {
  DashboardSidebar,
  DashboardTopBar,
} from "@/components/kipit/DashboardSidebar";
import { NewUserEmptyState } from "@/components/kipit/NewUserEmptyState";
import { FeedThumb } from "@/components/kipit/FeedThumb";
import { useBalanceVisibility, useIsNewUser } from "@/hooks/useBalanceVisibility";

export const Route = createFileRoute("/home-v7")({
  head: () => ({
    meta: [
      { title: "Kipit Home — Discover Concept" },
      {
        name: "description",
        content:
          "A Trove-inspired home for Kipit: discover investments, watchlist, portfolio summary and activity.",
      },
      { property: "og:title", content: "Kipit Home — Discover Concept" },
      {
        property: "og:description",
        content: "Discover simplified investing on Kipit.",
      },
    ],
  }),
  component: HomeV7,
});

const naira = (n: number) => `₦${n.toLocaleString()}`;
const MASK = "₦••••••";

/* ------------------------------ data ------------------------------ */

const PORTFOLIO_VALUE = 1830150;
const WALLET_BALANCE = 128500;

const RANGES = [
  { key: "1D", label: "1D", change: 4820, pct: 0.3, series: [12, 13, 12.4, 14, 13.6, 15, 15.4] },
  { key: "1W", label: "1W", change: 21400, pct: 1.2, series: [10, 12, 11, 14, 13, 16, 17] },
  { key: "1M", label: "1M", change: 96400, pct: 5.6, series: [8, 10, 9, 12, 14, 13, 18] },
  { key: "1Y", label: "1Y", change: 412300, pct: 29.1, series: [4, 6, 5, 9, 12, 15, 20] },
  { key: "All", label: "All", change: 630150, pct: 52.5, series: [2, 3, 6, 8, 11, 16, 22] },
] as const;

const DISCOVER = [
  { name: "Kipit FlexiYield", meta: "18.2% p.a. · Flexible", tone: "brand", icon: Zap },
  { name: "Treasury Notes 91-Day", meta: "21.4% p.a. · Low risk", tone: "gold", icon: Landmark },
  { name: "Kipit Dollar Fund", meta: "9.8% p.a. · USD", tone: "violet", icon: CircleDollarSign },
  { name: "Money Market Fund", meta: "16.1% p.a. · Daily yield", tone: "teal", icon: PiggyBank },
] as const;

const WATCHLIST = [
  { ticker: "NGX30", name: "Nigerian All-Share", change: 2.4 },
  { ticker: "T-BILL", name: "91-Day Treasury", change: 1.1 },
  { ticker: "USD/NGN", name: "Dollar Parallel", change: -1.8 },
  { ticker: "COCOA", name: "Cocoa Futures", change: 3.6 },
] as const;

/* Daily payouts that add up exactly to the weekly total shown. */
const WEEKLY = [
  { day: "Mon", value: 4200 },
  { day: "Tue", value: 5800 },
  { day: "Wed", value: 3600 },
  { day: "Thu", value: 7100 },
  { day: "Fri", value: 4900 },
  { day: "Sat", value: 6600 },
  { day: "Sun", value: 9950 },
] as const;
const WEEKLY_TOTAL = WEEKLY.reduce((s, d) => s + d.value, 0);
const WEEKLY_MAX = Math.max(...WEEKLY.map((d) => d.value));

const ACTIVITY = [
  { label: "Kipit FlexiYield payout", time: "Today · 09:12", amount: 9950, credit: true },
  { label: "Bought T-Bill 91-Day", time: "Yesterday", amount: 100000, credit: false },
  { label: "Wallet deposit", time: "Mon · 14:40", amount: 150000, credit: true },
] as const;

const FEED = [
  { tag: "Investing 101", title: "What are treasury bills and why everyone is buying them" },
  { tag: "Market watch", title: "Naira steadies — what it means for dollar funds" },
  { tag: "Kipit guide", title: "How to build a 12-month ladder with short-dated notes" },
] as const;

const MATURITY_PROGRESS = 78;

const TONE: Record<string, string> = {
  brand: "bg-brand/10 text-brand",
  gold: "bg-accent/15 text-gold-foreground",
  violet: "bg-violet/10 text-violet",
  teal: "bg-teal/10 text-teal",
};


const TABS: { to: string; label: string; icon: LucideIcon }[] = [
  { to: "/home-v7", label: "Home", icon: Home },
  { to: "/invest", label: "Invest", icon: TrendingUp },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/portfolio", label: "Portfolio", icon: PieChart },
  { to: "/settings", label: "Settings", icon: Settings },
];

/* ------------------------------ atoms ------------------------------ */

function Sparkline({ data, className }: { data: readonly number[]; className?: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * 100},${36 - ((v - min) / (max - min)) * 32}`)
    .join(" ");
  return (
    <svg viewBox="0 0 100 40" preserveAspectRatio="none" className={className}>
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function SectionTitle({ children, action }: { children: string; action?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-base font-extrabold text-foreground">{children}</h2>
      {action ? (
        <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-brand">
          {action} <ChevronRight className="size-3.5" />
        </span>
      ) : null}
    </div>
  );
}

/* ------------------------------ header ------------------------------ */

function GreetingHeader() {
  return (
    <header className="flex items-center gap-3 md:hidden">
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand text-sm font-extrabold text-brand-foreground">
        AO
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">Good morning</p>
        <p className="truncate text-base font-extrabold text-foreground">Adaeze O.</p>
      </div>
      <button
        aria-label="Search"
        className="grid size-10 place-items-center rounded-full border border-border bg-card text-muted-foreground transition hover:bg-muted"
      >
        <Search className="size-4.5" />
      </button>
      <Link
        to="/notifications"
        aria-label="Notifications"
        className="relative grid size-10 place-items-center rounded-full border border-border bg-card text-muted-foreground transition hover:bg-muted"
      >
        <Bell className="size-4.5" />
        <span className="absolute right-2 top-2 size-2 rounded-full bg-gold" />
      </Link>
    </header>
  );
}

/* ---------------------------- balance card ---------------------------- */

function BalanceCard() {
  const { hidden, toggle } = useBalanceVisibility();
  const [rangeKey, setRangeKey] = useState<string>("1M");
  const range = RANGES.find((r) => r.key === rangeKey) ?? RANGES[2];

  return (
    <section className="overflow-hidden rounded-3xl bg-brand-gradient p-5 text-brand-foreground shadow-float md:p-6">
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-brand-foreground/70">Total portfolio value</p>
          <div className="mt-1 flex items-center gap-2">
            <h1 className="text-3xl font-extrabold tabular-nums md:text-4xl">
              {hidden ? MASK : naira(PORTFOLIO_VALUE)}
            </h1>
            <button
              onClick={toggle}
              aria-label={hidden ? "Show balance" : "Hide balance"}
              className="rounded-full bg-brand-foreground/10 p-1.5 transition hover:bg-brand-foreground/20"
            >
              {hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-gold">
            <TrendingUp className="size-4" /> +{hidden ? "••••" : naira(range.change)} ({range.pct}%)
            <span className="text-brand-foreground/70">
              {range.key === "All" ? "all time" : `past ${range.label}`}
            </span>
          </p>
        </div>

        <Sparkline
          key={range.key}
          data={range.series}
          className="h-16 w-full text-gold md:w-56"
        />
      </div>

      <div
        role="tablist"
        aria-label="Performance timeframe"
        className="mt-4 flex gap-1.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {RANGES.map((r) => {
          const active = r.key === rangeKey;
          return (
            <button
              key={r.key}
              role="tab"
              aria-selected={active}
              onClick={() => setRangeKey(r.key)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                active
                  ? "bg-gold text-gold-foreground"
                  : "bg-brand-foreground/10 text-brand-foreground/80 hover:bg-brand-foreground/20"
              }`}
            >
              {r.label}
            </button>
          );
        })}
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-3">
        <button className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gold py-2.5 text-sm font-bold text-gold-foreground transition hover:brightness-105">
          <Plus className="size-4" /> Invest
        </button>
        <button className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-foreground/10 py-2.5 text-sm font-bold transition hover:bg-brand-foreground/20">
          <Wallet className="size-4" /> Add money
        </button>
        <button className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-foreground/10 py-2.5 text-sm font-bold transition hover:bg-brand-foreground/20">
          <ArrowUpRight className="size-4" /> Withdraw
        </button>
      </div>
    </section>
  );
}


/* ------------------------------ wallet ------------------------------ */

function WalletCard() {
  const { hidden } = useBalanceVisibility();
  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
            <Wallet className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-muted-foreground">Kipit Wallet</p>
            <p className="text-lg font-extrabold tabular-nums text-foreground">
              {hidden ? MASK : naira(WALLET_BALANCE)}
            </p>
          </div>
        </div>
        <button className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-bold text-foreground transition hover:bg-muted">
          <FileText className="size-3.5" /> Statements
        </button>
      </div>
      <p className="mt-3 rounded-lg bg-muted/60 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
        Funds in your wallet don’t earn returns until invested. Move money into a plan to start growing it.
      </p>
    </section>
  );
}

/* ----------------------------- discover ----------------------------- */

function Discover() {
  const railRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    railRef.current?.scrollBy({ left: dir * 220, behavior: "smooth" });
  };

  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-base font-extrabold text-foreground">Discover investments</h2>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-brand">
            See all <ChevronRight className="size-3.5" />
          </span>
          <div className="hidden gap-1 md:flex">
            <button
              onClick={() => scrollBy(-1)}
              aria-label="Scroll products left"
              className="grid size-7 place-items-center rounded-full border border-border bg-card text-muted-foreground transition hover:bg-muted"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={() => scrollBy(1)}
              aria-label="Scroll products right"
              className="grid size-7 place-items-center rounded-full border border-border bg-card text-muted-foreground transition hover:bg-muted"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="relative">
        <div
          ref={railRef}
          className="flex snap-x items-stretch gap-3 overflow-x-auto pb-1 pr-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {DISCOVER.map((d) => {
            const Icon = d.icon;
            return (
              <div
                key={d.name}
                className="flex w-44 shrink-0 snap-start flex-col rounded-2xl border border-border bg-card p-4 shadow-card transition hover:shadow-float"
              >
                <span className={`grid size-10 place-items-center rounded-xl ${TONE[d.tone]}`}>
                  <Icon className="size-5" />
                </span>
                <p className="mt-3 text-sm font-bold leading-snug text-foreground">{d.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{d.meta}</p>
                <button className="mt-auto w-full rounded-lg bg-brand pt-2 pb-2 text-xs font-bold text-brand-foreground transition hover:brightness-110 [margin-top:0.75rem]">
                  Start investing
                </button>
              </div>
            );
          })}
        </div>
        {/* fade affordance so the rail reads as scrollable, not clipped */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background to-transparent" />
      </div>
    </section>
  );
}

/* ----------------------------- watchlist ----------------------------- */

function Watchlist() {
  return (
    <section>
      <SectionTitle action="Markets">Watchlist</SectionTitle>
      <ul className="divide-y divide-border rounded-2xl border border-border bg-card shadow-card">
        {WATCHLIST.map((w) => {
          const up = w.change >= 0;
          return (
            <li key={w.ticker} className="flex items-center gap-3 px-4 py-3.5">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand/10 text-xs font-extrabold text-brand">
                {w.ticker.slice(0, 2)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-foreground">{w.ticker}</span>
                <span className="text-xs text-muted-foreground">{w.name}</span>
              </span>
              <Sparkline
                data={up ? [2, 4, 3, 6, 5, 8, 10] : [10, 8, 9, 6, 7, 4, 2]}
                className={`hidden h-7 w-14 sm:block ${up ? "text-gold" : "text-brand/40"}`}
              />
              <span
                className={`inline-flex items-center gap-0.5 text-sm font-extrabold ${
                  up ? "text-success" : "text-destructive"
                }`}
              >
                {up ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
                {up ? "+" : ""}
                {w.change}%
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ------------------------- earnings & maturity ------------------------- */

function EarningsAndMaturity() {
  const { hidden } = useBalanceVisibility();
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <section className="rounded-2xl border border-border bg-card p-4 shadow-card">
        <p className="text-xs font-semibold text-muted-foreground">Earned this week</p>
        <p className="mt-1 text-xl font-extrabold tabular-nums text-foreground">
          {hidden ? MASK : naira(WEEKLY_TOTAL)}
        </p>
        <div className="mt-3 flex h-20 items-end gap-1.5">
          {WEEKLY.map((d, i) => (
            <div key={d.day} className="flex h-full flex-1 flex-col justify-end gap-1.5">
              <div
                title={`${d.day}: ${hidden ? MASK : naira(d.value)}`}
                className={`rounded-t-md ${i === WEEKLY.length - 1 ? "bg-gold" : "bg-brand/20"}`}
                style={{ height: `${(d.value / WEEKLY_MAX) * 100}%` }}
              />
              <span className="text-center text-[0.7rem] font-semibold text-muted-foreground">
                {d.day.slice(0, 1)}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Best day <span className="font-semibold text-foreground">Sun</span> ·{" "}
          {hidden ? MASK : naira(WEEKLY_MAX)}
        </p>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-card">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-accent/15 text-gold-foreground">
            <Landmark className="size-4" />
          </span>
          <p className="text-xs font-semibold text-muted-foreground">Next maturity</p>
        </div>
        <p className="mt-2 text-sm font-bold text-foreground">Treasury Notes · 91-Day</p>
        <p className="text-xl font-extrabold tabular-nums text-foreground">
          {hidden ? MASK : naira(460000)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Matures <span className="font-semibold text-foreground">12 Sep 2026</span> · 11 days left
        </p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-gold" style={{ width: `${MATURITY_PROGRESS}%` }} />
        </div>
        <div className="mt-1.5 flex items-center justify-between text-xs text-muted-foreground">
          <span>13 Jun</span>
          <span className="font-semibold text-foreground">{MATURITY_PROGRESS}% of term</span>
          <span>12 Sep</span>
        </div>
      </section>
    </div>
  );
}


/* ----------------------- recommendation & feed ----------------------- */

function Recommendation() {
  return (
    <section className="flex items-center gap-3 rounded-2xl border border-gold/30 bg-accent/10 p-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gold text-gold-foreground">
        <Lightbulb className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-foreground">Grow your idle wallet cash</p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Your wallet has sat idle for 6 days — the 91-day T-Bill is yielding 21.4% p.a.
        </p>
      </div>
      <Link
        to="/explore"
        className="shrink-0 rounded-lg bg-brand px-3 py-2 text-xs font-bold text-brand-foreground transition hover:brightness-110"
      >
        Explore
      </Link>
    </section>
  );
}

function Activity() {
  const { hidden } = useBalanceVisibility();
  return (
    <section>
      <SectionTitle action="See all">Recent activity</SectionTitle>
      <ul className="divide-y divide-border rounded-2xl border border-border bg-card shadow-card">
        {ACTIVITY.map((a) => (
          <li key={a.label} className="flex items-center gap-3 px-4 py-3.5">
            <span
              className={`grid size-9 shrink-0 place-items-center rounded-full ${
                a.credit ? "bg-success/10" : "bg-muted"
              }`}
            >
              {a.credit ? (
                <ArrowDownLeft className="size-4 text-success" />
              ) : (
                <ArrowUpRight className="size-4 text-muted-foreground" />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-foreground">{a.label}</span>
              <span className="text-xs text-muted-foreground">{a.time}</span>
            </span>
            <span className={`text-sm font-bold tabular-nums ${a.credit ? "text-success" : "text-foreground"}`}>
              {hidden ? "₦••••••" : `${a.credit ? "+" : "−"}${naira(a.amount)}`}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ContentFeed() {
  return (
    <section>
      <SectionTitle>For you</SectionTitle>
      <div className="grid gap-3 sm:grid-cols-2">
        {FEED.map((f, i) => (
          <article
            key={f.title}
            className="rounded-2xl border border-border bg-card p-4 shadow-card transition hover:shadow-float"
          >
              <FeedThumb index={i} />
            <span className="inline-block rounded-full bg-brand/10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-brand">
              {f.tag}
            </span>
            <h3 className="mt-2 text-sm font-bold leading-snug text-foreground">{f.title}</h3>
            <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand">
              Read <ChevronRight className="size-3.5" />
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------ chrome ------------------------------ */

function MobileTabBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    /* Trove-style: icon-only bar, gold dot under the active tab */
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] md:hidden">
      <ul className="grid grid-cols-5">
        {TABS.map((tab) => {
          const active = pathname === tab.to;
          const Icon = tab.icon;
          return (
            <li key={tab.to}>
              <Link
                to={tab.to}
                aria-label={tab.label}
                className={`flex flex-col items-center gap-1 py-3 transition-colors ${
                  active ? "text-brand" : "text-muted-foreground"
                }`}
              >
                <Icon
                  className="size-5.5"
                  strokeWidth={active ? 2.4 : 1.6}
                />
                <span
                  className={`size-1.5 rounded-full transition-colors ${
                    active ? "bg-gold" : "bg-transparent"
                  }`}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/* ------------------------------ screen ------------------------------ */

function HomeV7() {
  const isNewUser = useIsNewUser();
  return (
    <div className="type-v7 min-h-screen bg-background">
      <DashboardSidebar activePath="/home-v7" />
      <div className="md:pl-64">
        <DashboardTopBar title="Home" />
        <main className="mx-auto w-full max-w-2xl space-y-5 px-4 pb-28 pt-5 md:max-w-none md:px-8 md:pb-16">
          {isNewUser ? (
            <NewUserEmptyState />
          ) : (
            <>
              <GreetingHeader />
              <BalanceCard />
              <div className="grid gap-5 lg:grid-cols-3">
                <div className="min-w-0 space-y-5 lg:col-span-2">
                  <Discover />
                  <EarningsAndMaturity />
                  <Recommendation />
                  <ContentFeed />
                </div>
                <div className="min-w-0 space-y-5">
                  <Watchlist />
                  <WalletCard />
                  <Activity />
                </div>
              </div>
            </>
          )}
        </main>
        <MobileTabBar />
      </div>
    </div>
  );
}
