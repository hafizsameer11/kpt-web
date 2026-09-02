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

export const Route = createFileRoute("/home-v2")({
  head: () => ({
    meta: [
      { title: "Kipit Home 2 — Mobile Wealth Canvas" },
      {
        name: "description",
        content:
          "A mobile-first Kipit home: immersive balance canvas, wallet and invested switch, stacked plan cards, maturity countdown, weekly interest and payout timeline.",
      },
      { property: "og:title", content: "Kipit Home 2 — Mobile Wealth Canvas" },
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

const LENSES = [
  { key: "total", label: "Total", value: TOTAL, note: "Wallet + all active plans" },
  { key: "invested", label: "Invested", value: INVESTED, note: "Across 3 active plans" },
  { key: "wallet", label: "Wallet", value: WALLET, note: "Available to invest now" },
] as const;

type LensKey = (typeof LENSES)[number]["key"];

function WeekStrip() {
  const max = Math.max(...WEEK_SERIES);
  const min = Math.min(...WEEK_SERIES);
  return (
    <div className="flex h-24 items-end gap-1.5">
      {WEEK_SERIES.map((v, i) => {
        const peak = v === max;
        const pct = 22 + ((v - min) / Math.max(max - min, 1)) * 78;
        return (
          <div key={WEEK_LABELS[i]} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
            <span
              className={`text-[9px] font-bold ${peak ? "text-brand" : "text-transparent"}`}
            >
              {naira(v)}
            </span>
            <div
              className={`w-full rounded-t-lg rounded-b-sm ${
                peak ? "bg-gold-gradient" : "bg-brand/15"
              }`}
              style={{ height: `${pct}%` }}
            />
            <span
              className={`text-[9px] font-semibold ${peak ? "text-foreground" : "text-muted-foreground"}`}
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
  const { hidden, toggle, mask } = useBalanceVisibility();
  const isNewUser = useIsNewUser();
  const [lens, setLens] = useState<LensKey>("total");
  const active = LENSES.find((l) => l.key === lens) ?? LENSES[0];

  return (
    <AppShell title="Home" navVariant="elevated">
      {isNewUser ? (
        <div className="pt-5">
          <NewUserEmptyState />
        </div>
      ) : (
        <div className="pb-2">
          {/* ── Immersive navy canvas (full-bleed on mobile) ───────────── */}
          <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-14 pt-5 text-primary-foreground md:mx-0 md:rounded-[2rem] md:px-8 md:pb-10 md:pt-8 md:shadow-float">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-gold/25 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -left-24 bottom-0 size-56 rounded-full bg-white/10 blur-3xl"
            />

            <header className="relative flex items-center justify-between gap-3">
              <div className="min-w-0">
                <Logo tone="light" className="font-display text-xl md:hidden" />
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

            {/* Lens switcher — one balance surface, three views */}
            <div className="relative mt-5 inline-flex rounded-full border border-white/15 bg-white/10 p-1">
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

            <div className="relative mt-4 flex items-end gap-3">
              <h1 className="font-display text-[40px] font-extrabold leading-none tracking-[-0.045em] text-num md:text-[56px]">
                {mask(active.value)}
              </h1>
              <button
                type="button"
                onClick={toggle}
                aria-label={hidden ? "Show balances" : "Hide balances"}
                className="mb-1 grid size-8 shrink-0 place-items-center rounded-full border border-white/25 bg-white/10 press"
              >
                {hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <p className="relative mt-2 text-[11px] text-primary-foreground/70">{active.note}</p>
            <p className="relative mt-3 inline-flex items-center gap-1.5 rounded-full bg-gold/20 px-3 py-1 text-[11px] font-bold text-gold">
              <ArrowUpRight className="size-3.5" /> +{naira(WEEK_EARNINGS)} interest this week
            </p>

            {/* Quick actions — thumb row on the canvas */}
            <div className="relative mt-6 grid grid-cols-4 gap-2">
              {QUICK_ACTIONS.map((a) => (
                <Link
                  key={a.label}
                  to={a.to}
                  className="flex flex-col items-center gap-2 rounded-2xl py-1 text-[10px] font-semibold text-primary-foreground/85 press"
                >
                  <span className="grid size-12 place-items-center rounded-2xl border border-white/15 bg-white/10">
                    <a.icon className="size-5" strokeWidth={1.9} />
                  </span>
                  <span className="text-center leading-tight">{a.label}</span>
                </Link>
              ))}
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
              <article className="card-surface p-4 md:p-6 lg:col-span-2">
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
                  <div className="shrink-0 rounded-2xl bg-brand px-3 py-2 text-center text-brand-foreground">
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
                    className="h-full rounded-full bg-gold-gradient"
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
              </article>

              {/* Weekly interest */}
              <article className="card-surface p-4 md:p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Interest this week
                </p>
                <p className="mt-1.5 font-display text-2xl font-extrabold text-num">
                  {mask(WEEK_EARNINGS)}
                </p>
                <div className="mt-4">
                  <WeekStrip />
                </div>
              </article>
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
              <div className="grid gap-2.5 md:grid-cols-3">
                {HOLDINGS.map((h, i) => (
                  <article
                    key={h.name}
                    className="card-surface flex items-center gap-3 p-4 press md:block"
                  >
                    <span
                      className={`h-11 w-1.5 shrink-0 rounded-full md:mb-3 md:h-1.5 md:w-10 ${
                        i === 0 ? "bg-gold" : i === 1 ? "bg-brand" : "bg-teal"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{h.name}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {h.rate} · {h.daysLeft} days left · {h.date}
                      </p>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-brand"
                          style={{
                            width: `${Math.round(((h.totalDays - h.daysLeft) / h.totalDays) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                    <p className="shrink-0 text-sm font-extrabold text-num md:mt-3 md:block">
                      {mask(h.amount)}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            {/* Payout timeline */}
            <section className="card-surface mt-5 p-4 md:p-6">
              <h2 className="font-display text-base font-extrabold">Coming up</h2>
              <ol className="mt-3.5 space-y-3.5">
                {PAYOUTS.map((p, i) => (
                  <li key={p.label} className="relative grid grid-cols-[auto_minmax(0,1fr)_auto] gap-3">
                    <span className="relative flex w-3 justify-center">
                      <span
                        className={`z-10 mt-1.5 size-2.5 rounded-full ring-4 ring-surface ${
                          i === 0 ? "bg-gold" : "bg-brand/30"
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

            {/* Idle wallet nudge */}
            <section className="mt-5 overflow-hidden rounded-3xl border border-border bg-surface shadow-card">
              <div className="flex">
                <span aria-hidden className="w-1.5 shrink-0 bg-gold-gradient" />
                <div className="min-w-0 flex-1 p-4 md:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                        <Wallet className="size-3.5" strokeWidth={2} /> Idle cash
                      </p>
                      <p className="mt-1.5 text-2xl font-extrabold tracking-tight text-num">
                        {mask(WALLET)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Not earning interest in your wallet.
                      </p>
                    </div>
                    <div className="shrink-0 rounded-2xl bg-accent px-3.5 py-2.5 text-right">
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-accent-foreground/70">
                        Could earn
                      </p>
                      <p className="text-base font-extrabold text-accent-foreground text-num">
                        ₦8,958
                      </p>
                      <p className="text-[10px] text-accent-foreground/70">per month</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-muted-foreground">
                      Kipit Vault · 21.5% p.a. · 365-day tenor
                    </p>
                    <Link
                      to="/invest"
                      className="inline-flex items-center justify-center gap-1.5 rounded-full bg-brand px-4 py-2.5 text-xs font-bold text-brand-foreground press"
                    >
                      Invest wallet <ArrowUpRight className="size-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </section>


            {/* For you */}
            <section className="mt-5">
              <div className="flex items-end justify-between">
                <h2 className="font-display text-lg font-bold tracking-tight md:text-xl">For you</h2>
                <Link to="/explore" className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground press hover:bg-secondary">
                  View all
                </Link>
              </div>
              <div className="-mx-4 mt-3 flex gap-3 overflow-x-auto px-4 pb-2 no-scrollbar md:mx-0 md:mt-4 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
                {FEED.map((item, i) => (
                  <article
                    key={item.title}
                    className={`w-[16.5rem] shrink-0 rounded-3xl border border-border p-4 shadow-card press hover:-translate-y-0.5 hover:shadow-float md:w-auto md:p-5 ${
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
                    <h3 className="mt-3 font-display text-base font-bold leading-snug">{item.title}</h3>
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

          </div>
        </div>
      )}
    </AppShell>
  );
}
