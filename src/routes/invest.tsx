import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  ChevronRight,
  Clock,
  Lock,
  PiggyBank,
  ShieldCheck,
  Wallet,
} from "lucide-react";
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
        <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-12 pt-6 text-primary-foreground md:mx-0 md:rounded-[2rem] md:px-8 md:pb-8 md:pt-8 md:shadow-float">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-gold/25 blur-3xl"
          />
          <div className="relative max-w-xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-foreground/60">
              Invest
            </p>
            <h1 className="mt-2 font-display text-[26px] font-extrabold leading-tight tracking-[-0.03em] md:text-4xl">
              Kipit's own investment products
            </h1>
            <p className="mt-2 text-xs text-primary-foreground/75 md:text-sm">
              Every product shows its rate, liquidity or tenor, and minimum before you commit.
            </p>
            <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-primary-foreground/85">
              <Wallet className="size-3.5" /> Wallet available {mask(500_000)}
            </p>
          </div>
        </section>

        {/* ── Sheet ─────────────────────────────────────────────────── */}
        <div className="relative -mx-4 -mt-7 rounded-t-[2rem] bg-background px-4 pt-5 md:mx-0 md:mt-6 md:rounded-none md:bg-transparent md:px-0 md:pt-0">
          <span
            aria-hidden
            className="mx-auto mb-4 block h-1 w-10 rounded-full bg-border md:hidden"
          />

          {/* Call Account (MOB-061 entry) */}
          <section className="card-surface overflow-hidden p-4 md:p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-accent text-accent-foreground">
                  <PiggyBank className="size-5" strokeWidth={1.9} />
                </span>
                <div className="min-w-0">
                  <h2 className="truncate font-display text-base font-extrabold md:text-lg">
                    {CALL_ACCOUNT.name}
                  </h2>
                  <p className="text-[11px] text-muted-foreground">
                    {CALL_ACCOUNT.liquidity}
                  </p>
                </div>
              </div>
              <span className="shrink-0 rounded-full bg-gold-gradient px-3 py-1 text-[11px] font-extrabold text-gold-foreground">
                {CALL_ACCOUNT.rate}
              </span>
            </div>

            <dl className="mt-4 grid grid-cols-3 gap-2">
              {[
                { k: "Balance", v: mask(CALL_ACCOUNT.balance) },
                { k: "Earned today", v: mask(CALL_ACCOUNT.accruedToday) },
                { k: "Minimum", v: naira(CALL_ACCOUNT.minimum) },
              ].map((s) => (
                <div key={s.k} className="rounded-2xl bg-secondary px-3 py-2.5">
                  <dt className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    {s.k}
                  </dt>
                  <dd className="mt-1 truncate text-sm font-extrabold text-num">{s.v}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
              {CALL_ACCOUNT.blurb}
            </p>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-brand px-5 py-3 text-xs font-bold text-brand-foreground press"
              >
                Add money <ArrowUpRight className="size-3.5" />
              </button>
              <Link
                to="/portfolio"
                className="inline-flex flex-1 items-center justify-center rounded-full border border-border px-5 py-3 text-xs font-bold press"
              >
                View activity
              </Link>
            </div>
          </section>

          {/* Fixed plans (MOB-065) */}
          <section className="mt-5">
            <div className="mb-2.5 flex items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-base font-extrabold">Fixed investment plans</h2>
                <p className="text-[11px] text-muted-foreground">
                  Lock a tenor, know your payout upfront.
                </p>
              </div>
              <button
                type="button"
                className="inline-flex shrink-0 items-center gap-0.5 text-xs font-bold text-brand"
              >
                New plan <ChevronRight className="size-3.5" />
              </button>
            </div>

            {/* Tenor / rate overview */}
            <div className="card-surface mb-3 flex gap-2 overflow-x-auto p-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {TENOR_BANDS.map((b) => (
                <div
                  key={b.days}
                  className="min-w-[86px] flex-1 rounded-2xl bg-secondary px-3 py-2.5 text-center"
                >
                  <p className="text-[10px] font-semibold text-muted-foreground">{b.days}</p>
                  <p className="mt-0.5 text-sm font-extrabold text-brand text-num">{b.rate}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-2.5 md:grid-cols-2 md:gap-4">
              {FIXED_PLANS.map((p) => (
                <article
                  key={p.name}
                  className="card-surface p-4 md:p-5 md:transition-all md:hover:-translate-y-0.5 md:hover:shadow-float"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-sm font-bold md:text-base">{p.name}</h3>
                        {p.tag && (
                          <span className="rounded-full bg-accent px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-accent-foreground">
                            {p.tag}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                        {p.blurb}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-brand px-3 py-1 text-[11px] font-extrabold text-brand-foreground text-num">
                      {p.rate}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="size-3.5" /> {p.tenor}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Lock className="size-3.5" /> Min {naira(p.minimum)}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-gold-gradient px-5 py-3 text-xs font-bold text-gold-foreground press"
                  >
                    Invest now <ArrowUpRight className="size-3.5" />
                  </button>
                </article>
              ))}
            </div>
          </section>

          {/* Active plans shortcut */}
          <section className="card-surface mt-5 p-4 md:p-6">
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
