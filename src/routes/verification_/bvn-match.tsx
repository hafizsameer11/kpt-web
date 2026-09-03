import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, Info } from "lucide-react";
import { KycStep, KycRow, kycCta, kycGhost } from "@/components/kipit/KycStep";
import { BVN_MATCH } from "@/lib/kyc-data";

export const Route = createFileRoute("/verification_/bvn-match")({
  head: () => ({
    meta: [
      { title: "Confirm Your BVN Details | Kipit" },
      {
        name: "description",
        content: "Check the name, date of birth and phone number returned from your BVN record.",
      },
      { property: "og:title", content: "Confirm Your BVN Details | Kipit" },
      { property: "og:description", content: "Confirm the details we found on your BVN." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BvnMatch,
});

function BvnMatch() {
  return (
    <KycStep
      navTitle="BVN Match"
      backTo="/verification"
      backLabel="Verification"
      eyebrow="Tier 1"
      title="Is this you?"
      subtitle="These details came from your BVN record. They'll be locked on your Kipit profile once confirmed."
      step={2}
      totalSteps={2}
    >
      <section className="card-surface p-4 md:max-w-lg md:p-5">
        <div className="flex items-center gap-3 rounded-xl border border-gold/40 bg-gold/[0.07] p-3.5">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold">
            <BadgeCheck className="size-5" strokeWidth={2.2} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[14px] font-extrabold text-foreground">
              {BVN_MATCH.name}
            </p>
            <p className="text-[12px] text-muted-foreground">BVN record matched</p>
          </div>
        </div>

        <dl className="mt-3 divide-y divide-border text-[13px]">
          <KycRow label="Full name">{BVN_MATCH.name}</KycRow>
          <KycRow label="Date of birth">{BVN_MATCH.dob}</KycRow>
          <KycRow label="Phone">{BVN_MATCH.phone}</KycRow>
        </dl>

        <p className="mt-3 flex items-start gap-1.5 text-[11.5px] text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0" /> If anything is wrong, update it with your
          bank first — Kipit cannot change BVN data.
        </p>
      </section>

      <div className="mt-5 flex flex-col gap-2.5 md:flex-row">
        <Link to="/verification/tier1-verified" className={kycCta}>
          Yes, that's me <ArrowRight className="size-4" strokeWidth={2.6} />
        </Link>
        <Link to="/verification/bvn" className={kycGhost}>
          Not me — re-enter BVN
        </Link>
      </div>
    </KycStep>
  );
}
