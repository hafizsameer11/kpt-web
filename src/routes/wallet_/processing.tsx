import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Banknote } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { AppShell } from "@/components/kipit/AppShell";
import { naira } from "@/lib/home-data";
import { depositReference } from "@/lib/wallet-data";
import {
  confirmCardFunding,
  confirmTransferFunding,
  fetchRecentWalletCredits,
  isAuthenticated,
} from "@/lib/api";
import { refreshWalletFromApi } from "@/lib/wallet-balance";

export const Route = createFileRoute("/wallet_/processing")({
  validateSearch: z.object({
    amount: z.number().catch(0),
    method: z.enum(["transfer", "card"]).catch("transfer"),
    fail: z.string().optional(),
    ref: z.string().optional(),
    pending: z.boolean().optional(),
  }),
  head: () => ({
    meta: [
      { title: "Confirming Your Deposit | Kipit" },
      {
        name: "description",
        content: "We're confirming your Kipit wallet deposit — this usually takes seconds.",
      },
      { property: "og:title", content: "Confirming Your Deposit | Kipit" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DepositProcessing,
});

function DepositProcessing() {
  const { amount, method, fail, ref, pending } = Route.useSearch();
  const navigate = useNavigate();
  const reference =
    ref ||
    (typeof window !== "undefined"
      ? window.sessionStorage.getItem("kipit:card-ref") ||
        window.sessionStorage.getItem("kipit:last-deposit-ref")
      : null) ||
    depositReference(amount);
  const [note, setNote] = useState(
    method === "transfer"
      ? "Waiting for your bank transfer to arrive…"
      : "Confirming your deposit",
  );
  const [timedOut, setTimedOut] = useState(false);

  const steps =
    method === "card"
      ? ["Authorizing your card", "Bank 3-D Secure check", "Crediting your wallet"]
      : ["Listening for your transfer", "Matching the payment", "Crediting your wallet"];

  useEffect(() => {
    let cancelled = false;
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const maxAttempts = method === "card" ? 15 : 25;
    const pollMs = method === "card" ? 2000 : 3000;

    const goHomePending = async () => {
      setTimedOut(true);
      setNote("We'll notify you when your payment is confirmed. Thanks.");
      await sleep(2200);
      if (!cancelled) void navigate({ to: "/", replace: true });
    };

    // Paystack callback often lands with ?reference= / ?trxref=
    const resolveCardRef = () => {
      if (ref) return ref;
      if (typeof window === "undefined") return undefined;
      const params = new URLSearchParams(window.location.search);
      return (
        params.get("reference") ||
        params.get("trxref") ||
        params.get("ref") ||
        window.sessionStorage.getItem("kipit:card-ref") ||
        undefined
      );
    };

    const confirmWithRetry = async (cardRef: string) => {
      let lastError: unknown;
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        if (cancelled) return;
        try {
          await confirmCardFunding(cardRef);
          return;
        } catch (err) {
          lastError = err;
          if (attempt === 5) setNote("Still confirming your payment…");
          if (attempt === 10) {
            setNote("Taking a bit longer — we'll notify you when it's confirmed.");
          }
          await sleep(pollMs);
        }
      }
      throw lastError ?? new Error("card confirm timed out");
    };

    const waitForTransferCredit = async () => {
      const storedAfter =
        typeof window !== "undefined"
          ? window.sessionStorage.getItem("kipit:transfer-watch-after")
          : null;
      const after = storedAfter || new Date(Date.now() - 60_000).toISOString();
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        if (cancelled) return null;
        try {
          const latest = await fetchRecentWalletCredits(after);
          const credit = latest.credits.find(
            (c) => c.channel === "transfer" || c.channel === "sandbox",
          );
          if (credit) {
            await refreshWalletFromApi();
            if (typeof window !== "undefined") {
              window.sessionStorage.removeItem("kipit:transfer-watch-after");
              window.sessionStorage.setItem(
                "kipit:last-deposit-ref",
                credit.reference || "",
              );
            }
            return { amount: credit.amount, ref: credit.reference || "" };
          }
          if (attempt === 5) setNote("Still waiting — transfers usually land within a minute.");
          if (attempt === 12) {
            setNote("Taking a bit longer — we'll notify you when your payment is confirmed.");
          }
        } catch {
          /* keep polling */
        }
        await sleep(pollMs);
      }
      return null;
    };

    const run = async () => {
      if (fail) {
        await sleep(1800);
        if (!cancelled) {
          void navigate({
            to: "/wallet/failed",
            search: { amount, reason: fail, ...(ref ? { ref } : {}) },
            replace: true,
          });
        }
        return;
      }

      try {
        if (!isAuthenticated()) throw new Error("not signed in");

        if (method === "card") {
          const cardRef = resolveCardRef();
          if (!cardRef) throw new Error("missing card reference");
          await confirmWithRetry(cardRef);
          if (cancelled) return;
          if (typeof window !== "undefined") {
            window.sessionStorage.setItem("kipit:last-deposit-ref", cardRef);
            window.sessionStorage.removeItem("kipit:card-ref");
          }
          await refreshWalletFromApi();
          await sleep(400);
          if (!cancelled) {
            void navigate({
              to: "/wallet/success",
              search: { amount, method, ref: cardRef },
              replace: true,
            });
          }
          return;
        }

        // Transfer: intent already created on "I've sent" — only poll for Monnify credit.
        if (pending !== false) {
          const alreadyConfirmed =
            typeof window !== "undefined" &&
            window.sessionStorage.getItem("kipit:transfer-confirmed") === "1";
          if (!alreadyConfirmed) {
            try {
              await confirmTransferFunding(amount);
            } catch {
              /* may already be pending */
            }
          } else if (typeof window !== "undefined") {
            window.sessionStorage.removeItem("kipit:transfer-confirmed");
          }
          const credited = await waitForTransferCredit();
          if (cancelled) return;
          if (credited != null && credited.amount > 0) {
            void navigate({
              to: "/wallet/success",
              search: {
                amount: credited.amount,
                method: "transfer",
                ...(credited.ref ? { ref: credited.ref } : {}),
              },
              replace: true,
            });
            return;
          }
          await goHomePending();
          return;
        }

        // No silent success path — require card confirm or transfer credit poll above.
        if (!cancelled) void navigate({ to: "/", replace: true });
      } catch {
        if (!cancelled) await goHomePending();
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [amount, method, fail, ref, pending, navigate]);

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
              {!timedOut ? (
                <span
                  aria-hidden
                  className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-gold [animation-duration:1.1s]"
                />
              ) : null}
              <span className="grid size-14 place-items-center rounded-full bg-gold/15 text-gold">
                <Banknote className="size-7" strokeWidth={2.2} />
              </span>
            </span>

            <p className="k-success-fade mt-7 font-display text-[22px] font-extrabold leading-tight tracking-[-0.02em]">
              {note}
            </p>
            <p className="k-success-fade mt-2 text-[12.5px] text-primary-foreground/65">
              {timedOut
                ? "You can leave — we'll update your wallet when the payment lands."
                : `${naira(amount)} · Ref ${reference}`}
            </p>

            {!timedOut ? (
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
            ) : (
              <p className="mt-6 text-[12.5px] text-primary-foreground/65">Taking you home…</p>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
