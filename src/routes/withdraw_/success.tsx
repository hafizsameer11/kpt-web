import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Landmark } from "lucide-react";
import { z } from "zod";
import { AppShell } from "@/components/kipit/AppShell";
import { naira } from "@/lib/home-data";
import {
  findAccount,
  maskAccount,
  withdrawalReference,
  WITHDRAWAL_FEE,
} from "@/lib/withdraw-data";

export const Route = createFileRoute("/withdraw_/success")({
  validateSearch: z.object({
    acct: z.string().catch("pa1"),
    amount: z.number().catch(0),
  }),
  head: () => ({
    meta: [
      { title: "Withdrawal Successful | Kipit" },
      {
        name: "description",
        content:
          "Your Kipit withdrawal has settled in your bank account. View the receipt or continue investing.",
      },
      { property: "og:title", content: "Withdrawal Successful | Kipit" },
      {
        property: "og:description",
        content: "Your payout was completed successfully.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WithdrawSuccess,
});

function WithdrawSuccess() {
  const { acct, amount } = Route.useSearch();
  const account = findAccount(acct);
  const reference = withdrawalReference(amount);

  return (
    <AppShell title="Withdrawal Successful" navVariant="elevated">
      <div className="pb-2">
        <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-16 pt-10 text-center text-primary-foreground md:mx-0 md:rounded-xl md:px-8 md:shadow-float">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-32 size-72 rounded-full bg-gold/20 blur-[64px]"
          />
          <div className="relative">
            <span className="relative mx-auto grid size-16 place-items-center">
              <span
                aria-hidden
                className="k-success-ring absolute inset-0 rounded-full border-2 border-gold"
              />
              <span className="k-success-pop grid size-16 place-items-center rounded-full bg-gold text-gold-foreground shadow-float">
                <svg viewBox="0 0 24 24" className="size-8" fill="none" aria-hidden>
                  <path
                    d="M5 12.5l4.5 4.5L19 7.5"
                    stroke="currentColor"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="k-success-check"
                  />
                </svg>
              </span>
            </span>
            <p className="k-success-fade mt-5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary-foreground/60">
              Withdrawal completed
            </p>
            <p className="k-success-fade mt-2 font-display text-[38px] font-extrabold leading-none tracking-[-0.035em] text-num md:text-[46px]">
              {naira(amount)}
            </p>
            <p className="k-success-fade mt-3 text-[12.5px] font-medium text-primary-foreground/70">
              Sent to {account.bank} · {maskAccount(account.accountNumber)}
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
                Receipt
              </p>
              <dl className="mt-3 divide-y divide-border text-[13px]">
                <Row label="Reference">{reference}</Row>
                <Row label="Amount">{naira(amount)}</Row>
                <Row label="Fee">{WITHDRAWAL_FEE === 0 ? "₦0" : naira(WITHDRAWAL_FEE)}</Row>
                <Row label="From">Kipit Wallet</Row>
                <Row label="Status">
                  <span className="rounded-full bg-emerald-500/12 px-2 py-0.5 text-[11px] font-extrabold text-emerald-600">
                    Successful
                  </span>
                </Row>
              </dl>
            </section>

            <section className="card-surface p-4 md:p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Paid into
              </p>
              <div className="mt-3 flex items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Landmark className="size-5" strokeWidth={2.2} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[13.5px] font-bold text-foreground">
                    {account.accountName}
                  </p>
                  <p className="truncate text-[12px] text-muted-foreground">
                    {account.bank} · {maskAccount(account.accountNumber)}
                  </p>
                </div>
              </div>
              <p className="mt-4 rounded-xl bg-secondary px-3 py-2.5 text-[12px] text-muted-foreground">
                Keep this reference for your records — it also appears in your
                transaction history.
              </p>
            </section>
          </div>

          <div className="mt-5 flex flex-col gap-2.5 md:flex-row">
            <Link
              to="/"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press md:w-auto md:px-10"
            >
              Back to home <ArrowRight className="size-4" strokeWidth={2.6} />
            </Link>
            <Link
              to="/portfolio/transactions"
              className="inline-flex w-full items-center justify-center rounded-xl border border-border bg-card px-5 py-3.5 text-[13.5px] font-bold text-foreground press md:w-auto md:px-8"
            >
              View transactions
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
