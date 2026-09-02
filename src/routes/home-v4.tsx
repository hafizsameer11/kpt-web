import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  Bell,
  ChevronRight,
  Eye,
  EyeOff,
  Lightbulb,
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
  MONTH_CHANGE,
  MONTH_CHANGE_PCT,
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

export const Route = createFileRoute("/home-v4")({
  head: () => ({
    meta: [
      { title: "Kipit Home — Allocation Cockpit" },
      {
        name: "description",
        content:
          "A cockpit-style Kipit home: allocation ring, live plan rail, maturity countdown, weekly interest and upcoming payouts in one view.",
      },
      { property: "og:title", content: "Kipit Home — Allocation Cockpit" },
      {
        property: "og:description",
        content: "Allocation ring, plan rail and payout schedule in one Kipit dashboard.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomeV4Screen,
});

const RANGES = ["1W", "1M", "3M", "1Y"] as const;
type Range = (typeof RANGES)[number];

/** Growth series per range — index 0 is oldest. */
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
  return values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / span) * (h - 8) - 4;
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
}

function HomeV4Screen() {
  const { hidden, toggle, mask } = useBalanceVisibility();
  const isNewUser = useIsNewUser();
  const [range, setRange] = useState<Range>("1M");

  const series = SERIES[range];
  const first = series[0] ?? TOTAL;
  const last = series[series.length - 1] ?? TOTAL;
  const delta = last - first;
  const deltaPct = ((delta / first) * 100).toFixed(2);

  const line = useMemo(() => buildPath(series, 300, 90), [series]);
  const area = `${line} L300,90 L0,90 Z`;

  const investedPct = Math.round((INVESTED / TOTAL) * 100);
  const ring = 2 * Math.PI * 52;
  const maturedPct = Math.round(
    ((NEXT_MATURITY.totalDays - NEXT_MATURITY.daysLeft) / NEXT_MATURITY.totalDays) * 100,
  );
  const maxWeek = Math.max(...WEEK_SERIES);

  return (
    <div className="type-v4">
      <AppShell navVariant="floating">
        {/* Mobile identity header */}
        <header className="-mx-4 mb-4 border-b border-border bg-surface px-5 pb-4 pt-5 md:hidden">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <div className="min-w-0">
              <Logo tone="brand" className="text-base" />
              <p className="mt-1 truncate text-xs text-muted-foreground">
                <GreetingText />, Adaeze
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Link
                to="/notifications"
                aria-label="Notifications"
                className="relative grid size-10 place-items-center rounded-full border border-border text-foreground"
              >
                <Bell className="size-5" />
                <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-gold" />
              </Link>
              <Link
                to="/settings"
                aria-label="Profile"
                className="grid size-10 place-items-center rounded-full bg-brand text-sm font-bold text-brand-foreground"
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
            <div className="grid items-start gap-3 md:gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
              {/* Growth cockpit */}
              <section className="overflow-hidden rounded-3xl md:rounded-[1.75rem] bg-brand-gradient p-5 md:p-6 text-primary-foreground shadow-float md:p-8">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 md:gap-4">
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-primary-foreground/60">
                      Total portfolio value
                    </p>
                    <p className="mt-2 text-4xl font-extrabold tracking-tight md:text-5xl">
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
                    className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 text-primary-foreground"
                  >
                    {hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>

                <svg
                  viewBox="0 0 300 90"
                  preserveAspectRatio="none"
                  className="mt-6 h-28 w-full md:h-36"
                  role="img"
                  aria-label={`Portfolio growth over ${range}`}
                >
                  <defs>
                    <linearGradient id="v4Fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d={area} fill="url(#v4Fill)" />
                  <path
                    d={line}
                    fill="none"
                    stroke="var(--gold)"
                    strokeWidth="2.5"
                    vectorEffect="non-scaling-stroke"
                    strokeLinecap="round"
                  />
                </svg>

                <div className="mt-5 flex gap-1 rounded-full bg-white/10 p-1">
                  {RANGES.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRange(r)}
                      className={`flex-1 rounded-full py-2 text-xs font-bold transition-colors ${
                        range === r
                          ? "bg-gold-gradient text-gold-foreground"
                          : "text-primary-foreground/70"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </section>

              {/* Allocation ring */}
              <section className="rounded-3xl md:rounded-[1.75rem] border border-border bg-surface p-5 md:p-6 shadow-card">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Allocation
                </p>
                <div className="mt-4 flex items-center gap-6">
                  <div className="relative shrink-0">
                    <svg width="128" height="128" viewBox="0 0 128 128" role="img" aria-label="Allocation between invested funds and wallet">
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
                      <span className="text-xl font-extrabold leading-none">{investedPct}%</span>
                      <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
                        invested
                      </span>
                    </span>

                  </div>
                  <dl className="min-w-0 flex-1 space-y-3">
                    <div>
                      <dt className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="size-2.5 rounded-full bg-brand" /> Invested
                      </dt>
                      <dd className="mt-0.5 text-lg font-extrabold">{mask(INVESTED)}</dd>
                    </div>
                    <div>
                      <dt className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="size-2.5 rounded-full bg-secondary" /> Wallet
                      </dt>
                      <dd className="mt-0.5 text-lg font-extrabold">{mask(WALLET)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">This month</dt>
                      <dd className="mt-0.5 text-sm font-bold text-success">
                        +{naira(MONTH_CHANGE)} · +{MONTH_CHANGE_PCT}%
                      </dd>
                    </div>
                  </dl>
                </div>
                
              </section>
            </div>

            {/* Quick actions */}
            <section className="mt-4 overflow-hidden rounded-3xl border border-border bg-surface shadow-card">
              <div className="grid grid-cols-4 divide-x divide-border">
                {QUICK_ACTIONS.map(({ label, icon: Icon, to }) => (
                  <Link
                    key={label}
                    to={to}
                    className="group relative flex items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-accent/40 md:px-5"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-gold/12 text-gold transition-all group-hover:bg-gold-gradient group-hover:text-gold-foreground">
                      <Icon className="size-4.5" />
                    </span>
                    <span className="min-w-0 text-[11px] font-semibold leading-tight md:text-sm">
                      {label}
                    </span>
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-gold-gradient transition-transform duration-300 group-hover:scale-x-100"
                    />
                  </Link>
                ))}
              </div>
            </section>


            {/* Plan rail */}
            <section className="mt-6">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
                    Active investments
                  </p>
                  <h2 className="mt-1 text-lg font-extrabold tracking-tight">Your plans</h2>
                </div>
                <Link
                  to="/portfolio"
                  className="group inline-flex items-center gap-1 rounded-full border border-border px-3.5 py-2 text-xs font-bold text-brand transition-colors hover:border-gold/60 hover:bg-accent/50"
                >
                  View portfolio
                  <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
              <div className="-mx-4 mt-4 flex snap-x snap-mandatory gap-3 md:gap-4 overflow-x-auto px-4 pb-3 [-ms-overflow-style:none] [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-3 md:px-0 [&::-webkit-scrollbar]:hidden">
                {HOLDINGS.map((h) => {
                  const pct = Math.round(((h.totalDays - h.daysLeft) / h.totalDays) * 100);
                  return (
                    <article
                      key={h.name}
                      className="group relative w-[80%] shrink-0 snap-start overflow-hidden rounded-3xl md:rounded-[1.75rem] border border-border bg-surface p-5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-gold/50 hover:shadow-float md:w-auto"
                    >
                      <span
                        aria-hidden
                        className="absolute inset-x-0 top-0 h-1 bg-gold-gradient opacity-70 transition-opacity group-hover:opacity-100"
                      />
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold leading-tight">{h.name}</p>
                          <p className="mt-1 text-[11px] font-semibold text-muted-foreground">
                            Matures {h.date}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full bg-accent px-2.5 py-1 text-[11px] font-extrabold text-accent-foreground">
                          {h.rate}
                        </span>
                      </div>

                      <p className="mt-4 text-[28px] font-extrabold leading-none tracking-tight">
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


            <div className="mt-4 grid items-start gap-3 md:gap-4 lg:grid-cols-3">
              {/* Maturity countdown */}
              <section className="rounded-3xl md:rounded-[1.75rem] border border-border bg-surface p-5 md:p-6 shadow-card">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
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
                    <span className="absolute inset-0 grid place-items-center text-sm font-extrabold">
                      {NEXT_MATURITY.daysLeft}d
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{NEXT_MATURITY.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {NEXT_MATURITY.tenor} · {NEXT_MATURITY.rate}
                    </p>
                    <p className="mt-2 text-lg font-extrabold">{mask(NEXT_MATURITY.amount)}</p>
                    <p className="text-xs text-muted-foreground">
                      Matures {NEXT_MATURITY.date} · payout{" "}
                      {mask(NEXT_MATURITY.expectedPayout)}
                    </p>
                  </div>
                </div>
              </section>

              {/* Weekly interest */}
              <section className="rounded-3xl md:rounded-[1.75rem] border border-border bg-surface p-5 md:p-6 shadow-card">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Interest this week
                </p>
                <p className="mt-2 text-2xl font-extrabold text-gold">{mask(WEEK_EARNINGS)}</p>
                <div className="mt-4 flex h-20 items-end gap-2">
                  {WEEK_SERIES.map((v, i) => (
                    <div key={WEEK_LABELS[i]} className="flex flex-1 flex-col items-center gap-1.5">
                      <span
                        className="w-full rounded-md bg-gold-gradient"
                        style={{ height: `${(v / maxWeek) * 60}px` }}
                      />
                      <span className="text-[10px] font-semibold text-muted-foreground">
                        {WEEK_LABELS[i]}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Payout schedule */}
              <section className="rounded-3xl md:rounded-[1.75rem] border border-border bg-surface p-5 md:p-6 shadow-card">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
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
                      <p className="shrink-0 text-sm font-extrabold text-success">
                        +{mask(p.amount)}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            {/* Wallet + recommendation */}
            <section className="mt-4 grid items-start gap-3 md:gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
              <div className="rounded-3xl md:rounded-[1.75rem] border border-border bg-surface p-5 md:p-6 shadow-card">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  <Wallet className="size-4" /> Wallet
                </p>
                <p className="mt-3 text-3xl font-extrabold tracking-tight">{mask(WALLET)}</p>
                <p className="mt-1 text-xs font-semibold text-muted-foreground">
                  Available to invest or withdraw
                </p>
                
                <Link
                  to="/invest"
                  className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-brand px-5 py-3 text-sm font-bold text-brand-foreground"
                >
                  Add money
                </Link>
              </div>

              <div className="grid gap-3 md:gap-4 rounded-3xl md:rounded-[1.75rem] border border-gold/40 bg-accent p-5 md:p-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                <div className="flex min-w-0 gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-gold-gradient text-gold-foreground">
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
                  className="inline-flex items-center justify-center gap-1 rounded-full bg-brand px-5 py-3 text-sm font-bold text-brand-foreground"
                >
                  Explore Investments <ChevronRight className="size-4" />
                </Link>
              </div>
            </section>

            {/* For you */}
            <section className="mt-6 md:mt-8">
              <h2 className="text-lg font-extrabold tracking-tight">For you</h2>
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
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
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
