import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, Eye, EyeOff, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  AuthField,
  AuthShell,
  PrimaryButton,
  authInputClass,
} from "@/components/kipit/AuthShell";
import { passwordChecks, passwordStrength, signupDraft } from "@/lib/auth-data";
import { logSignupFunnel } from "@/lib/api";

export const Route = createFileRoute("/signup_/password")({
  head: () => ({
    meta: [
      { title: "Create your password — Kipit" },
      { name: "description", content: "Choose a strong password to protect your Kipit account." },
      { property: "og:title", content: "Create your password — Kipit" },
      { property: "og:description", content: "Choose a strong password for your account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CreatePassword,
});

function CreatePassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState(signupDraft.password);
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);

  useEffect(() => {
    void logSignupFunnel({
      step: "password",
      email: signupDraft.email || undefined,
      deviceId: signupDraft.deviceId,
    });
  }, []);

  const checks = passwordChecks(password);
  const strength = passwordStrength(password);
  const allOk = checks.every((c) => c.ok);
  const match = confirm.length > 0 && confirm === password;

  const continueSignup = () => {
    if (!allOk || !match) return;
    signupDraft.password = password;
    void navigate({ to: "/signup/pin" });
  };

  return (
    <AuthShell
      back="/signup/details"
      step={5}
      steps={7}
      title="Create a password"
      subtitle="Your password protects access to your Kipit account."
    >
      <div className="space-y-4">
        <AuthField label="Password">
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${authInputClass} pr-12`}
              placeholder="••••••••"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute inset-y-0 right-3 flex items-center text-brand-foreground/60"
              aria-label={show ? "Hide password" : "Show password"}
            >
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </AuthField>

        {password ? (
          <div>
            <div className="flex gap-1.5">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`h-1 flex-1 rounded-full ${i < strength.score ? strength.tone : "bg-white/15"}`}
                />
              ))}
            </div>
            <p className="mt-2 text-xs text-brand-foreground/65">Strength: {strength.label}</p>
          </div>
        ) : null}

        <ul className="space-y-1.5 rounded-xl border border-white/12 bg-white/8 p-4">
          {checks.map((c) => (
            <li key={c.label} className="flex items-center gap-2 text-xs text-brand-foreground/75">
              {c.ok ? (
                <Check className="size-3.5 text-gold" />
              ) : (
                <X className="size-3.5 text-brand-foreground/40" />
              )}
              {c.label}
            </li>
          ))}
        </ul>

        <AuthField
          label="Confirm password"
          error={confirm && !match ? "Passwords don't match." : null}
        >
          <input
            type={show ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={authInputClass}
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </AuthField>
      </div>

      <div className="mt-8">
        <PrimaryButton disabled={!allOk || !match} onClick={continueSignup}>
          Continue
        </PrimaryButton>
      </div>
    </AuthShell>
  );
}
