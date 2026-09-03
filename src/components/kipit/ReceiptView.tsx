import { CheckCircle2, Download, Share2 } from "lucide-react";
import { Logo } from "@/components/kipit/Logo";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { naira, type Transaction } from "@/lib/portfolio-data";

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <p className="text-[12px] text-muted-foreground">{label}</p>
      <p className="text-right text-[12.5px] font-bold text-foreground">{value}</p>
    </div>
  );
}

export async function shareReceipt(txn: Transaction) {
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
}

/** Branded receipt card — shared by the receipt route and the desktop dialog. */
export function ReceiptCard({ txn }: { txn: Transaction }) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
      <div className="relative overflow-hidden bg-brand-gradient px-5 py-6 text-primary-foreground">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-24 size-56 rounded-full bg-gold/20 blur-[56px]"
        />
        <div className="relative">
          <Logo tone="light" className="text-[18px]" />
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
  );
}

export function ReceiptActions({ txn }: { txn: Transaction }) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => void shareReceipt(txn)}
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
  );
}

/** Desktop-only receipt popup. */
export function ReceiptDialog({
  txn,
  open,
  onOpenChange,
}: {
  txn: Transaction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] max-w-md overflow-y-auto border-0 bg-background p-5 shadow-2xl">
        <DialogTitle className="sr-only">Receipt {txn.reference}</DialogTitle>
        <DialogDescription className="sr-only">
          Kipit receipt for {txn.label}, {naira(txn.amount)} on {txn.date}.
        </DialogDescription>
        <ReceiptCard txn={txn} />
        <div className="mt-4">
          <ReceiptActions txn={txn} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
