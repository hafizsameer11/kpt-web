import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  Bell,
  ChevronRight,
  Eye,
  EyeOff,
  Lightbulb,
  Wallet,
} from "lucide-react";
import { AppShell } from "@/components/kipit/AppShell";
import { Logo } from "@/components/kipit/Logo";
import { NewUserEmptyState } from "@/components/kipit/NewUserEmptyState";
import { ForYouBento } from "@/components/kipit/ForYouVariants";
import { useBalanceVisibility, useIsNewUser } from "@/hooks/useBalanceVisibility";
import { GreetingText } from "@/components/kipit/SpecBlocks";
import {
  FEED,
  HOLDINGS,
  INVESTED,
  MONTH_CHANGE,
  MONTH_CHANGE_PCT,
  NEXT_MATURITY,
  PAYOUTS,
  QUICK_ACTIONS,
  TOTAL,
  WALLET,
  WEEK_EARNINGS,
  WEEK_LABELS,
  WEEK_SERIES,
  naira,
} from "@/lib/home-data";

export const Route = createFileRoute("/home-v4")({
  head: () => ({
    meta: [
      { title: "Kipit Home 4 — Aurora Mobile Wealth Screen" },
      {
        name: "description",
        content:
          "Kipit Home 4: an aurora-gradient mobile investment home with balance lens, growth curve, plan deck, maturity countdown and upcoming payouts.",
      },
      { property: "og:title", content: "Kipit Home 4 — Aurora Mobile Wealth Screen" },
      {
        property: "og:description",
        content:
          "A world-class mobile home screen for Kipit: aurora balance canvas, growth curve, stacked plan deck and payout timeline.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomeV4Screen,
});

const LENSES = ["Total", "Invested", "Wallet"] as const;
type Lens = (typeof LENSES)[number];

const progress = (totalDays: number, daysLeft: number) =>
  Math.round(((totalDays - daysLeft) / totalDays) * 100);

/** Smooth growth curve built from the weekly interest series. */
function GrowthCurve({ series }: { series: number[] }) {
  const { line, area } = useMemo(() => {
    const w = 300;
    const h = 92;
    const max = Math.max(...series);
    const min = Math.min(...series);
    const span = max - min || 1;
    const pts = series.map((v, i) => {
      const x = (i / (series.length - 1)) * w;
      const y = h - 10 - ((v - min) / span) * (h - 26);
      return [x, y] as const;
    });
    let d = `M ${pts[0]![0]} ${pts[0]![1]}`;
    for (let i = 1; i < pts.length; i++) {
      const p = pts[i - 1]!;
      const c = pts[i]!;
      const mx = (p[0] + c[0]) / 2;
      d += ` C ${mx} ${p[1]}, ${mx} ${c[1]}, ${c[0]} ${c[1]}`;
    }
    return { line: d, area: `${d} L ${w} ${h} L 0 ${h} Z` };
  }, [series]);

  return (
    <svg viewBox="0 0 300 92" preserveAspectRatio="none" className="h-24 w-full md:h-32">
      <defs>
        <linearGradient id="k4-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#k4-fill)" />
      <path
        d={line}
        fill="none"
        stroke="var(--gold)"
        strokeWidth="2.5"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function HomeV4Screen() {
  const { hidden, toggle, mask } = useBalanceVisibility();
  const isNewUser = useIsNewUser();
  const [lens, setLens] = useState<Lens>("Total");

  const lensValue = lens === "Total" ? TOTAL : lens === "Invested" ? INVESTED : WALLET;
  const lensNote =
    lens === "Total"
      ? `${naira(MONTH_CHANGE)} (+${MONTH_CHANGE_PCT}%) this month`
      : lens === "Invested"
        ? `${HOLDINGS.length} active plans earning daily`
        : "Available now · earns no interest";

  const maxWeek = Math.max(...WEEK_SERIES);
  const ringPct = progress(NEXT_MATURITY.totalDays, NEXT_MATURITY.daysLeft);

  if (isNewUser) {
    return (
      <div className="type-h4">
        <AppShell title="Home" navVariant="orbit">
          <div className="pt-5">
            <NewUserEmptyState />
          </div>
        </AppShell>
      </div>
    );
  }

  return (
    <div className="type-h4">
      <AppShell title="Home" navVariant="orbit">
        {/* ── Aurora balance canvas ─────────────────────────────────── */}
        <section className="relative -mx-4 overflow-hidden rounded-b-[2.25rem] bg-brand-gradient px-5 pb-20 pt-4 text-primary-foreground md:mx-0 md:rounded-[2rem] md:px-8 md:pb-9 md:pt-7">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-20 top-10 size-64 rounded-full bg-gold/25 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-white/10 blur-3xl"
          />

          <header className="relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <div className="min-w-0">
              <Logo tone="light" className="font-display text-lg md:hidden" />
              <p className="mt-0.5 truncate text-[11px] text-primary-foreground/70">
                <GreetingText />, Adaeze
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Link
                to="/notifications"
                aria-label="Notifications"
                className="relative grid size-9 place-items-center rounded-full bg-white/12 press"
              >
                <Bell className="size-[17px]" strokeWidth={1.8} />
                <span className="absolute right-2 top-2 size-1.5 rounded-full bg-gold" />
              </Link>
              <Link
                to="/settings"
                aria-label="Profile"
                className="grid size-9 place-items-center rounded-full bg-white/18 text-[11px] font-bold press"
              >
                AO
              </Link>
            </div>
          </header>

          {/* Lens switcher */}
          <div className="relative mt-5 inline-flex rounded-full bg-white/10 p-1">
            {LENSES.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLens(l)}
                className={`rounded-full px-3.5 py-1.5 text-[11px] font-bold transition-colors ${
                  lens === l
                    ? "bg-gold-gradient text-gold-foreground"
                    : "text-primary-foreground/65"
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          <div className="relative mt-4 flex items-center gap-2.5">
            <h1 className="font-display text-[40px] leading-none tracking-[-0.045em] text-num md:text-[56px]">
              {mask(lensValue)}
            </h1>
            <button
              type="button"
              onClick={toggle}
              aria-label={hidden ? "Show balances" : "Hide balances"}
              className="grid size-7 place-items-center rounded-full bg-white/12 press"
            >
              {hidden ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
            </button>
          </div>
          <p className="relative mt-2 text-[12px] text-primary-foreground/70">{lensNote}</p>

          {/* Growth curve inside the canvas */}
          <div className="relative mt-4">
            <GrowthCurve series={WEEK_SERIES} />
            <div className="mt-1 flex justify-between text-[9px] font-semibold text-primary-foreground/45">
              {WEEK_LABELS.map((d) => (
                <span key={d}>{d.slice(0, 1)}</span>
              ))}
            </div>
            <p className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold text-gold">
              <ArrowUpRight className="size-3.5" /> {naira(WEEK_EARNINGS)} interest this week
            </p>
          </div>
        </section>

        {/* ── Quick actions, floating over the canvas ───────────────── */}
        <section className="relative z-10 -mt-12 grid grid-cols-4 gap-1 rounded-[1.75rem] border border-border bg-surface px-2 py-3.5 shadow-float md:mt-5 md:gap-4 md:px-6 md:py-5 md:shadow-card">
          {QUICK_ACTIONS.map((a) => (
            <Link
              key={a.label}
              to={a.to}
              className="flex flex-col items-center gap-1.5 text-[10px] font-bold text-brand press md:text-xs"
            >
              <span className="grid size-10 place-items-center rounded-[0.95rem] bg-accent text-accent-foreground md:size-12">
                <a.icon className="size-[18px]" strokeWidth={2} />
              </span>
              <span className="text-center leading-tight">{a.label}</span>
            </Link>
          ))}
        </section>

        <div className="md:grid md:grid-cols-3 md:gap-5">
          {/* ── Maturity countdown ring ─────────────────────────────── */}
          <article className="card-surface mt-4 p-4 md:col-span-2 md:mt-5 md:p-6">
            <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4">
              <div className="relative grid size-[74px] shrink-0 place-items-center md:size-24">
                <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90">
                  <circle
                    cx="18"
                    cy="18"
                    r="15.5"
                    fill="none"
                    stroke="var(--color-secondary)"
                    strokeWidth="3.5"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.5"
                    fill="none"
                    stroke="var(--gold)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeDasharray={`${(ringPct / 100) * 97.4} 97.4`}
                  />
                </svg>
                <div className="text-center">
                  <p className="font-display text-lg leading-none md:text-2xl">
                    {NEXT_MATURITY.daysLeft}
                  </p>
                  <p className="text-[9px] font-semibold text-muted-foreground">days</p>
                </div>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Next maturity
                </p>
                <h2 className="mt-1 truncate font-display text-base md:text-xl">
                  {NEXT_MATURITY.name}
                </h2>
                <p className="mt-1 text-[11px] text-muted-foreground md:text-xs">
                  {NEXT_MATURITY.rate} · {NEXT_MATURITY.tenor} · matures {NEXT_MATURITY.date}
                </p>
                <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] md:text-xs">
                  <span className="text-muted-foreground">
                    Principal <span className="font-bold text-foreground">{mask(NEXT_MATURITY.amount)}</span>
                  </span>
                  <span className="text-muted-foreground">
                    Payout <span className="font-bold text-foreground">{mask(NEXT_MATURITY.expectedPayout)}</span>
                  </span>
                </div>
              </div>
            </div>
          </article>

          {/* ── Weekly interest ─────────────────────────────────────── */}
          <article className="card-surface mt-3 p-4 md:mt-5 md:p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Interest this week
            </p>
            <p className="mt-1.5 font-display text-2xl text-num md:text-3xl">
              {mask(WEEK_EARNINGS)}
            </p>
            <div className="mt-4 flex items-end gap-1.5">
              {WEEK_SERIES.map((v, i) => (
                <div key={WEEK_LABELS[i]} className="flex flex-1 flex-col items-center gap-1.5">
                  <div
                    className={`w-2 rounded-full ${v === maxWeek ? "bg-gold" : "bg-brand/15"}`}
                    style={{ height: `${16 + (v / maxWeek) * 38}px` }}
                  />
                  <span className="text-[9px] font-semibold text-muted-foreground">
                    {WEEK_LABELS[i]?.slice(0, 1)}
                  </span>
                </div>
              ))}
            </div>
          </article>
        </div>

        {/* ── Plan deck ─────────────────────────────────────────────── */}
        <section className="mt-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg md:text-xl">Your plans</h2>
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-1 text-xs font-bold text-brand press"
            >
              Portfolio <ChevronRight className="size-3.5" />
            </Link>
          </div>
          <div className="mt-3 space-y-2.5 md:grid md:grid-cols-3 md:gap-4 md:space-y-0">
            {HOLDINGS.map((h) => {
              const p = progress(h.totalDays, h.daysLeft);
              return (
                <article
                  key={h.name}
                  className="card-surface p-4 press hover:-translate-y-0.5 hover:shadow-float md:p-5"
                >
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-display text-[15px] md:text-base">{h.name}</h3>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Matures {h.date}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-accent px-2.5 py-1 text-[10px] font-extrabold text-accent-foreground">
                      {h.rate}
                    </span>
                  </div>
                  <p className="mt-3 font-display text-xl text-num md:text-2xl">{mask(h.amount)}</p>
                  <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-brand-gradient"
                      style={{ width: `${p}%` }}
                    />
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[10px] font-semibold text-muted-foreground">
                    <span>{p}% of tenor complete</span>
                    <span>{h.daysLeft} days left</span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* ── Idle wallet nudge ─────────────────────────────────────── */}
        <section className="mt-4 overflow-hidden rounded-[1.75rem] border border-gold/40 bg-accent p-4 md:mt-5 md:p-6">
          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-gold text-gold-foreground">
              <Wallet className="size-[18px]" strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-accent-foreground">
                {mask(WALLET)} in your wallet earns no interest
              </p>
              <p className="mt-1 text-xs leading-relaxed text-accent-foreground/80">
                Wallet funds are available for withdrawal at any time. Move them into Kipit Vault
                at 21.5% p.a. to earn about ₦8,958 a month.
              </p>
              <Link
                to="/invest"
                className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-xs font-bold text-primary-foreground press"
              >
                Invest wallet balance <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Upcoming payouts ──────────────────────────────────────── */}
        <section className="card-surface mt-4 p-4 md:mt-5 md:p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg md:text-xl">Upcoming payouts</h2>
            <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold text-muted-foreground">
              Next 30 days
            </span>
          </div>
          <ul className="mt-3 space-y-3">
            {PAYOUTS.map((p, i) => (
              <li key={p.label} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
                <span className="flex flex-col items-center">
                  <span
                    className={`size-2.5 rounded-full ${i === 0 ? "bg-gold" : "bg-brand/25"}`}
                  />
                  {i < PAYOUTS.length - 1 && <span className="mt-1 h-6 w-px bg-border" />}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-semibold">{p.label}</span>
                  <span className="block text-[11px] text-muted-foreground">{p.date}</span>
                </span>
                <span className="shrink-0 font-display text-sm text-num">{mask(p.amount)}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Recommendation ────────────────────────────────────────── */}
        <section className="mt-4 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-[1.75rem] border border-border bg-surface p-4 shadow-card md:mt-5 md:p-6">
          <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-brand text-primary-foreground">
            <Lightbulb className="size-[18px]" strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">Recommended: Kipit Vault (365 days)</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              21.5% p.a. · matches your long-tenor pattern
            </p>
          </div>
          <Link
            to="/invest"
            className="shrink-0 rounded-full bg-accent px-3.5 py-2 text-[11px] font-bold text-accent-foreground press"
          >
            View
          </Link>
        </section>

        {/* ── For you ───────────────────────────────────────────────── */}
        <ForYouBento className="mt-6" />
      </AppShell>
    </div>
  );
}
