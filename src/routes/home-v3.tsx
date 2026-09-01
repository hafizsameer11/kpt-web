import { useState } from "react";
import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  ChevronRight,
  Compass,
  Eye,
  EyeOff,
  Home,
  Landmark,
  Lightbulb,
  PieChart,
  PiggyBank,
  Plus,
  Receipt,
  Settings,
  TrendingUp,
  Wallet,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { DashboardSidebar } from "@/components/kipit/DashboardSidebar";
import { Logo } from "@/components/kipit/Logo";
import { NewUserEmptyState } from "@/components/kipit/NewUserEmptyState";
import { FeedThumb } from "@/components/kipit/FeedThumb";
import { useBalanceVisibility, useIsNewUser } from "@/hooks/useBalanceVisibility";
import { TierStatusCard, WalletNote, useGreeting } from "@/components/kipit/SpecBlocks";

export const Route = createFileRoute("/home-v3")({
  head: () => ({
    meta: [
      { title: "Kipit Home (Design 3) — Immersive Hero + Dock Nav" },
      {
        name: "description",
        content:
          "A third Kipit home concept: immersive navy hero, plan progress cards, activity timeline and a floating dock navigation with a gold center action.",
      },
      { property: "og:title", content: "Kipit Home (Design 3) — Immersive Hero + Dock Nav" },
      {
        property: "og:description",
        content: "A fresh take on the Kipit home screen in Kipit navy and gold.",
      },
    ],
  }),
  component: HomeV3Screen,
});

