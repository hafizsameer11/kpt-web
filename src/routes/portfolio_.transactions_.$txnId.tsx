import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  ChevronRight,
  Receipt,
} from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/kipit/AppShell";
import { ReceiptDialog } from "@/components/kipit/ReceiptView";
import { getTransaction, naira, type TxnStatus } from "@/lib/portfolio-data";

export const Route = createFileRoute("/portfolio_/transactions_/$txnId")({
  head: () => ({
    meta: [
      { title: "Transaction Detail | Kipit" },
      {
        name: "description",
        content:
          "Full detail for a Kipit transaction — amount, status, reference, date and time, source, destination and the related investment.",
      },
      { property: "og:title", content: "Transaction Detail | Kipit" },
      {
        property: "og:description",
        content:
          "Amount, status, reference, timing and related investment for this Kipit transaction.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ params }) => {
    if (!getTransaction(params.txnId)) throw notFound();
    return null;
  },
  component: TransactionDetailScreen,
});

const statusTone: Record<TxnStatus, string> = {
  Successful: "bg-gold/15 text-gold",
  Processing: "bg-white/15 text-primary-foreground",
  Pending: "bg-white/15 text-primary-foreground",
  Failed: "bg-destructive/20 text-destructive-foreground",
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3.5">
      <p className="text-[12px] text-muted-foreground">{label}</p>
      <p className="text-right text-[12.5px] font-bold text-foreground">{value}</p>
    </div>
  );
}

function TransactionDetailScreen() {
  const { txnId } = Route.useParams();
  const txn = getTransaction(txnId)!;
  const [receiptOpen, setReceiptOpen] = useState(false);

  return (
    <AppShell title="Transaction" navVariant="elevated">
      {/* ── Desktop (md+) ───────────────────────────────────────── */}
      <div className="hidden md:block">
        <div className="mx-auto w-full max-w-[1080px] space-y-6 pb-10">
          <section className="relative overflow-hidden rounded-2xl bg-brand-gradient px-8 py-8 text-primary-foreground shadow-float">
            <span
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-32 size-80 rounded-full bg-gold/15 blur-[70px]"
            />
            <div className="relative flex flex-wrap items-end justify-between gap-8">
              <div className="min-w-0">
                <Link
                  to="/portfolio/transactions"
                  className="press inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[12px] font-bold hover:bg-white/15"
                >
                  <ArrowLeft className="size-4" /> Transactions
                </Link>
                <div className="mt-6 flex items-center gap-3">
                  <span className="grid size-12 place-items-center rounded-xl bg-white/10">
                    {txn.direction === "in" ? (
                      <ArrowDownLeft className="size-5 text-gold" strokeWidth={2.4} />
                    ) : (
                      <ArrowUpRight className="size-5" strokeWidth={2.4} />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary-foreground/60">
                      {txn.type}
                    </p>
                    <p className="truncate text-[14px] font-bold">{txn.label}</p>
                  </div>
                </div>
                <p className="mt-4 font-display text-[46px] font-extrabold leading-none tracking-[-0.035em] text-num">
                  {txn.direction === "in" ? "+" : "−"}
                  {naira(txn.amount)}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1.5 text-[11.5px] font-extrabold ${statusTone[txn.status]}`}
                  >
                    {txn.status}
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-1.5 text-[11.5px] font-bold">
                    {txn.date} · {txn.time}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setReceiptOpen(true)}
                className="press inline-flex items-center gap-2 rounded-xl bg-gold px-6 py-3 text-[13px] font-extrabold text-brand shadow-float"
              >
                <Receipt className="size-4" strokeWidth={2.4} /> View receipt
              </button>
            </div>
          </section>

          <div className="grid grid-cols-[minmax(0,1fr)_320px] items-start gap-6">
            <section className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="border-b border-border px-6 py-4">
                <h2 className="font-display text-[17px] font-extrabold">Transaction details</h2>
              </div>
              <dl className="grid grid-cols-2 gap-x-8 gap-y-5 px-6 py-5">
                {[
                  { label: "Reference", value: txn.reference },
                  { label: "Date & time", value: `${txn.date} · ${txn.time}` },
                  { label: "Type", value: txn.type },
                  { label: "Status", value: txn.status },
                  { label: "Source", value: txn.source },
                  { label: "Destination", value: txn.destination },
                ].map((row) => (
                  <div key={row.label}>
                    <dt className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
                      {row.label}
                    </dt>
                    <dd className="mt-1 break-words text-[13.5px] font-bold">{row.value}</dd>
                  </div>
                ))}
              </dl>
              {txn.note && (
                <p className="border-t border-border/60 px-6 py-4 text-[12px] leading-[1.6] text-muted-foreground">
                  {txn.note}
                </p>
              )}
            </section>

            <div className="space-y-6">
              {txn.related && (
                <section className="rounded-2xl border border-border bg-card p-5">
                  <h2 className="font-display text-[15px] font-extrabold">Related investment</h2>
                  {txn.related.holdingId ? (
                    <Link
                      to="/portfolio/$holdingId"
                      params={{ holdingId: txn.related.holdingId }}
                      className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3.5 transition-colors hover:bg-secondary/50"
                    >
                      <span className="truncate text-[13px] font-bold">{txn.related.name}</span>
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                    </Link>
                  ) : (
                    <p className="mt-3 rounded-xl border border-border px-4 py-3.5 text-[13px] font-bold">
                      {txn.related.name}
                    </p>
                  )}
                </section>
              )}

              <section className="rounded-2xl border border-border bg-card p-5">
                <h2 className="font-display text-[15px] font-extrabold">Need something else?</h2>
                <div className="mt-3 space-y-2">
                  <Link
                    to="/settings/statements"
                    className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3 transition-colors hover:bg-secondary/50"
                  >
                    <span className="text-[12.5px] font-bold">Download statements</span>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </Link>
                  <Link
                    to="/settings/help"
                    className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3 transition-colors hover:bg-secondary/50"
                  >
                    <span className="text-[12.5px] font-bold">Get help with this</span>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </Link>
                </div>
              </section>
            </div>
          </div>
        </div>
        <ReceiptDialog txn={txn} open={receiptOpen} onOpenChange={setReceiptOpen} />
      </div>

      <div className="pb-2 md:hidden">
        <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-14 pt-6 text-primary-foreground md:mx-0 md:rounded-xl md:px-8 md:pt-8 md:shadow-float">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-32 size-72 rounded-full bg-gold/15 blur-[64px]"
          />
          <div className="relative md:max-w-3xl">
            <Link
              to="/portfolio/transactions"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold press"
            >
              <ArrowLeft className="size-3.5" /> Transactions
            </Link>

            <div className="k-rise mt-6 flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-lg bg-white/10">
                {txn.direction === "in" ? (
                  <ArrowDownLeft className="size-5 text-gold" strokeWidth={2.4} />
                ) : (
                  <ArrowUpRight className="size-5" strokeWidth={2.4} />
                )}
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary-foreground/60">
                  {txn.type}
                </p>
                <p className="truncate text-[13px] font-bold">{txn.label}</p>
              </div>
            </div>

            <h1 className="k-rise mt-4 font-display text-[34px] font-extrabold leading-none tracking-[-0.035em] text-num md:text-[42px]">
              {txn.direction === "in" ? "+" : "−"}
              {naira(txn.amount)}
            </h1>

            <p
              className={`k-rise mt-3 inline-block rounded-full px-3 py-1.5 text-[11px] font-extrabold ${statusTone[txn.status]}`}
              style={{ ["--d" as string]: "80ms" }}
            >
              {txn.status}
            </p>
          </div>
        </section>

        <div className="relative -mx-4 -mt-8 rounded-t-[2rem] bg-background px-4 pt-5 md:mx-0 md:mt-6 md:rounded-none md:bg-transparent md:px-0 md:pt-0">
          <span
            aria-hidden
            className="mx-auto mb-4 block h-1 w-10 rounded-full bg-border md:hidden"
          />

          <section className="k-rise card-surface divide-y divide-border/60 overflow-hidden">
            <Row label="Reference" value={txn.reference} />
            <Row label="Date & time" value={`${txn.date} · ${txn.time}`} />
            <Row label="Type" value={txn.type} />
            <Row label="Source" value={txn.source} />
            <Row label="Destination" value={txn.destination} />
            <Row label="Status" value={txn.status} />
          </section>

          {txn.related && (
            <section
              className="k-rise mt-4"
              style={{ ["--d" as string]: "70ms" }}
            >
              <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Related investment
              </p>
              {txn.related.holdingId ? (
                <Link
                  to="/portfolio/$holdingId"
                  params={{ holdingId: txn.related.holdingId }}
                  className="card-surface flex items-center justify-between gap-3 px-4 py-3.5 press"
                >
                  <span className="truncate text-[13px] font-bold">{txn.related.name}</span>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </Link>
              ) : (
                <p className="card-surface px-4 py-3.5 text-[13px] font-bold">
                  {txn.related.name}
                </p>
              )}
            </section>
          )}

          {txn.note && (
            <p className="mt-4 rounded-xl border border-border/60 bg-card/60 px-3.5 py-3 text-[11.5px] leading-[1.55] text-muted-foreground">
              {txn.note}
            </p>
          )}

          {/* Mobile: full receipt screen */}
          <Link
            to="/portfolio/transactions/$txnId/receipt"
            params={{ txnId: txn.id }}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press md:hidden"
          >
            <Receipt className="size-4" strokeWidth={2.4} /> View receipt
          </Link>

        </div>
      </div>
    </AppShell>
  );
}
