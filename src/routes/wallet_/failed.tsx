import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, Building2, LifeBuoy, RefreshCw } from "lucide-react";
import { z } from "zod";
import { AppShell } from "@/components/kipit/AppShell";
import { naira } from "@/lib/home-data";
import { CARD_DECLINE_REASONS, depositReference } from "@/lib/wallet-data";

export const Route = createFileRoute("/wallet_/failed")({
  validateSearch: z.object({
    amount: z.number().catch(0),
    reason: z.string().catch("insufficient"),
  }),
  head: () => ({
    meta: [
      { title: "Payment Failed | Kipit" },
      {
        name: "description",
        content:
          "Your Kipit wallet top-up did not go through. Retry with another method or contact support.",
      },
      { property: "og:title", content: "Payment Failed | Kipit" },
      {
        property: "og:description",
        content: "The card payment was declined — nothing was debited.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DepositFailed,
});

function DepositFailed() {
  const { amount, reason } = Route.useSearch();
  const message = CARD_DECLINE_REASONS[reason] ?? CARD_DECLINE_REASONS["insufficient"]!;
  const reference = depositReference(amount);

  return (
    <AppShell title="Payment Failed" navVariant="elevated">
      <div className="pb-2 md:mx-auto md:max-w-4xl">
        <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-16 pt-10 text-center text-primary-foreground md:mx-0 md:rounded-xl md:px-8 md:shadow-float">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-32 size-72 rounded-full bg-destructive/25 blur-[64px]"
          />
          <div className="relative">
            <span className="k-shake mx-auto grid size-16 place-items-center rounded-full bg-destructive/20 text-destructive-foreground ring-2 ring-destructive/50">
              <AlertTriangle className="size-8" strokeWidth={2.2} />
            </span>
            <p className="mt-5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary-foreground/60">
              Payment failed
            </p>
            <p className="mt-2 font-display text-[38px] font-extrabold leading-none tracking-[-0.035em] text-num md:text-[46px]">
              {naira(amount)}
            </p>
            <p className="mt-3 text-[12.5px] font-medium text-primary-foreground/70">
              Nothing was debited from your card.
            </p>
          </div>
        </section>

        <div className="relative -mx-4 -mt-8 rounded-t-[2rem] bg-background px-4 pt-5 md:mx-0 md:mt-6 md:rounded-none md:bg-transparent md:px-0 md:pt-0">
          <span
            aria-hidden
            className="mx-auto mb-4 block h-1 w-10 rounded-full bg-border md:hidden"
          />

          <div className="space-y-4 md:grid md:grid-cols-2 md:items-start md:gap-4 md:space-y-0">
            <section className="card-surface p-4 md:p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                What happened
              </p>
              <p className="mt-3 rounded-xl bg-destructive/10 px-3 py-2.5 text-[12.5px] font-semibold text-destructive">
                {message}
              </p>
              <dl className="mt-3 divide-y divide-border text-[13px]">
                <Row label="Reference">{reference}</Row>
                <Row label="Amount">{naira(amount)}</Row>
                <Row label="Status">
                  <span className="rounded-full bg-destructive/12 px-2 py-0.5 text-[11px] font-extrabold text-destructive">
                    Failed
                  </span>
                </Row>
              </dl>
            </section>

            <section className="card-surface p-4 md:p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Try another way
              </p>
              <Link
                to="/wallet/transfer"
                search={{ amount }}
                className="mt-3 flex items-center gap-3 rounded-xl border border-border bg-background p-3.5 press hover:border-gold/40"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Building2 className="size-5" strokeWidth={2.2} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[13.5px] font-bold text-foreground">
                    Pay by bank transfer
                  </span>
                  <span className="block text-[12px] text-muted-foreground">
                    No fees, credited in seconds
                  </span>
                </span>
              </Link>
              <Link
                to="/settings/help"
                className="mt-2.5 flex items-center gap-3 rounded-xl border border-border bg-background p-3.5 press hover:border-gold/40"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold">
                  <LifeBuoy className="size-5" strokeWidth={2.2} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[13.5px] font-bold text-foreground">
                    Contact support
                  </span>
                  <span className="block text-[12px] text-muted-foreground">
                    Quote reference {reference}
                  </span>
                </span>
              </Link>
            </section>
          </div>

          <div className="mt-5 flex flex-col gap-2.5 md:flex-row">
            <Link
              to="/wallet/card"
              search={{ amount }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press md:w-auto md:px-10"
            >
              <RefreshCw className="size-4" strokeWidth={2.6} /> Retry payment
            </Link>
            <Link
              to="/"
              className="inline-flex w-full items-center justify-center rounded-xl border border-border bg-card px-5 py-3.5 text-[13.5px] font-bold text-foreground press md:w-auto md:px-8"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-bold text-foreground">{children}</dd>
    </div>
  );
}
