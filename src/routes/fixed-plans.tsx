import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Plus,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { AppShell } from "@/components/kipit/AppShell";
import { useBalanceVisibility } from "@/hooks/useBalanceVisibility";
import { AmountCounter } from "@/components/kipit/motion";
import { naira, HOLDINGS } from "@/lib/home-data";
import { TENOR_BANDS, MATURED_PLANS } from "@/lib/invest-data";

export const Route = createFileRoute("/fixed-plans")({
  head: () => ({
    meta: [
      { title: "Fixed Plans — Kipit Fixed Investments" },
      {
        name: "description",
        content:
          "See your active Kipit fixed investment plans, compare tenor bands and rates, and create a new fixed plan in a few taps.",
      },
      { property: "og:title", content: "Fixed Plans — Kipit Fixed Investments" },
      {
        property: "og:description",
        content:
          "Active plans, rate and tenor overview, and a quick path to create a new Kipit fixed investment plan.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FixedPlansScreen,
});

type Tab = "active" | "matured";

function FixedPlansScreen() {
  const { hidden, mask } = useBalanceVisibility();
  const [tab, setTab] = useState<Tab>("active");

  const invested = HOLDINGS.reduce((sum, h) => sum + h.amount, 0);
  const expected = HOLDINGS.reduce((sum, h) => sum + h.expectedPayout, 0);
  const expectedInterest = expected - invested;
  const nextMaturity = [...HOLDINGS].sort((a, b) => a.daysLeft - b.daysLeft)[0];
  const nextProgress = nextMaturity
    ? Math.min(
        100,
        Math.max(
          4,
          Math.round(
            ((nextMaturity.totalDays - nextMaturity.daysLeft) / nextMaturity.totalDays) * 100,
          ),
        ),
      )
    : 0;

  return (
    <AppShell title="Fixed plans" navVariant="elevated">
      <div className="pb-2">
        {/* ── Light summary header — distinct from Invest's navy arc ── */}
        <section className="pt-2 md:pt-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h1 className="k-rise font-display text-[26px] font-extrabold leading-tight tracking-[-0.03em] md:text-[32px]">
                Fixed plans
              </h1>
              <p
                className="k-rise mt-1 text-[12.5px] text-muted-foreground md:text-sm"
                style={{ ["--d" as string]: "60ms" }}
              >
                {HOLDINGS.length} active {HOLDINGS.length === 1 ? "plan" : "plans"} · payouts
                locked in upfront
              </p>
            </div>
            <Link
              to="/invest"
              className="k-glow inline-flex shrink-0 items-center gap-1 rounded-full bg-gold-gradient px-3.5 py-2 text-[11.5px] font-extrabold text-gold-foreground press"
            >
              <Plus className="size-3.5" strokeWidth={2.6} />
              New plan
            </Link>
          </div>

          {/* Portfolio totals band */}
          <section
            className="k-rise mt-4 overflow-hidden rounded-[1.75rem] border border-border/60 bg-card shadow-sm"
            style={{ ["--d" as string]: "120ms" }}
          >
            <div className="p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Total in fixed plans
              </p>
              <p className="mt-1 font-display text-[34px] font-extrabold leading-none tracking-[-0.03em] text-num md:text-[40px]">
                <AmountCounter value={invested} hidden={hidden} mask={mask} />
              </p>
              {/* gold accent underline */}
              <span aria-hidden className="mt-3 block h-1 w-16 rounded-full bg-gold-gradient" />
            </div>
            <div className="grid grid-cols-2 divide-x divide-border/50 border-t border-border/50">
              <div className="p-4">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Value at maturity
                </p>
                <p className="mt-1 text-[16px] font-extrabold text-num">
                  <AmountCounter value={expected} hidden={hidden} mask={mask} />
                </p>
              </div>
              <div className="p-4">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Expected interest
                </p>
                <p className="mt-1 text-[16px] font-extrabold text-num text-brand">
                  +<AmountCounter value={expectedInterest} hidden={hidden} mask={mask} />
                </p>
              </div>
            </div>
          </section>

          {/* Next maturity strip */}
          {nextMaturity ? (
            <section
              className="k-rise mt-3 flex items-center gap-3 rounded-3xl bg-brand-gradient p-4 text-primary-foreground shadow-float"
              style={{ ["--d" as string]: "180ms" }}
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white/12">
                <CalendarClock className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{nextMaturity.name}</p>
                <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/15">
                  <div
                    className="k-fill h-full rounded-full bg-gold"
                    style={{ width: `${nextProgress}%`, ["--d" as string]: "220ms" }}
                  />
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-base font-extrabold text-num text-gold">
                  {nextMaturity.daysLeft}d
                </p>
                <p className="text-[10px] font-semibold text-primary-foreground/70">
                  {nextMaturity.date}
                </p>
              </div>
            </section>
          ) : null}
        </section>

        {/* ── Your plans — the focus of this screen ── */}
        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between px-1">
            <h2 className="font-display text-base font-extrabold">Your plans</h2>
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-0.5 text-xs font-bold text-brand"
            >
              Portfolio <ChevronRight className="size-3.5" />
            </Link>
          </div>

          <div
            role="tablist"
            aria-label="Filter plans"
            className="mb-3 inline-flex rounded-full border border-border/60 bg-card p-1"
          >
            {(
              [
                ["active", `Active (${HOLDINGS.length})`],
                ["matured", `Matured (${MATURED_PLANS.length})`],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                role="tab"
                aria-selected={tab === key}
                onClick={() => setTab(key)}
                className={`rounded-full px-4 py-1.5 text-[12px] font-bold transition-all duration-300 ${
                  tab === key
                    ? "bg-brand text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === "active" ? (
            HOLDINGS.length === 0 ? (
              <div className="k-rise rounded-3xl border border-dashed border-border bg-card p-6 text-center">
                <p className="text-sm font-bold">No fixed plans yet</p>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  Pick a tenor below to start your first plan.
                </p>
                <Link
                  to="/invest"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-[12px] font-extrabold text-primary-foreground press"
                >
                  <Plus className="size-3.5" strokeWidth={2.6} /> Create a plan
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {HOLDINGS.map((h, i) => {
                  const progress = Math.min(
                    100,
                    Math.max(6, Math.round(((h.totalDays - h.daysLeft) / h.totalDays) * 100)),
                  );
                  const earned = Math.round(
                    ((h.expectedPayout - h.amount) * (h.totalDays - h.daysLeft)) / h.totalDays,
                  );
                  return (
                    <li
                      key={h.name}
                      style={{ ["--d" as string]: `${i * 90}ms` }}
                      className="k-rise card-surface relative overflow-hidden p-4 transition-shadow hover:shadow-md"
                    >
                      <span className="absolute inset-y-0 left-0 w-1 bg-accent" aria-hidden />
                      <div className="flex items-start justify-between gap-3 pl-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold">{h.name}</p>
                          <p className="mt-1 text-[11px] text-muted-foreground">
                            Matures {h.date}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-base font-extrabold text-num">{mask(h.amount)}</p>
                          <span className="mt-1 inline-flex rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-brand">
                            {h.rate}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 pl-2">
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="k-fill h-full rounded-full bg-brand"
                            style={{
                              width: `${progress}%`,
                              ["--d" as string]: `${150 + i * 90}ms`,
                            }}
                          />
                        </div>
                        <div className="mt-1.5 flex items-center justify-between text-[10px] font-semibold text-muted-foreground">
                          <span>{progress}% of tenor</span>
                          <span>{h.daysLeft} days left</span>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-3 pl-2 text-[11px]">
                        <span className="text-muted-foreground">
                          Interest so far{" "}
                          <span className="font-bold text-foreground">{mask(earned)}</span> · at
                          maturity{" "}
                          <span className="font-bold text-foreground">
                            {mask(h.expectedPayout)}
                          </span>
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold transition-colors ${
                            h.autoRenew
                              ? "bg-accent/15 text-brand"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <RefreshCw className="size-3" />
                          {h.autoRenew ? "Roll over on" : "Roll over off"}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )
          ) : (
            <ul className="space-y-3">
              {MATURED_PLANS.map((p, i) => (
                <li
                  key={`${p.name}-${p.maturedOn}`}
                  style={{ ["--d" as string]: `${i * 90}ms` }}
                  className="k-rise card-surface relative overflow-hidden p-4"
                >
                  <span
                    className="absolute inset-y-0 left-0 w-1 bg-muted-foreground/30"
                    aria-hidden
                  />
                  <div className="flex items-start justify-between gap-3 pl-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">{p.name}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {p.tenor} · matured {p.maturedOn}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-base font-extrabold text-num">{mask(p.payout)}</p>
                      <span className="mt-1 inline-flex rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-brand">
                        {p.rate}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/50 pt-3 pl-2 text-[11px] text-muted-foreground">
                    <span>
                      Principal <span className="font-bold text-foreground">{mask(p.principal)}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 font-bold text-brand">
                      <CheckCircle2 className="size-3.5" /> {p.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ── Plan catalogue — create another plan ── */}
        <section className="mt-7">
          <div className="mb-3 flex items-center justify-between px-1">
            <h2 className="font-display text-base font-extrabold">Start another plan</h2>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
              <TrendingUp className="size-3.5" /> p.a.
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {TENOR_BANDS.map((band, i) => {
              const featured = i === 1;
              return (
                <article
                  key={band.days}
                  style={{ ["--d" as string]: `${i * 90}ms` }}
                  className={`k-rise relative flex flex-col justify-between overflow-hidden rounded-[1.5rem] p-4 md:rounded-[2rem] md:p-5 ${
                    featured
                      ? "bg-brand-gradient text-primary-foreground shadow-float"
                      : "border border-border bg-card"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`pointer-events-none absolute -right-10 -top-10 size-28 rounded-full ${
                      featured ? "bg-gold/20" : "bg-accent/60"
                    }`}
                  />
                  <div className="relative">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-widest md:px-3 md:text-[10px] ${
                        featured
                          ? "bg-white/15 text-primary-foreground"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {featured ? "Most popular" : "Fixed tenor"}
                    </span>
                    <h3 className="mt-2 font-display text-[13px] font-extrabold leading-tight md:mt-3 md:text-base">
                      {band.name}
                    </h3>
                    <p
                      className={`mt-0.5 text-[10px] font-semibold md:text-[11px] ${
                        featured ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}
                    >
                      {band.days} &middot; min {naira(band.minimum)}
                    </p>
                  </div>
                  <div className="relative mt-4">
                    <p
                      className={`text-[9px] md:text-[10px] ${
                        featured ? "text-primary-foreground/60" : "text-muted-foreground"
                      }`}
                    >
                      Rate p.a.
                    </p>
                    <p
                      className={`text-xl font-extrabold text-num md:text-2xl ${
                        featured ? "text-gold" : ""
                      }`}
                    >
                      {band.rate}
                    </p>
                    <button
                      type="button"
                      className={`mt-3 inline-flex w-full items-center justify-center gap-1 rounded-full px-3 py-2 text-[11px] font-extrabold press ${
                        featured
                          ? "bg-gold-gradient text-gold-foreground k-glow"
                          : "bg-brand text-brand-foreground"
                      }`}
                    >
                      <Plus className="size-3.5" strokeWidth={2.6} />
                      Invest
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <p className="mt-5 flex items-start gap-2 px-1 text-[11px] leading-relaxed text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
          Rates are indicative per annum and confirmed at the point of investment. Funds are locked
          for the selected tenor; early liquidation terms apply.
        </p>
      </div>
    </AppShell>
  );
}
