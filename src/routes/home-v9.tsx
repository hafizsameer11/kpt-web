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
  ShieldCheck,
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
      { title: "Kipit Home 9 — Asymmetric Bento Wealth Desk" },
      {
        name: "description",
        content:
          "Kipit home concept 9: an asymmetric bento wealth desk in navy and gold — allocation ring, live performance band, maturity ladder and a compounding streak tile.",
      },
      { property: "og:title", content: "Kipit Home 9 — Asymmetric Bento Wealth Desk" },
      {
        property: "og:description",
        content:
          "Allocation ring, performance band, maturity ladder and streak tile in one Kipit dashboard.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomeV9Screen,
});

const naira = (value: number) =>
  `₦${value.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
const short = (value: number) =>
  value >= 1_000_000
    ? `₦${(value / 1_000_000).toFixed(2)}m`
    : `₦${Math.round(value / 1000)}k`;

const WALLET_BALANCE = 500_000;
const PLANS = [
  {
    name: "Kipit Fixed Income",
    icon: Landmark,
    amount: 750_000,
    yield: 18.5,
    progress: 74,
    matures: "24 Sep 2026",
    daysLeft: 23,
    tenor: 90,
  },
  {
    name: "Kipit Lock",
    icon: Zap,
    amount: 1_100_000,
    yield: 21,
    progress: 46,
    matures: "12 Mar 2027",
    daysLeft: 192,
    tenor: 365,
  },
  {
    name: "Goal — Rent",
    icon: PiggyBank,
    amount: 600_000,
    yield: 15.2,
    progress: 18,
    matures: "30 Aug 2027",
    daysLeft: 363,
    tenor: 440,
  },
];
const INVESTED_TOTAL = PLANS.reduce((s, p) => s + p.amount, 0);
const TOTAL_BALANCE = INVESTED_TOTAL + WALLET_BALANCE;
const BLENDED_YIELD =
  PLANS.reduce((s, p) => s + p.amount * p.yield, 0) / INVESTED_TOTAL;
const NEXT = PLANS[0];

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
    label: "past 6 months",
  },
  "1Y": {
    points: [12, 18, 24, 22, 32, 38, 44, 52, 58, 66, 74, 86],
    gain: 402_900,
    pct: 17.9,
    label: "past year",
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
const WEEK_TOTAL = WEEK.reduce((s, d) => s + d.amount, 0);
const WEEK_MAX = Math.max(...WEEK.map((d) => d.amount));

const FEED = [
  {
    tag: "Product update",
    title: "Fixed Income now settles same-day",
    body: "Maturity payouts land in your wallet within minutes.",
    to: "/explore",
  },
  {
    tag: "Education",
    title: "Tenor vs. effective yield, explained",
    body: "How rate and tenor shape the return you actually keep.",
    to: "/explore",
  },
  {
    tag: "Announcement",
    title: "Tier 2 verification is instant",
    body: "Add BVN and NIN to raise your transaction limits.",
    to: "/settings",
  },
];

function sparkPath(points: number[]) {
  const step = 360 / (points.length - 1);
  return points.map((p, i) => `${(i * step).toFixed(1)},${(100 - p).toFixed(1)}`).join(" ");
}

/** Allocation ring: one arc per plan plus wallet, drawn on a single circle. */
function AllocationRing({ hidden }: { hidden: boolean }) {
  const slices = [
    ...PLANS.map((p, i) => ({
      label: p.name,
      value: p.amount,
      cls: ["stroke-gold", "stroke-brand", "stroke-warning"][i],
    })),
    { label: "Wallet", value: WALLET_BALANCE, cls: "stroke-muted-foreground" },
  ];
  const r = 42;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 110 110" className="size-32 shrink-0 -rotate-90" aria-hidden>
        {slices.map((s) => {
          const len = (s.value / TOTAL_BALANCE) * c;
          const dash = `${Math.max(len - 3, 1)} ${c - Math.max(len - 3, 1)}`;
          const el = (
            <circle
              key={s.label}
              cx="55"
              cy="55"
              r={r}
              fill="none"
              strokeWidth="11"
              strokeLinecap="round"
              strokeDasharray={dash}
              strokeDashoffset={-offset}
              className={s.cls}
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <ul className="min-w-0 flex-1 space-y-2">
        {slices.map((s) => (
          <li key={s.label} className="flex items-center gap-2 text-xs">
            <span
              className={`size-2.5 shrink-0 rounded-full ${s.cls.replace("stroke-", "bg-")}`}
            />
            <span className="min-w-0 flex-1 truncate font-semibold">{s.label}</span>
            <span className="font-bold text-muted-foreground">
              {Math.round((s.value / TOTAL_BALANCE) * 100)}%
            </span>
            <span className="w-14 text-right font-bold">
              {hidden ? "₦•••" : short(s.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function HomeV9Screen() {
  const { hidden, toggle, mask } = useBalanceVisibility();
  const isNewUser = useIsNewUser();
  const [range, setRange] = useState<Range>("1M");
  const series = SERIES[range];
  const spark = sparkPath(series.points);

  return (
    <div className="theme-v2 type-v9">
      <AppShell navVariant="floating" title="Home">
        {/* Mobile header */}
        <header className="-mx-4 mb-5 border-b border-border bg-surface px-5 pb-5 pt-5 md:hidden">
          <div className="flex items-center justify-between">
            <Logo tone="brand" className="font-display text-2xl" />
            <div className="flex items-center gap-3">
              <Link
                to="/notifications"
                aria-label="Notifications"
                className="relative grid size-10 place-items-center rounded-2xl border border-border bg-secondary text-foreground"
              >
                <Bell className="size-5" />
                <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-gold" />
              </Link>
              <Link
                to="/settings"
                aria-label="Your profile"
                className="grid size-10 place-items-center rounded-2xl bg-gold-gradient text-sm font-bold text-gold-foreground"
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
            {/* Asymmetric bento: 6-col desktop grid with mixed spans */}
            <section className="grid grid-cols-1 gap-3 md:grid-cols-6 md:gap-4">
              {/* A — balance + performance band (4 cols, tall) */}
              <article className="relative overflow-hidden rounded-[28px] border border-border bg-brand-gradient p-6 text-primary-foreground shadow-card md:col-span-4 md:row-span-2 md:p-8">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-20 -top-28 size-80 rounded-full bg-white/10 blur-3xl"
                />
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.18em] text-primary-foreground/80">
                      <ShieldCheck className="size-3.5" /> Net worth
                    </p>
                    <div className="mt-4 flex items-center gap-3">
                      <h1 className="font-display text-[2.6rem] font-bold leading-none tracking-tight md:text-6xl">
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
                    <p className="mt-3 text-xs font-semibold text-primary-foreground/70">
                      {mask(INVESTED_TOTAL)} invested · {mask(WALLET_BALANCE)} wallet ·{" "}
                      {BLENDED_YIELD.toFixed(1)}% blended yield
                    </p>
                  </div>
                  <div className="hidden gap-1 rounded-full border border-white/20 bg-white/10 p-1 lg:flex">
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

                <div className="mt-6 rounded-3xl border border-white/15 bg-white/5 p-4">
                  <div className="flex items-baseline justify-between">
                    <p className="text-sm font-bold text-[oklch(0.87_0.15_94)]">
                      +{naira(series.gain)}
                    </p>
                    <p className="text-xs font-semibold text-primary-foreground/70">
                      +{series.pct}% {series.label}
                    </p>
                  </div>
                  <svg
                    viewBox="0 0 360 100"
                    className="mt-3 h-24 w-full md:h-32"
                    preserveAspectRatio="none"
                    aria-hidden
                  >
                    <defs>
                      <linearGradient id="v9Fill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="oklch(0.84 0.155 88 / 0.4)" />
                        <stop offset="100%" stopColor="oklch(0.84 0.155 88 / 0)" />
                      </linearGradient>
                    </defs>
                    <polygon points={`${spark} 360,100 0,100`} fill="url(#v9Fill)" />
                    <polyline
                      points={spark}
                      fill="none"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      stroke="oklch(0.86 0.15 92)"
                    />
                  </svg>
                  <div className="mt-3 flex gap-1 overflow-x-auto no-scrollbar lg:hidden">
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
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {QUICK_ACTIONS.map(({ label, icon: Icon, to }) => (
                    <Link
                      key={label}
                      to={to}
                      className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-3 py-2.5 text-xs font-bold transition-colors hover:bg-white/20"
                    >
                      <Icon className="size-4 text-[oklch(0.87_0.15_94)]" />
                      {label}
                    </Link>
                  ))}
                </div>
              </article>

              {/* B — wallet (2 cols) */}
              <article className="flex flex-col justify-between rounded-[28px] border border-border bg-surface p-6 shadow-card md:col-span-2">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="grid size-11 place-items-center rounded-2xl bg-gold/15 text-gold">
                      <Wallet className="size-5" />
                    </span>
                    <span className="rounded-full border border-border px-3 py-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Wallet
                    </span>
                  </div>
                  <p className="mt-4 font-display text-3xl font-bold tracking-tight">
                    {mask(WALLET_BALANCE)}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Idle cash earns nothing. Move it into a plan to start compounding.
                  </p>
                </div>
                <Link
                  to="/portfolio"
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-bold text-gold-foreground shadow-float transition-transform active:scale-95"
                >
                  <Plus className="size-4" /> Fund wallet
                </Link>
              </article>

              {/* C — weekly earnings (2 cols) */}
              <article className="rounded-[28px] border border-border bg-surface p-6 shadow-card md:col-span-2">
                <div className="flex items-baseline justify-between">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Earned this week
                  </p>
                  <span className="text-xs font-bold text-success">+8.2%</span>
                </div>
                <p className="mt-2 font-display text-3xl font-bold tracking-tight text-gold">
                  {mask(WEEK_TOTAL)}
                </p>
                <div className="mt-4 flex h-16 items-end gap-1.5">
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

              {/* D — allocation ring (3 cols) */}
              <article className="rounded-[28px] border border-border bg-surface p-6 shadow-card md:col-span-3">
                <div className="flex items-end justify-between">
                  <div>
                    <h2 className="font-display text-lg font-bold tracking-tight">Allocation</h2>
                    <p className="text-xs text-muted-foreground">
                      How your {mask(TOTAL_BALANCE)} is split today
                    </p>
                  </div>
                  <Link to="/portfolio" className="text-xs font-bold text-gold">
                    Rebalance
                  </Link>
                </div>
                <div className="mt-5">
                  <AllocationRing hidden={hidden} />
                </div>
              </article>

              {/* E — maturity ladder (3 cols) */}
              <article className="rounded-[28px] border border-border bg-surface p-6 shadow-card md:col-span-3">
                <div className="flex items-end justify-between">
                  <div>
                    <h2 className="font-display text-lg font-bold tracking-tight">
                      Maturity ladder
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Next payout in {NEXT.daysLeft} days · {NEXT.matures}
                    </p>
                  </div>
                  <Link to="/portfolio" className="text-xs font-bold text-gold">
                    View all
                  </Link>
                </div>
                <ul className="mt-5 space-y-3.5">
                  {PLANS.map((p) => {
                    const Icon = p.icon;
                    return (
                      <li key={p.name} className="flex items-center gap-3">
                        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-brand-gradient text-primary-foreground">
                          <Icon className="size-4.5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-2">
                            <p className="truncate text-sm font-bold">{p.name}</p>
                            <p className="font-display text-sm font-bold">{mask(p.amount)}</p>
                          </div>
                          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
                            <span
                              className="block h-full rounded-full bg-gold-gradient"
                              style={{ width: `${p.progress}%` }}
                            />
                          </div>
                          <p className="mt-1 text-xs font-semibold text-muted-foreground">
                            {p.yield}% p.a. · {p.daysLeft} days left · {p.matures}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </article>

              {/* F — idle cash nudge (full width band) */}
              <article className="flex flex-col items-start gap-4 rounded-[28px] border border-gold/30 bg-accent/40 p-6 shadow-card md:col-span-6 md:flex-row md:items-center">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gold-gradient text-gold-foreground">
                  <Lightbulb className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold">
                    {mask(WALLET_BALANCE)} idle could earn about{" "}
                    {hidden ? "₦•••" : naira(Math.round((WALLET_BALANCE * 18.5) / 100))} a year.
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Plans from 18.5% p.a. · 30–365 day tenors · ₦50,000 minimum.
                  </p>
                </div>
                <Link
                  to="/invest"
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-brand px-5 py-3 text-sm font-bold text-brand-foreground transition-transform active:scale-95 md:w-auto"
                >
                  Put it to work <ArrowUpRight className="size-4" />
                </Link>
              </article>
            </section>

            {/* For you — editorial split list */}
            <section className="mt-8">
              <div className="flex items-end justify-between">
                <h2 className="font-display text-xl font-bold tracking-tight">For you</h2>
                <Link to="/explore" className="text-xs font-bold text-gold">
                  View all
                </Link>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-6 md:gap-4">
                <Link
                  to={FEED[0].to}
                  className="group overflow-hidden rounded-[28px] border border-border bg-surface shadow-card transition-colors hover:border-gold/40 md:col-span-3"
                >
                  <FeedThumb index={0} className="mb-0 h-44 rounded-none md:h-56" />
                  <div className="p-5">
                    <span className="inline-block rounded-full border border-gold/40 bg-gold/10 px-2.5 py-1 text-xs font-bold uppercase tracking-widest text-gold">
                      {FEED[0].tag}
                    </span>
                    <h3 className="mt-3 font-display text-lg font-bold leading-snug">
                      {FEED[0].title}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                      {FEED[0].body}
                    </p>
                  </div>
                </Link>

                <div className="grid gap-3 md:col-span-3 md:gap-4">
                  {FEED.slice(1).map((item, i) => (
                    <Link
                      key={item.title}
                      to={item.to}
                      className="flex items-center gap-4 rounded-[28px] border border-border bg-surface p-4 shadow-card transition-colors hover:border-gold/40"
                    >
                      <FeedThumb
                        index={i + 1}
                        className="mb-0 size-24 shrink-0 rounded-2xl md:size-28"
                      />
                      <div className="min-w-0">
                        <span className="inline-block rounded-full border border-border px-2.5 py-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                          {item.tag}
                        </span>
                        <h3 className="mt-2 font-display text-base font-bold leading-snug">
                          {item.title}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                          {item.body}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
      </AppShell>
    </div>
  );
}
