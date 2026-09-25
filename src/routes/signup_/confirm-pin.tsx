import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AuthShell, Keypad, PinDots } from "@/components/kipit/AuthShell";
import { signupDraft } from "@/lib/auth-data";
import { ApiError, completeSignup } from "@/lib/api";
import { refreshWalletFromApi } from "@/lib/wallet-balance";
import { hydrateLiveBalances } from "@/lib/live-balances";

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
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);

  useEffect(() => {
    if (pin.length !== 4 || busy || submitting.current) return;
    if (signupDraft.pin && pin !== signupDraft.pin) {
      setError("Your PINs don't match. Please try again.");
      const t = setTimeout(() => setPin(""), 600);
      return () => clearTimeout(t);
    }
    let cancelled = false;
    setBusy(true);
    submitting.current = true;
    const t = setTimeout(() => {
      void (async () => {
        setError(null);
        try {
          if (!signupDraft.email || !signupDraft.password || signupDraft.password.length < 8) {
            throw new Error("Password was not saved. Go back and set your password again.");
          }
          if (!signupDraft.firstName || !signupDraft.lastName) {
            throw new Error("Name details are incomplete. Go back and try again.");
          }
          if (!signupDraft.pin) {
            throw new Error("PIN was not saved. Go back and create your PIN again.");
          }
          const phone = signupDraft.phone.trim();
          await completeSignup({
            email: signupDraft.email,
            password: signupDraft.password,
            firstName: signupDraft.firstName,
            ...(signupDraft.middleName ? { middleName: signupDraft.middleName } : {}),
            surname: signupDraft.lastName,
            ...(signupDraft.referral ? { referralCode: signupDraft.referral } : {}),
            pin: signupDraft.pin,
            ...(signupDraft.dateOfBirth ? { dateOfBirth: signupDraft.dateOfBirth } : {}),
            ...(phone.length >= 7 ? { phone } : {}),
          });
          await refreshWalletFromApi().catch(() => undefined);
          await hydrateLiveBalances().catch(() => undefined);
          if (!cancelled) void navigate({ to: "/signup/biometrics" });
        } catch (err) {
          submitting.current = false;
          if (!cancelled) {
            setError(
              err instanceof ApiError
                ? err.message
                : err instanceof Error
                  ? err.message
                  : "Could not create your account.",
            );
            setPin("");
            setBusy(false);
          }
        }
      })();
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [pin, navigate, busy]);

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
          disabled={busy}
          onDigit={(d) => {
            if (busy) return;
            setError(null);
            setPin((p) => (p.length < 4 ? p + d : p));
          }}
          onBackspace={() => {
            if (busy) return;
            setPin((p) => p.slice(0, -1));
          }}
        />
      </div>
    </AuthShell>
  );
}
