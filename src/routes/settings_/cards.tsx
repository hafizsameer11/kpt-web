import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { CreditCard, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import { SettingsPage } from "@/components/kipit/SettingsPage";
import { LINKED_CARDS } from "@/lib/settings-data";

export const Route = createFileRoute("/settings_/cards")({
  head: () => ({
    meta: [
      { title: "Linked Cards | Kipit Settings" },
      {
        name: "description",
        content:
          "Manage the debit cards saved for funding your Kipit wallet. Only masked digits are ever shown.",
      },
      { property: "og:title", content: "Linked Cards | Kipit Settings" },
      { property: "og:description", content: "Add or remove cards saved for wallet funding." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CardsScreen,
});

function CardsScreen() {
  const [cards, setCards] = useState(LINKED_CARDS);

  return (
    <SettingsPage
      title="Linked cards"
      eyebrow="MOB-149"
      subtitle="Cards saved for quick wallet funding. Kipit never displays or stores full card numbers."
    >
      <div className="space-y-3 md:hidden">
        {cards.map((c) => (
          <article
            key={c.id}
            className="card-surface flex items-center gap-3.5 p-4"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand text-gold ring-1 ring-inset ring-gold/25">
              <CreditCard className="size-5" strokeWidth={2} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13.5px] font-bold">{c.nickname}</p>
              <p className="mt-0.5 text-[12px] text-muted-foreground">
                {c.type} · {c.masked} · Exp {c.expiry}
              </p>
            </div>
            <button
              type="button"
              aria-label={`Remove ${c.nickname}`}
              onClick={() => setCards((prev) => prev.filter((x) => x.id !== c.id))}
              className="grid size-9 shrink-0 place-items-center rounded-xl border border-border text-destructive press hover:bg-secondary"
            >
              <Trash2 className="size-4" strokeWidth={2.2} />
            </button>
          </article>
        ))}

        {cards.length === 0 ? (
          <div className="card-surface p-8 text-center">
            <p className="text-[13.5px] font-bold">No cards linked</p>
            <p className="mt-1 text-[12px] text-muted-foreground">
              Add a card to fund your wallet instantly.
            </p>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() =>
            toast.info("Add a card", {
              description: "You'll be redirected to our secure card partner to tokenise the card.",
            })
          }
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press"
        >
          <Plus className="size-4" strokeWidth={2.6} /> Add card
        </button>

        <p className="flex items-start gap-2 px-1 text-[11.5px] leading-relaxed text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand" />
          Card details are tokenised by our licensed payment partner. Kipit only ever sees the last
          four digits.
        </p>
      </div>

      {/* ---------- Desktop ---------- */}
      <div className="hidden md:grid md:grid-cols-[minmax(0,1fr)_320px] md:items-start md:gap-6">
        <section className="card-surface overflow-hidden p-0">
          <div className="flex items-center justify-between gap-4 border-b border-border/70 px-6 py-5">
            <div>
              <p className="font-display text-[17px] font-extrabold tracking-[-0.02em] text-foreground">
                Saved cards
              </p>
              <p className="mt-0.5 text-[12px] text-muted-foreground">
                Used for instant wallet top-ups.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                toast.info("Add a card", {
                  description:
                    "You'll be redirected to our secure card partner to tokenise the card.",
                })
              }
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3 text-[13px] font-extrabold text-primary-foreground shadow-float press"
            >
              <Plus className="size-4" strokeWidth={2.6} /> Add card
            </button>
          </div>

          {cards.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-[14px] font-bold text-foreground">No cards linked</p>
              <p className="mt-1 text-[12.5px] text-muted-foreground">
                Add a card to fund your wallet instantly.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 p-6 xl:grid-cols-2">
              {cards.map((c) => (
                <article
                  key={c.id}
                  className="relative overflow-hidden rounded-2xl bg-brand-gradient p-5 text-primary-foreground shadow-float"
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -right-12 -top-16 size-40 rounded-full bg-gold/20 blur-[48px]"
                  />
                  <div className="relative flex items-start justify-between gap-3">
                    <span className="grid size-11 place-items-center rounded-xl bg-white/10 text-gold ring-1 ring-inset ring-gold/25">
                      <CreditCard className="size-5" strokeWidth={2} />
                    </span>
                    <button
                      type="button"
                      aria-label={`Remove ${c.nickname}`}
                      onClick={() => setCards((prev) => prev.filter((x) => x.id !== c.id))}
                      className="grid size-9 place-items-center rounded-xl border border-white/20 bg-white/10 press hover:bg-white/20"
                    >
                      <Trash2 className="size-4" strokeWidth={2.2} />
                    </button>
                  </div>
                  <p className="relative mt-6 font-display text-[20px] font-extrabold tracking-[0.14em] text-num">
                    {c.masked}
                  </p>
                  <div className="relative mt-4 flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-primary-foreground/60">
                        Nickname
                      </p>
                      <p className="truncate text-[13.5px] font-bold">{c.nickname}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-primary-foreground/60">
                        Expires
                      </p>
                      <p className="text-[13.5px] font-bold text-num">{c.expiry}</p>
                    </div>
                  </div>
                  <p className="relative mt-3 text-[11.5px] font-semibold text-primary-foreground/70">
                    {c.type}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>

        <aside className="space-y-4 md:sticky md:top-6">
          <section className="card-surface p-5">
            <span className="grid size-10 place-items-center rounded-xl bg-brand text-gold ring-1 ring-inset ring-gold/25">
              <ShieldCheck className="size-[18px]" strokeWidth={2} />
            </span>
            <p className="mt-3 text-[13.5px] font-extrabold text-foreground">
              Your card data stays with the bank
            </p>
            <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
              Card details are tokenised by our licensed payment partner. Kipit only ever sees the
              last four digits and never stores the full number or CVV.
            </p>
          </section>

          <section className="card-surface p-5">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-muted-foreground">
              Good to know
            </p>
            <ul className="mt-3 space-y-2.5 text-[12px] leading-relaxed text-muted-foreground">
              <li>Card funding is instant, with a small processing fee from the provider.</li>
              <li>Bank transfer funding is free and usually lands within minutes.</li>
              <li>Removing a card here cancels any saved token immediately.</li>
            </ul>
          </section>
        </aside>
      </div>
    </SettingsPage>
  );
}
