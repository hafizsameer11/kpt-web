import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  Bell,
  ChevronRight,
  Eye,
  EyeOff,
  Lightbulb,
  Plus,
  Target,
  Wallet,
} from "lucide-react";
import { AppShell } from "@/components/kipit/AppShell";
import { Logo } from "@/components/kipit/Logo";
import { NewUserEmptyState } from "@/components/kipit/NewUserEmptyState";
import { FeedThumb } from "@/components/kipit/FeedThumb";
import { useBalanceVisibility, useIsNewUser } from "@/hooks/useBalanceVisibility";
import { GreetingText } from "@/components/kipit/SpecBlocks";
import {
  FEED,
  HOLDINGS,
  INVESTED,
  NEXT_MATURITY,
  PAYOUTS,
  QUICK_ACTIONS,
  TOTAL,
  WALLET,
  WEEK_EARNINGS,
  WEEK_LABELS,
  WEEK_SERIES,
  naira,
} from "@/lib/home-data";

export const Route = createFileRoute("/home-v5")({
  head: () => ({
    meta: [
      { title: "Kipit Home — Portfolio Command Centre" },
      {
        name: "description",
        content:
          "The complete Kipit home: portfolio growth chart, allocation ring, active plans, maturity countdown, weekly interest and upcoming payouts in one dashboard.",
      },
      { property: "og:title", content: "Kipit Home — Portfolio Command Centre" },
      {
        property: "og:description",
        content:
          "Portfolio growth, allocation, active plans, maturities and payouts in one refined Kipit dashboard.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomeV5Screen,
});

const RANGES = ["1W", "1M", "3M", "1Y"] as const;
type Range = (typeof RANGES)[number];

const SERIES: Record<Range, number[]> = {
  "1W": [2_905_000, 2_912_400, 2_918_900, 2_926_100, 2_933_800, 2_941_200, TOTAL],
  "1M": [2_911_800, 2_921_000, 2_930_500, 2_936_400, 2_942_100, 2_946_500, TOTAL],
  "3M": [2_780_000, 2_818_000, 2_852_000, 2_881_000, 2_905_000, 2_930_000, TOTAL],
  "1Y": [2_410_000, 2_520_000, 2_618_000, 2_710_000, 2_805_000, 2_890_000, TOTAL],
};

const RANGE_LABEL: Record<Range, string> = {
  "1W": "this week",
  "1M": "this month",
  "3M": "in 3 months",
  "1Y": "in 12 months",
};

function buildPath(values: number[], w: number, h: number) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  return values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / span) * (h - 10) - 5;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function HomeV5Screen() {
  const { hidden, toggle, mask } = useBalanceVisibility();
  const isNewUser = useIsNewUser();
  const [range, setRange] = useState<Range>("1M");

  const series = SERIES[range] ?? SERIES["1M"];
  const first = series[0] ?? TOTAL;
  const last = series[series.length - 1] ?? TOTAL;
  const delta = last - first;
  const deltaPct = ((delta / first) * 100).toFixed(2);

  const line = useMemo(() => buildPath(series, 300, 96), [series]);
  const area = `${line} L300,96 L0,96 Z`;

  const investedPct = Math.round((INVESTED / TOTAL) * 100);
  const ring = 2 * Math.PI * 52;
  const maturedPct = Math.round(
    ((NEXT_MATURITY.totalDays - NEXT_MATURITY.daysLeft) / NEXT_MATURITY.totalDays) * 100,
  );
  const maxWeek = Math.max(...WEEK_SERIES);
  const weekPath = buildPath(WEEK_SERIES, 280, 72);

  return (
    <AppShell navVariant="classic">
      {/* Mobile header */}
      <header className="sticky top-0 z-30 -mx-4 mb-5 border-b border-border bg-background/80 px-5 pb-4 pt-5 backdrop-blur-xl md:hidden">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0">
            <Logo tone="brand" className="font-display text-xl" />
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              <GreetingText />, Adaeze
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <Link
              to="/notifications"
              aria-label="Notifications"
              className="relative grid size-10 place-items-center rounded-full border border-border bg-surface text-foreground press"
            >
              <Bell className="size-[18px]" strokeWidth={1.8} />
              <span className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-gold ring-2 ring-surface" />
            </Link>
            <Link
              to="/settings"
              aria-label="Profile"
              className="grid size-10 place-items-center rounded-full bg-brand text-xs font-bold text-brand-foreground press"
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
          {/* Hero: growth + allocation */}
          <section className="grid items-start gap-3 md:gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            <article className="relative overflow-hidden rounded-3xl md:rounded-[1.75rem] bg-brand-gradient p-5 md:p-6 text-primary-foreground shadow-float md:p-8">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-white/10 blur-3xl"
              />
              <div className="relative grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 md:gap-4">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-primary-foreground/60">
                    Total portfolio value
                  </p>
                  <p className="mt-2 font-display text-4xl font-bold tracking-tight text-num md:text-5xl">
                    {mask(TOTAL)}
                  </p>
                  <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1 text-xs font-bold text-gold">
                    <ArrowUpRight className="size-3.5" />
                    +{naira(delta)} · +{deltaPct}% {RANGE_LABEL[range]}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={toggle}
                  aria-label={hidden ? "Show balances" : "Hide balances"}
                  className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 text-primary-foreground press"
                >
                  {hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>

              <svg
                viewBox="0 0 300 96"
                preserveAspectRatio="none"
                className="relative mt-6 h-28 w-full md:h-36"
                role="img"
                aria-label={`Portfolio growth over ${range}`}
              >
                <defs>
                  <linearGradient id="v5Fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={area} fill="url(#v5Fill)" />
                <path
                  d={line}
                  fill="none"
                  stroke="var(--gold)"
                  strokeWidth="2.5"
                  vectorEffect="non-scaling-stroke"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              <div className="relative mt-5 flex gap-1 rounded-full bg-white/10 p-1">
                {RANGES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRange(r)}
                    className={`flex-1 rounded-full py-2 text-xs font-bold transition-colors press ${
                      range === r
                        ? "bg-white text-brand"
                        : "text-primary-foreground/70"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <dl className="relative mt-6 grid grid-cols-2 gap-3 border-t border-white/15 pt-5 text-sm">
                <div>
                  <dt className="text-xs text-primary-foreground/65">Invested</dt>
                  <dd className="mt-1 font-display text-lg font-bold text-num">{mask(INVESTED)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-primary-foreground/65">Wallet</dt>
                  <dd className="mt-1 font-display text-lg font-bold text-num">{mask(WALLET)}</dd>
                </div>
              </dl>
            </article>

            {/* Allocation + wallet */}
            <article className="flex h-full flex-col rounded-3xl md:rounded-[1.75rem] border border-border bg-surface p-5 md:p-6 shadow-card">
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                Allocation
              </p>
              <div className="mt-4 flex items-center gap-5">
                <div className="relative shrink-0">
                  <svg
                    width="120"
                    height="120"
                    viewBox="0 0 128 128"
                    role="img"
                    aria-label="Allocation between invested funds and wallet"
                  >
                    <circle cx="64" cy="64" r="52" fill="none" stroke="var(--secondary)" strokeWidth="14" />
                    <circle
                      cx="64"
                      cy="64"
                      r="52"
                      fill="none"
                      stroke="var(--brand)"
                      strokeWidth="14"
                      strokeLinecap="round"
                      strokeDasharray={`${(investedPct / 100) * ring} ${ring}`}
                      transform="rotate(-90 64 64)"
                    />
                  </svg>
                  <span className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 text-center">
                    <span className="font-display text-xl font-bold leading-none">{investedPct}%</span>
                    <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
                      invested
                    </span>
                  </span>
                </div>
                <dl className="min-w-0 flex-1 space-y-3">
                  <div>
                    <dt className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="size-2.5 rounded-full bg-brand" /> In plans
                    </dt>
                    <dd className="mt-0.5 font-display text-lg font-bold text-num">{mask(INVESTED)}</dd>
                  </div>
                  <div>
                    <dt className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="size-2.5 rounded-full bg-secondary" /> Wallet
                    </dt>
                    <dd className="mt-0.5 font-display text-lg font-bold text-num">{mask(WALLET)}</dd>
                  </div>
                </dl>
              </div>

              <dl className="mt-5 space-y-2.5 border-t border-border pt-5 text-[13px]">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Interest this week</dt>
                  <dd className="font-semibold text-num">{mask(WEEK_EARNINGS)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Next payout</dt>
                  <dd className="font-semibold">{NEXT_MATURITY.date}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Active plans</dt>
                  <dd className="font-semibold">{HOLDINGS.length}</dd>
                </div>
              </dl>

              <Link
                to="/invest"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground press hover:opacity-90"
              >
                <Plus className="size-4" /> Fund wallet
              </Link>
            </article>
          </section>

          {/* Quick actions */}
          <section className="mt-4 overflow-hidden rounded-3xl md:rounded-[1.75rem] border border-border bg-surface shadow-card">
            <div className="grid grid-cols-4 divide-x divide-border">
              {QUICK_ACTIONS.map(({ label, icon: Icon, to }) => (
                <Link
                  key={label}
                  to={to}
                  className="group relative flex flex-col items-center gap-2 px-1.5 py-3.5 text-center press hover:bg-secondary md:flex-row md:gap-3 md:px-5 md:py-4 md:text-left"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-secondary text-brand transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
                    <Icon className="size-4.5" strokeWidth={1.8} />
                  </span>
                  <span className="min-w-0 text-[11px] font-semibold leading-tight md:text-sm">
                    {label}
                  </span>
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-gold transition-transform duration-300 group-hover:scale-x-100"
                  />
                </Link>
              ))}
            </div>
          </section>

          {/* Plans rail */}
          <section className="mt-6">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
                  Active investments
                </p>
                <h2 className="mt-1 font-display text-lg font-bold tracking-tight">Your plans</h2>
              </div>
              <Link
                to="/portfolio"
                className="group inline-flex items-center gap-1 rounded-full border border-border px-3.5 py-2 text-xs font-bold text-brand press hover:bg-secondary"
              >
                View portfolio
                <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
            <div className="-mx-4 mt-4 flex snap-x snap-mandatory gap-3 md:gap-4 overflow-x-auto px-4 pb-3 no-scrollbar md:mx-0 md:grid md:grid-cols-3 md:px-0">
              {HOLDINGS.map((h) => {
                const pct = Math.round(((h.totalDays - h.daysLeft) / h.totalDays) * 100);
                return (
                  <article
                    key={h.name}
                    className="group relative w-[80%] shrink-0 snap-start overflow-hidden rounded-3xl md:rounded-[1.75rem] border border-border bg-surface p-5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-float md:w-auto"
                  >
                    <span
                      aria-hidden
                      className="absolute inset-x-0 top-0 h-1 bg-gold opacity-70 transition-opacity group-hover:opacity-100"
                    />
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold leading-tight">{h.name}</p>
                        <p className="mt-1 text-[11px] font-semibold text-muted-foreground">
                          Matures {h.date}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-bold text-brand">
                        {h.rate}
                      </span>
                    </div>

                    <p className="mt-4 font-display text-[28px] font-bold leading-none tracking-tight text-num">
                      {mask(h.amount)}
                    </p>

                    <div className="mt-5 flex items-center justify-between text-[11px] font-semibold">
                      <span className="text-muted-foreground">{pct}% elapsed</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-foreground">
                        {h.daysLeft} days left
                      </span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                      <span
                        className="block h-full rounded-full bg-brand-gradient transition-[width] duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* Maturity + weekly interest + payouts */}
          <div className="mt-4 grid items-start gap-3 md:gap-4 lg:grid-cols-3">
            <section className="rounded-3xl md:rounded-[1.75rem] border border-border bg-surface p-5 md:p-6 shadow-card">
              <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                <Target className="size-4" /> Next maturity
              </p>
              <div className="mt-4 flex items-center gap-3 md:gap-4">
                <div className="relative shrink-0">
                  <svg width="88" height="88" viewBox="0 0 128 128" role="img" aria-label="Maturity progress">
                    <circle cx="64" cy="64" r="52" fill="none" stroke="var(--secondary)" strokeWidth="14" />
                    <circle
                      cx="64"
                      cy="64"
                      r="52"
                      fill="none"
                      stroke="var(--gold)"
                      strokeWidth="14"
                      strokeLinecap="round"
                      strokeDasharray={`${(maturedPct / 100) * ring} ${ring}`}
                      transform="rotate(-90 64 64)"
                    />
                  </svg>
                  <span className="absolute inset-0 grid place-items-center font-display text-sm font-bold">
                    {NEXT_MATURITY.daysLeft}d
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{NEXT_MATURITY.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {NEXT_MATURITY.tenor} · {NEXT_MATURITY.rate}
                  </p>
                  <p className="mt-2 font-display text-lg font-bold text-num">
                    {mask(NEXT_MATURITY.amount)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Matures {NEXT_MATURITY.date} · payout {mask(NEXT_MATURITY.expectedPayout)}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl md:rounded-[1.75rem] border border-border bg-surface p-5 md:p-6 shadow-card">
              <div className="flex items-baseline justify-between">
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  Interest this week
                </p>
                <span className="text-xs font-bold text-success">+8.2%</span>
              </div>
              <p className="mt-2 font-display text-3xl font-bold tracking-tight text-num">
                {mask(WEEK_EARNINGS)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Interest earned in the last 7 days
              </p>
              <svg
                viewBox="0 0 280 72"
                preserveAspectRatio="none"
                className="mt-4 h-20 w-full"
                role="img"
                aria-label="Daily interest earned this week"
              >
                <defs>
                  <linearGradient id="v5Week" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={`${weekPath} L280,72 L0,72 Z`} fill="url(#v5Week)" />
                <path
                  d={weekPath}
                  fill="none"
                  stroke="var(--gold)"
                  strokeWidth="2.5"
                  vectorEffect="non-scaling-stroke"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="mt-1 flex justify-between text-[10px] font-semibold text-muted-foreground">
                {WEEK_LABELS.map((d, i) => (
                  <span key={d} className={WEEK_SERIES[i] === maxWeek ? "text-foreground" : ""}>
                    {d}
                  </span>
                ))}
              </div>
            </section>

            <section className="rounded-3xl md:rounded-[1.75rem] border border-border bg-surface p-5 md:p-6 shadow-card">
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                Upcoming payouts
              </p>
              <ul className="mt-3 divide-y divide-border">
                {PAYOUTS.map((p) => (
                  <li
                    key={p.label}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold">{p.label}</p>
                      <p className="text-xs text-muted-foreground">{p.date}</p>
                    </div>
                    <p className="shrink-0 text-sm font-bold text-success text-num">
                      +{mask(p.amount)}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Idle cash recommendation */}
          <section className="mt-4 grid gap-3 md:gap-4 rounded-3xl md:rounded-[1.75rem] border border-border bg-accent p-5 md:p-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
            <div className="flex min-w-0 gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-gold text-gold-foreground">
                <Lightbulb className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-accent-foreground">
                  {naira(WALLET)} is sitting idle in your wallet.
                </p>
                <p className="mt-1 text-xs text-accent-foreground/80">
                  Plans from 18.5% p.a. · 30–365 day tenors · ₦50,000 minimum.
                </p>
              </div>
            </div>
            <Link
              to="/explore"
              className="inline-flex items-center justify-center gap-1 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground press hover:opacity-90"
            >
              Explore Investments <ChevronRight className="size-4" />
            </Link>
          </section>

          {/* For you */}
          <section className="mt-6 md:mt-8">
            <h2 className="font-display text-lg font-bold tracking-tight">For you</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {FEED.map((item, i) => (
                <article
                  key={item.title}
                  className="rounded-[1.5rem] border border-border bg-surface p-5 shadow-card"
                >
                  <FeedThumb index={i} />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                    {item.tag}
                  </span>
                  <h3 className="mt-2 text-sm font-bold leading-snug">{item.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{item.body}</p>
                </article>
              ))}
            </div>
          </section>
        </>
      )}
    </AppShell>
  );
}
