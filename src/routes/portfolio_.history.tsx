import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ChevronRight, History } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/kipit/AppShell";
import { DisclosureStrip } from "@/components/kipit/DisclosureStrip";
import { AmountCounter } from "@/components/kipit/motion";
import { useBalanceVisibility } from "@/hooks/useBalanceVisibility";
import {
  INVESTMENT_HISTORY,
  type InvestmentStatus,
} from "@/lib/portfolio-data";

export const Route = createFileRoute("/portfolio_/history")({
  head: () => ({
    meta: [
      { title: "Investment History | Kipit" },
      {
        name: "description",
        content:
          "Review every Kipit investment — active, matured and closed — with principal, rate, dates and interest earned.",
      },
      { property: "og:title", content: "Investment History | Kipit" },
      {
        property: "og:description",
        content:
          "Your full Kipit investment record: principal, rate, tenor dates and interest earned on each plan and product.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InvestmentHistoryScreen,
});

const FILTERS: InvestmentStatus[] = ["Active", "Matured", "Closed"];

function InvestmentHistoryScreen() {
  const { mask, hidden } = useBalanceVisibility();
  const [filter, setFilter] = useState<InvestmentStatus>("Active");
  const records = INVESTMENT_HISTORY.filter((r) => r.status === filter);
  const interestTotal = INVESTMENT_HISTORY.reduce((s, r) => s + r.interest, 0);

  return (
    <AppShell title="Investment history" navVariant="elevated">
      {/* ── Desktop (md+) ───────────────────────────────────────── */}
      <div className="hidden md:block">
        <div className="mx-auto w-full max-w-[1080px] space-y-6 pb-10">
          <section className="relative overflow-hidden rounded-2xl bg-brand-gradient px-8 py-8 text-primary-foreground shadow-float">
            <span
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-32 size-80 rounded-full bg-gold/15 blur-[70px]"
            />
            <div className="relative flex flex-wrap items-end justify-between gap-8">
              <div>
                <Link
                  to="/portfolio"
                  className="press inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[12px] font-bold hover:bg-white/15"
                >
                  <ArrowLeft className="size-4" /> Portfolio
                </Link>
                <p className="mt-6 text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary-foreground/60">
                  Interest earned all-time
                </p>
                <p className="mt-1 font-display text-[46px] font-extrabold leading-none tracking-[-0.035em] text-num">
                  <AmountCounter value={interestTotal} hidden={hidden} mask={mask} />
                </p>
              </div>
              <div className="flex gap-3">
                {FILTERS.map((f) => {
                  const count = INVESTMENT_HISTORY.filter((r) => r.status === f).length;
                  const active = f === filter;
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFilter(f)}
                      className={`press rounded-xl px-5 py-3 text-left transition-colors ${
                        active
                          ? "bg-gold text-brand shadow-float"
                          : "bg-white/10 text-primary-foreground hover:bg-white/15"
                      }`}
                    >
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] opacity-70">
                        {f}
                      </p>
                      <p className="mt-0.5 font-display text-[20px] font-extrabold text-num">
                        {count}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="font-display text-[17px] font-extrabold">
                {filter} investments
              </h2>
              <Link
                to="/portfolio/transactions"
                className="inline-flex items-center gap-1 text-[12px] font-bold text-brand hover:underline"
              >
                Transaction history <ChevronRight className="size-3.5" />
              </Link>
            </div>
            {records.length > 0 ? (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
                    <th className="px-6 py-3">Investment</th>
                    <th className="px-4 py-3">Rate</th>
                    <th className="px-4 py-3">Principal</th>
                    <th className="px-4 py-3">Interest</th>
                    <th className="px-4 py-3">Period</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-6 py-3" aria-label="Open" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {records.map((r) => (
                    <tr
                      key={r.id}
                      onClick={() =>
                        r.holdingId &&
                        navigate({
                          to: "/portfolio/$holdingId",
                          params: { holdingId: r.holdingId },
                        })
                      }
                      className={`transition-colors hover:bg-secondary/40 ${
                        r.holdingId ? "cursor-pointer" : ""
                      }`}
                    >
                      <td className="px-6 py-4">
                        <p className="text-[13.5px] font-extrabold">{r.name}</p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">{r.kind}</p>
                      </td>
                      <td className="px-4 py-4 text-[12.5px] font-bold text-gold">{r.rate}</td>
                      <td className="px-4 py-4 text-[13px] font-bold text-num">{mask(r.principal)}</td>
                      <td className="px-4 py-4 text-[13px] font-extrabold text-gold text-num">
                        {mask(r.interest)}
                      </td>
                      <td className="px-4 py-4 text-[11.5px] text-muted-foreground">
                        {r.startDate} → {r.endDate}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] ${
                            r.status === "Active"
                              ? "bg-gold/15 text-gold"
                              : r.status === "Matured"
                                ? "bg-brand/10 text-brand"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {r.holdingId && (
                          <ChevronRight className="ml-auto size-4 text-muted-foreground" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="px-6 py-12 text-center text-[12.5px] text-muted-foreground">
                No {filter.toLowerCase()} investments yet.
              </p>
            )}
          </section>
        </div>
      </div>

      <div className="pb-2 md:hidden">
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
              Interest earned all-time
            </p>
            <h1 className="k-rise mt-1 font-display text-[32px] font-extrabold leading-none tracking-[-0.035em] text-num md:text-[42px]">
              <AmountCounter value={interestTotal} hidden={hidden} mask={mask} />
            </h1>
            <p
              className="k-rise mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold"
              style={{ ["--d" as string]: "80ms" }}
            >
              <History className="size-3.5 text-gold" />
              {INVESTMENT_HISTORY.length} investments on record
            </p>
          </div>
        </section>

        <div className="relative -mx-4 -mt-8 rounded-t-[2rem] bg-background px-4 pt-5 md:mx-0 md:mt-6 md:rounded-none md:bg-transparent md:px-0 md:pt-0">
          <span
            aria-hidden
            className="mx-auto mb-4 block h-1 w-10 rounded-full bg-border md:hidden"
          />

          {/* Filters */}
          <div className="flex gap-2">
            {FILTERS.map((f) => {
              const count = INVESTMENT_HISTORY.filter((r) => r.status === f).length;
              const active = f === filter;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`flex-1 rounded-full border py-2 text-[12px] font-bold transition-colors press ${
                    active
                      ? "border-brand bg-brand text-brand-foreground"
                      : "border-border bg-card text-muted-foreground"
                  }`}
                >
                  {f} · {count}
                </button>
              );
            })}
          </div>

          {/* Records */}
          <ul className="mt-4 space-y-3 md:grid md:grid-cols-2 md:gap-3 md:space-y-0">
            {records.map((r, i) => {
              const body = (
                <div className="card-surface relative block overflow-hidden p-4 transition-shadow hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[13.5px] font-extrabold">{r.name}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {r.kind} · {r.rate}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] ${
                        r.status === "Active"
                          ? "bg-gold/15 text-gold"
                          : r.status === "Matured"
                            ? "bg-brand/10 text-brand"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>

                  <div className="mt-3.5 grid grid-cols-2 gap-y-3 border-t border-border/60 pt-3.5">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                        Principal
                      </p>
                      <p className="mt-0.5 text-[14px] font-extrabold text-num">
                        {mask(r.principal)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                        Interest
                      </p>
                      <p className="mt-0.5 text-[14px] font-extrabold text-gold text-num">
                        {mask(r.interest)}
                      </p>
                    </div>
                    <div className="col-span-2 flex items-center justify-between">
                      <p className="text-[11px] text-muted-foreground">
                        {r.startDate} → {r.endDate}
                      </p>
                      {r.holdingId && (
                        <ChevronRight className="size-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>
              );

              return (
                <li key={r.id} className="k-rise" style={{ ["--d" as string]: `${i * 60}ms` }}>
                  {r.holdingId ? (
                    <Link to="/portfolio/$holdingId" params={{ holdingId: r.holdingId }}>
                      {body}
                    </Link>
                  ) : (
                    body
                  )}
                </li>
              );
            })}
          </ul>

          {records.length === 0 && (
            <p className="mt-6 rounded-xl border border-dashed border-border px-4 py-8 text-center text-[12.5px] text-muted-foreground">
              No {filter.toLowerCase()} investments yet.
            </p>
          )}

          <Link
            to="/portfolio/transactions"
            className="mt-6 flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3.5 press"
          >
            <span className="text-[13px] font-bold">View transaction history</span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Link>

          <DisclosureStrip variant="fixed" />
        </div>
      </div>
    </AppShell>
  );
}
