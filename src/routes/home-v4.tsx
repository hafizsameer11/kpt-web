import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpRight,
  ArrowUpFromLine,
  Bell,
  Compass,
  Eye,
  EyeOff,
  Home,
  PieChart,
  PlusCircle,
  Settings,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/kipit/Logo";

export const Route = createFileRoute("/home-v4")({
  head: () => ({
    meta: [
      { title: "Kipit Home — Editorial Concept" },
      {
        name: "description",
        content:
          "An editorial magazine-style home for Kipit: portfolio headline, plan ledger and curated stories.",
      },
      { property: "og:title", content: "Kipit Home — Editorial Concept" },
      {
        property: "og:description",
        content:
          "Track your portfolio, wallet and investment plans with Kipit.",
      },
    ],
  }),
  component: HomeV4,
});

const naira = (value: number) =>
  `₦${value.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;

type Tab = { label: string; to: string; icon: LucideIcon };
const TABS: Tab[] = [
  { label: "Home", to: "/home-v4", icon: Home },
  { label: "Invest", to: "/invest", icon: TrendingUp },
  { label: "Explore", to: "/explore", icon: Compass },
  { label: "Portfolio", to: "/portfolio", icon: PieChart },
  { label: "Settings", to: "/settings", icon: Settings },
];

const PLANS = [
  {
    name: "Kipit Fixed Income",
    tenor: "90 days",
    rate: "18.5% p.a.",
    amount: 750000,
    matures: "14 Oct 2026",
    daysLeft: 23,
    progress: 74,
  },
  {
    name: "Kipit Yield Note",
    tenor: "180 days",
    rate: "21.0% p.a.",
    amount: 1200000,
    matures: "02 Dec 2026",
    daysLeft: 72,
    progress: 48,
  },
  {
    name: "Kipit Starter",
    tenor: "30 days",
    rate: "15.0% p.a.",
    amount: 500000,
    matures: "30 Sep 2026",
    daysLeft: 9,
    progress: 88,
  },
];

const STORIES = [
  {
    tag: "Product update",
    title: "Fixed Income now settles same-day",
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

function HomeV4() {
  const [hidden, setHidden] = useState(false);
  const mask = (value: number) => (hidden ? "₦••••••" : naira(value));
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop: centered pill nav */}
      <header className="sticky top-4 z-40 hidden md:block">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-6 rounded-full border border-border bg-surface/95 py-2 pl-5 pr-2 shadow-card backdrop-blur">
          <Logo className="text-xl" />
          <nav className="flex items-center gap-1">
            {TABS.map((tab) => {
              const active = pathname === tab.to;
              return (
                <Link
                  key={tab.to}
                  to={tab.to}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-brand text-brand-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Notifications"
              className="relative grid size-10 place-items-center rounded-full bg-secondary text-foreground"
            >
              <Bell className="size-5" />
              <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-gold" />
            </button>
            <div className="grid size-10 place-items-center rounded-full bg-brand text-sm font-bold text-brand-foreground">
              AO
            </div>
          </div>
        </div>
      </header>

      {/* Mobile: slim top bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/95 px-5 py-3 backdrop-blur md:hidden">
        <Logo className="text-xl" />
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Notifications"
            className="relative grid size-9 place-items-center rounded-full bg-secondary"
          >
            <Bell className="size-4" />
            <span className="absolute right-2 top-2 size-1.5 rounded-full bg-gold" />
          </button>
          <div className="grid size-9 place-items-center rounded-full bg-brand text-xs font-bold text-brand-foreground">
            AO
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-5 pb-32 pt-8 md:pb-20 md:pt-12">
        {/* Editorial masthead */}
        <section>
          <div className="flex items-center justify-between border-b-2 border-brand pb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            <span>Good morning, Adaeze</span>
            <span>Tue 1 Sep 2026</span>
          </div>

          <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Total portfolio value
                <button
                  type="button"
                  onClick={() => setHidden((v) => !v)}
                  aria-label={hidden ? "Show balances" : "Hide balances"}
                >
                  {hidden ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              <p className="mt-2 font-display text-6xl font-extrabold tracking-tight md:text-7xl">
                {mask(2450000)}
              </p>
              <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-success">
                <TrendingUp className="size-4" /> +₦38,200 this month
                <span className="font-semibold text-muted-foreground">
                  · +1.58%
                </span>
              </p>
            </div>

            {/* Vertical quick actions */}
            <div className="flex gap-2 md:flex-col">
              {[
                { label: "Add", icon: ArrowDownToLine },
                { label: "Withdraw", icon: ArrowUpFromLine },
                { label: "New plan", icon: PlusCircle },
              ].map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-brand px-4 py-2 text-xs font-bold text-brand transition-colors hover:bg-brand hover:text-brand-foreground"
                >
                  <Icon className="size-4" /> {label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Ledger: wallet + earnings inline rule rows */}
        <section className="mt-10 divide-y divide-border border-y border-border">
          {[
            { label: "Wallet balance", value: mask(500000), note: "Available to invest or withdraw" },
            { label: "Weekly earnings", value: mask(12480), note: "Interest earned this week" },
            { label: "Total earned", value: mask(386400), note: "Lifetime interest" },
          ].map((row) => (
            <div
              key={row.label}
              className="flex flex-wrap items-baseline justify-between gap-2 py-4"
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  {row.label}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{row.note}</p>
              </div>
              <p className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">
                {row.value}
              </p>
            </div>
          ))}
        </section>

        {/* Plans ledger with editorial index numbers */}
        <section className="mt-12">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-2xl font-extrabold tracking-tight">
              Active plans
            </h2>
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-1 text-xs font-bold text-brand"
            >
              View all <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
          <div className="mt-4 divide-y divide-border border-y-2 border-brand">
            {PLANS.map((plan, i) => (
              <article key={plan.name} className="flex gap-4 py-5 md:gap-6">
                <span className="font-display text-3xl font-extrabold text-gold md:text-4xl">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-base font-bold">{plan.name}</h3>
                    <p className="font-display text-xl font-extrabold">
                      {mask(plan.amount)}
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {plan.tenor} · {plan.rate} · matures {plan.matures}
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-brand"
                        style={{ width: `${plan.progress}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-muted-foreground">
                      {plan.daysLeft} days left
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Recommendation banner */}
        <section className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-brand-gradient p-6 text-brand-foreground">
          <div className="flex items-center gap-3">
            <Sparkles className="size-5 text-gold" />
            <p className="text-sm font-bold">
              Your ₦500,000 wallet balance isn't currently invested.
              <span className="block text-xs font-medium opacity-75">
                Plans from 18.5% p.a. · 30–365 day tenors · ₦50,000 minimum.
              </span>
            </p>
          </div>
          <button
            type="button"
            className="rounded-full bg-gold px-5 py-2.5 text-sm font-bold text-gold-foreground"
          >
            Explore investments
          </button>
        </section>

        {/* Stories grid */}
        <section className="mt-12">
          <h2 className="font-display text-2xl font-extrabold tracking-tight">
            For you
          </h2>
          <div className="mt-4 grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3">
            {STORIES.map((item) => (
              <article key={item.title} className="bg-surface p-5">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
                  {item.tag}
                </span>
                <h3 className="mt-2 text-sm font-bold leading-snug">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>

      {/* Mobile: underline-style tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        <ul className="grid grid-cols-5">
          {TABS.map((tab) => {
            const active = pathname === tab.to;
            const Icon = tab.icon;
            return (
              <li key={tab.to}>
                <Link
                  to={tab.to}
                  className={`relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold ${
                    active ? "text-brand" : "text-muted-foreground"
                  }`}
                >
                  <Icon className="size-5" strokeWidth={active ? 2.4 : 1.8} />
                  {tab.label}
                  <span
                    className={`absolute -top-px h-0.5 w-8 rounded-full bg-gold transition-opacity ${
                      active ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
