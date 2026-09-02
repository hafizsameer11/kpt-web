import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, ChevronRight, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/kipit/AppShell";
import { useBalanceVisibility } from "@/hooks/useBalanceVisibility";
import { naira, HOLDINGS } from "@/lib/home-data";
import { CALL_ACCOUNT, FIXED_PLANS, TENOR_BANDS } from "@/lib/invest-data";

export const Route = createFileRoute("/invest")({
  head: () => ({
    meta: [
      { title: "Invest — Kipit Investment Products" },
      {
        name: "description",
        content:
          "Kipit's direct investment products: a liquid Call Account and fixed plans with transparent rate, tenor and minimum investment.",
      },
      { property: "og:title", content: "Invest — Kipit Investment Products" },
      {
        property: "og:description",
        content:
          "Choose the Kipit Call Account for daily interest, or a fixed plan with a clear rate, tenor and minimum.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InvestScreen,
});

function InvestScreen() {
  const { mask } = useBalanceVisibility();

  return (
    <AppShell title="Invest" navVariant="elevated">
      <div className="pb-2">
        {/* ── Header canvas ─────────────────────────────────────────── */}
        <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-20 pt-9 text-primary-foreground md:mx-0 md:rounded-[2.5rem] md:px-8 md:pb-20 md:pt-12 md:shadow-float">
          {/* Soft aurora glows */}
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
              Invest
            </h1>
            <p className="mt-2 text-[13px] leading-relaxed text-primary-foreground/70 md:text-sm">
              Grow your wealth with Kipit&rsquo;s own plans
            </p>

            {/* Call Account glass card (MOB-061 entry) */}
            <section className="mt-6 rounded-[1.75rem] border border-white/12 bg-white/8 p-5 backdrop-blur-md md:p-6">
              <div className="flex items-start justify-between gap-3">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary-foreground/75">
                  {CALL_ACCOUNT.name}
                </span>
                <span className="shrink-0 rounded-full bg-gold-gradient px-3 py-1 text-[11px] font-extrabold text-gold-foreground">
                  {CALL_ACCOUNT.rate}
                </span>
              </div>

              <p className="mt-4 text-[13px] text-primary-foreground/70">Balance</p>
              <p className="mt-0.5 font-display text-[34px] font-extrabold leading-none tracking-[-0.03em] text-num md:text-[40px]">
                {mask(CALL_ACCOUNT.balance)}
              </p>
              <p className="mt-2 text-[12px] text-primary-foreground/60">
                {CALL_ACCOUNT.liquidity} &middot; earned today {mask(CALL_ACCOUNT.accruedToday)}
              </p>

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-gold-gradient px-5 py-3 text-xs font-extrabold text-gold-foreground press"
                >
                  Add money <ArrowUpRight className="size-3.5" />
                </button>
                <Link
                  to="/portfolio"
                  className="inline-flex flex-1 items-center justify-center rounded-full border border-white/20 bg-white/10 px-5 py-3 text-xs font-bold text-primary-foreground press"
                >
                  Activity
                </Link>
              </div>
            </section>

          </div>
        </section>

        {/* ── Sheet ─────────────────────────────────────────────────── */}
        <div className="relative -mx-4 -mt-7 rounded-t-[2rem] bg-background px-4 pt-5 md:mx-0 md:mt-6 md:rounded-none md:bg-transparent md:px-0 md:pt-0">
          <span
            aria-hidden
            className="mx-auto mb-4 block h-1 w-10 rounded-full bg-border md:hidden"
          />


          {/* Fixed plans (MOB-065) */}
          <section className="mt-7">

            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-display text-base font-extrabold">Fixed plans</h2>
              <button
                type="button"
                className="inline-flex shrink-0 items-center gap-0.5 text-xs font-bold text-brand"
              >
                New plan <ChevronRight className="size-3.5" />
              </button>
            </div>

            {/* Luxe tenor / rate carousel */}
            <div className="relative -mx-4 md:mx-0">
              <div
                className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-6 md:grid md:grid-cols-4 md:overflow-visible md:px-0"
              >
                {TENOR_BANDS.map((b) => (
                  <article
                    key={b.days}
                    className="relative w-[17rem] shrink-0 snap-center overflow-hidden rounded-[1.5rem] bg-brand p-[1px] shadow-float md:w-auto"
                  >
                    {/* gradient border layer */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 bg-gradient-to-br from-gold via-gold/30 to-transparent opacity-70"
                    />
                    <div className="relative flex flex-col items-center rounded-[1.5rem] bg-brand px-6 py-8 text-center">
                      <span className="mb-3 inline-flex rounded-full bg-gold/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gold">
                        Fixed tenor
                      </span>
                      <h3 className="text-lg font-medium text-primary-foreground/80">
                        {b.days}
                      </h3>

                      <div className="my-5 flex flex-col items-center">
                        <span className="font-['Fraunces'] text-[3.25rem] font-bold leading-none text-gold">
                          {parseFloat(b.rate)}<span className="text-[1.75rem]">%</span>
                        </span>
                        <span className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-primary-foreground/40">
                          Per annum
                        </span>
                      </div>

                      <div className="mb-6 h-px w-14 bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

                      <p className="text-[11px] font-medium text-primary-foreground/50">
                        Minimum investment
                      </p>
                      <p className="mt-0.5 text-lg font-semibold text-primary-foreground">
                        {naira(b.minimum)}
                      </p>

                      <button
                        type="button"
                        className="mt-6 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-gold px-5 py-3 text-xs font-extrabold text-gold-foreground transition-colors hover:bg-gold/90 press"
                      >
                        Invest now <ArrowUpRight className="size-3.5" />
                      </button>

                      {/* ambient glows */}
                      <span
                        aria-hidden
                        className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-gold/8 blur-[40px]"
                      />
                      <span
                        aria-hidden
                        className="pointer-events-none absolute -bottom-10 -left-10 size-28 rounded-full bg-white/5 blur-[36px]"
                      />
                    </div>
                  </article>
                ))}
              </div>

              {/* carousel dots (mobile only) */}
              <div className="flex justify-center gap-1.5 pb-2 md:hidden">
                {TENOR_BANDS.map((b, i) => (
                  <span
                    key={b.days}
                    aria-hidden
                    className={`h-1.5 rounded-full transition-all ${
                      i === 0 ? "w-5 bg-brand" : "w-1.5 bg-brand/25"
                    }`}
                  />
                ))}
              </div>
            </div>

          </section>

          {/* Active plans shortcut */}
          <section className="card-surface mt-7 p-4 md:p-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-base font-extrabold">Your active plans</h2>
              <Link
                to="/portfolio"
                className="inline-flex items-center gap-0.5 text-xs font-bold text-brand"
              >
                Portfolio <ChevronRight className="size-3.5" />
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
                  <p className="shrink-0 text-sm font-bold text-num">{mask(h.amount)}</p>
                </li>
              ))}
            </ul>
          </section>

          <p className="mt-4 flex items-start gap-2 px-1 text-[11px] leading-relaxed text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
            Rates are indicative per annum and confirmed at the point of investment. Fixed plans are
            locked for the selected tenor; early liquidation terms apply.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
