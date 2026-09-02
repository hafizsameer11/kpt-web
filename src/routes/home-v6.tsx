import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
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
import { FeedThumb } from "@/components/kipit/FeedThumb";
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

export const Route = createFileRoute("/home-v6")({
  head: () => ({
    meta: [
      { title: "Kipit Home 6 — Midnight Wealth Console" },
      {
        name: "description",
        content:
          "Kipit Home 6: an immersive midnight mobile home with a living balance orbit, glass cards, plan deck, maturity countdown and payout timeline.",
      },
      { property: "og:title", content: "Kipit Home 6 — Midnight Wealth Console" },
      {
        property: "og:description",
        content:
          "An immersive dark mobile home screen for Kipit: balance orbit, glass modules, plan deck and upcoming payouts.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomeV6Screen,
});

const LENSES = ["Total", "Invested", "Wallet"] as const;
type Lens = (typeof LENSES)[number];

const pct = (totalDays: number, daysLeft: number) =>
  Math.round(((totalDays - daysLeft) / totalDays) * 100);

/** Counts a number up on mount / when the value changes. */
function useCountUp(value: number, duration = 900) {
  const [n, setN] = useState(value);
  useEffect(() => {
    let raf = 0;
    const from = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(from + (value - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return n;
}

/** Concentric allocation orbit — one gold arc per plan, sized by weight. */
function AllocationOrbit({ hidden }: { hidden: boolean }) {
  const total = HOLDINGS.reduce((s, h) => s + h.amount, 0);
  return (
    <div className="relative grid size-[168px] shrink-0 place-items-center md:size-[196px]">
      <div
        aria-hidden
        className="absolute inset-3 rounded-full bg-gold/20 blur-2xl k-breathe"
      />
      <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
        {HOLDINGS.map((h, i) => {
          const r = 44 - i * 11;
          const c = 2 * Math.PI * r;
          const share = h.amount / total;
          return (
            <g key={h.name}>
              <circle
                cx="50"
                cy="50"
                r={r}
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className="text-white/10"
              />
              <circle
                cx="50"
                cy="50"
                r={r}
                fill="none"
                stroke="var(--gold)"
                strokeOpacity={1 - i * 0.24}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${share * c} ${c}`}
                className="k-draw"
              />
            </g>
          );
        })}
      </svg>
      <div className="relative text-center">
        <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-primary-foreground/50">
          Invested
        </p>
        <p className="font-display text-[22px] leading-tight text-num md:text-2xl">
          {hidden ? "••••••" : naira(INVESTED)}
        </p>
        <p className="text-[10px] text-primary-foreground/55">
          {HOLDINGS.length} active plans
        </p>
      </div>
    </div>
  );
}

/** Smooth growth curve with a glowing gold stroke. */
function GrowthCurve({ series }: { series: number[] }) {
  const { line, area } = useMemo(() => {
    const w = 300;
    const h = 90;
    const max = Math.max(...series);
    const min = Math.min(...series);
    const span = max - min || 1;
    const pts = series.map((v, i) => {
      const x = (i / (series.length - 1)) * w;
      const y = h - 12 - ((v - min) / span) * (h - 30);
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
    <svg viewBox="0 0 300 90" preserveAspectRatio="none" className="h-20 w-full md:h-28">
      <defs>
        <linearGradient id="k6-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#k6-fill)" />
      <path
        d={line}
        fill="none"
        stroke="var(--gold)"
        strokeWidth="2.5"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        className="k-draw"
      />
    </svg>
  );
}

function HomeV6Screen() {
  const { hidden, toggle, mask } = useBalanceVisibility();
  const isNewUser = useIsNewUser();
  const [lens, setLens] = useState<Lens>("Total");

  const lensValue = lens === "Total" ? TOTAL : lens === "Invested" ? INVESTED : WALLET;
  const animated = useCountUp(lensValue);
  const lensNote =
    lens === "Total"
      ? `${naira(MONTH_CHANGE)} (+${MONTH_CHANGE_PCT}%) this month`
      : lens === "Invested"
        ? `${HOLDINGS.length} active plans earning daily`
        : "Available now · earns no interest";

  const maxWeek = Math.max(...WEEK_SERIES);
  const ringPct = pct(NEXT_MATURITY.totalDays, NEXT_MATURITY.daysLeft);

  if (isNewUser) {
    return (
      <div className="type-h6">
        <AppShell title="Home" navVariant="orbit">
          <div className="pt-5">
            <NewUserEmptyState />
          </div>
        </AppShell>
      </div>
    );
  }

  return (
    <div className="type-h6">
      <AppShell title="Home" navVariant="orbit">
        {/* ── Midnight canvas: everything lives on one continuous dark field ── */}
        <div className="relative -mx-4 overflow-hidden bg-brand-gradient px-4 pb-7 pt-4 text-primary-foreground md:mx-0 md:rounded-[2.25rem] md:px-8 md:pb-10 md:pt-7">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-24 top-24 size-72 rounded-full bg-gold/20 blur-3xl k-breathe"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-28 -top-28 size-80 rounded-full bg-white/10 blur-3xl"
          />

          {/* Header */}
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

          {/* Balance + orbit */}
          <section className="relative mt-6 md:grid md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-8">
            <div>
              <div className="inline-flex rounded-full bg-white/10 p-1">
                {LENSES.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLens(l)}
                    className={`rounded-full px-3.5 py-1.5 text-[11px] font-bold transition-colors ${
                      lens === l
                        ? "bg-gold-gradient text-gold-foreground"
                        : "text-primary-foreground/60"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-2.5">
                <h1 className="font-display text-[42px] leading-none tracking-[-0.04em] text-num md:text-[60px]">
                  {hidden ? "••••••••" : naira(animated)}
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
              <p className="mt-2 text-[12px] text-primary-foreground/70">{lensNote}</p>

              <div className="mt-4">
                <GrowthCurve series={WEEK_SERIES} />
                <div className="mt-1 flex justify-between text-[9px] font-semibold text-primary-foreground/40">
                  {WEEK_LABELS.map((d) => (
                    <span key={d}>{d.slice(0, 1)}</span>
                  ))}
                </div>
                <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold text-gold">
                  <ArrowUpRight className="size-3.5" /> {mask(WEEK_EARNINGS)} interest this week
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-center md:mt-0">
              <AllocationOrbit hidden={hidden} />
            </div>
          </section>

          {/* Quick actions — glass rail */}
          <section className="relative mt-7 grid grid-cols-4 gap-2 rounded-[1.75rem] border border-white/12 bg-white/[0.07] p-3 backdrop-blur md:gap-4 md:p-5">
            {QUICK_ACTIONS.map((a) => (
              <Link
                key={a.label}
                to={a.to}
                className="flex flex-col items-center gap-1.5 text-[10px] font-bold text-primary-foreground press md:text-xs"
              >
                <span className="grid size-11 place-items-center rounded-[1rem] bg-gold-gradient text-gold-foreground shadow-float md:size-12">
                  <a.icon className="size-[18px]" strokeWidth={2} />
                </span>
                <span className="text-center leading-tight">{a.label}</span>
              </Link>
            ))}
          </section>

          <div className="md:grid md:grid-cols-3 md:gap-5">
            {/* Maturity countdown */}
            <article className="relative mt-4 rounded-[1.75rem] border border-white/12 bg-white/[0.06] p-4 backdrop-blur md:col-span-2 md:mt-5 md:p-6">
              <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4">
                <div className="relative grid size-[76px] shrink-0 place-items-center md:size-24">
                  <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90">
                    <circle
                      cx="18"
                      cy="18"
                      r="15.5"
                      fill="none"
                      stroke="currentColor"
                      className="text-white/12"
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
                      className="k-draw"
                    />
                  </svg>
                  <div className="text-center">
                    <p className="font-display text-lg leading-none md:text-2xl">
                      {NEXT_MATURITY.daysLeft}
                    </p>
                    <p className="text-[9px] font-semibold text-primary-foreground/55">days</p>
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-foreground/55">
                    Next maturity
                  </p>
                  <h2 className="mt-1 truncate font-display text-base md:text-xl">
                    {NEXT_MATURITY.name}
                  </h2>
                  <p className="mt-1 text-[11px] text-primary-foreground/65 md:text-xs">
                    {NEXT_MATURITY.rate} · {NEXT_MATURITY.tenor} · matures {NEXT_MATURITY.date}
                  </p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-primary-foreground/65 md:text-xs">
                    <span>
                      Principal{" "}
                      <span className="font-bold text-primary-foreground">
                        {mask(NEXT_MATURITY.amount)}
                      </span>
                    </span>
                    <span>
                      Payout{" "}
                      <span className="font-bold text-gold">
                        {mask(NEXT_MATURITY.expectedPayout)}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </article>

            {/* Weekly interest */}
            <article className="mt-3 rounded-[1.75rem] border border-white/12 bg-white/[0.06] p-4 backdrop-blur md:mt-5 md:p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-foreground/55">
                Interest this week
              </p>
              <p className="mt-1.5 font-display text-2xl text-num md:text-3xl">
                {mask(WEEK_EARNINGS)}
              </p>
              <div className="mt-4 flex items-end gap-1.5">
                {WEEK_SERIES.map((v, i) => (
                  <div key={WEEK_LABELS[i]} className="flex flex-1 flex-col items-center gap-1.5">
                    <div
                      className={`w-2 rounded-full ${v === maxWeek ? "bg-gold" : "bg-white/20"}`}
                      style={{ height: `${16 + (v / maxWeek) * 38}px` }}
                    />
                    <span className="text-[9px] font-semibold text-primary-foreground/50">
                      {WEEK_LABELS[i]?.slice(0, 1)}
                    </span>
                  </div>
                ))}
              </div>
            </article>
          </div>

          {/* Plan deck */}
          <section className="mt-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg md:text-xl">Your plans</h2>
              <Link
                to="/portfolio"
                className="inline-flex items-center gap-1 text-xs font-bold text-gold press"
              >
                Portfolio <ChevronRight className="size-3.5" />
              </Link>
            </div>
            <div className="mt-3 space-y-2.5 md:grid md:grid-cols-3 md:gap-4 md:space-y-0">
              {HOLDINGS.map((h, i) => {
                const p = pct(h.totalDays, h.daysLeft);
                return (
                  <article
                    key={h.name}
                    className={`relative overflow-hidden rounded-[1.6rem] border border-white/12 bg-white/[0.06] p-4 backdrop-blur press hover:-translate-y-0.5 md:p-5 ${
                      i >= 2 ? "hidden md:block" : ""
                    }`}
                  >
                    <span
                      aria-hidden
                      className="absolute inset-y-0 left-0 w-1 bg-gold-gradient"
                    />
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 pl-1">
                      <div className="min-w-0">
                        <h3 className="truncate font-display text-[15px] md:text-base">
                          {h.name}
                        </h3>
                        <p className="mt-0.5 text-[11px] text-primary-foreground/60">
                          Matures {h.date}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-gold/20 px-2.5 py-1 text-[10px] font-extrabold text-gold">
                        {h.rate}
                      </span>
                    </div>
                    <p className="mt-3 pl-1 font-display text-xl text-num md:text-2xl">
                      {mask(h.amount)}
                    </p>
                    <div className="ml-1 mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/12">
                      <div
                        className="h-full rounded-full bg-gold-gradient"
                        style={{ width: `${p}%` }}
                      />
                    </div>
                    <div className="ml-1 mt-1.5 flex items-center justify-between text-[10px] font-semibold text-primary-foreground/55">
                      <span>{p}% of tenor complete</span>
                      <span>{h.daysLeft} days left</span>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* Idle wallet nudge */}
          <section className="mt-5 overflow-hidden rounded-[1.75rem] border border-gold/35 bg-gold/[0.12] p-4 backdrop-blur md:mt-6 md:p-6">
            <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-gold-gradient text-gold-foreground">
                <Wallet className="size-[18px]" strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-extrabold">
                  {mask(WALLET)} in your wallet earns no interest
                </p>
                <p className="mt-1 text-xs leading-relaxed text-primary-foreground/70">
                  Wallet funds are available for withdrawal at any time. Move them into Kipit
                  Vault at 21.5% p.a. to earn about ₦8,958 a month.
                </p>
                <Link
                  to="/invest"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-gold-gradient px-4 py-2 text-xs font-bold text-gold-foreground press"
                >
                  Invest wallet balance <ArrowUpRight className="size-3.5" />
                </Link>
              </div>
            </div>
          </section>

          {/* Upcoming payouts */}
          <section className="mt-4 rounded-[1.75rem] border border-white/12 bg-white/[0.06] p-4 backdrop-blur md:mt-5 md:p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg md:text-xl">Upcoming payouts</h2>
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold text-primary-foreground/60">
                Next 30 days
              </span>
            </div>
            <ul className="mt-3 space-y-3">
              {PAYOUTS.map((p, i) => (
                <li
                  key={p.label}
                  className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3"
                >
                  <span className="flex flex-col items-center">
                    <span
                      className={`size-2.5 rounded-full ${i === 0 ? "bg-gold" : "bg-white/25"}`}
                    />
                    {i < PAYOUTS.length - 1 && <span className="mt-1 h-6 w-px bg-white/15" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-semibold">{p.label}</span>
                    <span className="block text-[11px] text-primary-foreground/55">{p.date}</span>
                  </span>
                  <span className="shrink-0 font-display text-sm text-num">{mask(p.amount)}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Recommendation */}
          <section className="mt-4 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-[1.75rem] border border-white/12 bg-white/[0.06] p-4 backdrop-blur md:mt-5 md:p-6">
            <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-white/12 text-gold">
              <Lightbulb className="size-[18px]" strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">Recommended: Kipit Vault (365 days)</p>
              <p className="mt-0.5 text-[11px] text-primary-foreground/60">
                21.5% p.a. · matches your long-tenor pattern
              </p>
            </div>
            <Link
              to="/invest"
              className="shrink-0 rounded-full bg-gold-gradient px-3.5 py-2 text-[11px] font-bold text-gold-foreground press"
            >
              View
            </Link>
          </section>
        </div>

        {/* ── For you (Home 1 treatment, on the light page surface) ─────── */}
        <section className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg md:text-xl">For you</h2>
            <Link
              to="/explore"
              className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground press hover:bg-secondary"
            >
              View all
            </Link>
          </div>
          <div className="-mx-4 mt-3 flex gap-3 overflow-x-auto px-4 pb-2 no-scrollbar md:mx-0 md:mt-4 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
            {FEED.map((item, i) => (
              <article
                key={item.title}
                className={`w-[16.5rem] shrink-0 rounded-3xl border border-border p-4 shadow-card press hover:-translate-y-0.5 hover:shadow-float md:w-auto md:p-5 ${
                  i === 0 ? "bg-brand-gradient text-primary-foreground" : "bg-surface"
                }`}
              >
                <FeedThumb index={i} />
                <span
                  className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${
                    i === 0
                      ? "border border-white/20 bg-white/10 text-primary-foreground/85"
                      : "border border-border bg-secondary text-muted-foreground"
                  }`}
                >
                  {item.tag}
                </span>
                <h3 className="mt-3 font-display text-base leading-snug">{item.title}</h3>
                <p
                  className={`mt-1.5 text-xs leading-relaxed ${
                    i === 0 ? "text-primary-foreground/75" : "text-muted-foreground"
                  }`}
                >
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </section>
      </AppShell>
    </div>
  );
}
