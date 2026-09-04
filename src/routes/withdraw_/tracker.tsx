import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Clock, Landmark, Loader2 } from "lucide-react";
import { z } from "zod";
import { AppShell } from "@/components/kipit/AppShell";
import { naira } from "@/lib/home-data";
import {
  findAccount,
  maskAccount,
  payoutEta,
  withdrawalReference,
} from "@/lib/withdraw-data";

export const Route = createFileRoute("/withdraw_/tracker")({
  validateSearch: z.object({
    acct: z.string().catch("pa1"),
    amount: z.number().catch(0),
  }),
  head: () => ({
    meta: [
      { title: "Withdrawal Tracker | Kipit" },
      {
        name: "description",
        content:
          "Follow your Kipit withdrawal from request to settlement in your bank account.",
      },
      { property: "og:title", content: "Withdrawal Tracker | Kipit" },
      {
        property: "og:description",
        content: "Live status for your Kipit payout request.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TrackerScreen,
});

function TrackerScreen() {
  const { acct, amount } = Route.useSearch();
  const account = findAccount(acct);
  const reference = withdrawalReference(amount);

  const steps = [
    { label: "Requested", detail: "Today · 14:02", state: "done" as const },
    { label: "Processing", detail: "Sent to your bank", state: "active" as const },
    { label: "Successful / Declined", detail: payoutEta, state: "pending" as const },
  ];

  return (
    <AppShell title="Withdrawal Tracker" navVariant="elevated">
      <div className="pb-2">
        <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-14 pt-8 text-primary-foreground md:mx-0 md:rounded-xl md:px-8 md:py-10 md:shadow-float">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-32 size-72 rounded-full bg-gold/15 blur-[64px]"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-28 -left-20 hidden size-64 rounded-full bg-white/10 blur-[56px] md:block"
          />
          <div className="relative md:flex md:items-end md:justify-between md:gap-10">
            <div className="md:max-w-xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-2.5 py-1 text-[11px] font-extrabold text-gold">
                <Clock className="size-3.5" /> Processing
              </span>
              <p className="mt-5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary-foreground/60">
                Withdrawal amount
              </p>
              <p className="mt-2 font-display text-[38px] font-extrabold leading-none tracking-[-0.035em] text-num md:text-[52px]">
                {naira(amount)}
              </p>
              <p className="mt-3 text-[12px] font-medium text-primary-foreground/60">
                Ref {reference} · {account.bank} {maskAccount(account.accountNumber)}
              </p>
            </div>

            {/* Desktop status panel */}
            <div className="hidden w-72 shrink-0 rounded-xl border border-white/12 bg-white/8 p-4 backdrop-blur-md md:block">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-primary-foreground/55">
                Estimated settlement
              </p>
              <p className="mt-1.5 text-[13px] font-bold">{payoutEta}</p>
              <div className="mt-3 border-t border-white/12 pt-3">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-primary-foreground/55">
                  Fee
                </p>
                <p className="mt-1.5 text-[13px] font-bold text-gold">Free</p>
              </div>
              <div className="mt-3 border-t border-white/12 pt-3">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-primary-foreground/55">
                  Reference
                </p>
                <p className="mt-1.5 text-[13px] font-bold">{reference}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="relative -mx-4 -mt-8 rounded-t-[2rem] bg-background px-4 pt-5 md:mx-0 md:mt-6 md:rounded-none md:bg-transparent md:px-0 md:pt-0">
          <span
            aria-hidden
            className="mx-auto mb-4 block h-1 w-10 rounded-full bg-border md:hidden"
          />

          <div className="space-y-4 md:grid md:grid-cols-[minmax(0,1fr)_360px] md:items-start md:gap-6 md:space-y-0">
            <section className="card-surface p-4 md:p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Status timeline
              </p>
              <ol className="mt-4 space-y-0">
                {steps.map((s, i) => (
                  <li key={s.label} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span
                        className={`grid size-7 shrink-0 place-items-center rounded-full border ${
                          s.state === "done"
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : s.state === "active"
                              ? "border-gold bg-gold text-gold-foreground"
                              : "border-border bg-card text-muted-foreground"
                        }`}
                      >
                        {s.state === "done" ? (
                          <Check className="size-3.5" strokeWidth={3} />
                        ) : s.state === "active" ? (
                          <Loader2 className="size-3.5 animate-spin" strokeWidth={3} />
                        ) : (
                          <span className="size-1.5 rounded-full bg-current" />
                        )}
                      </span>
                      {i < steps.length - 1 && (
                        <span className="my-1 w-px flex-1 bg-border" />
                      )}
                    </div>
                    <div className="pb-5">
                      <p className="text-[13.5px] font-bold text-foreground">{s.label}</p>
                      <p className="text-[12px] text-muted-foreground">{s.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <section className="card-surface p-4 md:p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Payout account
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
                Most payouts settle within minutes. If your bank delays it, the
                amount is returned to your Kipit wallet automatically.
              </p>
            </section>
          </div>

          <div className="mt-5 flex flex-col gap-2.5 md:flex-row">
            <Link
              to="/withdraw/success"
              search={{ acct: account.id, amount }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press md:w-auto md:px-10"
            >
              View outcome <ArrowRight className="size-4" strokeWidth={2.6} />
            </Link>
            <Link
              to="/portfolio/transactions"
              className="inline-flex w-full items-center justify-center rounded-xl border border-border bg-card px-5 py-3.5 text-[13.5px] font-bold text-foreground press md:w-auto md:px-8"
            >
              Transaction history
            </Link>
          </div>
          <p className="mt-2.5 text-[11.5px] text-muted-foreground">
            Prototype: if a payout fails you'll see the{" "}
            <Link
              to="/withdraw/declined"
              search={{ acct: account.id, amount }}
              className="font-bold text-primary underline underline-offset-2"
            >
              declined state
            </Link>
            .
          </p>
        </div>
      </div>
    </AppShell>
  );
}
