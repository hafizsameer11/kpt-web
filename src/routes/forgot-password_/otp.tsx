import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AuthShell, OtpInput, PrimaryButton } from "@/components/kipit/AuthShell";
import { ApiError, requestOtp, verifyOtp } from "@/lib/api";

const RESET_TARGET_KEY = "kipit:password-reset-target";

export const Route = createFileRoute("/forgot-password_/otp")({
  head: () => ({
    meta: [
      { title: "Verify reset code — Kipit" },
      {
        name: "description",
        content: "Enter the six-digit reset code we sent you to continue resetting your password.",
      },
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
  const [resendError, setResendError] = useState<string | null>(null);
  const verifying = useRef(false);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  useEffect(() => {
    if (code.length !== 6 || verifying.current) return;
    verifying.current = true;
    setStatus("validating");
    const target =
      (typeof window !== "undefined" && window.sessionStorage.getItem(RESET_TARGET_KEY)) || "";
    void (async () => {
      try {
        if (!target) throw new Error("missing target");
        await verifyOtp(target, "PASSWORD_RESET", code);
        window.sessionStorage.setItem("kipit:password-reset-code", code);
        void navigate({ to: "/forgot-password/new" });
      } catch {
        setStatus("invalid");
        verifying.current = false;
      }
    })();
  }, [code, navigate]);

  const resend = async () => {
    const target =
      (typeof window !== "undefined" && window.sessionStorage.getItem(RESET_TARGET_KEY)) || "";
    if (!target) {
      setResendError("Go back and enter your email or phone again.");
      return;
    }
    setResendError(null);
    try {
      await requestOtp(target, "PASSWORD_RESET");
      setSeconds(45);
      setCode("");
      setStatus("idle");
      verifying.current = false;
    } catch (err) {
      setResendError(err instanceof ApiError ? err.message : "Could not resend the code.");
    }
  };

  return (
    <AuthShell
      back="/forgot-password"
      title="Enter your reset code"
      subtitle="We sent a six-digit code to your registered phone and email."
    >
      <OtpInput
        value={code}
        onChange={(v) => {
          setCode(v);
          setStatus("idle");
          verifying.current = false;
        }}
        invalid={status === "invalid"}
      />

      <p className="mt-4 min-h-5 text-center text-xs">
        {status === "validating" ? (
          <span className="text-brand-foreground/70">Verifying code…</span>
        ) : status === "invalid" ? (
          <span className="[color:oklch(0.8_0.14_25)]">The code you entered is incorrect.</span>
        ) : resendError ? (
          <span className="[color:oklch(0.8_0.14_25)]">{resendError}</span>
        ) : (
          <span className="text-brand-foreground/55">Enter the six-digit code we sent you.</span>
        )}
      </p>

      <div className="mt-7 space-y-4">
        <PrimaryButton
          disabled={code.length !== 6 || status === "validating"}
          onClick={() => setCode(code)}
        >
          Verify
        </PrimaryButton>
        <div className="text-center text-xs">
          {seconds > 0 ? (
            <span className="text-brand-foreground/55">
              Resend code in 0:{String(seconds).padStart(2, "0")}
            </span>
          ) : (
            <button type="button" onClick={() => void resend()} className="font-semibold text-gold">
              Resend code
            </button>
          )}
        </div>
      </div>
    </AuthShell>
  );
}
