import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Check, FileText, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import { KycStep, kycCta, kycLabel } from "@/components/kipit/KycStep";
import { PROOF_TYPES } from "@/lib/kyc-data";

export const Route = createFileRoute("/verification_/address-upload")({
  head: () => ({
    meta: [
      { title: "Upload Proof of Address | Kipit" },
      {
        name: "description",
        content:
          "Upload a recent utility bill, bank statement or tenancy agreement showing your address.",
      },
      { property: "og:title", content: "Upload Proof of Address | Kipit" },
      { property: "og:description", content: "Add a document that proves where you live." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AddressUpload,
});

function AddressUpload() {
  const navigate = useNavigate();
  const [type, setType] = useState(PROOF_TYPES[0]!.id);
  const [file, setFile] = useState<string | null>(null);
  const valid = file !== null;

  return (
    <KycStep
      navTitle="Proof of Address"
      backTo="/verification"
      backLabel="Verification"
      eyebrow="Tier 2"
      title="Upload proof of address"
      subtitle="The document must show your full name and the address you entered, dated within the last 3 months."
      step={3}
      totalSteps={4}
    >
      <section className="card-surface p-4 md:max-w-lg md:p-5">
        <span className={kycLabel}>Document type</span>
        <ul className="mt-2 space-y-2.5">
          {PROOF_TYPES.map((p) => {
            const active = p.id === type;
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => setType(p.id)}
                  aria-pressed={active}
                  className={`flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-colors press ${
                    active
                      ? "border-gold bg-gold/[0.07]"
                      : "border-border bg-background hover:border-gold/40"
                  }`}
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <FileText className="size-5" strokeWidth={2.2} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13.5px] font-bold text-foreground">
                      {p.label}
                    </span>
                    <span className="block text-[11.5px] text-muted-foreground">{p.hint}</span>
                  </span>
                  <span
                    className={`grid size-5 shrink-0 place-items-center rounded-full border ${
                      active ? "border-gold bg-gold text-gold-foreground" : "border-border"
                    }`}
                  >
                    {active && <Check className="size-3.5" strokeWidth={3} />}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-4">
          <span className={kycLabel}>Document</span>
          {file ? (
            <div className="mt-2 flex items-center gap-3 rounded-xl border border-gold/40 bg-gold/[0.07] p-3.5">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold">
                <FileText className="size-5" strokeWidth={2.2} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-bold text-foreground">
                  {file}
                </span>
                <span className="block text-[11.5px] text-muted-foreground">1.2 MB · Ready</span>
              </span>
              <button
                type="button"
                onClick={() => setFile(null)}
                aria-label="Remove document"
                className="grid size-9 shrink-0 place-items-center rounded-xl bg-background text-muted-foreground press"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ) : (
            <label className="mt-2 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background px-4 py-8 text-center press hover:border-gold/50">
              <span className="grid size-12 place-items-center rounded-full bg-gold/15 text-gold">
                <Upload className="size-5" strokeWidth={2.2} />
              </span>
              <span className="text-[13px] font-bold text-foreground">
                Tap to upload or take a photo
              </span>
              <span className="text-[11.5px] text-muted-foreground">
                PDF, JPG or PNG · up to 10 MB
              </span>
              <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0]?.name ?? "proof-of-address.pdf")}
              />
            </label>
          )}
        </div>

        <button
          type="button"
          disabled={!valid}
          onClick={() => void navigate({ to: "/verification/occupation" })}
          className={`mt-5 ${kycCta}`}
        >
          Continue <ArrowRight className="size-4" strokeWidth={2.6} />
        </button>
      </section>
    </KycStep>
  );
}
