import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
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
import { GreetingText, TierStatusCard, WalletNote } from "@/components/kipit/SpecBlocks";
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

export const Route = createFileRoute("/home-v3")({
  head: () => ({
    meta: [
      { title: "Kipit Home — Immersive Navy Console" },
      {
        name: "description",
        content:
          "An immersive Kipit home concept: full-bleed navy portfolio console with maturity countdown ring, wallet card, weekly interest and content feed.",
      },
      { property: "og:title", content: "Kipit Home — Immersive Navy Console" },
      {
        property: "og:description",
        content: "Immersive navy Kipit home dashboard with countdown ring and payout timeline.",
      },
    ],
  }),
  component: HomeV3Screen,
});

const RANGES = ["1W", "1M", "3M", "1Y"] as const;
const CURVE: Record<string, number[]> = {
  "1W": [70, 64, 68, 58, 62, 50, 44],
  "1M": [78, 70, 74, 60, 64, 48, 52, 36, 30],
  "3M": [86, 76, 80, 62, 56, 44, 34, 26],
  "1Y": [92, 84, 78, 82, 64, 66, 48, 40, 28, 18],
};
const DELTA: Record<string, string> = {
  "1W": "+₦12,480 · +0.42%",
  "1M": `+${naira(MONTH_CHANGE)} · +${MONTH_CHANGE_PCT}%`,
  "3M": "+₦121,400 · +4.3%",
  "1Y": "+₦398,400 · +15.6%",
};

function curvePath(values: number[]) {
  const step = 320 / (values.length - 1);
  return values.map((v, i) => `${(i * step).toFixed(1)},${v}`).join(" ");
}

const maxWeek = Math.max(...WEEK_SERIES);

