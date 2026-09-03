import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronRight,
  Filter,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/kipit/AppShell";
import { AmountCounter } from "@/components/kipit/motion";
import { useBalanceVisibility } from "@/hooks/useBalanceVisibility";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
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
  const isMobile = useIsMobile();
  const [type, setType] = useState<TxnType | "All">("All");
  const [status, setStatus] = useState<TxnStatus | "All">("All");
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>("All time");
  const [filtersOpen, setFiltersOpen] = useState(false);

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

          {/* Quick filter bar */}
          <div className="flex items-center gap-2">
            <div className="flex flex-1 items-center gap-2">
              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-[12px] font-bold text-foreground press"
              >
                <span className="text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">
                  Period
                </span>
                <span className="truncate">{period}</span>
                <ChevronRight className="size-3.5 shrink-0 -rotate-90 text-muted-foreground" />
              </button>
              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-[12px] font-bold text-foreground press"
              >
                <span className="text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">
                  Status
                </span>
                <span className="truncate">{status}</span>
                <ChevronRight className="size-3.5 shrink-0 -rotate-90 text-muted-foreground" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              aria-label="Open filters"
              className="grid size-10 shrink-0 place-items-center rounded-full border border-border bg-card text-foreground press"
            >
              <SlidersHorizontal className="size-4" />
            </button>
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

      <FilterPanel
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        isMobile={isMobile}
        type={type}
        setType={setType}
        status={status}
        setStatus={setStatus}
        period={period}
        setPeriod={setPeriod}
        results={list.length}
      />
    </AppShell>
  );
}

function FilterPanel({
  open,
  onOpenChange,
  isMobile,
  type,
  setType,
  status,
  setStatus,
  period,
  setPeriod,
  results,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isMobile: boolean;
  type: TxnType | "All";
  setType: (t: TxnType | "All") => void;
  status: TxnStatus | "All";
  setStatus: (s: TxnStatus | "All") => void;
  period: (typeof PERIODS)[number];
  setPeriod: (p: (typeof PERIODS)[number]) => void;
  results: number;
}) {
  const reset = () => {
    setType("All");
    setStatus("All");
    setPeriod("All time");
  };

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <h2 className="font-display text-lg font-bold">Filters</h2>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="grid size-8 place-items-center rounded-full bg-secondary text-foreground"
          aria-label="Close filters"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
        {/* Type */}
        <div>
          <p className="mb-2.5 text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">
            Transaction type
          </p>
          <div className="flex flex-wrap gap-2">
            {(["All", ...TXN_TYPES] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                aria-pressed={type === t}
                className={`rounded-full px-3.5 py-2 text-[12px] font-bold transition-all press ${
                  type === t
                    ? "bg-brand text-brand-foreground shadow-sm"
                    : "border border-border bg-card text-foreground hover:border-brand/30 hover:text-brand"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Period */}
        <div>
          <p className="mb-2.5 text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">
            Period
          </p>
          <div className="grid grid-cols-1 gap-2">
            {PERIODS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                aria-pressed={period === p}
                className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-[13px] font-bold transition-all press ${
                  period === p
                    ? "border-brand bg-brand/5 text-brand"
                    : "border-border bg-card text-foreground hover:border-brand/30"
                }`}
              >
                {p}
                {period === p && (
                  <span className="grid size-5 place-items-center rounded-full bg-brand text-primary-foreground">
                    <Check className="size-3.5" strokeWidth={2.6} />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Status */}
        <div>
          <p className="mb-2.5 text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">
            Status
          </p>
          <div className="grid grid-cols-1 gap-2">
            {(["All", ...STATUSES] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                aria-pressed={status === s}
                className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-[13px] font-bold transition-all press ${
                  status === s
                    ? "border-brand bg-brand/5 text-brand"
                    : "border-border bg-card text-foreground hover:border-brand/30"
                }`}
              >
                {s}
                {status === s && (
                  <span className="grid size-5 place-items-center rounded-full bg-brand text-primary-foreground">
                    <Check className="size-3.5" strokeWidth={2.6} />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-border px-6 py-4">
        <button
          type="button"
          onClick={reset}
          className="rounded-xl border border-border px-4 py-3 text-[13px] font-bold text-foreground press"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-gradient px-4 py-3 text-[13px] font-extrabold text-primary-foreground shadow-float press"
        >
          Show {results} result{results === 1 ? "" : "s"}
        </button>
      </div>
    </div>
  );

  return isMobile ? (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[92svh] rounded-t-[2rem] bg-card px-0 pb-0 pt-2">
        <DrawerTitle className="sr-only">Filters</DrawerTitle>
        <DrawerDescription className="sr-only">
          Filter transactions by type, period and status.
        </DrawerDescription>
        {content}
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-md overflow-hidden rounded-2xl p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Filters</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
