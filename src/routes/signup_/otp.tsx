import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { AuthShell, OtpInput, PrimaryButton } from "@/components/kipit/AuthShell";
import { ApiError, logSignupFunnel, requestOtp, verifySignupOtp } from "@/lib/api";
import { signupDraft } from "@/lib/auth-data";

export const Route = createFileRoute("/signup_/otp")({
  head: () => ({
    meta: [
      { title: "Verify your email — Kipit" },
      {
        name: "description",
        content: "Enter the six-digit code we sent to your email to verify your Kipit sign-up.",
      },
      { property: "og:title", content: "Verify your email — Kipit" },
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
  const [resendBusy, setResendBusy] = useState(false);

  useEffect(() => {
    void logSignupFunnel({
      step: "otp",
      ...(signupDraft.email ? { email: signupDraft.email } : {}),
      deviceId: signupDraft.deviceId,
    });
  }, []);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const verifyCode = useCallback(
    async (value: string) => {
      if (value.length !== 6 || !signupDraft.email) return;
      setStatus("validating");
      signupDraft.otp = value;
      try {
        await verifySignupOtp(signupDraft.email, value);
        void navigate({ to: "/signup/details" });
      } catch {
        setStatus(seconds <= 0 ? "expired" : "invalid");
      }
    },
    [navigate, seconds],
  );

  const updateCode = (value: string) => {
    setCode(value);
    setStatus("idle");
    if (value.length === 6) void verifyCode(value);
  };

  const resend = async () => {
    if (!signupDraft.email || seconds > 0 || resendBusy) return;
    setResendBusy(true);
    setSeconds(45);
    try {
      await requestOtp(signupDraft.email, "SIGNUP");
      setCode("");
      setStatus("idle");
    } catch (err) {
      setStatus("invalid");
      setSeconds(0);
      if (err instanceof ApiError) {
        /* keep invalid state */
      }
    } finally {
      setResendBusy(false);
    }
  };

  const masked = signupDraft.email || "your email";

  return (
    <AuthShell
      back="/signup/email"
      step={3}
      steps={7}
      title="Enter your code"
      subtitle={`We sent a six-digit code to ${masked}.`}
    >
      <OtpInput value={code} onChange={updateCode} invalid={status === "invalid" || status === "expired"} />

      <p className="mt-4 min-h-5 text-center text-xs">
        {status === "validating" ? (
          <span className="text-brand-foreground/70">Verifying code…</span>
        ) : status === "invalid" ? (
          <span className="font-semibold text-red-400">The code you entered is incorrect.</span>
        ) : status === "expired" ? (
          <span className="font-semibold text-red-400">This code has expired. Request a new one.</span>
        ) : (
          <span className="text-brand-foreground/55">Enter the six-digit code from your email.</span>
        )}
      </p>

      <div className="mt-7 space-y-4">
        <PrimaryButton disabled={code.length !== 6 || status === "validating"} onClick={() => void verifyCode(code)}>
          Verify
        </PrimaryButton>
        <div className="flex items-center justify-between text-xs">
          {seconds > 0 || resendBusy ? (
            <span className="text-brand-foreground/55">
              {resendBusy ? "Sending…" : `Resend code in 0:${String(seconds).padStart(2, "0")}`}
            </span>
          ) : (
            <button type="button" onClick={() => void resend()} className="font-semibold text-gold">
              Resend code
            </button>
          )}
          <Link to="/signup/email" className="font-semibold text-brand-foreground/80">
            Change email
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
