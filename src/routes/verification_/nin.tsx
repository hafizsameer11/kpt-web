import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, IdCard, Lock } from "lucide-react";
import { useState } from "react";
import { KycStep, kycCta, kycField, kycLabel } from "@/components/kipit/KycStep";
import { DEMO_NIN_LENGTH } from "@/lib/kyc-data";
import { getTier2Draft, patchTier2Draft } from "@/lib/tier2-draft";

export const Route = createFileRoute("/verification_/nin")({
  head: () => ({
    meta: [
      { title: "Enter Your NIN | Kipit" },
      {
        name: "description",
        content:
          "Enter your 11-digit National Identity Number to continue Kipit Tier 2 verification.",
      },
      { property: "og:title", content: "Enter Your NIN | Kipit" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NinEntry,
});

function NinEntry() {
  const navigate = useNavigate();
  const [nin, setNin] = useState(() => getTier2Draft().nin);
  const valid = nin.length === DEMO_NIN_LENGTH;

  return (
    <KycStep
      navTitle="NIN"
      backTo="/verification"
      backLabel="Verification"
      eyebrow="Tier 2"
      title="Enter your NIN"
      subtitle="Dial *346# on any Nigerian line to retrieve your National Identity Number."
      aside={
        <section className="card-surface p-5">
          <p className="text-[12.5px] font-extrabold text-foreground">Why Tier 2 needs your NIN</p>
          <ul className="mt-2 space-y-2">
            {[
              "Required before your first withdrawal.",
              "Matched to your Kipit profile name.",
              "Raises your transaction limits.",
            ].map((t) => (
              <li key={t} className="flex gap-2 text-[12px] leading-relaxed text-muted-foreground">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold" />
                {t}
              </li>
            ))}
          </ul>
        </section>
      }
      step={1}
      totalSteps={4}
    >
      <section className="card-surface p-4 md:max-w-lg md:p-5">
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <IdCard className="size-5" strokeWidth={2.2} />
          </span>
          <p className="text-[12.5px] leading-snug text-muted-foreground">
            We match your NIN against the NIMC database to confirm your legal identity.
          </p>
        </div>

        <label className="mt-4 block">
          <span className={kycLabel}>National Identity Number</span>
          <input
            inputMode="numeric"
            autoComplete="off"
            placeholder="11-digit NIN"
            value={nin}
            onChange={(e) => setNin(e.target.value.replace(/[^0-9]/g, "").slice(0, 11))}
            className={`${kycField} text-[16px] tracking-[0.14em] text-num`}
          />
        </label>

        <p className="mt-3 flex items-start gap-1.5 text-[11.5px] text-muted-foreground">
          <Lock className="mt-0.5 size-3.5 shrink-0" /> Encrypted and never shared beyond identity
          verification.
        </p>

        <button
          type="button"
          disabled={!valid}
          onClick={() => {
            patchTier2Draft({ nin });
            void navigate({ to: "/verification/selfie" });
          }}
          className={`mt-5 ${kycCta}`}
        >
          Continue <ArrowRight className="size-4" strokeWidth={2.6} />
        </button>
      </section>
    </KycStep>
  );
}
