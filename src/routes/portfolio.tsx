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
  const { hidden, mask, toggle } = useBalanceVisibility();
  const next = UPCOMING_MATURITIES[0];

  return (
    <AppShell title="Portfolio" navVariant="elevated">
      <div className="pb-2">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-14 pt-9 text-primary-foreground md:mx-auto md:max-w-[1200px] md:rounded-xl md:px-8 md:pb-14 md:pt-12 md:shadow-float">
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
        <div className="relative -mx-4 -mt-8 rounded-t-[2rem] bg-background px-4 pt-5 md:mx-auto md:mt-6 md:max-w-[1200px] md:rounded-none md:bg-transparent md:px-0 md:pt-0">
          <span
            aria-hidden
            className="mx-auto mb-4 block h-1 w-10 rounded-full bg-border md:hidden"
          />

          <div className="lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start lg:gap-6">
          <div className="min-w-0">
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
          </div>

          <aside className="min-w-0 lg:sticky lg:top-6">
          {/* Upcoming maturities */}
          <section className="mt-7 lg:mt-0">

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
                  className="k-rise flex items-center gap-3 px-4 py-3.5"
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

            <ul className="card-surface divide-y divide-border/60 overflow-hidden md:grid md:grid-cols-2 md:divide-y-0 md:gap-px md:bg-border/60 lg:grid-cols-1 lg:gap-0 lg:divide-y">
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
          </aside>
          </div>

          <DisclosureStrip variant="marketplace" />

        </div>
      </div>
    </AppShell>
  );
}
