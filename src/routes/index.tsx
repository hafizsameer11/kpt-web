import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowUpRight,
  Bell,
  Eye,
  EyeOff,
  Lightbulb,
  Plus,
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
  INVESTED,
  MONTH_CHANGE,
  MONTH_CHANGE_PCT,
  NEXT_MATURITY,
  QUICK_ACTIONS,
  TOTAL,
  WALLET,
  WEEK_EARNINGS,
  WEEK_LABELS,
  naira,
} from "@/lib/home-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kipit Home — Portfolio, Wallet & Plans" },
      {
        name: "description",
        content:
          "Your Kipit home dashboard: total portfolio value, wallet balance, weekly interest, next maturity countdown and quick actions for funding, withdrawing and investing.",
      },
      { property: "og:title", content: "Kipit Home — Portfolio, Wallet & Plans" },
      {
        property: "og:description",
        content:
          "Track portfolio value, wallet, weekly earnings and upcoming maturities in one Kipit dashboard.",
      },
    ],
  }),
  component: HomeScreen,
});

const RANGES = ["1W", "1M", "6M", "1Y", "All"] as const;

const SERIES: Record<string, number[]> = {
  "1W": [82, 78, 84, 74, 80, 68, 62],
  "1M": [86, 78, 82, 64, 70, 52, 58, 40, 46, 28, 34, 18, 24],
  "6M": [92, 84, 88, 70, 74, 60, 52, 44, 30, 22],
  "1Y": [96, 90, 82, 86, 70, 74, 58, 48, 40, 26, 18],
  All: [98, 88, 90, 72, 66, 54, 40, 30, 16],
};

const CHANGE: Record<string, string> = {
  "1W": "+₦12,480 · +0.42% this week",
  "1M": `+${naira(MONTH_CHANGE)} · +${MONTH_CHANGE_PCT}% this month`,
  "6M": "+₦214,600 · +7.8% in 6 months",
  "1Y": "+₦398,400 · +15.6% this year",
  All: "+₦612,900 · +26.2% all time",
};

function toPoints(values: number[]) {
  const step = 360 / (values.length - 1);
  return values.map((v, i) => `${(i * step).toFixed(1)},${v}`).join(" ");
}

