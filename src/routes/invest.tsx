import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Calculator,
  ChevronRight,
  Gift,
  Plus,
  RefreshCw,
  Repeat,
  ShieldCheck,
} from "lucide-react";
import { AppShell } from "@/components/kipit/AppShell";
import { useBalanceVisibility } from "@/hooks/useBalanceVisibility";
import { naira, HOLDINGS } from "@/lib/home-data";
import { CALL_ACCOUNT, TENOR_BANDS } from "@/lib/invest-data";

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
        <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-12 pt-9 text-primary-foreground md:mx-0 md:rounded-[2.5rem] md:px-8 md:pb-14 md:pt-12 md:shadow-float">
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
                {CALL_ACCOUNT.liquidity} &middot; min {naira(CALL_ACCOUNT.minimum)} &middot; earned
                today {mask(CALL_ACCOUNT.accruedToday)}
              </p>

              <div className="mt-5 flex flex-wrap gap-2.5">
                <button
                  type="button"
                  className="inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-gold-gradient px-3 py-3 text-[11px] font-extrabold text-gold-foreground press"
                >
                  Add money <ArrowUpRight className="size-3.5" />
                </button>
                <button
                  type="button"
                  className="inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-white/20 bg-white/10 px-3 py-3 text-[11px] font-bold text-primary-foreground press"
                >
                  Withdraw <ArrowDownLeft className="size-3.5" />
                </button>
                <Link
                  to="/portfolio"
                  className="inline-flex flex-1 items-center justify-center whitespace-nowrap rounded-full border border-white/20 bg-white/10 px-3 py-3 text-[11px] font-bold text-primary-foreground press"
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

            {/* Fixed plans grid */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              {TENOR_BANDS.map((band, i) => {
                const featured = i === 1;
                return (
                  <article
                    key={band.days}
                    className={`relative flex flex-col justify-between overflow-hidden rounded-[1.5rem] p-4 md:rounded-[2rem] md:p-5 ${
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
                            ? "bg-gold-gradient text-gold-foreground"
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

          {/* Active plans shortcut */}
          <section className="mt-7">
            <div className="mb-3 flex items-center justify-between px-1">
              <h2 className="font-display text-base font-extrabold">Your active plans</h2>
              <Link
                to="/portfolio"
                className="inline-flex items-center gap-0.5 text-xs font-bold text-brand"
              >
                Portfolio <ChevronRight className="size-3.5" />
              </Link>
            </div>
            <ul className="space-y-3">
              {HOLDINGS.map((h) => {
                const progress = Math.min(
                  100,
                  Math.max(6, Math.round(((h.totalDays - h.daysLeft) / h.totalDays) * 100)),
                );
                return (
                  <li
                    key={h.name}
                    className="card-surface relative overflow-hidden p-4 transition-shadow hover:shadow-md"
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
                          className="h-full rounded-full bg-brand"
                          style={{ width: `${progress}%` }}
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
          </section>

          {/* Invest tools — MOB-069 / MOB-071 / MOB-072 / MOB-075 entry points */}
          <section className="mt-7">
            <h2 className="mb-3 px-1 font-display text-base font-extrabold">Invest tools</h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                { icon: Calculator, label: "Calculator", note: "Model your payout" },
                { icon: Repeat, label: "Auto-invest", note: "Fund on a schedule" },
                { icon: Gift, label: "Gift invest", note: "Send a plan" },
                { icon: RefreshCw, label: "Roll over", note: "Reinvest at maturity" },
              ].map((t) => (
                <button
                  key={t.label}
                  type="button"
                  className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-3.5 text-left shadow-sm transition-all hover:border-brand/20 hover:shadow-md"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-muted text-brand">
                    <t.icon className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13px] font-bold text-foreground">{t.label}</span>
                    <span className="block text-[11px] leading-snug text-muted-foreground">
                      {t.note}
                    </span>
                  </span>
                </button>
              ))}
            </div>
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
