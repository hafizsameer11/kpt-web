import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Plus, ShieldCheck, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/kipit/AppShell";
import { useBalanceVisibility } from "@/hooks/useBalanceVisibility";
import { AmountCounter } from "@/components/kipit/motion";
import { naira, HOLDINGS } from "@/lib/home-data";
import { TENOR_BANDS } from "@/lib/invest-data";

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

function FixedPlansScreen() {
  const { hidden, mask } = useBalanceVisibility();

  const invested = HOLDINGS.reduce((sum, h) => sum + h.amount, 0);
  const nextMaturity = [...HOLDINGS].sort((a, b) => a.daysLeft - b.daysLeft)[0];

  return (
    <AppShell title="Fixed plans" navVariant="elevated">
      <div className="pb-2">
        {/* ── Hero ──────────────────────────────────────────────────── */}
        <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-14 pt-9 text-primary-foreground md:mx-0 md:rounded-[2rem] md:px-8 md:pb-14 md:pt-12 md:shadow-float">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-32 size-72 rounded-full bg-gold/15 blur-[64px]"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-28 -left-20 size-64 rounded-full bg-white/10 blur-[56px]"
          />

          <div className="relative md:max-w-3xl">
            <h1 className="font-display text-[32px] font-extrabold leading-[1.05] tracking-[-0.035em] md:text-[40px]">
              Fixed plans
            </h1>
            <p className="mt-2 text-[13px] leading-relaxed text-primary-foreground/70 md:text-sm">
              Lock a tenor, know your payout upfront
            </p>

            <section className="mt-6 rounded-[1.75rem] border border-white/12 bg-white/8 p-5 backdrop-blur-md md:p-6">
              <p className="text-[13px] text-primary-foreground/70">Total in fixed plans</p>
              <p className="mt-0.5 font-display text-[34px] font-extrabold leading-none tracking-[-0.03em] text-num md:text-[40px]">
                <AmountCounter value={invested} hidden={hidden} mask={mask} />
              </p>
              <p className="mt-2 text-[12px] text-primary-foreground/60">
                {HOLDINGS.length} active {HOLDINGS.length === 1 ? "plan" : "plans"}
                {nextMaturity ? ` · next matures in ${nextMaturity.daysLeft} days` : ""}
              </p>

              <Link
                to="/invest"
                className="mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-gold-gradient px-4 py-3 text-[12px] font-extrabold text-gold-foreground press"
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

          {/* Rate / tenor overview */}
          <section className="mt-4">
            <div className="mb-3 flex items-center justify-between px-1">
              <h2 className="font-display text-base font-extrabold">Rate &amp; tenor overview</h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                <TrendingUp className="size-3.5" /> p.a.
              </span>
            </div>
            <div className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm">
              {TENOR_BANDS.map((band, i) => (
                <div
                  key={band.days}
                  style={{ ["--d" as string]: `${i * 70}ms` }}
                  className={`k-rise flex items-center gap-3 px-4 py-3.5 ${
                    i > 0 ? "border-t border-border/50" : ""
                  }`}
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-accent/15 text-[11px] font-extrabold text-brand">
                    {band.days.replace(" days", "d")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold">{band.name}</span>
                    <span className="block text-[11.5px] text-muted-foreground">
                      {band.days} lock-in · min {naira(band.minimum)}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-base font-extrabold text-num text-brand">
                      {band.rate}
                    </span>
                    <span className="block text-[10px] font-semibold text-muted-foreground">
                      per annum
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Active plans */}
          <section className="mt-7">
            <div className="mb-3 flex items-center justify-between px-1">
              <h2 className="font-display text-base font-extrabold">Active plans</h2>
              <Link
                to="/portfolio"
                className="inline-flex items-center gap-0.5 text-xs font-bold text-brand"
              >
                Portfolio <ChevronRight className="size-3.5" />
              </Link>
            </div>

            {HOLDINGS.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border bg-card p-6 text-center">
                <p className="text-sm font-bold">No fixed plans yet</p>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  Pick a tenor above to start your first plan.
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {HOLDINGS.map((h, i) => {
                  const progress = Math.min(
                    100,
                    Math.max(6, Math.round(((h.totalDays - h.daysLeft) / h.totalDays) * 100)),
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
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <p className="mt-5 flex items-start gap-2 px-1 text-[11px] leading-relaxed text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
            Rates are indicative per annum and confirmed at the point of investment. Funds are locked
            for the selected tenor; early liquidation terms apply.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
