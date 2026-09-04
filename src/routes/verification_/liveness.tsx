import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Camera, Eye, Glasses, Sun } from "lucide-react";
import { KycStep, kycCta, kycGhost } from "@/components/kipit/KycStep";

export const Route = createFileRoute("/verification_/liveness")({
  head: () => ({
    meta: [
      { title: "Selfie Check Tips | Kipit" },
      {
        name: "description",
        content:
          "How to pass the Kipit liveness check: good lighting, no glasses or hats, and face the camera.",
      },
      { property: "og:title", content: "Selfie Check Tips | Kipit" },
      { property: "og:description", content: "Get ready for your Kipit liveness check." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LivenessIntro,
});

const TIPS = [
  { icon: Sun, title: "Find good light", desc: "Face a window or a bright lamp." },
  { icon: Glasses, title: "Remove glasses & hats", desc: "Nothing covering your face." },
  { icon: Eye, title: "Look straight ahead", desc: "Keep your whole face in the frame." },
];

function LivenessIntro() {
  return (
    <KycStep
      navTitle="Selfie Check"
      backTo="/verification"
      backLabel="Verification"
      eyebrow="Tier 2"
      title="Let's confirm it's really you"
      subtitle="We'll take a short live selfie and match it against your ID photo."
      aside={
        <>
          <section className="card-surface p-5">
            <p className="text-[12.5px] font-extrabold text-foreground">Before you start</p>
            <ul className="mt-2 space-y-2">
              {[
                "Find a well-lit spot facing a window or lamp.",
                "Remove hats, sunglasses and face coverings.",
                "Hold your device at eye level and stay still.",
              ].map((t) => (
                <li key={t} className="flex gap-2 text-[12px] leading-relaxed text-muted-foreground">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold" />
                  {t}
                </li>
              ))}
            </ul>
          </section>
          <section className="card-surface p-5">
            <p className="text-[12.5px] font-extrabold text-foreground">Your privacy</p>
            <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
              The liveness check is used only to confirm you are a real person and is stored
              encrypted alongside your KYC record.
            </p>
          </section>
        </>
      }
      step={2}
      totalSteps={4}
    >
      <div className="space-y-4 md:grid md:grid-cols-2 md:items-start md:gap-4 md:space-y-0">
        <section className="card-surface p-4 md:p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Before you start
          </p>
          <ul className="mt-3 space-y-3">
            {TIPS.map((t) => {
              const Icon = t.icon;
              return (
                <li key={t.title} className="flex items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold">
                    <Icon className="size-5" strokeWidth={2.2} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13.5px] font-bold text-foreground">
                      {t.title}
                    </span>
                    <span className="block text-[11.5px] text-muted-foreground">{t.desc}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="card-surface flex flex-col items-center justify-center p-6 text-center md:p-8">
          <span className="grid size-24 place-items-center rounded-full border-2 border-dashed border-gold/50 text-gold">
            <Camera className="size-10" strokeWidth={1.8} />
          </span>
          <p className="mt-4 text-[13px] font-bold text-foreground">Camera access needed</p>
          <p className="mt-1 text-[11.5px] text-muted-foreground">
            Your selfie is used only for identity verification and is never posted anywhere.
          </p>
        </section>
      </div>

      <div className="mt-5 flex flex-col gap-2.5 md:flex-row">
        <Link to="/verification/selfie" className={kycCta}>
          I'm ready <ArrowRight className="size-4" strokeWidth={2.6} />
        </Link>
        <Link to="/verification" className={kycGhost}>
          Do this later
        </Link>
      </div>
    </KycStep>
  );
}
