import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthShell, OtpInput, PrimaryButton } from "@/components/kipit/AuthShell";
import { DEMO_OTP, signupDraft } from "@/lib/auth-data";

export const Route = createFileRoute("/signup_/otp")({
  head: () => ({
    meta: [
      { title: "Verify your phone — Kipit" },
      { name: "description", content: "Enter the six-digit code we sent to your phone to verify your Kipit sign-up." },
      { property: "og:title", content: "Verify your phone — Kipit" },
      { property: "og:description", content: "Enter your six-digit verification code." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SignupOtp,
});

function SignupOtp() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "validating" | "invalid" | "expired">("idle");
  const [seconds, setSeconds] = useState(45);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  useEffect(() => {
    if (code.length !== 6) return;
    setStatus("validating");
    const t = setTimeout(() => {
      if (code === DEMO_OTP) navigate({ to: "/signup/details" });
      else if (seconds <= 0) setStatus("expired");
      else setStatus("invalid");
    }, 700);
    return () => clearTimeout(t);
  }, [code, navigate, seconds]);

  const masked = signupDraft.phone
    ? `${signupDraft.dial} ${signupDraft.phone.replace(/^(\d{3})\d+(\d{2})$/, "$1••••$2")}`
    : "your phone";

  return (
    <AuthShell
      back="/signup/phone"
      step={3}
      steps={7}
      title="Enter your code"
      subtitle={`We sent a six-digit code to ${masked}.`}
    >
      <OtpInput value={code} onChange={(v) => { setCode(v); setStatus("idle"); }} invalid={status === "invalid" || status === "expired"} />

      <p className="mt-4 min-h-5 text-center text-xs">
        {status === "validating" ? (
          <span className="text-brand-foreground/70">Verifying code…</span>
        ) : status === "invalid" ? (
          <span className="[color:oklch(0.8_0.14_25)]">The code you entered is incorrect.</span>
        ) : status === "expired" ? (
          <span className="[color:oklch(0.8_0.14_25)]">This code has expired. Request a new one.</span>
        ) : (
          <span className="text-brand-foreground/55">Demo code: {DEMO_OTP}</span>
        )}
      </p>

      <div className="mt-7 space-y-4">
        <PrimaryButton disabled={code.length !== 6 || status === "validating"} onClick={() => setCode(code)}>
          Verify
        </PrimaryButton>
        <div className="flex items-center justify-between text-xs">
          {seconds > 0 ? (
            <span className="text-brand-foreground/55">Resend code in 0:{String(seconds).padStart(2, "0")}</span>
          ) : (
            <button
              type="button"
              onClick={() => { setSeconds(45); setCode(""); setStatus("idle"); }}
              className="font-semibold text-gold"
            >
              Resend code
            </button>
          )}
          <Link to="/signup/phone" className="font-semibold text-brand-foreground/80">
            Change number
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
