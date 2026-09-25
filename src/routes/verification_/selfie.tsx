import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Check, ImagePlus, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { KycStep, kycCta, kycGhost } from "@/components/kipit/KycStep";
import { ApiError, fileToBase64, uploadKycDocument } from "@/lib/api";
import { getTier2Draft, patchTier2Draft } from "@/lib/tier2-draft";

export const Route = createFileRoute("/verification_/selfie")({
  head: () => ({
    meta: [
      { title: "Upload Your Selfie | Kipit" },
      {
        name: "description",
        content: "Upload a clear face photo for Kipit Tier 2 verification.",
      },
      { property: "og:title", content: "Upload Your Selfie | Kipit" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SelfieCapture,
});

function SelfieCapture() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const draft = getTier2Draft();
  const [preview, setPreview] = useState(draft.selfiePreview || draft.selfieUrl);
  const [remoteUrl, setRemoteUrl] = useState(draft.selfieUrl);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFile = async (file: File | null) => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const localPreview = URL.createObjectURL(file);
      setPreview(localPreview);
      const { contentType, dataBase64 } = await fileToBase64(file);
      const saved = await uploadKycDocument({
        kind: "selfie",
        contentType,
        dataBase64,
      });
      setRemoteUrl(saved.url);
      patchTier2Draft({ selfieUrl: saved.url, selfiePreview: localPreview });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not upload selfie.");
      setRemoteUrl("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <KycStep
      navTitle="Selfie"
      backTo="/verification/nin"
      backLabel="NIN"
      eyebrow="Tier 2"
      title={remoteUrl ? "Selfie ready" : "Upload a clear selfie"}
      subtitle="Use a well-lit face photo. On web, pick a photo from your device — camera capture is optional on mobile."
      step={2}
      totalSteps={4}
    >
      <section className="card-surface flex flex-col items-center p-6 md:mx-auto md:max-w-lg md:p-8">
        <div className="relative grid size-56 place-items-center overflow-hidden rounded-full border-2 border-dashed border-border bg-secondary">
          {preview ? (
            <img src={preview} alt="Selfie preview" className="size-full object-cover" />
          ) : (
            <ImagePlus className="size-16 text-muted-foreground" strokeWidth={1.6} />
          )}
          {remoteUrl ? (
            <span className="absolute bottom-3 right-3 grid size-9 place-items-center rounded-full bg-gold text-gold-foreground">
              <Check className="size-5" strokeWidth={2.6} />
            </span>
          ) : null}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
        />

        {error ? (
          <p className="mt-4 text-center text-[12px] font-semibold text-destructive">{error}</p>
        ) : null}

        <div className="mt-6 flex w-full flex-col gap-2.5">
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className={kycGhost}
          >
            {busy ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Uploading…
              </>
            ) : remoteUrl ? (
              "Replace photo"
            ) : (
              "Choose photo"
            )}
          </button>
          <button
            type="button"
            disabled={!remoteUrl || busy}
            onClick={() => void navigate({ to: "/verification/address" })}
            className={kycCta}
          >
            Continue <ArrowRight className="size-4" strokeWidth={2.6} />
          </button>
        </div>
      </section>
    </KycStep>
  );
}
