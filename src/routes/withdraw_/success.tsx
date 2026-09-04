import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { debitWallet } from "@/lib/wallet-balance";
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
  const applied = useRef(false);

  useEffect(() => {
    if (applied.current || amount <= 0) return;
    applied.current = true;
    debitWallet(`withdrawal-${Date.now()}-${amount}`, amount);
  }, [amount]);

  const account = findAccount(acct);
  const reference = withdrawalReference(amount);

  return (
    <AppShell title="Withdrawal Successful" navVariant="elevated">
      <div className="md:hidden">
        <MobileWithdrawSuccess
          amount={amount}
          account={account}
          reference={reference}
        />
      </div>
      <div className="hidden md:block">
        <DesktopWithdrawSuccess
          amount={amount}
          account={account}
          reference={reference}
        />
      </div>
    </AppShell>
  );
}

function MobileWithdrawSuccess({
  amount,
  account,
  reference,
}: {
  amount: number;
  account: ReturnType<typeof findAccount>;
  reference: string;
}) {
  return (
    <div className="pb-2">
      <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-16 pt-10 text-center text-primary-foreground">
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
          <p className="k-success-fade mt-2 font-display text-[38px] font-extrabold leading-none tracking-[-0.035em] text-num">
            {naira(amount)}
          </p>
          <p className="k-success-fade mt-3 text-[12.5px] font-medium text-primary-foreground/70">
            Sent to {account.bank} · {maskAccount(account.accountNumber)}
          </p>
        </div>
      </section>

      <div className="relative -mx-4 -mt-8 rounded-t-[2rem] bg-background px-4 pt-5">
        <span
          aria-hidden
          className="mx-auto mb-4 block h-1 w-10 rounded-full bg-border"
        />

        <div className="space-y-4">
          <section className="card-surface p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Receipt
            </p>
            <dl className="mt-3 divide-y divide-border text-[13px]">
              <Row label="Reference">{reference}</Row>
              <Row label="Amount">{naira(amount)}</Row>
              <Row label="Fee">{WITHDRAWAL_FEE === 0 ? "₦0" : naira(WITHDRAWAL_FEE)}</Row>
              <Row label="From">Kipit Wallet</Row>
              <Row label="Status">
                <StatusBadge />
              </Row>
            </dl>
          </section>

          <section className="card-surface p-4">
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

        <div className="mt-5 flex flex-col gap-2.5">
          <Link
            to="/"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press"
          >
            Back to home <ArrowRight className="size-4" strokeWidth={2.6} />
          </Link>
          <Link
            to="/portfolio/transactions"
            className="inline-flex w-full items-center justify-center rounded-xl border border-border bg-card px-5 py-3.5 text-[13.5px] font-bold text-foreground press"
          >
            View transactions
          </Link>
        </div>
      </div>
    </div>
  );
}

