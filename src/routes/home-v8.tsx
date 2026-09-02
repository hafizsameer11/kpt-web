import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowUpRight,
  Bell,
  ChevronRight,
  Eye,
  EyeOff,
  Info,
  Lightbulb,
  Timer,
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

export const Route = createFileRoute("/home-v8")({
  head: () => ({
    meta: [
      { title: "Kipit Home 8 — Glass Timeline Wealth Screen" },
      {
        name: "description",
        content:
          "Kipit Home 8: a frosted-glass mobile home built around a money split bar and a vertical money timeline of maturities and payouts.",
      },
      { property: "og:title", content: "Kipit Home 8 — Glass Timeline Wealth Screen" },
      {
        property: "og:description",
        content:
          "A glassmorphic Kipit home screen: split-bar balance, pill actions, stacked plan deck and a money timeline.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomeV8Screen,
});

const investedPct = Math.round((INVESTED / TOTAL) * 100);
const walletPct = 100 - investedPct;

function HomeV8Screen() {
  const { hidden, toggle, mask } = useBalanceVisibility();
  const isNew = useIsNewUser();
  const [openPlan, setOpenPlan] = useState(0);
  const weekMax = Math.max(...WEEK_SERIES);

  return (
    <div className="type-h8">
      <AppShell title="Home" navVariant="floating">
        {/* Wallpaper behind the glass */}
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-background" />
          <div className="absolute -left-24 -top-24 size-[22rem] rounded-full bg-brand/30 blur-[90px]" />
          <div className="absolute -right-20 top-40 size-[18rem] rounded-full bg-gold/35 blur-[80px]" />
          <div className="absolute bottom-0 left-1/3 size-[24rem] rounded-full bg-brand/15 blur-[100px]" />
        </div>

        {/* Floating status pill instead of a page header */}
        <div className="sticky top-2 z-30 -mx-1 mb-4 pt-3 md:hidden">
          <div className="k-glass8 flex items-center gap-3 rounded-full py-2 pl-3 pr-2">
            <Logo tone="brand" className="font-display text-[15px]" />
            <p className="min-w-0 flex-1 truncate text-[11px] text-muted-foreground">
              <GreetingText />, Adaeze
            </p>
            <Link
              to="/notifications"
              aria-label="Notifications"
              className="relative grid size-8 place-items-center rounded-full bg-brand/8 press"
            >
              <Bell className="size-4" strokeWidth={1.8} />
              <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-gold" />
            </Link>
            <Link
              to="/settings"
              aria-label="Profile"
              className="grid size-8 place-items-center rounded-full bg-brand text-[10px] font-bold text-primary-foreground press"
            >
              AO
            </Link>
          </div>
        </div>

        {isNew ? (
          <div className="pb-6 pt-2">
            <NewUserEmptyState />
          </div>
        ) : (
          <div className="space-y-4 pb-6 md:grid md:grid-cols-12 md:gap-5 md:space-y-0">
            {/* ── Split-bar balance ───────────────────────────── */}
            <section className="k-glass8 rounded-[2rem] p-5 md:col-span-7 md:p-7">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Total portfolio value
                  </p>
                  <p className="font-display mt-1.5 text-[2.35rem] leading-none tracking-tight md:text-5xl">
                    {mask(TOTAL)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={toggle}
                  aria-label={hidden ? "Show balances" : "Hide balances"}
                  className="grid size-9 shrink-0 place-items-center rounded-full bg-brand/8 press"
                >
                  {hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>

              {/* the money split bar — this screen's signature element */}
              <div className="mt-6 flex h-3.5 w-full gap-1 overflow-hidden rounded-full">
                <span
                  className="rounded-full bg-brand-gradient"
                  style={{ width: `${investedPct}%` }}
                />
                <span
                  className="rounded-full bg-gold-gradient"
                  style={{ width: `${walletPct}%` }}
                />
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-brand/6 px-3.5 py-3">
                  <dt className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
                    <span className="size-2 rounded-full bg-brand" /> Invested · {investedPct}%
                  </dt>
                  <dd className="mt-1 text-lg font-bold tracking-tight">{mask(INVESTED)}</dd>
                </div>
                <div className="rounded-2xl bg-gold/12 px-3.5 py-3">
                  <dt className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
                    <span className="size-2 rounded-full bg-gold" /> Wallet · {walletPct}%
                  </dt>
                  <dd className="mt-1 text-lg font-bold tracking-tight">{mask(WALLET)}</dd>
                </div>
              </dl>
              <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-snug text-muted-foreground">
                <Info className="mt-px size-3.5 shrink-0" />
                Wallet balances are held for investment and do not earn interest.
              </p>
            </section>

            {/* ── Weekly interest strip ───────────────────────── */}
            <section className="k-glass8 rounded-[2rem] p-5 md:col-span-5 md:p-6">
              <div className="flex items-baseline justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Interest this week
                </p>
                <span className="inline-flex items-center gap-1 rounded-full bg-brand/8 px-2 py-0.5 text-[11px] font-bold text-brand">
                  <ArrowUpRight className="size-3" /> paid daily
                </span>
              </div>
              <p className="font-display mt-1.5 text-3xl tracking-tight">{mask(WEEK_EARNINGS)}</p>
              <div className="mt-5 flex h-24 items-end gap-2">
                {WEEK_SERIES.map((v, i) => (
                  <div key={WEEK_LABELS[i]} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                    <div className="flex w-full flex-1 items-end">
                      <div
                        className={`w-full rounded-t-lg ${
                          i === WEEK_SERIES.length - 1 ? "bg-gold-gradient" : "bg-brand/25"
                        }`}
                        style={{ height: `${Math.max(14, (v / weekMax) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-muted-foreground">
                      {WEEK_LABELS[i]!.slice(0, 1)}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Action pill rail ────────────────────────────── */}
            <nav className="-mx-4 overflow-x-auto px-4 md:col-span-12 md:mx-0 md:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <ul className="flex w-max gap-2.5 md:w-full">
                {QUICK_ACTIONS.map((a) => {
                  const Icon = a.icon;
                  return (
                    <li key={a.label} className="md:flex-1">
                      <Link
                        to={a.to}
                        className="k-glass8 flex items-center gap-2.5 rounded-full py-2.5 pl-2.5 pr-4 press md:justify-center"
                      >
                        <span className="grid size-8 place-items-center rounded-full bg-brand text-primary-foreground">
                          <Icon className="size-4" strokeWidth={2} />
                        </span>
                        <span className="whitespace-nowrap text-[13px] font-bold tracking-tight">
                          {a.label}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* ── Money timeline ──────────────────────────────── */}
            <section className="k-glass8 rounded-[2rem] p-5 md:col-span-7 md:p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg tracking-tight">Money timeline</h2>
                <Link
                  to="/portfolio"
                  className="inline-flex items-center text-[12px] font-bold text-brand"
                >
                  Portfolio <ChevronRight className="size-3.5" />
                </Link>
              </div>

              <ol className="relative mt-4 space-y-4 border-l border-dashed border-gold/50 pl-5">
                {/* next maturity node — the anchor of the timeline */}
                <li className="relative">
                  <span className="absolute -left-[1.6rem] top-1 grid size-5 place-items-center rounded-full bg-gold-gradient text-gold-foreground">
                    <Timer className="size-3" strokeWidth={2.4} />
                  </span>
                  <div className="rounded-2xl bg-brand/6 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          Next maturity
                        </p>
                        <p className="mt-0.5 truncate text-[15px] font-bold tracking-tight">
                          {NEXT_MATURITY.name}
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {NEXT_MATURITY.tenor} · {NEXT_MATURITY.rate} · matures{" "}
                          {NEXT_MATURITY.date}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-brand px-2.5 py-1 text-[11px] font-bold text-primary-foreground">
                        {NEXT_MATURITY.daysLeft}d left
                      </span>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-brand/12">
                      <span
                        className="block h-full rounded-full bg-gold-gradient"
                        style={{
                          width: `${Math.round(
                            ((NEXT_MATURITY.totalDays - NEXT_MATURITY.daysLeft) /
                              NEXT_MATURITY.totalDays) *
                              100,
                          )}%`,
                        }}
                      />
                    </div>
                    <p className="mt-2.5 text-[12px] text-muted-foreground">
                      Principal {mask(NEXT_MATURITY.amount)} · expected payout{" "}
                      <span className="font-bold text-foreground">
                        {mask(NEXT_MATURITY.expectedPayout)}
                      </span>
                    </p>
                  </div>
                </li>

                {PAYOUTS.map((p) => (
                  <li key={p.label} className="relative">
                    <span className="absolute -left-[1.43rem] top-2 size-2.5 rounded-full bg-brand/40 ring-4 ring-background" />
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-semibold tracking-tight">
                          {p.label}
                        </p>
                        <p className="text-[11px] text-muted-foreground">{p.date}</p>
                      </div>
                      <p className="shrink-0 text-[13px] font-bold">{mask(p.amount)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {/* ── Plan deck (accordion stack) ─────────────────── */}
            <section className="md:col-span-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-lg tracking-tight">Your plans</h2>
                <span className="text-[11px] font-semibold text-muted-foreground">
                  {HOLDINGS.length} active
                </span>
              </div>
              <ul className="space-y-2.5">
                {HOLDINGS.map((h, i) => {
                  const open = openPlan === i;
                  const pct = Math.round(((h.totalDays - h.daysLeft) / h.totalDays) * 100);
                  return (
                    <li key={h.name}>
                      <button
                        type="button"
                        onClick={() => setOpenPlan(open ? -1 : i)}
                        aria-expanded={open}
                        className={`k-glass8 w-full rounded-[1.5rem] p-4 text-left press ${
                          open ? "ring-1 ring-gold/60" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-[14px] font-bold tracking-tight">
                              {h.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {h.rate} · {h.daysLeft} days left
                            </p>
                          </div>
                          <p className="shrink-0 text-[15px] font-bold">{mask(h.amount)}</p>
                        </div>
                        <div
                          className={`grid transition-all duration-300 ${
                            open ? "mt-3 grid-rows-[1fr]" : "grid-rows-[0fr]"
                          }`}
                        >
                          <div className="overflow-hidden">
                            <div className="h-1.5 overflow-hidden rounded-full bg-brand/12">
                              <span
                                className="block h-full rounded-full bg-brand-gradient"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <p className="mt-2 text-[11px] text-muted-foreground">
                              {pct}% of tenor complete · matures {h.date}
                            </p>
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>

              {/* wallet nudge */}
              <div className="k-glass8 mt-3 flex items-center gap-3 rounded-[1.5rem] p-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gold/20 text-gold-foreground">
                  <Wallet className="size-4 text-brand" strokeWidth={2} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold tracking-tight">
                    {naira(WALLET)} is sitting idle
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Put it to work in a plan and start earning daily interest.
                  </p>
                </div>
                <Link
                  to="/invest"
                  className="shrink-0 rounded-full bg-brand px-3.5 py-2 text-[12px] font-bold text-primary-foreground press"
                >
                  Invest
                </Link>
              </div>

              {/* recommendation */}
              <div className="k-glass8 mt-3 rounded-[1.5rem] p-4">
                <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  <Lightbulb className="size-3.5" /> Recommended for you
                </p>
                <p className="mt-1.5 text-[14px] font-bold tracking-tight">
                  Kipit Vault (365d) · 21.5% p.a.
                </p>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  Your longest-horizon goal fits a 12-month tenor at our highest rate.
                </p>
                <Link
                  to="/invest"
                  className="mt-3 inline-flex items-center gap-1 rounded-full bg-gold-gradient px-3.5 py-2 text-[12px] font-bold text-gold-foreground press"
                >
                  Start this plan <ChevronRight className="size-3.5" />
                </Link>
              </div>
            </section>

            {/* ── For you ─────────────────────────────────────── */}
            <ForYouBento className="md:col-span-12" />
          </div>
        )}
      </AppShell>
    </div>
  );
}
