import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  ChevronRight,
  Eye,
  EyeOff,
  FileText,
  Lightbulb,
  PlusCircle,
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
  TOTAL,
  WALLET,
  WEEK_EARNINGS,
  WEEK_LABELS,
  WEEK_SERIES,
  naira,
} from "@/lib/home-data";

export const Route = createFileRoute("/home-v7")({
  head: () => ({
    meta: [
      { title: "Kipit Home 7 — Glass Bento Wealth Grid" },
      {
        name: "description",
        content:
          "Kipit Home 7: a glassmorphic bento-grid mobile investment home with frosted tiles, balance lens, growth curve, plans and payouts.",
      },
      { property: "og:title", content: "Kipit Home 7 — Glass Bento Wealth Grid" },
      {
        property: "og:description",
        content:
          "A glassmorphism bento home screen for Kipit: frosted tiles, balance lens, growth curve, plans and payouts.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomeV7Screen,
});

const LENSES = ["Total", "Invested", "Wallet"] as const;
type Lens = (typeof LENSES)[number];

const progress = (totalDays: number, daysLeft: number) =>
  Math.round(((totalDays - daysLeft) / totalDays) * 100);

function GrowthCurve({ series }: { series: number[] }) {
  const { line, area } = useMemo(() => {
    const w = 300;
    const h = 80;
    const max = Math.max(...series);
    const min = Math.min(...series);
    const span = max - min || 1;
    const pts = series.map((v, i) => {
      const x = (i / (series.length - 1)) * w;
      const y = h - 8 - ((v - min) / span) * (h - 22);
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
    <svg viewBox="0 0 300 80" preserveAspectRatio="none" className="h-20 w-full">
      <defs>
        <linearGradient id="k7-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.45" />
          <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#k7-fill)" />
      <path
        d={line}
        fill="none"
        stroke="var(--gold)"
        strokeWidth="2.5"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        className="k-draw"
        strokeDasharray="320"
      />
    </svg>
  );
}

function HomeV7Screen() {
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

  const ringPct = progress(NEXT_MATURITY.totalDays, NEXT_MATURITY.daysLeft);
  const maxWeek = Math.max(...WEEK_SERIES);

  if (isNewUser) {
    return (
      <div className="type-h7">
        <AppShell title="Home" navVariant="orbit">
          <div className="pt-5">
            <NewUserEmptyState />
          </div>
        </AppShell>
      </div>
    );
  }

  return (
    <div className="type-h7">
      <AppShell title="Home" navVariant="orbit">
        {/* Soft aurora backdrop */}
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-background" />
          <div className="absolute -left-20 -top-10 size-80 rounded-full bg-brand/20 blur-3xl k-breathe" />
          <div className="absolute -right-24 top-32 size-80 rounded-full bg-gold/25 blur-3xl k-breathe" />
          <div className="absolute bottom-20 left-10 size-96 rounded-full bg-brand/10 blur-3xl" />
        </div>

        {/* ── Header ─────────────────────────────────────────────── */}
        <header className="relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 pb-4">
          <div className="min-w-0">
            <Logo tone="brand" className="font-display text-lg md:hidden" />

            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              <GreetingText />, <span className="font-semibold text-foreground">Adaeze</span>
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              to="/notifications"
              aria-label="Notifications"
              className="relative grid size-9 place-items-center rounded-full k-glass press"
            >
              <Bell className="size-[17px]" strokeWidth={1.8} />
              <span className="absolute right-2 top-2 size-1.5 rounded-full bg-gold" />
            </Link>
            <Link
              to="/settings"
              aria-label="Profile"
              className="grid size-9 place-items-center rounded-full bg-brand text-primary-foreground text-[11px] font-bold press"
            >
              AO
            </Link>
          </div>
        </header>

        {/* ── Bento grid ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12 md:gap-4">
          {/* Balance tile */}
          <article className="k-glass relative overflow-hidden rounded-[1.75rem] p-5 md:col-span-7">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full bg-gold/20 blur-2xl"
            />
            <div className="relative">
              <div className="inline-flex rounded-full bg-secondary/80 p-1">
                {LENSES.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLens(l)}
                    className={`rounded-full px-3 py-1 text-[11px] font-bold transition-colors ${
                      lens === l
                        ? "bg-brand text-primary-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2.5">
                <h1 className="font-display text-[38px] leading-none tracking-[-0.045em] text-num md:text-[48px]">
                  {mask(lensValue)}
                </h1>
                <button
                  type="button"
                  onClick={toggle}
                  aria-label={hidden ? "Show balances" : "Hide balances"}
                  className="grid size-8 place-items-center rounded-full bg-secondary press"
                >
                  {hidden ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{lensNote}</p>
              <div className="mt-4">
                <GrowthCurve series={WEEK_SERIES} />
              </div>
            </div>
          </article>

          {/* Quick actions tile */}
          <article className="k-glass rounded-[1.75rem] p-4 md:col-span-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Quick actions
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link
                to="/invest"
                className="flex items-center gap-3 rounded-2xl bg-accent/70 p-3 press"
              >
                <span className="grid size-9 place-items-center rounded-xl bg-gold text-gold-foreground shrink-0">
                  <ArrowDownLeft className="size-[18px]" strokeWidth={2} />
                </span>
                <span className="text-xs font-bold">Add Money</span>
              </Link>
              <Link
                to="/portfolio"
                className="flex items-center gap-3 rounded-2xl bg-accent/70 p-3 press"
              >
                <span className="grid size-9 place-items-center rounded-xl bg-brand text-primary-foreground shrink-0">
                  <ArrowUpRight className="size-[18px]" strokeWidth={2} />
                </span>
                <span className="text-xs font-bold">Withdraw</span>
              </Link>
              <Link
                to="/invest"
                className="flex items-center gap-3 rounded-2xl bg-accent/70 p-3 press"
              >
                <span className="grid size-9 place-items-center rounded-xl bg-teal text-teal-foreground shrink-0">
                  <PlusCircle className="size-[18px]" strokeWidth={2} />
                </span>
                <span className="text-xs font-bold">New Plan</span>
              </Link>
              <Link
                to="/portfolio"
                className="flex items-center gap-3 rounded-2xl bg-accent/70 p-3 press"
              >
                <span className="grid size-9 place-items-center rounded-xl bg-violet text-violet-foreground shrink-0">
                  <FileText className="size-[18px]" strokeWidth={2} />
                </span>
                <span className="text-xs font-bold">Statements</span>
              </Link>
            </div>
          </article>

          {/* Maturity ring tile */}
          <article className="k-glass rounded-[1.75rem] p-5 md:col-span-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Next maturity
                </p>
                <h2 className="mt-1 font-display text-base">{NEXT_MATURITY.name}</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {NEXT_MATURITY.rate} · {NEXT_MATURITY.tenor}
                </p>
              </div>
              <div className="relative grid size-[72px] place-items-center shrink-0">
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
                  <p className="font-display text-base leading-none">{NEXT_MATURITY.daysLeft}</p>
                  <p className="text-[9px] font-semibold text-muted-foreground">days</p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-2xl bg-secondary/60 px-4 py-3">
              <div>
                <p className="text-[10px] text-muted-foreground">Principal</p>
                <p className="font-display text-sm text-num">{mask(NEXT_MATURITY.amount)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground">Payout</p>
                <p className="font-display text-sm text-num text-gold">
                  {mask(NEXT_MATURITY.expectedPayout)}
                </p>
              </div>
            </div>
          </article>

          {/* Weekly interest tile */}
          <article className="k-glass rounded-[1.75rem] p-5 md:col-span-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Interest this week
            </p>
            <p className="mt-2 font-display text-2xl text-num">{mask(WEEK_EARNINGS)}</p>
            <div className="mt-4 flex items-end gap-1.5">
              {WEEK_SERIES.map((v, i) => (
                <div key={WEEK_LABELS[i]} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className={`w-2 rounded-full ${v === maxWeek ? "bg-gold" : "bg-brand/15"}`}
                    style={{ height: `${16 + (v / maxWeek) * 34}px` }}
                  />
                  <span className="text-[9px] font-semibold text-muted-foreground">
                    {WEEK_LABELS[i]?.slice(0, 1)}
                  </span>
                </div>
              ))}
            </div>
          </article>

          {/* Wallet nudge tile */}
          <article className="k-glass rounded-[1.75rem] p-5 md:col-span-4">
            <div className="flex items-start gap-3">
              <span className="grid size-10 place-items-center rounded-2xl bg-gold text-gold-foreground shrink-0">
                <Wallet className="size-[20px]" strokeWidth={2} />
              </span>
              <div>
                <p className="text-sm font-extrabold">{mask(WALLET)} idle in wallet</p>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                  Earns no interest. Move into Kipit Vault at 21.5% p.a.
                </p>
                <Link
                  to="/invest"
                  className="mt-3 inline-flex items-center gap-1 rounded-full bg-brand px-3.5 py-2 text-[11px] font-bold text-primary-foreground press"
                >
                  Invest wallet <ArrowUpRight className="size-3.5" />
                </Link>
              </div>
            </div>
          </article>

          {/* Plans row */}
          <section className="md:col-span-12">
            <div className="flex items-center justify-between px-1">
              <h2 className="font-display text-lg">Your plans</h2>
              <Link
                to="/portfolio"
                className="inline-flex items-center gap-1 text-xs font-bold text-brand press"
              >
                Portfolio <ChevronRight className="size-3.5" />
              </Link>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
              {HOLDINGS.map((h) => {
                const p = progress(h.totalDays, h.daysLeft);
                return (
                  <article key={h.name} className="k-glass rounded-[1.75rem] p-4 press">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate font-display text-[15px]">{h.name}</h3>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">Matures {h.date}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-accent px-2.5 py-1 text-[10px] font-extrabold text-accent-foreground">
                        {h.rate}
                      </span>
                    </div>
                    <p className="mt-3 font-display text-xl text-num">{mask(h.amount)}</p>
                    <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-brand-gradient"
                        style={{ width: `${p}%` }}
                      />
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[10px] font-semibold text-muted-foreground">
                      <span>{p}% complete</span>
                      <span>{h.daysLeft} days left</span>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* Upcoming payouts tile */}
          <article className="k-glass rounded-[1.75rem] p-5 md:col-span-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base">Upcoming payouts</h2>
              <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold text-muted-foreground">
                Next 30 days
              </span>
            </div>
            <ul className="mt-4 space-y-3">
              {PAYOUTS.slice(0, 3).map((p, i) => (
                <li
                  key={p.label}
                  className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3"
                >
                  <span className="flex flex-col items-center">
                    <span className={`size-2.5 rounded-full ${i === 0 ? "bg-gold" : "bg-brand/25"}`} />
                    {i < 2 && <span className="mt-1 h-6 w-px bg-border" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-semibold">{p.label}</span>
                    <span className="block text-[11px] text-muted-foreground">{p.date}</span>
                  </span>
                  <span className="shrink-0 font-display text-sm text-num">{mask(p.amount)}</span>
                </li>
              ))}
            </ul>
          </article>

          {/* Recommendation + For you tile */}
          <article className="k-glass rounded-[1.75rem] p-5 md:col-span-6">
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
              <span className="grid size-10 place-items-center rounded-2xl bg-brand text-primary-foreground shrink-0">
                <Lightbulb className="size-[20px]" strokeWidth={2} />
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
            </div>

            <ForYouBento className="mt-5" />
          </article>
        </div>
      </AppShell>
    </div>
  );
}
