import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  AuthField,
  AuthShell,
  PrimaryButton,
  authInputClass,
} from "@/components/kipit/AuthShell";
import { signupDraft } from "@/lib/auth-data";
import {
  ApiError,
  checkEmailAvailable,
  isValidEmailFormat,
  logSignupFunnel,
  requestOtp,
} from "@/lib/api";

export const Route = createFileRoute("/signup_/email")({
  validateSearch: (search: Record<string, unknown>) => ({
    gift: typeof search["gift"] === "string" ? search["gift"] : undefined,
  }),
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
  const { gift } = Route.useSearch();
  const [email, setEmail] = useState(signupDraft.email);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (gift && typeof window !== "undefined") {
      window.sessionStorage.setItem("kipit:pending-gift-claim", gift);
    }
  }, [gift]);

  const valid = isValidEmailFormat(email);

  const submit = async () => {
    if (!valid || busy) {
      if (!valid) setError("Enter a valid email address.");
      return;
    }
    setBusy(true);
    setError(null);
    const target = email.trim().toLowerCase();
    signupDraft.email = target;
    try {
      const { available } = await checkEmailAvailable(target);
      if (!available) {
        setError("This email is already associated with a Kipit account. Log in instead.");
        setBusy(false);
        return;
      }
      await requestOtp(target, "SIGNUP");
      void logSignupFunnel({
        step: "email",
        email: target,
        deviceId: signupDraft.deviceId,
      });
      void navigate({ to: "/signup/otp" });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not send verification code.");
      setBusy(false);
    }
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
        Used for statements and alerts. Add a phone number later.
      </p>

      <div className="mt-8">
        <PrimaryButton disabled={!valid || busy} onClick={() => void submit()}>
          {busy ? "Sending code…" : "Continue"}
        </PrimaryButton>
      </div>
    </AuthShell>
  );
}
