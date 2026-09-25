import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  AuthField,
  AuthShell,
  PrimaryButton,
  authInputClass,
} from "@/components/kipit/AuthShell";
import { ApiError, requestOtp } from "@/lib/api";

const RESET_TARGET_KEY = "kipit:password-reset-target";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot your password — Kipit" },
      {
        name: "description",
        content: "Request a reset code to regain access to your Kipit account.",
      },
      { property: "og:title", content: "Forgot your password — Kipit" },
      { property: "og:description", content: "Request a reset code for your Kipit account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async () => {
    const target = identifier.trim();
    if (target.length < 5 || busy) return;
    setBusy(true);
    setError(null);
    try {
      await requestOtp(target, "PASSWORD_RESET");
      window.sessionStorage.setItem(RESET_TARGET_KEY, target);
      void navigate({ to: "/forgot-password/otp" });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not send a reset code. Check the email or phone and try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      back="/login"
      title="Reset your password"
      subtitle="Enter the phone number or email linked to your Kipit account and we'll send a reset code."
    >
      <AuthField label="Phone or email" error={error}>
        <input
          value={identifier}
          onChange={(e) => {
            setIdentifier(e.target.value);
            setError(null);
          }}
          className={authInputClass}
          placeholder="you@example.com"
        />
      </AuthField>

      <div className="mt-8">
        <PrimaryButton
          disabled={identifier.trim().length < 5 || busy}
          onClick={() => void send()}
        >
          {busy ? "Sending…" : "Send reset code"}
        </PrimaryButton>
      </div>
    </AuthShell>
  );
}
