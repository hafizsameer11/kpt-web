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
      <div className="mx-auto max-w-lg">
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
