import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  CalendarClock,
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

export const Route = createFileRoute("/home-v10")({
  head: () => ({
    meta: [
      { title: "Kipit Home 10 — Editorial Wealth Canvas" },
      {
        name: "description",
        content:
          "Kipit home concept 10: a navy wealth canvas with a live performance area chart, cashflow forecast, autopilot rules and an editorial insight column.",
      },
      { property: "og:title", content: "Kipit Home 10 — Editorial Wealth Canvas" },
      {
        property: "og:description",
        content:
          "Live performance canvas, payout forecast and autopilot savings rules in one Kipit dashboard.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomeV10Screen,
});

const naira = (v: number) => `₦${v.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
const short = (v: number) =>
  v >= 1_000_000 ? `₦${(v / 1_000_000).toFixed(2)}m` : `₦${Math.round(v / 1000)}k`;

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
  },
  {
    name: "Kipit Lock",
    icon: Zap,
    amount: 1_100_000,
    yield: 21,
    progress: 46,
    matures: "12 Mar 2027",
    daysLeft: 192,
  },
  {
    name: "Goal — Rent",
    icon: PiggyBank,
    amount: 600_000,
    yield: 15.2,
    progress: 18,
    matures: "30 Aug 2027",
    daysLeft: 363,
  },
];

const INVESTED_TOTAL = PLANS.reduce((s, p) => s + p.amount, 0);
const TOTAL_BALANCE = INVESTED_TOTAL + WALLET_BALANCE;
const BLENDED_YIELD =
  PLANS.reduce((s, p) => s + p.amount * p.yield, 0) / INVESTED_TOTAL;

type Range = "1W" | "1M" | "6M" | "1Y" | "All";

const SERIES: Record<Range, { points: number[]; gain: number; pct: number; label: string }> = {
  "1W": { points: [58, 56, 61, 59, 64, 68, 72], gain: 9_120, pct: 0.31, label: "this week" },
  "1M": {
    points: [40, 44, 42, 50, 48, 56, 54, 62, 60, 68, 72, 78],
    gain: 38_200,
    pct: 1.58,
    label: "this month",
  },
  "6M": {
    points: [20, 27, 25, 33, 41, 39, 49, 53, 59, 65, 71, 82],
    gain: 186_400,
    pct: 7.8,
    label: "past 6 months",
  },
  "1Y": {
    points: [10, 17, 23, 21, 31, 38, 45, 53, 59, 67, 75, 88],
    gain: 402_900,
    pct: 17.9,
    label: "past year",
  },
  All: {
    points: [5, 9, 15, 19, 29, 35, 45, 55, 63, 72, 81, 94],
    gain: 612_300,
    pct: 26.4,
    label: "all time",
  },
};

/** Projected payouts landing in the wallet over the next six months. */
const FORECAST = [
  { month: "Sep", amount: 786_000, note: "Fixed Income matures" },
  { month: "Oct", amount: 12_400, note: "Interest accrual" },
  { month: "Nov", amount: 12_400, note: "Interest accrual" },
  { month: "Dec", amount: 18_900, note: "Bonus yield" },
  { month: "Jan", amount: 12_400, note: "Interest accrual" },
  { month: "Feb", amount: 12_400, note: "Interest accrual" },
];
const FORECAST_MAX = Math.max(...FORECAST.map((f) => f.amount));
const FORECAST_TOTAL = FORECAST.reduce((s, f) => s + f.amount, 0);

const AUTOPILOT = [
  { title: "Payday sweep", detail: "25% of every inflow → Kipit Lock", on: true },
  { title: "Round-ups", detail: "Spare change → Goal — Rent", on: true },
  { title: "Auto-rollover", detail: "Reinvest Fixed Income at maturity", on: false },
];

const QUICK_ACTIONS = [
  { label: "Add money", icon: ArrowDownLeft, to: "/portfolio" },
  { label: "Withdraw", icon: ArrowUpRight, to: "/portfolio" },
  { label: "New plan", icon: Plus, to: "/invest" },
  { label: "Statements", icon: Receipt, to: "/settings" },
] as const;

const FEED = [
  {
    tag: "Product update",
    title: "Fixed Income now settles same-day",
    body: "Maturity payouts land in your wallet within minutes of settlement.",
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
    body: "Add BVN and NIN to raise your transaction limits today.",
    to: "/settings",
  },
];

const W = 640;
const H = 200;

function areaGeometry(points: number[]) {
  const step = W / (points.length - 1);
  const coords = points.map((p, i) => [i * step, H - (p / 100) * (H - 16) - 8] as const);
  const line = coords.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `0,${H} ${line} ${W},${H}`;
  const last = coords[coords.length - 1]!;
  return { line, area, last };
}

function HomeV10Screen() {
  const { hidden, toggle, mask } = useBalanceVisibility();
  const isNewUser = useIsNewUser();
  const [range, setRange] = useState<Range>("1M");
  const [rules, setRules] = useState(AUTOPILOT.map((r) => r.on));
  const series = SERIES[range];
  const { line, area, last } = areaGeometry(series.points);

  return (
    <div className="type-v10">
      <AppShell navVariant="morph" title="Home">
        {/* Mobile header */}
        <header className="-mx-4 mb-4 flex items-center justify-between px-5 pt-5 md:hidden">
          <Logo tone="brand" className="text-2xl" />
          <div className="flex items-center gap-2">
            <Link
              to="/notifications"
              aria-label="Notifications"
              className="relative grid size-10 place-items-center rounded-full bg-secondary"
            >
              <Bell className="size-5" />
              <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-gold" />
            </Link>
            <button
              type="button"
              onClick={toggle}
              aria-label={hidden ? "Show balances" : "Hide balances"}
              className="grid size-10 place-items-center rounded-full bg-secondary"
            >
              {hidden ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          </div>
        </header>

        {isNewUser ? (
          <div className="pb-6">
            <NewUserEmptyState />
          </div>
        ) : (
          <div className="space-y-6 pb-6">
            {/* ── The canvas: full-bleed navy performance panel ───────────── */}
            <section className="overflow-hidden rounded-[2rem] bg-brand-gradient text-primary-foreground shadow-float">
              <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.35fr_1fr] lg:gap-10">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-foreground/60">
                    Total net worth
                  </p>
                  <p className="font-display mt-2 text-5xl leading-none sm:text-6xl">
                    {hidden ? "₦ • • • • • •" : naira(TOTAL_BALANCE)}
                  </p>
                  <p className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                    <span className="inline-flex items-center gap-1 rounded-full bg-gold-gradient px-3 py-1 text-xs font-bold text-gold-foreground">
                      <ArrowUpRight className="size-3.5" />+{series.pct}%
                    </span>
                    <span className="text-primary-foreground/75">
                      {hidden ? "₦•••" : `+${naira(series.gain)}`} {series.label}
                    </span>
                  </p>

                  <dl className="mt-6 grid grid-cols-3 gap-3 text-sm">
                    {[
                      { k: "Invested", v: short(INVESTED_TOTAL) },
                      { k: "Wallet", v: short(WALLET_BALANCE) },
                      { k: "Blended yield", v: `${BLENDED_YIELD.toFixed(1)}%` },
                    ].map((s) => (
                      <div key={s.k} className="rounded-2xl bg-white/10 px-3 py-3">
                        <dt className="text-xs text-primary-foreground/60">{s.k}</dt>
                        <dd className="mt-1 font-bold">
                          {hidden && s.k !== "Blended yield" ? "₦•••" : s.v}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {QUICK_ACTIONS.map((a) => {
                      const Icon = a.icon;
                      return (
                        <Link
                          key={a.label}
                          to={a.to}
                          className="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2.5 text-xs font-semibold transition-colors hover:bg-white/20"
                        >
                          <Icon className="size-4" />
                          {a.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Area chart */}
                <div className="min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-foreground/60">
                      Performance
                    </p>
                    <button
                      type="button"
                      onClick={toggle}
                      className="hidden items-center gap-1.5 rounded-full bg-white/12 px-3 py-1.5 text-xs font-semibold md:inline-flex"
                    >
                      {hidden ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                      {hidden ? "Show" : "Hide"}
                    </button>
                  </div>

                  <svg
                    viewBox={`0 0 ${W} ${H}`}
                    className="mt-3 h-40 w-full sm:h-48"
                    preserveAspectRatio="none"
                    role="img"
                    aria-label={`Portfolio performance ${series.label}, up ${series.pct} percent`}
                  >
                    <defs>
                      <linearGradient id="v10fill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="currentColor" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {[0.25, 0.5, 0.75].map((g) => (
                      <line
                        key={g}
                        x1="0"
                        x2={W}
                        y1={H * g}
                        y2={H * g}
                        stroke="currentColor"
                        strokeOpacity="0.12"
                        strokeWidth="1"
                        className="text-primary-foreground"
                      />
                    ))}
                    <polygon points={area} fill="url(#v10fill)" className="text-gold" />
                    <polyline
                      points={line}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-gold"
                      vectorEffect="non-scaling-stroke"
                    />
                    <circle cx={last[0]} cy={last[1]} r="6" className="fill-gold" />
                  </svg>

                  <div className="mt-4 flex gap-1.5 overflow-x-auto no-scrollbar">
                    {(Object.keys(SERIES) as Range[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRange(r)}
                        aria-pressed={range === r}
                        className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
                          range === r
                            ? "bg-gold-gradient text-gold-foreground"
                            : "bg-white/10 text-primary-foreground/70 hover:bg-white/20"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* ── Cashflow forecast + Autopilot ───────────────────────────── */}
            <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
              <section className="rounded-[1.75rem] border border-border bg-surface p-5 shadow-card sm:p-6">
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <h2 className="font-display text-2xl">Cashflow forecast</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      What lands in your wallet over the next six months.
                    </p>
                  </div>
                  <p className="text-right">
                    <span className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Projected
                    </span>
                    <span className="font-display text-2xl">
                      {hidden ? "₦•••" : naira(FORECAST_TOTAL)}
                    </span>
                  </p>
                </div>

                <ul className="mt-6 grid grid-cols-6 items-end gap-2 sm:gap-3">
                  {FORECAST.map((f) => (
                    <li key={f.month} className="flex flex-col items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground">
                        {hidden ? "•••" : short(f.amount)}
                      </span>
                      <span
                        className="w-full rounded-t-xl bg-brand-gradient"
                        style={{ height: `${Math.max((f.amount / FORECAST_MAX) * 120, 8)}px` }}
                        title={`${f.month}: ${naira(f.amount)} — ${f.note}`}
                      />
                      <span className="text-xs font-semibold">{f.month}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex items-start gap-3 rounded-2xl bg-accent px-4 py-3 text-sm text-accent-foreground">
                  <CalendarClock className="mt-0.5 size-4 shrink-0" />
                  <p>
                    <span className="font-bold">Kipit Fixed Income</span> matures on{" "}
                    <span className="font-bold">{PLANS[0]!.matures}</span> — {PLANS[0]!.daysLeft}{" "}
                    days away. Turn on auto-rollover to keep it compounding.
                  </p>
                </div>
              </section>

              <section className="rounded-[1.75rem] border border-border bg-surface p-5 shadow-card sm:p-6">
                <h2 className="font-display text-2xl">Autopilot</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Rules that move money for you, every single week.
                </p>
                <ul className="mt-5 space-y-3">
                  {AUTOPILOT.map((rule, i) => (
                    <li
                      key={rule.title}
                      className="flex items-center gap-3 rounded-2xl border border-border px-4 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold">{rule.title}</p>
                        <p className="truncate text-xs text-muted-foreground">{rule.detail}</p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={rules[i]}
                        aria-label={`${rule.title} ${rules[i] ? "on" : "off"}`}
                        onClick={() =>
                          setRules((prev) => prev.map((v, j) => (j === i ? !v : v)))
                        }
                        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                          rules[i] ? "bg-brand" : "bg-muted"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 size-5 rounded-full bg-surface shadow transition-all ${
                            rules[i] ? "left-[1.375rem]" : "left-0.5"
                          }`}
                        />
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex items-center gap-2 rounded-2xl bg-secondary px-4 py-3 text-xs font-semibold text-secondary-foreground">
                  <ShieldCheck className="size-4 shrink-0 text-brand" />
                  Funds are held with SEC-licensed partners. Tier 2 verified.
                </div>
              </section>
            </div>

            {/* ── Plans ledger ────────────────────────────────────────────── */}
            <section className="rounded-[1.75rem] border border-border bg-surface p-5 shadow-card sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-2xl">Your plans</h2>
                <Link
                  to="/portfolio"
                  className="text-sm font-bold text-brand underline-offset-4 hover:underline"
                >
                  View all
                </Link>
              </div>

              <ul className="mt-5 divide-y divide-border">
                {PLANS.map((p) => {
                  const Icon = p.icon;
                  return (
                    <li key={p.name}>
                      <Link
                        to="/portfolio"
                        className="flex flex-wrap items-center gap-4 py-4 transition-colors hover:bg-secondary/60"
                      >
                        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-gradient text-primary-foreground">
                          <Icon className="size-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="truncate text-sm font-bold">{p.name}</span>
                            <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-accent-foreground">
                              {p.yield}% p.a.
                            </span>
                          </span>
                          <span className="mt-2 block h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <span
                              className="block h-full rounded-full bg-gold-gradient"
                              style={{ width: `${p.progress}%` }}
                            />
                          </span>
                          <span className="mt-1.5 block text-xs text-muted-foreground">
                            {p.progress}% of tenor · matures {p.matures} · {p.daysLeft} days left
                          </span>
                        </span>
                        <span className="text-right text-sm font-bold">
                          {mask(p.amount)}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  to="/invest"
                  className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-bold text-brand-foreground"
                >
                  <Plus className="size-4" /> New plan
                </Link>
                <Link
                  to="/portfolio"
                  className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-bold"
                >
                  <Wallet className="size-4" /> Fund wallet
                </Link>
              </div>
            </section>

            {/* ── Editorial insight column ────────────────────────────────── */}
            <section>
              <div className="flex items-end justify-between gap-3">
                <h2 className="font-display text-2xl">For you</h2>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <Lightbulb className="size-4 text-gold" /> Curated weekly
                </span>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {FEED.map((item, i) => (
                  <Link
                    key={item.title}
                    to={item.to}
                    className="group rounded-[1.5rem] border border-border bg-surface p-4 shadow-card transition-transform hover:-translate-y-0.5"
                  >
                    <FeedThumb index={i} />
                    <p className="text-xs font-bold uppercase tracking-widest text-gold">
                      {item.tag}
                    </p>
                    <h3 className="font-display mt-1.5 text-xl leading-snug">{item.title}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">{item.body}</p>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        )}
      </AppShell>
    </div>
  );
}
