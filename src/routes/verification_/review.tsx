import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, FileText, Pencil } from "lucide-react";
import { useState } from "react";
import { KycStep, KycRow, kycCta } from "@/components/kipit/KycStep";
import { BVN_MATCH } from "@/lib/kyc-data";
import { ADDRESS } from "@/lib/settings-data";

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
      { property: "og:description", content: "Final check before submitting your Kipit KYC." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: KycReview,
});

function KycReview() {
  const navigate = useNavigate();
  const [declared, setDeclared] = useState(false);

  return (
    <KycStep
      navTitle="Review & Submit"
      backTo="/verification"
      backLabel="Verification"
      eyebrow="Tier 2"
      title="Review and submit"
      subtitle="Make sure everything is correct — changes after submission need a support request."
      aside={
        <>
          <section className="card-surface p-5">
            <p className="text-[12.5px] font-extrabold text-foreground">What happens next</p>
            <ol className="mt-2 space-y-2">
              {[
                "We verify your identity against NIMC and NIBSS records.",
                "Your address document is reviewed by our compliance team.",
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
              Withdrawals to your bank, adding payout accounts and higher transaction limits.
              Reviews usually complete within one business day.
            </p>
          </section>
        </>
      }
    >

      <div className="space-y-4 md:grid md:grid-cols-2 md:items-start md:gap-4 md:space-y-0">
        <section className="card-surface p-4 md:p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Identity
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary">
              <Pencil className="size-3" /> Verified
            </span>
          </div>
          <dl className="mt-3 divide-y divide-border text-[13px]">
            <KycRow label="Full name">{BVN_MATCH.name}</KycRow>
            <KycRow label="Date of birth">{BVN_MATCH.dob}</KycRow>
            <KycRow label="BVN">•••• •••• 789</KycRow>
            <KycRow label="NIN">•••• •••• 431</KycRow>
            <KycRow label="Selfie check">Passed</KycRow>
          </dl>
        </section>

        <section className="card-surface p-4 md:p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Address & funding
          </p>
          <dl className="mt-3 divide-y divide-border text-[13px]">
            <KycRow label="Address">
              {ADDRESS.street}, {ADDRESS.city}
            </KycRow>
            <KycRow label="State / LGA">
              {ADDRESS.state} · {ADDRESS.lga}
            </KycRow>
            <KycRow label="Occupation">{ADDRESS.occupation}</KycRow>
            <KycRow label="Source of funds">{ADDRESS.sourceOfFunds}</KycRow>
          </dl>
          <div className="mt-3 flex items-center gap-3 rounded-xl border border-border bg-background p-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold">
              <FileText className="size-4" strokeWidth={2.2} />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[12.5px] font-bold text-foreground">
                proof-of-address.pdf
              </span>
              <span className="block text-[11px] text-muted-foreground">Utility bill · 1.2 MB</span>
            </span>
          </div>
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

      <div className="mt-5">
        <button
          type="button"
          disabled={!declared}
          onClick={() => void navigate({ to: "/verification/pending" })}
          className={kycCta}
        >
          Submit for review <ArrowRight className="size-4" strokeWidth={2.6} />
        </button>
      </div>
    </KycStep>
  );
}
