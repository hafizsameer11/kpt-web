import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Plus,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { AppShell } from "@/components/kipit/AppShell";
import { DisclosureStrip } from "@/components/kipit/DisclosureStrip";
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
        {/* ── Hero ──────────────────────────────────────────────────── */}
        <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-14 pt-9 text-primary-foreground md:mx-0 md:rounded-xl md:px-8 md:pb-14 md:pt-12 md:shadow-float">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-32 size-72 rounded-full bg-gold/15 blur-[64px]"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-28 -left-20 size-64 rounded-full bg-white/10 blur-[56px]"
          />

          <div className="relative md:max-w-3xl">
            <h1 className="k-rise font-display text-[32px] font-extrabold leading-[1.05] tracking-[-0.035em] md:text-[40px]">
              Fixed plans
            </h1>
            <p
              className="k-rise mt-2 text-[13px] leading-relaxed text-primary-foreground/70 md:text-sm"
              style={{ ["--d" as string]: "60ms" }}
            >
              Lock a tenor, know your payout upfront
            </p>

            <section
              className="k-rise mt-6 rounded-xl border border-white/12 bg-white/8 p-5 backdrop-blur-md md:p-6"
              style={{ ["--d" as string]: "120ms" }}
            >
              <p className="text-[13px] text-primary-foreground/70">Total in fixed plans</p>
              <p className="mt-0.5 font-display text-[34px] font-extrabold leading-none tracking-[-0.03em] text-num md:text-[40px]">
                <AmountCounter value={invested} hidden={hidden} mask={mask} />
              </p>
              <p className="mt-2 text-[12px] text-primary-foreground/60">
                {HOLDINGS.length} active {HOLDINGS.length === 1 ? "plan" : "plans"}
                {nextMaturity ? ` · next matures in ${nextMaturity.daysLeft} days` : ""}
              </p>

              {/* Expected value at maturity — payout known upfront */}
              <div className="mt-4 flex items-stretch gap-4 border-t border-white/12 pt-4">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] uppercase tracking-[0.08em] text-primary-foreground/55">
                    Value at maturity
                  </p>
                  <p className="mt-1 text-[17px] font-extrabold text-num">
                    <AmountCounter value={expected} hidden={hidden} mask={mask} />
                  </p>
                </div>
                <span aria-hidden className="w-px bg-white/12" />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] uppercase tracking-[0.08em] text-primary-foreground/55">
                    Expected interest
                  </p>
                  <p className="mt-1 text-[17px] font-extrabold text-num text-gold">
                    <AmountCounter value={expectedInterest} hidden={hidden} mask={mask} />
                  </p>
                </div>
              </div>

              <Link
                to="/fixed-plans/create"
                className="k-glow mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-gold-gradient px-4 py-3 text-[12px] font-extrabold text-gold-foreground press"
              >
                <Plus className="size-4" strokeWidth={2.6} />
                Create new plan
              </Link>
            </section>
          </div>
        </section>

        {/* ── Sheet ─────────────────────────────────────────────────── */}
        <div className="relative -mx-4 -mt-8 rounded-t-[2rem] bg-background px-4 pt-5 md:mx-0 md:mt-6 md:rounded-none md:bg-transparent md:px-0 md:pt-0">
          <span
            aria-hidden
            className="mx-auto mb-4 block h-1 w-10 rounded-full bg-border md:hidden"
          />

          {/* Next maturity countdown */}
          {nextMaturity ? (
            <section
              className="k-rise card-surface mt-1 overflow-hidden p-4"
              style={{ ["--d" as string]: "60ms" }}
            >
              <div className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent/15 text-brand">
                  <CalendarClock className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    Next maturity
                  </p>
                  <p className="truncate text-sm font-bold">{nextMaturity.name}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-base font-extrabold text-num text-brand">
                    {nextMaturity.daysLeft}d
                  </p>
                  <p className="text-[10px] font-semibold text-muted-foreground">
                    {nextMaturity.date}
                  </p>
                </div>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="k-fill h-full rounded-full bg-accent"
                  style={{ width: `${nextProgress}%`, ["--d" as string]: "220ms" }}
                />
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Payout at maturity{" "}
                <span className="font-bold text-foreground">
                  {mask(nextMaturity.expectedPayout)}
                </span>{" "}
                · credited to your wallet
              </p>
            </section>
          ) : null}

          {/* Rate / tenor overview */}
          <section className="mt-7">
            <div className="mb-3 flex items-center justify-between px-1">
              <h2 className="font-display text-base font-extrabold">Rate &amp; tenor overview</h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                <TrendingUp className="size-3.5" /> p.a.
              </span>
            </div>
            {/* Plan cards — same design as Invest */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              {TENOR_BANDS.map((band, i) => {
                const featured = i === 1;
                return (
                  <article
                    key={band.days}
                    style={{ ["--d" as string]: `${i * 90}ms` }}
                    className={`k-rise relative flex flex-col justify-between overflow-hidden rounded-xl p-4 md:rounded-xl md:p-5 ${
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
                      <Link
                        to="/fixed-plans/create"
                        className={`mt-3 inline-flex w-full items-center justify-center gap-1 rounded-full px-3 py-2 text-[11px] font-extrabold press ${
                          featured
                            ? "bg-gold-gradient text-gold-foreground k-glow"
                            : "bg-brand text-brand-foreground"
                        }`}
                      >
                        <Plus className="size-3.5" strokeWidth={2.6} />
                        Invest
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* Plans with active / matured filter */}
          <section className="mt-7">
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
                <div className="k-rise rounded-xl border border-dashed border-border bg-card p-6 text-center">
                  <p className="text-sm font-bold">No fixed plans yet</p>
                  <p className="mt-1 text-[12px] text-muted-foreground">
                    Pick a tenor above to start your first plan.
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

          <DisclosureStrip variant="fixed" />
        </div>
      </div>
    </AppShell>
  );
}
