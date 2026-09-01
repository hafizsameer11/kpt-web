import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpRight,
  Bell,
  CalendarClock,
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  Landmark,
  Lightbulb,
  PiggyBank,
  Plus,
  Repeat,
  ShieldCheck,
  Target,
  Wallet,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/kipit/AppShell";
import { NewUserEmptyState } from "@/components/kipit/NewUserEmptyState";
import { FeedThumb } from "@/components/kipit/FeedThumb";
import { useBalanceVisibility, useIsNewUser } from "@/hooks/useBalanceVisibility";

export const Route = createFileRoute("/home-v12")({
  head: () => ({
    meta: [
      { title: "Kipit Home 12 — The Complete Wealth Home" },
      {
        name: "description",
        content:
          "Kipit home concept 12: the best of every Kipit design — aurora balance hero, live growth curve, allocation ring, plan grid, cashflow forecast and autopilot rules.",
      },
      { property: "og:title", content: "Kipit Home 12 — The Complete Wealth Home" },
      {
        property: "og:description",
        content:
          "One dashboard: growth curve, allocation, plans, weekly earnings, payout forecast and automation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomeV12Screen,
});

const naira = (v: number) =>
  `₦${v.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
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
  {
    name: "Flex Wallet",
    icon: Wallet,
    amount: WALLET_BALANCE,
    yield: 12,
    progress: 100,
    matures: "Anytime",
    daysLeft: 0,
  },
];

const INVESTED_PLANS = PLANS.filter((p) => p.name !== "Flex Wallet");
const INVESTED_TOTAL = INVESTED_PLANS.reduce((s, p) => s + p.amount, 0);
const TOTAL_BALANCE = INVESTED_TOTAL + WALLET_BALANCE;
const BLENDED_YIELD =
  INVESTED_PLANS.reduce((s, p) => s + p.amount * p.yield, 0) / INVESTED_TOTAL;

type Range = "1W" | "1M" | "6M" | "1Y" | "All";

const SERIES: Record<
  Range,
  { points: number[]; gain: number; pct: number; label: string }
> = {
  "1W": { points: [2.9, 2.905, 2.898, 2.92, 2.928, 2.941, 2.95], gain: 12_480, pct: 0.42, label: "this week" },
  "1M": { points: [2.84, 2.855, 2.849, 2.874, 2.888, 2.905, 2.918, 2.95], gain: 46_200, pct: 1.59, label: "this month" },
  "6M": { points: [2.42, 2.5, 2.55, 2.63, 2.71, 2.78, 2.87, 2.95], gain: 268_400, pct: 10.0, label: "in 6 months" },
  "1Y": { points: [2.05, 2.18, 2.3, 2.38, 2.52, 2.64, 2.79, 2.95], gain: 512_900, pct: 21.1, label: "this year" },
  All: { points: [0.4, 0.85, 1.2, 1.6, 2.0, 2.34, 2.66, 2.95], gain: 748_300, pct: 34.0, label: "since you joined" },
};

const RANGES: Range[] = ["1W", "1M", "6M", "1Y", "All"];

/** Weekly earnings — labelled bars summing exactly to the 1W gain. */
const WEEK = [
  { day: "Mon", amount: 1_620 },
  { day: "Tue", amount: 1_740 },
  { day: "Wed", amount: 1_580 },
  { day: "Thu", amount: 1_960 },
  { day: "Fri", amount: 2_110 },
  { day: "Sat", amount: 1_780 },
  { day: "Sun", amount: 1_690 },
];
const WEEK_TOTAL = WEEK.reduce((s, d) => s + d.amount, 0);
const WEEK_MAX = Math.max(...WEEK.map((d) => d.amount));

const FORECAST = [
  { month: "Sep", amount: 138_750 },
  { month: "Oct", amount: 19_250 },
  { month: "Nov", amount: 19_250 },
  { month: "Dec", amount: 19_250 },
  { month: "Jan", amount: 19_250 },
  { month: "Feb", amount: 19_250 },
];
const FORECAST_MAX = Math.max(...FORECAST.map((f) => f.amount));

const ACTIVITY = [
  { title: "Interest credited", detail: "Kipit Fixed Income", amount: 12_480, up: true, when: "Today" },
  { title: "Wallet top-up", detail: "GTBank ••4412", amount: 150_000, up: true, when: "Yesterday" },
  { title: "New plan funded", detail: "Kipit Lock · 12 months", amount: -400_000, up: false, when: "28 Aug" },
];

const FEED = [
  { tag: "Guide", title: "How compounding turns ₦50k monthly into ₦1.2m" },
  { tag: "Market", title: "Where Nigerian T-bill yields are heading in Q4" },
  { tag: "Kipit", title: "Auto-rollover: never leave a matured plan idle" },
];

const QUICK = [
  { label: "Add money", icon: ArrowDownToLine, to: "/portfolio" },
  { label: "New plan", icon: Plus, to: "/invest" },
  { label: "Withdraw", icon: Wallet, to: "/portfolio" },
  { label: "Explore", icon: ArrowUpRight, to: "/explore" },
];

function GrowthCurve({ points }: { points: number[] }) {
  const { line, area } = useMemo(() => {
    const min = Math.min(...points);
    const max = Math.max(...points);
    const span = max - min || 1;
    const coords = points.map((p, i) => {
      const x = (i / (points.length - 1)) * 100;
      const y = 100 - ((p - min) / span) * 80 - 10;
      return [x, y] as const;
    });
    const d = coords
      .map(([x, y], i) => {
        if (i === 0) return `M ${x} ${y}`;
        const [px, py] = coords[i - 1]!;
        const cx = (px + x) / 2;
        return `C ${cx} ${py}, ${cx} ${y}, ${x} ${y}`;
      })
      .join(" ");
    return { line: d, area: `${d} L 100 100 L 0 100 Z` };
  }, [points]);

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-36 w-full sm:h-48">
      <defs>
        <linearGradient id="v12-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.45" />
          <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[22, 48, 74].map((y) => (
        <line
          key={y}
          x1="0"
          x2="100"
          y1={y}
          y2={y}
          stroke="currentColor"
          strokeWidth="0.2"
          className="text-primary-foreground/15"
        />
      ))}
      <path d={area} fill="url(#v12-fill)" />
      <path
        d={line}
        fill="none"
        stroke="var(--gold)"
        strokeWidth="1.6"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function AllocationRing() {
  const invested = (INVESTED_TOTAL / TOTAL_BALANCE) * 100;
  const c = 2 * Math.PI * 42;
  return (
    <div className="flex items-center gap-5">
      <div className="relative shrink-0">
        <svg viewBox="0 0 100 100" className="size-28 -rotate-90">
          <circle cx="50" cy="50" r="42" fill="none" strokeWidth="11" className="stroke-secondary" />
          <circle
            cx="50" cy="50" r="42" fill="none" strokeWidth="11" strokeLinecap="round"
            stroke="var(--brand)" strokeDasharray={`${(invested / 100) * c} ${c}`}
          />
          <circle
            cx="50" cy="50" r="42" fill="none" strokeWidth="11" strokeLinecap="round"
            stroke="var(--gold)" strokeDasharray={`${((100 - invested) / 100) * c} ${c}`}
            strokeDashoffset={-((invested / 100) * c)}
          />
        </svg>
        <span className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <span className="font-display text-lg leading-none">{BLENDED_YIELD.toFixed(1)}%</span>
        </span>
      </div>
      <dl className="min-w-0 space-y-3 text-sm">
        <div>
          <dt className="flex items-center gap-2 text-muted-foreground">
            <span className="size-2.5 rounded-full bg-brand" /> Invested
          </dt>
          <dd className="font-display text-lg">{short(INVESTED_TOTAL)} · {invested.toFixed(0)}%</dd>
        </div>
        <div>
          <dt className="flex items-center gap-2 text-muted-foreground">
            <span className="size-2.5 rounded-full bg-gold" /> Wallet
          </dt>
          <dd className="font-display text-lg">{short(WALLET_BALANCE)} · {(100 - invested).toFixed(0)}%</dd>
        </div>
      </dl>
    </div>
  );
}

const TODOS = [
  { label: "Verify your identity (BVN)", to: "/settings" },
  { label: "Add a payout bank account", to: "/settings" },
  { label: "Set up a savings goal", to: "/invest" },
];

const RULES = [
  { label: "Payday sweep", detail: "Move ₦50,000 to Vault every 25th", icon: Repeat, on: true },
  { label: "Round-ups", detail: "Round spending to the nearest ₦100", icon: Target, on: false },
  { label: "Auto-rollover", detail: "Reinvest matured plans automatically", icon: ShieldCheck, on: true },
];

function HomeV12Screen() {
  const { hidden, toggle, mask } = useBalanceVisibility();
  const isNew = useIsNewUser();
  const [range, setRange] = useState<Range>("1M");
  const [done, setDone] = useState<string[]>([TODOS[0]!.label]);
  const [rules, setRules] = useState(() => RULES.map((r) => r.on));
  const series = SERIES[range];

  return (
    <div className="type-v12">
      <AppShell navVariant="elevated" title="Home">
        <div className="mx-auto w-full max-w-6xl space-y-6 pt-4 md:pt-0">
          {isNew ? (
            <NewUserEmptyState />
          ) : (
            <>
              <div className="grid gap-6 lg:grid-cols-5">
                {/* Hero */}
                <section className="relative overflow-hidden rounded-[2rem] bg-brand-gradient p-6 text-primary-foreground shadow-float sm:p-8 lg:col-span-3">
                  <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-gold/25 blur-3xl" />
                  <div aria-hidden className="pointer-events-none absolute -bottom-28 -left-16 size-64 rounded-full bg-teal/20 blur-3xl" />

                  <div className="relative">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-foreground/60">
                          Total net worth
                        </p>
                        <div className="mt-2 flex items-center gap-3">
                          <h1 className="font-display text-4xl leading-none sm:text-5xl">
                            {mask(TOTAL_BALANCE)}
                          </h1>
                          <button
                            type="button"
                            onClick={toggle}
                            aria-label={hidden ? "Show balance" : "Hide balance"}
                            className="grid size-9 shrink-0 place-items-center rounded-full bg-primary-foreground/10"
                          >
                            {hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                          </button>
                        </div>
                        <p className="mt-2 text-sm text-primary-foreground/70">
                          {short(INVESTED_TOTAL)} invested · {short(WALLET_BALANCE)} in wallet
                        </p>
                      </div>
                      <Link
                        to="/notifications"
                        aria-label="Notifications"
                        className="relative grid size-11 shrink-0 place-items-center rounded-full bg-primary-foreground/10"
                      >
                        <Bell className="size-5" />
                        <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-gold" />
                      </Link>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-gold px-3 py-1.5 text-xs font-bold text-gold-foreground">
                        <ArrowUpRight className="size-3.5" /> +{series.pct.toFixed(2)}%
                      </span>
                      <span className="text-sm text-primary-foreground/75">
                        {hidden ? "₦••••••" : `+${naira(series.gain)}`} {series.label}
                      </span>
                    </div>

                    <GrowthCurve points={series.points} />

                    <div className="mt-3 inline-flex rounded-full bg-primary-foreground/10 p-1">
                      {RANGES.map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRange(r)}
                          aria-pressed={range === r}
                          className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                            range === r ? "bg-gold text-gold-foreground" : "text-primary-foreground/70"
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Allocation + weekly earnings */}
                <div className="space-y-6 lg:col-span-2">
                  <section className="rounded-3xl border border-border bg-surface p-6 shadow-card">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                      <h2 className="font-display truncate text-xl">Allocation</h2>
                      <span className="shrink-0 text-xs font-semibold text-muted-foreground">
                        blended yield
                      </span>
                    </div>
                    <div className="mt-4">
                      <AllocationRing />
                    </div>
                  </section>

                  <section className="rounded-3xl border border-border bg-surface p-6 shadow-card">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3">
                      <h2 className="font-display truncate text-xl">Weekly earnings</h2>
                      <span className="shrink-0 text-sm font-bold text-brand">
                        {hidden ? "₦••••" : `+${naira(WEEK_TOTAL)}`}
                      </span>
                    </div>
                    <ul className="mt-5 flex h-28 items-end gap-2">
                      {WEEK.map((d) => (
                        <li key={d.day} className="flex flex-1 flex-col items-center gap-2">
                          <span className="sr-only">{`${d.day}: ${naira(d.amount)}`}</span>
                          <span
                            className="w-full rounded-t-lg bg-gold-gradient"
                            style={{ height: `${(d.amount / WEEK_MAX) * 100}%` }}
                          />
                          <span className="text-xs text-muted-foreground">{d.day}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>
              </div>

              {/* Quick actions */}
              <section className="grid grid-cols-4 gap-3">
                {QUICK.map((a) => {
                  const Icon = a.icon;
                  return (
                    <Link
                      key={a.label}
                      to={a.to}
                      className="flex flex-col items-center gap-2 rounded-3xl border border-border bg-surface px-2 py-4 text-xs font-bold shadow-card transition-transform hover:-translate-y-0.5"
                    >
                      <span className="grid size-10 place-items-center rounded-2xl bg-accent text-brand">
                        <Icon className="size-5" />
                      </span>
                      <span className="text-center">{a.label}</span>
                    </Link>
                  );
                })}
              </section>

              {/* Plans grid */}
              <section>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
                  <h2 className="font-display truncate text-2xl">Your Kipit plans</h2>
                  <Link to="/invest" className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-brand">
                    New plan <Plus className="size-4" />
                  </Link>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {PLANS.map((p) => {
                    const Icon = p.icon;
                    return (
                      <Link
                        key={p.name}
                        to="/portfolio"
                        className="rounded-3xl border border-border bg-surface p-5 shadow-card transition-transform hover:-translate-y-0.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="grid size-11 place-items-center rounded-2xl bg-brand-gradient text-primary-foreground">
                            <Icon className="size-5" />
                          </span>
                          <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-accent-foreground">
                            {p.yield}% p.a.
                          </span>
                        </div>
                        <p className="mt-4 truncate text-sm font-bold">{p.name}</p>
                        <p className="font-display mt-1 text-xl">{mask(p.amount)}</p>
                        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                          <span
                            className="block h-full rounded-full bg-gold-gradient"
                            style={{ width: `${p.progress}%` }}
                          />
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {p.daysLeft > 0 ? `${p.daysLeft} days left · ${p.matures}` : "Withdraw anytime"}
                        </p>
                      </Link>
                    );
                  })}
                </div>
              </section>

              <div className="grid gap-6 lg:grid-cols-5">
                {/* Forecast + activity */}
                <div className="space-y-6 lg:col-span-3">
                  <section className="rounded-3xl border border-border bg-surface p-6 shadow-card">
                    <h2 className="font-display text-2xl">Payout forecast</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Maturities and interest landing in your wallet over the next six months.
                    </p>
                    <ul className="mt-5 flex h-36 items-end gap-3">
                      {FORECAST.map((f) => (
                        <li key={f.month} className="flex flex-1 flex-col items-center gap-2">
                          <span className="text-xs font-semibold text-muted-foreground">
                            {hidden ? "•••" : short(f.amount)}
                          </span>
                          <span
                            className="w-full rounded-t-xl bg-brand-gradient"
                            style={{ height: `${(f.amount / FORECAST_MAX) * 100}%` }}
                          />
                          <span className="text-xs text-muted-foreground">{f.month}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section className="rounded-3xl border border-border bg-surface p-6 shadow-card">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
                      <h2 className="font-display truncate text-2xl">Recent activity</h2>
                      <Link to="/portfolio" className="inline-flex shrink-0 items-center text-sm font-bold text-brand">
                        View all <ChevronRight className="size-4" />
                      </Link>
                    </div>
                    <ul className="mt-4 divide-y divide-border">
                      {ACTIVITY.map((a) => (
                        <li key={a.title} className="flex items-center gap-3 py-3">
                          <span
                            className={`grid size-9 shrink-0 place-items-center rounded-full ${
                              a.up ? "bg-success/15 text-success" : "bg-secondary text-brand"
                            }`}
                          >
                            <ArrowUpRight className={`size-4 ${a.up ? "" : "rotate-180"}`} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">{a.title}</p>
                            <p className="text-xs text-muted-foreground">{a.detail} · {a.when}</p>
                          </div>
                          <p className="shrink-0 text-sm font-bold">
                            {hidden ? "₦••••" : `${a.up ? "+" : "−"}${naira(Math.abs(a.amount))}`}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>

                {/* Ladder + autopilot + todo + idle cash */}
                <div className="space-y-6 lg:col-span-2">
                  <section className="rounded-3xl border border-border bg-surface p-6 shadow-card">
                    <h2 className="font-display text-xl">Maturity ladder</h2>
                    <ul className="mt-4 space-y-4">
                      {INVESTED_PLANS.map((p) => (
                        <li key={p.name} className="flex items-center gap-3">
                          <CalendarClock className="size-4 shrink-0 text-brand" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">{p.matures}</p>
                            <p className="truncate text-xs text-muted-foreground">{p.name}</p>
                          </div>
                          <p className="shrink-0 text-sm font-bold text-brand">
                            {hidden ? "₦••••" : `+${naira(Math.round((p.amount * p.yield) / 100))}`}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section className="rounded-3xl border border-border bg-surface p-6 shadow-card">
                    <h2 className="font-display text-xl">Autopilot</h2>
                    <ul className="mt-4 space-y-3">
                      {RULES.map((r, i) => {
                        const Icon = r.icon;
                        const on = rules[i];
                        return (
                          <li key={r.label} className="flex items-center gap-3">
                            <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-secondary text-brand">
                              <Icon className="size-4" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold">{r.label}</p>
                              <p className="truncate text-xs text-muted-foreground">{r.detail}</p>
                            </div>
                            <button
                              type="button"
                              role="switch"
                              aria-checked={on}
                              aria-label={r.label}
                              onClick={() =>
                                setRules((prev) => prev.map((v, j) => (j === i ? !v : v)))
                              }
                              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                                on ? "bg-brand" : "bg-secondary"
                              }`}
                            >
                              <span
                                className={`absolute top-0.5 size-5 rounded-full bg-surface shadow-card transition-all ${
                                  on ? "left-[1.375rem]" : "left-0.5"
                                }`}
                              />
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </section>

                  <section className="rounded-3xl border border-border bg-surface p-6 shadow-card">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                      <h2 className="font-display truncate text-xl">Finish setting up</h2>
                      <span className="shrink-0 text-xs font-bold text-brand">
                        {done.length}/{TODOS.length}
                      </span>
                    </div>
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                      <span
                        className="block h-full rounded-full bg-brand-gradient transition-all"
                        style={{ width: `${(done.length / TODOS.length) * 100}%` }}
                      />
                    </div>
                    <ul className="mt-4 space-y-2">
                      {TODOS.map((t) => {
                        const complete = done.includes(t.label);
                        return (
                          <li key={t.label} className="flex items-center gap-3">
                            <button
                              type="button"
                              aria-pressed={complete}
                              aria-label={`Mark "${t.label}" as done`}
                              onClick={() =>
                                setDone((prev) =>
                                  complete ? prev.filter((l) => l !== t.label) : [...prev, t.label],
                                )
                              }
                              className={`grid size-6 shrink-0 place-items-center rounded-full border transition-colors ${
                                complete ? "border-brand bg-brand text-primary-foreground" : "border-border"
                              }`}
                            >
                              {complete && <Check className="size-3.5" />}
                            </button>
                            <Link
                              to={t.to}
                              className={`min-w-0 flex-1 truncate text-sm font-semibold ${
                                complete ? "text-muted-foreground line-through" : ""
                              }`}
                            >
                              {t.label}
                            </Link>
                            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                          </li>
                        );
                      })}
                    </ul>
                  </section>

                  <section className="rounded-3xl bg-accent p-6">
                    <span className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1 text-xs font-bold text-brand">
                      <Lightbulb className="size-3.5" /> Idle cash
                    </span>
                    <p className="font-display mt-3 text-lg text-accent-foreground">
                      {short(WALLET_BALANCE)} in your wallet could earn{" "}
                      {naira(Math.round((WALLET_BALANCE * 18.5) / 100))} a year.
                    </p>
                    <Link
                      to="/invest"
                      className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-brand-foreground"
                    >
                      Put it to work <ArrowUpRight className="size-4" />
                    </Link>
                  </section>
                </div>
              </div>

              {/* For you */}
              <section>
                <h2 className="font-display text-2xl">For you</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  {FEED.map((f, i) => (
                    <Link
                      key={f.title}
                      to="/explore"
                      className="rounded-3xl border border-border bg-surface p-4 shadow-card transition-transform hover:-translate-y-0.5"
                    >
                      <FeedThumb index={i} />
                      <span className="text-xs font-bold uppercase tracking-widest text-gold">{f.tag}</span>
                      <p className="mt-1 text-sm font-semibold leading-snug">{f.title}</p>
                    </Link>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </AppShell>
    </div>
  );
}
