import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { AppShell } from "@/components/kipit/AppShell";

/**
 * Shared layout for the verification journey (MOB-040 – MOB-057):
 * navy arc hero with a back chip and step counter, then the light sheet.
 */
export function KycStep({
  navTitle,
  eyebrow,
  title,
  subtitle,
  step,
  totalSteps,
  backTo,
  backLabel = "Back",
  hero,
  aside,
  children,
}: {
  navTitle: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  step?: number;
  totalSteps?: number;
  backTo?: string;
  backLabel?: string;
  hero?: ReactNode;
  /** Desktop-only supporting rail shown beside the step content. */
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <AppShell title={navTitle} navVariant="elevated">
      <div className="pb-2 md:mx-auto md:w-full md:max-w-4xl md:pb-10">
        <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-14 pt-6 text-primary-foreground md:mx-0 md:rounded-2xl md:px-9 md:pb-9 md:pt-9 md:shadow-float">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-32 size-72 rounded-full bg-gold/15 blur-[64px]"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-28 -left-20 hidden size-64 rounded-full bg-white/10 blur-[56px] md:block"
          />
          <div className="relative md:max-w-3xl">
            <div className="flex items-center justify-between gap-3">
              {backTo ? (
                <Link
                  to={backTo}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold text-primary-foreground press"
                >
                  <ArrowLeft className="size-3.5" /> {backLabel}
                </Link>
              ) : (
                <span />
              )}
              {step && totalSteps && (
                <span className="shrink-0 rounded-full bg-gold/15 px-2.5 py-1 text-[11px] font-extrabold text-gold">
                  Step {step} of {totalSteps}
                </span>
              )}
            </div>

            {eyebrow && (
              <p className="mt-6 text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary-foreground/60">
                {eyebrow}
              </p>
            )}
            <h1 className="mt-2 font-display text-[26px] font-extrabold leading-tight tracking-[-0.02em] md:text-[32px]">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 max-w-md text-[12.5px] text-primary-foreground/65 md:max-w-2xl md:text-[13.5px] md:leading-relaxed">
                {subtitle}
              </p>
            )}

            {step && totalSteps && (
              <div className="mt-5 h-1.5 w-full max-w-xs overflow-hidden md:max-w-sm rounded-full bg-white/15">
                <span
                  className="block h-full rounded-full bg-gold transition-[width] duration-500"
                  style={{ width: `${(step / totalSteps) * 100}%` }}
                />
              </div>
            )}

            {hero}
          </div>
        </section>

        <div className="relative -mx-4 -mt-8 rounded-t-[2rem] bg-background px-4 pt-5 md:mx-0 md:mt-6 md:rounded-none md:bg-transparent md:px-0 md:pt-0">
          <span
            aria-hidden
            className="mx-auto mb-4 block h-1 w-10 rounded-full bg-border md:hidden"
          />
          {aside ? (
            <div className="md:grid md:grid-cols-[minmax(0,1fr)_300px] md:items-start md:gap-6">
              <div className="min-w-0">{children}</div>
              <aside className="hidden md:block md:sticky md:top-6 md:space-y-4">{aside}</aside>
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </AppShell>
  );
}

export function KycRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-bold text-foreground">{children}</dd>
    </div>
  );
}

export const kycCta =
  "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press disabled:opacity-40 disabled:shadow-none md:w-auto md:px-10";

export const kycGhost =
  "inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3.5 text-[13.5px] font-bold text-foreground press md:w-auto md:px-8";

export const kycField =
  "mt-2 w-full rounded-xl border border-border bg-background px-3.5 py-3 text-[14px] font-semibold text-foreground outline-none placeholder:text-[13px] placeholder:font-medium placeholder:text-muted-foreground focus:border-gold";

export const kycLabel =
  "text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground";
