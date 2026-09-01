import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  Eye,
  EyeOff,
  Landmark,
  Lightbulb,
  PiggyBank,
  Plus,
  Receipt,
  Wallet,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/kipit/AppShell";
import { Logo } from "@/components/kipit/Logo";
import { NewUserEmptyState } from "@/components/kipit/NewUserEmptyState";
import { FeedThumb } from "@/components/kipit/FeedThumb";
import { useBalanceVisibility, useIsNewUser } from "@/hooks/useBalanceVisibility";

export const Route = createFileRoute("/home-v9")({
  head: () => ({
    meta: [
      { title: "Kipit Home 9 — Bento Wealth Dashboard" },
      {
        name: "description",
        content:
          "Kipit home concept 9: a refined light bento dashboard in navy and gold with portfolio performance, wallet, weekly earnings, plans and maturity countdown.",
      },
      { property: "og:title", content: "Kipit Home 9 — Bento Wealth Dashboard" },
      {
        property: "og:description",
        content:
          "A refined bento take on the Kipit dashboard: portfolio chart, wallet, weekly earnings and plan maturity in one view.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomeV9Screen,
});

const naira = (value: number) =>
  `₦${value.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;

const WALLET_BALANCE = 500_000;
const INVESTED_TOTAL = 2_450_000;
const TOTAL_BALANCE = WALLET_BALANCE + INVESTED_TOTAL;

const QUICK_ACTIONS = [
  { label: "Add money", icon: ArrowDownLeft, to: "/portfolio" },
  { label: "Withdraw", icon: ArrowUpRight, to: "/portfolio" },
  { label: "New plan", icon: Plus, to: "/invest" },
  { label: "Statements", icon: Receipt, to: "/settings" },
] as const;

type Range = "1W" | "1M" | "6M" | "1Y" | "All";

const SERIES: Record<Range, { points: number[]; gain: number; pct: number; label: string }> = {
  "1W": { points: [62, 60, 64, 61, 66, 69, 72], gain: 9_120, pct: 0.31, label: "this week" },
  "1M": {
    points: [40, 44, 42, 50, 48, 56, 54, 62, 60, 68, 72, 78],
    gain: 38_200,
    pct: 1.58,
    label: "this month",
  },
  "6M": {
    points: [22, 28, 26, 34, 40, 38, 48, 52, 58, 64, 70, 80],
    gain: 186_400,
    pct: 7.8,
    label: "in 6 months",
  },
  "1Y": {
    points: [12, 18, 24, 22, 32, 38, 44, 52, 58, 66, 74, 86],
    gain: 402_900,
    pct: 17.9,
    label: "this year",
  },
  All: {
    points: [6, 10, 16, 20, 30, 36, 46, 55, 62, 71, 80, 92],
    gain: 612_300,
    pct: 26.4,
    label: "all time",
  },
};

const WEEK = [
  { day: "Mon", amount: 1_240 },
  { day: "Tue", amount: 1_580 },
  { day: "Wed", amount: 1_410 },
  { day: "Thu", amount: 1_920 },
  { day: "Fri", amount: 1_760 },
  { day: "Sat", amount: 2_310 },
  { day: "Sun", amount: 2_260 },
];
const WEEK_TOTAL = WEEK.reduce((sum, d) => sum + d.amount, 0);
const WEEK_MAX = Math.max(...WEEK.map((d) => d.amount));

const PLANS = [
  {
    name: "Kipit Fixed Income",
    icon: Landmark,
    amount: 750_000,
    yield: "18.5% p.a.",
    progress: 74,
    matures: "24 Sep 2026",
  },
  {
    name: "Kipit Lock",
    icon: Zap,
    amount: 1_100_000,
    yield: "21.0% p.a.",
    progress: 46,
    matures: "12 Mar 2027",
  },
  {
    name: "Goal — Rent",
    icon: PiggyBank,
    amount: 600_000,
    yield: "15.2% p.a.",
    progress: 18,
    matures: "30 Aug 2027",
  },
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

function toPath(points: number[]) {
  const step = 360 / (points.length - 1);
  return points.map((p, i) => `${(i * step).toFixed(1)},${(100 - p).toFixed(1)}`).join(" ");
}

function CountdownRing({ daysLeft, total }: { daysLeft: number; total: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const progress = 1 - daysLeft / total;
  return (
    <svg viewBox="0 0 84 84" className="size-24 -rotate-90" aria-hidden>
      <circle cx="42" cy="42" r={r} fill="none" strokeWidth="8" className="stroke-secondary" />
      <circle
        cx="42"
        cy="42"
        r={r}
        fill="none"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - progress)}
        className="stroke-gold"
      />
    </svg>
  );
}

function HomeV9Screen() {
  const { hidden, toggle, mask } = useBalanceVisibility();
  const isNewUser = useIsNewUser();
  const [range, setRange] = useState<Range>("1M");
  const series = SERIES[range];
  const spark = toPath(series.points);

  return (
    <div className="theme-v2 type-v9">
      <AppShell navVariant="floating" title="Home">
        {/* Mobile header */}
        <header className="-mx-4 mb-6 border-b border-border bg-surface px-5 pb-6 pt-5 md:hidden">
          <div className="flex items-center justify-between">
            <Logo tone="brand" className="font-display text-2xl" />
            <div className="flex items-center gap-3">
              <Link
                to="/notifications"
                aria-label="Notifications"
                className="relative grid size-10 place-items-center rounded-full border border-border bg-secondary text-foreground"
              >
                <Bell className="size-5" />
                <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-gold" />
              </Link>
              <Link
                to="/settings"
                aria-label="Your profile"
                className="grid size-10 place-items-center rounded-full bg-gold-gradient text-sm font-bold text-gold-foreground"
              >
                AO
              </Link>
            </div>
          </div>
        </header>

        {isNewUser ? (
          <NewUserEmptyState />
        ) : (
          <>
            {/* Bento row 1 — portfolio hero + wallet */}
            <section className="grid gap-4 lg:grid-cols-5">
              <article className="relative overflow-hidden rounded-3xl border border-border bg-brand-gradient p-6 text-primary-foreground shadow-card md:p-8 lg:col-span-3">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-white/10 blur-3xl"
                />
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground/70">
                      Total balance
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
                        {mask(TOTAL_BALANCE)}
                      </h1>
                      <button
                        type="button"
                        onClick={toggle}
                        aria-label={hidden ? "Show balances" : "Hide balances"}
                        className="grid size-9 place-items-center rounded-full border border-white/25 bg-white/10 text-primary-foreground/80 transition-colors hover:bg-white/20 hover:text-primary-foreground"
                      >
                        {hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-primary-foreground/70">
                      {mask(INVESTED_TOTAL)} invested · {mask(WALLET_BALANCE)} in wallet
                    </p>
                    <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-bold text-[oklch(0.87_0.15_94)]">
                      <ArrowUpRight className="size-3.5" /> +{naira(series.gain)} · +
                      {series.pct}% {series.label}
                    </p>
                  </div>
                  <div className="hidden gap-1 rounded-full border border-white/20 bg-white/10 p-1 md:flex">
                    {(Object.keys(SERIES) as Range[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRange(r)}
                        aria-pressed={range === r}
                        className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                          range === r
                            ? "bg-gold-gradient text-gold-foreground"
                            : "text-primary-foreground/70 hover:text-primary-foreground"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <svg
                  viewBox="0 0 360 100"
                  className="mt-6 h-28 w-full"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  <defs>
                    <linearGradient id="v9SparkFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.84 0.155 88 / 0.35)" />
                      <stop offset="100%" stopColor="oklch(0.84 0.155 88 / 0)" />
                    </linearGradient>
                  </defs>
                  <polygon points={`${spark} 360,100 0,100`} fill="url(#v9SparkFill)" />
                  <polyline
                    points={spark}
                    fill="none"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    stroke="oklch(0.86 0.15 92)"
                  />
                </svg>

                <div className="mt-4 flex gap-1 overflow-x-auto no-scrollbar md:hidden">
                  {(Object.keys(SERIES) as Range[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRange(r)}
                      aria-pressed={range === r}
                      className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
                        range === r
                          ? "bg-gold-gradient text-gold-foreground"
                          : "border border-white/20 bg-white/10 text-primary-foreground/80"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </article>

              <div className="grid gap-4 lg:col-span-2">
                <article className="flex flex-col justify-between rounded-3xl border border-border bg-surface p-6 shadow-card">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="grid size-11 place-items-center rounded-2xl bg-gold/15 text-gold">
                        <Wallet className="size-5" />
                      </span>
                      <span className="rounded-full border border-border px-3 py-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Wallet
                      </span>
                    </div>
                    <p className="mt-5 font-display text-3xl font-bold tracking-tight">
                      {mask(WALLET_BALANCE)}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      Available to invest or withdraw. Wallet funds do not earn returns.
                    </p>
                  </div>
                  <Link
                    to="/portfolio"
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-bold text-gold-foreground shadow-float transition-transform active:scale-95"
                  >
                    <Plus className="size-4" /> Fund wallet
                  </Link>
                </article>

                <article className="flex items-center gap-5 rounded-3xl border border-border bg-surface p-6 shadow-card">
                  <div className="relative grid shrink-0 place-items-center">
                    <CountdownRing daysLeft={23} total={90} />
                    <div className="absolute text-center">
                      <p className="font-display text-xl font-bold leading-none">23</p>
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        days
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Next maturity
                    </p>
                    <p className="mt-1.5 text-sm font-bold">Kipit Fixed Income · 90 days</p>
                    <p className="mt-1 font-display text-2xl font-bold tracking-tight">
                      {mask(750_000)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">Matures 24 Sep 2026</p>
                  </div>
                </article>
              </div>
            </section>

            {/* Quick actions */}
            <section className="mt-4 grid grid-cols-4 gap-2 md:gap-3">
              {QUICK_ACTIONS.map(({ label, icon: Icon, to }) => (
                <Link
                  key={label}
                  to={to}
                  className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface p-3.5 text-center shadow-card transition-all hover:border-gold/50 active:scale-95 md:flex-row md:justify-center md:gap-2.5"
                >
                  <Icon className="size-5 text-gold transition-transform group-hover:-translate-y-0.5" />
                  <span className="text-xs font-semibold leading-tight md:text-sm">{label}</span>
                </Link>
              ))}
            </section>

            {/* Bento row 2 — plans + earnings + nudge */}
            <section className="mt-4 grid gap-4 lg:grid-cols-5">
              <article className="rounded-3xl border border-border bg-surface p-6 shadow-card lg:col-span-3">
                <div className="flex items-end justify-between">
                  <div>
                    <h2 className="font-display text-lg font-bold tracking-tight">Your plans</h2>
                    <p className="text-xs text-muted-foreground">
                      {mask(INVESTED_TOTAL)} across {PLANS.length} active plans
                    </p>
                  </div>
                  <Link to="/portfolio" className="text-xs font-bold text-gold">
                    View all
                  </Link>
                </div>
                <ul className="mt-5 space-y-3">
                  {PLANS.map((plan) => {
                    const Icon = plan.icon;
                    return (
                      <li
                        key={plan.name}
                        className="rounded-2xl border border-border p-4 transition-colors hover:border-gold/40"
                      >
                        <div className="flex items-center gap-3">
                          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-gradient text-primary-foreground">
                            <Icon className="size-5" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold">{plan.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {plan.yield} · matures {plan.matures}
                            </p>
                          </div>
                          <p className="font-display text-base font-bold">{mask(plan.amount)}</p>
                        </div>
                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
                          <span
                            className="block h-full rounded-full bg-gold-gradient"
                            style={{ width: `${plan.progress}%` }}
                          />
                        </div>
                        <p className="mt-1.5 text-xs font-semibold text-muted-foreground">
                          {plan.progress}% of tenor complete
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </article>

              <div className="grid gap-4 lg:col-span-2">
                <article className="rounded-3xl border border-border bg-surface p-6 shadow-card">
                  <div className="flex items-baseline justify-between">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Weekly earnings
                    </p>
                    <span className="text-xs font-bold text-success">+8.2%</span>
                  </div>
                  <p className="mt-3 font-display text-3xl font-bold tracking-tight text-gold">
                    {mask(WEEK_TOTAL)}
                  </p>
                  <div className="mt-5 flex h-20 items-end gap-1.5">
                    {WEEK.map((d, i) => (
                      <span
                        key={d.day}
                        title={`${d.day}: ${naira(d.amount)}`}
                        style={{ height: `${(d.amount / WEEK_MAX) * 100}%` }}
                        className={`flex-1 rounded-full ${
                          i === WEEK.length - 2 ? "bg-gold-gradient" : "bg-secondary"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="mt-2 flex gap-1.5 text-xs font-semibold text-muted-foreground">
                    {WEEK.map((d) => (
                      <span key={d.day} className="flex-1 text-center">
                        {d.day.slice(0, 1)}
                      </span>
                    ))}
                  </div>
                </article>

                <article className="flex flex-col justify-between rounded-3xl border border-gold/30 bg-accent/40 p-6 shadow-card">
                  <div className="flex gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gold-gradient text-gold-foreground">
                      <Lightbulb className="size-5" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        {mask(WALLET_BALANCE)} is sitting idle in your wallet.
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        Plans from 18.5% p.a. · 30–365 day tenors · ₦50,000 minimum.
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/invest"
                    className="mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-gold px-5 py-3 text-sm font-bold text-gold transition-colors hover:bg-gold hover:text-gold-foreground"
                  >
                    Explore investments <ArrowUpRight className="size-4" />
                  </Link>
                </article>
              </div>
            </section>

            {/* For you */}
            <section className="mt-8">
              <div className="flex items-end justify-between">
                <h2 className="font-display text-xl font-bold tracking-tight">For you</h2>
                <Link to="/explore" className="text-xs font-bold text-gold">
                  View all
                </Link>
              </div>
              <div className="-mx-4 mt-4 flex gap-3 overflow-x-auto px-4 pb-2 no-scrollbar md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
                {FEED.map((item, i) => (
                  <article
                    key={item.title}
                    className={`w-72 shrink-0 rounded-3xl border border-border p-5 shadow-card transition-colors hover:border-gold/40 md:w-auto ${
                      i === 0 ? "bg-brand-gradient text-primary-foreground" : "bg-surface"
                    }`}
                  >
                    <FeedThumb index={i} />
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-widest ${
                        i === 0
                          ? "border border-white/25 bg-white/10 text-[oklch(0.87_0.15_94)]"
                          : "border border-gold/40 bg-gold/10 text-gold"
                      }`}
                    >
                      {item.tag}
                    </span>
                    <h3 className="mt-3 font-display text-base font-bold leading-snug">
                      {item.title}
                    </h3>
                    <p
                      className={`mt-1.5 text-xs leading-relaxed ${
                        i === 0 ? "text-primary-foreground/75" : "text-muted-foreground"
                      }`}
                    >
                      {item.body}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
      </AppShell>
    </div>
  );
}
