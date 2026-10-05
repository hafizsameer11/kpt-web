import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronRight,
  Filter,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
  TXN_TYPES,
  mapApiPortfolioTransaction,
  type Transaction,
  type TxnStatus,
  type TxnType,
} from "@/lib/portfolio-data";
import { fetchPortfolioTransactions, getAccessToken } from "@/lib/api";

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

function txnTimestamp(t: { createdAt?: string; date: string }) {
  if (t.createdAt) {
    const iso = Date.parse(t.createdAt);
    if (!Number.isNaN(iso)) return iso;
  }
  const raw = t.date.trim().replace(/,/g, "");
  const months: Record<string, number> = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Sept: 8, Oct: 9, Nov: 10, Dec: 11,
  };
  const parts = raw.split(/\s+/);
  if (parts.length >= 3) {
    const month = months[parts[1] ?? ""] ?? months[(parts[1] ?? "").replace(/\./g, "")];
    if (month != null) return new Date(Number(parts[2]), month, Number(parts[0])).getTime();
  }
  return Number.NaN;
}

function TransactionHistoryScreen() {
  const { mask, hidden } = useBalanceVisibility();
  const isMobile = useIsMobile();
  const [type, setType] = useState<TxnType | "All">("All");
  const [status, setStatus] = useState<TxnStatus | "All">("All");
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>("All time");
  const [query, setQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [rows, setRows] = useState<Transaction[]>([]);

  useEffect(() => {
    let alive = true;
    void (async () => {
      if (!getAccessToken()) {
        if (alive) setRows([]);
        return;
      }
      try {
        const apiRows = await fetchPortfolioTransactions();
        const seen = new Set<string>();
        const mapped: Transaction[] = [];
        for (const row of apiRows ?? []) {
          if (!row?.id || seen.has(row.id)) continue;
          const txn = mapApiPortfolioTransaction(row);
          if (!txn) continue;
          seen.add(row.id);
          mapped.push(txn);
        }
        if (alive) setRows(mapped);
      } catch {
        if (alive) setRows([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const now = Date.now();
    return rows.filter((t) => {
      if (type !== "All") {
        const typeMatch =
          t.type === type || (type === "Investment" && t.type === "Interest");
        if (!typeMatch) return false;
      }
      if (status !== "All" && t.status !== status) return false;
      if (period !== "All time") {
        const days = period === "Last 30 days" ? 30 : 90;
        const ts = txnTimestamp(t);
        if (Number.isNaN(ts) || now - ts > days * 864e5) return false;
      }
      if (q) {
        const haystack = [
          t.label,
          t.reference,
          t.source,
          t.destination,
          t.related?.name,
          t.note,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [rows, type, status, period, query]);

  const inflow = list
    .filter((t) => t.direction === "in" && t.status !== "Failed")
    .reduce((s, t) => s + t.amount, 0);

  const outflow = list
    .filter((t) => t.direction === "out" && t.status !== "Failed")
    .reduce((s, t) => s + t.amount, 0);

  return (
    <AppShell title="Transactions" navVariant="elevated">
      {/* ── Desktop (md+) ───────────────────────────────────────── */}
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
                  Money in · filtered view
                </p>
                <p className="mt-3 font-display text-[48px] font-extrabold leading-none tracking-[-0.035em] text-num">
                  <AmountCounter value={inflow} hidden={hidden} mask={mask} />
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11.5px] font-bold">
                    <Filter className="size-3.5 text-gold" />
                    {list.length} transactions
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11.5px] font-bold">
                    {period} · {status === "All" ? "All statuses" : status}
                  </span>
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-2.5">
                  <Link
                    to="/portfolio"
                    className="press inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-[12.5px] font-bold hover:bg-white/15"
                  >
                    <ArrowLeft className="size-4" /> Portfolio
                  </Link>
                  <Link
                    to="/settings/statements"
                    className="press inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[12.5px] font-bold text-primary-foreground/85 hover:text-primary-foreground"
                  >
                    Statements <ChevronRight className="size-4" />
                  </Link>
                </div>
              </div>

              <div className="w-[300px] shrink-0 rounded-xl border border-white/12 bg-white/10 p-4 backdrop-blur">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-primary-foreground/55">
                      Money out
                    </p>
                    <p className="mt-1 text-[18px] font-extrabold leading-none text-num">
                      {mask(outflow)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-primary-foreground/55">
                      Net
                    </p>
                    <p className="mt-1 text-[18px] font-extrabold leading-none text-gold text-num">
                      {mask(inflow - outflow)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-3">
            <div className="flex min-w-[240px] flex-1 items-center gap-2 rounded-lg border border-border/70 bg-secondary/30 px-3 py-2">
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search label, reference, source..."
                className="min-w-0 flex-1 bg-transparent text-[13px] font-bold placeholder:text-muted-foreground/70 focus:outline-none"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="grid size-6 shrink-0 place-items-center rounded-full bg-background text-muted-foreground"
                >
                  <X className="size-3" />
                </button>
              ) : null}
            </div>

            <div className="flex items-center gap-1 rounded-lg bg-secondary/50 p-1">
              {(["All", ...TXN_TYPES] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  aria-pressed={type === t}
                  className={`rounded-md px-3 py-1.5 text-[12px] font-bold transition-colors ${
                    type === t
                      ? "bg-brand text-brand-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="press inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3.5 py-2 text-[12.5px] font-bold hover:bg-secondary/50"
            >
              <SlidersHorizontal className="size-4" /> More filters
            </button>
          </div>

          {/* Table */}
          <section className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="grid grid-cols-[110px_minmax(0,1fr)_130px_120px_150px_28px] items-center gap-4 border-b border-border bg-muted/30 px-6 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
              <span>Date</span>
              <span>Description</span>
              <span>Type</span>
              <span>Status</span>
              <span className="text-right">Amount</span>
              <span />
            </div>

            {list.map((t) => (
              <Link
                key={t.id}
                to="/portfolio/transactions/$txnId"
                params={{ txnId: t.id }}
                className="grid grid-cols-[110px_minmax(0,1fr)_130px_120px_150px_28px] items-center gap-4 border-b border-border/60 px-6 py-3.5 transition-colors last:border-0 hover:bg-secondary/50 focus-visible:bg-secondary/50 focus-visible:outline-none"
              >
                <span className="text-[12px] font-semibold text-muted-foreground text-num">
                  {t.date}
                </span>
                <span className="flex min-w-0 items-center gap-3">
                  <span
                    className={`grid size-9 shrink-0 place-items-center rounded-lg ${
                      t.direction === "in" ? "bg-gold/15 text-gold" : "bg-secondary text-brand"
                    }`}
                  >
                    {t.direction === "in" ? (
                      <ArrowDownLeft className="size-4" strokeWidth={2.4} />
                    ) : (
                      <ArrowUpRight className="size-4" strokeWidth={2.4} />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[13.5px] font-bold">{t.label}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">
                      {t.reference}
                    </span>
                  </span>
                </span>
                <span className="truncate text-[11.5px] font-semibold text-muted-foreground">
                  {t.type}
                </span>
                <span>
                  <span
                    className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-extrabold ${statusTone[t.status]}`}
                  >
                    {t.status}
                  </span>
                </span>
                <span
                  className={`text-right text-[14px] font-extrabold text-num ${
                    t.direction === "in" ? "text-gold" : "text-foreground"
                  }`}
                >
                  {t.direction === "in" ? "+" : "−"}
                  {mask(t.amount)}
                </span>
                <ChevronRight className="size-4 text-muted-foreground" />
              </Link>
            ))}

            {list.length === 0 && (
              <p className="px-6 py-12 text-center text-[13px] text-muted-foreground">
                No transactions match these filters.
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

          {/* Filter bar with search */}
          <div className="rounded-xl border border-border bg-card p-2 shadow-sm">
            <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-secondary/40 px-3 py-2">
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search transactions..."
                className="min-w-0 flex-1 bg-transparent text-[13px] font-bold placeholder:text-muted-foreground/70 focus:outline-none"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="grid size-6 shrink-0 place-items-center rounded-full bg-background text-muted-foreground"
                >
                  <X className="size-3" />
                </button>
              ) : null}
            </div>

            <div className="mt-2 flex items-stretch gap-2">
              {(
                [
                  { label: "Period", value: period },
                  { label: "Status", value: status },
                ] as const
              ).map((f) => (
                <button
                  key={f.label}
                  type="button"
                  onClick={() => setFiltersOpen(true)}
                  className="min-w-0 flex-1 rounded-lg border border-border/60 bg-secondary/30 px-3 py-1.5 text-left transition-colors hover:bg-secondary/60 press"
                >
                  <span className="block text-[9.5px] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
                    {f.label}
                  </span>
                  <span className="mt-0.5 flex items-center gap-1">
                    <span className="truncate text-[12.5px] font-bold">{f.value}</span>
                    <ChevronRight className="size-3 shrink-0 rotate-90 text-muted-foreground" />
                  </span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                aria-label="Open filters"
                className="grid w-11 shrink-0 place-items-center rounded-lg bg-brand text-brand-foreground press"
              >
                <SlidersHorizontal className="size-4" />
              </button>
            </div>
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
        query={query}
        setQuery={setQuery}
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
  query,
  setQuery,
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
  query: string;
  setQuery: (q: string) => void;
  results: number;
}) {
  const reset = () => {
    setType("All");
    setStatus("All");
    setPeriod("All time");
    setQuery("");
  };

  const content = (
    <div className="flex h-full max-h-[inherit] min-h-0 flex-col">
      <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
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

      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5">
        {/* Search */}
        <div>
          <p className="mb-2.5 text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">
            Search
          </p>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Label, reference, source..."
              className="min-w-0 flex-1 bg-transparent text-[13px] font-bold placeholder:text-muted-foreground/70 focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="grid size-6 shrink-0 place-items-center rounded-full bg-secondary text-muted-foreground"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
        </div>

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

      <div className="flex shrink-0 items-center gap-3 border-t border-border bg-card px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
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
          Apply · {results} result{results === 1 ? "" : "s"}
        </button>
      </div>
    </div>
  );

  return isMobile ? (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="flex max-h-[92svh] flex-col overflow-hidden rounded-t-[2rem] bg-card px-0 pb-0 pt-2">
        <DrawerTitle className="sr-only">Filters</DrawerTitle>
        <DrawerDescription className="sr-only">
          Filter transactions by search, type, period and status.
        </DrawerDescription>
        {content}
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[80vh] max-w-md flex-col overflow-hidden rounded-2xl p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Filters</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
