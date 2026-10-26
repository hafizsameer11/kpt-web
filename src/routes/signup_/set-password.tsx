import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, Eye, EyeOff, X } from "lucide-react";
import { useState } from "react";
import {
  AuthField,
  AuthShell,
  PrimaryButton,
  authInputClass,
} from "@/components/kipit/AuthShell";
import { passwordChecks, passwordStrength } from "@/lib/auth-data";
import { ApiError, getStoredUser, setAccountPassword } from "@/lib/api";

export const Route = createFileRoute("/signup_/set-password")({
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
  component: SetPasswordAfterSocial,
});

function SetPasswordAfterSocial() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checks = passwordChecks(password);
  const strength = passwordStrength(password);
  const allOk = checks.every((c) => c.ok);
  const match = confirm.length > 0 && confirm === password;

  const continueOnboarding = async () => {
    if (!allOk || !match || busy) return;
    setBusy(true);
    setError(null);
    try {
      const data = await setAccountPassword(password, confirm);
      const user = data.user ?? getStoredUser();
      if (!user?.hasPin) {
        void navigate({ to: "/signup/pin" });
      } else {
        void navigate({ to: "/home" });
      }
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Could not save your password.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Create a password"
      subtitle="Your password protects access to your Kipit account."
    >
      <div className="space-y-4">
        <AuthField label="Password" error={error}>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
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
            <li
              key={c.label}
              className={`flex items-center gap-2 text-xs ${
                c.ok ? "text-brand-foreground/75" : "font-semibold text-red-400"
              }`}
            >
              {c.ok ? (
                <Check className="size-3.5 text-gold" />
              ) : (
                <X className="size-3.5 text-red-400" />
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
        <PrimaryButton disabled={!allOk || !match || busy} onClick={() => void continueOnboarding()}>
          {busy ? "Saving…" : "Continue"}
        </PrimaryButton>
      </div>
    </AuthShell>
  );
}
