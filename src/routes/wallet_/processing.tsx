import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Banknote } from "lucide-react";
import { useEffect } from "react";
import { z } from "zod";
import { AppShell } from "@/components/kipit/AppShell";
import { naira } from "@/lib/home-data";
import { depositReference } from "@/lib/wallet-data";

export const Route = createFileRoute("/wallet_/processing")({
  validateSearch: z.object({
    amount: z.number().catch(0),
    method: z.enum(["transfer", "card"]).catch("transfer"),
    fail: z.string().optional(),
  }),
  head: () => ({
    meta: [
      { title: "Confirming Your Deposit | Kipit" },
      {
        name: "description",
        content: "We're confirming your Kipit wallet deposit — this usually takes seconds.",
      },
      { property: "og:title", content: "Confirming Your Deposit | Kipit" },
      {
        property: "og:description",
        content: "Hang on while we confirm your wallet top-up.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DepositProcessing,
});

function DepositProcessing() {
  const { amount, method, fail } = Route.useSearch();
  const navigate = useNavigate();
  const reference = depositReference(amount);

  const steps =
    method === "card"
      ? ["Authorizing your card", "Bank 3-D Secure check", "Crediting your wallet"]
      : ["Listening for your transfer", "Matching the payment", "Crediting your wallet"];

  useEffect(() => {
    const t = window.setTimeout(() => {
      if (fail) {
        void navigate({ to: "/wallet/failed", search: { amount, reason: fail }, replace: true });
      } else {
        void navigate({ to: "/wallet/success", search: { amount, method }, replace: true });
      }
    }, 2600);
    return () => window.clearTimeout(t);
  }, [amount, method, fail, navigate]);

  return (
    <AppShell title="Processing" navVariant="elevated">
      <div className="pb-2 md:mx-auto md:w-full md:max-w-[720px]">
        <section className="relative -mx-4 flex min-h-[70svh] flex-col items-center justify-center overflow-hidden bg-brand-gradient px-6 py-16 text-center text-primary-foreground md:mx-0 md:min-h-[540px] md:rounded-2xl md:px-10 md:shadow-float">
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
              Confirming your deposit
            </p>
            <p className="k-success-fade mt-2 text-[12.5px] text-primary-foreground/65">
              {naira(amount)} · Ref {reference}
            </p>

            <ul className="k-success-fade mx-auto mt-7 w-full max-w-xs space-y-2.5 text-left">
              {steps.map((step, i) => (
                <li
                  key={step}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-[12.5px] font-semibold"
                  style={{ animationDelay: `${i * 220}ms` }}
                >
                  <span className="size-1.5 shrink-0 animate-pulse rounded-full bg-gold" />
                  {step}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
