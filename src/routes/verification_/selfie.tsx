import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Camera, Check, RefreshCw, ScanFace } from "lucide-react";
import { useEffect, useState } from "react";
import { KycStep, kycCta, kycGhost } from "@/components/kipit/KycStep";

export const Route = createFileRoute("/verification_/selfie")({
  head: () => ({
    meta: [
      { title: "Take Your Selfie | Kipit" },
      {
        name: "description",
        content: "Capture a live selfie so Kipit can match your face to your government ID.",
      },
      { property: "og:title", content: "Take Your Selfie | Kipit" },
      { property: "og:description", content: "Capture your Kipit liveness selfie." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SelfieCapture,
});

type Stage = "ready" | "capturing" | "done";

function SelfieCapture() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage>("ready");

  useEffect(() => {
    if (stage !== "capturing") return;
    const t = window.setTimeout(() => setStage("done"), 2200);
    return () => window.clearTimeout(t);
  }, [stage]);

  return (
    <KycStep
      navTitle="Selfie"
      backTo="/verification"
      backLabel="Verification"
      eyebrow="Tier 2"
      title={stage === "done" ? "Selfie captured" : "Centre your face"}
      subtitle={
        stage === "done"
          ? "Looks good — your photo passed the liveness check."
          : "Hold still while we scan. Keep your face inside the circle."
      }
      step={2}
      totalSteps={4}
    >
      <section className="card-surface flex flex-col items-center p-6 md:mx-auto md:max-w-lg md:p-8">
        <div className="relative grid size-56 place-items-center">
          <span
            aria-hidden
            className={`absolute inset-0 rounded-full border-2 ${
              stage === "done"
                ? "border-gold"
                : stage === "capturing"
                  ? "animate-spin border-transparent border-t-gold [animation-duration:1.2s]"
                  : "border-dashed border-border"
            }`}
          />
          <span
            className={`grid size-44 place-items-center rounded-full ${
              stage === "done" ? "bg-gold/15 text-gold" : "bg-secondary text-muted-foreground"
            }`}
          >
            {stage === "done" ? (
              <Check className="size-16" strokeWidth={2.4} />
            ) : (
              <ScanFace className="size-16" strokeWidth={1.6} />
            )}
          </span>
        </div>

        <p className="mt-5 text-center text-[12.5px] text-muted-foreground">
          {stage === "capturing"
            ? "Scanning… blink naturally."
            : stage === "done"
              ? "Face matched to your ID photo."
              : "Tap capture when you're ready."}
        </p>

        {stage === "ready" && (
          <button
            type="button"
            onClick={() => setStage("capturing")}
            className={`mt-5 ${kycCta}`}
          >
            <Camera className="size-4" strokeWidth={2.6} /> Capture selfie
          </button>
        )}

        {stage === "done" && (
          <div className="mt-5 flex w-full flex-col gap-2.5 md:flex-row md:justify-center">
            <button
              type="button"
              onClick={() => void navigate({ to: "/verification/address" })}
              className={kycCta}
            >
              Continue <ArrowRight className="size-4" strokeWidth={2.6} />
            </button>
            <button type="button" onClick={() => setStage("ready")} className={kycGhost}>
              <RefreshCw className="size-4" /> Retake
            </button>
          </div>
        )}
      </section>
    </KycStep>
  );
}