function HomeV3Screen() {
  const { hidden, toggle, mask } = useBalanceVisibility();
  const isNewUser = useIsNewUser();
  const [range, setRange] = useState<string>("1M");
  const points = curvePath(CURVE[range] ?? CURVE["1M"]!);

  const ringR = 42;
  const ringC = 2 * Math.PI * ringR;
  const ringProgress =
    (NEXT_MATURITY.totalDays - NEXT_MATURITY.daysLeft) / NEXT_MATURITY.totalDays;

  return (
    <AppShell navVariant="morph">
      {isNewUser ? (
        <div className="pt-6">
          <NewUserEmptyState />
        </div>
      ) : (
        <>
          {/* Full-bleed navy console */}
          <section className="-mx-4 rounded-b-[2.25rem] bg-brand-gradient px-5 pb-8 pt-6 text-primary-foreground md:mx-0 md:rounded-[2rem] md:px-8 md:pb-10 md:pt-8">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <div className="min-w-0">
                <p className="text-xs text-primary-foreground/70">
                  <GreetingText />
                </p>
                <p className="truncate text-sm font-bold">Adaeze Okafor</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Logo tone="light" className="hidden text-lg sm:block" />
                <Link
                  to="/notifications"
                  aria-label="Notifications"
                  className="relative grid size-10 place-items-center rounded-full bg-white/12"
                >
                  <Bell className="size-5" />
                  <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-gold" />
                </Link>
                <Link
                  to="/settings"
                  aria-label="Profile"
                  className="grid size-10 place-items-center rounded-full bg-gold-gradient text-sm font-bold text-gold-foreground"
                >
                  AO
                </Link>
              </div>
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-center">
              <div>
                <div className="flex items-center gap-2 text-xs text-primary-foreground/70">
                  Total portfolio value
                  <button
                    type="button"
                    onClick={toggle}
                    aria-label={hidden ? "Show balances" : "Hide balances"}
                  >
                    {hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <p className="mt-1 text-4xl font-extrabold tracking-tight md:text-6xl">
                  {mask(TOTAL)}
                </p>
                <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
                  <ArrowUpRight className="size-3.5" /> {DELTA[range]}
                </p>

                <svg
                  viewBox="0 0 320 100"
                  preserveAspectRatio="none"
                  className="mt-6 h-28 w-full md:h-32"
                >
                  <defs>
                    <linearGradient id="v3Fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.84 0.155 88 / 0.4)" />
                      <stop offset="100%" stopColor="oklch(0.84 0.155 88 / 0)" />
                    </linearGradient>
                  </defs>
                  <polygon points={`${points} 320,100 0,100`} fill="url(#v3Fill)" />
                  <polyline
                    points={points}
                    fill="none"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    stroke="oklch(0.86 0.15 92)"
                  />
                </svg>

                <div className="mt-4 flex gap-2">
                  {RANGES.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRange(r)}
                      className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
                        range === r
                          ? "bg-gold-gradient text-gold-foreground"
                          : "bg-white/10 text-primary-foreground/75"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Maturity countdown ring */}
              <div className="flex items-center gap-5 rounded-3xl bg-white/10 p-5">
                <div className="relative grid shrink-0 place-items-center">
                  <svg viewBox="0 0 100 100" className="size-28 -rotate-90">
                    <circle
                      cx="50"
                      cy="50"
                      r={ringR}
                      fill="none"
                      strokeWidth="8"
                      stroke="oklch(1 0 0 / 0.18)"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r={ringR}
                      fill="none"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={ringC}
                      strokeDashoffset={ringC * (1 - ringProgress)}
                      className="stroke-gold"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <p className="text-2xl font-extrabold leading-none">
                      {NEXT_MATURITY.daysLeft}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/70">
                      days left
                    </p>
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-primary-foreground/70">
                    Next maturity
                  </p>
                  <p className="mt-1 text-sm font-bold">
                    {NEXT_MATURITY.name} · {NEXT_MATURITY.tenor}
                  </p>
                  <p className="mt-1 text-2xl font-extrabold">{mask(NEXT_MATURITY.amount)}</p>
                  <p className="mt-1 text-xs text-primary-foreground/70">
                    Matures {NEXT_MATURITY.date} · payout{" "}
                    {mask(NEXT_MATURITY.expectedPayout)}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick actions inside the console */}
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {QUICK_ACTIONS.map(({ label, icon: Icon, to }) => (
                <Link
                  key={label}
                  to={to}
                  className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold transition-colors hover:bg-white/20"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-gold-gradient text-gold-foreground">
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0 truncate text-[13px]">{label}</span>
                </Link>
              ))}
            </div>
          </section>

          {/* Wallet + weekly earnings */}
          <section className="mt-5 grid gap-4 md:grid-cols-2">
            <article className="rounded-3xl border border-border bg-surface p-6 shadow-card">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                <Wallet className="size-4" /> Wallet
              </div>
              <p className="mt-3 text-3xl font-extrabold tracking-tight">{mask(WALLET)}</p>
              <p className="mt-1 text-xs font-semibold text-muted-foreground">
                Available funds: {mask(WALLET)}
              </p>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                Funds in your wallet are available for investment or withdrawal anytime and do
                not earn interest or investment returns.
              </p>
              <div className="mt-5 flex gap-2">
                <Link
                  to="/invest"
                  className="flex-1 rounded-full bg-brand px-4 py-3 text-center text-sm font-bold text-brand-foreground"
                >
                  Add money
                </Link>
                <Link
                  to="/portfolio"
                  className="flex-1 rounded-full border border-border px-4 py-3 text-center text-sm font-bold"
                >
                  Withdraw
                </Link>
              </div>
            </article>

            <article className="rounded-3xl border border-border bg-surface p-6 shadow-card">
              <div className="flex items-baseline justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Weekly earnings
                </p>
                <span className="text-xs font-bold text-success">+8.2%</span>
              </div>
              <p className="mt-2 text-3xl font-extrabold text-gold">{mask(WEEK_EARNINGS)}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Interest earned in the last 7 days · invested {mask(INVESTED)}
              </p>
              <div className="mt-5 flex h-24 items-end gap-2">
                {WEEK_SERIES.map((v, i) => (
                  <div key={WEEK_LABELS[i]} className="flex flex-1 flex-col items-center gap-1.5">
                    <span
                      className="w-full rounded-t-lg bg-gold-gradient"
                      style={{ height: `${(v / maxWeek) * 72}px` }}
                    />
                    <span className="text-[10px] font-semibold text-muted-foreground">
                      {WEEK_LABELS[i]}
                    </span>
                  </div>
                ))}
              </div>
            </article>
          </section>

          {/* Holdings + payout timeline */}
          <section className="mt-4 grid gap-4 lg:grid-cols-2">
            <article className="rounded-3xl border border-border bg-surface p-6 shadow-card">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold">Your plans</h2>
                <Link to="/portfolio" className="text-xs font-bold text-brand">
                  Portfolio
                </Link>
              </div>
              <ul className="mt-4 space-y-4">
                {HOLDINGS.map((h) => (
                  <li key={h.name}>
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold">{h.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {h.rate} · {h.date} · {h.daysLeft} days left
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-extrabold">{mask(h.amount)}</p>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                      <span
                        className="block h-full rounded-full bg-brand-gradient"
                        style={{
                          width: `${Math.round(
                            ((h.totalDays - h.daysLeft) / h.totalDays) * 100,
                          )}%`,
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </article>

            <article className="rounded-3xl border border-border bg-surface p-6 shadow-card">
              <h2 className="text-base font-extrabold">Upcoming payouts</h2>
              <ul className="mt-4 space-y-4">
                {PAYOUTS.map((p) => (
                  <li key={p.label} className="flex gap-3">
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-gold" />
                    <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{p.label}</p>
                        <p className="text-xs text-muted-foreground">{p.date}</p>
                      </div>
                      <p className="shrink-0 text-sm font-extrabold text-success">
                        +{mask(p.amount)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </article>
          </section>

          {/* Recommendation */}
          <section className="mt-4 grid gap-4 rounded-3xl border border-gold/40 bg-accent p-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
            <div className="flex min-w-0 gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-gold-gradient text-gold-foreground">
                <Lightbulb className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-accent-foreground">
                  Your {naira(WALLET)} wallet balance isn't currently invested.
                </p>
                <p className="mt-1 text-xs text-accent-foreground/80">
                  Plans from 18.5% p.a. · 30–365 day tenors · ₦50,000 minimum.
                </p>
              </div>
            </div>
            <Link
              to="/explore"
              className="inline-flex items-center justify-center gap-1 rounded-full bg-brand px-5 py-3 text-sm font-bold text-brand-foreground"
            >
              Explore Investments <ChevronRight className="size-4" />
            </Link>
          </section>

          {/* Content feed */}
          <section className="mt-8">
            <h2 className="text-lg font-extrabold tracking-tight">For you</h2>
            <div className="-mx-4 mt-3 flex gap-3 overflow-x-auto px-4 pb-2 no-scrollbar md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
              {FEED.map((item, i) => (
                <article
                  key={item.title}
                  className="w-72 shrink-0 rounded-3xl border border-border bg-surface p-5 shadow-card md:w-auto"
                >
                  <FeedThumb index={i} />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                    {item.tag}
                  </span>
                  <h3 className="mt-2 text-sm font-bold leading-snug">{item.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-8 space-y-3">
            <TierStatusCard />
            <WalletNote />
          </section>
        </>
      )}
    </AppShell>
  );
}
