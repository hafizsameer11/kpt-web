import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useState } from "react";
import {
  AdminAuthShell,
  AdminField,
  AdminPrimaryButton,
  adminInputClass,
} from "@/components/kipit/AdminAuthShell";
import { ADMIN_EMAIL, ADMIN_PASSWORD, setPendingAdminEmail } from "@/lib/admin-auth-flow";

export const Route = createFileRoute("/admin_/login")({
  head: () => ({
    meta: [
      { title: "Admin sign in — Kipit console" },
      { name: "description", content: "Secure sign in for Kipit operators and administrators." },
      { property: "og:title", content: "Admin sign in — Kipit console" },
      { property: "og:description", content: "Secure sign in for Kipit operators." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const locked = attempts >= 3;

  const submit = () => {
    if (locked || busy) return;
    setBusy(true);
    setError(null);
    setTimeout(() => {
      setBusy(false);
      if (password === ADMIN_PASSWORD || password.length >= 8) {
        setPendingAdminEmail(email);
        navigate({ to: "/admin/verify" });
        return;
      }
      const next = attempts + 1;
      setAttempts(next);
      setError(
        next >= 3
          ? "Account locked after 3 failed attempts. Contact the security team to reset access."
          : `Incorrect credentials. ${3 - next} attempt${3 - next === 1 ? "" : "s"} remaining.`,
      );
    }, 650);
  };

  return (
    <AdminAuthShell
      title="Operator sign in"
      subtitle="Use your Kipit staff account. Two-factor verification is required on every sign in."
      footer={
        <p className="text-center text-[12px] text-brand-foreground/60">
          Lost access?{" "}
          <Link to="/admin/access-help" className="font-semibold text-gold">
            Request an access reset
          </Link>
        </p>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <AdminField label="Work email">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={adminInputClass}
            placeholder="you@kipit.com"
            autoComplete="username"
          />
        </AdminField>

        <AdminField label="Password" error={error}>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${adminInputClass} pr-12`}
              placeholder="••••••••"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-3 flex items-center text-brand-foreground/60"
            >
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </AdminField>

        <div className="pt-1">
          <AdminPrimaryButton type="submit" disabled={!email || password.length < 4 || busy || locked}>
            {busy ? "Checking…" : "Continue"}
          </AdminPrimaryButton>
        </div>
      </form>

      <div className="mt-5 flex items-start gap-2 rounded-xl border border-white/12 bg-white/5 p-3 text-[11px] text-brand-foreground/60">
        <Lock className="mt-0.5 size-3.5 shrink-0 text-gold" />
        <p>
          Demo access — {ADMIN_EMAIL} / {ADMIN_PASSWORD}
        </p>
      </div>
    </AdminAuthShell>
  );
}
