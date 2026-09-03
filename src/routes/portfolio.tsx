import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  CalendarClock,
  ChevronRight,
  Eye,
  EyeOff,
  FileBarChart,
  Gift,
  History,
  PieChart,
  Receipt,
  Wallet,
} from "lucide-react";
import { AppShell } from "@/components/kipit/AppShell";
import { DisclosureStrip } from "@/components/kipit/DisclosureStrip";
import { AmountCounter } from "@/components/kipit/motion";
import { useBalanceVisibility } from "@/hooks/useBalanceVisibility";
import { HOLDINGS } from "@/lib/home-data";
import { CALL_ACCOUNT } from "@/lib/invest-data";
import {
  ALLOCATION,
  EXPLORE_HOLDINGS,
  INTEREST_EARNED_YTD,
  PORTFOLIO_MONTH_CHANGE,
  PORTFOLIO_MONTH_CHANGE_PCT,
  PORTFOLIO_TOTAL,
  UPCOMING_MATURITIES,
  WALLET_TOTAL,
  pctOf,
} from "@/lib/portfolio-data";


export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio — Kipit Holdings & Allocation" },
      {
        name: "description",
        content:
          "See your total Kipit portfolio value, how it is allocated across wallet, call account, fixed plans and marketplace products, plus upcoming maturities.",
      },
      { property: "og:title", content: "Portfolio — Kipit Holdings & Allocation" },
      {
        property: "og:description",
        content:
          "Total value, allocation breakdown, active holdings and upcoming maturities across your Kipit investments.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PortfolioScreen,
});

/* ── Donut allocation chart ─────────────────────────────────────── */
function AllocationDonut({ size = 156 }: { size?: number }) {
  const stroke = 18;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="shrink-0 -rotate-90"
      role="img"
      aria-label="Portfolio allocation"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--muted)"
        strokeWidth={stroke}
      />
      {ALLOCATION.map((slice) => {
        const frac = slice.value / PORTFOLIO_TOTAL;
        const len = c * frac;
        const dash = `${Math.max(len - 3, 0)} ${c - Math.max(len - 3, 0)}`;
        const el = (
          <circle
            key={slice.key}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={slice.color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={dash}
            strokeDashoffset={-offset}
            className="k-fill-stroke"
          />
        );
        offset += len;
        return el;
      })}
    </svg>
  );
}

function PortfolioScreen() {
  return (
    <AppShell title="Portfolio" navVariant="elevated">
      <DesktopPortfolio />
      <MobilePortfolio />
    </AppShell>
  );
}

