import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Banknote } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { AppShell } from "@/components/kipit/AppShell";
import { naira } from "@/lib/home-data";
import {
  findAccount,
  hydratePayoutFromApi,
  type PayoutAccount,
  withdrawalReference,
} from "@/lib/withdraw-data";

export const Route = createFileRoute("/withdraw_/processing")({
  validateSearch: z.object({
    acct: z.string().catch(""),
    amount: z.number().catch(0),
    ref: z.string().optional().catch(undefined),
    id: z.string().optional().catch(undefined),
  }),
  head: () => ({
    meta: [
      { title: "Withdrawal Processing | Kipit" },
      {
        name: "description",
        content:
          "Your Kipit withdrawal request is being processed and sent to your bank.",
      },
      { property: "og:title", content: "Withdrawal Processing | Kipit" },
      {
        property: "og:description",
        content: "We're sending your payout — track it until it settles.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProcessingScreen,
});

const STEPS = ["Debiting your wallet", "Sending to your bank", "Awaiting settlement"];

function ProcessingScreen() {
  const { acct, amount, ref, id } = Route.useSearch();
  const navigate = useNavigate();
  const [account, setAccount] = useState<PayoutAccount | undefined>();
  const reference = ref || withdrawalReference(amount);

  useEffect(() => {
    void hydratePayoutFromApi().then(() => setAccount(findAccount(acct)));
  }, [acct]);

  useEffect(() => {
    if (!account) return;
    const t = window.setTimeout(() => {
      void navigate({
        to: "/withdraw/tracker",
        search: { acct: account.id, amount, ref: reference, id },
        replace: true,
      });
    }, 2600);
    return () => window.clearTimeout(t);
  }, [account, amount, id, navigate, reference]);

  return (
    <AppShell title="Processing" navVariant="elevated">
      <div className="pb-2 md:mx-auto md:w-full md:max-w-[720px]">
        <section className="relative -mx-4 flex min-h-[70svh] flex-col items-center justify-center overflow-hidden bg-brand-gradient px-6 py-16 text-center text-primary-foreground md:mx-0 md:min-h-[60vh] md:rounded-xl md:shadow-float">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-gold/20 blur-[64px]"
          />
          <div className="relative">
            <span className="relative mx-auto grid size-20 place-items-center">
              <span
                aria-hidden
                className="k-success-ring absolute inset-0 rounded-full border-2 border-gold/50"
              />
              <span
                aria-hidden
                className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-gold [animation-duration:1.1s]"
              />
              <span className="grid size-14 place-items-center rounded-full bg-gold/15 text-gold">
                <Banknote className="size-7" strokeWidth={2.2} />
              </span>
            </span>

            <p className="k-success-fade mt-7 font-display text-[22px] font-extrabold leading-tight tracking-[-0.02em]">
              Your withdrawal request is being processed
            </p>
            <p className="k-success-fade mt-2 text-[12.5px] text-primary-foreground/65">
              {naira(amount)} to {account?.bank ?? "your bank"} · Ref {reference}
            </p>

            <ul className="mx-auto mt-7 w-full max-w-xs space-y-2.5 text-left">
              {STEPS.map((s, i) => (
                <li
                  key={s}
                  className="k-rise flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-2.5"
                  style={{ "--d": `${i * 700}ms` } as React.CSSProperties}
                >
                  <span className="size-1.5 shrink-0 rounded-full bg-gold" />
                  <span className="text-[12.5px] font-semibold text-primary-foreground/85">
                    {s}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
