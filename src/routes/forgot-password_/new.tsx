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
import { ApiError, resetPassword } from "@/lib/api";

const RESET_TARGET_KEY = "kipit:password-reset-target";
const RESET_CODE_KEY = "kipit:password-reset-code";

export const Route = createFileRoute("/forgot-password_/new")({
  head: () => ({
    meta: [
      { title: "Set a new password — Kipit" },
      { name: "description", content: "Choose a new password for your Kipit account." },
      { property: "og:title", content: "Set a new password — Kipit" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NewPassword,
});

function NewPassword() {
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

  const submit = async () => {
    if (!allOk || !match || busy) return;
    setBusy(true);
    setError(null);
    try {
      const target = window.sessionStorage.getItem(RESET_TARGET_KEY) || "";
      const code = window.sessionStorage.getItem(RESET_CODE_KEY) || "";
      if (!target || !code) throw new Error("Reset session expired. Start again.");
      await resetPassword({ target, code, password });
      window.sessionStorage.removeItem(RESET_TARGET_KEY);
      window.sessionStorage.removeItem(RESET_CODE_KEY);
      navigate({ to: "/forgot-password/success" });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : err instanceof Error ? err.message : "Could not reset password.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      back="/forgot-password/otp"
      title="Set a new password"
      subtitle="Choose a password you haven't used on Kipit before."
    >
      <div className="space-y-4">
        <AuthField label="New password">
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${authInputClass} pr-12`}
              placeholder="••••••••"
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
              {c.ok ? <Check className="size-3.5 text-gold" /> : <X className="size-3.5 text-brand-foreground/40" />}
              {c.label}
            </li>
          ))}
        </ul>

        <AuthField label="Confirm new password" error={confirm && !match ? "Passwords don't match." : null}>
          <input
            type={show ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={authInputClass}
            placeholder="••••••••"
          />
        </AuthField>
        {error ? <p className="text-xs [color:oklch(0.8_0.14_25)]">{error}</p> : null}
      </div>

      <div className="mt-8">
        <PrimaryButton disabled={!allOk || !match || busy} onClick={() => void submit()}>
          {busy ? "Updating…" : "Reset password"}
        </PrimaryButton>
      </div>
    </AuthShell>
  );
}
