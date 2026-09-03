import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  AuthField,
  AuthShell,
  PrimaryButton,
  authInputClass,
} from "@/components/kipit/AuthShell";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot your password — Kipit" },
      { name: "description", content: "Request a reset code to regain access to your Kipit account." },
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

  return (
    <AuthShell
      back="/login"
      title="Reset your password"
      subtitle="Enter the phone number or email linked to your Kipit account and we'll send a reset code."
    >
      <AuthField label="Phone or email">
        <input
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className={authInputClass}
          placeholder="you@example.com"
        />
      </AuthField>

      <div className="mt-8">
        <PrimaryButton
          disabled={identifier.trim().length < 5 || busy}
          onClick={() => {
            setBusy(true);
            setTimeout(() => navigate({ to: "/forgot-password/otp" }), 600);
          }}
        >
          {busy ? "Sending…" : "Send reset code"}
        </PrimaryButton>
      </div>
    </AuthShell>
  );
}
