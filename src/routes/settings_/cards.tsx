import { createFileRoute } from "@tanstack/react-router";
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
      <div className="space-y-3">
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
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press md:w-auto md:px-10"
        >
          <Plus className="size-4" strokeWidth={2.6} /> Add card
        </button>

        <p className="flex items-start gap-2 px-1 text-[11.5px] leading-relaxed text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand" />
          Card details are tokenised by our licensed payment partner. Kipit only ever sees the last
          four digits.
        </p>
      </div>
    </SettingsPage>
  );
}
