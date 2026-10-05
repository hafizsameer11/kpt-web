import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Download, Eye, FileText, Mail } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { SettingsPage } from "@/components/kipit/SettingsPage";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { ApiError, emailStatement } from "@/lib/api";
import { documentHtml, downloadDocumentPdf, openDocumentHtml } from "@/lib/document-pdf";
import { useDisplayProfile } from "@/lib/profile-live";
import { buildStatementPayload, type StatementDoc } from "@/lib/statement-payload";

function defaultEnd() {
  return new Date().toISOString().slice(0, 10);
}
function defaultStart() {
  const d = new Date();
  d.setDate(d.getDate() - 90);
  return d.toISOString().slice(0, 10);
}

export const Route = createFileRoute("/settings_/statements_/generated")({
  validateSearch: z.object({
    kind: z.string().catch("Account statement"),
    start: z.string().catch(defaultStart()),
    end: z.string().catch(defaultEnd()),
  }),
  head: () => ({
    meta: [
      { title: "Generated Statement | Kipit" },
      {
        name: "description",
        content:
          "Your Kipit statement is ready. View it, download the PDF or send it straight to your email.",
      },
      { property: "og:title", content: "Generated Statement | Kipit" },
      { property: "og:description", content: "View, download or email your Kipit statement." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GeneratedStatement,
});

function fmt(d: string) {
  const date = new Date(d);
  return Number.isNaN(date.getTime())
    ? d
    : date.toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" });
}

function GeneratedStatement() {
  const { kind, start, end } = Route.useSearch();
  const profile = useDisplayProfile();
  const [doc, setDoc] = useState<StatementDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [emailBusy, setEmailBusy] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setLoadError(null);
    void buildStatementPayload({ kind, start, end })
      .then((payload) => {
        if (alive) setDoc(payload);
      })
      .catch((err) => {
        if (alive) {
          setDoc(null);
          setLoadError(err instanceof Error ? err.message : "Could not load statement data.");
        }
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [kind, start, end]);

  const holder = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "—";
  const reference = doc?.reference ?? `KPT-STM-${start.replace(/-/g, "").slice(2)}`;
  const generated = new Date().toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const viewerHtml = useMemo(() => (doc ? documentHtml(doc) : ""), [doc]);

  function viewDoc() {
    if (!doc) return;
    const result = openDocumentHtml(doc);
    if (!result.opened) {
      // Pop-up blocked — show the statement in-app instead of an error toast loop.
      setViewerOpen(true);
    }
  }

  function downloadDoc() {
    if (!doc) return;
    try {
      downloadDocumentPdf({
        ...doc,
        filename: `${kind.replace(/\s+/g, "-").toLowerCase()}-${start}-${end}.html`,
      });
      toast.success("Statement downloaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not download statement.");
    }
  }

  async function emailDoc() {
    if (!doc || emailBusy) return;
    const statementKind = (
      ["Account statement", "Transaction statement", "Portfolio statement"].includes(kind)
        ? kind
        : "Account statement"
    ) as "Account statement" | "Transaction statement" | "Portfolio statement";
    const summary = [
      `Kipit ${kind}`,
      `Period: ${fmt(start)} — ${fmt(end)}`,
      `Reference: ${reference}`,
      `Account holder: ${holder}`,
    ].join("\n");
    const filename = `${kind.replace(/\s+/g, "-").toLowerCase()}-${start}-${end}.html`;
    const html = documentHtml(doc);
    const contentBase64 = btoa(unescape(encodeURIComponent(html)));
    setEmailBusy(true);
    try {
      await emailStatement({
        kind: statementKind,
        from: start,
        to: end,
        filename,
        contentBase64,
        contentType: "text/html",
        summary,
      });
      toast.success(
        profile.email
          ? `Statement emailed to ${profile.email}`
          : "Statement emailed to your Kipit account email.",
      );
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : "Could not email statement. Try Download, then attach manually.",
      );
    } finally {
      setEmailBusy(false);
    }
  }

  return (
    <SettingsPage
      title="Statement ready"
      eyebrow="MOB-144"
      backTo="/settings"
      backLabel="Settings"
      subtitle="Your document is ready to view, download, or email from this device."
    >
      <div className="mx-auto max-w-lg md:hidden">
        <section className="card-surface overflow-hidden">
          <div className="flex items-center gap-3.5 border-b border-border/60 p-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand text-gold ring-1 ring-inset ring-gold/25">
              <FileText className="size-5" strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[14px] font-extrabold">{kind}</p>
              <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                {fmt(start)} — {fmt(end)} · HTML / print to PDF
              </p>
            </div>
          </div>
          <dl className="divide-y divide-border/60 px-4 text-[13px]">
            <Row label="Account holder">{holder}</Row>
            <Row label="Reference">{reference}</Row>
            <Row label="Generated">{generated}</Row>
            <Row label="Rows">{loading ? "…" : String(doc?.rows.length ?? 0)}</Row>
          </dl>
        </section>

        <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
          <button
            type="button"
            disabled={!doc || loading}
            onClick={viewDoc}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-gradient px-4 py-3.5 text-[13px] font-extrabold text-primary-foreground shadow-float press disabled:opacity-40"
          >
            <Eye className="size-4" strokeWidth={2.6} /> View
          </button>
          <button
            type="button"
            disabled={!doc || loading}
            onClick={downloadDoc}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3.5 text-[13px] font-bold press disabled:opacity-40"
          >
            <Download className="size-4" strokeWidth={2.4} /> Download
          </button>
          <button
            type="button"
            disabled={!doc || loading || emailBusy}
            onClick={() => void emailDoc()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3.5 text-[13px] font-bold press disabled:opacity-40"
          >
            <Mail className="size-4" strokeWidth={2.4} /> {emailBusy ? "Sending…" : "Email"}
          </button>
        </div>

        {loadError ? (
          <p className="mt-3 px-1 text-[12px] font-semibold text-destructive">{loadError}</p>
        ) : null}
        <p className="mt-4 px-1 text-[11.5px] leading-relaxed text-muted-foreground">
          View opens the full statement with dates and amounts. Download saves that file. Email sends
          it to your Kipit account email with the attachment included.
        </p>
      </div>

      <div className="hidden md:block">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          <section className="card-surface overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-border/60 px-6 py-4">
              <p className="text-[13px] font-extrabold">Preview</p>
              <span className="rounded-full bg-secondary px-2.5 py-1 text-[10.5px] font-extrabold text-muted-foreground">
                Printable
              </span>
            </div>
            <div className="bg-secondary/40 p-6">
              <div className="mx-auto w-full max-w-[520px] rounded-xl bg-card p-7 shadow-float">
                <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
                  <div>
                    <p className="font-display text-[18px] font-extrabold tracking-[-0.03em]">
                      Kipit<span className="text-gold">.</span>
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">{kind}</p>
                  </div>
                  <div className="text-right text-[11px] text-muted-foreground">
                    <p className="font-bold text-foreground">{reference}</p>
                    <p className="mt-0.5">
                      {fmt(start)} — {fmt(end)}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-[12px] font-bold">{holder}</p>
                <p className="text-[11px] text-muted-foreground">{profile.email || "your email"}</p>
                {loading ? (
                  <p className="mt-5 text-[12.5px] text-muted-foreground">Loading statement data…</p>
                ) : (
                  <dl className="mt-5 space-y-2 text-[12px]">
                    {(doc?.rows ?? []).slice(0, 24).map((row, i) => (
                      <div key={`${i}-${row.label}`} className="flex justify-between gap-3">
                        <dt className="text-muted-foreground">{row.label}</dt>
                        <dd className="text-right font-semibold text-foreground">{row.value}</dd>
                      </div>
                    ))}
                    {(doc?.rows.length ?? 0) > 24 ? (
                      <p className="pt-1 text-[11px] text-muted-foreground">
                        …and {(doc?.rows.length ?? 0) - 24} more lines in View / Download
                      </p>
                    ) : null}
                  </dl>
                )}
                <p className="mt-6 border-t border-border pt-3 text-[10px] text-muted-foreground">
                  {doc?.body ?? "This document carries your verification reference."}
                </p>
              </div>
            </div>
          </section>

          <aside className="space-y-4 lg:sticky lg:top-6">
            <section className="card-surface overflow-hidden">
              <div className="flex items-center gap-3.5 border-b border-border/60 p-5">
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand text-gold ring-1 ring-inset ring-gold/25">
                  <FileText className="size-5" strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-extrabold">{kind}</p>
                  <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                    {fmt(start)} — {fmt(end)}
                  </p>
                </div>
              </div>
              <dl className="divide-y divide-border/60 px-5 text-[12.5px]">
                <Row label="Account holder">{holder}</Row>
                <Row label="Reference">{reference}</Row>
                <Row label="Generated">{generated}</Row>
                <Row label="Data rows">{loading ? "…" : String(doc?.rows.length ?? 0)}</Row>
              </dl>
              <div className="space-y-2.5 p-5 pt-4">
                <button
                  type="button"
                  disabled={!doc || loading}
                  onClick={downloadDoc}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-4 py-3.5 text-[13px] font-extrabold text-primary-foreground shadow-float press disabled:opacity-40"
                >
                  <Download className="size-4" strokeWidth={2.6} /> Download
                </button>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    disabled={!doc || loading}
                    onClick={viewDoc}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-[12.5px] font-bold press disabled:opacity-40"
                  >
                    <Eye className="size-4" strokeWidth={2.4} /> View
                  </button>
                  <button
                    type="button"
                    disabled={!doc || loading || emailBusy}
                    onClick={() => void emailDoc()}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-[12.5px] font-bold press disabled:opacity-40"
                  >
                    <Mail className="size-4" strokeWidth={2.4} /> {emailBusy ? "Sending…" : "Email"}
                  </button>
                </div>
              </div>
            </section>

            <section className="card-surface p-5">
              <p className="text-[13px] font-extrabold">Keep it private</p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">
                Email sends the statement as an attachment to the email on your Kipit account. Only
                you receive it.
              </p>
              {loadError ? (
                <p className="mt-3 text-[12px] font-semibold text-destructive">{loadError}</p>
              ) : null}
            </section>
          </aside>
        </div>
      </div>

      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogContent className="flex max-h-[90vh] w-[min(96vw,48rem)] max-w-3xl flex-col gap-3 overflow-hidden p-4 sm:p-5">
          <DialogTitle className="pr-8 text-[15px] font-extrabold">{kind}</DialogTitle>
          <DialogDescription className="text-[12.5px] text-muted-foreground">
            {fmt(start)} — {fmt(end)} · {reference}
          </DialogDescription>
          {viewerHtml ? (
            <iframe
              title="Statement preview"
              srcDoc={viewerHtml}
              className="min-h-0 w-full flex-1 rounded-lg border border-border bg-white"
              style={{ height: "min(70vh, 640px)" }}
            />
          ) : null}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={downloadDoc}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-gradient px-4 py-2.5 text-[12.5px] font-extrabold text-primary-foreground"
            >
              <Download className="size-3.5" /> Download
            </button>
            <button
              type="button"
              onClick={() => setViewerOpen(false)}
              className="inline-flex items-center justify-center rounded-xl border border-border px-4 py-2.5 text-[12.5px] font-bold"
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </SettingsPage>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-bold text-foreground">{children}</dd>
    </div>
  );
}