function CountdownRing({ daysLeft, total }: { daysLeft: number; total: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const progress = 1 - daysLeft / total;
  return (
    <svg viewBox="0 0 84 84" className="size-24 -rotate-90">
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

function HomeScreen() {
  const { hidden, toggle, mask } = useBalanceVisibility();
  const isNewUser = useIsNewUser();
  const [range, setRange] = useState<string>("1M");
  const points = toPoints(SERIES[range] ?? SERIES["1M"]!);

  return (
    <div>
      <AppShell navVariant="classic">
        {/* Mobile header — greeting, notifications, profile (MOB-020) */}
        <header className="sticky top-0 z-30 -mx-4 mb-5 border-b border-border bg-background/80 px-5 pb-4 pt-5 backdrop-blur-xl md:hidden">
          <div className="flex items-center justify-between gap-3">
            <Logo tone="brand" className="font-display text-2xl" />
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
            {/* Portfolio summary + wallet */}
            <section className="grid gap-4 lg:grid-cols-3">
              <article className="relative overflow-hidden rounded-[1.75rem] bg-brand-gradient p-6 text-primary-foreground shadow-float md:p-8 lg:col-span-2">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-white/10 blur-3xl"
                />
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground/70">
                      <GreetingText />, Adaeze
                    </p>
                    <p className="mt-3 text-xs text-primary-foreground/70">
                      Total portfolio value
                    </p>
                    <div className="mt-1 flex items-center gap-3">
                      <h1 className="font-display text-[40px] font-bold leading-none tracking-[-0.04em] text-num md:text-[54px]">
                        {mask(TOTAL)}
                      </h1>
                      <button
                        type="button"
                        onClick={toggle}
                        aria-label={hidden ? "Show balances" : "Hide balances"}
                        className="grid size-9 shrink-0 place-items-center rounded-full border border-white/25 bg-white/10 text-primary-foreground/80 transition-colors hover:bg-white/20"
                      >
                        {hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-bold text-[oklch(0.87_0.15_94)]">
                      <ArrowUpRight className="size-3.5" /> {CHANGE[range]}
                    </p>
                  </div>
                  <div className="hidden gap-1 rounded-full border border-white/20 bg-white/10 p-1 md:flex">
                    {RANGES.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRange(r)}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold press ${
                          range === r
                            ? "bg-white text-brand"
                            : "text-primary-foreground/60 hover:text-primary-foreground"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <svg viewBox="0 0 360 100" className="mt-6 h-24 w-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.84 0.155 88 / 0.35)" />
                      <stop offset="100%" stopColor="oklch(0.84 0.155 88 / 0)" />
                    </linearGradient>
                  </defs>
                  <polygon points={`${points} 360,100 0,100`} fill="url(#sparkFill)" />
                  <polyline
                    points={points}
                    fill="none"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    stroke="oklch(0.86 0.15 92)"
                  />
                </svg>

                <div className="mt-4 flex gap-1 overflow-x-auto no-scrollbar md:hidden">
                  {RANGES.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRange(r)}
                      className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold press ${
                        range === r
                          ? "bg-white text-brand"
                          : "border border-white/15 bg-white/10 text-primary-foreground/75"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-white/15 pt-5 text-sm">
                  <div>
                    <dt className="text-xs text-primary-foreground/65">Invested</dt>
                    <dd className="mt-1 font-display text-lg font-bold">{mask(INVESTED)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-primary-foreground/65">Wallet</dt>
                    <dd className="mt-1 font-display text-lg font-bold">{mask(WALLET)}</dd>
                  </div>
                </dl>
              </article>

              {/* Wallet card (MOB-020) */}
              <article className="flex flex-col justify-between rounded-[1.75rem] border border-border bg-surface p-6 shadow-card">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="grid size-11 place-items-center rounded-2xl bg-secondary text-brand">
                      <Wallet className="size-5" strokeWidth={1.8} />
                    </span>
                    <span className="rounded-full border border-border px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                      Wallet
                    </span>
                  </div>
                  <p className="mt-5 font-display text-3xl font-bold tracking-tight text-num">
                    {mask(WALLET)}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-muted-foreground">
                    Available funds: {mask(WALLET)}
                  </p>
                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                    Funds in your wallet are available for investment or withdrawal anytime and
                    do not earn interest or investment returns.
                  </p>
                  <dl className="mt-5 space-y-2.5 border-t border-border pt-5 text-[13px]">
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-muted-foreground">In plans</dt>
                      <dd className="font-semibold text-num">{mask(INVESTED)}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-muted-foreground">Interest this week</dt>
                      <dd className="font-semibold text-num">{mask(WEEK_EARNINGS)}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-muted-foreground">Next payout</dt>
                      <dd className="font-semibold">{NEXT_MATURITY.date}</dd>
                    </div>
                  </dl>
                </div>
                <Link
                  to="/invest"
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground press hover:opacity-90"
                >
                  <Plus className="size-4" /> Fund wallet
                </Link>
              </article>
            </section>

            {/* Quick actions */}
            <section className="mt-4 overflow-hidden rounded-[1.75rem] border border-border bg-surface shadow-card">
              <div className="grid grid-cols-2 divide-x divide-y divide-border sm:grid-cols-4 sm:divide-y-0">
                {QUICK_ACTIONS.map(({ label, icon: Icon, to }) => (
                  <Link
                    key={label}
                    to={to}
                    className="group relative flex items-center gap-3 px-4 py-4 text-left press hover:bg-secondary md:px-5"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-secondary text-brand transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
                      <Icon className="size-4.5" strokeWidth={1.8} />
                    </span>
                    <span className="min-w-0 text-[13px] font-semibold leading-tight md:text-sm">
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

            {/* Weekly earnings + next maturity + recommendation */}
            <section className="mt-4 grid gap-4 md:grid-cols-3">
              <article className="rounded-[1.75rem] border border-border bg-surface p-6 shadow-card">
                <div className="flex items-baseline justify-between">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                    Weekly earnings
                  </p>
                  <span className="text-xs font-bold text-success">+8.2%</span>
                </div>
                <p className="mt-3 font-display text-3xl font-bold tracking-tight text-num text-foreground">
                  {mask(WEEK_EARNINGS)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Interest earned in the last 7 days
                </p>
                <div className="mt-5 h-24 w-full">
                  <svg
                    viewBox="0 0 280 80"
                    className="h-full w-full overflow-visible"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="weeklyArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="oklch(0.75 0.16 85 / 0.45)" />
                        <stop offset="100%" stopColor="oklch(0.75 0.16 85 / 0)" />
                      </linearGradient>
                    </defs>
                    <polygon
                      points="0,70 0,52 47,46 93,50 140,34 187,40 233,16 280,22 280,70"
                      fill="url(#weeklyArea)"
                    />
                    <polyline
                      points="0,52 47,46 93,50 140,34 187,40 233,16 280,22"
                      fill="none"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      stroke="oklch(0.72 0.17 85)"
                    />
                    <circle cx="233" cy="16" r="3.5" className="fill-gold" />
                  </svg>
                </div>
                <div className="mt-1 flex justify-between text-[10px] font-semibold text-muted-foreground">
                  {WEEK_LABELS.map((d) => (
                    <span key={d}>{d}</span>
                  ))}
                </div>
              </article>

              <article className="flex items-center gap-5 rounded-[1.75rem] border border-border bg-surface p-6 shadow-card">
                <div className="relative grid shrink-0 place-items-center">
                  <CountdownRing
                    daysLeft={NEXT_MATURITY.daysLeft}
                    total={NEXT_MATURITY.totalDays}
                  />
                  <div className="absolute text-center">
                    <p className="font-display text-xl font-bold leading-none">
                      {NEXT_MATURITY.daysLeft}
                    </p>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                      days
                    </p>
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Next maturity
                  </p>
                  <p className="mt-1.5 text-sm font-bold">
                    {NEXT_MATURITY.name} · {NEXT_MATURITY.tenor}
                  </p>
                  <p className="mt-1 font-display text-2xl font-bold tracking-tight">
                    {mask(NEXT_MATURITY.amount)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Matures {NEXT_MATURITY.date} · {NEXT_MATURITY.daysLeft} days left
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Expected payout {mask(NEXT_MATURITY.expectedPayout)}
                  </p>
                </div>
              </article>

              <article className="flex flex-col justify-between rounded-[1.75rem] border border-border bg-accent p-6 shadow-card">
                <div className="flex gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gold-gradient text-gold-foreground">
                    <Lightbulb className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground">
                      Your {naira(WALLET)} wallet balance isn't currently invested.
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      Plans from 18.5% p.a. · 30–365 day tenors · ₦50,000 minimum.
                    </p>
                  </div>
                </div>
                <Link
                  to="/explore"
                  className="mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground press hover:opacity-90"
                >
                  Explore Investments <ArrowUpRight className="size-4" />
                </Link>
              </article>
            </section>

            {/* Content feed */}
            <section className="mt-8">
              <div className="flex items-end justify-between">
                <h2 className="font-display text-xl font-bold tracking-tight">For you</h2>
                <Link to="/explore" className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground press hover:bg-secondary">
                  View all
                </Link>
              </div>
              <div className="-mx-4 mt-4 flex gap-3 overflow-x-auto px-4 pb-2 no-scrollbar md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
                {FEED.map((item, i) => (
                  <article
                    key={item.title}
                    className={`w-72 shrink-0 rounded-[1.5rem] border border-border p-5 shadow-card press hover:-translate-y-0.5 hover:shadow-float md:w-auto ${
                      i === 0 ? "bg-brand-gradient text-primary-foreground" : "bg-surface"
                    }`}
                  >
                    <FeedThumb index={i} />
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${
                        i === 0
                          ? "border border-white/20 bg-white/10 text-primary-foreground/85"
                          : "border border-border bg-secondary text-muted-foreground"
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
