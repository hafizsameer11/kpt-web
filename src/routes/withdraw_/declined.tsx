import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Landmark, RotateCcw, Wallet, XCircle } from "lucide-react";
import { z } from "zod";
import { AppShell } from "@/components/kipit/AppShell";
import { naira } from "@/lib/home-data";
import { findAccount, maskAccount, withdrawalReference } from "@/lib/withdraw-data";

export const Route = createFileRoute("/withdraw_/declined")({
  validateSearch: z.object({
    acct: z.string().catch("pa1"),
    amount: z.number().catch(0),
  }),
  head: () => ({
    meta: [
      { title: "Withdrawal Declined | Kipit" },
      {
        name: "description",
        content:
          "Your Kipit withdrawal could not be completed. See the reason and your wallet re-credit status.",
      },
      { property: "og:title", content: "Withdrawal Declined | Kipit" },
      {
        property: "og:description",
        content: "This payout was declined and the amount was returned to your wallet.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WithdrawDeclined,
});

function WithdrawDeclined() {
  const { acct, amount } = Route.useSearch();
  const account = findAccount(acct);
  const reference = withdrawalReference(amount);

  return (
    <AppShell title="Withdrawal Declined" navVariant="elevated">
      <div className="md:hidden">
        <MobileWithdrawDeclined
          amount={amount}
          account={account}
          reference={reference}
        />
      </div>
      <div className="hidden md:block">
        <DesktopWithdrawDeclined
          amount={amount}
          account={account}
          reference={reference}
        />
      </div>
    </AppShell>
  );
}

function MobileWithdrawDeclined({
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
          className="pointer-events-none absolute -right-20 -top-32 size-72 rounded-full bg-gold/15 blur-[64px]"
        />
        <div className="relative">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-destructive/20 text-destructive-foreground">
            <XCircle className="size-8 text-red-300" strokeWidth={2.2} />
          </span>
          <p className="mt-5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary-foreground/60">
            Withdrawal declined
          </p>
          <p className="mt-2 font-display text-[38px] font-extrabold leading-none tracking-[-0.035em] text-num">
            {naira(amount)}
          </p>
          <p className="mt-3 text-[12.5px] font-medium text-primary-foreground/70">
            Ref {reference} · {account.bank}
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
              What happened
            </p>
            <dl className="mt-3 divide-y divide-border text-[13px]">
              <Row label="Status">
                <StatusBadge />
              </Row>
              <Row label="Reason">Bank rejected the transfer</Row>
              <Row label="Reference">{reference}</Row>
            </dl>
            <p className="mt-3 rounded-xl bg-secondary px-3 py-2.5 text-[12px] text-muted-foreground">
              Your bank did not accept the payout. Confirm the account is
              active and can receive transfers, then try again.
            </p>
          </section>

          <section className="card-surface p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Wallet re-credit
            </p>
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.07] p-3.5">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-500/15 text-emerald-600">
                <Wallet className="size-5" strokeWidth={2.2} />
              </span>
              <div className="min-w-0">
                <p className="text-[13.5px] font-bold text-foreground">
                  {naira(amount)} returned
                </p>
                <p className="text-[12px] text-muted-foreground">
                  Re-credited to your Kipit Wallet — no fee charged.
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <Landmark className="size-4.5" strokeWidth={2.2} />
              </span>
              <p className="min-w-0 truncate text-[12px] text-muted-foreground">
                {account.accountName} · {maskAccount(account.accountNumber)}
              </p>
            </div>
          </section>
        </div>

        <div className="mt-5 flex flex-col gap-2.5">
          <Link
            to="/withdraw/amount"
            search={{ acct: account.id }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press"
          >
            <RotateCcw className="size-4" strokeWidth={2.6} /> Try again
          </Link>
          <Link
            to="/settings"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3.5 text-[13.5px] font-bold text-foreground press"
          >
            Contact support <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function DesktopWithdrawDeclined({
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
              className="pointer-events-none absolute -right-16 -top-28 size-80 rounded-full bg-gold/15 blur-[72px]"
            />
            <div className="relative">
              <span className="mx-auto grid size-20 place-items-center rounded-full bg-destructive/20 text-destructive-foreground">
                <XCircle className="size-10 text-red-300" strokeWidth={2.2} />
              </span>
              <p className="mt-6 text-[11px] font-extrabold uppercase tracking-[0.2em] text-primary-foreground/60">
                Withdrawal declined
              </p>
              <p className="mt-2 font-display text-[46px] font-extrabold leading-none tracking-[-0.035em] text-num">
                {naira(amount)}
              </p>
              <p className="mt-3 text-[13px] font-medium text-primary-foreground/70">
                Ref {reference} · {account.bank}
              </p>
            </div>
          </section>

          <section className="mt-6 card-surface p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              What happened
            </p>
            <dl className="mt-4 divide-y divide-border text-[13.5px]">
              <Row label="Status"><StatusBadge /></Row>
              <Row label="Reason">Bank rejected the transfer</Row>
              <Row label="Reference">{reference}</Row>
            </dl>
            <p className="mt-4 rounded-xl bg-secondary px-4 py-3 text-[12.5px] leading-relaxed text-muted-foreground">
              Your bank did not accept the payout. Confirm the account is active
              and can receive transfers, then try again.
            </p>
          </section>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to="/withdraw/amount"
              search={{ acct: account.id }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-gradient px-8 py-3 text-[13.5px] font-extrabold text-primary-foreground shadow-float press"
            >
              <RotateCcw className="size-4" strokeWidth={2.6} /> Try again
            </Link>
            <Link
              to="/settings"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-8 py-3 text-[13.5px] font-bold text-foreground press"
            >
              Contact support <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        <div className="space-y-5 lg:col-span-5">
          <section className="card-surface p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Wallet re-credit
            </p>
            <div className="mt-4 flex items-center gap-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.07] p-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-600">
                <Wallet className="size-6" strokeWidth={2.2} />
              </span>
              <div className="min-w-0">
                <p className="text-[15px] font-bold text-foreground">
                  {naira(amount)} returned
                </p>
                <p className="text-[13px] text-muted-foreground">
                  Re-credited to your Kipit Wallet — no fee charged.
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <Landmark className="size-5" strokeWidth={2.2} />
              </span>
              <p className="min-w-0 truncate text-[13px] text-muted-foreground">
                {account.accountName} · {maskAccount(account.accountNumber)}
              </p>
            </div>
          </section>

          <section className="card-surface p-5">
            <p className="text-[13px] font-bold text-foreground">Common fixes</p>
            <ul className="mt-4 space-y-3 text-[13px] text-muted-foreground">
              <li className="flex gap-3">
                <span className="mt-0.5 block h-1.5 w-1.5 rounded-full bg-gold" />
                Check that the account number is correct
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 block h-1.5 w-1.5 rounded-full bg-gold" />
                Confirm the bank account can receive transfers
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 block h-1.5 w-1.5 rounded-full bg-gold" />
                Try a different payout account if available
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

function StatusBadge() {
  return (
    <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-extrabold text-destructive">
      Declined
    </span>
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