function DesktopWithdrawSuccess({
  amount,
  account,
  reference,
}: {
  amount: number;
  account: ReturnType<typeof findAccount>;
  reference: string;
}) {
  return (
    <div className="mx-auto max-w-5xl pb-8">
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <section className="relative overflow-hidden rounded-2xl bg-brand-gradient px-8 py-10 text-center text-primary-foreground shadow-float">
            <span
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-28 size-80 rounded-full bg-gold/18 blur-[72px]"
            />
            <div className="relative">
              <span className="relative mx-auto grid size-20 place-items-center">
                <span
                  aria-hidden
                  className="k-success-ring absolute inset-0 rounded-full border-2 border-gold"
                />
                <span className="k-success-pop grid size-20 place-items-center rounded-full bg-gold text-gold-foreground shadow-float">
                  <svg viewBox="0 0 24 24" className="size-10" fill="none" aria-hidden>
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
              <p className="k-success-fade mt-6 text-[11px] font-extrabold uppercase tracking-[0.2em] text-primary-foreground/60">
                Withdrawal completed
              </p>
              <p className="k-success-fade mt-2 font-display text-[46px] font-extrabold leading-none tracking-[-0.035em] text-num">
                {naira(amount)}
              </p>
              <p className="k-success-fade mt-3 text-[13px] font-medium text-primary-foreground/70">
                Sent to {account.bank} · {maskAccount(account.accountNumber)}
              </p>

              <div className="k-success-fade mx-auto mt-6 flex max-w-md items-center justify-between rounded-xl bg-primary-foreground/10 px-4 py-3 backdrop-blur-sm">
                <Step label="Initiated" done />
                <div className="h-px flex-1 bg-gold/40" />
                <Step label="Processing" done />
                <div className="h-px flex-1 bg-gold/40" />
                <Step label="Completed" done />
              </div>
            </div>
          </section>

          <section className="mt-6 card-surface p-5">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Receipt
              </p>
              <button
                type="button"
                onClick={() => window.print()}
                className="text-[12px] font-bold text-primary hover:underline"
              >
                Print / Save
              </button>
            </div>
            <dl className="mt-4 divide-y divide-border text-[13.5px]">
              <Row label="Reference">{reference}</Row>
              <Row label="Amount">{naira(amount)}</Row>
              <Row label="Fee">{WITHDRAWAL_FEE === 0 ? "₦0" : naira(WITHDRAWAL_FEE)}</Row>
              <Row label="From">Kipit Wallet</Row>
              <Row label="Status"><StatusBadge /></Row>
            </dl>
          </section>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-gradient px-8 py-3 text-[13.5px] font-extrabold text-primary-foreground shadow-float press"
            >
              Back to home <ArrowRight className="size-4" strokeWidth={2.6} />
            </Link>
            <Link
              to="/portfolio/transactions"
              className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-8 py-3 text-[13.5px] font-bold text-foreground press"
            >
              View transactions
            </Link>
          </div>
        </div>

        <div className="space-y-5 lg:col-span-5">
          <section className="card-surface p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Paid into
            </p>
            <div className="mt-4 flex items-center gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Landmark className="size-6" strokeWidth={2.2} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[15px] font-bold text-foreground">
                  {account.accountName}
                </p>
                <p className="truncate text-[13px] text-muted-foreground">
                  {account.bank} · {maskAccount(account.accountNumber)}
                </p>
              </div>
            </div>
            <p className="mt-4 rounded-xl bg-secondary px-4 py-3 text-[12.5px] leading-relaxed text-muted-foreground">
              Keep this reference for your records — it also appears in your
              transaction history.
            </p>
          </section>

          <section className="card-surface p-5">
            <p className="text-[13px] font-bold text-foreground">What's next?</p>
            <div className="mt-4 space-y-3">
              <NextLink to="/invest" label="Invest your balance" desc="Put your money to work" />
              <NextLink to="/portfolio" label="Track your portfolio" desc="See all your investments" />
              <NextLink to="/settings/help" label="Need help?" desc="Chat with our support team" />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function StatusBadge() {
  return (
    <span className="rounded-full bg-emerald-500/12 px-2 py-0.5 text-[11px] font-extrabold text-emerald-600">
      Successful
    </span>
  );
}

function Step({ label, done }: { label: string; done?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1.5 px-2">
      <span
        className={
          done
            ? "grid size-5 place-items-center rounded-full bg-gold text-gold-foreground"
            : "grid size-5 place-items-center rounded-full border border-primary-foreground/30 text-[10px] text-primary-foreground/60"
        }
      >
        {done ? (
          <svg viewBox="0 0 24 24" className="size-3" fill="none" aria-hidden>
            <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <span className="block h-1.5 w-1.5 rounded-full bg-current" />
        )}
      </span>
      <span className="text-[10px] font-semibold text-primary-foreground/80">{label}</span>
    </div>
  );
}

function NextLink({ to, label, desc }: { to: string; label: string; desc: string }) {
  return (
    <Link
      to={to}
      className="group flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:bg-secondary"
    >
      <div>
        <p className="text-[13px] font-bold text-foreground group-hover:text-primary">{label}</p>
        <p className="text-[12px] text-muted-foreground">{desc}</p>
      </div>
      <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" strokeWidth={2.4} />
    </Link>
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
