import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, PiggyBank, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/kipit/AppShell";
import { useBalanceVisibility } from "@/hooks/useBalanceVisibility";
import { naira, HOLDINGS, INVESTED, MONTH_CHANGE_PCT } from "@/lib/home-data";
import { CALL_ACCOUNT, TENOR_BANDS } from "@/lib/invest-data";

export const Route = createFileRoute("/invest-v1")({
  head: () => ({
    meta: [
      { title: "Invest V1 — Kipit Neo-bank Concept" },
      {
        name: "description",
        content:
          "Kipit Invest concept one: a neo-bank layout with a navy portfolio header, an overlapping Call Account card and a fixed-plan carousel.",
      },
      { property: "og:title", content: "Invest V1 — Kipit Neo-bank Concept" },
      {
        property: "og:description",
        content:
          "A premium neo-bank take on the Kipit Invest screen with transparent rates, tenors and minimums.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InvestV1,
});

const ACCENTS = [
  "bg-gold/15 text-gold-strong",
  "bg-brand/10 text-brand",
  "bg-accent text-accent-foreground",
  "bg-emerald-500/10 text-emerald-700",
];

function InvestV1() {
  const { mask } = useBalanceVisibility();

  return (
    <AppShell title="Invest" navVariant="elevated">
      <div className="pb-2">
        {/* Portfolio header */}
        <section className="relative -mx-4 overflow-hidden bg-brand px-5 pb-24 pt-8 text-primary-foreground md:mx-0 md:rounded-[2.5rem] md:px-8 md:pb-28 md:pt-12">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-24 size-64 rounded-full bg-gold/15 blur-[70px]"
          />
          <div className="relative flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">
                Invest
              </h1>
              <p className="mt-1 text-[12px] text-primary-foreground/60">
                Total portfolio value
              </p>
              <div className="mt-2 flex flex-wrap items-baseline gap-2">
                <span className="text-num text-[32px] font-extrabold leading-none md:text-[42px]">
                  {mask(INVESTED)}
                </span>
                <span className="text-sm font-bold text-gold">
                  +{MONTH_CHANGE_PCT}%
                </span>
              </div>
            </div>
            <span className="grid size-10 shrink-0 place-items-center rounded-full border border-white/15 bg-white/10">
              <ShieldCheck className="size-5" strokeWidth={1.8} />
            </span>
          </div>
        </section>

        {/* Overlapping content */}
        <div className="relative -mt-16 space-y-8 md:-mt-20">
          {/* Call Account */}
          <section className="card-surface p-5 shadow-float md:p-7">
            <div className="mb-4 flex items-start justify-between">
              <span className="grid size-12 place-items-center rounded-2xl bg-accent text-accent-foreground">
                <PiggyBank className="size-6" strokeWidth={1.8} />
              </span>
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
                Active
              </span>
            </div>
            <h2 className="font-display text-lg font-extrabold">
              {CALL_ACCOUNT.name}
            </h2>
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
              {CALL_ACCOUNT.blurb}
            </p>

            <div className="mt-5 flex items-end justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Interest rate
                </p>
                <p className="mt-0.5 truncate text-base font-extrabold">
                  {CALL_ACCOUNT.rate}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {CALL_ACCOUNT.liquidity} · min {naira(CALL_ACCOUNT.minimum)}
                </p>
              </div>
              <button
                type="button"
                className="shrink-0 rounded-full bg-brand px-6 py-3 text-xs font-bold text-brand-foreground press"
              >
                Invest now
              </button>
            </div>
          </section>

          {/* Fixed plans carousel */}
          <section>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-display text-lg font-extrabold">Fixed plans</h2>
              <button
                type="button"
                className="inline-flex shrink-0 items-center gap-0.5 text-xs font-bold text-brand"
              >
                See all <ChevronRight className="size-3.5" />
              </button>
            </div>

            <div className="-mx-4 md:mx-0">
              <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-4 md:overflow-visible md:px-0">
                {TENOR_BANDS.map((band, i) => (
                  <article
                    key={band.days}
                    className="w-[15rem] shrink-0 snap-start rounded-[1.75rem] border border-border bg-secondary p-5 transition-shadow hover:shadow-float md:w-auto"
                  >
                    <span
                      className={`mb-4 inline-grid size-11 place-items-center rounded-2xl text-xs font-extrabold ${ACCENTS[i % ACCENTS.length]}`}
                    >
                      {band.days.replace(" days", "d")}
                    </span>
                    <h3 className="font-display text-base font-extrabold">
                      {band.days} plan
                    </h3>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Locked for {band.days}
                    </p>
                    <p className="mt-4 text-2xl font-extrabold text-num">
                      {band.rate}{" "}
                      <span className="text-[11px] font-semibold text-muted-foreground">
                        p.a.
                      </span>
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Min {naira(band.minimum)}
                    </p>
                  </article>
                ))}
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
