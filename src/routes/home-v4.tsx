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
  Nfc,
  PieChart,
  Plus,
  Settings,
  Sparkles,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/kipit/Logo";

export const Route = createFileRoute("/home-v4")({
  head: () => ({
    meta: [
      { title: "Kipit Home (Design 4) — Statement Layout + Label Nav" },
      {
        name: "description",
        content:
          "A fourth Kipit home concept: editorial statement layout with a physical wallet card visual, compact plan rows and a label-based sliding-underline navigation.",
      },
      { property: "og:title", content: "Kipit Home (Design 4) — Statement Layout" },
      {
        property: "og:description",
        content: "An editorial, statement-style take on the Kipit home screen in Kipit navy and gold.",
      },
    ],
  }),
  component: HomeV4Screen,
});

const naira = (value: number) =>
  `₦${value.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;

const PLANS = [
  { name: "Kipit Fixed Income", detail: "90 days · matures 14 Oct 2026", amount: 750000, yield: "18.5%", progress: 0.74 },
  { name: "Kipit Flex Yield", detail: "180 days · matures 02 Jan 2027", amount: 1200000, yield: "19.2%", progress: 0.38 },
  { name: "Kipit Goal — Rent", detail: "365 days · matures 30 Aug 2027", amount: 500000, yield: "17.8%", progress: 0.16 },
];

const ACTIVITY: { icon: LucideIcon; title: string; time: string; amount: string; positive: boolean }[] = [
  { icon: TrendingUp, title: "Interest payout — Fixed Income", time: "Today, 09:12", amount: "+₦12,480", positive: true },
  { icon: ArrowDownLeft, title: "Wallet funded — Bank transfer", time: "Yesterday", amount: "+₦200,000", positive: true },
  { icon: ArrowUpRight, title: "Withdrawal — GTBank •• 4521", time: "24 Aug", amount: "-₦50,000", positive: false },
];

const NAV: { label: string; to: string; icon: LucideIcon }[] = [
  { label: "Home", to: "/", icon: Home },
  { label: "Invest", to: "/invest", icon: TrendingUp },
  { label: "Explore", to: "/explore", icon: Compass },
  { label: "Portfolio", to: "/portfolio", icon: PieChart },
  { label: "Settings", to: "/settings", icon: Settings },
];

function HomeV4Screen() {
  const [hidden, setHidden] = useState(false);
  const mask = (value: number) => (hidden ? "₦ • • • • • •" : naira(value));

  return (
    <div className="min-h-screen bg-background">
      {/* ============ Desktop top header — centered wordmark + inline nav ============ */}
      <header className="sticky top-0 z-40 hidden border-b border-border bg-surface/90 backdrop-blur md:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-4">
          <Logo className="text-2xl" />
          <nav className="flex items-center gap-1 rounded-full border border-border bg-secondary/60 p-1">
            {NAV.map((item, i) => {
              const active = i === 0;
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`relative rounded-full px-5 py-2 text-sm font-bold transition-colors ${
                    active ? "bg-brand text-brand-foreground shadow-card" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
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
        </div>
      </header>

      <main className="mx-auto max-w-6xl pb-36 md:px-8 md:pb-16">
        {/* ============ Mobile header ============ */}
        <div className="flex items-center justify-between px-5 pt-5 md:hidden">
          <Logo className="text-2xl" />
          <div className="flex items-center gap-2">
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
        </div>

        {/* ============ Statement hero — editorial split ============ */}
        <section className="mt-6 px-5 md:mt-10 md:px-0">
          <div className="grid gap-6 md:grid-cols-[1.2fr_1fr] md:gap-10">
            {/* Left: greeting + big statement balance */}
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-gold">
                Good morning, Adaeze
              </p>
              <h1 className="mt-3 text-2xl font-extrabold leading-tight tracking-tight md:text-3xl">
                Your money is working,
                <br />
                <span className="text-muted-foreground">here's the statement.</span>
              </h1>

              <div className="mt-8 border-l-4 border-gold pl-5 md:pl-7">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
                  Total balance
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <p className="text-5xl font-extrabold tracking-tighter text-brand md:text-7xl">
                    {mask(2450000)}
                  </p>
                  <button
                    type="button"
                    onClick={() => setHidden((v) => !v)}
                    aria-label={hidden ? "Show balance" : "Hide balance"}
                    className="grid size-9 place-items-center rounded-full border border-border bg-surface text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <p className="mt-3 text-sm font-semibold text-muted-foreground">
                  <span className="font-extrabold text-success">+₦38,200 (+1.58%)</span> earned this month
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-3 text-sm font-bold text-primary-foreground shadow-card transition-transform active:scale-95"
                >
                  <ArrowDownLeft className="size-4" /> Add money
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-brand px-6 py-3 text-sm font-bold text-brand transition-colors hover:bg-accent"
                >
                  <ArrowUpRight className="size-4" /> Withdraw
                </button>
              </div>
            </div>

            {/* Right: physical wallet card */}
            <div className="md:pt-4">
              <div className="relative overflow-hidden rounded-[1.75rem] bg-brand-gradient p-6 text-primary-foreground shadow-float md:p-7">
                <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-gold/20 blur-3xl" />
                <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-10 size-48 rounded-full bg-white/8 blur-3xl" />
                <div className="relative flex items-start justify-between">
                  <Logo tone="light" className="text-xl" />
                  <Nfc className="size-6 text-primary-foreground/70" />
                </div>
                <div className="relative mt-8 flex items-center gap-3">
                  <div className="h-8 w-11 rounded-md bg-gold-gradient shadow-inner" />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-foreground/60">
                    Kipit wallet
                  </p>
                </div>
                <p className="relative mt-4 text-3xl font-extrabold tracking-tight md:text-4xl">
                  {mask(500000)}
                </p>
                <div className="relative mt-6 flex items-end justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-foreground/55">Holder</p>
                    <p className="mt-0.5 text-sm font-bold">ADAEZE OKAFOR</p>
                  </div>
                  <p className="font-mono text-sm tracking-[0.2em] text-primary-foreground/80">•• 4521</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
                  <Wallet className="size-5 text-gold" />
                  <p className="mt-2 text-lg font-extrabold tracking-tight">{mask(96400)}</p>
                  <p className="text-[11px] font-semibold text-muted-foreground">Total earned</p>
                </div>
                <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
                  <Sparkles className="size-5 text-gold" />
                  <p className="mt-2 text-lg font-extrabold tracking-tight">18.9%</p>
                  <p className="text-[11px] font-semibold text-muted-foreground">Average yield</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ Plans — compact statement rows ============ */}
        <section className="mt-12 px-5 md:px-0">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold">Holdings</p>
              <h2 className="mt-1 text-xl font-extrabold tracking-tight md:text-2xl">Active plans</h2>
            </div>
            <Link
              to="/invest"
              className="inline-flex items-center gap-1 rounded-full bg-accent px-4 py-2 text-xs font-bold text-accent-foreground transition-transform active:scale-95"
            >
              <Plus className="size-3.5" /> New plan
            </Link>
          </div>

          <div className="mt-5 overflow-hidden rounded-3xl border border-border bg-surface shadow-card">
            {PLANS.map((plan, i) => (
              <article
                key={plan.name}
                className={`group flex items-center gap-4 p-5 transition-colors hover:bg-accent/50 md:px-7 ${
                  i > 0 ? "border-t border-border" : ""
                }`}
              >
                <div className="relative grid size-12 shrink-0 place-items-center">
                  <svg viewBox="0 0 48 48" className="size-12 -rotate-90">
                    <circle cx="24" cy="24" r="20" fill="none" className="stroke-secondary" strokeWidth="4" />
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      fill="none"
                      className="stroke-gold"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 20}
                      strokeDashoffset={2 * Math.PI * 20 * (1 - plan.progress)}
                    />
                  </svg>
                  <span className="absolute text-[10px] font-extrabold text-brand">
                    {Math.round(plan.progress * 100)}%
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-bold">{plan.name}</h3>
                  <p className="truncate text-xs text-muted-foreground">{plan.detail}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-base font-extrabold tracking-tight md:text-lg">{mask(plan.amount)}</p>
                  <p className="text-[11px] font-bold text-gold">{plan.yield} p.a.</p>
                </div>
                <ArrowRight className="hidden size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-gold md:block" />
              </article>
            ))}
          </div>
        </section>

        {/* ============ Activity — ledger strip ============ */}
        <section className="mt-12 px-5 md:px-0">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold">Ledger</p>
              <h2 className="mt-1 text-xl font-extrabold tracking-tight md:text-2xl">Recent activity</h2>
            </div>
            <button type="button" className="text-xs font-bold text-brand underline decoration-gold decoration-2 underline-offset-4">
              View all
            </button>
          </div>
          <ul className="mt-5 space-y-0 divide-y divide-border rounded-3xl border border-border bg-surface shadow-card">
            {ACTIVITY.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.title + item.time} className="flex items-center gap-4 px-5 py-4 md:px-7">
                  <span
                    className={`grid size-10 shrink-0 place-items-center rounded-full ${
                      item.positive ? "bg-accent text-gold" : "bg-secondary text-brand"
                    }`}
                  >
                    <Icon className="size-4.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                  <p className={`shrink-0 font-mono text-sm font-bold ${item.positive ? "text-success" : "text-foreground"}`}>
                    {hidden ? "• • •" : item.amount}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>
      </main>

      {/* ============ Mobile nav — label bar with sliding gold underline ============ */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur md:hidden">
        <div className="grid grid-cols-5 px-2">
          {NAV.map((item, i) => {
            const active = i === 0;
            return (
              <Link
                key={item.label}
                to={item.to}
                className="relative flex flex-col items-center gap-1 py-3"
              >
                <item.icon className={`size-5 ${active ? "text-brand" : "text-muted-foreground"}`} strokeWidth={active ? 2.4 : 1.8} />
                <span className={`text-[10px] font-bold ${active ? "text-brand" : "text-muted-foreground"}`}>
                  {item.label}
                </span>
                <span
                  aria-hidden
                  className={`absolute -top-px h-0.5 w-8 rounded-full bg-gold-gradient transition-opacity ${
                    active ? "opacity-100" : "opacity-0"
                  }`}
                />
              </Link>
            );
          })}
        </div>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>
    </div>
  );
}
