import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthShell, OtpInput, PrimaryButton } from "@/components/kipit/AuthShell";
import { DEMO_OTP } from "@/lib/auth-data";

export const Route = createFileRoute("/forgot-password_/otp")({
  head: () => ({
    meta: [
      { title: "Verify reset code — Kipit" },
      { name: "description", content: "Enter the six-digit reset code we sent you to continue resetting your password." },
      { property: "og:title", content: "Verify reset code — Kipit" },
      { property: "og:description", content: "Enter your six-digit reset code." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResetOtp,
});

function ResetOtp() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "validating" | "invalid">("idle");
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
      if (code === DEMO_OTP) navigate({ to: "/forgot-password/new" });
      else setStatus("invalid");
    }, 700);
    return () => clearTimeout(t);
  }, [code, navigate]);

  return (
    <AuthShell
      back="/forgot-password"
      title="Enter your reset code"
      subtitle="We sent a six-digit code to your registered phone and email."
    >
      <OtpInput value={code} onChange={(v) => { setCode(v); setStatus("idle"); }} invalid={status === "invalid"} />

      <p className="mt-4 min-h-5 text-center text-xs">
        {status === "validating" ? (
          <span className="text-brand-foreground/70">Verifying code…</span>
        ) : status === "invalid" ? (
          <span className="[color:oklch(0.8_0.14_25)]">The code you entered is incorrect.</span>
        ) : (
          <span className="text-brand-foreground/55">Demo code: {DEMO_OTP}</span>
        )}
      </p>

      <div className="mt-7 space-y-4">
        <PrimaryButton disabled={code.length !== 6 || status === "validating"} onClick={() => setCode(code)}>
          Verify
        </PrimaryButton>
        <div className="text-center text-xs">
          {seconds > 0 ? (
            <span className="text-brand-foreground/55">
              Resend code in 0:{String(seconds).padStart(2, "0")}
            </span>
          ) : (
            <button type="button" onClick={() => { setSeconds(45); setCode(""); }} className="font-semibold text-gold">
              Resend code
            </button>
          )}
        </div>
      </div>
    </AuthShell>
  );
}
