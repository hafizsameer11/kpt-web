import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowDownLeft,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowUpRight,
  Bell,
  ChevronRight,
  Compass,
  Eye,
  EyeOff,
  Home,
  Lightbulb,
  MoreHorizontal,
  PieChart,
  PlusCircle,
  Settings,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { DashboardSidebar, DashboardTopBar } from "@/components/kipit/DashboardSidebar";
import { Logo } from "@/components/kipit/Logo";

export const Route = createFileRoute("/home-v4")({
  head: () => ({
    meta: [
      { title: "Kipit Home — Neo-Fintech Concept" },
      {
        name: "description",
        content:
          "A modern neo-fintech home for Kipit: balance card, quick actions, active plans and recent activity.",
      },
      { property: "og:title", content: "Kipit Home — Neo-Fintech Concept" },
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
    name: "Fixed Income · 90 days",
    rate: "18.5% p.a.",
    amount: 750000,
    daysLeft: 23,
    progress: 74,
  },
  {
    name: "Yield Note · 180 days",
    rate: "21.0% p.a.",
    amount: 1200000,
    daysLeft: 72,
    progress: 48,
  },
  {
    name: "Starter · 30 days",
    rate: "15.0% p.a.",
    amount: 500000,
    daysLeft: 9,
    progress: 88,
  },
];

const ACTIVITY = [
  {
    title: "Interest payout · Fixed Income",
    time: "Today, 09:12",
    amount: 12480,
    kind: "credit" as const,
  },
  {
    title: "Investment · Yield Note",
    time: "28 Aug, 14:30",
    amount: -200000,
    kind: "debit" as const,
  },
  {
    title: "Wallet top-up · GTBank",
    time: "26 Aug, 11:05",
    amount: 500000,
    kind: "credit" as const,
  },
  {
    title: "Withdrawal to Access Bank",
    time: "21 Aug, 16:44",
    amount: -150000,
    kind: "debit" as const,
  },
];

function HomeV4() {
  const [hidden, setHidden] = useState(false);
  const mask = (value: number) => (hidden ? "₦••••••" : naira(value));
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-secondary/60">
      {/* Desktop top nav */}
      {/* Desktop dashboard sidebar */}
      <DashboardSidebar hideBalance={hidden} />
      <div className="md:pl-64">
        <DashboardTopBar title="Dashboard" />

      {/* Mobile slim header */}
      <header className="sticky top-0 z-40 flex items-center justify-between bg-secondary/60 px-5 py-4 backdrop-blur md:hidden">
        <div className="flex items-center gap-2.5">
          <div className="grid size-9 place-items-center rounded-full bg-brand text-xs font-bold text-brand-foreground">
            AO
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Good morning</p>
            <p className="text-xs font-bold">Adaeze O.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Logo className="text-lg" />
          <button
            type="button"
            aria-label="Notifications"
            className="relative grid size-9 place-items-center rounded-full bg-surface shadow-card"
          >
            <Bell className="size-4" />
            <span className="absolute right-2 top-2 size-1.5 rounded-full bg-gold" />
          </button>
        </div>
      </header>

      <main className="w-full px-4 pb-28 pt-4 md:px-8 md:pb-16 md:pt-8">
        {/* Desktop greeting */}
        <div className="mb-5 hidden items-end justify-between md:flex">
          <div>
            <p className="text-sm text-muted-foreground">Good morning</p>
            <h1 className="text-2xl font-extrabold tracking-tight">Adaeze O.</h1>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-5">
          {/* Left column: balance + plans */}
          <div className="lg:col-span-3">
            {/* Balance card */}
            <section className="rounded-3xl bg-brand-gradient p-6 text-brand-foreground shadow-float md:p-7">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold opacity-75">
                  Total portfolio value
                </p>
                <button
                  type="button"
                  onClick={() => setHidden((v) => !v)}
                  aria-label={hidden ? "Show balances" : "Hide balances"}
                  className="grid size-8 place-items-center rounded-full bg-brand-foreground/15"
                >
                  {hidden ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              <p className="mt-2 text-4xl font-extrabold tracking-tight md:text-5xl">
                {mask(2450000)}
              </p>
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-foreground/15 px-3 py-1 text-xs font-semibold">
                <TrendingUp className="size-3.5" /> +₦38,200 · +1.58% this month
              </p>

              <div className="mt-6 grid grid-cols-2 gap-2">
                <div className="rounded-2xl bg-brand-foreground/10 p-3.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold opacity-75">
                    <Wallet className="size-3.5" /> Wallet
                  </div>
                  <p className="mt-1 text-lg font-extrabold">{mask(500000)}</p>
                </div>
                <div className="rounded-2xl bg-brand-foreground/10 p-3.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold opacity-75">
                    <TrendingUp className="size-3.5" /> Earned this week
                  </div>
                  <p className="mt-1 text-lg font-extrabold text-gold">
                    {mask(12480)}
                  </p>
                </div>
              </div>
            </section>

            {/* Quick actions pill */}
            <section className="mt-4 grid grid-cols-4 gap-1 rounded-3xl bg-surface p-2 shadow-card">
              {[
                { label: "Add Money", icon: ArrowDownToLine },
                { label: "Withdraw", icon: ArrowUpFromLine },
                { label: "New Plan", icon: PlusCircle },
                { label: "More", icon: MoreHorizontal },
              ].map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  type="button"
                  className="flex flex-col items-center gap-1.5 rounded-2xl px-2 py-3 transition-colors hover:bg-secondary active:scale-95"
                >
                  <span className="grid size-10 place-items-center rounded-full bg-accent text-accent-foreground">
                    <Icon className="size-4.5" />
                  </span>
                  <span className="text-[11px] font-semibold">{label}</span>
                </button>
              ))}
            </section>

            {/* Plans */}
            <section className="mt-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold tracking-tight">
                  Active plans
                </h2>
                <Link
                  to="/portfolio"
                  className="inline-flex items-center gap-0.5 text-xs font-bold text-brand"
                >
                  View all <ChevronRight className="size-3.5" />
                </Link>
              </div>
              <div className="mt-3 space-y-3">
                {PLANS.map((plan) => (
                  <article
                    key={plan.name}
                    className="rounded-3xl bg-surface p-5 shadow-card transition-transform active:scale-[0.99]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand text-brand-foreground">
                          <TrendingUp className="size-5" />
                        </span>
                        <div>
                          <h3 className="text-sm font-bold">{plan.name}</h3>
                          <p className="text-xs font-semibold text-gold">
                            {plan.rate}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-extrabold">
                          {mask(plan.amount)}
                        </p>
                        <p className="text-[11px] font-semibold text-muted-foreground">
                          {plan.daysLeft} days left
                        </p>
                      </div>
                    </div>
                    <div className="mt-3.5 h-1.5 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-gold-gradient"
                        style={{ width: `${plan.progress}%` }}
                      />
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>

          {/* Right column: insight + activity */}
          <div className="space-y-4 lg:col-span-2">
            <section className="rounded-3xl border border-gold/40 bg-accent p-5">
              <div className="flex items-center gap-2 text-sm font-bold text-accent-foreground">
                <Lightbulb className="size-4 text-gold" /> Smart insight
              </div>
              <p className="mt-2 text-sm font-semibold text-accent-foreground">
                Your ₦500,000 wallet balance isn't invested.
              </p>
              <p className="mt-1 text-xs text-accent-foreground/80">
                Plans from 18.5% p.a. · 30–365 day tenors · ₦50,000 minimum.
              </p>
              <button
                type="button"
                className="mt-4 w-full rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-brand-foreground"
              >
                Explore investments
              </button>
            </section>

            <section className="rounded-3xl bg-surface p-5 shadow-card">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold tracking-tight">
                  Recent activity
                </h2>
                <button
                  type="button"
                  className="text-xs font-bold text-brand"
                >
                  See all
                </button>
              </div>
              <ul className="mt-3 divide-y divide-border">
                {ACTIVITY.map((item) => (
                  <li key={item.title} className="flex items-center gap-3 py-3.5">
                    <span
                      className={`grid size-10 shrink-0 place-items-center rounded-full ${
                        item.kind === "credit"
                          ? "bg-accent text-success"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {item.kind === "credit" ? (
                        <ArrowDownLeft className="size-4.5" />
                      ) : (
                        <ArrowUpRight className="size-4.5" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.time}</p>
                    </div>
                    <p
                      className={`text-sm font-extrabold ${
                        item.kind === "credit" ? "text-success" : ""
                      }`}
                    >
                      {item.amount > 0 ? "+" : "−"}
                      {naira(Math.abs(item.amount))}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </main>

      {/* Mobile bottom tab bar — raised gold home indicator style */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        <ul className="grid grid-cols-5">
          {TABS.map((tab) => {
            const active = pathname === tab.to;
            const Icon = tab.icon;
            return (
              <li key={tab.to}>
                <Link
                  to={tab.to}
                  className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition-colors ${
                    active ? "text-brand" : "text-muted-foreground"
                  }`}
                >
                  <span
                    className={`grid size-9 place-items-center rounded-full transition-colors ${
                      active ? "bg-brand text-brand-foreground" : ""
                    }`}
                  >
                    <Icon className="size-5" strokeWidth={active ? 2.4 : 1.8} />
                  </span>
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
