import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { KycStep, kycCta, kycField, kycLabel } from "@/components/kipit/KycStep";
import { EMPLOYMENT_STATUS, INCOME_BANDS, SOURCE_OF_FUNDS } from "@/lib/kyc-data";

export const Route = createFileRoute("/verification_/occupation")({
  head: () => ({
    meta: [
      { title: "Occupation & Source of Funds | Kipit" },
      {
        name: "description",
        content:
          "Tell Kipit how you earn and where your investment funds come from — required by anti-money-laundering rules.",
      },
      { property: "og:title", content: "Occupation & Source of Funds | Kipit" },
      { property: "og:description", content: "Share your occupation and source of funds." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OccupationStep,
});

function OccupationStep() {
  const navigate = useNavigate();
  const [employment, setEmployment] = useState("");
  const [occupation, setOccupation] = useState("");
  const [source, setSource] = useState<string[]>([]);
  const [income, setIncome] = useState("");
  const valid = employment !== "" && occupation.trim() !== "" && source.length > 0 && income !== "";

  const toggle = (s: string) =>
    setSource((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  return (
    <KycStep
      navTitle="Occupation"
      backTo="/verification"
      backLabel="Verification"
      eyebrow="Tier 2"
      title="How do you earn?"
      subtitle="Nigerian AML regulations require us to understand where the money you invest comes from."
      step={4}
      totalSteps={4}
    >
      <section className="card-surface p-4 md:max-w-lg md:p-5">
        <label className="block">
          <span className={kycLabel}>Employment status</span>
          <select
            value={employment}
            onChange={(e) => setEmployment(e.target.value)}
            className={kycField}
          >
            <option value="">Select status</option>
            {EMPLOYMENT_STATUS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-4 block">
          <span className={kycLabel}>Occupation</span>
          <input
            placeholder="e.g. Product Designer"
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
            className={kycField}
          />
        </label>

        <div className="mt-4">
          <span className={kycLabel}>Source of funds (select all that apply)</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {SOURCE_OF_FUNDS.map((s) => {
              const active = source.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggle(s)}
                  aria-pressed={active}
                  className={`rounded-full border px-3.5 py-2 text-[12px] font-bold press ${
                    active
                      ? "border-gold bg-gold text-gold-foreground"
                      : "border-border bg-background text-foreground"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        <label className="mt-4 block">
          <span className={kycLabel}>Expected annual investment</span>
          <select value={income} onChange={(e) => setIncome(e.target.value)} className={kycField}>
            <option value="">Select a range</option>
            {INCOME_BANDS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </label>

        <p className="mt-4 flex items-start gap-1.5 text-[11.5px] text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-gold" /> This information is
          confidential and used only for regulatory compliance.
        </p>

        <button
          type="button"
          disabled={!valid}
          onClick={() => void navigate({ to: "/verification/review" })}
          className={`mt-5 ${kycCta}`}
        >
          Continue <ArrowRight className="size-4" strokeWidth={2.6} />
        </button>
      </section>
    </KycStep>
  );
}
