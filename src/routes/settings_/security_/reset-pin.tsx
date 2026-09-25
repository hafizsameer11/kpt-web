import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, MessageSquareLock, ShieldCheck, UserCheck } from "lucide-react";
import { useState } from "react";
import { SettingsPage } from "@/components/kipit/SettingsPage";
import { useDisplayProfile } from "@/lib/profile-live";
import { ApiError, requestPinReset, resetTransactionPin } from "@/lib/api";

export const Route = createFileRoute("/settings_/security_/reset-pin")({
  head: () => ({
    meta: [
      { title: "Reset Transaction PIN | Kipit" },
      {
        name: "description",
        content:
          "Forgot your Kipit transaction PIN? Confirm your identity, verify the OTP and set a new PIN.",
      },
      { property: "og:title", content: "Reset Transaction PIN | Kipit" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResetPinScreen,
});

function ResetPinScreen() {
  const navigate = useNavigate();
  const profile = useDisplayProfile();
  const [step, setStep] = useState(0);
  const [dob, setDob] = useState("");
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [hint, setHint] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const steps = ["Identity", "Verification", "New PIN", "Done"];

  async function next() {
    setError(null);
    if (step === 0) {
      if (dob.trim().length < 4) return setError("Enter your date of birth to continue.");
      setBusy(true);
      try {
        const res = await requestPinReset(dob.trim());
        setHint(res.targetHint || profile.phone || "your email");
        setStep(1);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Could not start PIN reset.");
      } finally {
        setBusy(false);
      }
      return;
    }
    if (step === 1) {
      if (otp.length !== 6) return setError("Enter the 6-digit code.");
      setStep(2);
      return;
    }
    if (step === 2) {
      if (pin.length !== 4) return setError("Your PIN must be 4 digits.");
      if (confirm.length !== 4) return setError("Confirm your new PIN.");
      if (pin !== confirm) return setError("The PINs do not match.");
      setBusy(true);
      try {
        await resetTransactionPin({ code: otp, newPin: pin, confirmPin: confirm });
        setStep(3);
        window.setTimeout(() => navigate({ to: "/settings/security" }), 1800);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Could not reset PIN.");
      } finally {
        setBusy(false);
      }
    }
  }

  return (
    <SettingsPage
      title="Reset transaction PIN"
      eyebrow="MOB-147"
      backTo="/settings/security"
      backLabel="Security"
      subtitle="We verify your identity before a new PIN can be set."
    >
      <div className="mx-auto max-w-md md:max-w-4xl md:grid md:grid-cols-[minmax(0,1fr)_320px] md:items-start md:gap-6">
        <div className="min-w-0">
          <ol className="mb-4 flex items-center gap-1.5">
            {steps.map((s, i) => (
              <li key={s} className="flex-1">
                <span className={`block h-1 rounded-full ${i <= step ? "bg-gold" : "bg-border"}`} />
                <span
                  className={`mt-1.5 block text-[10px] font-bold uppercase tracking-wide ${
                    i <= step ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {s}
                </span>
              </li>
            ))}
          </ol>

          <section className="card-surface p-5">
            {step === 0 ? (
              <>
                <Head
                  icon={UserCheck}
                  title="Confirm your identity"
                  sub="Enter the date of birth on your Kipit account (YYYY-MM-DD)."
                />
                <input
                  autoFocus
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  placeholder="YYYY-MM-DD"
                  aria-label="Date of birth"
                  className="mt-4 w-full rounded-xl border border-border bg-secondary px-4 py-3 text-[14px] font-semibold outline-none focus:border-brand"
                />
              </>
            ) : null}

            {step === 1 ? (
              <>
                <Head
                  icon={MessageSquareLock}
                  title="Enter the 6-digit code"
                  sub={`We sent a one-time code to ${hint || "your email"}.`}
                />
                <input
                  autoFocus
                  inputMode="numeric"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="••••••"
                  aria-label="One-time code"
                  className="mt-4 w-full rounded-xl border border-border bg-secondary px-4 py-3 text-center text-[16px] font-bold tracking-[0.4em] outline-none focus:border-brand"
                />
              </>
            ) : null}

            {step === 2 ? (
              <>
                <Head icon={ShieldCheck} title="Set your new PIN" sub="Choose 4 digits you will remember." />
                <input
                  autoFocus
                  inputMode="numeric"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="New PIN"
                  aria-label="New PIN"
                  className="mt-4 w-full rounded-xl border border-border bg-secondary px-4 py-3 text-center text-[16px] font-bold tracking-[0.5em] outline-none focus:border-brand"
                />
                <input
                  inputMode="numeric"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="Confirm PIN"
                  aria-label="Confirm PIN"
                  className="mt-3 w-full rounded-xl border border-border bg-secondary px-4 py-3 text-center text-[16px] font-bold tracking-[0.5em] outline-none focus:border-brand"
                />
              </>
            ) : null}

            {step === 3 ? (
              <div className="flex flex-col items-center py-4 text-center">
                <span className="grid size-16 place-items-center rounded-full bg-emerald-500/12 text-emerald-600">
                  <CheckCircle2 className="size-9" strokeWidth={2.2} />
                </span>
                <p className="mt-4 font-display text-[18px] font-extrabold">PIN reset complete</p>
                <p className="mt-1.5 text-[12.5px] text-muted-foreground">
                  Your new PIN is active immediately.
                </p>
              </div>
            ) : null}

            {error ? (
              <p className="mt-3 text-center text-[12px] font-bold text-destructive">{error}</p>
            ) : null}

            {step < 3 ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void next()}
                className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press disabled:opacity-40"
              >
                {busy ? "Please wait…" : step === 2 ? "Set new PIN" : "Continue"}
              </button>
            ) : null}
          </section>
        </div>

        <aside className="hidden space-y-4 md:block">
          <section className="card-surface p-5">
            <p className="text-[12.5px] font-extrabold text-foreground">How the reset works</p>
            <ol className="mt-2 space-y-2">
              {[
                "Confirm the date of birth on your account.",
                "Enter the one-time code sent to you.",
                "Choose a new 4-digit PIN — active immediately.",
              ].map((t, i) => (
                <li key={t} className="flex gap-2.5 text-[12px] leading-relaxed text-muted-foreground">
                  <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-gold/15 text-[10px] font-extrabold text-gold">
                    {i + 1}
                  </span>
                  {t}
                </li>
              ))}
            </ol>
          </section>
          <section className="card-surface p-5">
            <p className="text-[12.5px] font-extrabold text-foreground">Keeping you safe</p>
            <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
              We notify you by email whenever a PIN is reset. If that wasn't you, contact support
              straight away.
            </p>
            <Link
              to="/settings/help/ticket"
              className="mt-3 inline-flex items-center rounded-xl border border-border bg-background px-4 py-2.5 text-[12.5px] font-bold text-foreground press"
            >
              Contact support
            </Link>
          </section>
        </aside>
      </div>
    </SettingsPage>
  );
}

function Head({
  icon: Icon,
  title,
  sub,
}: {
  icon: typeof UserCheck;
  title: string;
  sub: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand text-gold ring-1 ring-inset ring-gold/25">
        <Icon className="size-[18px]" strokeWidth={2} />
      </span>
      <div>
        <p className="font-display text-[16px] font-extrabold">{title}</p>
        <p className="mt-0.5 text-[12.5px] text-muted-foreground">{sub}</p>
      </div>
    </div>
  );
}
