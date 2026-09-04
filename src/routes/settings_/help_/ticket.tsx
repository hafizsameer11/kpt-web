import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Paperclip } from "lucide-react";
import { useState } from "react";
import { SettingsPage } from "@/components/kipit/SettingsPage";
import { TICKET_CATEGORIES, ticketReference } from "@/lib/settings-data";

export const Route = createFileRoute("/settings_/help_/ticket")({
  head: () => ({
    meta: [
      { title: "Submit a Support Ticket | Kipit" },
      {
        name: "description",
        content:
          "Raise a Kipit support ticket — pick a category, describe the issue and attach a screenshot if it helps.",
      },
      { property: "og:title", content: "Submit a Support Ticket | Kipit" },
      { property: "og:description", content: "Tell Kipit support what went wrong and get a reference." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TicketScreen,
});

function TicketScreen() {
  const [category, setCategory] = useState<string>(TICKET_CATEGORIES[0]);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [attachment, setAttachment] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  const valid = subject.trim().length > 3 && description.trim().length > 10;

  if (reference) {
    return (
      <SettingsPage
        title="Ticket submitted"
        eyebrow="MOB-153"
        backTo="/settings/help"
        backLabel="Help centre"
      >
        <section className="card-surface mx-auto max-w-md flex flex-col items-center p-8 text-center">
          <span className="grid size-16 place-items-center rounded-full bg-emerald-500/12 text-emerald-600">
            <CheckCircle2 className="size-9" strokeWidth={2.2} />
          </span>
          <p className="mt-4 font-display text-[18px] font-extrabold">We&apos;re on it</p>
          <p className="mt-1.5 text-[12.5px] text-muted-foreground">
            Reference <span className="font-bold text-foreground">{reference}</span>. Our team
            typically replies within one business day.
          </p>
        </section>
      </SettingsPage>
    );
  }

  return (
    <SettingsPage
      title="Support ticket"
      eyebrow="MOB-153"
      backTo="/settings/help"
      backLabel="Help centre"
      subtitle="The more detail you give, the faster we can resolve it."
    >
      <div className="mx-auto max-w-lg space-y-4 md:hidden">
        <section className="card-surface p-4">
          <label className="block">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
              Category
            </span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-border bg-secondary px-3.5 py-3 text-[13.5px] font-semibold outline-none focus:border-brand"
            >
              {TICKET_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>

          <label className="mt-4 block">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
              Subject
            </span>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Short summary of the issue"
              className="mt-1.5 w-full rounded-xl border border-border bg-secondary px-3.5 py-3 text-[13.5px] font-semibold outline-none focus:border-brand"
            />
          </label>

          <label className="mt-4 block">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
              Description
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="What happened, what you expected, and any reference numbers"
              className="mt-1.5 w-full resize-none rounded-xl border border-border bg-secondary px-3.5 py-3 text-[13.5px] font-medium leading-relaxed outline-none focus:border-brand"
            />
          </label>

          <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border px-3.5 py-3">
            <Paperclip className="size-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-muted-foreground">
              {attachment ?? "Attach a screenshot (optional)"}
            </span>
            <input
              type="file"
              className="hidden"
              onChange={(e) => setAttachment(e.target.files?.[0]?.name ?? null)}
            />
          </label>
        </section>

        <button
          type="button"
          disabled={!valid}
          onClick={() => setReference(ticketReference())}
          className="inline-flex w-full items-center justify-center rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press disabled:opacity-40"
        >
          Submit ticket
        </button>
      </div>
    </SettingsPage>
  );
}
