import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Compass,
  Eye,
  EyeOff,
  Home,
  MoreHorizontal,
  PieChart,
  Plus,
  Settings,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/kipit/Logo";

export const Route = createFileRoute("/home-v5")({
  head: () => ({
    meta: [
      { title: "Kipit Home (Design 5) — Card Stack + Pocket Plans" },
      {
        name: "description",
        content:
          "A fifth Kipit home concept: wallet-first card stack, pocket plan cards, and a segmented top navigation.",
      },
      { property: "og:title", content: "Kipit Home (Design 5) — Card Stack + Pocket Plans" },
      {
        property: "og:description",
        content: "A wallet-first take on the Kipit home screen in Kipit navy and gold.",
      },
    ],
  }),
  component: HomeV5Screen,
});

const naira = (value: number) =>
  `₦${value.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;

const POCKETS = [
  { name: "Fixed Income", tenor: "90 days", amount: 750000, yield: "18.5%", progress: 0.74, color: "bg-brand" },
  { name: "Flex Yield", tenor: "180 days", amount: 1200000, yield: "19.2%", progress: 0.38, color: "bg-gold" },
  { name: "Goal — Rent", tenor: "365 days", amount: 500000, yield: "17.8%", progress: 0.16, color: "bg-success" },
];

const ACTIVITY: { icon: LucideIcon; title: string; detail: string; amount: string; positive: boolean }[] = [
  { icon: TrendingUp, title: "Interest payout", detail: "Fixed Income • Today", amount: "+₦12,480", positive: true },
  { icon: ArrowDownLeft, title: "Wallet funded", detail: "Bank transfer • Yesterday", amount: "+₦200,000", positive: true },
  { icon: ArrowUpRight, title: "Withdrawal", detail: "GTBank •• 4521 • 24 Aug", amount: "-₦50,000", positive: false },
  { icon: Plus, title: "Plan created", detail: "Goal — Rent • 28 Aug", amount: "-₦500,000", positive: false },
];

const SEGMENTS = [
  { label: "Home", to: "/home-v5", icon: Home },
  { label: "Invest", to: "/invest", icon: TrendingUp },
  { label: "Explore", to: "/explore", icon: Compass },
  { label: "Portfolio", to: "/portfolio", icon: PieChart },
  { label: "Settings", to: "/settings", icon: Settings },
];

function HomeV5Screen() {
  const [hidden, setHidden] = useState(false);
  const mask = (value: number) => (hidden ? "₦ • • • • • •" : naira(value));

  return (
    <div className="min-h-screen bg-background">
      {/* ============ Desktop header — minimal top bar with segmented nav ============ */}
      <header className="sticky top-0 z-40 hidden items-center justify-between border-b border-border bg-surface/90 px-8 py-4 backdrop-blur md:flex">
        <Logo className="text-2xl" />
        <nav className="flex items-center gap-1 rounded-full border border-border bg-secondary/60 p-1">
          {SEGMENTS.map((item, i) => {
            const active = i === 0;
            return (
              <Link
                key={item.label}
                to={item.to}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold transition-colors ${
                  active ? "bg-brand text-brand-foreground shadow-card" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon className="size-4" strokeWidth={active ? 2.5 : 2} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Notifications"
            className="relative grid size-10 place-items-center rounded-full border border-border bg-surface text-foreground"
          >
            <Bell className="size-4.5" />
            <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-gold" />
          </button>
          <div className="grid size-10 place-items-center rounded-full bg-brand-gradient text-sm font-bold text-primary-foreground">
            AO
          </div>
        </div>
      </header>

      {/* ============ Mobile top segmented nav ============ */}
      <nav className="sticky top-0 z-40 border-b border-border bg-surface/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center justify-between gap-3">
          <Logo className="text-2xl" />
          <button
            type="button"
            aria-label="Notifications"
            className="relative grid size-9 place-items-center rounded-full border border-border bg-surface text-foreground"
          >
            <Bell className="size-4" />
            <span className="absolute right-2 top-2 size-1.5 rounded-full bg-gold" />
          </button>
        </div>
        <div className="mt-3 flex gap-1 overflow-x-auto no-scrollbar">
          {SEGMENTS.map((item, i) => {
            const active = i === 0;
            return (
              <Link
                key={item.label}
                to={item.to}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-colors ${
                  active ? "bg-brand text-brand-foreground" : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-5 pb-28 pt-6 md:px-8 md:pb-16 md:pt-10">
        {/* ============ Greeting ============ */}
        <section className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">Good morning</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight md:text-3xl">Adaeze, your wealth is growing.</h1>
          </div>
          <div className="hidden size-10 place-items-center rounded-full bg-brand-gradient text-sm font-bold text-primary-foreground md:grid">
            AO
          </div>
        </section>

        {/* ============ Wallet card stack ============ */}
        <section className="relative mt-6 md:mt-8">
          <div className="relative z-10 overflow-hidden rounded-[1.75rem] bg-brand-gradient p-6 text-primary-foreground shadow-float md:p-8">
            <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 size-60 rounded-full bg-gold/20 blur-3xl" />
            <div aria-hidden className="pointer-events-none -bottom-24 -left-10 size-52 rounded-full bg-white/8 blur-3xl" />

            <div className="relative flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-12 rounded-md bg-gold-gradient shadow-inner" />
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary-foreground/60">Kipit Wallet</span>
              </div>
              <button
                type="button"
                aria-label="More options"
                className="grid size-9 place-items-center rounded-full bg-white/10 text-primary-foreground/80 transition-colors hover:bg-white/20"
              >
                <MoreHorizontal className="size-5" />
              </button>
            </div>

            <div className="relative mt-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground/60">Total balance</p>
              <div className="mt-2 flex items-center gap-3">
                <p className="text-4xl font-extrabold tracking-tight md:text-5xl">{mask(2450000)}</p>
                <button
                  type="button"
                  onClick={() => setHidden((v) => !v)}
                  aria-label={hidden ? "Show balance" : "Hide balance"}
                  className="grid size-9 place-items-center rounded-full bg-white/10 text-primary-foreground/80 transition-colors hover:bg-white/20"
                >
                  {hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="relative mt-6 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-foreground/55">Holder</p>
                <p className="mt-0.5 text-sm font-bold">ADAEZE OKAFOR</p>
              </div>
              <p className="font-mono text-sm tracking-[0.2em] text-primary-foreground/80">•• 4521</p>
            </div>
          </div>

          {/* Decorative stacked cards behind */}
          <div aria-hidden className="absolute -bottom-3 left-4 right-4 -z-10 h-20 rounded-[1.75rem] bg-brand/60" />
          <div aria-hidden className="absolute -bottom-6 left-8 right-8 -z-20 h-20 rounded-[1.75rem] bg-brand/30" />
        </section>

        {/* ============ Quick actions ============ */}
        <section className="mt-8">
          <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
            {[
              { label: "Add money", icon: ArrowDownLeft },
              { label: "Withdraw", icon: ArrowUpRight },
              { label: "New plan", icon: Plus },
            ].map(({ label, icon: Icon }) => (
              <button
                key={label}
                type="button"
                className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface p-4 shadow-card transition-transform active:scale-95 md:flex-row md:gap-3"
              >
                <span className="grid size-10 place-items-center rounded-xl bg-accent text-gold transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
                  <Icon className="size-5" />
                </span>
                <span className="text-xs font-bold md:text-sm">{label}</span>
              </button>
            ))}
            <div className="col-span-3 hidden rounded-2xl border border-border bg-surface p-4 shadow-card md:flex md:flex-col md:justify-center">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">This month</p>
              <p className="mt-1 text-2xl font-extrabold text-success">+₦38,200</p>
              <p className="text-xs text-muted-foreground">+1.58% vs last month</p>
            </div>
          </div>
        </section>

        {/* ============ Pocket plans — horizontal scroll cards ============ */}
        <section className="mt-10">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold">Pockets</p>
              <h2 className="mt-1 text-xl font-extrabold tracking-tight md:text-2xl">Your plans</h2>
            </div>
            <Link
              to="/invest"
              className="inline-flex items-center gap-1 text-xs font-bold text-brand"
            >
              See all <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="mt-5 flex gap-4 overflow-x-auto pb-4 no-scrollbar md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
            {POCKETS.map((plan, i) => (
              <article
                key={plan.name}
                className="w-64 shrink-0 rounded-3xl border border-border bg-surface p-5 shadow-card md:w-auto"
                style={{ transform: `rotate(${i === 1 ? "-1deg" : i === 2 ? "1deg" : "0deg"})` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className={`grid size-10 place-items-center rounded-2xl text-primary-foreground ${plan.color}`}>
                    <Wallet className="size-5" />
                  </div>
                  <span className="shrink-0 rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold text-accent-foreground">
                    {plan.yield}
                  </span>
                </div>
                <h3 className="mt-4 font-bold">{plan.name}</h3>
                <p className="text-xs text-muted-foreground">{plan.tenor}</p>
                <p className="mt-2 text-2xl font-extrabold tracking-tight">{mask(plan.amount)}</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                    <div
                      className={`h-full rounded-full ${plan.color}`}
                      style={{ width: `${Math.round(plan.progress * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-extrabold text-brand">{Math.round(plan.progress * 100)}%</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ============ Activity feed ============ */}
        <section className="mt-10">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold">Feed</p>
              <h2 className="mt-1 text-xl font-extrabold tracking-tight md:text-2xl">Recent activity</h2>
            </div>
            <button type="button" className="text-xs font-bold text-brand underline decoration-gold decoration-2 underline-offset-4">
              View all
            </button>
          </div>
          <ul className="mt-5 space-y-3">
            {ACTIVITY.map((item) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.title + item.detail}
                  className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 shadow-card"
                >
                  <span
                    className={`grid size-11 shrink-0 place-items-center rounded-2xl ${
                      item.positive ? "bg-accent text-gold" : "bg-secondary text-brand"
                    }`}
                  >
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{item.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{item.detail}</p>
                  </div>
                  <p className={`shrink-0 text-sm font-extrabold ${item.positive ? "text-success" : "text-foreground"}`}>
                    {hidden ? "• • •" : item.amount}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>
      </main>

      {/* ============ Mobile bottom actions bar ============ */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 px-6 py-3 backdrop-blur md:hidden">
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/invest"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-brand-gradient py-3 text-sm font-bold text-primary-foreground shadow-card transition-transform active:scale-95"
          >
            <Plus className="size-4" /> Invest now
          </Link>
          <button
            type="button"
            aria-label="Wallet"
            className="grid size-11 place-items-center rounded-full border border-border bg-surface text-foreground"
          >
            <Wallet className="size-5" />
          </button>
        </div>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </div>
  );
}
