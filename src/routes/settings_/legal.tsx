import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { CheckCircle2, ChevronRight, Download, FileText, Scale } from "lucide-react";
import { SettingsPage } from "@/components/kipit/SettingsPage";
import { LEGAL_DOCS } from "@/lib/settings-data";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

const DOC_BODY: Record<string, string[]> = {
  "Terms & Conditions": [
    "These terms govern your Kipit account, the Call Account, fixed-return plans and any marketplace product you subscribe to through the app.",
    "You agree to provide accurate information, keep your credentials and transaction PIN private, and use Kipit only for lawful purposes.",
    "Kipit may update these terms. Material changes are notified in-app and require a fresh acceptance before you continue investing.",
  ],
  "Privacy Policy": [
    "We collect the personal data required to open and operate your account, verify your identity and meet regulatory obligations.",
    "Data is encrypted in transit and at rest. We never sell your data, and we share it only with regulated partners who help deliver the service.",
    "You may request a copy of your data or ask us to correct it at any time through Help & support.",
  ],
  "Risk Disclosure": [
    "Returns on fixed-income products are indicative until a plan is booked. Rates can move with market conditions before confirmation.",
    "Early liquidation of a fixed plan may attract a break fee and a lower effective yield than the quoted rate.",
    "Past performance is not a guarantee of future results. Invest only what fits your financial plan.",
  ],
  "Product Terms": [
    "Each product carries its own tenor, minimum amount, payout schedule and liquidity rules, shown on the product page before you invest.",
    "Call Account balances accrue daily and are withdrawable on demand, subject to verification limits.",
    "Fixed plans pay at maturity or on the stated payout schedule to your Kipit wallet.",
  ],
};

function LegalScreen() {
  const [openDoc, setOpenDoc] = useState<(typeof LEGAL_DOCS)[number] | null>(null);

  return (
    <SettingsPage
      title="Legal documents"
      eyebrow="MOB-154"
      subtitle="Every document is versioned, and we record the version you accepted."
    >
      {/* Mobile — unchanged list */}
      <ul className="card-surface divide-y divide-border/60 overflow-hidden md:hidden">
        {LEGAL_DOCS.map((d, i) => (
          <li key={d.title} style={{ ["--d" as string]: `${i * 50}ms` }} className="k-rise">
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
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3.5 text-[13.5px] font-bold text-foreground press md:hidden"
      >
        <Download className="size-4" strokeWidth={2.4} /> Download all documents
      </button>

      <p className="mt-4 px-1 text-[11.5px] leading-relaxed text-muted-foreground md:hidden">
        Kipit records the document, version, user and timestamp for every acceptance. You will be
        asked to review any document that changes materially.
      </p>

      {/* Desktop */}
      <div className="hidden md:block">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div className="grid gap-4 sm:grid-cols-2">
            {LEGAL_DOCS.map((d, i) => (
              <button
                key={d.title}
                type="button"
                style={{ ["--d" as string]: `${i * 50}ms` }}
                onClick={() => setOpenDoc(d)}
                className="k-rise card-surface group flex h-full flex-col items-start p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-float"
              >
                <div className="flex w-full items-start gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand text-gold ring-1 ring-inset ring-gold/25">
                    <Scale className="size-5" strokeWidth={2} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-extrabold leading-tight">{d.title}</p>
                    <span className="mt-1 inline-block rounded-full bg-secondary px-2 py-0.5 text-[10px] font-extrabold text-muted-foreground">
                      {d.version}
                    </span>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </div>
                <p className="mt-3 text-[12.5px] leading-relaxed text-muted-foreground">{d.desc}</p>
                <p className="mt-auto flex items-center gap-1.5 pt-3 text-[11.5px] font-bold text-emerald-600">
                  <CheckCircle2 className="size-3.5" /> {d.accepted}
                </p>
              </button>
            ))}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-6">
            <section className="card-surface p-5">
              <p className="flex items-center gap-2 text-[13px] font-extrabold">
                <FileText className="size-4 text-brand" /> Acceptance record
              </p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">
                Kipit records the document, version, user and timestamp for every acceptance. You
                will be asked to review any document that changes materially.
              </p>
              <button
                type="button"
                onClick={() =>
                  toast.success("Documents downloaded", {
                    description: "All legal documents saved as a single PDF.",
                  })
                }
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3 text-[13px] font-extrabold text-primary-foreground shadow-float press"
              >
                <Download className="size-4" strokeWidth={2.4} /> Download all documents
              </button>
            </section>

            <section className="card-surface p-5">
              <p className="text-[13px] font-extrabold">Need clarification?</p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">
                Our support team can walk you through any clause before you accept a new version.
              </p>
            </section>
          </aside>
        </div>
      </div>

      <Dialog open={!!openDoc} onOpenChange={(o) => !o && setOpenDoc(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display text-[20px] font-extrabold tracking-[-0.02em]">
              {openDoc?.title}
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-extrabold text-muted-foreground">
                {openDoc?.version}
              </span>
            </DialogTitle>
            <DialogDescription>{openDoc?.accepted}</DialogDescription>
          </DialogHeader>
          <div className="max-h-[55vh] space-y-3 overflow-y-auto pr-1 text-[13px] leading-relaxed text-muted-foreground">
            {(openDoc ? DOC_BODY[openDoc.title] ?? [openDoc.desc] : []).map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </SettingsPage>
  );
}
