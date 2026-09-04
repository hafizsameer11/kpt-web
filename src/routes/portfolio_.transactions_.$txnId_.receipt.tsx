import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/kipit/AppShell";
import { ReceiptActions, ReceiptCard } from "@/components/kipit/ReceiptView";
import { getTransaction } from "@/lib/portfolio-data";

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

function ReceiptScreen() {
  const { txnId } = Route.useParams();
  const txn = getTransaction(txnId)!;

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

        <div className="md:grid md:grid-cols-[minmax(0,1fr)_320px] md:items-start md:gap-6">
          <div className="k-rise mt-4 md:mt-6 md:rounded-3xl md:bg-secondary/40 md:p-6 md:ring-1 md:ring-border">
            <ReceiptCard txn={txn} />
          </div>

          <div className="mt-5 md:sticky md:top-6 md:mt-6 md:space-y-4">
            <ReceiptActions txn={txn} />

            {/* Desktop-only details rail */}
            <section className="hidden md:block card-surface overflow-hidden">
              <div className="border-b border-border px-5 py-3">
                <p className="text-[10.5px] font-black uppercase tracking-[0.16em] text-muted-foreground">
                  Receipt details
                </p>
              </div>
              <ul className="divide-y divide-border">
                {[
                  { label: "Reference", value: txn.reference },
                  { label: "Status", value: txn.status },
                  { label: "Date", value: txn.date },
                  { label: "Issued by", value: "Kipit" },
                ].map((row) => (
                  <li key={row.label} className="flex items-center justify-between gap-3 px-5 py-3">
                    <span className="text-[12px] font-semibold text-muted-foreground">
                      {row.label}
                    </span>
                    <span className="truncate text-[12px] font-bold text-foreground">
                      {row.value}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="hidden md:block card-surface p-5">
              <p className="text-[12.5px] font-extrabold text-foreground">Need help with this?</p>
              <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
                Quote the reference above when contacting support and we can trace the transaction
                end to end.
              </p>
              <Link
                to="/settings/help/ticket"
                className="mt-3 inline-flex items-center gap-2 text-[12.5px] font-bold text-brand"
              >
                Contact support
              </Link>
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
