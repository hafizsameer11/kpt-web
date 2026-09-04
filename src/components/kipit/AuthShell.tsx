import { Link } from "@tanstack/react-router";
import { ArrowLeft, Delete } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { Logo } from "@/components/kipit/Logo";

/**
 * Full-screen navy shell used by every onboarding / auth screen (MOB-001–017).
 * Mobile renders app-like edge to edge; desktop centres a card on the brand field.
 */
export function AuthShell({
  children,
  back,
  step,
  steps,
  title,
  subtitle,
  footer,
}: {
  children: ReactNode;
  back?: string;
  step?: number;
  steps?: number;
  title?: string;
  subtitle?: string;
  footer?: ReactNode;
}) {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-brand-gradient text-brand-foreground">
      <div className="pointer-events-none absolute -top-24 -left-16 size-72 rounded-full bg-gold/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-40 size-80 rounded-full bg-white/10 blur-3xl" />

      <div className="relative mx-auto grid min-h-dvh w-full max-w-md lg:max-w-none lg:grid-cols-2 lg:items-stretch lg:gap-0 lg:px-0">
        {/* WEB-001 — desktop brand / illustration panel (split screen, left half) */}
        <aside className="hidden lg:flex lg:flex-col lg:justify-center lg:gap-8 lg:px-16 lg:py-16">
          <Logo tone="light" className="text-3xl" />
          <div>
            <p className="inline-flex items-center rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gold">
              Wealth, simplified
            </p>
            <h2 className="mt-5 max-w-md text-4xl font-semibold leading-tight tracking-tight">
              Your money, working every day.
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-brand-foreground/70">
              Save, invest in fixed-return plans, and track everything in one simple account.
            </p>
          </div>
          <div className="grid max-w-md gap-3">
            {[
              ["Up to 22% p.a.", "Fixed-return plans with clear tenors"],
              ["Daily interest", "Call Account interest accrues every day"],
              ["SEC-licensed partners", "Regulated custody and product issuers"],
            ].map(([t, d]) => (
              <div
                key={t}
                className="rounded-2xl border border-white/12 bg-white/8 px-4 py-3 backdrop-blur-sm"
              >
                <p className="text-sm font-semibold">{t}</p>
                <p className="mt-0.5 text-xs text-brand-foreground/65">{d}</p>
              </div>
            ))}
          </div>
          <p className="max-w-md text-[11.5px] leading-relaxed text-brand-foreground/50">
            Kipit works with SEC-licensed partners. Returns shown are indicative and subject to
            issuer terms.
          </p>
        </aside>

        <div className="flex min-h-dvh w-full flex-col px-5 pb-8 pt-6 lg:mx-auto lg:min-h-dvh lg:w-full lg:max-w-none lg:justify-center lg:border-l lg:border-white/10 lg:bg-white/[0.06] lg:px-16 lg:py-16 lg:backdrop-blur-md lg:[&>*]:mx-auto lg:[&>*]:w-full lg:[&>*]:max-w-md">
          <div className="flex items-center justify-between lg:hidden">
            {back ? (
              <Link
                to={back}
                className="inline-flex size-10 items-center justify-center rounded-full bg-white/10 text-brand-foreground transition hover:bg-white/20"
                aria-label="Go back"
              >
                <ArrowLeft className="size-5" />
              </Link>
            ) : (
              <span className="size-10" />
            )}
            <Logo tone="light" className="text-xl lg:hidden" />
            <span className="size-10" />
          </div>

          {steps ? (
            <div className="mt-6 flex gap-1.5" aria-label={`Step ${step} of ${steps}`}>
              {Array.from({ length: steps }).map((_, i) => (
                <span
                  key={i}
                  className={`h-1 flex-1 rounded-full transition ${
                    i < (step ?? 0) ? "bg-gold" : "bg-white/20"
                  }`}
                />
              ))}
            </div>
          ) : null}

          <div className="mt-8 flex-1 lg:mt-4 lg:flex-none">
            {title ? (
              <h1 className="text-2xl font-semibold tracking-tight md:text-3xl lg:text-[28px]">
                {title}
              </h1>
            ) : null}
            {subtitle ? (
              <p className="mt-2 max-w-md text-sm leading-relaxed text-brand-foreground/70">
                {subtitle}
              </p>
            ) : null}
            <div className="mt-7">{children}</div>
          </div>

          {footer ? <div className="pt-6">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}

/** Frosted panel used for forms on the navy field. */
export function AuthCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-white/12 bg-white/8 p-5 backdrop-blur-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function AuthField({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string | null;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-foreground/60">
        {label}
      </span>
      <div className="mt-2">{children}</div>
      {error ? (
        <span className="mt-1.5 block text-xs text-destructive-foreground/90 [color:oklch(0.8_0.14_25)]">
          {error}
        </span>
      ) : hint ? (
        <span className="mt-1.5 block text-xs text-brand-foreground/55">{hint}</span>
      ) : null}
    </label>
  );
}

export const authInputClass =
  "w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-base text-brand-foreground outline-none placeholder:text-brand-foreground/40 focus:border-gold/70 focus:bg-white/14";

export function PrimaryButton({
  children,
  disabled,
  onClick,
  type = "button",
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-xl bg-gold px-5 py-3.5 text-sm font-semibold text-gold-foreground transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl border border-white/20 px-5 py-3.5 text-sm font-semibold text-brand-foreground transition hover:bg-white/10"
    >
      {children}
    </button>
  );
}

/** Six-box OTP entry backed by a single hidden input. */
export function OtpInput({
  value,
  onChange,
  length = 6,
  invalid,
}: {
  value: string;
  onChange: (next: string) => void;
  length?: number;
  invalid?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  return (
    <div className="relative" onClick={() => ref.current?.focus()}>
      <input
        ref={ref}
        inputMode="numeric"
        autoComplete="one-time-code"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, length))}
        className="absolute inset-0 h-full w-full opacity-0"
        aria-label="One-time code"
      />
      <div className="flex justify-between gap-2">
        {Array.from({ length }).map((_, i) => (
          <span
            key={i}
            className={`flex h-14 flex-1 items-center justify-center rounded-xl border text-xl font-semibold ${
              invalid
                ? "border-[oklch(0.7_0.16_25)] bg-white/8"
                : value.length === i
                  ? "border-gold bg-white/14"
                  : "border-white/15 bg-white/8"
            }`}
          >
            {value[i] ?? ""}
          </span>
        ))}
      </div>
    </div>
  );
}

export function PinDots({ length, filled }: { length: number; filled: number }) {
  return (
    <div className="flex justify-center gap-4">
      {Array.from({ length }).map((_, i) => (
        <span
          key={i}
          className={`size-4 rounded-full transition ${
            i < filled ? "bg-gold" : "border border-white/30 bg-white/5"
          }`}
        />
      ))}
    </div>
  );
}

export function Keypad({
  onDigit,
  onBackspace,
}: {
  onDigit: (d: string) => void;
  onBackspace: () => void;
}) {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];
  return (
    <div className="mx-auto grid max-w-xs grid-cols-3 gap-3">
      {keys.map((k, i) =>
        k === "" ? (
          <span key={i} />
        ) : (
          <button
            key={i}
            type="button"
            onClick={() => (k === "del" ? onBackspace() : onDigit(k))}
            className="flex h-14 items-center justify-center rounded-xl border border-white/12 bg-white/8 text-xl font-semibold text-brand-foreground transition active:scale-95 hover:bg-white/14"
            aria-label={k === "del" ? "Delete" : k}
          >
            {k === "del" ? <Delete className="size-5" /> : k}
          </button>
        ),
      )}
    </div>
  );
}
