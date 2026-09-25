import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, MapPin } from "lucide-react";
import { useState } from "react";
import { KycStep, kycCta, kycField, kycLabel } from "@/components/kipit/KycStep";
import { NIGERIAN_STATES } from "@/lib/kyc-data";
import { getTier2Draft, patchTier2Draft } from "@/lib/tier2-draft";

export const Route = createFileRoute("/verification_/address")({
  head: () => ({
    meta: [
      { title: "Your Residential Address | Kipit" },
      {
        name: "description",
        content:
          "Tell Kipit where you live so we can store your residence for Tier 2 verification.",
      },
      { property: "og:title", content: "Your Residential Address | Kipit" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AddressStep,
});

function AddressStep() {
  const navigate = useNavigate();
  const d = getTier2Draft();
  const [street, setStreet] = useState(d.addressStreet);
  const [city, setCity] = useState(d.addressCity);
  const [lga, setLga] = useState(d.addressLga);
  const [state, setState] = useState(d.addressState);
  const valid = street.trim().length > 4 && city.trim() !== "" && lga.trim() !== "" && state !== "";

  return (
    <KycStep
      navTitle="Address"
      backTo="/verification/selfie"
      backLabel="Selfie"
      eyebrow="Tier 2"
      title="Where do you live?"
      subtitle="Use your current residential address — a PO Box or office address can't be accepted."
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
          onClick={() => {
            patchTier2Draft({
              addressStreet: street.trim(),
              addressCity: city.trim(),
              addressLga: lga.trim(),
              addressState: state,
            });
            void navigate({ to: "/verification/address-upload" });
          }}
          className={`mt-5 ${kycCta}`}
        >
          Continue <ArrowRight className="size-4" strokeWidth={2.6} />
        </button>
      </section>
    </KycStep>
  );
}
