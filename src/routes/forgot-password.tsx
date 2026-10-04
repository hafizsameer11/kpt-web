import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  AuthField,
  AuthShell,
  PrimaryButton,
  authInputClass,
} from "@/components/kipit/AuthShell";
import {
  ApiError,
  checkEmailAvailable,
  getStoredUser,
  isValidEmailFormat,
  requestOtp,
} from "@/lib/api";

const RESET_TARGET_KEY = "kipit:password-reset-target";

export const Route = createFileRoute("/forgot-password")({
  validateSearch: (search: Record<string, unknown>) => ({
    email: typeof search["email"] === "string" ? search["email"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Forgot your password — Kipit" },
      {
        name: "description",
        content: "Request a reset code to regain access to your Kipit account.",
      },
      { property: "og:title", content: "Forgot your password — Kipit" },
      { property: "og:description", content: "Request a reset code for your Kipit account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const sessionEmail = useMemo(() => {
    const fromSearch = search.email?.trim().toLowerCase() || "";
    const fromSession = getStoredUser()?.email?.trim().toLowerCase() || "";
    return fromSearch || fromSession || "";
  }, [search.email]);
  const lockedToSession = Boolean(sessionEmail && getStoredUser()?.email);
  const [identifier, setIdentifier] = useState(sessionEmail);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailOk = isValidEmailFormat(identifier);

  const send = async () => {
    const target = identifier.trim().toLowerCase();
    if (!isValidEmailFormat(target) || busy) {
      if (!isValidEmailFormat(target)) {
        setError("Enter a valid email address (e.g. you@example.com).");
      }
      return;
    }
    // Change-password from Security: only the signed-in account email may proceed.
    if (lockedToSession && target !== sessionEmail) {
      setError("Enter the email on your Kipit account to continue.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      // Web-only guard using existing email-available endpoint (no API contract change).
      const { available } = await checkEmailAvailable(target);
      if (available) {
        setError("No Kipit account found for that email.");
        return;
      }
      await requestOtp(target, "PASSWORD_RESET");
      window.sessionStorage.setItem(RESET_TARGET_KEY, target);
      void navigate({ to: "/forgot-password/otp" });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not send a reset code. Check the email and try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      back={lockedToSession ? "/settings/security" : "/login"}
      title="Reset your password"
      subtitle={
        lockedToSession
          ? "We'll send a reset code to the email on your Kipit account."
          : "Enter the email linked to your Kipit account and we'll send a reset code."
      }
    >
      <AuthField label="Email" error={error}>
        <input
          value={identifier}
          type="email"
          inputMode="email"
          autoComplete="email"
          readOnly={lockedToSession}
          onChange={(e) => {
            if (lockedToSession) return;
            setIdentifier(e.target.value);
            setError(null);
          }}
          className={`${authInputClass}${lockedToSession ? " cursor-not-allowed opacity-90" : ""}`}
          placeholder="you@example.com"
        />
      </AuthField>

      <div className="mt-8">
        <PrimaryButton
          disabled={
            !emailOk ||
            busy ||
            (lockedToSession && identifier.trim().toLowerCase() !== sessionEmail)
          }
          onClick={() => void send()}
        >
          {busy ? "Sending…" : "Send reset code"}
        </PrimaryButton>
      </div>
    </AuthShell>
  );
}
