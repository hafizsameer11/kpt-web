import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, ChevronRight, Plus, ShieldCheck, Wallet } from "lucide-react";
import { AppShell } from "@/components/kipit/AppShell";
import { useBalanceVisibility } from "@/hooks/useBalanceVisibility";
import { naira, HOLDINGS, INVESTED, MONTH_CHANGE_PCT } from "@/lib/home-data";
import { CALL_ACCOUNT, TENOR_BANDS } from "@/lib/invest-data";

export const Route = createFileRoute("/invest-v2")({
  head: () => ({
    meta: [
      { title: "Invest V2 — Kipit Arc Concept" },
      {
        name: "description",
        content:
          "Kipit Invest concept two: a navy arc header with primary actions, a liquid Call Account row and large fixed-plan cards.",
      },
      { property: "og:title", content: "Invest V2 — Kipit Arc Concept" },
      {
        property: "og:description",
        content:
          "A modern arc-sheet take on the Kipit Invest screen with transparent rates, tenors and minimums.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InvestV2,
});

function InvestV2() {
  const { mask } = useBalanceVisibility();

  return (
    <AppShell title="Invest" navVariant="elevated">
      <div className="pb-2">
        {/* Arc header */}
        <section className="relative -mx-4 overflow-hidden rounded-b-[2.5rem] bg-brand-gradient px-5 pb-10 pt-10 text-primary-foreground md:mx-0 md:rounded-[2.5rem] md:px-8 md:pb-12 md:pt-14">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-28 size-72 rounded-full bg-gold/15 blur-[70px]"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -left-16 size-56 rounded-full bg-white/10 blur-[60px]"
          />

          <div className="relative">
            <p className="text-[12px] font-medium text-primary-foreground/60">
              Total invested
            </p>
            <div className="mt-1 flex flex-wrap items-baseline gap-2">
              <span className="text-num text-[34px] font-extrabold leading-none tracking-tight md:text-[44px]">
                {mask(INVESTED)}
              </span>
              <span className="text-sm font-bold text-gold">
                +{MONTH_CHANGE_PCT}%
              </span>
            </div>

            <div className="mt-7 flex gap-3">
              <button
                type="button"
                className="flex-1 rounded-2xl bg-gold-gradient py-3 text-sm font-bold text-gold-foreground press"
              >
                Invest more
              </button>
              <button
                type="button"
                className="flex-1 rounded-2xl border border-white/15 bg-white/10 py-3 text-sm font-bold text-primary-foreground backdrop-blur-sm press"
              >
                Withdraw
              </button>
            </div>
          </div>
        </section>

        <div className="space-y-8 pt-8">
          {/* Call Account row */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-extrabold">Call account</h2>
              <Link to="/portfolio" className="text-xs font-bold text-brand">
                Manage
              </Link>
            </div>
            <div className="card-surface flex items-center gap-4 p-4 md:p-5">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-accent text-accent-foreground">
                <Wallet className="size-6" strokeWidth={1.8} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Current value
                </p>
                <p className="truncate text-xl font-extrabold text-num">
                  {mask(CALL_ACCOUNT.balance)}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs font-extrabold text-gold-strong">
                  {CALL_ACCOUNT.rate}
                </p>
                <p className="text-[10px] text-muted-foreground">Daily accrual</p>
              </div>
            </div>
            <p className="mt-2 px-1 text-[11px] text-muted-foreground">
              {CALL_ACCOUNT.liquidity} · minimum {naira(CALL_ACCOUNT.minimum)}
            </p>
          </section>

          {/* Fixed plans */}
          <section>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-display text-lg font-extrabold">Fixed plans</h2>
              <button
                type="button"
                className="inline-flex shrink-0 items-center gap-0.5 text-xs font-bold text-brand"
              >
                New plan <ChevronRight className="size-3.5" />
              </button>
            </div>

            <div className="-mx-4 md:mx-0">
              <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-4 md:overflow-visible md:px-0">
                {TENOR_BANDS.map((band, i) => {
                  const featured = i === 1;
                  return (
                    <article
                      key={band.days}
                      className={`relative flex h-52 w-[15.5rem] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-[2rem] p-5 md:w-auto ${
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
                          className={`inline-flex rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest ${
                            featured
                              ? "bg-white/15 text-primary-foreground"
                              : "bg-secondary text-muted-foreground"
                          }`}
                        >
                          {featured ? "Most popular" : "Fixed tenor"}
                        </span>
                        <h3 className="mt-3 font-display text-xl font-extrabold">
                          {band.days}
                        </h3>
                        <p
                          className={`mt-1 text-[11px] ${featured ? "text-primary-foreground/60" : "text-muted-foreground"}`}
                        >
                          Min {naira(band.minimum)}
                        </p>
                      </div>
                      <div className="relative flex items-end justify-between">
                        <div>
                          <p
                            className={`text-[10px] ${featured ? "text-primary-foreground/60" : "text-muted-foreground"}`}
                          >
                            Rate per annum
                          </p>
                          <p
                            className={`text-2xl font-extrabold text-num ${featured ? "text-gold" : ""}`}
                          >
                            {band.rate}
                          </p>
                        </div>
                        <span
                          className={`grid size-10 place-items-center rounded-full ${
                            featured
                              ? "bg-gold-gradient text-gold-foreground"
                              : "bg-brand text-brand-foreground"
                          }`}
                        >
                          <Plus className="size-5" strokeWidth={2.4} />
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Active plans */}
          <section className="card-surface p-5 md:p-7">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-base font-extrabold">
                Your active plans
              </h2>
              <Link
                to="/portfolio"
                className="inline-flex items-center gap-0.5 text-xs font-bold text-brand"
              >
                Portfolio <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
            <ul className="space-y-3">
              {HOLDINGS.map((h) => (
                <li key={h.name} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{h.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {h.rate} · {h.daysLeft} days left · matures {h.date}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-bold text-num">
                    {mask(h.amount)}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <p className="flex items-start gap-2 px-1 text-[11px] leading-relaxed text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
            Rates are indicative per annum and confirmed at the point of investment. Fixed
            plans are locked for the selected tenor; early liquidation terms apply.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
