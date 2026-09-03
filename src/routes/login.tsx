import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Fingerprint } from "lucide-react";
import { useState } from "react";
import {
  AuthField,
  AuthShell,
  PrimaryButton,
  authInputClass,
} from "@/components/kipit/AuthShell";
import { DEMO_IDENTIFIER, DEMO_PASSWORD } from "@/lib/auth-data";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in to Kipit" },
      { name: "description", content: "Access your Kipit call account, fixed plans and portfolio." },
      { property: "og:title", content: "Log in to Kipit" },
      { property: "og:description", content: "Access your savings and investment dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState(DEMO_IDENTIFIER);
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const locked = attempts >= 3;

  const submit = () => {
    if (locked) return;
    setBusy(true);
    setError(null);
    setTimeout(() => {
      setBusy(false);
      if (password === DEMO_PASSWORD || password.length >= 8) {
        navigate({ to: "/login/biometric" });
        return;
      }
      const next = attempts + 1;
      setAttempts(next);
      setError(
        next >= 3
          ? "Your account is temporarily locked after 3 failed attempts. Reset your password to continue."
          : `Incorrect credentials. ${3 - next} attempt${3 - next === 1 ? "" : "s"} remaining.`,
      );
    }, 700);
  };

  return (
    <AuthShell
      back="/welcome"
      title="Welcome back"
      subtitle="Log in to continue growing your money."
      footer={
        <p className="text-center text-sm text-brand-foreground/70">
          New to Kipit?{" "}
          <Link to="/signup" className="font-semibold text-gold">
            Create an account
          </Link>
        </p>
      }
    >
      <div className="space-y-4">
        <AuthField label="Phone or email">
          <input
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className={authInputClass}
            placeholder="you@example.com"
          />
        </AuthField>
        <AuthField label="Password" error={error}>
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
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-xs font-semibold text-gold">
            Forgot password?
          </Link>
        </div>
      </div>

      <div className="mt-7 space-y-3">
        <PrimaryButton disabled={!identifier || password.length < 4 || busy || locked} onClick={submit}>
          {busy ? "Signing in…" : "Log in"}
        </PrimaryButton>
        <button
          type="button"
          onClick={() => navigate({ to: "/login/biometric" })}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 px-5 py-3.5 text-sm font-semibold transition hover:bg-white/10"
        >
          <Fingerprint className="size-4" /> Use biometrics
        </button>
        <p className="text-center text-[11px] text-brand-foreground/50">
          Demo password: {DEMO_PASSWORD}
        </p>
      </div>
    </AuthShell>
  );
}
