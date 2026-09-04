import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Download, Eye, FileText, Mail } from "lucide-react";
import { z } from "zod";
import { SettingsPage } from "@/components/kipit/SettingsPage";
import { PROFILE } from "@/lib/settings-data";

export const Route = createFileRoute("/settings_/statements_/generated")({
  validateSearch: z.object({
    kind: z.string().catch("Account statement"),
    start: z.string().catch("2026-01-01"),
    end: z.string().catch("2026-09-03"),
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
  const reference = `KPT-STM-${start.replace(/-/g, "").slice(2)}`;

  return (
    <SettingsPage
      title="Statement ready"
      eyebrow="MOB-144"
      backTo="/settings"
      backLabel="Settings"
      subtitle="Your document has been generated and is available for the next 30 days."
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
                {fmt(start)} — {fmt(end)} · PDF
              </p>
            </div>
          </div>
          <dl className="divide-y divide-border/60 px-4 text-[13px]">
            <Row label="Account holder">
              {PROFILE.firstName} {PROFILE.lastName}
            </Row>
            <Row label="Reference">{reference}</Row>
            <Row label="Generated">
              {new Date().toLocaleDateString("en-NG", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </Row>
            <Row label="Pages">4</Row>
          </dl>
        </section>

        <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => toast.info("Opening statement preview")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-gradient px-4 py-3.5 text-[13px] font-extrabold text-primary-foreground shadow-float press"
          >
            <Eye className="size-4" strokeWidth={2.6} /> View
          </button>
          <button
            type="button"
            onClick={() => toast.success("Statement downloaded (PDF)")}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3.5 text-[13px] font-bold press"
          >
            <Download className="size-4" strokeWidth={2.4} /> Download
          </button>
          <button
            type="button"
            onClick={() => toast.success("Statement emailed to you")}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3.5 text-[13px] font-bold press"
          >
            <Mail className="size-4" strokeWidth={2.4} /> Email
          </button>
        </div>

        <p className="mt-4 px-1 text-[11.5px] leading-relaxed text-muted-foreground">
          A copy will be sent to {PROFILE.email} when you choose Email. Keep statements private —
          they contain your account details.
        </p>
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          <section className="card-surface overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-border/60 px-6 py-4">
              <p className="text-[13px] font-extrabold">Preview</p>
              <span className="rounded-full bg-secondary px-2.5 py-1 text-[10.5px] font-extrabold text-muted-foreground">
                Page 1 of 4
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
                <p className="mt-4 text-[12px] font-bold">
                  {PROFILE.firstName} {PROFILE.lastName}
                </p>
                <p className="text-[11px] text-muted-foreground">{PROFILE.email}</p>
                <div className="mt-5 space-y-2.5" aria-hidden>
                  {[100, 92, 84, 96, 78, 88, 70, 90].map((w, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span
                        className="h-2 rounded-full bg-secondary"
                        style={{ width: `${w * 0.55}%` }}
                      />
                      <span className="ml-auto h-2 w-16 rounded-full bg-secondary" />
                    </div>
                  ))}
                </div>
                <p className="mt-6 border-t border-border pt-3 text-[10px] text-muted-foreground">
                  This document is system-generated and carries a verification reference.
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
                    {fmt(start)} — {fmt(end)} · PDF
                  </p>
                </div>
              </div>
              <dl className="divide-y divide-border/60 px-5 text-[12.5px]">
                <Row label="Account holder">
                  {PROFILE.firstName} {PROFILE.lastName}
                </Row>
                <Row label="Reference">{reference}</Row>
                <Row label="Generated">
                  {new Date().toLocaleDateString("en-NG", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </Row>
                <Row label="Pages">4</Row>
              </dl>
              <div className="space-y-2.5 p-5 pt-4">
                <button
                  type="button"
                  onClick={() => toast.success("Statement downloaded (PDF)")}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-4 py-3.5 text-[13px] font-extrabold text-primary-foreground shadow-float press"
                >
                  <Download className="size-4" strokeWidth={2.6} /> Download PDF
                </button>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => toast.info("Opening statement preview")}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-[12.5px] font-bold press"
                  >
                    <Eye className="size-4" strokeWidth={2.4} /> View
                  </button>
                  <button
                    type="button"
                    onClick={() => toast.success("Statement emailed to you")}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-[12.5px] font-bold press"
                  >
                    <Mail className="size-4" strokeWidth={2.4} /> Email
                  </button>
                </div>
              </div>
            </section>

            <section className="card-surface p-5">
              <p className="text-[13px] font-extrabold">Keep it private</p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">
                A copy is sent to {PROFILE.email} when you choose Email. Statements contain your
                account details and stay available for 30 days.
              </p>
            </section>
          </aside>
        </div>
      </div>

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
