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
import { GreetingText } from "@/components/kipit/SpecBlocks";
import {
  FEED,
  HOLDINGS,
  INVESTED,
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

export const Route = createFileRoute("/home-v7")({
  head: () => ({
    meta: [
      { title: "Kipit Home — Native App Home Screen" },
      {
        name: "description",
        content:
          "Kipit mobile home concept: navy balance header, floating quick actions, tabbed overview, plans and activity with maturity countdowns and payouts.",
      },
      { property: "og:title", content: "Kipit Home — Native App Home Screen" },
      {
        property: "og:description",
        content:
          "A native app style Kipit home: balance header, quick actions, tabbed plans and activity, maturity countdowns and upcoming payouts.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomeV7Screen,
});

const TABS = ["Overview", "Plans", "Activity"] as const;
type TabKey = (typeof TABS)[number];

const pct = (total: number, left: number) => Math.round(((total - left) / total) * 100);

function HomeV7Screen() {
  const { hidden, toggle, mask } = useBalanceVisibility();
  const isNewUser = useIsNewUser();
  const [tab, setTab] = useState<TabKey>("Overview");
  const maxWeek = Math.max(...WEEK_SERIES);
  const show = (t: TabKey) => (tab === t ? "" : "hidden md:block");

  if (isNewUser) {
    return (
      <AppShell title="Home" navVariant="floating">
        <div className="pt-5">
          <NewUserEmptyState />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Home" navVariant="floating">
      <div className="pb-2">
        {/* ── Navy balance header (full-bleed, app-style) ───────────── */}
        <section className="relative -mx-4 overflow-hidden rounded-b-[2rem] bg-brand px-5 pb-16 pt-4 text-primary-foreground md:mx-0 md:rounded-[1.75rem] md:px-8 md:pb-8 md:pt-7">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-gold/20 blur-3xl"
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

          <div className="relative mt-6 flex items-center gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-foreground/60">
              Total portfolio
            </p>
            <button
              type="button"
              onClick={toggle}
              aria-label={hidden ? "Show balances" : "Hide balances"}
              className="grid size-6 place-items-center rounded-full bg-white/12 press"
            >
              {hidden ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
            </button>
          </div>
          <h1 className="relative mt-1.5 font-display text-[38px] font-extrabold leading-none tracking-[-0.045em] text-num md:text-[52px]">
            {mask(TOTAL)}
          </h1>
          <p className="relative mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-gold/20 px-2.5 py-1 text-[11px] font-bold text-gold">
            <ArrowUpRight className="size-3.5" /> {naira(WEEK_EARNINGS)} interest this week
          </p>

          {/* Invested / Wallet split */}
          <div className="relative mt-5 grid grid-cols-2 gap-2.5">
            <div className="rounded-2xl bg-white/10 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-primary-foreground/60">
                Invested
              </p>
              <p className="mt-1 font-display text-base font-extrabold text-num">{mask(INVESTED)}</p>
              <p className="mt-0.5 text-[10px] text-primary-foreground/60">3 active plans</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-primary-foreground/60">
                Wallet
              </p>
              <p className="mt-1 font-display text-base font-extrabold text-num">{mask(WALLET)}</p>
              <p className="mt-0.5 text-[10px] text-primary-foreground/60">No interest earned</p>
            </div>
          </div>

          {/* Quick actions — thumb row on the canvas (Home 6 arc style) */}
          <div className="relative mt-6 grid grid-cols-4 gap-2">
            {QUICK_ACTIONS.map((a) => (
              <Link
                key={a.label}
                to={a.to}
                className="flex flex-col items-center gap-2 rounded-2xl py-1 text-[10px] font-semibold text-primary-foreground/85 press"
              >
                <span className="grid size-12 place-items-center rounded-2xl border border-white/15 bg-white/10">
                  <a.icon className="size-5" strokeWidth={1.9} />
                </span>
                <span className="text-center leading-tight">{a.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Sheet that arcs over the canvas ───────────────────────── */}
        <div className="relative -mx-4 -mt-8 rounded-t-[2rem] bg-background px-4 pt-5 md:mx-0 md:mt-6 md:rounded-none md:bg-transparent md:px-0 md:pt-0">
          <span
            aria-hidden
            className="mx-auto mb-4 block h-1 w-10 rounded-full bg-border md:hidden"
          />

        {/* ── Mobile segmented tabs ─────────────────────────────────── */}

        <div className="mt-4 flex rounded-full bg-secondary p-1 md:hidden">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex-1 rounded-full py-2 text-[12px] font-bold transition-colors ${
                tab === t ? "bg-surface text-brand shadow-sm" : "text-muted-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ── Overview ──────────────────────────────────────────────── */}
        <div className={`${show("Overview")} md:grid md:grid-cols-3 md:gap-4 md:mt-4`}>
          {/* Next maturity */}
          <article className="card-surface mt-4 p-4 md:col-span-2 md:mt-0 md:p-6">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Next maturity
                </p>
                <h2 className="mt-1 truncate font-display text-base font-extrabold md:text-lg">
                  {NEXT_MATURITY.name}
                </h2>
                <p className="mt-1 text-[11px] text-muted-foreground md:text-xs">
                  {NEXT_MATURITY.rate} · {NEXT_MATURITY.tenor} · matures {NEXT_MATURITY.date}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-accent px-3 py-1.5 text-[11px] font-extrabold text-accent-foreground">
                {NEXT_MATURITY.daysLeft} days left
              </span>
            </div>
            <div className="mt-3.5 h-2 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-gold-gradient"
                style={{ width: `${pct(NEXT_MATURITY.totalDays, NEXT_MATURITY.daysLeft)}%` }}
              />
            </div>
            <div className="mt-2.5 flex items-center justify-between text-[11px] md:text-xs">
              <span className="text-muted-foreground">Principal {mask(NEXT_MATURITY.amount)}</span>
              <span className="font-bold">Payout {mask(NEXT_MATURITY.expectedPayout)}</span>
            </div>
          </article>

          {/* Weekly interest */}
          <article className="card-surface mt-3 p-4 md:mt-0 md:p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Interest this week
            </p>
            <p className="mt-1.5 font-display text-2xl font-extrabold text-num">
              {mask(WEEK_EARNINGS)}
            </p>
            <div className="mt-4 flex items-end gap-1.5">
              {WEEK_SERIES.map((v, i) => (
                <div key={WEEK_LABELS[i]} className="flex flex-1 flex-col items-center gap-1.5">
                  <div
                    className={`w-2.5 rounded-full ${v === maxWeek ? "bg-gold" : "bg-brand/15"}`}
                    style={{ height: `${18 + (v / maxWeek) * 40}px` }}
                  />
                  <span className="text-[9px] font-semibold text-muted-foreground">
                    {WEEK_LABELS[i]?.slice(0, 1)}
                  </span>
                </div>
              ))}
            </div>
          </article>
        </div>

        {/* Idle wallet nudge (overview) */}
        <section
          className={`${show("Overview")} mt-3 overflow-hidden rounded-3xl border border-gold/40 bg-accent p-4 md:mt-4 md:p-6`}
        >
          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-gold text-gold-foreground">
              <Wallet className="size-[18px]" strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-accent-foreground">
                {mask(WALLET)} in your wallet earns no interest
              </p>
              <p className="mt-1 text-xs text-accent-foreground/80">
                Move it into Kipit Vault at 21.5% p.a. and earn about ₦8,958 a month.
              </p>
              <Link
                to="/invest"
                className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-xs font-bold text-brand-foreground press"
              >
                Invest wallet <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Plans ─────────────────────────────────────────────────── */}
        <section className={`${show("Plans")} mt-4`}>
          <div className="mb-2.5 flex items-center justify-between">
            <h2 className="font-display text-base font-extrabold">Your plans</h2>
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-0.5 text-xs font-bold text-brand"
            >
              See all <ChevronRight className="size-3.5" />
            </Link>
          </div>
          <div className="grid gap-2.5 md:grid-cols-3 md:gap-4">
            {HOLDINGS.map((h, i) => (
              <Link
                key={h.name}
                to="/portfolio"
                className="card-surface block p-4 press"
              >
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold">{h.name}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {h.rate} · matures {h.date}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                      i === 0 ? "bg-accent text-accent-foreground" : "bg-secondary text-brand"
                    }`}
                  >
                    {h.daysLeft}d left
                  </span>
                </div>
                <p className="mt-2.5 font-display text-xl font-extrabold text-num">
                  {mask(h.amount)}
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-brand"
                    style={{ width: `${pct(h.totalDays, h.daysLeft)}%` }}
                  />
                </div>
                <p className="mt-1.5 text-[10px] font-semibold text-muted-foreground">
                  {pct(h.totalDays, h.daysLeft)}% of tenor complete
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Activity ──────────────────────────────────────────────── */}
        <section className={`${show("Activity")} card-surface mt-4 p-4 md:p-6`}>
          <h2 className="font-display text-base font-extrabold">Upcoming payouts</h2>
          <ol className="mt-3.5 space-y-3.5">
            {PAYOUTS.map((p, i) => (
              <li key={p.label} className="grid grid-cols-[auto_minmax(0,1fr)_auto] gap-3">
                <span className="relative flex w-3 justify-center">
                  <span
                    className={`z-10 mt-1.5 size-2.5 rounded-full ring-4 ring-surface ${
                      i === 0 ? "bg-gold" : "bg-brand/30"
                    }`}
                  />
                  {i < PAYOUTS.length - 1 && (
                    <span className="absolute top-3 h-full w-px bg-border" />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{p.label}</p>
                  <p className="text-[11px] text-muted-foreground">{p.date}</p>
                </div>
                <p className="shrink-0 text-sm font-bold text-num">{mask(p.amount)}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ── For you ───────────────────────────────────────────────── */}
        <section className={`${show("Overview")} mt-6`}>
          <div className="flex items-end justify-between">
            <h2 className="font-display text-lg font-bold tracking-tight md:text-xl">For you</h2>
            <Link to="/explore" className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground press hover:bg-secondary">
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
                <h3 className="mt-3 font-display text-base font-bold leading-snug">{item.title}</h3>
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

      </div>
    </AppShell>
  );
}
