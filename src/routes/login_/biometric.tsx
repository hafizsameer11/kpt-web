import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Fingerprint } from "lucide-react";
import { useState } from "react";
import { AuthShell, GhostButton, PrimaryButton } from "@/components/kipit/AuthShell";

export const Route = createFileRoute("/login_/biometric")({
  head: () => ({
    meta: [
      { title: "Biometric login — Kipit" },
      { name: "description", content: "Confirm it's you with Face ID or fingerprint to open your Kipit dashboard." },
      { property: "og:title", content: "Biometric login — Kipit" },
      { property: "og:description", content: "Confirm it's you with Face ID or fingerprint." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BiometricLogin,
});

function BiometricLogin() {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);

  const authenticate = () => {
    setScanning(true);
    setTimeout(() => navigate({ to: "/" }), 1300);
  };

  return (
    <AuthShell back="/login" title="Confirm it's you" subtitle="Authenticate to open your dashboard.">
      <div className="flex flex-col items-center gap-6">
        <button
          type="button"
          onClick={authenticate}
          className={`flex size-32 items-center justify-center rounded-full border border-gold/40 bg-white/8 text-gold transition active:scale-95 ${
            scanning ? "animate-pulse" : ""
          }`}
          aria-label="Authenticate with biometrics"
        >
          <Fingerprint className="size-16" />
        </button>
        <p className="text-center text-xs text-brand-foreground/65">
          {scanning ? "Authenticating…" : "Tap the icon to scan your fingerprint or face."}
        </p>
      </div>

      <div className="mt-10 space-y-3">
        <PrimaryButton disabled={scanning} onClick={authenticate}>
          {scanning ? "Please wait…" : "Authenticate"}
        </PrimaryButton>
        <GhostButton onClick={() => navigate({ to: "/login" })}>Use password instead</GhostButton>
      </div>
    </AuthShell>
  );
}
