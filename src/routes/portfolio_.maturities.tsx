import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CalendarClock, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/kipit/AppShell";
import { DisclosureStrip } from "@/components/kipit/DisclosureStrip";
import { AmountCounter } from "@/components/kipit/motion";
import { useBalanceVisibility } from "@/hooks/useBalanceVisibility";
import { MATURITY_CALENDAR, UPCOMING_MATURITIES } from "@/lib/portfolio-data";

export const Route = createFileRoute("/portfolio_/maturities")({
  head: () => ({
    meta: [
      { title: "Maturity Calendar | Kipit" },
      {
        name: "description",
        content:
          "See every upcoming Kipit maturity by month — product, amount and maturity date for your fixed plans and marketplace holdings.",
      },
      { property: "og:title", content: "Maturity Calendar | Kipit" },
      {
        property: "og:description",
        content:
          "Every upcoming payout across your Kipit fixed plans and marketplace holdings, grouped by month.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MaturityCalendarScreen,
});

function MaturityCalendarScreen() {
  const { mask, hidden } = useBalanceVisibility();
  const totalDue = UPCOMING_MATURITIES.reduce((s, m) => s + m.amount, 0);

  return (
    <AppShell title="Maturities" navVariant="elevated">
      <div className="pb-2">
        {/* Hero */}
        <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-14 pt-6 text-primary-foreground md:mx-0 md:rounded-xl md:px-8 md:pt-8 md:shadow-float">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-32 size-72 rounded-full bg-gold/15 blur-[64px]"
          />
          <div className="relative md:max-w-3xl">
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold press"
            >
              <ArrowLeft className="size-3.5" /> Portfolio
            </Link>

            <p className="k-rise mt-6 text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary-foreground/60">
              Maturing over the next 12 months
            </p>
            <h1 className="k-rise mt-1 font-display text-[32px] font-extrabold leading-none tracking-[-0.035em] text-num md:text-[42px]">
              <AmountCounter value={totalDue} hidden={hidden} mask={mask} />
            </h1>
            <p
              className="k-rise mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold"
              style={{ ["--d" as string]: "80ms" }}
            >
              <CalendarClock className="size-3.5 text-gold" />
              {UPCOMING_MATURITIES.length} scheduled payouts
            </p>
          </div>
        </section>

        {/* Sheet */}
        <div className="relative -mx-4 -mt-8 rounded-t-[2rem] bg-background px-4 pt-5 md:mx-0 md:mt-6 md:rounded-none md:bg-transparent md:px-0 md:pt-0">
          <span
            aria-hidden
            className="mx-auto mb-4 block h-1 w-10 rounded-full bg-border md:hidden"
          />

          <div className="space-y-6 md:grid md:grid-cols-2 md:gap-5 md:space-y-0">
            {MATURITY_CALENDAR.map((group, gi) => (
              <section
                key={group.month}
                className="k-rise"
                style={{ ["--d" as string]: `${gi * 70}ms` }}
              >
                <div className="mb-2.5 flex items-baseline justify-between px-1">
                  <h2 className="font-display text-[15px] font-extrabold">{group.month}</h2>
                  <span className="text-[11px] font-semibold text-muted-foreground text-num">
                    {mask(group.total)}
                  </span>
                </div>

                <ul className="card-surface divide-y divide-border/60 overflow-hidden">
                  {group.items.map((m) => (
                    <li key={`${m.name}-${m.date}`}>
                      <div className="flex items-center gap-3 px-4 py-3.5">
                        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-secondary text-[11px] font-extrabold text-brand text-num">
                          {m.date.split(" ")[0]}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-bold">{m.name}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {m.kind} · in {m.daysLeft} days
                          </p>
                        </div>
                        <p className="shrink-0 text-[13px] font-extrabold text-num">
                          {mask(m.amount)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <Link
            to="/portfolio/history"
            className="mt-6 flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3.5 press"
          >
            <span className="text-[13px] font-bold">View investment history</span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Link>

          <DisclosureStrip variant="fixed" />
        </div>
      </div>
    </AppShell>
  );
}
