import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Paperclip, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { SettingsPage } from "@/components/kipit/SettingsPage";
import {
  createSupportTicket,
  fileToBase64,
  uploadSupportAttachment,
} from "@/lib/api";
import { TICKET_CATEGORIES } from "@/lib/settings-data";

export const Route = createFileRoute("/settings_/help_/ticket")({
  validateSearch: z.object({
    category: z.string().optional().catch(undefined),
    subject: z.string().optional().catch(undefined),
    body: z.string().optional().catch(undefined),
  }),
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

function AttachmentPicker({
  file,
  onPick,
}: {
  file: File | null;
  onPick: (file: File | null) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf,.pdf"
        className="sr-only"
        onChange={(e) => {
          const next = e.target.files?.[0] ?? null;
          if (next && next.size > 6 * 1024 * 1024) {
            toast.error("File too large (max 6 MB)");
            e.target.value = "";
            return;
          }
          onPick(next);
          e.target.value = "";
        }}
      />
      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-dashed border-border bg-secondary/40 px-3.5 py-3 text-left text-[12.5px] font-semibold text-muted-foreground press hover:border-brand/40"
        >
          <Paperclip className="size-4 shrink-0" strokeWidth={2.2} />
          <span className="min-w-0 truncate">
            {file?.name ?? "Attach a screenshot (optional)"}
          </span>
        </button>
        {file ? (
          <button
            type="button"
            aria-label="Remove attachment"
            onClick={() => onPick(null)}
            className="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-card press"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
        JPG, PNG, WEBP or PDF · max 6 MB. Uploaded securely with your ticket.
      </p>
    </>
  );
}

function TicketScreen() {
  const search = Route.useSearch();
  const prefillCategory =
    search.category &&
    (TICKET_CATEGORIES as readonly string[]).includes(search.category)
      ? search.category
      : TICKET_CATEGORIES[0];

  const [category, setCategory] = useState<string>(prefillCategory);
  const [subject, setSubject] = useState(search.subject ?? "");
  const [description, setDescription] = useState(search.body ?? "");
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const valid = subject.trim().length > 3 && description.trim().length > 10;
  const shortRef = reference ? reference.slice(-8).toUpperCase() : "";

  const submit = () => {
    if (!valid || submitting) return;
    setSubmitting(true);
    void (async () => {
      try {
        let attachmentUrl: string | undefined;
        let attachmentName: string | undefined;
        if (attachmentFile) {
          const encoded = await fileToBase64(attachmentFile);
          const uploaded = await uploadSupportAttachment({
            contentType: encoded.contentType,
            dataBase64: encoded.dataBase64,
            filename: attachmentFile.name,
          });
          attachmentUrl = uploaded.url;
          attachmentName = uploaded.filename;
        }
        const ticket = await createSupportTicket({
          category,
          subject: subject.trim(),
          body: description.trim(),
          ...(attachmentUrl
            ? { attachmentUrl, attachmentName: attachmentName || attachmentFile?.name }
            : {}),
        });
        setReference(ticket.id);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not submit ticket");
      } finally {
        setSubmitting(false);
      }
    })();
  };

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
            Reference <span className="font-bold text-foreground">{shortRef}</span>. Our team
            typically replies within one business day.
          </p>
        </section>
        <div className="mx-auto mt-4 flex max-w-md flex-col gap-2.5">
          <Link
            to="/settings/help/tickets/$ticketId"
            params={{ ticketId: reference }}
            className="inline-flex w-full items-center justify-center rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press"
          >
            View ticket
          </Link>
          <Link
            to="/settings/help/tickets"
            className="inline-flex w-full items-center justify-center rounded-xl border border-border bg-card px-5 py-3.5 text-[13.5px] font-bold press"
          >
            My tickets
          </Link>
        </div>
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

          <AttachmentPicker file={attachmentFile} onPick={setAttachmentFile} />
        </section>

        <button
          type="button"
          disabled={!valid || submitting}
          onClick={submit}
          className="inline-flex w-full items-center justify-center rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press disabled:opacity-40"
        >
          {submitting ? "Submitting…" : "Submit ticket"}
        </button>
        <Link
          to="/settings/help/tickets"
          className="inline-flex w-full items-center justify-center rounded-xl border border-border bg-card px-5 py-3.5 text-[13.5px] font-bold press"
        >
          View my tickets
        </Link>
      </div>

      <div className="hidden md:grid md:grid-cols-[minmax(0,1fr)_320px] md:items-start md:gap-6">
        <section className="card-surface overflow-hidden p-0">
          <p className="border-b border-border/70 px-6 py-4 font-display text-[16px] font-extrabold tracking-[-0.02em] text-foreground">
            Tell us what happened
          </p>
          <div className="space-y-5 p-6">
            <div className="grid grid-cols-2 gap-4">
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
              <label className="block">
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
            </div>

            <label className="block">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
                Description
              </span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={8}
                placeholder="What happened, what you expected, and any reference numbers"
                className="mt-1.5 w-full resize-none rounded-xl border border-border bg-secondary px-4 py-3.5 text-[13.5px] font-medium leading-relaxed outline-none focus:border-brand"
              />
            </label>

            <AttachmentPicker file={attachmentFile} onPick={setAttachmentFile} />
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-border/70 bg-secondary/40 px-6 py-4">
            <p className="text-[11.5px] text-muted-foreground">
              {valid ? "Ready to send." : "Add a subject and a short description to continue."}
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <Link
                to="/settings/help/tickets"
                className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-5 py-3 text-[13px] font-bold press"
              >
                My tickets
              </Link>
              <button
                type="button"
                disabled={!valid || submitting}
                onClick={submit}
                className="inline-flex items-center justify-center rounded-xl bg-brand-gradient px-8 py-3 text-[13.5px] font-extrabold text-primary-foreground shadow-float press disabled:opacity-40"
              >
                {submitting ? "Submitting…" : "Submit ticket"}
              </button>
            </div>
          </div>
        </section>

        <aside className="space-y-4 md:sticky md:top-6">
          <section className="card-surface p-5">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-muted-foreground">
              What happens next
            </p>
            <ol className="mt-3 space-y-3 text-[12px] leading-relaxed text-muted-foreground">
              <li className="flex gap-2.5">
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand text-[10px] font-extrabold text-primary-foreground">
                  1
                </span>
                You get a reference number instantly.
              </li>
              <li className="flex gap-2.5">
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand text-[10px] font-extrabold text-primary-foreground">
                  2
                </span>
                An agent reviews the details, usually within one business day.
              </li>
              <li className="flex gap-2.5">
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand text-[10px] font-extrabold text-primary-foreground">
                  3
                </span>
                We reply by email and in-app notification.
              </li>
            </ol>
          </section>

          <section className="card-surface p-5">
            <p className="text-[13px] font-extrabold text-foreground">Need help faster?</p>
            <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
              Call us on 0700 054 7480, Monday to Saturday, 8am – 8pm WAT.
            </p>
          </section>
        </aside>
      </div>
    </SettingsPage>
  );
}
