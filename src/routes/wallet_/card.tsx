import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, CreditCard, Lock, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { AppShell } from "@/components/kipit/AppShell";
import { naira } from "@/lib/home-data";
import { cardFee, hydrateWalletFundingFromApi, SAVED_CARDS } from "@/lib/wallet-data";
import { ApiError, initializeCardFunding, isAuthenticated } from "@/lib/api";
import { storePaystackCheckout } from "@/lib/paystack-checkout";

export const Route = createFileRoute("/wallet_/card")({
  validateSearch: z.object({ amount: z.number().catch(0) }),
  head: () => ({
    meta: [
      { title: "Pay With Card | Kipit" },
      {
        name: "description",
        content:
          "Top up your Kipit wallet with a saved or new debit card via Paystack 3-D Secure checkout.",
      },
      { property: "og:title", content: "Pay With Card | Kipit" },
      {
        property: "og:description",
        content: "Fund your Kipit wallet securely with your debit card.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CardPayment,
});

function CardPayment() {
  const { amount } = Route.useSearch();
  const navigate = useNavigate();
  const [cards, setCards] = useState<typeof SAVED_CARDS>([]);
  const [selected, setSelected] = useState("new");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void hydrateWalletFundingFromApi().then(() => {
      setCards([...SAVED_CARDS]);
      setSelected(SAVED_CARDS[0]?.id ?? "new");
    });
  }, []);

  const fee = cardFee(amount);
  const isNew = selected === "new";
  const valid = amount > 0;

  const pay = async () => {
    if (!valid || busy) return;
    if (!isAuthenticated()) {
      toast.error("Sign in to fund your wallet.");
      void navigate({ to: "/welcome" });
      return;
    }
    setBusy(true);
    try {
      const init = await initializeCardFunding(
        amount,
        isNew ? { saveCard: true } : { cardTokenId: selected, saveCard: false },
      );
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("kipit:card-ref", init.reference);
        window.sessionStorage.setItem("kipit:card-fee", String(init.fee ?? fee));
      }
      // In-app Paystack Checkout (same pattern as mobile WebView) — never collect PAN/CVV in Kipit.
      if (init.authorizationUrl && !init.mock) {
        storePaystackCheckout({
          authorizationUrl: init.authorizationUrl,
          amount,
          reference: init.reference,
        });
        void navigate({
          to: "/wallet/paystack-checkout",
          search: { amount, ref: init.reference },
        });
        return;
      }
      void navigate({
        to: "/wallet/processing",
        search: { amount, method: "card", ref: init.reference },
      });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not start card payment.");
      setBusy(false);
    }
  };

  const savedCardList = (
    <ul className="space-y-2.5">
      {cards.map((card) => {
        const active = card.id === selected;
        return (
          <li key={card.id}>
            <button
              type="button"
              onClick={() => setSelected(card.id)}
              aria-pressed={active}
              className={`flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-colors press ${
                active ? "border-gold bg-gold/[0.07]" : "border-border bg-card hover:border-gold/40"
              }`}
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <CreditCard className="size-5" strokeWidth={2.2} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] font-bold text-foreground">
                  {card.brand} •••• {card.last4}
                </span>
                <span className="block truncate text-[12px] text-muted-foreground">
                  {card.bank} · Paystack Checkout
                </span>
              </span>
              <span
                className={`grid size-5 shrink-0 place-items-center rounded-full border ${
                  active ? "border-gold bg-gold text-gold-foreground" : "border-border"
                }`}
              >
                {active && <Check className="size-3.5" strokeWidth={3} />}
              </span>
            </button>
          </li>
        );
      })}
      <li>
        <button
          type="button"
          onClick={() => setSelected("new")}
          aria-pressed={isNew}
          className={`flex w-full items-center gap-3 rounded-xl border border-dashed p-3.5 text-left press ${
            isNew ? "border-gold bg-gold/[0.07]" : "border-border bg-card hover:border-gold/50"
          }`}
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold">
            <Plus className="size-5" strokeWidth={2.4} />
          </span>
          <span className="min-w-0">
            <span className="block text-[13.5px] font-bold text-foreground">Use a new card</span>
            <span className="block text-[12px] text-muted-foreground">
              Opens secure Paystack Checkout — Kipit never sees your card number
            </span>
          </span>
        </button>
      </li>
    </ul>
  );

  return (
    <AppShell title="Card Payment" navVariant="elevated">
      <div className="hidden md:block">
        <div className="mx-auto w-full max-w-[1080px] space-y-6 pb-10">
          <section className="relative overflow-hidden rounded-2xl bg-brand-gradient px-8 py-8 text-primary-foreground shadow-float">
            <span
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-32 size-80 rounded-full bg-gold/15 blur-[70px]"
            />
            <div className="relative flex flex-wrap items-end justify-between gap-8">
              <div>
                <Link
                  to="/wallet/add-money"
                  className="press inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[12px] font-bold hover:bg-white/15"
                >
                  <ArrowLeft className="size-4" /> Add money
                </Link>
                <p className="mt-6 text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary-foreground/60">
                  You're paying
                </p>
                <p className="mt-2 font-display text-[52px] font-extrabold leading-none tracking-[-0.035em] text-num">
                  {naira(amount + fee)}
                </p>
                <p className="mt-3 flex items-center gap-1.5 text-[12.5px] text-primary-foreground/65">
                  <Lock className="size-4" /> {naira(amount)} to wallet + {naira(fee)} card fee ·
                  Paystack 3-D Secure
                </p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[12.5px] font-extrabold">
                <Lock className="size-4 text-gold" /> PCI-DSS via Paystack
              </span>
            </div>
          </section>

          <div className="grid grid-cols-[minmax(0,1fr)_360px] items-start gap-6">
            <div>
              <h2 className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-muted-foreground">
                Pay with
              </h2>
              <div className="mt-3">{savedCardList}</div>
            </div>

            <div className="sticky top-6 space-y-4">
              <section className="rounded-2xl border border-border bg-card p-5">
                <h2 className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-muted-foreground">
                  Summary
                </h2>
                <dl className="mt-3 divide-y divide-border text-[13px]">
                  {[
                    ["To wallet", naira(amount)],
                    ["Card fee (1.5%)", naira(fee)],
                    ["Total charge", naira(amount + fee)],
                  ].map(([label, value], i) => (
                    <div key={label} className="flex items-center justify-between gap-3 py-2.5">
                      <dt className="text-muted-foreground">{label}</dt>
                      <dd
                        className={`font-bold text-foreground ${i === 2 ? "text-gold text-[15px]" : ""}`}
                      >
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
                <button
                  type="button"
                  onClick={() => void pay()}
                  disabled={!valid || busy}
                  className="press mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float disabled:opacity-40 disabled:shadow-none"
                >
                  {busy ? "Opening Paystack…" : `Pay ${naira(amount + fee)}`}{" "}
                  {!busy && <ArrowRight className="size-4" strokeWidth={2.6} />}
                </button>
                <p className="mt-3 text-center text-[11.5px] text-muted-foreground">
                  Paystack opens in Kipit — same secure checkout as the app.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>

      <div className="pb-2 md:hidden">
        <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-14 pt-6 text-primary-foreground">
          <div className="relative">
            <Link
              to="/wallet/add-money"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold press"
            >
              <ArrowLeft className="size-3.5" /> Add money
            </Link>
            <p className="mt-6 text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary-foreground/60">
              You're paying
            </p>
            <p className="mt-2 font-display text-[38px] font-extrabold leading-none tracking-[-0.035em] text-num">
              {naira(amount + fee)}
            </p>
            <p className="mt-3 flex items-center gap-1.5 text-[12px] text-primary-foreground/65">
              <Lock className="size-3.5" /> {naira(amount)} + {naira(fee)} fee · Paystack
            </p>
          </div>
        </section>

        <div className="relative -mx-4 -mt-8 rounded-t-[2rem] bg-background px-4 pt-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Pay with
          </p>
          <div className="mt-3">{savedCardList}</div>
          <button
            type="button"
            disabled={!valid || busy}
            onClick={() => void pay()}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press disabled:opacity-40"
          >
            {busy ? "Opening Paystack…" : `Pay ${naira(amount + fee)}`}{" "}
            {!busy && <ArrowRight className="size-4" strokeWidth={2.6} />}
          </button>
          <p className="mt-2.5 text-center text-[11.5px] text-muted-foreground">
            Card details are entered only on Paystack — checkout stays in Kipit.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
