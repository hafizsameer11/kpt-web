import { Link } from "@tanstack/react-router";
import { FileText, ShieldCheck } from "lucide-react";

/** Time-of-day greeting used across every home concept. */
export function useGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/** PRD: wallet funds are always available and never earn interest. */
export function WalletNote({ className = "" }: { className?: string }) {
  return (
    <p className={`text-xs leading-relaxed text-muted-foreground ${className}`}>
      Wallet funds are available to invest or withdraw anytime and do not earn interest or
      investment returns.
    </p>
  );
}

/** PRD: KYC tier status + limits, with a statements shortcut. */
export function TierStatusCard({
  tier = 2,
  limit = "₦50m",
  className = "",
}: {
  tier?: 0 | 1 | 2;
  limit?: string;
  className?: string;
}) {
  const verified = tier === 2;
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 ${className}`}
    >
      <div className="flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
          <ShieldCheck className="size-4" />
        </span>
        <div>
          <p className="text-xs font-semibold text-foreground">
            {verified ? `Tier ${tier} verified` : `Tier ${tier} — verification pending`}
          </p>
          <p className="text-xs text-muted-foreground">
            {verified
              ? `Transaction limit ${limit} · funds held with SEC-licensed partners`
              : "Complete your KYC to unlock investing and higher limits"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {!verified && (
          <Link
            to="/settings"
            className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
          >
            Verify now
          </Link>
        )}
        <Link
          to="/portfolio"
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground"
        >
          <FileText className="size-3.5" /> Statements
        </Link>
      </div>
    </div>
  );
}

/** Inline time-aware greeting text, e.g. "Good afternoon". */
export function GreetingText() {
  return <>{useGreeting()}</>;
}
