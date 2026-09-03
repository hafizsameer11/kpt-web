import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { ChevronRight, Download, Scale } from "lucide-react";
import { SettingsPage } from "@/components/kipit/SettingsPage";
import { LEGAL_DOCS } from "@/lib/settings-data";

export const Route = createFileRoute("/settings_/legal")({
  head: () => ({
    meta: [
      { title: "Legal Documents | Kipit" },
      {
        name: "description",
        content:
          "Read the Kipit Terms & Conditions, Privacy Policy, Risk Disclosure and Product Terms, including the version you accepted.",
      },
      { property: "og:title", content: "Legal Documents | Kipit" },
      { property: "og:description", content: "Kipit terms, privacy, risk disclosure and product terms." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LegalScreen,
});

function LegalScreen() {
  return (
    <SettingsPage
      title="Legal documents"
      eyebrow="MOB-154"
      subtitle="Every document is versioned, and we record the version you accepted."
    >
      <ul className="card-surface divide-y divide-border/60 overflow-hidden md:grid md:grid-cols-2 md:gap-px md:divide-y-0 md:bg-border/60">
        {LEGAL_DOCS.map((d, i) => (
          <li key={d.title} style={{ ["--d" as string]: `${i * 50}ms` }} className="k-rise md:bg-card">
            <button
              type="button"
              onClick={() =>
                toast.info(`${d.title} ${d.version}`, { description: d.desc })
              }
              className="group relative flex w-full items-center gap-3.5 px-4 py-4 text-left press transition-colors hover:bg-secondary/50"
            >
              <span
                aria-hidden
                className="absolute inset-y-0 left-0 w-[3px] origin-center scale-y-0 bg-gold transition-transform duration-300 group-hover:scale-y-100"
              />
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand text-gold ring-1 ring-inset ring-gold/25">
                <Scale className="size-5" strokeWidth={2} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 truncate text-[13.5px] font-bold">
                  {d.title}
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-extrabold text-muted-foreground">
                    {d.version}
                  </span>
                </p>
                <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{d.desc}</p>
                <p className="mt-0.5 text-[11px] font-semibold text-emerald-600">{d.accepted}</p>
              </div>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() =>
          toast.success("Documents downloaded", {
            description: "All legal documents saved as a single PDF.",
          })
        }
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3.5 text-[13.5px] font-bold text-foreground press md:w-auto md:px-10"
      >
        <Download className="size-4" strokeWidth={2.4} /> Download all documents
      </button>

      <p className="mt-4 px-1 text-[11.5px] leading-relaxed text-muted-foreground">
        Kipit records the document, version, user and timestamp for every acceptance. You will be
        asked to review any document that changes materially.
      </p>
    </SettingsPage>
  );
}
