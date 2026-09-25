import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Check, Clock, Landmark, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { AppShell } from "@/components/kipit/AppShell";
import { naira } from "@/lib/home-data";
import { fetchWithdrawal } from "@/lib/api";
import {
  findAccount,
  hydratePayoutFromApi,
  maskAccount,
  payoutEta,
  type PayoutAccount,
} from "@/lib/withdraw-data";

export const Route = createFileRoute("/withdraw_/tracker")({
  validateSearch: z.object({
    acct: z.string().catch(""),
    amount: z.number().catch(0),
    ref: z.string().optional().catch(undefined),
    id: z.string().optional().catch(undefined),
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

type StepState = "done" | "active" | "pending";

function TrackerScreen() {
  const { acct, amount, ref, id } = Route.useSearch();
  const navigate = useNavigate();
  const [account, setAccount] = useState<PayoutAccount | undefined>();
  const [status, setStatus] = useState("PROCESSING");
  const [reference, setReference] = useState(ref || "—");
  const [note, setNote] = useState("Sent to your bank");
  const [createdLabel, setCreatedLabel] = useState("Requested");

  useEffect(() => {
    void hydratePayoutFromApi().then(() => setAccount(findAccount(acct)));
  }, [acct]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    const poll = async () => {
      for (let attempt = 0; attempt < 60; attempt++) {
        if (cancelled) return;
        try {
          const row = await fetchWithdrawal(id);
          if (cancelled) return;
          setStatus(row.status);
          setReference(row.reference || ref || "—");
          if (row.createdAt) {
            setCreatedLabel(
              new Date(row.createdAt).toLocaleString("en-NG", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              }),
            );
          }
          const u = row.status.toUpperCase();
          if (u === "SUCCESSFUL" || u === "COMPLETED" || u === "SUCCESS") {
            setNote("Settled in your bank");
            await sleep(600);
            if (!cancelled) {
              void navigate({
                to: "/withdraw/success",
                search: {
                  acct,
                  amount: row.amount || amount,
                  ref: row.reference,
                  id: row.id,
                },
                replace: true,
              });
            }
            return;
          }
          if (u === "DECLINED" || u === "FAILED" || u === "REJECTED") {
            setNote(row.declineReason || "Payout declined");
            await sleep(600);
            if (!cancelled) {
              void navigate({
                to: "/withdraw/declined",
                search: {
                  acct,
                  amount: row.amount || amount,
                  ref: row.reference,
                  id: row.id,
                  reason: row.declineReason || undefined,
                },
                replace: true,
              });
            }
            return;
          }
          if (attempt === 10) setNote("Still processing with your bank…");
          if (attempt === 30) setNote("Taking longer than usual — hang tight.");
        } catch {
          /* keep polling */
        }
        await sleep(3000);
      }
      if (!cancelled) setNote("Still pending — check back from Transaction history.");
    };

    void poll();
    return () => {
      cancelled = true;
    };
  }, [acct, amount, id, navigate, ref]);

  const upper = status.toUpperCase();
  const settled =
    upper === "SUCCESSFUL" || upper === "COMPLETED" || upper === "SUCCESS";
  const declined =
    upper === "DECLINED" || upper === "FAILED" || upper === "REJECTED";

  const steps: { label: string; detail: string; state: StepState }[] = [
    { label: "Requested", detail: createdLabel, state: "done" },
    {
      label: "Processing",
      detail: note,
      state: settled || declined ? "done" : "active",
    },
    {
      label: settled ? "Successful" : declined ? "Declined" : "Successful / Declined",
      detail: settled || declined ? note : payoutEta,
      state: settled || declined ? "done" : "pending",
    },
  ];

  if (!account) {
    return (
      <AppShell title="Withdrawal Tracker" navVariant="elevated">
        <p className="px-4 py-10 text-[13px] text-muted-foreground">Loading…</p>
      </AppShell>
    );
  }

  return (
    <AppShell title="Withdrawal Tracker" navVariant="elevated">
      <div className="pb-2">
        <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-14 pt-8 text-primary-foreground md:mx-0 md:rounded-xl md:px-8 md:py-10 md:shadow-float">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-32 size-72 rounded-full bg-gold/15 blur-[64px]"
          />
          <div className="relative md:flex md:items-end md:justify-between md:gap-10">
            <div className="md:max-w-xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-2.5 py-1 text-[11px] font-extrabold text-gold">
                <Clock className="size-3.5" />{" "}
                {settled ? "Successful" : declined ? "Declined" : "Processing"}
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

          <div className="space-y-4 md:grid md:grid-cols-2 md:items-start md:gap-4 md:space-y-0">
            <section className="card-surface p-4 md:p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Progress
              </p>
              <ol className="mt-4 space-y-4">
                {steps.map((step) => (
                  <li key={step.label} className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-full ${
                        step.state === "done"
                          ? "bg-brand text-primary-foreground"
                          : step.state === "active"
                            ? "bg-gold/20 text-gold"
                            : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {step.state === "done" ? (
                        <Check className="size-3.5" strokeWidth={2.6} />
                      ) : step.state === "active" ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Clock className="size-3.5" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[13.5px] font-bold">{step.label}</p>
                      <p className="mt-0.5 text-[12px] text-muted-foreground">{step.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <section className="card-surface p-4 md:p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Destination
              </p>
              <div className="mt-3 flex items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Landmark className="size-5" strokeWidth={2.2} />
                </span>
                <div className="min-w-0">
                  <p className="text-[13.5px] font-bold">{account.bank}</p>
                  <p className="text-[12px] text-muted-foreground">
                    {maskAccount(account.accountNumber)} · {account.accountName}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-[11.5px] leading-relaxed text-muted-foreground">
                If the bank declines the payout, the amount is returned to your Kipit wallet
                automatically.
              </p>
            </section>
          </div>

          <div className="mt-5 flex flex-col gap-2.5 md:flex-row">
            {!id ? (
              <Link
                to="/withdraw/success"
                search={{ acct: account.id, amount, ref: reference }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press md:w-auto md:px-10"
              >
                View outcome <ArrowRight className="size-4" strokeWidth={2.6} />
              </Link>
            ) : (
              <p className="text-[12.5px] text-muted-foreground">
                We&apos;ll move you to the outcome as soon as your bank responds.
              </p>
            )}
            <Link
              to="/portfolio/transactions"
              className="inline-flex w-full items-center justify-center rounded-xl border border-border bg-card px-5 py-3.5 text-[13.5px] font-bold text-foreground press md:w-auto md:px-8"
            >
              Transaction history
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
