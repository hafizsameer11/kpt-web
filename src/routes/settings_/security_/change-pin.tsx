import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { SettingsPage } from "@/components/kipit/SettingsPage";

export const Route = createFileRoute("/settings_/security_/change-pin")({
  head: () => ({
    meta: [
      { title: "Change Transaction PIN | Kipit" },
      {
        name: "description",
        content:
          "Set a new 4-digit Kipit transaction PIN by confirming your current PIN first.",
      },
      { property: "og:title", content: "Change Transaction PIN | Kipit" },
      { property: "og:description", content: "Update the PIN that authorizes your transactions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChangePinScreen,
});

const CURRENT_PIN = "1234";

function ChangePinScreen() {
  const navigate = useNavigate();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const value = step === 0 ? current : step === 1 ? next : confirm;
  const setValue = step === 0 ? setCurrent : step === 1 ? setNext : setConfirm;

  const labels = [
    { title: "Enter your current PIN", sub: "Confirm it is really you" },
    { title: "Choose a new PIN", sub: "4 digits, avoid obvious sequences" },
    { title: "Confirm your new PIN", sub: "Type the new PIN again" },
  ] as const;

  function submit() {
    setError(null);
    if (step === 0) {
      if (current !== CURRENT_PIN) {
        setError("That PIN is incorrect. Try again.");
        setCurrent("");
        return;
      }
      setStep(1);
      return;
    }
    if (step === 1) {
      if (/^(\d)\1{3}$/.test(next) || next === "1234") {
        setError("Choose a less predictable PIN.");
        setNext("");
        return;
      }
      setStep(2);
      return;
    }
    if (confirm !== next) {
      setError("The PINs do not match.");
      setConfirm("");
      return;
    }
    setDone(true);
    setTimeout(() => navigate({ to: "/settings/security" }), 1600);
  }

  return (
    <SettingsPage
      title="Change transaction PIN"
      eyebrow="MOB-146"
      backTo="/settings/security"
      backLabel="Security"
      subtitle="Your transaction PIN authorizes withdrawals, investments and gifts."
    >
      <div className="mx-auto max-w-md">
        {done ? (
          <section className="card-surface flex flex-col items-center p-8 text-center">
            <span className="grid size-16 place-items-center rounded-full bg-emerald-500/12 text-emerald-600">
              <CheckCircle2 className="size-9" strokeWidth={2.2} />
            </span>
            <p className="mt-4 font-display text-[18px] font-extrabold">PIN updated</p>
            <p className="mt-1.5 text-[12.5px] text-muted-foreground">
              Use your new PIN the next time you authorize a transaction.
            </p>
          </section>
        ) : (
          <section className="card-surface p-5">
            <div className="flex items-center gap-2">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-gold" : "bg-border"}`}
                />
              ))}
            </div>

            <p className="mt-5 font-display text-[17px] font-extrabold">{labels[step].title}</p>
            <p className="mt-1 text-[12.5px] text-muted-foreground">{labels[step].sub}</p>

            <div className="mt-6 flex justify-center gap-3">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`size-12 rounded-xl border text-center font-display text-[22px] font-extrabold leading-[46px] ${
                    value.length > i ? "border-brand bg-secondary text-foreground" : "border-border"
                  }`}
                >
                  {value.length > i ? "•" : ""}
                </span>
              ))}
            </div>

            <input
              autoFocus
              inputMode="numeric"
              aria-label={labels[step].title}
              value={value}
              onChange={(e) => {
                setError(null);
                setValue(e.target.value.replace(/\D/g, "").slice(0, 4));
              }}
              className="mt-4 w-full rounded-xl border border-border bg-secondary px-4 py-3 text-center text-[15px] font-bold tracking-[0.5em] outline-none focus:border-brand"
              placeholder="••••"
            />

            {error ? (
              <p className="mt-3 text-center text-[12px] font-bold text-destructive">{error}</p>
            ) : null}

            <button
              type="button"
              disabled={value.length !== 4}
              onClick={submit}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press disabled:opacity-40"
            >
              <ShieldCheck className="size-4" strokeWidth={2.6} />
              {step === 2 ? "Update PIN" : "Continue"}
            </button>
          </section>
        )}
      </div>
    </SettingsPage>
  );
}
