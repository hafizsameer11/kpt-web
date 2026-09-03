import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthShell, Keypad, PinDots } from "@/components/kipit/AuthShell";
import { signupDraft } from "@/lib/auth-data";

export const Route = createFileRoute("/signup_/confirm-pin")({
  head: () => ({
    meta: [
      { title: "Confirm your transaction PIN — Kipit" },
      { name: "description", content: "Re-enter your four-digit PIN to confirm it." },
      { property: "og:title", content: "Confirm your transaction PIN — Kipit" },
      { property: "og:description", content: "Re-enter your four-digit PIN to confirm it." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ConfirmPin,
});

function ConfirmPin() {
  const navigate = useNavigate();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (pin.length !== 4) return;
    if (signupDraft.pin && pin !== signupDraft.pin) {
      setError("Your PINs don't match. Please try again.");
      const t = setTimeout(() => setPin(""), 600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => navigate({ to: "/signup/biometrics" }), 350);
    return () => clearTimeout(t);
  }, [pin, navigate]);

  return (
    <AuthShell
      back="/signup/pin"
      step={6}
      steps={7}
      title="Confirm your PIN"
      subtitle="Enter the same four digits once more."
    >
      <div className="space-y-8">
        <PinDots length={4} filled={pin.length} />
        <p className="min-h-5 text-center text-xs [color:oklch(0.8_0.14_25)]">{error}</p>
        <Keypad
          onDigit={(d) => { setError(null); setPin((p) => (p.length < 4 ? p + d : p)); }}
          onBackspace={() => setPin((p) => p.slice(0, -1))}
        />
      </div>
    </AuthShell>
  );
}
