import { useState } from "react";
import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import {
  ArrowDownLeft,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowUpRight,
  Bell,
  ChevronRight,
  Compass,
  Eye,
  EyeOff,
  FileText,
  Home,
  Landmark,
  Lightbulb,
  Lock,
  PieChart,
  Plus,
  Settings,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import {
  DashboardSidebar,
  DashboardTopBar,
} from "@/components/kipit/DashboardSidebar";
import { NewUserEmptyState } from "@/components/kipit/NewUserEmptyState";
import { productArt } from "@/components/kipit/art";
import { FeedThumb } from "@/components/kipit/FeedThumb";
import { useBalanceVisibility, useIsNewUser } from "@/hooks/useBalanceVisibility";
import { TierStatusCard, WalletNote, useGreeting } from "@/components/kipit/SpecBlocks";

export const Route = createFileRoute("/home-v8")({
  head: () => ({
    meta: [
      { title: "Kipit Home — Your Money Dashboard" },
      {
        name: "description",
        content:
          "Kipit home dashboard: portfolio value, savings products, weekly earnings, maturities, wallet and activity in one place.",
      },
      { property: "og:title", content: "Kipit Home — Your Money Dashboard" },
      {
        property: "og:description",
        content: "Track your portfolio, plans, earnings and wallet on Kipit.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomeV8,
});

const naira = (n: number) => `₦${n.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
const MASK = "₦••••••";

/* --------------------------- single source of truth --------------------------- */

const PRODUCTS = [
  {
    name: "Kipit Vault",
    desc: "Flexible, withdraw anytime",
    value: 812400,
    rate: 14,
    icon: Wallet,
    tone: "brand",
    change: 4.2,
  },
  {
    name: "Kipit Lock",
    desc: "Lock funds, earn more",
    value: 460000,
    rate: 21.4,
    icon: Lock,
    tone: "violet",
    change: 1.1,
  },
  {
    name: "Target Savings",
    desc: "Save toward a goal",
    value: 312750,
    rate: 16,
    icon: Target,
    tone: "teal",
    change: -0.6,
  },
  {
    name: "Flex Wallet",
    desc: "Spend and top up freely",
    value: 245000,
    rate: 10,
    icon: PieChart,
    tone: "gold",
    change: 0.8,
  },
] as const;

const PORTFOLIO_VALUE = PRODUCTS.reduce((sum, p) => sum + p.value, 0);
const WALLET_BALANCE = 128500;
const TOTAL_EARNED = 318900;
const AVG_YIELD = PRODUCTS.reduce((s, p) => s + p.rate, 0) / PRODUCTS.length;

/** Each timeframe has its own series plus the gain over that window. */
const SERIES = {
  "1D": { data: [61, 61.4, 61.2, 62, 61.8, 62.6, 63, 62.8, 63.4, 64, 63.8, 64.6], gain: 4210, pct: 0.2 },
  "1W": { data: [56, 57, 56.4, 58, 59, 58.4, 60, 61, 60.6, 62, 63, 64.6], gain: 21480, pct: 1.2 },
  "1M": { data: [48, 50, 49, 52, 54, 53, 56, 57, 59, 61, 62, 64.6], gain: 96400, pct: 5.6 },
  "3M": { data: [38, 41, 40, 44, 46, 45, 50, 53, 55, 58, 61, 64.6], gain: 214300, pct: 13.3 },
  "1Y": { data: [22, 26, 25, 31, 34, 33, 40, 45, 49, 54, 59, 64.6], gain: 498600, pct: 37.4 },
  All: { data: [8, 12, 11, 18, 23, 21, 30, 37, 43, 50, 57, 64.6], gain: 731200, pct: 66.5 },
} as const;

type RangeKey = keyof typeof SERIES;
const RANGES = Object.keys(SERIES) as RangeKey[];

const WEEKLY = [
  { day: "Mon", value: 4200 },
  { day: "Tue", value: 5800 },
  { day: "Wed", value: 3600 },
  { day: "Thu", value: 7100 },
  { day: "Fri", value: 4900 },
  { day: "Sat", value: 6600 },
  { day: "Sun", value: 9950 },
];
const WEEKLY_TOTAL = WEEKLY.reduce((s, d) => s + d.value, 0);
const WEEKLY_MAX = Math.max(...WEEKLY.map((d) => d.value));

const ACTIVITY = [
  { label: "Kipit Vault payout", time: "Today · 09:12", amount: 42150, credit: true },
  { label: "Bought Kipit Lock 91-Day", time: "Yesterday", amount: 100000, credit: false },
  { label: "Wallet deposit", time: "Mon · 14:40", amount: 150000, credit: true },
] as const;

const FEED = [
  { tag: "Investing 101", title: "What are treasury bills and why everyone is buying them" },
  { tag: "Market watch", title: "Naira steadies — what it means for dollar funds" },
] as const;

const TONE: Record<string, string> = {
  brand: "bg-brand/10 text-brand",
  gold: "bg-accent/50 text-gold-foreground",
  violet: "bg-violet/10 text-violet",
  teal: "bg-teal/10 text-teal",
};

const TABS: { to: string; label: string; icon: LucideIcon }[] = [
  { to: "/home-v8", label: "Home", icon: Home },
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
    .map((v, i) => `${(i / (data.length - 1)) * 100},${36 - ((v - min) / (max - min || 1)) * 32}`)
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

/* --------------------------- mobile greeting --------------------------- */

function GreetingHeader() {
  return (
    <header className="flex items-center gap-3 md:hidden">
      <span className="grid size-10 place-items-center rounded-full bg-gold-gradient text-sm font-extrabold text-gold-foreground">
        AO
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">Good morning</p>
        <p className="truncate text-sm font-extrabold text-foreground">Adaeze Okafor</p>
      </div>
      <Link
        to="/notifications"
        aria-label="Notifications"
        className="relative grid size-10 place-items-center rounded-full border border-border bg-card text-foreground shadow-card"
      >
        <Bell className="size-5" />
        <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-gold" />
      </Link>
    </header>
  );
}

/* ------------------------------- hero ------------------------------- */

function PortfolioHero() {
  const { hidden, toggle } = useBalanceVisibility();
  const [range, setRange] = useState<RangeKey>("1M");
  const series = SERIES[range];
  const up = series.pct >= 0;
  const rangeLabel: Record<RangeKey, string> = {
    "1D": "today",
    "1W": "this week",
    "1M": "this month",
    "3M": "in 3 months",
    "1Y": "this year",
    All: "all time",
  };

  return (
    <section className="relative overflow-hidden rounded-3xl bg-brand-gradient p-5 text-brand-foreground shadow-float md:p-7">
      <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-gold/15 blur-2xl" />
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-foreground/70">
        Total portfolio value
      </p>
      <div className="mt-1 flex items-center gap-2">
        <h1 className="text-3xl font-extrabold tabular-nums md:text-4xl">
          {hidden ? MASK : naira(PORTFOLIO_VALUE)}
        </h1>
        <button
          type="button"
          onClick={toggle}
          aria-label={hidden ? "Show balance" : "Hide balance"}
          className="rounded-full bg-brand-foreground/10 p-1.5 transition hover:bg-brand-foreground/20"
        >
          {hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      <p
        className={`mt-1 inline-flex items-center gap-1 text-sm font-semibold ${
          up ? "text-gold" : "text-destructive"
        }`}
      >
        {up ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
        {up ? "+" : "−"}
        {hidden ? "••••" : naira(series.gain)} ({series.pct}%) {rangeLabel[range]}
      </p>

      <div className="mt-4">
        <Sparkline
          key={range}
          data={series.data}
          className={`h-20 w-full md:h-28 ${up ? "text-gold" : "text-destructive"}`}
        />
        <div className="mt-2 flex gap-1.5 overflow-x-auto no-scrollbar" role="tablist" aria-label="Chart timeframe">
          {RANGES.map((r) => {
            const active = r === range;
            return (
              <button
                key={r}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setRange(r)}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold transition ${
                  active
                    ? "bg-gold text-gold-foreground"
                    : "bg-brand-foreground/10 text-brand-foreground/80 hover:bg-brand-foreground/20"
                }`}
              >
                {r}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-4 gap-2 md:max-w-xl">
        {[
          { label: "Add money", icon: ArrowDownToLine, primary: true },
          { label: "Withdraw", icon: ArrowUpFromLine },
          { label: "New plan", icon: Plus },
          { label: "Statements", icon: FileText },
        ].map(({ label, icon: Icon, primary }) => (
          <button
            key={label}
            type="button"
            className={`flex flex-col items-center justify-center gap-1 rounded-xl px-1 py-2.5 text-xs font-bold transition ${
              primary
                ? "bg-gold text-gold-foreground hover:brightness-105"
                : "bg-brand-foreground/10 hover:bg-brand-foreground/20"
            }`}
          >
            <Icon className="size-4" />
            <span className="truncate">{label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------ stats ------------------------------ */

function StatsStrip() {
  const { hidden } = useBalanceVisibility();
  const stats = [
    { label: "Total earned", value: hidden ? MASK : naira(TOTAL_EARNED) },
    { label: "Active plans", value: String(PRODUCTS.length) },
    { label: "Avg. yield", value: `${AVG_YIELD.toFixed(1)}%` },
  ];
  return (
    <section className="grid grid-cols-3 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="rounded-2xl border border-border bg-card p-3 text-center shadow-card">
          <p className="text-xs font-semibold text-muted-foreground">{s.label}</p>
          <p className="mt-0.5 text-base font-extrabold tabular-nums text-foreground">{s.value}</p>
        </div>
      ))}
    </section>
  );
}

/* ------------------------------ plans ------------------------------ */

function Plans() {
  const { hidden } = useBalanceVisibility();
  return (
    <section>
      <SectionTitle action="All products">Your Kipit plans</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        {PRODUCTS.map((p) => {
          const Icon = p.icon;
          const up = p.change >= 0;
          return (
            <Link
              key={p.name}
              to="/invest"
              className="group overflow-hidden rounded-2xl border border-border bg-card shadow-card transition hover:shadow-float"
            >
              <div className="relative h-14 w-full bg-primary">
                <img
                  src={productArt(p.name)}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  width={1200}
                  height={400}
                  className="absolute inset-0 h-full w-full object-cover opacity-60"
                />
                <span
                  className={`absolute -bottom-5 left-4 grid size-10 place-items-center rounded-xl border border-card ${TONE[p.tone]}`}
                >
                  <Icon className="size-5" />
                </span>
              </div>
              <div className="p-4 pt-7">
                <p className="text-sm font-extrabold text-foreground">{p.name}</p>

                <p className="text-xs leading-snug text-muted-foreground">{p.desc}</p>
                <p className="mt-2 text-base font-extrabold tabular-nums text-foreground">
                  {hidden ? MASK : naira(p.value)}
                </p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs font-bold">
                  <span className="text-gold-foreground">{p.rate}% p.a.</span>
                  <span className={up ? "text-success" : "text-destructive"}>
                    {up ? "+" : ""}
                    {p.change}%
                  </span>
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------ earnings & maturity ------------------------ */

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
                className={`w-full rounded-t-md transition ${
                  i === WEEKLY.length - 1 ? "bg-gold" : "bg-brand/25 hover:bg-brand/40"
                }`}
                style={{ height: `${(d.value / WEEKLY_MAX) * 100}%` }}
              />
              <span className="text-center text-[11px] font-semibold text-muted-foreground">
                {d.day[0]}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-card">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-accent/50 text-gold-foreground">
            <Landmark className="size-4" />
          </span>
          <p className="text-xs font-semibold text-muted-foreground">Next maturity</p>
        </div>
        <p className="mt-2 text-sm font-bold text-foreground">Kipit Lock · 91-Day</p>
        <p className="text-xl font-extrabold tabular-nums text-foreground">
          {hidden ? MASK : naira(460000)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Matures <span className="font-semibold text-foreground">12 Sep 2026</span> · 11 days left
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-[78%] rounded-full bg-gold" />
        </div>
      </section>
    </div>
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
          <div className="min-w-0">
            <p className="text-xs font-semibold text-muted-foreground">Kipit Wallet</p>
            <p className="text-lg font-extrabold tabular-nums text-foreground">
              {hidden ? MASK : naira(WALLET_BALANCE)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            className="rounded-lg bg-brand px-3 py-2 text-xs font-bold text-brand-foreground transition hover:brightness-110"
          >
            Add money
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-bold text-foreground transition hover:bg-muted"
          >
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

/* ------------------------ recommendation & feed ------------------------ */

function Recommendation() {
  return (
    <section className="flex items-center gap-3 rounded-2xl border border-gold/30 bg-accent/20 p-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gold text-gold-foreground">
        <Lightbulb className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-foreground">Grow your idle wallet cash</p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Your wallet has sat idle for 6 days — Kipit Lock is yielding 21.4% p.a.
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
      <div className="grid gap-3 sm:grid-cols-2">
        {FEED.map((f, i) => (
          <article
            key={f.title}
            className="rounded-2xl border border-border bg-card p-4 shadow-card transition hover:shadow-float"
          >
            <FeedThumb index={i} />
            <span className="inline-block rounded-full bg-brand/10 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-brand">
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
    <nav className="fixed inset-x-3 bottom-3 z-40 rounded-2xl border border-border bg-surface/95 shadow-float backdrop-blur pb-[env(safe-area-inset-bottom)] md:hidden">
      <ul className="grid grid-cols-5">
        {TABS.map((tab) => {
          const active = pathname === tab.to;
          const Icon = tab.icon;
          return (
            <li key={tab.to}>
              <Link
                to={tab.to}
                className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-bold transition-colors ${
                  active ? "text-brand" : "text-muted-foreground"
                }`}
              >
                <span
                  className={`grid size-9 place-items-center rounded-xl transition-colors ${
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

function HomeV8() {
  const isNewUser = useIsNewUser();
  const { hidden } = useBalanceVisibility();
  return (
    <div className="type-v8 min-h-screen bg-background">
      <DashboardSidebar activePath="/home-v8" walletBalance={WALLET_BALANCE} hideBalance={hidden} />
      <div className="md:pl-64">
        <DashboardTopBar title="Home" />
        <main className="mx-auto w-full max-w-2xl space-y-5 px-4 pb-32 pt-5 md:max-w-6xl md:px-8 md:pb-16">
          <GreetingHeader />
          {isNewUser ? (
            <NewUserEmptyState />
          ) : (
            <>
              <PortfolioHero />
              <StatsStrip />
              <div className="grid gap-5 lg:grid-cols-5">
                <div className="min-w-0 space-y-5 lg:col-span-3">
                  <Plans />
                  <EarningsAndMaturity />
                  <ContentFeed />
                </div>
                <div className="min-w-0 space-y-5 lg:col-span-2">
                  <WalletCard />
                  <Recommendation />
                  <Activity />
                </div>
                <div className="min-w-0 space-y-3 lg:col-span-5">
                  <TierStatusCard />
                  <WalletNote />
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
