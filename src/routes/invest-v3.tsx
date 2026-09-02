import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, ChevronRight, ShieldCheck, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/kipit/AppShell";
import { useBalanceVisibility } from "@/hooks/useBalanceVisibility";
import { naira, HOLDINGS } from "@/lib/home-data";
import { CALL_ACCOUNT, TENOR_BANDS } from "@/lib/invest-data";

export const Route = createFileRoute("/invest-v3")({
  head: () => ({
    meta: [
      { title: "Invest V3 — Kipit Glass Concept" },
      {
        name: "description",
        content:
          "Kipit Invest concept three: a deep navy glass canvas with a gradient Call Account card and a two-column fixed-plan grid.",
      },
      { property: "og:title", content: "Invest V3 — Kipit Glass Concept" },
      {
        property: "og:description",
        content:
          "A glassmorphic take on the Kipit Invest screen with transparent rates, tenors and minimums.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InvestV3,
});

function InvestV3() {
  const { mask } = useBalanceVisibility();

  return (
    <AppShell title="Invest" navVariant="orbit">
      <div className="-mx-4 min-h-screen bg-brand px-4 pb-6 pt-8 text-primary-foreground md:mx-0 md:rounded-[2.5rem] md:px-8 md:pt-10">
        <span
          aria-hidden
          className="pointer-events-none fixed -right-24 top-0 size-72 rounded-full bg-gold/15 blur-[80px]"
        />
        <span
          aria-hidden
          className="pointer-events-none fixed -left-24 top-1/2 size-72 rounded-full bg-white/10 blur-[80px]"
        />

        <div className="relative space-y-7">
          {/* Hero */}
          <header>
            <h1 className="font-display text-3xl font-extrabold tracking-tight">
              Invest
            </h1>
            <p className="mt-1 text-[13px] text-primary-foreground/60">
              Grow your wealth with Kipit's own plans
            </p>
          </header>

          {/* Call account gradient card */}
          <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/8 p-6 backdrop-blur-xl">
            <span
              aria-hidden
              className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-gold/20 blur-[40px]"
            />
            <div className="relative">
              <div className="flex items-start justify-between gap-3">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-primary-foreground/60">
                  Call account
                </span>
                <span className="rounded-full bg-gold-gradient px-3 py-1 text-[11px] font-extrabold text-gold-foreground">
                  {CALL_ACCOUNT.rate}
                </span>
              </div>
              <p className="mt-5 text-[12px] text-primary-foreground/60">Balance</p>
              <p className="mt-1 text-num text-[32px] font-extrabold leading-none">
                {mask(CALL_ACCOUNT.balance)}
              </p>
              <p className="mt-2 text-[11px] text-primary-foreground/55">
                {CALL_ACCOUNT.liquidity} · earned today{" "}
                {mask(CALL_ACCOUNT.accruedToday)}
              </p>

              <div className="mt-6 flex gap-2">
                <button
                  type="button"
                  className="flex-1 rounded-2xl bg-gold-gradient py-3 text-xs font-bold text-gold-foreground press"
                >
                  Add money
                </button>
                <Link
                  to="/portfolio"
                  className="flex-1 rounded-2xl border border-white/15 bg-white/10 py-3 text-center text-xs font-bold text-primary-foreground press"
                >
                  Activity
                </Link>
              </div>
            </div>
          </section>

          {/* Fixed plans grid */}
          <section>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-display text-lg font-extrabold">Fixed plans</h2>
              <button
                type="button"
                className="inline-flex shrink-0 items-center gap-0.5 text-xs font-bold text-gold"
              >
                View all <ChevronRight className="size-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {TENOR_BANDS.map((band) => (
                <article
                  key={band.days}
                  className="rounded-[1.5rem] border border-white/10 bg-white/8 p-4 backdrop-blur-xl transition-colors hover:bg-white/12"
                >
                  <span className="grid size-10 place-items-center rounded-xl bg-gold/15">
                    <TrendingUp className="size-4 text-gold" strokeWidth={2.2} />
                  </span>
                  <p className="mt-3 text-[9px] font-extrabold uppercase tracking-[0.16em] text-primary-foreground/50">
                    Fixed tenor
                  </p>
                  <p className="mt-1 text-sm font-extrabold">{band.days}</p>
                  <p className="mt-3 text-xl font-extrabold text-gold">{band.rate}</p>
                  <p className="text-[10px] text-primary-foreground/50">
                    p.a. · min {naira(band.minimum)}
                  </p>
                </article>
              ))}
            </div>
          </section>

          {/* Active plans */}
          <section className="rounded-[2rem] border border-white/10 bg-white/8 p-5 backdrop-blur-xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-base font-extrabold">
                Your active plans
              </h2>
              <Link
                to="/portfolio"
                className="inline-flex items-center gap-0.5 text-xs font-bold text-gold"
              >
                Portfolio <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
            <ul className="space-y-3">
              {HOLDINGS.map((h) => (
                <li key={h.name} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{h.name}</p>
                    <p className="text-[11px] text-primary-foreground/55">
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

          <p className="flex items-start gap-2 px-1 text-[11px] leading-relaxed text-primary-foreground/55">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
            Rates are indicative per annum and confirmed at the point of investment. Fixed
            plans are locked for the selected tenor; early liquidation terms apply.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
