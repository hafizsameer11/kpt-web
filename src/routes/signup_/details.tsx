import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  AuthField,
  AuthShell,
  PrimaryButton,
  authInputClass,
} from "@/components/kipit/AuthShell";
import { signupDraft } from "@/lib/auth-data";

export const Route = createFileRoute("/signup_/details")({
  head: () => ({
    meta: [
      { title: "Your personal details — Kipit" },
      { name: "description", content: "Tell Kipit your name and optional referral code to personalise your account." },
      { property: "og:title", content: "Your personal details — Kipit" },
      { property: "og:description", content: "Add your name and referral code." },
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
  const [referral, setReferral] = useState(signupDraft.referral);
  const [referralNote, setReferralNote] = useState<string | null>(null);

  const valid = first.trim().length > 1 && last.trim().length > 1;

  const submit = () => {
    signupDraft.firstName = first.trim();
    signupDraft.middleName = middle.trim();
    signupDraft.lastName = last.trim();
    signupDraft.referral = referral.trim();
    navigate({ to: "/signup/password" });
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
          <input value={first} onChange={(e) => setFirst(e.target.value)} className={authInputClass} placeholder="Adaeze" />
        </AuthField>
        <AuthField label="Middle name (optional)">
          <input value={middle} onChange={(e) => setMiddle(e.target.value)} className={authInputClass} placeholder="Ngozi" />
        </AuthField>
        <AuthField label="Last name *">
          <input value={last} onChange={(e) => setLast(e.target.value)} className={authInputClass} placeholder="Okonkwo" />
        </AuthField>
        <AuthField
          label="Referral code (optional)"
          hint={referralNote ?? "Have a friend's code? Add it now — it won't block your sign-up."}
        >
          <div className="flex gap-2">
            <input
              value={referral}
              onChange={(e) => { setReferral(e.target.value.toUpperCase()); setReferralNote(null); }}
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
