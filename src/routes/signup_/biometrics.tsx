import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Fingerprint } from "lucide-react";
import { useState } from "react";
import { AuthShell, GhostButton, PrimaryButton } from "@/components/kipit/AuthShell";
import { signupDraft } from "@/lib/auth-data";

export const Route = createFileRoute("/signup_/biometrics")({
  head: () => ({
    meta: [
      { title: "Enable biometrics — Kipit" },
      { name: "description", content: "Use Face ID or fingerprint to log in and authorise transactions faster." },
      { property: "og:title", content: "Enable biometrics — Kipit" },
      { property: "og:description", content: "Log in faster with Face ID or fingerprint." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BiometricSetup,
});

function BiometricSetup() {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);

  const enable = () => {
    setScanning(true);
    signupDraft.biometrics = true;
    setTimeout(() => navigate({ to: "/signup/success" }), 1400);
  };

  return (
    <AuthShell
      back="/signup/confirm-pin"
      step={7}
      steps={7}
      title="Faster, safer sign-in"
      subtitle="Use your device biometrics to log in and approve transactions without typing."
    >
      <div className="flex flex-col items-center gap-6">
        <span
          className={`flex size-28 items-center justify-center rounded-full border border-gold/40 bg-white/8 text-gold ${
            scanning ? "animate-pulse" : ""
          }`}
        >
          <Fingerprint className="size-14" />
        </span>
        <p className="text-center text-xs text-brand-foreground/65">
          {scanning
            ? "Verifying your biometrics…"
            : "Your biometric data never leaves your device. You can turn this off in Settings at any time."}
        </p>
      </div>

      <div className="mt-10 space-y-3">
        <PrimaryButton disabled={scanning} onClick={enable}>
          {scanning ? "Please wait…" : "Enable biometrics"}
        </PrimaryButton>
        <GhostButton onClick={() => navigate({ to: "/signup/success" })}>Not now</GhostButton>
      </div>
    </AuthShell>
  );
}
