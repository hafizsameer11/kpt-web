import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowUpRight,
  Bell,
  ChevronRight,
  Eye,
  EyeOff,
  Lightbulb,
  Wallet,
} from "lucide-react";
import { useWalletBalance } from "@/lib/wallet-balance";
import { AppShell } from "@/components/kipit/AppShell";
import { Logo } from "@/components/kipit/Logo";
import { NewUserEmptyState } from "@/components/kipit/NewUserEmptyState";
import { ForYouFeature } from "@/components/kipit/ForYouVariants";
import { useBalanceVisibility, useIsNewUser } from "@/hooks/useBalanceVisibility";
import { GreetingText } from "@/components/kipit/SpecBlocks";
import { AmountCounter } from "@/components/kipit/motion";
import {
  HOLDINGS,
  INVESTED,
  MONTH_CHANGE,
  MONTH_CHANGE_PCT,
  NEXT_MATURITY,
  PAYOUTS,
  QUICK_ACTIONS,
  WEEK_EARNINGS,
  WEEK_LABELS,
  WEEK_SERIES,
  naira,
} from "@/lib/home-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kipit — Invest with clarity" },
      {
        name: "description",
        content:
          "A mobile-first Kipit home: immersive balance canvas, wallet and invested switch, stacked plan cards, maturity countdown, weekly interest and payout timeline.",
      },
      { property: "og:title", content: "Kipit — Invest with clarity" },
      {
        property: "og:description",
        content:
          "Immersive mobile home for Kipit: balances, plans, maturities, payouts and insights in one thumb-friendly screen.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomeV2Screen,
});

const lenses = (wallet: number) =>
  [
    {
      key: "total",
      label: "Total",
      value: wallet + INVESTED,
      note: "Wallet + all active plans",
    },
    {
      key: "invested",
      label: "Invested",
      value: INVESTED,
      note: "Across 3 active plans",
    },
    { key: "wallet", label: "Wallet", value: wallet, note: "Available to invest now" },
  ] as const;

type LensKey = ReturnType<typeof lenses>[number]["key"];

function WeekStrip() {
  const max = Math.max(...WEEK_SERIES);
  const min = Math.min(...WEEK_SERIES);
  return (
    <div className="flex h-14 items-end justify-between gap-1">
      {WEEK_SERIES.map((v, i) => {
        const peak = v === max;
        const pct = 18 + ((v - min) / Math.max(max - min, 1)) * 82;
        return (
          <div key={WEEK_LABELS[i]} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
            <div
              className={`k-grow w-1 rounded-full ${
                peak ? "bg-gold" : "bg-brand/20"
              }`}
              style={{ height: `${pct}%`, ["--d" as string]: `${i * 70}ms` }}
            />
            <span
              className={`text-[9px] font-semibold ${peak ? "text-foreground" : "text-muted-foreground/70"}`}
            >
              {WEEK_LABELS[i]?.slice(0, 1)}
            </span>
          </div>
        );
      })}
    </div>
  );
}


function HomeV2Screen() {
  const isNewUser = useIsNewUser();

  return (
    <AppShell title="Home" navVariant="elevated">
      {isNewUser ? (
        <div className="pt-5">
          <NewUserEmptyState />
        </div>
      ) : (
        <>
          <DesktopHome />
          <MobileHome />
        </>
      )}
    </AppShell>
  );
}

