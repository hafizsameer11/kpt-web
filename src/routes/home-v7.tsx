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
      { title: "Kipit Home — Swipe Cards Mobile Home" },
      {
        name: "description",
        content:
          "Kipit mobile home concept with swipeable balance cards, a maturity progress ring, plan rows, payout timeline and personalised insights.",
      },
      { property: "og:title", content: "Kipit Home — Swipe Cards Mobile Home" },
      {
        property: "og:description",
        content:
          "A native-feeling Kipit home screen: swipeable balance wallet cards, maturity ring, quick actions and upcoming payouts.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomeV7Screen,
});

const CARDS = [
  {
    key: "total",
    label: "Total portfolio",
    value: TOTAL,
    note: "Wallet + 3 active plans",
    surface: "bg-brand-gradient text-primary-foreground",
    sub: "text-primary-foreground/70",
  },
  {
    key: "invested",
    label: "Invested",
    value: INVESTED,
    note: "Locked across 3 plans",
    surface: "bg-brand text-primary-foreground",
    sub: "text-primary-foreground/70",
  },
  {
    key: "wallet",
    label: "Wallet",
    value: WALLET,
    note: "Available now · earns no interest",
    surface: "bg-gold text-gold-foreground",
    sub: "text-gold-foreground/70",
  },
] as const;

const progress = Math.round(
  ((NEXT_MATURITY.totalDays - NEXT_MATURITY.daysLeft) / NEXT_MATURITY.totalDays) * 100,
);

function MaturityRing() {
  const r = 46;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 120 120" className="size-[112px] shrink-0 -rotate-90">
      <circle cx="60" cy="60" r={r} fill="none" strokeWidth="10" className="stroke-secondary" />
      <circle
        cx="60"
        cy="60"
        r={r}
        fill="none"
        strokeWidth="10"
        strokeLinecap="round"
        className="stroke-gold"
        strokeDasharray={c}
        strokeDashoffset={c - (c * progress) / 100}
      />
    </svg>
  );
}

