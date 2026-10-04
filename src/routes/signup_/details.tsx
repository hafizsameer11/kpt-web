import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  AuthField,
  AuthShell,
  PrimaryButton,
  authInputClass,
} from "@/components/kipit/AuthShell";
import { signupDraft } from "@/lib/auth-data";
import { ApiError, logSignupFunnel, validateReferralCode } from "@/lib/api";

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
  const [referralOk, setReferralOk] = useState(false);
  const [referralBusy, setReferralBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  useEffect(() => {
    void logSignupFunnel({
      step: "details",
      ...(signupDraft.email ? { email: signupDraft.email } : {}),
      deviceId: signupDraft.deviceId,
    });
  }, []);

  const dobOk = /^\d{4}-\d{2}-\d{2}$/.test(dob.trim());
  const valid = first.trim().length > 1 && last.trim().length > 1 && dobOk;
  const adultMax = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d.toISOString().slice(0, 10);
  })();
  const adultMin = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 100);
    return d.toISOString().slice(0, 10);
  })();

  const applyReferral = async () => {
    const code = referral.trim().toUpperCase();
    if (code.length < 4) {
      setReferralOk(false);
      setReferralNote("Enter a referral code of at least 4 characters, or leave it blank.");
      return;
    }
    setReferralBusy(true);
    setReferralNote(null);
    try {
      const result = await validateReferralCode(code);
      if (!result.valid) {
        setReferralOk(false);
        setReferralNote("That referral code doesn’t match any Kipit account.");
        return;
      }
      setReferral(result.code || code);
      setReferralOk(true);
      setReferralNote(
        result.inviterFirstName
          ? `Referral applied — invited by ${result.inviterFirstName}.`
          : "Referral code applied.",
      );
    } catch (err) {
      setReferralOk(false);
      setReferralNote(
        err instanceof ApiError ? err.message : "Could not verify that referral code.",
      );
    } finally {
      setReferralBusy(false);
    }
  };

  const submit = () => {
    if (!dobOk) {
      setError("Select your date of birth from the calendar.");
      return;
    }
    const born = new Date(dob.trim());
    const age = (Date.now() - born.getTime()) / (365.25 * 24 * 3600 * 1000);
    if (Number.isNaN(born.getTime()) || age < 18) {
      setError("You must be at least 18 years old to open a Kipit account.");
      return;
    }
    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits) {
      if (phoneDigits.length !== 11) {
        setPhoneError("Phone number must be exactly 11 digits, or leave it blank.");
        return;
      }
    }
    if (referral.trim() && !referralOk) {
      setReferralNote("Apply a valid referral code, or clear the field to continue without one.");
      return;
    }
    signupDraft.firstName = first.trim();
    signupDraft.middleName = middle.trim();
    signupDraft.lastName = last.trim();
    signupDraft.dateOfBirth = dob.trim();
    signupDraft.phone = phoneDigits;
    signupDraft.referral = referralOk ? referral.trim() : "";
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
          hint="Use the calendar picker · YYYY-MM-DD · you must be 18+"
          error={error}
        >
          <input
            type="date"
            value={dob}
            min={adultMin}
            max={adultMax}
            onChange={(e) => {
              setDob(e.target.value);
              setError(null);
            }}
            onClick={(e) => {
              const el = e.currentTarget;
              if (typeof el.showPicker === "function") {
                try {
                  el.showPicker();
                } catch {
                  /* ignore if browser blocks programmatic picker */
                }
              }
            }}
            className={authInputClass}
            autoComplete="bday"
            aria-label="Date of birth"
          />
        </AuthField>
        <AuthField
          label="Mobile phone (optional)"
          hint="11-digit Nigerian number for OTP and account recovery"
          error={phoneError}
        >
          <input
            value={phone}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
              setPhone(digits);
              setPhoneError(null);
            }}
            className={authInputClass}
            placeholder="08030000000"
            inputMode="numeric"
            autoComplete="tel"
            maxLength={11}
          />
        </AuthField>
        <AuthField
          label="Referral code (optional)"
          error={referralNote && !referralOk ? referralNote : null}
          hint={
            referralOk && referralNote
              ? referralNote
              : "Have a friend's code? Apply it to verify — leave blank to skip."
          }
        >
          <div className="flex gap-2">
            <input
              value={referral}
              onChange={(e) => {
                setReferral(e.target.value.toUpperCase());
                setReferralOk(false);
                setReferralNote(null);
              }}
              className={`${authInputClass} flex-1 uppercase`}
              placeholder="KIPIT-XXXX"
            />
            <button
              type="button"
              disabled={referralBusy}
              onClick={() => void applyReferral()}
              className="rounded-xl border border-white/20 px-4 text-xs font-semibold transition hover:bg-white/10 disabled:opacity-40"
            >
              {referralBusy ? "…" : "Apply"}
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
