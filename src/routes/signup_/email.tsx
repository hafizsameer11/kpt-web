import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  AuthField,
  AuthShell,
  PrimaryButton,
  authInputClass,
} from "@/components/kipit/AuthShell";
import { signupDraft } from "@/lib/auth-data";

export const Route = createFileRoute("/signup_/email")({
  head: () => ({
    meta: [
      { title: "Enter your email — Kipit" },
      {
        name: "description",
        content: "Verify your email address to continue creating your Kipit account.",
      },
      { property: "og:title", content: "Enter your email — Kipit" },
      { property: "og:description", content: "Verify your email to continue sign-up." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EmailEntry,
});

function EmailEntry() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(signupDraft.email);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

  const submit = () => {
    if (!valid) {
      setError("Enter a valid email address.");
      return;
    }
    setBusy(true);
    signupDraft.email = email.trim().toLowerCase();
    setTimeout(() => navigate({ to: "/signup/otp" }), 500);
  };

  return (
    <AuthShell
      back="/signup"
      step={2}
      steps={7}
      title="What's your email?"
      subtitle="We'll send you a six-digit code to confirm it's really you."
    >
      <AuthField label="Email address" error={error}>
        <input
          value={email}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          onChange={(e) => {
            setEmail(e.target.value);
            setError(null);
          }}
          className={`${authInputClass} min-w-0`}
        />
      </AuthField>

      <p className="mt-4 text-[11px] leading-relaxed text-brand-foreground/55">
        We'll use this email for your statements, receipts and security alerts. You can add a
        phone number later — no ID or documents needed to get in.
      </p>

      <div className="mt-8">
        <PrimaryButton disabled={!valid || busy} onClick={submit}>
          {busy ? "Sending code…" : "Continue"}
        </PrimaryButton>
      </div>
    </AuthShell>
  );
}
