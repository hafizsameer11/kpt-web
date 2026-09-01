import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  Eye,
  EyeOff,
  Plus,
  Receipt,
  Sparkles,
  Wallet,
} from "lucide-react";
import { AppShell } from "@/components/kipit/AppShell";
import { Logo } from "@/components/kipit/Logo";

export const Route = createFileRoute("/home-v2")({
  head: () => ({
    meta: [
      { title: "Kipit Home (New Design) — Bento Dashboard" },
      {
        name: "description",
        content:
          "An alternate Kipit home experience: light bento dashboard in Kipit navy and gold, with portfolio, wallet, earnings and maturity cards.",
      },
      { property: "og:title", content: "Kipit Home (New Design) — Bento Dashboard" },
      {
        property: "og:description",
        content: "A bold new take on the Kipit home dashboard.",
      },
    ],
  }),
  component: HomeV2Screen,
});

const naira = (value: number) =>
  `₦${value.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;

const QUICK_ACTIONS = [
  { label: "Add Money", icon: ArrowDownLeft },
  { label: "Withdraw", icon: ArrowUpRight },
  { label: "New Plan", icon: Plus },
  { label: "Statements", icon: Receipt },
];

const RANGES = ["1W", "1M", "6M", "1Y", "All"];

const SPARK_POINTS =
  "0,86 30,78 60,82 90,64 120,70 150,52 180,58 210,40 240,46 270,28 300,34 330,18 360,24";

const FEED = [
  {
    tag: "Product update",
    title: "Kipit Fixed Income now settles same-day",
    body: "Maturity payouts land in your wallet within minutes of maturity.",
  },
  {
    tag: "Education",
    title: "Understanding tenor and effective yield",
    body: "A 3-minute read on how rate and tenor shape your real return.",
  },
  {
    tag: "Announcement",
    title: "Tier 2 verification is now instant",
    body: "Upgrade with your BVN and NIN to raise your transaction limits.",
  },
];

function CountdownRing({ daysLeft, total }: { daysLeft: number; total: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const progress = 1 - daysLeft / total;
  return (
    <svg viewBox="0 0 84 84" className="size-24 -rotate-90">
      <circle
        cx="42"
        cy="42"
        r={r}
        fill="none"
        strokeWidth="8"
        className="stroke-secondary"
      />
      <circle
        cx="42"
        cy="42"
        r={r}
        fill="none"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - progress)}
        className="stroke-gold"
      />
    </svg>
  );
}

function HomeV2Screen() {
  const [hidden, setHidden] = useState(false);
  const [range, setRange] = useState("1M");
  const mask = (value: number) => (hidden ? "₦ • • • • • •" : naira(value));

  return (
    <div className="theme-v2">
      <AppShell>
        {/* Mobile header */}
        <header className="-mx-4 -mt-0 mb-6 border-b border-border bg-surface px-5 pb-6 pt-5 md:hidden">
          <div className="flex items-center justify-between">
            <Logo tone="brand" className="font-display text-2xl" />
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Notifications"
                className="relative grid size-10 place-items-center rounded-full border border-border bg-secondary text-foreground"
              >
                <Bell className="size-5" />
                <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-gold" />
              </button>
              <div className="grid size-10 place-items-center rounded-full bg-gold-gradient text-sm font-bold text-gold-foreground">
                AO
              </div>
            </div>
          </div>
        </header>

        {/* Hero portfolio panel */}
        <section className="grid gap-4 lg:grid-cols-3">
          <article className="relative overflow-hidden rounded-3xl border border-border bg-brand-gradient p-6 text-primary-foreground shadow-card md:p-8 lg:col-span-2">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-white/10 blur-3xl"
            />
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground/70">
                  Good morning, Adaeze
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
                    {mask(2450000)}
                  </h1>
                  <button
                    type="button"
                    onClick={() => setHidden((v) => !v)}
                    aria-label={hidden ? "Show balances" : "Hide balances"}
                    className="grid size-9 place-items-center rounded-full border border-white/25 bg-white/10 text-primary-foreground/80 transition-colors hover:bg-white/20 hover:text-primary-foreground"
                  >
                    {hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-bold text-[oklch(0.87_0.15_94)]">
                  <ArrowUpRight className="size-3.5" /> +₦38,200 · +1.58% this month
                </p>
              </div>
              <div className="hidden gap-1 rounded-full border border-white/20 bg-white/10 p-1 md:flex">
                {RANGES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRange(r)}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                      range === r
                        ? "bg-gold-gradient text-gold-foreground"
                        : "text-primary-foreground/70 hover:text-primary-foreground"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <svg viewBox="0 0 360 100" className="mt-6 h-24 w-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.84 0.155 88 / 0.35)" />
                  <stop offset="100%" stopColor="oklch(0.84 0.155 88 / 0)" />
                </linearGradient>
              </defs>
              <polygon points={`${SPARK_POINTS} 360,100 0,100`} fill="url(#sparkFill)" />
              <polyline
                points={SPARK_POINTS}
                fill="none"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                stroke="oklch(0.86 0.15 92)"
              />
            </svg>

            <div className="mt-4 flex gap-1 overflow-x-auto no-scrollbar md:hidden">
              {RANGES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRange(r)}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
                    range === r
                      ? "bg-gold-gradient text-gold-foreground"
                      : "border border-white/20 bg-white/10 text-primary-foreground/80"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </article>

          {/* Wallet panel */}
          <article className="flex flex-col justify-between rounded-3xl border border-border bg-surface p-6 shadow-card">
            <div>
              <div className="flex items-center justify-between">
                <span className="grid size-11 place-items-center rounded-2xl bg-gold/15 text-gold">
                  <Wallet className="size-5" />
                </span>
                <span className="rounded-full border border-border px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  Wallet
                </span>
              </div>
              <p className="mt-5 font-display text-3xl font-bold tracking-tight">
                {mask(500000)}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Available to invest or withdraw. Wallet funds do not earn returns.
              </p>
            </div>
            <button
              type="button"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-bold text-gold-foreground shadow-float transition-transform active:scale-95"
            >
              <Plus className="size-4" /> Fund wallet
            </button>
          </article>
        </section>

        {/* Quick actions — pill row */}
        <section className="mt-4 grid grid-cols-4 gap-2 md:gap-3">
          {QUICK_ACTIONS.map(({ label, icon: Icon }) => (
            <button
              key={label}
              type="button"
              className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface p-3.5 shadow-card transition-all hover:border-gold/50 active:scale-95 md:flex-row md:justify-center md:gap-2.5"
            >
              <Icon className="size-5 text-gold transition-transform group-hover:-translate-y-0.5" />
              <span className="text-[11px] font-semibold leading-tight md:text-sm">
                {label}
              </span>
            </button>
          ))}
        </section>

        {/* Earnings + maturity + nudge */}
        <section className="mt-4 grid gap-4 md:grid-cols-3">
          <article className="rounded-3xl border border-border bg-surface p-6 shadow-card">
            <div className="flex items-baseline justify-between">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Weekly earnings
              </p>
              <span className="text-xs font-bold text-success">+8.2%</span>
            </div>
            <p className="mt-3 font-display text-3xl font-bold tracking-tight text-gold">
              {mask(12480)}
            </p>
            <div className="mt-5 flex h-16 items-end gap-1.5">
              {[38, 52, 44, 66, 58, 80, 72].map((h, i) => (
                <span
                  key={i}
                  style={{ height: `${h}%` }}
                  className={`flex-1 rounded-full ${
                    i === 5 ? "bg-gold-gradient" : "bg-secondary"
                  }`}
                />
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[10px] font-semibold text-muted-foreground">
              <span>Mon</span>
              <span>Sun</span>
            </div>
          </article>

          <article className="flex items-center gap-5 rounded-3xl border border-border bg-surface p-6 shadow-card">
            <div className="relative grid shrink-0 place-items-center">
              <CountdownRing daysLeft={23} total={90} />
              <div className="absolute text-center">
                <p className="font-display text-xl font-bold leading-none">23</p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                  days
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Next maturity
              </p>
              <p className="mt-1.5 text-sm font-bold">Kipit Fixed Income · 90 days</p>
              <p className="mt-1 font-display text-2xl font-bold tracking-tight">
                {mask(750000)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Matures 14 Oct 2026</p>
            </div>
          </article>

          <article className="flex flex-col justify-between rounded-3xl border border-gold/30 bg-accent/40 p-6 shadow-card">
            <div className="flex gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gold-gradient text-gold-foreground">
                <Sparkles className="size-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-foreground">
                  {mask(500000)} is sitting idle in your wallet.
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Plans from 18.5% p.a. · 30–365 day tenors · ₦50,000 minimum.
                </p>
              </div>
            </div>
            <button
              type="button"
              className="mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-gold bg-transparent px-5 py-3 text-sm font-bold text-gold transition-colors hover:bg-gold hover:text-gold-foreground"
            >
              Explore Investments <ArrowUpRight className="size-4" />
            </button>
          </article>
        </section>

        {/* Feed — horizontal scroll on mobile, grid on desktop */}
        <section className="mt-8">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-xl font-bold tracking-tight">For you</h2>
            <button type="button" className="text-xs font-bold text-gold">
              View all
            </button>
          </div>
          <div className="-mx-4 mt-4 flex gap-3 overflow-x-auto px-4 pb-2 no-scrollbar md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
            {FEED.map((item, i) => (
              <article
                key={item.title}
                className={`w-72 shrink-0 rounded-3xl border border-border p-5 shadow-card transition-colors hover:border-gold/40 md:w-auto ${
                  i === 0 ? "bg-brand-gradient text-primary-foreground" : "bg-surface"
                }`}
              >
                <span
                  className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${
                    i === 0
                      ? "border border-white/25 bg-white/10 text-[oklch(0.87_0.15_94)]"
                      : "border border-gold/40 bg-gold/10 text-gold"
                  }`}
                >
                  {item.tag}
                </span>
                <h3 className="mt-3 font-display text-base font-bold leading-snug">
                  {item.title}
                </h3>
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

        {/* Design switcher */}
        <Link
          to="/"
          className="fixed bottom-24 right-4 z-50 inline-flex items-center gap-1.5 rounded-full border border-gold/50 bg-surface px-4 py-2 text-xs font-bold text-gold shadow-float md:bottom-6"
        >
          ← Design 1
        </Link>
        <Link
          to="/home-v3"
          className="fixed bottom-[8.5rem] right-4 z-50 inline-flex items-center gap-1.5 rounded-full bg-gold px-4 py-2 text-xs font-bold text-gold-foreground shadow-float md:bottom-[4.5rem]"
        >
          Try design 3 →
        </Link>
      </AppShell>
    </div>
  );
}
