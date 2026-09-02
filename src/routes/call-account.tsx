import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  Eye,
  EyeOff,
  Info,
  Plus,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { AppShell } from "@/components/kipit/AppShell";
import { useBalanceVisibility } from "@/hooks/useBalanceVisibility";
import { naira, WALLET } from "@/lib/home-data";
import {
  CALL_ACCOUNT,
  CALL_ACCRUAL_TREND,
  CALL_ACCOUNT_FACTS,
  CALL_ACTIVITY,
} from "@/lib/invest-data";

export const Route = createFileRoute("/call-account")({
  head: () => ({
    meta: [
      { title: "Call Account — Daily Interest on Idle Cash | Kipit" },
      {
        name: "description",
        content:
          "Track your Kipit Call Account: current balance, 14.5% p.a. rate, daily interest accrual, recent activity, and instant add money or withdraw.",
      },
      { property: "og:title", content: "Call Account — Daily Interest on Idle Cash | Kipit" },
      {
        property: "og:description",
        content:
          "Your Kipit Call Account balance, daily accrual and activity — withdraw anytime with no penalty.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CallAccountScreen,
});

/** Smooth (Catmull-Rom → bezier) SVG path for the 14-day accrual trend. */
function trendPoints(values: number[], w: number, h: number) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  return values.map((v, i) => ({
    x: (i / (values.length - 1)) * w,
    y: h - ((v - min) / span) * (h - 10) - 5,
  }));
}

function smoothPath(pts: { x: number; y: number }[]) {
  const first = pts[0];
  if (!first || pts.length < 2) return "";
  let d = `M${first.x.toFixed(1)},${first.y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p1 = pts[i]!;
    const p2 = pts[i + 1]!;
    const p0 = pts[i - 1] ?? p1;
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }
  return d;
}



function CallAccountScreen() {
  const { mask, hidden, toggle } = useBalanceVisibility();
  const pts = trendPoints(CALL_ACCRUAL_TREND, 300, 88);
  const line = smoothPath(pts);
  const last = pts[pts.length - 1] ?? { x: 300, y: 44 };


  return (
    <AppShell title="Call Account" navVariant="elevated">
      <div className="pb-2">
        {/* ── Hero ───────────────────────────────────────────────── */}
        <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-14 pt-6 text-primary-foreground md:mx-0 md:rounded-[2rem] md:px-8 md:pb-14 md:pt-8 md:shadow-float">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-32 size-72 rounded-full bg-gold/15 blur-[64px]"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-28 -left-20 size-64 rounded-full bg-white/10 blur-[56px]"
          />

          <div className="relative md:max-w-3xl">
            <div className="flex items-center justify-between gap-3">
              <Link
                to="/invest"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold text-primary-foreground press md:hidden"
              >
                <ArrowLeft className="size-3.5" /> Invest
              </Link>
              <button
                type="button"
                onClick={toggle}
                aria-label={hidden ? "Show balances" : "Hide balances"}
                className="ml-auto grid size-9 place-items-center rounded-full border border-white/15 bg-white/10 press"
              >
                {hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>

            {/* Title + rate */}
            <div className="mt-5 flex items-center justify-between gap-3">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary-foreground/60">
                {CALL_ACCOUNT.name}
              </p>
              <span className="shrink-0 rounded-full bg-gold/15 px-2.5 py-1 text-[11px] font-extrabold text-gold">
                {CALL_ACCOUNT.rate}
              </span>
            </div>

            {/* Balance lockup */}
            <div className="mt-2 space-y-1">
              <p className="font-display text-[40px] font-extrabold leading-none tracking-[-0.035em] text-num md:text-[48px]">
                {mask(CALL_ACCOUNT.balance)}
              </p>
              <p className="flex items-center gap-1.5 text-[12px] font-medium text-primary-foreground/60">
                <ShieldCheck className="size-3.5 text-primary-foreground/70" />
                {CALL_ACCOUNT.liquidity} &middot; min {naira(CALL_ACCOUNT.minimum)}
              </p>
            </div>

            {/* Accrual summary — minimal inline */}
            <div className="mt-5 flex gap-6">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary-foreground/50">
                  Earned today
                </p>
                <p className="mt-0.5 text-lg font-extrabold text-gold text-num">
                  {mask(CALL_ACCOUNT.accruedToday)}
                </p>
              </div>
              <div className="w-px bg-white/15" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary-foreground/50">
                  This month
                </p>
                <p className="mt-0.5 text-lg font-extrabold text-num">
                  {mask(CALL_ACCOUNT.accruedThisMonth)}
                </p>
              </div>
            </div>

            {/* Actions (MOB-061) — minimal text row */}
            <div className="mt-5 flex items-center gap-1">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full bg-gold px-4 py-2.5 text-[12px] font-extrabold text-gold-foreground press"
              >
                Add money <ArrowUpRight className="size-3.5" strokeWidth={2.6} />
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[12px] font-bold text-primary-foreground/90 press hover:text-primary-foreground"
              >
                <ArrowDownLeft className="size-3.5" strokeWidth={2.6} /> Withdraw
              </button>
              <a
                href="#activity"
                className="inline-flex items-center rounded-full px-4 py-2.5 text-[12px] font-bold text-primary-foreground/90 press hover:text-primary-foreground"
              >
                Activity
              </a>
            </div>
          </div>
        </section>

        {/* ── Sheet ─────────────────────────────────────────────── */}
        <div className="relative -mx-4 -mt-8 rounded-t-[2rem] bg-background px-4 pt-5 md:mx-0 md:mt-6 md:rounded-none md:bg-transparent md:px-0 md:pt-0">
          <span
            aria-hidden
            className="mx-auto mb-4 block h-1 w-10 rounded-full bg-border md:hidden"
          />

          {/* Daily accrual trend */}
          <section className="card-surface p-4 md:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-base font-extrabold">Daily interest</h2>
                <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                  Last 14 days &middot; credited monthly
                </p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent/15 px-2.5 py-1 text-[11px] font-bold text-brand">
                <TrendingUp className="size-3.5" /> {CALL_ACCOUNT.rate}
              </span>
            </div>

            <svg
              viewBox="0 0 300 64"
              preserveAspectRatio="none"
              className="mt-4 h-16 w-full"
              aria-hidden
            >
              <defs>
                <linearGradient id="callFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={`${line} L300,64 L0,64 Z`} fill="url(#callFill)" />
              <path
                d={line}
                fill="none"
                stroke="var(--gold)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
              <span>14 days ago</span>
              <span className="text-foreground">Today {mask(CALL_ACCOUNT.accruedToday)}</span>
            </div>
          </section>

          {/* Product explanation */}
          <section className="mt-4 card-surface p-4 md:p-5">
            <div className="flex items-center gap-2">
              <Info className="size-4 shrink-0 text-brand" />
              <h2 className="font-display text-base font-extrabold">How it works</h2>
            </div>
            <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">
              {CALL_ACCOUNT.blurb}
            </p>
            <ul className="mt-3 space-y-2">
              {CALL_ACCOUNT_FACTS.map((fact) => (
                <li key={fact} className="flex gap-2 text-[12px] leading-relaxed text-foreground/85">
                  <span
                    aria-hidden
                    className="mt-[7px] size-1.5 shrink-0 rounded-full bg-accent"
                  />
                  {fact}
                </li>
              ))}
            </ul>
          </section>

          {/* Add money shortcut */}
          <section className="mt-4 overflow-hidden rounded-3xl border border-border bg-card p-4 md:p-5">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-bold">Wallet available</p>
                <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                  {mask(WALLET)} idle &middot; move it here to earn {CALL_ACCOUNT.rate}
                </p>
              </div>
              <button
                type="button"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-brand px-4 py-2.5 text-[11.5px] font-extrabold text-brand-foreground press"
              >
                <Plus className="size-3.5" strokeWidth={2.6} /> Add money
              </button>
            </div>
          </section>

          {/* Activity */}
          <section id="activity" className="mt-7 scroll-mt-20">
            <div className="mb-3 flex items-center justify-between px-1">
              <h2 className="font-display text-base font-extrabold">Activity</h2>
              <Link to="/portfolio" className="text-xs font-bold text-brand">
                View all
              </Link>
            </div>
            <ul className="overflow-hidden rounded-3xl border border-border/60 bg-card">
              {CALL_ACTIVITY.map((item, i) => {
                const credit = item.kind !== "withdrawal";
                const Icon =
                  item.kind === "interest"
                    ? TrendingUp
                    : item.kind === "deposit"
                      ? ArrowUpRight
                      : ArrowDownLeft;
                return (
                  <li
                    key={item.id}
                    className={`flex items-center gap-3.5 px-4 py-3.5 ${
                      i > 0 ? "border-t border-border/50" : ""
                    }`}
                  >
                    <span
                      className={`grid size-10 shrink-0 place-items-center rounded-2xl ${
                        credit ? "bg-accent/15 text-brand" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="size-[17px]" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-bold">{item.label}</span>
                      <span className="block text-[11px] text-muted-foreground">{item.date}</span>
                    </span>
                    <span
                      className={`shrink-0 text-[13px] font-extrabold text-num ${
                        credit ? "text-brand" : "text-foreground"
                      }`}
                    >
                      {credit ? "+" : "−"}
                      {mask(item.amount)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>

          <p className="mt-4 flex items-start gap-2 px-1 text-[11px] leading-relaxed text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
            The Call Account rate is indicative per annum, accrues daily and may change with market
            conditions. Balances are held with Kipit&rsquo;s SEC-licensed partner.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
