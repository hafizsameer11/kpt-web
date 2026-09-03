import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Download, Share2 } from "lucide-react";
import { Logo } from "@/components/kipit/Logo";
import { AppShell } from "@/components/kipit/AppShell";
import { getTransaction, naira } from "@/lib/portfolio-data";

export const Route = createFileRoute("/portfolio_/transactions_/$txnId_/receipt")({
  head: () => ({
    meta: [
      { title: "Transaction Receipt | Kipit" },
      {
        name: "description",
        content:
          "A branded Kipit receipt with the transaction reference, amount, date and time, status and full transaction details.",
      },
      { property: "og:title", content: "Transaction Receipt | Kipit" },
      {
        property: "og:description",
        content:
          "Share or download a Kipit receipt showing reference, amount, timing and status.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ params }) => {
    if (!getTransaction(params.txnId)) throw notFound();
    return null;
  },
  component: ReceiptScreen,
});

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <p className="text-[12px] text-muted-foreground">{label}</p>
      <p className="text-right text-[12.5px] font-bold text-foreground">{value}</p>
    </div>
  );
}

function ReceiptScreen() {
  const { txnId } = Route.useParams();
  const txn = getTransaction(txnId)!;

  const share = async () => {
    const text = `Kipit receipt ${txn.reference} — ${txn.label}, ${naira(txn.amount)} on ${txn.date}.`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Kipit receipt", text });
        return;
      } catch {
        /* user dismissed */
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    }
  };

  return (
    <AppShell title="Receipt" navVariant="elevated">
      <div className="pb-2">
        <div className="flex items-center justify-between gap-3 pt-1">
          <Link
            to="/portfolio/transactions/$txnId"
            params={{ txnId: txn.id }}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-bold press"
          >
            <ArrowLeft className="size-3.5" /> Transaction
          </Link>
          <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.1em] text-brand">
            {txn.status}
          </span>
        </div>

        {/* Receipt card */}
        <section className="k-rise mt-4 overflow-hidden rounded-xl border border-border bg-card shadow-card md:max-w-xl">
          {/* Branded header */}
          <div className="relative overflow-hidden bg-brand-gradient px-5 py-6 text-primary-foreground">
            <span
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-24 size-56 rounded-full bg-gold/20 blur-[56px]"
            />
            <div className="relative">
              <Logo className="h-6 w-auto" />
              <p className="mt-5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary-foreground/60">
                {txn.direction === "in" ? "Amount received" : "Amount paid"}
              </p>
              <p className="mt-1 font-display text-[32px] font-extrabold leading-none tracking-[-0.035em] text-num">
                {naira(txn.amount)}
              </p>
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold">
                <CheckCircle2 className="size-3.5 text-gold" />
                {txn.reference}
              </p>
            </div>
          </div>

          {/* Perforation */}
          <div className="relative h-5 bg-card">
            <span
              aria-hidden
              className="absolute -left-2.5 top-1/2 size-5 -translate-y-1/2 rounded-full bg-background"
            />
            <span
              aria-hidden
              className="absolute -right-2.5 top-1/2 size-5 -translate-y-1/2 rounded-full bg-background"
            />
            <span
              aria-hidden
              className="absolute inset-x-5 top-1/2 border-t border-dashed border-border"
            />
          </div>

          <div className="divide-y divide-border/60 px-5 pb-5">
            <Line label="Description" value={txn.label} />
            <Line label="Date & time" value={`${txn.date} · ${txn.time}`} />
            <Line label="Type" value={txn.type} />
            <Line label="Status" value={txn.status} />
            <Line label="Source" value={txn.source} />
            <Line label="Destination" value={txn.destination} />
            {txn.related && <Line label="Investment" value={txn.related.name} />}
            <Line label="Reference" value={txn.reference} />
          </div>

          <p className="border-t border-border/60 px-5 py-3.5 text-[11px] leading-[1.55] text-muted-foreground">
            Issued by Kipit. Investments are administered by Kipit's SEC-licensed partner.
          </p>
        </section>

        {/* Actions */}
        <div className="mt-5 flex gap-2 md:max-w-xl">
          <button
            type="button"
            onClick={share}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press"
          >
            <Share2 className="size-4" strokeWidth={2.4} /> Share
          </button>
          <button
            type="button"
            onClick={() => typeof window !== "undefined" && window.print()}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3.5 text-[13.5px] font-extrabold text-foreground press"
          >
            <Download className="size-4" strokeWidth={2.4} /> Download
          </button>
        </div>
      </div>
    </AppShell>
  );
}
