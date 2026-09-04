import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, MapPin } from "lucide-react";
import { useState } from "react";
import { KycStep, kycCta, kycField, kycLabel } from "@/components/kipit/KycStep";
import { NIGERIAN_STATES } from "@/lib/kyc-data";

export const Route = createFileRoute("/verification_/address")({
  head: () => ({
    meta: [
      { title: "Your Residential Address | Kipit" },
      {
        name: "description",
        content:
          "Tell Kipit where you live so we can verify your residence for Tier 2 verification.",
      },
      { property: "og:title", content: "Your Residential Address | Kipit" },
      { property: "og:description", content: "Enter your residential address for Kipit KYC." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AddressStep,
});

function AddressStep() {
  const navigate = useNavigate();
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [lga, setLga] = useState("");
  const [state, setState] = useState("");
  const valid = street.trim().length > 4 && city.trim() !== "" && lga.trim() !== "" && state !== "";

  return (
    <KycStep
      navTitle="Address"
      backTo="/verification"
      backLabel="Verification"
      eyebrow="Tier 2"
      title="Where do you live?"
      subtitle="Use your current residential address — a PO Box or office address can't be accepted."
      aside={
        <>
          <section className="card-surface p-5">
            <p className="text-[12.5px] font-extrabold text-foreground">Accepted proof</p>
            <ul className="mt-2 space-y-2">
              {[
                "Utility bill issued in the last 3 months.",
                "Bank statement showing your address.",
                "Tenancy agreement or government letter.",
              ].map((t) => (
                <li key={t} className="flex gap-2 text-[12px] leading-relaxed text-muted-foreground">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold" />
                  {t}
                </li>
              ))}
            </ul>
          </section>
          <section className="card-surface p-5">
            <p className="text-[12.5px] font-extrabold text-foreground">Keep it current</p>
            <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
              Your address must match the documents you upload, otherwise the review may be delayed.
            </p>
          </section>
        </>
      }
      step={3}
      totalSteps={4}
    >
      <section className="card-surface p-4 md:max-w-lg md:p-5">
        <label className="block">
          <span className={kycLabel}>Street address</span>
          <input
            placeholder="e.g. 18B Admiralty Way"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            className={kycField}
          />
        </label>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block">
            <span className={kycLabel}>City / town</span>
            <input
              placeholder="e.g. Lekki Phase 1"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className={kycField}
            />
          </label>
          <label className="block">
            <span className={kycLabel}>LGA</span>
            <input
              placeholder="e.g. Eti-Osa"
              value={lga}
              onChange={(e) => setLga(e.target.value)}
              className={kycField}
            />
          </label>
        </div>

        <label className="mt-4 block">
          <span className={kycLabel}>State</span>
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className={kycField}
          >
            <option value="">Select your state</option>
            {NIGERIAN_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <p className="mt-4 flex items-start gap-1.5 text-[11.5px] text-muted-foreground">
          <MapPin className="mt-0.5 size-3.5 shrink-0" /> Next you'll upload one document showing
          this address.
        </p>

        <button
          type="button"
          disabled={!valid}
          onClick={() => void navigate({ to: "/verification/address-upload" })}
          className={`mt-5 ${kycCta}`}
        >
          Continue <ArrowRight className="size-4" strokeWidth={2.6} />
        </button>
      </section>
    </KycStep>
  );
}
