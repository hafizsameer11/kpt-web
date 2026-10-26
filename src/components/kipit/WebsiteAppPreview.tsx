import {
  ArrowUpRight,
  BarChart3,
  Bell,
  Compass,
  Eye,
  Home,
  PieChart,
  Settings,
} from "lucide-react";
import { Logo } from "@/components/kipit/Logo";
import {
  HOLDINGS,
  INVESTED,
  NEXT_MATURITY,
  QUICK_ACTIONS,
  WEEK_EARNINGS,
  naira,
} from "@/lib/home-data";

const WALLET = 500_000;

const NAV = [
  { icon: Home, label: "Home", active: true },
  { icon: BarChart3, label: "Invest", active: false },
  { icon: Compass, label: "Explore", active: false },
  { icon: PieChart, label: "Portfolio", active: false },
  { icon: Settings, label: "Settings", active: false },
];

export function WebsiteAppPreview() {
  const total = WALLET + INVESTED;
  const maturityPct = Math.round(
    ((NEXT_MATURITY.totalDays - NEXT_MATURITY.daysLeft) / NEXT_MATURITY.totalDays) * 100,
  );

  return (
    <div className="website-device website-device-float" aria-label="Kipit app home screen preview">
      <span className="website-device-island" aria-hidden />
      <div className="website-device-screen">
        {/* ── Navy canvas (mirrors the real mobile home) ─────────────── */}
        <section className="relative flex-none overflow-hidden bg-brand-gradient px-4 pb-7 text-brand-foreground">
          <span aria-hidden className="pointer-events-none absolute -right-14 -top-16 size-40 rounded-full bg-gold/25 blur-2xl" />
          <span aria-hidden className="pointer-events-none absolute -left-16 bottom-0 size-36 rounded-full bg-white/10 blur-2xl" />

          {/* Status bar */}
          <div className="relative flex items-center justify-between pt-2 text-[9px] font-semibold">
            <span>9:41</span>
            <span className="flex items-center gap-1.5">
              <span className="flex items-end gap-px" aria-hidden>
                {[3, 5, 7, 9].map((h) => (
                  <span key={h} className="w-[2.5px] rounded-sm bg-current" style={{ height: h }} />
                ))}
              </span>
              <span className="flex h-[8px] w-[15px] items-center rounded-[3px] border border-current p-px" aria-hidden>
                <span className="block h-full w-3/4 rounded-[1.5px] bg-current" />
              </span>
            </span>
          </div>

          <header className="relative mt-3 flex items-center justify-between">
            <div>
              <Logo tone="light" className="font-display text-base" />
              <p className="mt-0.5 text-[9px] text-brand-foreground/70">Good morning, Adaeze</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="relative grid size-7 place-items-center rounded-full border border-white/20 bg-white/10">
                <Bell className="size-3" strokeWidth={1.8} />
                <span className="absolute right-1.5 top-1.5 size-1 rounded-full bg-gold" />
              </span>
              <span className="grid size-7 place-items-center rounded-full bg-white/15 text-[9px] font-bold">AO</span>
            </div>
          </header>

          {/* Lens switcher */}
          <div className="relative mt-3 inline-flex rounded-full border border-white/15 bg-white/10 p-0.5">
            <span className="rounded-full bg-surface px-2.5 py-1 text-[8px] font-bold text-brand">Total</span>
            <span className="px-2.5 py-1 text-[8px] font-bold text-brand-foreground/70">Invested</span>
            <span className="px-2.5 py-1 text-[8px] font-bold text-brand-foreground/70">Wallet</span>
          </div>

          <div className="relative mt-2.5 flex items-end gap-2">
            <p className="font-display text-[26px] font-extrabold leading-none tracking-[-0.04em]">{naira(total)}</p>
            <span className="mb-0.5 grid size-5 shrink-0 place-items-center rounded-full border border-white/25 bg-white/10">
              <Eye className="size-2.5" />
            </span>
          </div>
          <p className="relative mt-1 text-[8px] text-brand-foreground/70">Wallet + all active plans</p>
          <p className="relative mt-2 inline-flex items-center gap-1 rounded-full bg-gold/20 px-2 py-0.5 text-[8px] font-bold text-gold">
            <ArrowUpRight className="size-2.5" /> +{naira(WEEK_EARNINGS)} interest this week
          </p>

          {/* Quick actions */}
          <div className="relative mt-3 grid grid-cols-4 gap-1.5">
            {QUICK_ACTIONS.map((a) => (
              <span key={a.label} className="flex flex-col items-center gap-1 text-[7px] font-semibold text-brand-foreground/85">
                <span className="grid size-8 place-items-center rounded-lg border border-white/15 bg-white/10">
                  <a.icon className="size-3.5" strokeWidth={1.9} />
                </span>
                <span className="text-center leading-tight">{a.label}</span>
              </span>
            ))}
          </div>
        </section>

        {/* ── Sheet sliding over the canvas ──────────────────────────── */}
        <div className="relative -mt-4 flex min-h-0 flex-1 flex-col rounded-t-[1.4rem] bg-background px-3 pt-2.5">
          <span aria-hidden className="mx-auto mb-2.5 block h-0.5 w-8 flex-none rounded-full bg-border" />

          {/* Next maturity */}
          <div className="flex-none rounded-xl border border-border bg-card p-2.5 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[7px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Next maturity</p>
                <p className="mt-0.5 truncate text-[10px] font-extrabold">{NEXT_MATURITY.name}</p>
                <p className="mt-0.5 text-[7px] text-muted-foreground">
                  {NEXT_MATURITY.tenor} · {NEXT_MATURITY.rate} · matures {NEXT_MATURITY.date}
                </p>
              </div>
              <div className="shrink-0 rounded-lg bg-brand px-2 py-1 text-center text-brand-foreground">
                <p className="text-[11px] font-extrabold leading-none">{NEXT_MATURITY.daysLeft}</p>
                <p className="text-[6px] font-semibold uppercase tracking-wide opacity-75">days</p>
              </div>
            </div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-gold-gradient" style={{ width: `${maturityPct}%` }} />
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[7px]">
              <span className="text-muted-foreground">Principal {naira(NEXT_MATURITY.amount)}</span>
              <span className="font-bold">Payout {naira(NEXT_MATURITY.expectedPayout)}</span>
            </div>
          </div>

          {/* Plans */}
          <div className="mt-2.5 flex flex-none items-center justify-between">
            <p className="font-display text-[11px] font-extrabold">Your plans</p>
            <span className="text-[8px] font-bold text-brand">All plans</span>
          </div>
          <div className="mt-1.5 space-y-1.5 overflow-hidden">
            {HOLDINGS.slice(0, 2).map((h, i) => {
              const progress = Math.round(((h.totalDays - h.daysLeft) / h.totalDays) * 100);
              return (
                <div key={h.name} className="flex items-center gap-2 rounded-xl border border-border bg-card p-2">
                  <span className={`h-8 w-1 shrink-0 rounded-full ${i === 0 ? "bg-gold" : "bg-brand"}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[9px] font-bold">{h.name}</p>
                    <p className="mt-0.5 text-[7px] text-muted-foreground">
                      {h.rate} · {h.daysLeft} days left · {h.date}
                    </p>
                    <div className="mt-1 h-0.5 overflow-hidden rounded-full bg-secondary">
                      <div
                        className={`h-full rounded-full ${i === 0 ? "bg-gold-gradient" : "bg-brand"}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  <p className="shrink-0 text-[9px] font-extrabold">{naira(h.amount)}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Bottom tab bar ─────────────────────────────────────────── */}
        <nav className="flex flex-none items-center justify-around border-t border-border bg-card px-1 pb-3.5 pt-2">
          {NAV.map(({ icon: Icon, label, active }) => (
            <span key={label} className={`flex flex-col items-center gap-0.5 ${active ? "text-brand" : "text-muted-foreground"}`}>
              <Icon className="size-3.5" strokeWidth={active ? 2.2 : 1.8} />
              <span className="text-[6px] font-semibold">{label}</span>
            </span>
          ))}
        </nav>
      </div>
    </div>
  );
}
