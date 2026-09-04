import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { KeyRound, RefreshCw, Smartphone } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  AdminAuthShell,
  AdminPrimaryButton,
} from "@/components/kipit/AdminAuthShell";
import { ADMIN_OTP, getPendingAdminEmail } from "@/lib/admin-auth-flow";
import { startAdminSession } from "@/lib/admin-auth";

export const Route = createFileRoute("/admin_/verify")({
  head: () => ({
    meta: [
      { title: "Two-factor verification — Kipit console" },
      { name: "description", content: "Confirm the 6-digit code from your authenticator to open the Kipit admin console." },
      { property: "og:title", content: "Two-factor verification — Kipit console" },
      { property: "og:description", content: "Confirm your authenticator code to continue." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminVerify,
});

function AdminVerify() {
  const navigate = useNavigate();
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [seconds, setSeconds] = useState(45);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const email = getPendingAdminEmail();
  const code = digits.join("");

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const setDigit = (index: number, value: string) => {
    const clean = value.replace(/\D/g, "").slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = clean;
      return next;
    });
    setError(null);
    if (clean && index < 5) inputs.current[index + 1]?.focus();
  };

  const submit = () => {
    if (code.length < 6 || busy) return;
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      if (code === ADMIN_OTP) {
        startAdminSession(email);
        navigate({ to: "/admin" });
        return;
      }
      setError("That code isn't valid. Check your authenticator and try again.");
      setDigits(Array(6).fill(""));
      inputs.current[0]?.focus();
    }, 600);
  };

  return (
    <AdminAuthShell
      title="Two-factor verification"
      subtitle={`Enter the 6-digit code from your authenticator app for ${email}.`}
      footer={
        <button
          type="button"
          onClick={() => navigate({ to: "/admin/login" })}
          className="mx-auto block text-[12px] font-semibold text-brand-foreground/60 hover:text-brand-foreground"
        >
          Sign in with a different account
        </button>
      }
    >
      <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-white/12 bg-white/5 p-3 text-[12px] text-brand-foreground/70">
        <Smartphone className="size-4 shrink-0 text-gold" />
        <p>Codes refresh every 30 seconds on your registered device.</p>
      </div>

      <div className="flex justify-between gap-2">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              inputs.current[i] = el;
            }}
            value={d}
            inputMode="numeric"
            aria-label={`Digit ${i + 1}`}
            onChange={(e) => setDigit(i, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !digits[i] && i > 0) inputs.current[i - 1]?.focus();
            }}
            className={`h-14 w-full rounded-xl border bg-white/5 text-center font-display text-xl font-bold text-brand-foreground outline-none transition ${
              error ? "border-destructive/70" : "border-white/20 focus:border-gold/70 focus:bg-white/10"
            }`}
          />
        ))}
      </div>

      {error ? <p className="mt-3 text-[12px] text-destructive">{error}</p> : null}

      <div className="mt-5 space-y-3">
        <AdminPrimaryButton disabled={code.length < 6 || busy} onClick={submit}>
          {busy ? "Verifying…" : "Verify and open console"}
        </AdminPrimaryButton>
        <button
          type="button"
          disabled={seconds > 0}
          onClick={() => setSeconds(45)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-[13px] font-semibold transition hover:bg-white/10 disabled:opacity-50"
        >
          <RefreshCw className="size-4" />
          {seconds > 0 ? `Resend code in ${seconds}s` : "Send a new code"}
        </button>
      </div>

      <p className="mt-5 flex items-center gap-1.5 text-[11px] text-brand-foreground/50">
        <KeyRound className="size-3.5" /> Demo code — {ADMIN_OTP}
      </p>
    </AdminAuthShell>
  );
}
