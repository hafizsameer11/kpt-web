import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Lock } from "lucide-react";
import { useState } from "react";
import { KycStep, kycCta, kycField, kycLabel } from "@/components/kipit/KycStep";

export const Route = createFileRoute("/verification_/bvn")({
  head: () => ({
    meta: [
      { title: "Enter Your BVN | Kipit" },
      {
        name: "description",
        content:
          "Enter your 11-digit Bank Verification Number to verify your identity on Kipit.",
      },
      { property: "og:title", content: "Enter Your BVN | Kipit" },
      {
        property: "og:description",
        content: "Securely submit your BVN for Kipit Tier 1 verification.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BvnEntry,
});

function BvnEntry() {
  const navigate = useNavigate();
  const [bvn, setBvn] = useState("");
  const [consent, setConsent] = useState(false);
  const valid = bvn.length === 11 && consent;

  return (
    <KycStep
      navTitle="BVN"
      backTo="/verification"
      backLabel="Verification"
      eyebrow="Tier 1"
      title="Enter your BVN"
      subtitle="Dial *565*0# on the phone number linked to your bank account to see your BVN."
      step={1}
      totalSteps={2}
    >
      <section className="card-surface p-4 md:max-w-lg md:p-5">
        <label className="block">
          <span className={kycLabel}>Bank Verification Number</span>
          <input
            inputMode="numeric"
            autoComplete="off"
            placeholder="11-digit BVN"
            value={bvn}
            onChange={(e) => setBvn(e.target.value.replace(/[^0-9]/g, "").slice(0, 11))}
            className={`${kycField} text-[16px] tracking-[0.14em] text-num`}
          />
        </label>
        {bvn.length > 0 && bvn.length < 11 && (
          <p className="mt-2 text-[11.5px] font-semibold text-muted-foreground">
            {11 - bvn.length} digits to go
          </p>
        )}

        <label className="mt-4 flex items-start gap-3 rounded-xl border border-border bg-background p-3.5">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 size-4 accent-[hsl(var(--gold))]"
          />
          <span className="text-[12px] leading-snug text-muted-foreground">
            I authorise Kipit to verify my BVN details with NIBSS to confirm my identity.
          </span>
        </label>

        <p className="mt-4 flex items-start gap-1.5 text-[11.5px] text-muted-foreground">
          <Lock className="mt-0.5 size-3.5 shrink-0" /> Your BVN is encrypted in transit and at
          rest. We cannot see your balances or move money with it.
        </p>

        <button
          type="button"
          disabled={!valid}
          onClick={() => void navigate({ to: "/verification/bvn-processing", search: { bvn } })}
          className={`mt-5 ${kycCta}`}
        >
          Verify BVN <ArrowRight className="size-4" strokeWidth={2.6} />
        </button>
      </section>


    </KycStep>
  );
}
