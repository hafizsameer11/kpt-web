import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CalendarClock, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/kipit/AppShell";
import { DisclosureStrip } from "@/components/kipit/DisclosureStrip";
import { AmountCounter } from "@/components/kipit/motion";
import { useBalanceVisibility } from "@/hooks/useBalanceVisibility";
import {
  usePortfolioSnapshot,
  type Maturity,
  type MaturityMonth,
} from "@/lib/portfolio-data";

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

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function parseMaturityDate(raw: string): Date | null {
  if (!raw) return null;
  const iso = new Date(raw);
  if (!Number.isNaN(iso.getTime())) return iso;
  const parts = raw.split(" ");
  if (parts.length >= 3) {
    const day = Number(parts[0]);
    const mon = MONTHS.indexOf(parts[1] ?? "");
    const year = Number(parts[2]);
    if (mon >= 0 && !Number.isNaN(day) && !Number.isNaN(year)) {
      return new Date(year, mon, day);
    }
  }
  return null;
}

function formatMaturityDate(raw: string): string {
  const d = parseMaturityDate(raw);
  if (!d) return raw || "—";
  return `${String(d.getDate()).padStart(2, "0")} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function daysLeftFromDate(raw: string, fallback: number): number {
  if (fallback > 0) return fallback;
  const d = parseMaturityDate(raw);
  if (!d) return 0;
  return Math.max(0, Math.ceil((d.getTime() - Date.now()) / (24 * 60 * 60 * 1000)));
}

function enrichMaturities(rows: Maturity[]): Maturity[] {
  return rows
    .map((m) => ({
      ...m,
      date: formatMaturityDate(m.date),
      daysLeft: daysLeftFromDate(m.date, m.daysLeft),
    }))
    .sort((a, b) => a.daysLeft - b.daysLeft);
}

function groupByMonth(rows: Maturity[]): MaturityMonth[] {
  const groups = new Map<string, Maturity[]>();
  for (const m of rows) {
    const d = parseMaturityDate(m.date);
    const key = d
      ? `${MONTHS[d.getMonth()]} ${d.getFullYear()}`
      : m.date.split(" ").slice(1).join(" ") || "Upcoming";
    const list = groups.get(key) ?? [];
    list.push(m);
    groups.set(key, list);
  }
  return [...groups.entries()].map(([month, items]) => ({
    month,
    items,
    total: items.reduce((s, i) => s + i.amount, 0),
  }));
}

function useMaturityCalendar() {
  const snap = usePortfolioSnapshot();
  return useMemo(() => {
    const maturities = enrichMaturities(snap.maturities);
    return {
      maturities,
      calendar: groupByMonth(maturities),
    };
  }, [snap.maturities]);
}

function MaturityCalendarScreen() {
  const { mask, hidden } = useBalanceVisibility();
  const { maturities, calendar } = useMaturityCalendar();
  const totalDue = maturities.reduce((s, m) => s + m.amount, 0);

  return (
    <AppShell title="Maturities" navVariant="elevated">
      <DesktopMaturities maturities={maturities} calendar={calendar} />
      <div className="pb-2 md:hidden">
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
              {maturities.length} scheduled payouts
            </p>
          </div>
        </section>

        {/* Sheet */}
        <div className="relative -mx-4 -mt-8 rounded-t-[2rem] bg-background px-4 pt-5 md:mx-0 md:mt-6 md:rounded-none md:bg-transparent md:px-0 md:pt-0">
          <span
            aria-hidden
            className="mx-auto mb-4 block h-1 w-10 rounded-full bg-border md:hidden"
          />

          {calendar.length === 0 ? (
            <div className="k-rise rounded-xl border border-dashed border-border bg-card p-6 text-center">
              <p className="text-sm font-bold">No upcoming maturities</p>
              <p className="mt-1 text-[12px] text-muted-foreground">
                Active plans will appear here as they approach maturity.
              </p>
            </div>
          ) : (
            <div className="space-y-6 md:grid md:grid-cols-2 md:gap-5 md:space-y-0">
              {calendar.map((group, gi) => (
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
                      <li key={`${m.holdingId}-${m.date}`}>
                        <Link
                          to="/portfolio/$holdingId"
                          params={{ holdingId: m.holdingId }}
                          className="flex items-center gap-3 px-4 py-3.5 press"
                        >
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
                          <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}

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


/* ─────────────────────────────────────────────────────────────
   Desktop layout (md+)
   ───────────────────────────────────────────────────────────── */
function DesktopMaturities({
  maturities,
  calendar,
}: {
  maturities: Maturity[];
  calendar: MaturityMonth[];
}) {
  const { mask, hidden } = useBalanceVisibility();
  const totalDue = maturities.reduce((s, m) => s + m.amount, 0);
  const next = maturities[0];
  const in30 = maturities.filter((m) => m.daysLeft <= 30);
  const in90 = maturities.filter((m) => m.daysLeft <= 90);
  const fixed = maturities.filter((m) => m.kind === "Fixed plan");
  const explore = maturities.filter((m) => m.kind === "Explore product");
  const sum = (list: Maturity[]) => list.reduce((s, m) => s + m.amount, 0);
  const maxMonth = Math.max(...calendar.map((g) => g.total), 1);

  return (
    <div className="hidden md:block">
      <div className="mx-auto w-full max-w-[1180px] space-y-6 pb-10">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-2xl bg-brand-gradient px-8 py-8 text-primary-foreground shadow-float">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-32 size-80 rounded-full bg-gold/15 blur-[70px]"
          />
          <div className="relative grid grid-cols-[minmax(0,1fr)_auto] items-end gap-8">
            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary-foreground/60">
                Maturing over the next 12 months
              </p>
              <p className="mt-3 font-display text-[48px] font-extrabold leading-none tracking-[-0.035em] text-num">
                <AmountCounter value={totalDue} hidden={hidden} mask={mask} />
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11.5px] font-bold">
                  <CalendarClock className="size-3.5 text-gold" />
                  {maturities.length} scheduled payouts
                </span>
                {next && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11.5px] font-bold">
                    Next: {next.name} · in {next.daysLeft} days
                  </span>
                )}
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-2.5">
                <Link
                  to="/portfolio"
                  className="press inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-[12.5px] font-bold hover:bg-white/15"
                >
                  <ArrowLeft className="size-4" /> Portfolio
                </Link>
                <Link
                  to="/portfolio/history"
                  className="press inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[12.5px] font-bold text-primary-foreground/85 hover:text-primary-foreground"
                >
                  Investment history <ChevronRight className="size-4" />
                </Link>
              </div>
            </div>

            <div className="w-[300px] shrink-0 rounded-xl border border-white/12 bg-white/10 p-4 backdrop-blur">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-primary-foreground/55">
                    Next 30 days
                  </p>
                  <p className="mt-1 text-[18px] font-extrabold leading-none text-gold text-num">
                    {mask(sum(in30))}
                  </p>
                  <p className="mt-1 text-[10.5px] text-primary-foreground/55">
                    {in30.length} payouts
                  </p>
                </div>
                <div>
                  <p className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-primary-foreground/55">
                    Next 90 days
                  </p>
                  <p className="mt-1 text-[18px] font-extrabold leading-none text-num">
                    {mask(sum(in90))}
                  </p>
                  <p className="mt-1 text-[10.5px] text-primary-foreground/55">
                    {in90.length} payouts
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-[minmax(0,1fr)_320px] items-start gap-6">
          {/* Schedule table */}
          <section className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="font-display text-[17px] font-extrabold">Maturity schedule</h2>
              <span className="text-[11px] font-semibold text-muted-foreground">
                {calendar.length} months
              </span>
            </div>

            {calendar.length === 0 ? (
              <p className="px-6 py-8 text-[13px] text-muted-foreground">
                No upcoming maturities yet.
              </p>
            ) : (
              calendar.map((group) => (
                <div key={group.month}>
                  <div className="flex items-center justify-between bg-muted/30 px-6 py-2.5">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
                      {group.month}
                    </p>
                    <p className="text-[12px] font-extrabold text-num">{mask(group.total)}</p>
                  </div>
                  <ul>
                    {group.items.map((m) => (
                      <li key={`${m.holdingId}-${m.date}`} className="border-b border-border/60 last:border-0">
                        <Link
                          to="/portfolio/$holdingId"
                          params={{ holdingId: m.holdingId }}
                          className="flex items-center gap-4 px-6 py-3.5 transition-colors hover:bg-secondary/50 focus-visible:bg-secondary/50 focus-visible:outline-none"
                        >
                        <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-secondary text-[12px] font-extrabold text-brand text-num">
                          {m.date.split(" ")[0]}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13.5px] font-bold">{m.name}</p>
                          <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                            {m.date} · in {m.daysLeft} days
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-brand">
                          {m.kind}
                        </span>
                          <p className="w-[130px] shrink-0 text-right text-[14px] font-extrabold text-num">
                            {mask(m.amount)}
                          </p>
                          <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </section>

          {/* Right rail */}
          <div className="space-y-6">
            <section className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-display text-[15px] font-extrabold">By month</h2>
              <ul className="mt-4 space-y-3">
                {calendar.map((g) => (
                  <li key={g.month}>
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-[11.5px] font-semibold text-muted-foreground">{g.month}</p>
                      <p className="text-[12px] font-extrabold text-num">{mask(g.total)}</p>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
                      <span
                        className="block h-full rounded-full bg-brand"
                        style={{ width: `${(g.total / maxMonth) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-display text-[15px] font-extrabold">By source</h2>
              <div className="mt-4 space-y-3 border-t border-border/60 pt-4">
                {[
                  { label: "Fixed plans", list: fixed },
                  { label: "Explore products", list: explore },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[12px] font-bold">{row.label}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {row.list.length} payouts
                      </p>
                    </div>
                    <p className="font-display text-[17px] font-extrabold leading-none text-brand text-num">
                      {mask(sum(row.list))}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <Link
              to="/portfolio/history"
              className="press flex items-center justify-between rounded-2xl border border-border bg-card px-5 py-4"
            >
              <span className="text-[13px] font-bold">View investment history</span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>

            <DisclosureStrip variant="fixed" />
          </div>
        </div>
      </div>
    </div>
  );
}
