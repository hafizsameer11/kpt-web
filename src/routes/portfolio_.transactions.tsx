import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  ChevronRight,
  Filter,
} from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/kipit/AppShell";
import { AmountCounter } from "@/components/kipit/motion";
import { useBalanceVisibility } from "@/hooks/useBalanceVisibility";
import {
  TRANSACTIONS,
  TXN_TYPES,
  type TxnStatus,
  type TxnType,
} from "@/lib/portfolio-data";

export const Route = createFileRoute("/portfolio_/transactions")({
  head: () => ({
    meta: [
      { title: "Transaction History | Kipit" },
      {
        name: "description",
        content:
          "Every Kipit deposit, investment, interest credit, withdrawal and adjustment — filter by type, date and status.",
      },
      { property: "og:title", content: "Transaction History | Kipit" },
      {
        property: "og:description",
        content:
          "Filter your Kipit transactions by type, period and status, and open any entry for full details.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TransactionHistoryScreen,
});

const STATUSES: TxnStatus[] = ["Successful", "Processing", "Pending", "Failed"];
const PERIODS = ["All time", "Last 30 days", "Last 90 days"] as const;

const statusTone: Record<TxnStatus, string> = {
  Successful: "bg-brand/10 text-brand",
  Processing: "bg-gold/15 text-gold",
  Pending: "bg-muted text-muted-foreground",
  Failed: "bg-destructive/10 text-destructive",
};

/** Prototype period filter — parses the "DD Mon YYYY" display dates. */
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const parse = (d: string) => {
  const [day, mon, year] = d.split(" ");
  return new Date(Number(year), MONTHS.indexOf(mon ?? ""), Number(day)).getTime();
};
const NOW = parse("03 Sep 2026");

function TransactionHistoryScreen() {
  const { mask, hidden } = useBalanceVisibility();
  const [type, setType] = useState<TxnType | "All">("All");
  const [status, setStatus] = useState<TxnStatus | "All">("All");
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>("All time");

  const list = TRANSACTIONS.filter((t) => {
    if (type !== "All" && t.type !== type) return false;
    if (status !== "All" && t.status !== status) return false;
    if (period !== "All time") {
      const days = period === "Last 30 days" ? 30 : 90;
      if (NOW - parse(t.date) > days * 864e5) return false;
    }
    return true;
  });

  const inflow = list
    .filter((t) => t.direction === "in" && t.status !== "Failed")
    .reduce((s, t) => s + t.amount, 0);

  return (
    <AppShell title="Transactions" navVariant="elevated">
      <div className="pb-2">
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
              Money in · filtered view
            </p>
            <h1 className="k-rise mt-1 font-display text-[32px] font-extrabold leading-none tracking-[-0.035em] text-num md:text-[42px]">
              <AmountCounter value={inflow} hidden={hidden} mask={mask} />
            </h1>
            <p
              className="k-rise mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold"
              style={{ ["--d" as string]: "80ms" }}
            >
              <Filter className="size-3.5 text-gold" />
              {list.length} transactions
            </p>
          </div>
        </section>

        <div className="relative -mx-4 -mt-8 rounded-t-[2rem] bg-background px-4 pt-5 md:mx-0 md:mt-6 md:rounded-none md:bg-transparent md:px-0 md:pt-0">
          <span
            aria-hidden
            className="mx-auto mb-4 block h-1 w-10 rounded-full bg-border md:hidden"
          />

          {/* Type filter */}
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar">
            {(["All", ...TXN_TYPES] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`shrink-0 rounded-full border px-3.5 py-2 text-[12px] font-bold transition-colors press ${
                  type === t
                    ? "border-brand bg-brand text-brand-foreground"
                    : "border-border bg-card text-muted-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Date + status filter */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <select
              aria-label="Filter by period"
              value={period}
              onChange={(e) => setPeriod(e.target.value as (typeof PERIODS)[number])}
              className="rounded-lg border border-border bg-card px-3 py-2.5 text-[12px] font-bold text-foreground outline-none"
            >
              {PERIODS.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
            <select
              aria-label="Filter by status"
              value={status}
              onChange={(e) => setStatus(e.target.value as TxnStatus | "All")}
              className="rounded-lg border border-border bg-card px-3 py-2.5 text-[12px] font-bold text-foreground outline-none"
            >
              <option value="All">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* List */}
          <ul className="mt-4 card-surface divide-y divide-border/60 overflow-hidden">
            {list.map((t, i) => (
              <li key={t.id} className="k-rise" style={{ ["--d" as string]: `${i * 45}ms` }}>
                <Link
                  to="/portfolio/transactions/$txnId"
                  params={{ txnId: t.id }}
                  className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-secondary/50"
                >
                  <span
                    className={`grid size-10 shrink-0 place-items-center rounded-lg ${
                      t.direction === "in"
                        ? "bg-gold/15 text-gold"
                        : "bg-secondary text-brand"
                    }`}
                  >
                    {t.direction === "in" ? (
                      <ArrowDownLeft className="size-4.5" strokeWidth={2.4} />
                    ) : (
                      <ArrowUpRight className="size-4.5" strokeWidth={2.4} />
                    )}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-bold">{t.label}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      {t.date}
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-extrabold ${statusTone[t.status]}`}
                      >
                        {t.status}
                      </span>
                    </p>
                  </div>

                  <p
                    className={`shrink-0 text-[13px] font-extrabold text-num ${
                      t.direction === "in" ? "text-gold" : "text-foreground"
                    }`}
                  >
                    {t.direction === "in" ? "+" : "−"}
                    {mask(t.amount)}
                  </p>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>

          {list.length === 0 && (
            <p className="mt-4 rounded-xl border border-dashed border-border px-4 py-8 text-center text-[12.5px] text-muted-foreground">
              No transactions match these filters.
            </p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
