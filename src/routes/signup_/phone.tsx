import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  AuthField,
  AuthShell,
  PrimaryButton,
  authInputClass,
} from "@/components/kipit/AuthShell";
import { COUNTRIES, signupDraft } from "@/lib/auth-data";

export const Route = createFileRoute("/signup_/phone")({
  head: () => ({
    meta: [
      { title: "Enter your phone number — Kipit" },
      { name: "description", content: "Verify your phone number to continue creating your Kipit account." },
      { property: "og:title", content: "Enter your phone number — Kipit" },
      { property: "og:description", content: "Verify your phone number to continue sign-up." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PhoneEntry,
});

function PhoneEntry() {
  const navigate = useNavigate();
  const [dial, setDial] = useState(signupDraft.dial);
  const [phone, setPhone] = useState(signupDraft.phone);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const country = COUNTRIES.find((c) => c.dial === dial) ?? COUNTRIES[0];
  const digits = phone.replace(/\D/g, "");
  const valid = digits.length === country.digits;

  const submit = () => {
    if (!valid) {
      setError(`Enter a valid ${country.name} number (${country.digits} digits).`);
      return;
    }
    setBusy(true);
    signupDraft.dial = dial;
    signupDraft.phone = digits;
    setTimeout(() => navigate({ to: "/signup/otp" }), 500);
  };

  return (
    <AuthShell
      back="/signup"
      step={2}
      steps={7}
      title="What's your number?"
      subtitle="We'll text you a six-digit code to confirm it's really you."
    >
      <AuthField label="Phone number" error={error}>
        <div className="flex gap-2">
          <select
            value={dial}
            onChange={(e) => {
              setDial(e.target.value);
              setError(null);
            }}
            className={`${authInputClass} w-28 appearance-none pr-2 [&>option]:text-foreground`}
            aria-label="Country"
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.dial}>
                {c.flag} {c.dial}
              </option>
            ))}
          </select>
          <input
            value={phone}
            inputMode="tel"
            placeholder="801 234 5678"
            onChange={(e) => {
              setPhone(e.target.value.replace(/[^\d\s]/g, ""));
              setError(null);
            }}
            className={`${authInputClass} flex-1`}
          />
        </div>
      </AuthField>

      <p className="mt-4 text-[11px] leading-relaxed text-brand-foreground/55">
        By continuing you agree to Kipit's Terms &amp; Conditions and confirm you have read the
        Privacy Policy. Message rates may apply.
      </p>

      <div className="mt-8">
        <PrimaryButton disabled={!valid || busy} onClick={submit}>
          {busy ? "Sending code…" : "Continue"}
        </PrimaryButton>
      </div>
    </AuthShell>
  );
}