function HomeV7Screen() {
  const { hidden, toggle, mask } = useBalanceVisibility();
  const isNewUser = useIsNewUser();
  const [card, setCard] = useState(0);
  const maxWeek = Math.max(...WEEK_SERIES);

  return (
    <AppShell title="Home" navVariant="floating">
      {isNewUser ? (
        <div className="pt-5">
          <NewUserEmptyState />
        </div>
      ) : (
        <div className="pb-2 pt-4 md:pt-0">
          {/* App bar */}
          <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-muted-foreground">
                <GreetingText />
              </p>
              <h1 className="truncate font-display text-xl font-extrabold tracking-tight md:text-2xl">
                Adaeze Okafor
              </h1>
            </div>
            <div className="flex shrink-0 items-center gap-2 md:hidden">
              <button
                type="button"
                onClick={toggle}
                aria-label={hidden ? "Show balances" : "Hide balances"}
                className="grid size-10 place-items-center rounded-full border border-border bg-surface press"
              >
                {hidden ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
              </button>
              <Link
                to="/notifications"
                aria-label="Notifications"
                className="relative grid size-10 place-items-center rounded-full border border-border bg-surface press"
              >
                <Bell className="size-[18px]" strokeWidth={1.8} />
                <span className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-gold" />
              </Link>
              <Link
                to="/settings"
                aria-label="Profile"
                className="grid size-10 place-items-center rounded-full bg-brand text-xs font-bold text-brand-foreground press"
              >
                AO
              </Link>
            </div>
          </header>

          {/* Swipeable balance cards */}
          <section className="mt-4">
            <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
              {CARDS.map((c, i) => (
                <article
                  key={c.key}
                  onFocus={() => setCard(i)}
                  onMouseEnter={() => setCard(i)}
                  className={`relative w-[82%] shrink-0 snap-center overflow-hidden rounded-[1.75rem] p-5 shadow-float md:w-auto ${c.surface}`}
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-10 -top-12 size-40 rounded-full bg-white/15 blur-2xl"
                  />
                  <p className={`relative text-[11px] font-bold uppercase tracking-[0.16em] ${c.sub}`}>
                    {c.label}
                  </p>
                  <p className="relative mt-2 font-display text-[30px] font-extrabold leading-none tracking-[-0.04em] text-num">
                    {mask(c.value)}
                  </p>
                  <p className={`relative mt-2 text-[11px] ${c.sub}`}>{c.note}</p>
                  {c.key === "total" && (
                    <p className="relative mt-3 inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold">
                      <ArrowUpRight className="size-3.5" /> {naira(WEEK_EARNINGS)} this week
                    </p>
                  )}
                </article>
              ))}
            </div>
            <div className="mt-3 flex justify-center gap-1.5 md:hidden">
              {CARDS.map((c, i) => (
                <span
                  key={c.key}
                  className={`h-1.5 rounded-full transition-all ${
                    i === card ? "w-5 bg-brand" : "w-1.5 bg-border"
                  }`}
                />
              ))}
            </div>
          </section>

          {/* Quick actions */}
          <section className="mt-4 grid grid-cols-4 gap-2 rounded-3xl border border-border bg-surface p-3 md:gap-4 md:p-5">
            {QUICK_ACTIONS.map((a) => (
              <Link
                key={a.label}
                to={a.to}
                className="flex flex-col items-center gap-2 text-[10px] font-bold text-brand press md:text-xs"
              >
                <span className="grid size-11 place-items-center rounded-2xl bg-accent text-accent-foreground md:size-12">
                  <a.icon className="size-5" strokeWidth={1.9} />
                </span>
                <span className="text-center leading-tight">{a.label}</span>
              </Link>
            ))}
          </section>

          <div className="grid gap-3 md:mt-4 md:grid-cols-3 md:gap-4">
            {/* Maturity ring */}
            <section className="card-surface mt-4 flex items-center gap-4 p-4 md:mt-0 md:col-span-2 md:p-6">
              <div className="relative grid shrink-0 place-items-center">
                <MaturityRing />
                <div className="absolute text-center">
                  <p className="font-display text-xl font-extrabold leading-none text-num">
                    {NEXT_MATURITY.daysLeft}
                  </p>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                    days left
                  </p>
                </div>
              </div>
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
                <p className="mt-2 text-sm font-bold">
                  Payout {mask(NEXT_MATURITY.expectedPayout)}
                  <span className="ml-1 text-[11px] font-semibold text-muted-foreground">
                    on {mask(NEXT_MATURITY.amount)}
                  </span>
                </p>
              </div>
            </section>

            {/* Weekly interest */}
            <section className="card-surface mt-3 p-4 md:mt-0 md:p-6">
              <div className="flex items-baseline justify-between">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Interest this week
                </p>
              </div>
              <p className="mt-1.5 font-display text-2xl font-extrabold text-num">
                {mask(WEEK_EARNINGS)}
              </p>
              <div className="mt-4 flex items-end gap-1.5">
                {WEEK_SERIES.map((v, i) => (
                  <div key={WEEK_LABELS[i]} className="flex flex-1 flex-col items-center gap-1.5">
                    <div
                      className={`w-full rounded-full ${v === maxWeek ? "bg-gold" : "bg-brand/15"}`}
                      style={{ height: `${18 + (v / maxWeek) * 40}px` }}
                    />
                    <span className="text-[9px] font-semibold text-muted-foreground">
                      {WEEK_LABELS[i]?.slice(0, 1)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Plans list */}
          <section className="mt-4">
            <div className="mb-2.5 flex items-center justify-between">
              <h2 className="font-display text-base font-extrabold">Your plans</h2>
              <Link
                to="/portfolio"
                className="inline-flex items-center gap-0.5 text-xs font-bold text-brand"
              >
                See all <ChevronRight className="size-3.5" />
              </Link>
            </div>
            <div className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-surface md:grid md:grid-cols-3 md:divide-y-0 md:border-0 md:bg-transparent md:gap-4">
              {HOLDINGS.map((h, i) => (
                <Link
                  key={h.name}
                  to="/portfolio"
                  className="flex items-center gap-3 p-4 press md:rounded-3xl md:border md:border-border md:bg-surface"
                >
                  <span
                    className={`grid size-10 shrink-0 place-items-center rounded-2xl text-[11px] font-extrabold ${
                      i === 0
                        ? "bg-accent text-accent-foreground"
                        : i === 1
                          ? "bg-brand text-brand-foreground"
                          : "bg-secondary text-brand"
                    }`}
                  >
                    {h.rate.slice(0, 4)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{h.name}</p>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-brand"
                        style={{
                          width: `${Math.round(((h.totalDays - h.daysLeft) / h.totalDays) * 100)}%`,
                        }}
                      />
                    </div>
                    <p className="mt-1.5 text-[11px] text-muted-foreground">
                      {h.daysLeft} days left · matures {h.date}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-extrabold text-num">{mask(h.amount)}</p>
                </Link>
              ))}
            </div>
          </section>

          {/* Idle wallet nudge */}
          <section className="mt-4 overflow-hidden rounded-3xl border border-gold/40 bg-accent p-4 md:p-6">
            <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-gold text-gold-foreground">
                <Wallet className="size-5" strokeWidth={1.9} />
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

          {/* Payout timeline */}
          <section className="card-surface mt-4 p-4 md:p-6">
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

          {/* For you */}
          <section className="mt-4">
            <div className="mb-2.5 flex items-center gap-2">
              <Lightbulb className="size-4 text-gold" strokeWidth={2} />
              <h2 className="font-display text-base font-extrabold">For you</h2>
            </div>
            <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
              {FEED.map((f, i) => (
                <article
                  key={f.title}
                  className="card-surface w-[78%] shrink-0 snap-center p-4 md:w-auto"
                >
                  <FeedThumb index={i} />
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
                    {f.tag}
                  </p>
                  <h3 className="mt-1 text-sm font-extrabold leading-snug">{f.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{f.body}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}
    </AppShell>
  );
}
