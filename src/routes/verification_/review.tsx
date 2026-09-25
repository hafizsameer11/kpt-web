import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, FileText } from "lucide-react";
import { useState } from "react";
import { KycStep, KycRow, kycCta } from "@/components/kipit/KycStep";
import { ApiError, submitTier2 } from "@/lib/api";
import { clearTier2Draft, getTier2Draft } from "@/lib/tier2-draft";
import { PROOF_TYPES } from "@/lib/kyc-data";

export const Route = createFileRoute("/verification_/review")({
  head: () => ({
    meta: [
      { title: "Review & Submit Verification | Kipit" },
      {
        name: "description",
        content:
          "Check your identity, address and funding details before submitting your Kipit verification.",
      },
      { property: "og:title", content: "Review & Submit Verification | Kipit" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: KycReview,
});

function KycReview() {
  const navigate = useNavigate();
  const draft = getTier2Draft();
  const [declared, setDeclared] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const proofLabel =
    PROOF_TYPES.find((p) => p.id === draft.proofType)?.label || "Proof of address";
  const ninMasked = draft.nin
    ? `•••• •••• ${draft.nin.slice(-3)}`
    : "Missing";

  const canSubmit =
    declared &&
    !busy &&
    draft.nin.length === 11 &&
    Boolean(draft.selfieUrl) &&
    Boolean(draft.proofUrl) &&
    Boolean(draft.addressStreet) &&
    Boolean(draft.occupation);

  const submit = async () => {
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    try {
      await submitTier2({
        nin: draft.nin,
        occupation: draft.occupation,
        employmentStatus: draft.employmentStatus,
        sourceOfFunds: draft.sourceOfFunds,
        addressStreet: draft.addressStreet,
        addressCity: draft.addressCity,
        addressState: draft.addressState,
        addressLga: draft.addressLga,
        selfieUri: draft.selfieUrl,
        addressDocUri: draft.proofUrl,
      });
      clearTier2Draft();
      void navigate({ to: "/verification/pending" });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not submit verification.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <KycStep
      navTitle="Review & Submit"
      backTo="/verification/occupation"
      backLabel="Occupation"
      eyebrow="Tier 2"
      title="Review and submit"
      subtitle="Make sure everything is correct — changes after submission need a support request."
      aside={
        <>
          <section className="card-surface p-5">
            <p className="text-[12.5px] font-extrabold text-foreground">What happens next</p>
            <ol className="mt-2 space-y-2">
              {[
                "We verify your NIN and match the name on your Kipit profile.",
                "Your selfie and address documents are stored for Kipit records.",
                "You'll get a notification once Tier 2 is approved.",
              ].map((t, i) => (
                <li key={t} className="flex gap-2.5 text-[12px] leading-relaxed text-muted-foreground">
                  <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-gold/15 text-[10px] font-extrabold text-gold">
                    {i + 1}
                  </span>
                  {t}
                </li>
              ))}
            </ol>
          </section>
          <section className="card-surface p-5">
            <p className="text-[12.5px] font-extrabold text-foreground">Tier 2 unlocks</p>
            <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
              Withdrawals to your bank, adding payout accounts and higher transaction limits. NIN
              confirmation is usually automatic.
            </p>
          </section>
        </>
      }
    >
      <div className="space-y-4 md:grid md:grid-cols-2 md:items-start md:gap-4 md:space-y-0">
        <section className="card-surface p-4 md:p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Identity
          </p>
          <dl className="mt-3 divide-y divide-border text-[13px]">
            <KycRow label="NIN">{ninMasked}</KycRow>
            <KycRow label="Selfie">{draft.selfieUrl ? "Attached" : "Missing"}</KycRow>
          </dl>
        </section>

        <section className="card-surface p-4 md:p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Address & funding
          </p>
          <dl className="mt-3 divide-y divide-border text-[13px]">
            <KycRow label="Address">
              {draft.addressStreet}, {draft.addressCity}
            </KycRow>
            <KycRow label="State / LGA">
              {draft.addressState} · {draft.addressLga}
            </KycRow>
            <KycRow label="Occupation">{draft.occupation || "—"}</KycRow>
            <KycRow label="Source of funds">{draft.sourceOfFunds || "—"}</KycRow>
          </dl>
          {draft.proofUrl ? (
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-border bg-background p-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold">
                <FileText className="size-4" strokeWidth={2.2} />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[12.5px] font-bold text-foreground">
                  {draft.proofName || "Proof of address"}
                </span>
                <span className="block text-[11px] text-muted-foreground">{proofLabel}</span>
              </span>
            </div>
          ) : null}
        </section>
      </div>

      <label className="mt-4 flex items-start gap-3 rounded-xl border border-border bg-card p-3.5 md:max-w-2xl">
        <input
          type="checkbox"
          checked={declared}
          onChange={(e) => setDeclared(e.target.checked)}
          className="mt-0.5 size-4 accent-[hsl(var(--gold))]"
        />
        <span className="text-[12px] leading-snug text-muted-foreground">
          I confirm the information and documents I've provided are true and accurate, and I
          consent to Kipit verifying them with the relevant authorities.
        </span>
      </label>

      {error ? (
        <p className="mt-3 text-[12px] font-semibold text-destructive">{error}</p>
      ) : null}

      <div className="mt-5">
        <button type="button" disabled={!canSubmit} onClick={() => void submit()} className={kycCta}>
          {busy ? "Submitting…" : "Submit"} <ArrowRight className="size-4" strokeWidth={2.6} />
        </button>
      </div>
    </KycStep>
  );
}