function MobilePortfolio() {
  const { hidden, mask, toggle } = useBalanceVisibility();
  const next = UPCOMING_MATURITIES[0];

  return (
    <div className="md:hidden">
      <div className="pb-2">

        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-14 pt-9 text-primary-foreground md:mx-0 md:rounded-xl md:px-8 md:pb-14 md:pt-12 md:shadow-float">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-32 size-72 rounded-full bg-gold/15 blur-[64px]"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-28 -left-24 size-64 rounded-full bg-white/10 blur-[56px]"
          />

          <div className="relative md:max-w-3xl">
            <div className="k-rise flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-foreground/60">
                  Portfolio total
                </p>
                <h1 className="mt-1 font-display text-[34px] font-extrabold leading-none tracking-[-0.035em] text-num md:text-[44px]">
                  <AmountCounter value={PORTFOLIO_TOTAL} hidden={hidden} mask={mask} />
                </h1>
              </div>
              <button
                type="button"
                onClick={toggle}
                aria-label={hidden ? "Show balances" : "Hide balances"}
                className="grid size-9 shrink-0 place-items-center rounded-full border border-white/15 bg-white/10 press"
              >
                {hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>

            <div
              className="k-rise mt-3 flex flex-wrap items-center gap-2"
              style={{ ["--d" as string]: "60ms" }}
            >
              <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-1 text-[11px] font-extrabold text-gold">
                <ArrowUpRight className="size-3.5" strokeWidth={2.6} />
                {mask(PORTFOLIO_MONTH_CHANGE)} · {PORTFOLIO_MONTH_CHANGE_PCT}%
              </span>
              <span className="text-[11px] text-primary-foreground/60">past 30 days</span>
            </div>

            <div
              className="k-rise mt-6 flex items-stretch gap-4 rounded-xl border border-white/12 bg-white/8 p-4 backdrop-blur-md"
              style={{ ["--d" as string]: "120ms" }}
            >
              <div className="min-w-0 flex-1">
                <p className="text-[11px] uppercase tracking-[0.08em] text-primary-foreground/55">
                  Interest earned
                </p>
                <p className="mt-1 text-[17px] font-extrabold text-num text-gold">
                  <AmountCounter value={INTEREST_EARNED_YTD} hidden={hidden} mask={mask} />
                </p>
              </div>
              <span aria-hidden className="w-px bg-white/12" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] uppercase tracking-[0.08em] text-primary-foreground/55">
                  Next maturity
                </p>
                <p className="mt-1 truncate text-[17px] font-extrabold">
                  {next ? `${next.daysLeft} days` : "—"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Sheet ────────────────────────────────────────────── */}
        <div className="relative -mx-4 -mt-8 rounded-t-[2rem] bg-background px-4 pt-5 md:mx-0 md:mt-6 md:rounded-none md:bg-transparent md:px-0 md:pt-0">
          <span
            aria-hidden
            className="mx-auto mb-4 block h-1 w-10 rounded-full bg-border md:hidden"
          />

          {/* Allocation */}
          <section className="k-rise card-surface p-4 md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-base font-extrabold">Allocation</h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                <PieChart className="size-3.5" /> 4 buckets
              </span>
            </div>

            <div className="flex flex-col items-center gap-5 md:flex-row md:gap-8">
              <div className="relative grid place-items-center">
                <AllocationDonut />
                <div className="absolute text-center">
                  <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                    Invested
                  </p>
                  <p className="text-sm font-extrabold text-num">
                    {pctOf(PORTFOLIO_TOTAL - WALLET_TOTAL)}%
                  </p>
                </div>
              </div>

              <ul className="w-full flex-1 space-y-1">
                {ALLOCATION.map((slice, i) => (
                  <li key={slice.key} style={{ ["--d" as string]: `${i * 70}ms` }} className="k-rise">
                    <Link
                      to={slice.to}
                      className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-secondary/60"
                    >
                      <span
                        aria-hidden
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ background: slice.color }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-bold">{slice.label}</p>
                        <p className="truncate text-[11px] text-muted-foreground">{slice.note}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[13px] font-extrabold text-num">{mask(slice.value)}</p>
                        <p className="text-[11px] font-semibold text-muted-foreground">
                          {pctOf(slice.value)}%
                        </p>
                      </div>
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Active holdings */}
          <section className="mt-7">
            <div className="mb-3 flex items-center justify-between px-1">
              <h2 className="font-display text-base font-extrabold">Active holdings</h2>
              <span className="text-[11px] font-semibold text-muted-foreground">
                {HOLDINGS.length + EXPLORE_HOLDINGS.length + 1} items
              </span>
            </div>

            <ul className="space-y-3 md:grid md:grid-cols-2 md:gap-3 md:space-y-0">
              {/* Call account — brand card, matching the Home idle-cash design */}
              <li className="k-rise md:col-span-2">
                <section className="relative overflow-hidden rounded-xl bg-brand p-5 text-brand-foreground shadow-card md:p-6">
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-gold-gradient opacity-20 blur-2xl"
                  />
                  <div className="relative">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex size-7 items-center justify-center rounded-full bg-brand-foreground/10">
                        <Wallet className="size-3.5" strokeWidth={2.2} />
                      </span>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-foreground/70">
                        Call account
                      </p>
                    </div>

                    <div className="mt-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
                      <div className="min-w-0">
                        <p className="text-3xl font-extrabold tracking-tight text-num">
                          <AmountCounter
                            value={CALL_ACCOUNT.balance}
                            hidden={hidden}
                            mask={mask}
                          />
                        </p>
                        <p className="mt-1 text-xs text-brand-foreground/70">
                          Earning daily — withdraw anytime.
                        </p>
                      </div>
                      <p className="text-right text-xs text-brand-foreground/70">
                        Interest today
                        <span className="block text-lg font-extrabold text-gold text-num">
                          {mask(CALL_ACCOUNT.accruedToday)}
                        </span>
                      </p>
                    </div>

                    <div className="mt-4 h-px w-full bg-brand-foreground/12" />

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-[11px] text-brand-foreground/65">
                        {CALL_ACCOUNT.name} · {CALL_ACCOUNT.rate} · {CALL_ACCOUNT.liquidity}
                      </p>
                      <Link
                        to="/call-account"
                        className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gold-gradient px-5 py-3 text-xs font-bold text-brand press"
                      >
                        View account <ArrowUpRight className="size-3.5" />
                      </Link>
                    </div>
                  </div>
                </section>
              </li>


              {/* Fixed plans */}
              {HOLDINGS.map((h, i) => {
                const progress = Math.min(
                  100,
                  Math.max(6, Math.round(((h.totalDays - h.daysLeft) / h.totalDays) * 100)),
                );
                return (
                  <li
                    key={h.name}
                    style={{ ["--d" as string]: `${(i + 1) * 70}ms` }}
                    className="k-rise"
                  >
                    <Link
                      to="/portfolio/$holdingId"
                      params={{ holdingId: `f${i + 1}` }}
                      className="card-surface relative block overflow-hidden p-4 transition-shadow hover:shadow-md"
                    >
                    <span className="absolute inset-y-0 left-0 w-1 bg-gold" aria-hidden />
                    <div className="flex items-start justify-between gap-3 pl-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold">{h.name}</p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          Fixed plan · matures {h.date}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-extrabold text-num">{mask(h.amount)}</p>
                        <span className="mt-1 inline-flex rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-brand">
                          {h.rate}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 pl-2">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="k-fill h-full rounded-full bg-gold"
                          style={{ width: `${progress}%`, ["--d" as string]: "200ms" }}
                        />
                      </div>
                      <p className="mt-2 text-[11px] text-muted-foreground">
                        {h.daysLeft} days left · payout{" "}
                        <span className="font-bold text-foreground">{mask(h.expectedPayout)}</span>
                      </p>
                    </div>
                    </Link>
                  </li>
                );
              })}

              {/* Explore products */}
              {EXPLORE_HOLDINGS.map((h, i) => {
                const progress = Math.min(
                  100,
                  Math.max(6, Math.round(((h.totalDays - h.daysLeft) / h.totalDays) * 100)),
                );
                return (
                  <li
                    key={h.id}
                    style={{ ["--d" as string]: `${(i + 4) * 70}ms` }}
                    className="k-rise"
                  >
                    <Link
                      to="/portfolio/$holdingId"
                      params={{ holdingId: `e-${h.id}` }}
                      className="card-surface relative block overflow-hidden p-4 transition-shadow hover:shadow-md"
                    >
                      <span
                        className="absolute inset-y-0 left-0 w-1 bg-brand/55"
                        aria-hidden
                      />
                      <div className="flex items-start justify-between gap-3 pl-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold">{h.name}</p>
                          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                            {h.issuer}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-extrabold text-num">{mask(h.amount)}</p>
                          <span className="mt-1 inline-flex rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-brand">
                            {h.rate}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 pl-2">
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="k-fill h-full rounded-full bg-brand/60"
                            style={{ width: `${progress}%`, ["--d" as string]: "240ms" }}
                          />
                        </div>
                        <p className="mt-2 text-[11px] text-muted-foreground">
                          Matures {h.date} · payout{" "}
                          <span className="font-bold text-foreground">
                            {mask(h.expectedPayout)}
                          </span>
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Upcoming maturities */}
          <section className="mt-7">
            <div className="mb-3 flex items-center justify-between px-1">
              <h2 className="font-display text-base font-extrabold">Upcoming maturities</h2>
              <Link
                to="/portfolio/maturities"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand"
              >
                <CalendarClock className="size-3.5" /> Calendar
                <ChevronRight className="size-3.5" />
              </Link>
            </div>

            <ul className="card-surface divide-y divide-border/60 overflow-hidden">
              {UPCOMING_MATURITIES.map((m, i) => (
                <li
                  key={`${m.name}-${m.date}`}
                  style={{ ["--d" as string]: `${i * 60}ms` }}
                  className="k-rise"
                >
                  <Link
                    to="/portfolio/$holdingId"
                    params={{ holdingId: m.holdingId }}
                    className="flex items-center gap-3 px-4 py-3.5 press"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-secondary text-[11px] font-extrabold text-brand text-num">
                      {m.daysLeft}d
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-bold">{m.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {m.kind} · {m.date}
                      </p>
                    </div>
                    <p className="shrink-0 text-[13px] font-extrabold text-num">{mask(m.amount)}</p>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>



          {/* Records (MOB-123 / MOB-124) */}
          <section className="mt-7">
            <div className="mb-3 flex items-center justify-between px-1">
              <h2 className="font-display text-base font-extrabold">Records</h2>
              <span className="text-[11px] font-semibold text-muted-foreground">
                Statements &amp; activity
              </span>
            </div>

            <ul className="card-surface divide-y divide-border/60 overflow-hidden md:grid md:grid-cols-2 md:divide-y-0 md:gap-px md:bg-border/60">
              {(
                [
                  {
                    to: "/portfolio/history",
                    icon: History,
                    title: "Investment history",
                    sub: "Active, matured and closed",
                    meta: "12 records",
                  },
                  {
                    to: "/portfolio/transactions",
                    icon: Receipt,
                    title: "Transaction history",
                    sub: "Deposits, interest, withdrawals",
                    meta: "38 records",
                  },
                  {
                    to: "/gifts",
                    icon: Gift,
                    title: "Gift investments",
                    sub: "Sent, pending and claimed",
                    meta: "3 gifts",
                  },
                  {
                    to: "/reports",
                    icon: FileBarChart,
                    title: "Kipit reports",
                    sub: "Monthly, quarterly and annual",
                    meta: "PDF",
                  },
                ] as const
              ).map((item, i) => (
                <li
                  key={item.to}
                  style={{ ["--d" as string]: `${i * 60}ms` }}
                  className="k-rise md:bg-card"
                >
                  <Link
                    to={item.to}
                    className="group relative flex items-center gap-3.5 px-4 py-4 press transition-colors hover:bg-secondary/50"
                  >
                    <span
                      className="absolute inset-y-0 left-0 w-[3px] origin-center scale-y-0 bg-gold transition-transform duration-300 group-hover:scale-y-100"
                      aria-hidden
                    />
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand text-gold shadow-sm ring-1 ring-inset ring-gold/25 transition-transform duration-300 group-hover:scale-105">
                      <item.icon className="size-5" strokeWidth={2} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-bold tracking-tight">
                        {item.title}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                        {item.sub}
                      </p>
                    </div>
                    <span className="hidden shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-brand sm:inline-flex">
                      {item.meta}
                    </span>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-brand" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>


          <DisclosureStrip variant="marketplace" />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Desktop ─────────────────────────── */

const ALL_HOLDINGS = [
  ...HOLDINGS.map((h, i) => ({
    id: `f${i + 1}`,
    name: h.name,
    kind: "Fixed plan",
    rate: h.rate,
    amount: h.amount,
    payout: h.expectedPayout,
    date: h.date,
    daysLeft: h.daysLeft,
    totalDays: h.totalDays,
    accent: "bg-gold",
  })),
  ...EXPLORE_HOLDINGS.map((h) => ({
    id: `e-${h.id}`,
    name: h.name,
    kind: h.issuer,
    rate: h.rate,
    amount: h.amount,
    payout: h.expectedPayout,
    date: h.date,
    daysLeft: h.daysLeft,
    totalDays: h.totalDays,
    accent: "bg-brand/60",
  })),
];

const RECORDS = [
  {
    to: "/portfolio/history",
    icon: History,
    title: "Investment history",
    sub: "Active, matured and closed",
    meta: "12 records",
  },
  {
    to: "/portfolio/transactions",
    icon: Receipt,
    title: "Transaction history",
    sub: "Deposits, interest, withdrawals",
    meta: "38 records",
  },
  {
    to: "/gifts",
    icon: Gift,
    title: "Gift investments",
    sub: "Sent, pending and claimed",
    meta: "3 gifts",
  },
  {
    to: "/reports",
    icon: FileBarChart,
    title: "Kipit reports",
    sub: "Monthly, quarterly and annual",
    meta: "PDF",
  },
] as const;

function DesktopPortfolio() {
  const { hidden, mask, toggle } = useBalanceVisibility();
  const next = UPCOMING_MATURITIES[0];

  return (
    <div className="hidden pb-4 md:block">
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)]">
        {/* Left column */}
        <div className="grid min-w-0 grid-cols-1 gap-4">
          {/* Hero */}
          <section className="relative overflow-hidden rounded-2xl bg-brand-gradient px-8 py-7 text-primary-foreground shadow-float">
            <span
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-28 size-72 rounded-full bg-gold/25 blur-3xl"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute -left-24 bottom-[-6rem] size-72 rounded-full bg-white/10 blur-3xl"
            />
            <div className="relative flex flex-wrap items-end justify-between gap-6">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary-foreground/60">
                  Portfolio total
                </p>
                <div className="mt-3 flex items-end gap-3">
                  <AmountCounter
                    value={PORTFOLIO_TOTAL}
                    hidden={hidden}
                    mask={mask}
                    className="font-display text-[48px] font-extrabold leading-none tracking-[-0.045em] text-num"
                  />
                  <button
                    type="button"
                    onClick={toggle}
                    aria-label={hidden ? "Show balances" : "Hide balances"}
                    className="mb-1.5 grid size-9 shrink-0 place-items-center rounded-full border border-white/25 bg-white/10 press hover:bg-white/20"
                  >
                    {hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gold/20 px-3 py-1.5 text-[11px] font-extrabold text-gold">
                    <ArrowUpRight className="size-3.5" strokeWidth={2.6} />
                    {mask(PORTFOLIO_MONTH_CHANGE)} · {PORTFOLIO_MONTH_CHANGE_PCT}%
                  </span>
                  <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-primary-foreground/75">
                    past 30 days
                  </span>
                  <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-primary-foreground/75">
                    Interest earned {mask(INTEREST_EARNED_YTD)}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <Link
                  to="/fixed-plans/create"
                  className="inline-flex items-center gap-1.5 rounded-full bg-gold-gradient px-5 py-2.5 text-xs font-extrabold text-gold-foreground press"
                >
                  New plan <ArrowUpRight className="size-3.5" />
                </Link>
                <Link
                  to="/portfolio/maturities"
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-xs font-bold press hover:bg-white/20"
                >
                  <CalendarClock className="size-3.5" /> Calendar
                </Link>
              </div>
            </div>
          </section>

          {/* Active holdings table */}
          <section className="card-surface p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-base font-extrabold">Active holdings</h2>
              <span className="text-[11px] font-semibold text-muted-foreground">
                {ALL_HOLDINGS.length + 1} items
              </span>
            </div>

            {/* Call account row */}
            <Link
              to="/call-account"
              className="mt-4 flex items-center gap-4 rounded-xl bg-brand px-5 py-4 text-brand-foreground transition-transform press hover:-translate-y-0.5"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-foreground/10 text-gold">
                <Wallet className="size-5" strokeWidth={2.2} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-bold">{CALL_ACCOUNT.name}</p>
                <p className="text-[11px] text-brand-foreground/70">
                  {CALL_ACCOUNT.rate} · {CALL_ACCOUNT.liquidity} · earned today{" "}
                  {mask(CALL_ACCOUNT.accruedToday)}
                </p>
              </div>
              <p className="shrink-0 text-[17px] font-extrabold text-num">
                {mask(CALL_ACCOUNT.balance)}
              </p>
              <ChevronRight className="size-4 shrink-0 text-brand-foreground/60" />
            </Link>

            <div className="mt-4 overflow-hidden rounded-xl border border-border/60">
              <table className="w-full table-fixed text-left">
                <thead className="bg-secondary/60">
                  <tr className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    <th className="w-[30%] px-3 py-2.5">Holding</th>
                    <th className="w-[13%] px-3 py-2.5">Rate</th>
                    <th className="w-[22%] px-3 py-2.5">Progress</th>
                    <th className="w-[15%] px-3 py-2.5">Matures</th>
                    <th className="w-[20%] px-3 py-2.5 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {ALL_HOLDINGS.map((h) => {
                    const progress = Math.min(
                      100,
                      Math.max(6, Math.round(((h.totalDays - h.daysLeft) / h.totalDays) * 100)),
                    );
                    return (
                      <tr
                        key={h.id}
                        className="cursor-pointer transition-colors hover:bg-secondary/50"
                      >
                        <td className="px-3 py-3">
                          <Link
                            to="/portfolio/$holdingId"
                            params={{ holdingId: h.id }}
                            className="block"
                          >
                            <p className="truncate text-[13px] font-bold">{h.name}</p>
                            <p className="truncate text-[11px] text-muted-foreground">{h.kind}</p>
                          </Link>
                        </td>
                        <td className="px-3 py-3">
                          <span className="inline-flex rounded-full bg-accent/15 px-2 py-0.5 text-[10.5px] font-bold text-brand">
                            {h.rate}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className={`h-full rounded-full ${h.accent}`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <p className="mt-1.5 text-[10.5px] text-muted-foreground">
                            {h.daysLeft} days left
                          </p>
                        </td>
                        <td className="px-3 py-3 text-[12px] text-muted-foreground">{h.date}</td>
                        <td className="px-3 py-3 text-right">
                          <p className="whitespace-nowrap text-[13px] font-extrabold text-num">{mask(h.amount)}</p>
                          <p className="whitespace-nowrap text-[10.5px] text-muted-foreground">
                            payout {mask(h.payout)}
                          </p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Records */}
          <section className="card-surface p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-base font-extrabold">Records</h2>
              <span className="text-[11px] font-semibold text-muted-foreground">
                Statements &amp; activity
              </span>
            </div>
            <ul className="mt-4 grid gap-3 xl:grid-cols-2">
              {RECORDS.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="group flex items-center gap-3.5 rounded-xl border border-border/60 px-4 py-3.5 transition-colors hover:border-gold/40 hover:bg-secondary/50"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand text-gold ring-1 ring-inset ring-gold/25 transition-transform duration-300 group-hover:scale-105">
                      <item.icon className="size-5" strokeWidth={2} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-bold">{item.title}</p>
                      <p className="truncate text-[11px] text-muted-foreground">{item.sub}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-brand">
                      {item.meta}
                    </span>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Right column */}
        <div className="grid min-w-0 grid-cols-1 gap-4">
          {/* Allocation */}
          <section className="card-surface p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-base font-extrabold">Allocation</h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                <PieChart className="size-3.5" /> 4 buckets
              </span>
            </div>

            <div className="mt-5 grid place-items-center">
              <div className="relative grid place-items-center">
                <AllocationDonut size={176} />
                <div className="absolute text-center">
                  <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                    Invested
                  </p>
                  <p className="text-base font-extrabold text-num">
                    {pctOf(PORTFOLIO_TOTAL - WALLET_TOTAL)}%
                  </p>
                </div>
              </div>
            </div>

            <ul className="mt-5 space-y-1">
              {ALLOCATION.map((slice) => (
                <li key={slice.key}>
                  <Link
                    to={slice.to}
                    className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-secondary/60"
                  >
                    <span
                      aria-hidden
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ background: slice.color }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12.5px] font-bold">{slice.label}</p>
                      <p className="truncate text-[11px] text-muted-foreground">{slice.note}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[12.5px] font-extrabold text-num">{mask(slice.value)}</p>
                      <p className="text-[10.5px] font-semibold text-muted-foreground">
                        {pctOf(slice.value)}%
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* Upcoming maturities */}
          <section className="card-surface p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-base font-extrabold">Upcoming maturities</h2>
              <Link
                to="/portfolio/maturities"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand"
              >
                Calendar <ChevronRight className="size-3.5" />
              </Link>
            </div>
            {next && (
              <div className="mt-4 rounded-xl bg-secondary/60 px-4 py-3.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  Next up
                </p>
                <p className="mt-1 truncate text-[13.5px] font-bold">{next.name}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {next.daysLeft} days · {next.date} · {mask(next.amount)}
                </p>
              </div>
            )}
            <ul className="mt-3 divide-y divide-border/60">
              {UPCOMING_MATURITIES.slice(1, 5).map((m) => (
                <li key={`${m.name}-${m.date}`}>
                  <Link
                    to="/portfolio/$holdingId"
                    params={{ holdingId: m.holdingId }}
                    className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-secondary/50"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-secondary text-[11px] font-extrabold text-brand text-num">
                      {m.daysLeft}d
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12.5px] font-bold">{m.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {m.kind} · {m.date}
                      </p>
                    </div>
                    <p className="shrink-0 text-[12.5px] font-extrabold text-num">{mask(m.amount)}</p>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

