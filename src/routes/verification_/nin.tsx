import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, IdCard, Info, Lock } from "lucide-react";
import { useState } from "react";
import { KycStep, kycCta, kycField, kycLabel } from "@/components/kipit/KycStep";
import { DEMO_NIN_LENGTH } from "@/lib/kyc-data";

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
      { property: "og:description", content: "Submit your NIN for Kipit Tier 2 verification." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NinEntry,
});

function NinEntry() {
  const navigate = useNavigate();
  const [nin, setNin] = useState("");
  const valid = nin.length === DEMO_NIN_LENGTH;

  return (
    <KycStep
      navTitle="NIN"
      backTo="/verification"
      backLabel="Verification"
      eyebrow="Tier 2"
      title="Enter your NIN"
      subtitle="Dial *346# on any Nigerian line to retrieve your National Identity Number."
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
          <Lock className="mt-0.5 size-3.5 shrink-0" /> Encrypted and never shared with third
          parties beyond identity verification.
        </p>

        <button
          type="button"
          disabled={!valid}
          onClick={() => void navigate({ to: "/verification/liveness" })}
          className={`mt-5 ${kycCta}`}
        >
          Continue <ArrowRight className="size-4" strokeWidth={2.6} />
        </button>
      </section>

      <p className="mt-4 flex items-start gap-2 rounded-xl bg-secondary px-3.5 py-3 text-[11.5px] text-muted-foreground md:max-w-lg">
        <Info className="mt-0.5 size-4 shrink-0" />
        The name on your NIN must match the name on your BVN. If they differ, update your NIMC
        record before continuing.
      </p>
    </KycStep>
  );
}
