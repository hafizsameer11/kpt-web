import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, TrendingUp } from "lucide-react";
import { z } from "zod";
import { AppShell } from "@/components/kipit/AppShell";
import { naira, WALLET } from "@/lib/home-data";
import { cardFee, depositReference } from "@/lib/wallet-data";

export const Route = createFileRoute("/wallet_/success")({
  validateSearch: z.object({
    amount: z.number().catch(0),
    method: z.enum(["transfer", "card"]).catch("transfer"),
  }),
  head: () => ({
    meta: [
      { title: "Deposit Successful | Kipit" },
      {
        name: "description",
        content:
          "Your Kipit wallet has been credited. Put the money to work in a plan and start earning.",
      },
      { property: "og:title", content: "Deposit Successful | Kipit" },
      {
        property: "og:description",
        content: "Your wallet top-up landed — invest it to start earning.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DepositSuccess,
});

function DepositSuccess() {
  const { amount, method } = Route.useSearch();
  const fee = method === "card" ? cardFee(amount) : 0;
  const reference = depositReference(amount);

  return (
    <AppShell title="Deposit Successful" navVariant="elevated">
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
              Wallet credited
            </p>
            <p className="k-success-fade mt-2 font-display text-[38px] font-extrabold leading-none tracking-[-0.035em] text-num md:text-[46px]">
              {naira(amount)}
            </p>
            <p className="k-success-fade mt-3 text-[12.5px] font-medium text-primary-foreground/70">
              New wallet balance {naira(WALLET + amount)}
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
                <Row label="Fee">{fee === 0 ? "₦0" : naira(fee)}</Row>
                <Row label="Method">
                  {method === "card" ? "Debit card" : "Bank transfer"}
                </Row>
                <Row label="Status">
                  <span className="rounded-full bg-emerald-500/12 px-2 py-0.5 text-[11px] font-extrabold text-emerald-600">
                    Successful
                  </span>
                </Row>
              </dl>
            </section>

            <section className="card-surface p-4 md:p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Make it earn
              </p>
              <div className="mt-3 flex items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold">
                  <TrendingUp className="size-5" strokeWidth={2.2} />
                </span>
                <p className="text-[12.5px] leading-snug text-muted-foreground">
                  Wallet cash doesn't earn interest. Move it into the Call Account for daily
                  interest, or lock a fixed plan for a higher rate.
                </p>
              </div>
              <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
                <Link
                  to="/call-account/add-money"
                  className="inline-flex w-full items-center justify-center rounded-xl border border-border bg-background px-4 py-3 text-[13px] font-bold text-foreground press"
                >
                  Call Account
                </Link>
                <Link
                  to="/fixed-plans/create"
                  className="inline-flex w-full items-center justify-center rounded-xl border border-border bg-background px-4 py-3 text-[13px] font-bold text-foreground press"
                >
                  Fixed plan
                </Link>
              </div>
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