function MobileHome() {
  const WALLET = useWalletBalance();
  const LENSES = lenses(WALLET);
  const { hidden, toggle, mask } = useBalanceVisibility();
  const [lens, setLens] = useState<LensKey>("total");
  const active = LENSES.find((l) => l.key === lens) ?? LENSES[0];

  return (
    <div className="md:hidden">
        <div className="pb-2">
          {/* ── Immersive navy canvas (full-bleed on mobile) ───────────── */}
          <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-14 pt-5 text-primary-foreground md:mx-0 md:rounded-xl md:px-8 md:pb-10 md:pt-8 md:shadow-float">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-gold/25 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -left-24 bottom-0 size-56 rounded-full bg-white/10 blur-3xl"
            />

            <header className="relative flex items-center justify-between gap-3 md:hidden">
              <div className="min-w-0">
                <Logo tone="light" className="font-display text-xl" />
                <p className="mt-1 truncate text-[11px] text-primary-foreground/70">
                  <GreetingText />, Adaeze
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2.5">

                <Link
                  to="/notifications"
                  aria-label="Notifications"
                  className="relative grid size-10 place-items-center rounded-full border border-white/20 bg-white/10 press"
                >
                  <Bell className="size-[18px]" strokeWidth={1.8} />
                  <span className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-gold" />
                </Link>
                <Link
                  to="/settings"
                  aria-label="Profile"
                  className="grid size-10 place-items-center rounded-full bg-white/15 text-xs font-bold press"
                >
                  AO
                </Link>
              </div>
            </header>

            <div className="relative md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] md:items-end md:gap-10">
              <div className="min-w-0">
                {/* Lens switcher — one balance surface, three views */}
                <div className="mt-5 inline-flex rounded-full border border-white/15 bg-white/10 p-1 md:mt-0">
                  {LENSES.map((l) => (
                    <button
                      key={l.key}
                      type="button"
                      onClick={() => setLens(l.key)}
                      className={`rounded-full px-3.5 py-1.5 text-[11px] font-bold transition-colors ${
                        lens === l.key
                          ? "bg-surface text-brand"
                          : "text-primary-foreground/70"
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>

                <div className="mt-4 flex items-end gap-3">
                  <AmountCounter
                    value={active.value}
                    hidden={hidden}
                    mask={mask}
                    className="font-display text-[40px] font-extrabold leading-none tracking-[-0.045em] text-num md:text-[56px]"
                  />
                  <button
                    type="button"
                    onClick={toggle}
                    aria-label={hidden ? "Show balances" : "Hide balances"}
                    className="mb-1 grid size-8 shrink-0 place-items-center rounded-full border border-white/25 bg-white/10 press"
                  >
                    {hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <p className="mt-2 text-[11px] text-primary-foreground/70">{active.note}</p>
                <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-gold/20 px-3 py-1 text-[11px] font-bold text-gold">
                  <ArrowUpRight className="size-3.5" /> +{naira(WEEK_EARNINGS)} interest this week
                </p>

                {/* Desktop-only split of balances */}
                <dl className="mt-6 hidden gap-3 md:grid md:grid-cols-2">
                  {LENSES.filter((l) => l.key !== "total").map((l) => (
                    <div
                      key={l.key}
                      className="rounded-xl border border-white/15 bg-white/5 px-4 py-3"
                    >
                      <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary-foreground/60">
                        {l.label}
                      </dt>
                      <dd className="mt-1 text-lg font-extrabold text-num">
                        <AmountCounter value={l.value} hidden={hidden} mask={mask} />
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Quick actions — thumb row on mobile, panel on desktop */}
              <div className="mt-6 grid grid-cols-4 gap-2 md:mt-0 md:grid-cols-2 md:gap-3 md:rounded-xl md:border md:border-white/15 md:bg-white/5 md:p-4">
                {QUICK_ACTIONS.map((a, i) => (
                  <Link
                    key={a.label}
                    to={a.to}
                    style={{ ["--d" as string]: `${120 + i * 70}ms` }}
                    className="k-rise flex flex-col items-center gap-2 rounded-xl py-1 text-[10px] font-semibold text-primary-foreground/85 press md:flex-row md:gap-3 md:rounded-xl md:bg-white/5 md:px-3 md:py-3 md:text-xs md:hover:bg-white/10"
                  >
                    <span className="grid size-12 place-items-center rounded-xl border border-white/15 bg-white/10 md:size-9">
                      <a.icon className="size-5 md:size-4" strokeWidth={1.9} />
                    </span>
                    <span className="text-center leading-tight md:text-left">{a.label}</span>
                  </Link>
                ))}
              </div>
            </div>

          </section>

          {/* ── Sheet that slides over the canvas ──────────────────────── */}
          <div className="relative -mx-4 -mt-8 rounded-t-[2rem] bg-background px-4 pt-5 md:mx-0 md:mt-6 md:rounded-none md:bg-transparent md:px-0 md:pt-0">
            <span
              aria-hidden
              className="mx-auto mb-4 block h-1 w-10 rounded-full bg-border md:hidden"
            />

            <div className="grid gap-3 md:gap-4 lg:grid-cols-3">
              {/* Maturity countdown */}
              <Link
                to="/portfolio/$holdingId"
                params={{ holdingId: "f1" }}
                className="card-surface block p-4 press md:p-6 lg:col-span-2"
              >
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                      Next maturity
                    </p>
                    <h2 className="mt-1.5 truncate font-display text-lg font-extrabold">
                      {NEXT_MATURITY.name}
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {NEXT_MATURITY.tenor} · {NEXT_MATURITY.rate} · matures {NEXT_MATURITY.date}
                    </p>
                  </div>
                  <div className="shrink-0 rounded-xl bg-brand px-3 py-2 text-center text-brand-foreground">
                    <p className="text-lg font-extrabold leading-none text-num">
                      {NEXT_MATURITY.daysLeft}
                    </p>
                    <p className="text-[9px] font-semibold uppercase tracking-wider opacity-75">
                      days
                    </p>
                  </div>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="k-fill h-full rounded-full bg-gold-gradient"
                    style={{
                      width: `${Math.round(
                        ((NEXT_MATURITY.totalDays - NEXT_MATURITY.daysLeft) /
                          NEXT_MATURITY.totalDays) *
                          100,
                      )}%`,
                    }}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Principal {mask(NEXT_MATURITY.amount)}</span>
                  <span className="font-bold">
                    Payout {mask(NEXT_MATURITY.expectedPayout)}
                  </span>
                </div>
              </Link>

              {/* Weekly interest */}
              <Link to="/call-account" className="card-surface block p-4 press md:p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Interest this week
                </p>
                <p className="mt-1.5 font-display text-2xl font-extrabold text-num">
                  {mask(WEEK_EARNINGS)}
                </p>
                <div className="mt-4">
                  <WeekStrip />
                </div>
              </Link>
            </div>

            {/* Stacked plan cards */}
            <section className="mt-5">
              <div className="mb-2.5 flex items-center justify-between">
                <h2 className="font-display text-base font-extrabold">Your plans</h2>
                <Link
                  to="/portfolio"
                  className="inline-flex items-center gap-0.5 text-xs font-bold text-brand"
                >
                  All plans <ChevronRight className="size-3.5" />
                </Link>
              </div>
              <div className="grid gap-2.5 md:grid-cols-3 md:gap-4">
                {HOLDINGS.map((h, i) => {
                  const progress = Math.round(
                    ((h.totalDays - h.daysLeft) / h.totalDays) * 100,
                  );
                  const rail = i === 0 ? "bg-gold" : i === 1 ? "bg-brand" : "bg-teal";
                  return (
                    <Link
                      key={h.name}
                      to="/portfolio/$holdingId"
                      params={{ holdingId: `f${i + 1}` }}
                      style={{ ["--d" as string]: `${150 + i * 90}ms` }}
                      className="k-rise card-surface flex items-center gap-3 p-4 press md:block md:p-5 md:transition-all md:hover:-translate-y-0.5 md:hover:shadow-float"
                    >
                      <span
                        className={`h-11 w-1.5 shrink-0 rounded-full md:mb-3 md:h-1.5 md:w-12 ${rail}`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold md:text-base">{h.name}</p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground md:hidden">
                          {h.rate} · {h.daysLeft} days left · {h.date}
                        </p>
                        <div className="mt-1 hidden items-center gap-2 md:flex">
                          <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-foreground">
                            {h.rate}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {h.daysLeft} days left
                          </span>
                        </div>
                        <p className="mt-3 hidden font-display text-xl font-extrabold text-num md:block">
                          {mask(h.amount)}
                        </p>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary md:mt-3">
                          <div
                            className={`k-fill h-full rounded-full ${i === 0 ? "bg-gold-gradient" : "bg-brand"}`}
                            style={{ width: `${progress}%`, ["--d" as string]: `${250 + i * 90}ms` }}
                          />
                        </div>
                        <div className="mt-2 hidden items-center justify-between text-[11px] md:flex">
                          <span className="text-muted-foreground">{progress}% complete</span>
                          <span className="font-semibold">Matures {h.date}</span>
                        </div>
                      </div>
                      <p className="shrink-0 text-sm font-extrabold text-num md:hidden">
                        {mask(h.amount)}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* Idle wallet nudge + payout timeline */}
            <div className="mt-5 grid gap-3 md:gap-4 lg:grid-cols-3 lg:items-start">
            <section className="relative overflow-hidden rounded-xl bg-brand p-5 text-brand-foreground shadow-card md:p-6 lg:col-span-2">

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
                    Idle cash
                  </p>
                </div>

                <div className="mt-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
                  <div className="min-w-0">
                    <p className="text-3xl font-extrabold tracking-tight text-num">
                      <AmountCounter value={WALLET} hidden={hidden} mask={mask} />
                    </p>
                    <p className="mt-1 text-xs text-brand-foreground/70">
                      Sitting idle — earning nothing today.
                    </p>
                  </div>
                  <p className="text-right text-xs text-brand-foreground/70">
                    Could earn{" "}
                    <span className="block text-lg font-extrabold text-gold text-num">₦8,958</span>
                    per month
                  </p>
                </div>

                <div className="mt-4 h-px w-full bg-brand-foreground/12" />

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[11px] text-brand-foreground/65">
                    Kipit Vault · 21.5% p.a. · 365-day tenor
                  </p>
                  <Link
                    to="/invest"
                    className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gold-gradient px-5 py-3 text-xs font-bold text-brand press"
                  >
                    Invest wallet <ArrowUpRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            </section>

            {/* Payout timeline */}
            <section className="card-surface mt-3 p-4 md:p-6 lg:mt-0">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base font-extrabold">Coming up</h2>
                <Link
                  to="/portfolio/maturities"
                  className="inline-flex items-center gap-0.5 text-xs font-bold text-brand"
                >
                  Calendar <ChevronRight className="size-3.5" />
                </Link>
              </div>
              <ol className="mt-3.5 space-y-3.5">
                {PAYOUTS.map((p, i) => (
                  <li
                    key={p.label}
                    style={{ ["--d" as string]: `${i * 90}ms` }}
                    className={`k-rise relative grid grid-cols-[auto_minmax(0,1fr)_auto] gap-3 ${
                      i === 3 ? "lg:hidden" : ""
                    }`}
                  >
                    <span className="relative flex w-3 justify-center">
                      <span
                        className={`z-10 mt-1.5 size-2.5 rounded-full ring-4 ring-surface ${
                          i === 0 ? "bg-gold k-glow" : "bg-brand/30"
                        }`}
                      />
                      {i < PAYOUTS.length - 1 && (
                        <span className="absolute top-3 h-full w-px bg-border" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{p.label}</p>
                      <p className="text-[11px] text-muted-foreground">{p.date}</p>
                    </div>
                    <p className="shrink-0 text-sm font-bold text-num">{mask(p.amount)}</p>
                  </li>
                ))}
              </ol>
            </section>
            </div>




            {/* For you */}
            <ForYouFeature className="mt-5" />

          </div>
        </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Desktop dashboard — a distinct layout from the mobile app view.
   ───────────────────────────────────────────────────────────── */

function DesktopWeekChart({ hidden }: { hidden: boolean }) {
  const max = Math.max(...WEEK_SERIES);
  const min = Math.min(...WEEK_SERIES);
  return (
    <div className="flex h-36 items-end justify-between gap-2">
      {WEEK_SERIES.map((v, i) => {
        const peak = v === max;
        const pct = 22 + ((v - min) / Math.max(max - min, 1)) * 78;
        return (
          <div key={WEEK_LABELS[i]} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
            <span className="text-[10px] font-bold text-muted-foreground">
              {hidden ? "••" : `₦${(v / 1000).toFixed(1)}k`}
            </span>
            <div
              className={`k-grow w-full rounded-t-lg ${peak ? "bg-gold-gradient" : "bg-brand/15"}`}
              style={{ height: `${pct}%`, ["--d" as string]: `${i * 70}ms` }}
            />
            <span
              className={`text-[10px] font-semibold ${peak ? "text-foreground" : "text-muted-foreground/70"}`}
            >
              {WEEK_LABELS[i]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function DesktopHome() {
  const WALLET = useWalletBalance();
  const TOTAL = WALLET + INVESTED;
  const { hidden, toggle, mask } = useBalanceVisibility();
  const investedPct = Math.round((INVESTED / TOTAL) * 100);

  return (
    <div className="hidden pb-4 md:block">
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.9fr)_minmax(18rem,1fr)]">
        <div className="grid min-w-0 gap-2">
        <section className="relative overflow-hidden rounded-2xl bg-brand-gradient px-8 pt-6 pb-4 text-primary-foreground shadow-float">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-28 size-72 rounded-full bg-gold/25 blur-3xl"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -left-24 bottom-[-6rem] size-72 rounded-full bg-white/10 blur-3xl"
          />
          <div className="relative">
            <div className="flex items-start justify-between gap-6">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary-foreground/60">
                  Total portfolio value
                </p>
                <div className="mt-3 flex items-end gap-3">
                  <AmountCounter
                    value={TOTAL}
                    hidden={hidden}
                    mask={mask}
                    className="font-display text-[52px] font-extrabold leading-none tracking-[-0.045em] text-num"
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
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/20 px-3 py-1.5 text-[11px] font-bold text-gold">
                    <ArrowUpRight className="size-3.5" /> +{naira(WEEK_EARNINGS)} this week
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-primary-foreground/75">
                    +{naira(MONTH_CHANGE)} ({MONTH_CHANGE_PCT}%) this month
                  </span>
                </div>
              </div>
              <Link
                to="/portfolio"
                className="hidden shrink-0 items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold press hover:bg-white/20 lg:inline-flex"
              >
                View portfolio <ChevronRight className="size-3.5" />
              </Link>
            </div>

            {/* Allocation bar */}
            <div className="mt-6">
              <div className="flex h-2.5 overflow-hidden rounded-full bg-white/15">
                <span
                  className="k-fill h-full rounded-full bg-gold-gradient"
                  style={{ width: `${investedPct}%` }}
                />
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-white/15 bg-white/5 px-4 py-3">
                  <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary-foreground/60">
                    Invested · {investedPct}%
                  </dt>
                  <dd className="mt-1 text-xl font-extrabold text-num">
                    <AmountCounter value={INVESTED} hidden={hidden} mask={mask} />
                  </dd>
                  <dd className="mt-0.5 text-[11px] text-primary-foreground/60">
                    Across {HOLDINGS.length} active plans
                  </dd>
                </div>
                <div className="rounded-xl border border-white/15 bg-white/5 px-4 py-3">
                  <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary-foreground/60">
                    Wallet · {100 - investedPct}%
                  </dt>
                  <dd className="mt-1 text-xl font-extrabold text-num">
                    <AmountCounter value={WALLET} hidden={hidden} mask={mask} />
                  </dd>
                  <dd className="mt-0.5 text-[11px] text-primary-foreground/60">
                    Available to invest now
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        {/* Interest follows the hero independently of the right column height. */}
        <section className="card-surface p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Interest this week
              </p>
              <p className="mt-1.5 font-display text-2xl font-extrabold text-num">
                {mask(WEEK_EARNINGS)}
              </p>
            </div>
            <Link
              to="/call-account"
              className="inline-flex items-center gap-0.5 text-xs font-bold text-brand"
            >
              Details <ChevronRight className="size-3.5" />
            </Link>
          </div>
          <div className="mt-4">
            <DesktopWeekChart hidden={hidden} />
          </div>
        </section>
        </div>

        {/* Quick actions + idle cash + next maturity */}
        <div className="grid min-w-0 gap-4">
          <section className="card-surface p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Quick actions
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {QUICK_ACTIONS.map((a, i) => (
                <Link
                  key={a.label}
                  to={a.to}
                  style={{ ["--d" as string]: `${100 + i * 60}ms` }}
                  className="k-rise flex items-center gap-3 rounded-xl border border-border bg-secondary/40 px-3.5 py-3 text-xs font-bold press hover:border-brand/30 hover:bg-secondary"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand text-brand-foreground">
                    <a.icon className="size-4" strokeWidth={1.9} />
                  </span>
                  <span className="min-w-0 truncate">{a.label}</span>
                </Link>
              ))}
            </div>
          </section>

          <section className="relative overflow-hidden rounded-2xl bg-brand p-5 text-brand-foreground shadow-card">
            <span
              aria-hidden
              className="pointer-events-none absolute -right-14 -top-16 size-48 rounded-full bg-gold-gradient opacity-20 blur-2xl"
            />
            <div className="relative">
              <div className="flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded-full bg-brand-foreground/10">
                  <Wallet className="size-3.5" strokeWidth={2.2} />
                </span>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-foreground/70">
                  Idle cash
                </p>
              </div>
              <p className="mt-3 text-2xl font-extrabold tracking-tight text-num">
                <AmountCounter value={WALLET} hidden={hidden} mask={mask} />
              </p>
              <p className="mt-1 text-[11px] text-brand-foreground/70">
                Could earn <span className="font-bold text-gold">₦8,958</span> a month in Kipit
                Vault · 21.5% p.a.
              </p>
              <Link
                to="/invest"
                className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-gold-gradient px-5 py-2.5 text-xs font-bold text-brand press hover:opacity-95"
              >
                Invest wallet <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
          </section>
        <Link
          to="/portfolio/$holdingId"
          params={{ holdingId: "f1" }}
          className="card-surface block p-6 press hover:-translate-y-0.5 hover:shadow-float"
        >
          <div className="flex items-start justify-between gap-5">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Next maturity
              </p>
              <h2 className="mt-1.5 truncate font-display text-xl font-extrabold">
                {NEXT_MATURITY.name}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {NEXT_MATURITY.tenor} · {NEXT_MATURITY.rate} · matures {NEXT_MATURITY.date}
              </p>
            </div>
            <div className="shrink-0 rounded-xl bg-brand px-4 py-2.5 text-center text-brand-foreground">
              <p className="text-xl font-extrabold leading-none text-num">
                {NEXT_MATURITY.daysLeft}
              </p>
              <p className="text-[9px] font-semibold uppercase tracking-wider opacity-75">days</p>
            </div>
          </div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className="k-fill h-full rounded-full bg-gold-gradient"
              style={{
                width: `${Math.round(
                  ((NEXT_MATURITY.totalDays - NEXT_MATURITY.daysLeft) /
                    NEXT_MATURITY.totalDays) *
                    100,
                )}%`,
              }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              Principal {mask(NEXT_MATURITY.amount)}
            </span>
            <span className="font-bold">Payout {mask(NEXT_MATURITY.expectedPayout)}</span>
          </div>
        </Link>
        </div>
      </div>

      {/* Row 3 — plans table + payout timeline */}
      <div className="mt-2 grid gap-4 xl:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)]">
        <section className="card-surface overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="font-display text-base font-extrabold">Your plans</h2>
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-0.5 text-xs font-bold text-brand"
            >
              All plans <ChevronRight className="size-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)_7rem_9rem_8rem] gap-4 border-b border-border bg-secondary/40 px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            <span>Plan</span>
            <span>Rate</span>
            <span>Progress</span>
            <span className="text-right">Principal</span>
          </div>
          <ul>
            {HOLDINGS.map((h, i) => {
              const progress = Math.round(((h.totalDays - h.daysLeft) / h.totalDays) * 100);
              const rail = i === 0 ? "bg-gold" : i === 1 ? "bg-brand" : "bg-teal";
              return (
                <li key={h.name} className="border-b border-border last:border-0">
                  <Link
                    to="/portfolio/$holdingId"
                    params={{ holdingId: `f${i + 1}` }}
                    className="grid grid-cols-[minmax(0,1fr)_7rem_9rem_8rem] items-center gap-4 px-6 py-4 press hover:bg-secondary/50"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className={`h-9 w-1.5 shrink-0 rounded-full ${rail}`} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold">{h.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          Matures {h.date} · {h.daysLeft} days left
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-secondary px-2 py-1 text-center text-[11px] font-bold">
                      {h.rate}
                    </span>
                    <div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                        <div
                          className={`k-fill h-full rounded-full ${i === 0 ? "bg-gold-gradient" : "bg-brand"}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="mt-1.5 text-[10px] text-muted-foreground">{progress}% complete</p>
                    </div>
                    <p className="text-right text-sm font-extrabold text-num">{mask(h.amount)}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="card-surface p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-extrabold">Coming up</h2>
            <Link
              to="/portfolio/maturities"
              className="inline-flex items-center gap-0.5 text-xs font-bold text-brand"
            >
              Calendar <ChevronRight className="size-3.5" />
            </Link>
          </div>
          <ol className="mt-4 space-y-4">
            {PAYOUTS.map((p, i) => (
              <li
                key={p.label}
                style={{ ["--d" as string]: `${i * 80}ms` }}
                className="k-rise relative grid grid-cols-[auto_minmax(0,1fr)_auto] gap-3"
              >
                <span className="relative flex w-3 justify-center">
                  <span
                    className={`z-10 mt-1.5 size-2.5 rounded-full ring-4 ring-surface ${
                      i === 0 ? "bg-gold k-glow" : "bg-brand/30"
                    }`}
                  />
                  {i < PAYOUTS.length - 1 && (
                    <span className="absolute top-3 h-full w-px bg-border" />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{p.label}</p>
                  <p className="text-[11px] text-muted-foreground">{p.date}</p>
                </div>
                <p className="shrink-0 text-sm font-bold text-num">{mask(p.amount)}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <ForYouFeature className="mt-3" />
    </div>
  );
}
