import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import {
  AuthField,
  AuthShell,
  PrimaryButton,
  authInputClass,
} from "@/components/kipit/AuthShell";
import {
  ApiError,
  claimGift,
  claimPendingGifts,
  isValidEmailFormat,
  loginWithPassword,
  tierNumber,
} from "@/lib/api";
import { setKycTier } from "@/lib/kyc-state";
import { refreshWalletFromApi } from "@/lib/wallet-balance";
import { hydrateLiveBalances } from "@/lib/live-balances";

const PENDING_GIFT_KEY = "kipit:pending-gift-claim";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    gift: typeof search["gift"] === "string" ? search["gift"] : undefined,
  }),
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
  const { gift: giftFromSearch } = Route.useSearch();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const locked = attempts >= 3;
  const emailOk = isValidEmailFormat(identifier);

  const submit = async () => {
    if (locked) return;
    setBusy(true);
    setError(null);
    setEmailError(null);
    try {
      const email = identifier.trim().toLowerCase();
      if (!isValidEmailFormat(email)) {
        setEmailError("Enter a valid email address (e.g. you@example.com).");
        return;
      }
      const session = await loginWithPassword(email, password);
      setKycTier(tierNumber(session.user.kycTier));
      await refreshWalletFromApi();
      await hydrateLiveBalances();
      const giftCode =
        giftFromSearch ||
        (typeof window !== "undefined"
          ? window.sessionStorage.getItem(PENDING_GIFT_KEY)
          : null);
      if (giftCode) {
        try {
          const claimed = await claimGift(giftCode);
          window.sessionStorage.removeItem(PENDING_GIFT_KEY);
          void navigate({
            to: "/portfolio/$holdingId",
            params: { holdingId: claimed.placementId },
            replace: true,
          });
          return;
        } catch {
          await claimPendingGifts().catch(() => undefined);
        }
      } else {
        await claimPendingGifts().catch(() => undefined);
      }
      navigate({ to: "/" });
    } catch (err) {
      const next = attempts + 1;
      setAttempts(next);
      setError(
        next >= 3
          ? "Your account is temporarily locked after 3 failed attempts. Reset your password to continue."
          : err instanceof ApiError
            ? err.message
            : `Incorrect credentials. ${3 - next} attempt${3 - next === 1 ? "" : "s"} remaining.`,
      );
    } finally {
      setBusy(false);
    }
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
        <AuthField label="Email" error={emailError}>
          <input
            value={identifier}
            type="email"
            inputMode="email"
            autoComplete="email"
            onChange={(e) => {
              setIdentifier(e.target.value);
              setEmailError(null);
            }}
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
        <PrimaryButton
          disabled={!emailOk || password.length < 4 || busy || locked}
          onClick={() => void submit()}
        >
          {busy ? "Signing in…" : "Log in"}
        </PrimaryButton>
      </div>
    </AuthShell>
  );
}
