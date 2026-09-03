import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, CreditCard, Lock, Plus } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { AppShell } from "@/components/kipit/AppShell";
import { naira } from "@/lib/home-data";
import { cardFee, SAVED_CARDS } from "@/lib/wallet-data";

export const Route = createFileRoute("/wallet_/card")({
  validateSearch: z.object({ amount: z.number().catch(0) }),
  head: () => ({
    meta: [
      { title: "Pay With Card | Kipit" },
      {
        name: "description",
        content:
          "Top up your Kipit wallet with a saved or new debit card, secured by 3-D Secure.",
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
  const [selected, setSelected] = useState(SAVED_CARDS[0]?.id ?? "new");
  const [number, setNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const fee = cardFee(amount);
  const isNew = selected === "new";
  const newValid = number.replace(/\s/g, "").length === 16 && expiry.length === 5 && cvv.length === 3;
  const valid = amount > 0 && (!isNew || newValid);

  const pay = () =>
    void navigate({ to: "/wallet/processing", search: { amount, method: "card" } });

  const savedCardList = (
    <ul className="space-y-2.5">
      {SAVED_CARDS.map((card) => {
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
                  {card.bank} · expires {card.expiry}
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
              We tokenize it — Kipit never stores your card number
            </span>
          </span>
        </button>
      </li>
    </ul>
  );

  return (
    <AppShell title="Card Payment" navVariant="elevated">
      {/* ── Desktop (md+) ───────────────────────────────────────── */}
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
                  <Lock className="size-4" /> {naira(amount)} to wallet + {naira(fee)} card fee
                  · PCI-DSS secured
                </p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[12.5px] font-extrabold">
                <Lock className="size-4 text-gold" /> 3-D Secure checkout
              </span>
            </div>
          </section>

          <div className="grid grid-cols-[minmax(0,1fr)_360px] items-start gap-6">
            <div className="space-y-5">
              <div>
                <h2 className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-muted-foreground">
                  Pay with
                </h2>
                <div className="mt-3">{savedCardList}</div>
              </div>

              {isNew && (
                <section className="rounded-2xl border border-border bg-card p-5">
                  <label className="block">
                    <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-muted-foreground">
                      Card number
                    </span>
                    <input
                      inputMode="numeric"
                      placeholder="0000 0000 0000 0000"
                      value={number}
                      onChange={(e) =>
                        setNumber(
                          e.target.value
                            .replace(/[^0-9]/g, "")
                            .slice(0, 16)
                            .replace(/(.{4})/g, "$1 ")
                            .trim(),
                        )
                      }
                      className="mt-2 w-full rounded-xl border border-border bg-background px-3.5 py-3 text-[15px] font-bold tracking-[0.06em] text-num text-foreground outline-none placeholder:text-[13px] placeholder:font-medium placeholder:text-muted-foreground focus:border-gold"
                    />
                  </label>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-muted-foreground">
                        Expiry
                      </span>
                      <input
                        inputMode="numeric"
                        placeholder="MM/YY"
                        value={expiry}
                        onChange={(e) => {
                          const d = e.target.value.replace(/[^0-9]/g, "").slice(0, 4);
                          setExpiry(d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d);
                        }}
                        className="mt-2 w-full rounded-xl border border-border bg-background px-3.5 py-3 text-[15px] font-bold text-num text-foreground outline-none placeholder:text-[13px] placeholder:font-medium placeholder:text-muted-foreground focus:border-gold"
                      />
                    </label>
                    <label className="block">
                      <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-muted-foreground">
                        CVV
                      </span>
                      <input
                        inputMode="numeric"
                        placeholder="123"
                        value={cvv}
                        onChange={(e) =>
                          setCvv(e.target.value.replace(/[^0-9]/g, "").slice(0, 3))
                        }
                        className="mt-2 w-full rounded-xl border border-border bg-background px-3.5 py-3 text-[15px] font-bold text-num text-foreground outline-none placeholder:text-[13px] placeholder:font-medium placeholder:text-muted-foreground focus:border-gold"
                      />
                    </label>
                  </div>
                </section>
              )}
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
                  disabled={!valid}
                  onClick={pay}
                  className="press mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float disabled:opacity-40 disabled:shadow-none"
                >
                  Pay {naira(amount + fee)} <ArrowRight className="size-4" strokeWidth={2.6} />
                </button>
                <p className="mt-3 text-center text-[11.5px] text-muted-foreground">
                  You may be asked to complete your bank's 3-D Secure check.
                </p>
              </section>
              <div className="flex items-start gap-2.5 rounded-xl border border-border bg-card px-4 py-3 text-[11.5px] leading-relaxed text-muted-foreground">
                <Lock className="mt-0.5 size-4 shrink-0 text-primary" />
                Card details are tokenized by a PCI-DSS certified processor. Kipit never sees
                or stores your full card number.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pb-2 md:hidden">
        <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-14 pt-6 text-primary-foreground md:mx-0 md:rounded-xl md:px-8 md:pt-8 md:shadow-float">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-32 size-72 rounded-full bg-gold/15 blur-[64px]"
          />
          <div className="relative md:max-w-3xl">
            <Link
              to="/wallet/add-money"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold text-primary-foreground press"
            >
              <ArrowLeft className="size-3.5" /> Add money
            </Link>
            <p className="mt-6 text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary-foreground/60">
              You're paying
            </p>
            <p className="mt-2 font-display text-[38px] font-extrabold leading-none tracking-[-0.035em] text-num md:text-[46px]">
              {naira(amount + fee)}
            </p>
            <p className="mt-3 flex items-center gap-1.5 text-[12px] text-primary-foreground/65">
              <Lock className="size-3.5" /> {naira(amount)} to wallet + {naira(fee)} card fee ·
              PCI-DSS secured
            </p>
          </div>
        </section>

        <div className="relative -mx-4 -mt-8 rounded-t-[2rem] bg-background px-4 pt-5 md:mx-0 md:mt-6 md:rounded-none md:bg-transparent md:px-0 md:pt-0">
          <span
            aria-hidden
            className="mx-auto mb-4 block h-1 w-10 rounded-full bg-border md:hidden"
          />

          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Pay with
          </p>

          <ul className="mt-3 space-y-2.5 md:grid md:grid-cols-2 md:gap-3 md:space-y-0">
            {SAVED_CARDS.map((card) => {
              const active = card.id === selected;
              return (
                <li key={card.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(card.id)}
                    aria-pressed={active}
                    className={`flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-colors press ${
                      active
                        ? "border-gold bg-gold/[0.07]"
                        : "border-border bg-card hover:border-gold/40"
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
                        {card.bank} · expires {card.expiry}
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
                  <span className="block text-[13.5px] font-bold text-foreground">
                    Use a new card
                  </span>
                  <span className="block text-[12px] text-muted-foreground">
                    We tokenize it — Kipit never stores your card number
                  </span>
                </span>
              </button>
            </li>
          </ul>

          {isNew && (
            <section className="card-surface mt-4 p-4 md:max-w-lg md:p-5">
              <label className="block">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Card number
                </span>
                <input
                  inputMode="numeric"
                  placeholder="0000 0000 0000 0000"
                  value={number}
                  onChange={(e) =>
                    setNumber(
                      e.target.value
                        .replace(/[^0-9]/g, "")
                        .slice(0, 16)
                        .replace(/(.{4})/g, "$1 ")
                        .trim(),
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-border bg-background px-3.5 py-3 text-[15px] font-bold tracking-[0.06em] text-num text-foreground outline-none placeholder:text-[13px] placeholder:font-medium placeholder:text-muted-foreground focus:border-gold"
                />
              </label>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Expiry
                  </span>
                  <input
                    inputMode="numeric"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => {
                      const d = e.target.value.replace(/[^0-9]/g, "").slice(0, 4);
                      setExpiry(d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d);
                    }}
                    className="mt-2 w-full rounded-xl border border-border bg-background px-3.5 py-3 text-[15px] font-bold text-num text-foreground outline-none placeholder:text-[13px] placeholder:font-medium placeholder:text-muted-foreground focus:border-gold"
                  />
                </label>
                <label className="block">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    CVV
                  </span>
                  <input
                    inputMode="numeric"
                    placeholder="123"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, "").slice(0, 3))}
                    className="mt-2 w-full rounded-xl border border-border bg-background px-3.5 py-3 text-[15px] font-bold text-num text-foreground outline-none placeholder:text-[13px] placeholder:font-medium placeholder:text-muted-foreground focus:border-gold"
                  />
                </label>
              </div>
            </section>
          )}

          <div className="mt-5">
            <button
              type="button"
              disabled={!valid}
              onClick={() =>
                void navigate({ to: "/wallet/processing", search: { amount, method: "card" } })
              }
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press disabled:opacity-40 disabled:shadow-none md:w-auto md:px-10"
            >
              Pay {naira(amount + fee)} <ArrowRight className="size-4" strokeWidth={2.6} />
            </button>
            <p className="mt-2.5 text-center text-[11.5px] text-muted-foreground md:text-left">
              You may be asked to complete your bank's 3-D Secure check.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
