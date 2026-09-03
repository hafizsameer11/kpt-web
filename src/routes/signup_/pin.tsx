import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { AuthShell, Keypad, PinDots } from "@/components/kipit/AuthShell";
import { signupDraft, weakPin } from "@/lib/auth-data";

export const Route = createFileRoute("/signup_/pin")({
  head: () => ({
    meta: [
      { title: "Create your transaction PIN — Kipit" },
      { name: "description", content: "Set the four-digit PIN that authorises money movement on Kipit." },
      { property: "og:title", content: "Create your transaction PIN — Kipit" },
      { property: "og:description", content: "Set your four-digit transaction PIN." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CreatePin,
});

function CreatePin() {
  const navigate = useNavigate();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (pin.length !== 4) return;
    const problem = weakPin(pin);
    if (problem) {
      setError(problem);
      const t = setTimeout(() => setPin(""), 600);
      return () => clearTimeout(t);
    }
    signupDraft.pin = pin;
    const t = setTimeout(() => navigate({ to: "/signup/confirm-pin" }), 350);
    return () => clearTimeout(t);
  }, [pin, navigate]);

  return (
    <AuthShell
      back="/signup/password"
      step={6}
      steps={7}
      title="Create a transaction PIN"
      subtitle="You'll use this four-digit PIN to authorise deposits, investments and withdrawals."
    >
      <div className="space-y-8">
        <PinDots length={4} filled={pin.length} />
        <p className="min-h-5 text-center text-xs [color:oklch(0.8_0.14_25)]">{error}</p>
        <Keypad
          onDigit={(d) => { setError(null); setPin((p) => (p.length < 4 ? p + d : p)); }}
          onBackspace={() => setPin((p) => p.slice(0, -1))}
        />
        <div className="flex items-start gap-3 rounded-xl border border-white/12 bg-white/8 p-4 text-xs leading-relaxed text-brand-foreground/70">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-gold" />
          Never share your PIN. Kipit staff will never ask for it. Avoid repeated or sequential
          digits.
        </div>
      </div>
    </AuthShell>
  );
}
