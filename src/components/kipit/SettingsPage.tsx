import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { AppShell } from "@/components/kipit/AppShell";

type Props = {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  backTo?: "/settings" | "/settings/security" | "/settings/help";
  backLabel?: string;
  hero?: ReactNode;
  children: ReactNode;
};

/** Shared navy header + light sheet used by every Settings sub-screen. */
export function SettingsPage({
  title,
  eyebrow = "Settings",
  subtitle,
  backTo = "/settings",
  backLabel = "Settings",
  hero,
  children,
}: Props) {
  return (
    <AppShell title={title} navVariant="elevated">
      <div className="pb-2">
        <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-14 pt-6 text-primary-foreground md:mx-0 md:rounded-xl md:px-8 md:pt-8 md:shadow-float">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-32 size-72 rounded-full bg-gold/15 blur-[64px]"
          />
          <div className="relative md:max-w-3xl">
            <Link
              to={backTo}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold press"
            >
              <ArrowLeft className="size-3.5" /> {backLabel}
            </Link>
            <p className="k-rise mt-6 text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary-foreground/60">
              {eyebrow}
            </p>
            <h1 className="k-rise mt-1.5 font-display text-[26px] font-extrabold leading-tight tracking-[-0.03em] md:text-[32px]">
              {title}
            </h1>
            {subtitle ? (
              <p className="k-rise mt-2 max-w-md text-[12.5px] leading-relaxed text-primary-foreground/70">
                {subtitle}
              </p>
            ) : null}
            {hero}
          </div>
        </section>

        <div className="relative -mx-4 -mt-8 rounded-t-[2rem] bg-background px-4 pt-5 md:mx-0 md:mt-6 md:rounded-none md:bg-transparent md:px-0 md:pt-0">
          <span
            aria-hidden
            className="mx-auto mb-4 block h-1 w-10 rounded-full bg-border md:hidden"
          />
          {children}
        </div>
      </div>
    </AppShell>
  );
}

/** Grouped card of label/value rows. */
export function FieldCard({
  label,
  children,
}: {
  label?: string;
  children: ReactNode;
}) {
  return (
    <section className="card-surface overflow-hidden">
      {label ? (
        <p className="border-b border-border/60 px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </p>
      ) : null}
      <div className="divide-y divide-border/60">{children}</div>
    </section>
  );
}

export function Field({
  label,
  value,
  locked,
  hint,
}: {
  label: string;
  value: ReactNode;
  locked?: boolean;
  hint?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3.5">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 break-words text-[13.5px] font-bold text-foreground">{value}</p>
        {hint ? <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p> : null}
      </div>
      {locked ? (
        <span className="mt-1 shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">
          KYC locked
        </span>
      ) : null}
    </div>
  );
}