const naira = (value: number) =>
  `₦${value.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;

const WALLET_BALANCE = 500000;

const QUICK_ACTIONS: { label: string; icon: LucideIcon; to: string }[] = [
  { label: "Add", icon: ArrowDownLeft, to: "/invest" },
  { label: "Withdraw", icon: ArrowUpRight, to: "/portfolio" },
  { label: "New Plan", icon: Plus, to: "/invest" },
  { label: "Statements", icon: Receipt, to: "/portfolio" },
];

const PLANS = [
  {
    name: "Kipit Fixed Income",
    tenor: "90 days",
    amount: 750000,
    yield: "18.5% p.a.",
    progress: 0.74,
    started: "26 Jun 2026",
    matures: "24 Sep 2026",
    icon: Landmark,
  },
  {
    name: "Kipit Flex Yield",
    tenor: "180 days",
    amount: 1200000,
    yield: "19.2% p.a.",
    progress: 0.38,
    started: "25 Jun 2026",
    matures: "22 Dec 2026",
    icon: Zap,
  },
  {
    name: "Kipit Goal — Rent",
    tenor: "365 days",
    amount: 500000,
    yield: "17.8% p.a.",
    progress: 0.16,
    started: "05 Jul 2026",
    matures: "05 Jul 2027",
    icon: PiggyBank,
  },
];

const INVESTED_TOTAL = PLANS.reduce((sum, p) => sum + p.amount, 0);
const TOTAL_BALANCE = INVESTED_TOTAL + WALLET_BALANCE;

const TIMEFRAMES = [
  { id: "1D", gain: 4820, pct: 0.16, label: "today" },
  { id: "1W", gain: 12480, pct: 0.43, label: "this week" },
  { id: "1M", gain: 38200, pct: 1.31, label: "this month" },
  { id: "6M", gain: 214600, pct: 7.85, label: "past 6 months" },
  { id: "1Y", gain: 386400, pct: 15.1, label: "past year" },
  { id: "All", gain: 452900, pct: 18.2, label: "all time" },
];

const WEEKLY = [
  { day: "Mon", value: 1240 },
  { day: "Tue", value: 1680 },
  { day: "Wed", value: 1420 },
  { day: "Thu", value: 2100 },
  { day: "Fri", value: 1860 },
  { day: "Sat", value: 2380 },
  { day: "Sun", value: 1800 },
];
const WEEKLY_TOTAL = WEEKLY.reduce((sum, d) => sum + d.value, 0);
const WEEKLY_MAX = Math.max(...WEEKLY.map((d) => d.value));
const WEEKLY_BEST = WEEKLY.reduce((a, b) => (b.value > a.value ? b : a));

const ACTIVITY: { icon: LucideIcon; title: string; detail: string; amount: string; positive: boolean }[] = [
  { icon: TrendingUp, title: "Interest payout", detail: "Kipit Fixed Income · Today, 09:12", amount: "+₦12,480", positive: true },
  { icon: ArrowDownLeft, title: "Wallet funded", detail: "Bank transfer · Yesterday", amount: "+₦200,000", positive: true },
  { icon: Plus, title: "New plan created", detail: "Kipit Goal — Rent · 28 Aug", amount: "-₦500,000", positive: false },
  { icon: ArrowUpRight, title: "Withdrawal", detail: "To GTBank •• 4521 · 24 Aug", amount: "-₦50,000", positive: false },
];

const FEED = [
  {
    tag: "Product update",
    title: "Kipit Fixed Income now settles same-day",
    body: "Maturity payouts land in your wallet within minutes of maturity.",
  },
  {
    tag: "Education",
    title: "Understanding tenor and effective yield",
    body: "A 3-minute read on how rate and tenor shape your real return.",
  },
  {
    tag: "Announcement",
    title: "Tier 2 verification is now instant",
    body: "Upgrade with your BVN and NIN to raise your transaction limits.",
  },
];

const NAV: { label: string; to: string; icon: LucideIcon }[] = [
  { label: "Home", to: "/home-v3", icon: Home },
  { label: "Explore", to: "/explore", icon: Compass },
  { label: "Portfolio", to: "/portfolio", icon: PieChart },
  { label: "Settings", to: "/settings", icon: Settings },
];

function HomeV3Screen() {
  const { hidden, toggle, mask } = useBalanceVisibility();
  const greeting = useGreeting();
  const isNewUser = useIsNewUser();
  const [range, setRange] = useState("1M");
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const tf = TIMEFRAMES.find((t) => t.id === range) ?? TIMEFRAMES[2]!;

  return (
    <div className="type-v3 min-h-screen bg-background">
      {/* ============ Desktop sidebar ============ */}
      <DashboardSidebar hideBalance={hidden} walletBalance={WALLET_BALANCE} />

      {/* ============ Main column ============ */}
      <main className="pb-32 md:pl-64 md:pb-16">

        {/* Immersive navy hero (mobile full-bleed, desktop rounded panel) */}
        <header className="relative overflow-hidden bg-brand-gradient px-5 pb-16 pt-6 text-primary-foreground md:mx-8 md:mt-8 md:rounded-[2rem] md:px-10 md:pb-20 md:pt-10">
          <div aria-hidden className="pointer-events-none absolute -right-20 -top-28 size-80 rounded-full bg-white/8 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-16 size-72 rounded-full bg-gold/15 blur-3xl" />

          <div className="relative flex items-center justify-between md:hidden">
            <div className="min-w-0">
              <Logo tone="light" className="text-2xl" />
              <p className="mt-1 text-xs font-semibold text-primary-foreground/70">{greeting}, Adaeze</p>
            </div>
            <Link
              to="/notifications"
              aria-label="Notifications"
              className="relative grid size-10 place-items-center rounded-full bg-white/10 text-primary-foreground"
            >
              <Bell className="size-5" />
              <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-gold" />
            </Link>
          </div>

          <div className="relative mt-8 flex items-end justify-between gap-4 md:mt-2">
            <div>
              <p className="hidden text-sm font-semibold text-primary-foreground/80 md:block">
                {greeting}, Adaeze
              </p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary-foreground/65 md:mt-3">
                Total balance
              </p>
              <div className="mt-2 flex items-center gap-3">
                <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl">
                  {mask(TOTAL_BALANCE)}
                </h1>
                <button
                  type="button"
                  onClick={toggle}
                  aria-label={hidden ? "Show balance" : "Hide balance"}
                  className="grid size-9 place-items-center rounded-full bg-white/10 text-primary-foreground/80 transition-colors hover:bg-white/20"
                >
                  {hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <p className="mt-2 text-xs font-medium text-primary-foreground/70">
                Invested {mask(INVESTED_TOTAL)} · Wallet {mask(WALLET_BALANCE)}
              </p>
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-[oklch(0.87_0.15_94)]">
                <TrendingUp className="size-3.5" />
                {hidden ? "• • •" : `+${naira(tf.gain)}`} · +{tf.pct}% {tf.label}
              </p>
            </div>
            <Link
              to="/notifications"
              aria-label="Notifications"
              className="relative hidden size-11 place-items-center rounded-full bg-white/10 text-primary-foreground md:grid"
            >
              <Bell className="size-5" />
              <span className="absolute right-3 top-3 size-2 rounded-full bg-gold" />
            </Link>
          </div>

          {/* Timeframe controls */}
          <div className="relative mt-6 flex gap-1.5 overflow-x-auto no-scrollbar">
            {TIMEFRAMES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setRange(t.id)}
                aria-pressed={t.id === range}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
                  t.id === range
                    ? "bg-gold text-gold-foreground"
                    : "bg-white/10 text-primary-foreground/75 hover:bg-white/20"
                }`}
              >
                {t.id}
              </button>
            ))}
          </div>
        </header>

        {isNewUser ? (
          <div className="relative z-10 -mt-9 px-5 md:mx-8 md:px-10">
            <NewUserEmptyState />
          </div>
        ) : (
        <>
        {/* Quick actions — overlapping the hero edge */}
        <section className="relative z-10 -mt-9 px-5 md:mx-8 md:px-10">
          <div className="grid grid-cols-4 gap-3 rounded-3xl border border-border bg-surface p-4 shadow-float">
            {QUICK_ACTIONS.map(({ label, icon: Icon, to }) => (
              <Link
                key={label}
                to={to}
                className="group flex flex-col items-center gap-2 transition-transform active:scale-95"
              >
                <span className="grid size-12 place-items-center rounded-2xl bg-brand text-brand-foreground transition-colors group-hover:bg-gold group-hover:text-gold-foreground">
                  <Icon className="size-5" />
                </span>
                <span className="text-xs font-bold text-foreground">{label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Stats strip */}
        <section className="mt-8 px-5 md:mx-8 md:px-10">
          <div className="grid grid-cols-3 divide-x divide-border rounded-3xl border border-border bg-surface py-5 shadow-card">
            {[
              { label: "Total earned", value: mask(96400) },
              { label: "Active plans", value: "3" },
              { label: "Avg. yield", value: "18.9%" },
            ].map((s) => (
              <div key={s.label} className="px-4 text-center">
                <p className="text-lg font-extrabold tracking-tight text-brand md:text-2xl">{s.value}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Wallet · weekly earnings · next maturity */}
        <section className="mt-8 grid gap-4 px-5 md:mx-8 md:grid-cols-3 md:px-10">
          <article className="rounded-3xl border border-border bg-surface p-5 shadow-card">
            <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
              <Wallet className="size-4" /> Wallet balance
            </div>
            <p className="mt-2 text-2xl font-extrabold tracking-tight">{mask(WALLET_BALANCE)}</p>
            <p className="mt-1 text-xs text-muted-foreground">Available to invest or withdraw</p>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Funds in your wallet are available for investment or withdrawal. Wallet funds do
              not earn investment returns.
            </p>
          </article>

          <article className="rounded-3xl border border-border bg-surface p-5 shadow-card">
            <p className="text-sm font-bold text-muted-foreground">Weekly earnings</p>
            <p className="mt-2 text-2xl font-extrabold tracking-tight text-success">{mask(WEEKLY_TOTAL)}</p>
            <p className="mt-1 text-xs text-muted-foreground">Interest earned this week</p>
            <div className="mt-4 flex items-end gap-1.5">
              {WEEKLY.map((d) => (
                <div key={d.day} className="flex flex-1 flex-col items-center gap-1.5">
                  <span
                    title={`${d.day}: ${naira(d.value)}`}
                    style={{ height: `${Math.round((d.value / WEEKLY_MAX) * 56)}px` }}
                    className="w-full rounded-t-md bg-gold-gradient"
                  />
                  <span className="text-xs font-semibold text-muted-foreground">{d.day[0]}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Best day: {WEEKLY_BEST.day} · {mask(WEEKLY_BEST.value)}
            </p>
          </article>

          <article className="rounded-3xl border border-border bg-surface p-5 shadow-card">
            <p className="text-sm font-bold text-muted-foreground">Next maturity</p>
            <p className="mt-2 text-base font-bold">Kipit Fixed Income · 90 days</p>
            <p className="mt-1 text-2xl font-extrabold tracking-tight">{mask(750000)}</p>
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>Matures 24 Sep 2026</span>
              <span className="rounded-full bg-accent px-2.5 py-1 font-bold text-accent-foreground">
                23 days left
              </span>
            </div>
          </article>
        </section>

        {/* Investment recommendation */}
        <section className="mt-6 px-5 md:mx-8 md:px-10">
          <div className="rounded-3xl border border-gold/40 bg-accent p-5 md:flex md:items-center md:justify-between md:gap-6">
            <div className="flex gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-gold-gradient text-gold-foreground">
                <Lightbulb className="size-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-accent-foreground">
                  Your ₦500,000 wallet balance isn&apos;t currently invested.
                </p>
                <p className="mt-1 text-xs text-accent-foreground/80">
                  Plans from 18.5% p.a. · 30–365 day tenors · ₦50,000 minimum.
                </p>
              </div>
            </div>
            <Link
              to="/explore"
              className="mt-4 inline-flex w-full items-center justify-center gap-1 rounded-full bg-brand px-5 py-3 text-sm font-bold text-brand-foreground md:mt-0 md:w-auto"
            >
              Explore Investments <ChevronRight className="size-4" />
            </Link>
          </div>
        </section>

        {/* My plans — horizontal scroll cards */}
        <section className="mt-10">
          <div className="flex items-end justify-between px-5 md:mx-8 md:px-10">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">My plans</h2>
              <p className="mt-0.5 text-xs text-muted-foreground md:hidden">Swipe to see all {PLANS.length} plans →</p>
            </div>
            <Link to="/invest" className="text-xs font-bold text-gold">
              New plan →
            </Link>
          </div>
          <div className="mt-4 flex gap-4 overflow-x-auto px-5 pb-2 no-scrollbar md:mx-8 md:grid md:grid-cols-3 md:overflow-visible md:px-10">
            {PLANS.map((plan) => {
              const PlanIcon = plan.icon;
              return (
              <article
                key={plan.name}
                className="w-72 shrink-0 rounded-3xl border border-border bg-surface p-5 shadow-card transition-colors hover:border-gold/50 md:w-auto"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-accent text-brand">
                      <PlanIcon className="size-5" />
                    </span>
                    <div>
                      <h3 className="font-bold leading-snug">{plan.name}</h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">{plan.tenor} · matures {plan.matures}</p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-accent-foreground">
                    {plan.yield}
                  </span>
                </div>
                <p className="mt-4 text-2xl font-extrabold tracking-tight">{mask(plan.amount)}</p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-gold-gradient"
                    style={{ width: `${Math.round(plan.progress * 100)}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs font-semibold text-muted-foreground">
                  <span>Started {plan.started}</span>
                  <span>{Math.round(plan.progress * 100)}% to maturity</span>
                </div>
              </article>
              );
            })}
          </div>
        </section>

        {/* Activity timeline */}
        <section className="mt-10 px-5 md:mx-8 md:px-10">
          <div className="flex items-end justify-between">
            <h2 className="text-xl font-extrabold tracking-tight">Recent activity</h2>
            <Link to="/portfolio" className="text-xs font-bold text-gold">
              View all
            </Link>
          </div>
          <ul className="mt-4 space-y-2">
            {ACTIVITY.map((item) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.title + item.detail}
                  className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 shadow-card"
                >
                  <span
                    className={`grid size-11 shrink-0 place-items-center rounded-2xl ${
                      item.positive ? "bg-accent text-gold" : "bg-secondary text-brand"
                    }`}
                  >
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{item.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{item.detail}</p>
                  </div>
                  <p className={`shrink-0 text-sm font-extrabold ${item.positive ? "text-success" : "text-foreground"}`}>
                    {hidden ? "• • •" : item.amount}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Content feed */}
        <section className="mt-10 px-5 md:mx-8 md:px-10">
          <h2 className="text-xl font-extrabold tracking-tight">For you</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {FEED.map((item, i) => (
              <article key={item.title} className="rounded-3xl border border-border bg-surface p-5 shadow-card">
              <FeedThumb index={i} />
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {item.tag}
                </span>
                <h3 className="mt-2 text-sm font-bold leading-snug">{item.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{item.body}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="mt-10 space-y-3 px-5 md:mx-8 md:px-10">
          <TierStatusCard />
          <WalletNote />
        </section>
        </>
        )}
      </main>

      {/* ============ Mobile floating dock nav with gold center FAB ============ */}
      <nav className="fixed inset-x-4 bottom-4 z-40 md:hidden">
        <div className="relative flex items-end justify-between rounded-3xl border border-border bg-surface/95 px-4 py-2.5 shadow-float backdrop-blur">
          {NAV.slice(0, 2).map((item) => {
            const Icon = item.icon;
            const active = pathname === item.to;
            return (
              <Link
                key={item.label}
                to={item.to}
                className={`flex w-16 flex-col items-center gap-1 rounded-2xl py-1.5 transition-colors ${
                  active ? "text-gold" : "text-muted-foreground"
                }`}
              >
                <Icon className="size-5" strokeWidth={active ? 2.4 : 1.8} />
                <span className="text-xs font-bold">{item.label}</span>
              </Link>
            );
          })}
          <span className="w-14" aria-hidden />
          {NAV.slice(2).map((item) => {
            const Icon = item.icon;
            const active = pathname === item.to;
            return (
              <Link
                key={item.label}
                to={item.to}
                className={`flex w-16 flex-col items-center gap-1 rounded-2xl py-1.5 transition-colors ${
                  active ? "text-gold" : "text-muted-foreground"
                }`}
              >
                <Icon className="size-5" strokeWidth={active ? 2.4 : 1.8} />
                <span className="text-xs font-bold">{item.label}</span>
              </Link>
            );
          })}
          <Link
            to="/invest"
            aria-label="Invest"
            className="absolute left-1/2 top-0 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-gold-gradient text-gold-foreground shadow-float ring-4 ring-background transition-transform active:scale-95"
          >
            <Plus className="size-6" strokeWidth={2.5} />
          </Link>
        </div>
      </nav>

    </div>
  );
}
