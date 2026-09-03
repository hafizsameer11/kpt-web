import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, LifeBuoy, RefreshCw } from "lucide-react";
import { AppShell } from "@/components/kipit/AppShell";
import { kycReference, REJECTION_REASONS } from "@/lib/kyc-data";

export const Route = createFileRoute("/verification_/rejected")({
  head: () => ({
    meta: [
      { title: "Verification Needs Attention | Kipit" },
      {
        name: "description",
        content:
          "Some of your Kipit verification details couldn't be accepted. See what to fix and resubmit.",
      },
      { property: "og:title", content: "Verification Needs Attention | Kipit" },
      { property: "og:description", content: "Fix the flagged items and resubmit your Kipit KYC." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: KycRejected,
});

function KycRejected() {
  return (
    <AppShell title="Verification" navVariant="elevated">
      <div className="pb-2">
        <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-16 pt-10 text-center text-primary-foreground md:mx-0 md:rounded-xl md:px-8 md:shadow-float">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-32 size-72 rounded-full bg-destructive/25 blur-[64px]"
          />
          <div className="relative">
            <span className="k-shake mx-auto grid size-16 place-items-center rounded-full bg-destructive/20 ring-2 ring-destructive/50">
              <AlertTriangle className="size-8" strokeWidth={2.2} />
            </span>
            <p className="mt-5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary-foreground/60">
              Needs attention
            </p>
            <p className="mt-2 font-display text-[28px] font-extrabold leading-tight tracking-[-0.03em]">
              We couldn't approve this yet
            </p>
            <p className="mx-auto mt-3 max-w-sm text-[12.5px] text-primary-foreground/70">
              Fix the items below and resubmit — reference {kycReference}.
            </p>
          </div>
        </section>

        <div className="relative -mx-4 -mt-8 rounded-t-[2rem] bg-background px-4 pt-5 md:mx-0 md:mt-6 md:rounded-none md:bg-transparent md:px-0 md:pt-0">
          <span
            aria-hidden
            className="mx-auto mb-4 block h-1 w-10 rounded-full bg-border md:hidden"
          />

          <div className="space-y-4 md:grid md:grid-cols-2 md:items-start md:gap-4 md:space-y-0">
            <section className="card-surface p-4 md:p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                What to fix
              </p>
              <ul className="mt-3 space-y-2.5">
                {REJECTION_REASONS.map((r) => (
                  <li
                    key={r.field}
                    className="rounded-xl border border-destructive/30 bg-destructive/[0.06] p-3.5"
                  >
                    <p className="text-[13px] font-extrabold text-destructive">{r.field}</p>
                    <p className="mt-1 text-[12px] leading-snug text-muted-foreground">
                      {r.detail}
                    </p>
                  </li>
                ))}
              </ul>
            </section>

            <section className="card-surface p-4 md:p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Before you resubmit
              </p>
              <ul className="mt-3 space-y-3 text-[13px]">
                {[
                  "Use a document dated within the last 3 months showing your full name.",
                  "Retake your selfie in bright, even light with nothing covering your face.",
                  "Check that your address matches the document exactly.",
                ].map((t, i) => (
                  <li key={t} className="flex gap-3">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-secondary text-[11px] font-extrabold text-muted-foreground">
                      {i + 1}
                    </span>
                    <span className="leading-snug text-foreground">{t}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="mt-5 flex flex-col gap-2.5 md:flex-row">
            <Link
              to="/verification/address-upload"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press md:w-auto md:px-10"
            >
              <RefreshCw className="size-4" strokeWidth={2.6} /> Resubmit documents
            </Link>
            <Link
              to="/settings/help"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3.5 text-[13.5px] font-bold text-foreground press md:w-auto md:px-8"
            >
              <LifeBuoy className="size-4" /> Contact support
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
