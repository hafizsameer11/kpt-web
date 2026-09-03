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

        <div className="k-rise mt-4 md:max-w-xl">
          <ReceiptCard txn={txn} />
        </div>

        <div className="mt-5 md:max-w-xl">
          <ReceiptActions txn={txn} />
        </div>
      </div>
    </AppShell>
  );
}
