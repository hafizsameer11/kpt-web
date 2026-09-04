import type { ReactNode } from "react";
import { STATUS_LABEL, TIER_LABEL, type Tier, type UserStatus } from "@/lib/admin-users-data";

/** Small shared building blocks for the admin console screens. */

const STATUS_TONE: Record<UserStatus, string> = {
  active: "bg-emerald-500/12 text-emerald-700",
  frozen: "bg-destructive/10 text-destructive",
  dormant: "bg-muted text-muted-foreground",
  pending: "bg-gold/25 text-gold-foreground",
};

export function StatusPill({ status }: { status: UserStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${STATUS_TONE[status]}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {STATUS_LABEL[status]}
    </span>
  );
}

export function TierPill({ tier }: { tier: Tier }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold ${
        tier === 2
          ? "bg-brand/10 text-brand"
          : tier === 1
            ? "bg-gold/20 text-gold-foreground"
            : "bg-muted text-muted-foreground"
      }`}
    >
      {TIER_LABEL[tier]}
    </span>
  );
}

export function Panel({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-border bg-card shadow-sm ${className}`}>
      {title ? (
        <header className="flex items-center justify-between gap-3 border-b border-border/70 px-5 py-3.5">
          <h2 className="font-display text-[15px] font-extrabold tracking-[-0.01em]">{title}</h2>
          {action}
        </header>
      ) : null}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Stat({
  label,
  value,
  helper,
  tone = "default",
}: {
  label: string;
  value: string;
  helper?: string;
  tone?: "default" | "brand" | "gold";
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        tone === "brand"
          ? "border-transparent bg-brand-gradient text-primary-foreground"
          : tone === "gold"
            ? "border-gold/30 bg-gold/10"
            : "border-border bg-card"
      }`}
    >
      <p
        className={`text-[11px] font-bold uppercase tracking-[0.12em] ${
          tone === "brand" ? "text-primary-foreground/60" : "text-muted-foreground"
        }`}
      >
        {label}
      </p>
      <p className="mt-1.5 font-display text-[22px] font-extrabold tracking-[-0.02em]">{value}</p>
      {helper ? (
        <p
          className={`mt-0.5 text-[12px] ${
            tone === "brand" ? "text-primary-foreground/60" : "text-muted-foreground"
          }`}
        >
          {helper}
        </p>
      ) : null}
    </div>
  );
}
