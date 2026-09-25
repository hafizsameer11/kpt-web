import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  AuthField,
  AuthShell,
  PrimaryButton,
  authInputClass,
} from "@/components/kipit/AuthShell";
import { signupDraft } from "@/lib/auth-data";
import { logSignupFunnel } from "@/lib/api";

export const Route = createFileRoute("/signup_/details")({
  head: () => ({
    meta: [
      { title: "Your personal details — Kipit" },
      {
        name: "description",
        content:
          "Tell Kipit your name, date of birth and optional phone or referral code to personalise your account.",
      },
      { property: "og:title", content: "Your personal details — Kipit" },
      { property: "og:description", content: "Add your name, date of birth and referral code." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PersonalInfo,
});

function PersonalInfo() {
  const navigate = useNavigate();
  const [first, setFirst] = useState(signupDraft.firstName);
  const [middle, setMiddle] = useState(signupDraft.middleName);
  const [last, setLast] = useState(signupDraft.lastName);
  const [dob, setDob] = useState(signupDraft.dateOfBirth);
  const [phone, setPhone] = useState(signupDraft.phone);
  const [referral, setReferral] = useState(signupDraft.referral);
  const [referralNote, setReferralNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void logSignupFunnel({
      step: "details",
      email: signupDraft.email || undefined,
      deviceId: signupDraft.deviceId,
    });
  }, []);

  const dobOk = /^\d{4}-\d{2}-\d{2}$/.test(dob.trim());
  const valid = first.trim().length > 1 && last.trim().length > 1 && dobOk;

  const submit = () => {
    if (!dobOk) {
      setError("Enter date of birth as YYYY-MM-DD.");
      return;
    }
    const born = new Date(dob.trim());
    const age = (Date.now() - born.getTime()) / (365.25 * 24 * 3600 * 1000);
    if (Number.isNaN(born.getTime()) || age < 18) {
      setError("You must be at least 18 years old to open a Kipit account.");
      return;
    }
    const phoneTrim = phone.trim();
    if (phoneTrim && (phoneTrim.length < 7 || phoneTrim.length > 20)) {
      setError("Enter a valid phone number (7–20 characters), or leave it blank.");
      return;
    }
    signupDraft.firstName = first.trim();
    signupDraft.middleName = middle.trim();
    signupDraft.lastName = last.trim();
    signupDraft.dateOfBirth = dob.trim();
    signupDraft.phone = phoneTrim;
    signupDraft.referral = referral.trim();
    void navigate({ to: "/signup/password" });
  };

  return (
    <AuthShell
      back="/signup/otp"
      step={4}
      steps={7}
      title="Tell us about you"
      subtitle="Use the names exactly as they appear on your official identification."
    >
      <div className="space-y-4">
        <AuthField label="First name *">
          <input
            value={first}
            onChange={(e) => setFirst(e.target.value)}
            className={authInputClass}
            placeholder="First name"
            autoComplete="given-name"
          />
        </AuthField>
        <AuthField label="Middle name (optional)">
          <input
            value={middle}
            onChange={(e) => setMiddle(e.target.value)}
            className={authInputClass}
            placeholder="Ngozi"
            autoComplete="additional-name"
          />
        </AuthField>
        <AuthField label="Last name *">
          <input
            value={last}
            onChange={(e) => setLast(e.target.value)}
            className={authInputClass}
            placeholder="Okonkwo"
            autoComplete="family-name"
          />
        </AuthField>
        <AuthField
          label="Date of birth *"
          hint="Format YYYY-MM-DD · required · you must be 18+"
          error={error}
        >
          <input
            value={dob}
            onChange={(e) => {
              setDob(e.target.value);
              setError(null);
            }}
            className={authInputClass}
            placeholder="1995-06-15"
            inputMode="numeric"
            autoComplete="bday"
          />
        </AuthField>
        <AuthField
          label="Mobile phone (optional)"
          hint="Nigerian number for OTP and account recovery"
        >
          <input
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setError(null);
            }}
            className={authInputClass}
            placeholder="0803 000 0000"
            inputMode="tel"
            autoComplete="tel"
          />
        </AuthField>
        <AuthField
          label="Referral code (optional)"
          hint={referralNote ?? "Have a friend's code? Add it now — it won't block your sign-up."}
        >
          <div className="flex gap-2">
            <input
              value={referral}
              onChange={(e) => {
                setReferral(e.target.value.toUpperCase());
                setReferralNote(null);
              }}
              className={`${authInputClass} flex-1 uppercase`}
              placeholder="KIPIT-XXXX"
            />
            <button
              type="button"
              onClick={() =>
                setReferralNote(
                  referral.trim().length >= 4
                    ? "Referral code applied."
                    : "We couldn't verify that code — you can continue without it.",
                )
              }
              className="rounded-xl border border-white/20 px-4 text-xs font-semibold transition hover:bg-white/10"
            >
              Apply
            </button>
          </div>
        </AuthField>
      </div>

      <div className="mt-8">
        <PrimaryButton disabled={!valid} onClick={submit}>
          Continue
        </PrimaryButton>
      </div>
    </AuthShell>
  );
}
