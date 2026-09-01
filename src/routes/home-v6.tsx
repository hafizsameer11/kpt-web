import { useState } from "react";
import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import {
  ArrowDownLeft,
  ArrowDownToLine,
  ArrowUpRight,
  ArrowUpFromLine,
  Bell,
  ChevronRight,
  CircleDollarSign,
  Compass,
  Eye,
  EyeOff,
  FileText,
  Home,
  Landmark,
  Lightbulb,
  PiggyBank,
  PieChart,
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
import { TierStatusCard, WalletNote, useGreeting } from "@/components/kipit/SpecBlocks";

export const Route = createFileRoute("/home-v6")({
  head: () => ({
    meta: [
      { title: "Kipit Home — Investing Concept" },
      {
        name: "description",
        content:
          "A Bamboo-inspired investing home for Kipit: portfolio chart, holdings, market movers and activity.",
      },
      { property: "og:title", content: "Kipit Home — Investing Concept" },
      {
        property: "og:description",
        content: "Track your portfolio, holdings and market movers on Kipit.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomeV6,
});

const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;
const MASK = "₦••••••";

/* ------------------------------ data ------------------------------ */

const WALLET_BALANCE = 128500;

const HOLDINGS = [
  { name: "Kipit FlexiYield", ticker: "FLEXI", value: 812400, change: 4.2, tone: "brand", icon: Zap },
  { name: "Treasury Notes 91-Day", ticker: "T-BILL", value: 460000, change: 1.1, tone: "gold", icon: Landmark },
  { name: "Kipit Dollar Fund", ticker: "USD", value: 312750, change: -0.6, tone: "violet", icon: CircleDollarSign },
  { name: "Money Market Fund", ticker: "MMF", value: 245000, change: 0.8, tone: "teal", icon: PiggyBank },
] as const;

/** Portfolio value is the sum of every holding — single source of truth. */
const PORTFOLIO_VALUE = HOLDINGS.reduce((sum, h) => sum + h.value, 0);

const RANGES = [
  { key: "1D", label: "today", change: 4820, pct: 0.3, series: [40, 41, 40.4, 42, 41.6, 43, 43.6, 44] },
  { key: "1W", label: "this week", change: 21400, pct: 1.2, series: [36, 38, 37, 40, 39, 42, 43, 44] },
  { key: "1M", label: "this month", change: 96400, pct: 5.6, series: [30, 33, 32, 36, 38, 37, 41, 44] },
  { key: "3M", label: "in 3 months", change: 184900, pct: 11.2, series: [24, 27, 26, 31, 34, 36, 40, 44] },
  { key: "1Y", label: "this year", change: 412300, pct: 29.1, series: [14, 18, 17, 23, 28, 31, 38, 44] },
  { key: "All", label: "all time", change: 630150, pct: 52.5, series: [6, 9, 13, 18, 24, 31, 38, 44] },
] as const;

const MOVERS = [
  { ticker: "NGX30", name: "Nigerian All-Share", change: 2.4 },
  { ticker: "T-BILL", name: "91-Day Treasury", change: 1.1 },
  { ticker: "USD/NGN", name: "Dollar Parallel", change: -1.8 },
  { ticker: "COCOA", name: "Cocoa Futures", change: 3.6 },
] as const;

/** Daily earnings that sum exactly to the weekly total shown above the chart. */
const WEEKLY = [
  { day: "M", value: 4820 },
  { day: "T", value: 6410 },
  { day: "W", value: 3980 },
  { day: "T", value: 7250 },
  { day: "F", value: 5120 },
  { day: "S", value: 6890 },
  { day: "S", value: 7680 },
] as const;

const WEEKLY_TOTAL = WEEKLY.reduce((sum, d) => sum + d.value, 0);
const WEEKLY_MAX = Math.max(...WEEKLY.map((d) => d.value));
const BEST_DAY = WEEKLY.reduce((a, b) => (b.value > a.value ? b : a));

const ACTIVITY = [
  { label: "Kipit FlexiYield payout", time: "Today · 09:12", amount: 7680, credit: true },
  { label: "Bought T-Bill 91-Day", time: "Yesterday", amount: 100000, credit: false },
  { label: "Wallet deposit", time: "Mon · 14:40", amount: 150000, credit: true },
] as const;

const FEED = [
  { tag: "Investing 101", title: "What are treasury bills and why everyone is buying them" },
  { tag: "Market watch", title: "Naira steadies — what it means for dollar funds" },
  { tag: "Guide", title: "Building a ₦1m portfolio on ₦50k a month" },
] as const;

const TONE: Record<string, string> = {
  brand: "bg-brand/10 text-brand",
  gold: "bg-accent/15 text-gold-foreground",
  violet: "bg-violet/10 text-violet",
  teal: "bg-teal/10 text-teal",
};

const TABS: { to: string; label: string; icon: LucideIcon }[] = [
  { to: "/home-v6", label: "Home", icon: Home },
  { to: "/invest", label: "Invest", icon: TrendingUp },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/portfolio", label: "Portfolio", icon: PieChart },
  { to: "/settings", label: "Settings", icon: Settings },
];

/* ------------------------------ atoms ------------------------------ */

function Sparkline({ data, className }: { data: readonly number[]; className?: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const span = max - min || 1;
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * 100},${36 - ((v - min) / span) * 32}`)
    .join(" ");
  return (
    <svg viewBox="0 0 100 40" preserveAspectRatio="none" className={className}>
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function SectionTitle({ children, action }: { children: string; action?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-sm font-bold tracking-wide text-foreground">{children}</h2>
      {action ? (
        <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-brand">
          {action} <ChevronRight className="size-3.5" />
        </span>
      ) : null}
    </div>
  );
}

/* --------------------------- hero / portfolio --------------------------- */

function PortfolioHero() {
  const { hidden, toggle } = useBalanceVisibility();
  const [rangeKey, setRangeKey] = useState<string>("1M");
  const range = RANGES.find((r) => r.key === rangeKey) ?? RANGES[2];

  return (
    <section className="relative overflow-hidden rounded-3xl bg-brand-gradient p-5 text-brand-foreground shadow-float md:p-7">
      <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-gold/15 blur-2xl" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-foreground/70">
            Portfolio value
          </p>
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
            <TrendingUp className="size-4" /> +{hidden ? "••••" : naira(range.change)} ({range.pct}%){" "}
            {range.label}
          </p>
        </div>
        <Link
          to="/notifications"
          className="relative rounded-full bg-brand-foreground/10 p-2.5 transition hover:bg-brand-foreground/20"
          aria-label="Notifications"
        >
          <Bell className="size-5" />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-gold" />
        </Link>
      </div>

      <div className="mt-4">
        <Sparkline data={range.series} className="h-20 w-full text-gold md:h-24" />
        <div className="mt-2 flex gap-1.5 overflow-x-auto">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRangeKey(r.key)}
              aria-pressed={r.key === rangeKey}
              className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                r.key === rangeKey
                  ? "bg-gold text-gold-foreground"
                  : "bg-brand-foreground/10 text-brand-foreground/80 hover:bg-brand-foreground/20"
              }`}
            >
              {r.key}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 md:max-w-md">
        {[
          { label: "Buy", icon: ArrowDownToLine, primary: true },
          { label: "Sell", icon: ArrowUpFromLine },
          { label: "Withdraw", icon: Wallet },
        ].map(({ label, icon: Icon, primary }) => (
          <button
            key={label}
            className={`inline-flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-bold transition ${
              primary
                ? "bg-gold text-gold-foreground hover:brightness-105"
                : "bg-brand-foreground/10 hover:bg-brand-foreground/20"
            }`}
          >
            <Icon className="size-4" /> {label}
          </button>
        ))}
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
          <span className="grid size-10 place-items-center rounded-xl bg-brand/10 text-brand">
            <Wallet className="size-5" />
          </span>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Kipit Wallet</p>
            <p className="text-lg font-extrabold tabular-nums text-foreground">
              {hidden ? MASK : naira(WALLET_BALANCE)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <button className="rounded-lg bg-brand px-3 py-2 text-xs font-bold text-brand-foreground transition hover:brightness-110">
            Add money
          </button>
          <button className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-bold text-foreground transition hover:bg-muted">
            <FileText className="size-3.5" /> Statements
          </button>
        </div>
      </div>
      <p className="mt-3 rounded-lg bg-muted/60 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
        Funds in your wallet don’t earn returns until invested. Move money into a plan to start growing it.
      </p>
    </section>
  );
}

/* ------------------------------ holdings ------------------------------ */

function Holdings() {
  const { hidden } = useBalanceVisibility();
  return (
    <section>
      <SectionTitle action="View all">My investments</SectionTitle>
      <ul className="divide-y divide-border rounded-2xl border border-border bg-card shadow-card">
        {HOLDINGS.map((h) => {
          const Icon = h.icon;
          return (
            <li key={h.ticker} className="flex items-center gap-3 px-4 py-3.5">
              <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${TONE[h.tone]}`}>
                <Icon className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-foreground">{h.name}</span>
                <span className="text-xs text-muted-foreground">{h.ticker}</span>
              </span>
              <Sparkline
                data={h.change >= 0 ? [3, 5, 4, 7, 6, 9, 11] : [11, 9, 10, 7, 8, 5, 4]}
                className={`hidden h-7 w-14 sm:block ${h.change >= 0 ? "text-gold" : "text-brand/50"}`}
              />
              <span className="text-right">
                <span className="block text-sm font-bold tabular-nums text-foreground">
                  {hidden ? "₦••••" : naira(h.value)}
                </span>
                <span
                  className={`inline-flex items-center gap-0.5 text-xs font-bold ${
                    h.change >= 0 ? "text-success" : "text-destructive"
                  }`}
                >
                  {h.change >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                  {h.change >= 0 ? "+" : ""}
                  {h.change}%
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ---------------------------- market movers ---------------------------- */

function Movers() {
  return (
    <section>
      <SectionTitle action="Markets">Market movers</SectionTitle>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {MOVERS.map((m) => (
          <div key={m.ticker} className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <p className="text-xs font-extrabold tracking-wide text-foreground">{m.ticker}</p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{m.name}</p>
            <Sparkline
              data={m.change >= 0 ? [2, 4, 3, 6, 5, 8, 10] : [10, 8, 9, 6, 7, 4, 2]}
              className={`mt-2 h-8 w-full ${m.change >= 0 ? "text-gold" : "text-brand/50"}`}
            />
            <p
              className={`mt-1 text-sm font-extrabold ${
                m.change >= 0 ? "text-success" : "text-destructive"
              }`}
            >
              {m.change >= 0 ? "+" : ""}
              {m.change}%
            </p>
          </div>
        ))}
      </div>
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
        <div className="mt-3 flex h-16 items-end gap-1.5">
          {WEEKLY.map((d, i) => (
            <div key={i} className="flex h-full flex-1 items-end">
              <div
                title={`${naira(d.value)}`}
                className={`w-full rounded-t-md ${
                  d.value === WEEKLY_MAX ? "bg-gold" : "bg-brand/20"
                }`}
                style={{ height: `${(d.value / WEEKLY_MAX) * 100}%` }}
              />
            </div>
          ))}
        </div>
        <div className="mt-1 flex gap-1.5 text-xs font-semibold text-muted-foreground">
          {WEEKLY.map((d, i) => (
            <span key={i} className="flex-1 text-center">
              {d.day}
            </span>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Best day: <span className="font-semibold text-foreground">
            {hidden ? "₦••••" : naira(BEST_DAY.value)}
          </span>
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
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-[78%] rounded-full bg-gold" />
        </div>
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span>13 Jun 2026</span>
          <span className="font-semibold text-foreground">78% of term</span>
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
              {hidden ? MASK : `${a.credit ? "+" : "−"}${naira(a.amount)}`}
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
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {FEED.map((f, i) => (
          <article
            key={f.title}
            className="flex flex-col rounded-2xl border border-border bg-card p-4 shadow-card transition hover:shadow-float"
          >
            <FeedThumb index={i} />
            <span className="inline-block w-fit rounded-full bg-brand/10 px-2.5 py-1 text-xs font-extrabold uppercase tracking-wider text-brand">
              {f.tag}
            </span>
            <h3 className="mt-2 text-sm font-bold leading-snug text-foreground">{f.title}</h3>
            <span className="mt-auto inline-flex items-center gap-1 pt-2 text-xs font-semibold text-brand">
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
    /* Bamboo-style: solid navy bar, gold active icon chip */
    <nav className="fixed inset-x-0 bottom-0 z-40 bg-brand-gradient pb-[env(safe-area-inset-bottom)] md:hidden">
      <ul className="grid grid-cols-5">
        {TABS.map((tab) => {
          const active = pathname === tab.to;
          const Icon = tab.icon;
          return (
            <li key={tab.to}>
              <Link
                to={tab.to}
                className={`flex flex-col items-center gap-1 py-2.5 text-xs font-semibold transition-colors ${
                  active ? "text-[oklch(0.87_0.15_94)]" : "text-primary-foreground/55"
                }`}
              >
                <span
                  className={`grid size-9 place-items-center rounded-full transition-colors ${
                    active ? "bg-gold-gradient text-gold-foreground" : ""
                  }`}
                >
                  <Icon className="size-4.5" strokeWidth={active ? 2.4 : 1.8} />
                </span>
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function HomeV6() {
  const isNewUser = useIsNewUser();
  const { hidden } = useBalanceVisibility();
  return (
    <div className="type-v6 min-h-screen bg-background">
      <DashboardSidebar
        activePath="/home-v6"
        walletBalance={WALLET_BALANCE}
        hideBalance={hidden}
      />
      <div className="md:pl-64">
        <DashboardTopBar title="Investing" />
        <main className="mx-auto w-full max-w-2xl space-y-5 px-4 pb-28 pt-5 md:max-w-[1400px] md:px-8 md:pb-16">
          {isNewUser ? (
            <NewUserEmptyState />
          ) : (
            <>
              <div className="grid gap-5 lg:grid-cols-5">
                <div className="min-w-0 space-y-5 lg:col-span-3">
                  <PortfolioHero />
                  <Holdings />
                  <EarningsAndMaturity />
                </div>
                <div className="min-w-0 space-y-5 lg:col-span-2">
                  <WalletCard />
                  <Recommendation />
                  <Activity />
                </div>
                <div className="min-w-0 lg:col-span-5">
                  <Movers />
                </div>
                <div className="min-w-0 space-y-3 lg:col-span-5">
                  <TierStatusCard />
                  <WalletNote />
                </div>
                <div className="min-w-0 lg:col-span-5">
                  <ContentFeed />
                </div>
              </div>
            </>
          )}
        </main>
      </div>
      <MobileTabBar />
    </div>
  );
}
