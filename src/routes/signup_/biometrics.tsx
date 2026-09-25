import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MonitorSmartphone } from "lucide-react";
import { useEffect } from "react";
import { AuthShell, GhostButton, PrimaryButton } from "@/components/kipit/AuthShell";
import { logSignupFunnel } from "@/lib/api";
import { signupDraft } from "@/lib/auth-data";

export const Route = createFileRoute("/signup_/biometrics")({
  head: () => ({
    meta: [
      { title: "Almost done — Kipit" },
      {
        name: "description",
        content: "Biometrics are available in the Kipit mobile app. Continue on web with your PIN.",
      },
      { property: "og:title", content: "Almost done — Kipit" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BiometricSetup,
});

/** Web has no device biometrics — skip straight to success. */
function BiometricSetup() {
  const navigate = useNavigate();

  useEffect(() => {
    void logSignupFunnel({
      step: "biometrics",
      email: signupDraft.email || undefined,
      deviceId: signupDraft.deviceId,
    });
  }, []);

  const continueOn = () => {
    signupDraft.biometrics = false;
    void navigate({ to: "/signup/success" });
  };

  return (
    <AuthShell
      back="/signup/confirm-pin"
      step={7}
      steps={7}
      title="You're set on web"
      subtitle="Face ID and fingerprint work in the Kipit mobile app. On web, use your email, password, and transaction PIN."
    >
      <div className="flex flex-col items-center gap-6">
        <span className="flex size-28 items-center justify-center rounded-full border border-gold/40 bg-white/8 text-gold">
          <MonitorSmartphone className="size-14" />
        </span>
        <p className="text-center text-xs text-brand-foreground/65">
          You can enable biometrics anytime after installing the Kipit app on your phone.
        </p>
      </div>

      <div className="mt-10 space-y-3">
        <PrimaryButton onClick={continueOn}>Continue</PrimaryButton>
        <GhostButton onClick={continueOn}>Skip</GhostButton>
      </div>
    </AuthShell>
  );
}
