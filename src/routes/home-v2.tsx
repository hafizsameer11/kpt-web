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

export const Route = createFileRoute("/home-v2")({
  head: () => ({
    meta: [
      { title: "Kipit Home — Statement View" },
      {
        name: "description",
        content:
          "A calm, statement-style Kipit home: portfolio position, wallet, weekly interest, holdings with maturity progress and upcoming payouts.",
      },
      { property: "og:title", content: "Kipit Home — Statement View" },
      {
        property: "og:description",
        content: "Statement-style Kipit home dashboard with holdings and payout schedule.",
      },
    ],
  }),
  component: HomeV2Screen,
});

const maxWeek = Math.max(...WEEK_SERIES);

function HomeV2Screen() {
  const { hidden, toggle, mask } = useBalanceVisibility();
  const isNewUser = useIsNewUser();
  const [tab, setTab] = useState<"holdings" | "payouts">("holdings");

  return (
    <div className="type-v3">
      <AppShell navVariant="elevated">
        {/* Mobile header */}
        <header className="-mx-4 mb-5 bg-surface px-5 pb-5 pt-5 md:hidden">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">
                <GreetingText />
              </p>
              <p className="truncate text-sm font-bold">Adaeze Okafor</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Logo tone="brand" className="text-lg" />
              <Link
                to="/notifications"
                aria-label="Notifications"
                className="relative grid size-10 place-items-center rounded-2xl border border-border text-foreground"
              >
                <Bell className="size-5" />
                <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-gold" />
              </Link>
              <Link
                to="/settings"
                aria-label="Profile"
                className="grid size-10 place-items-center rounded-2xl bg-brand text-sm font-bold text-brand-foreground"
              >
                AO
              </Link>
            </div>
          </div>
        </header>

        {isNewUser ? (
          <NewUserEmptyState />
        ) : (
          <>
            {/* Position statement */}
            <section className="rounded-[1.75rem] border border-border bg-surface p-6 shadow-card md:p-8">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
                    Total portfolio value
                  </p>
                  <p className="mt-2 text-4xl font-extrabold tracking-tight md:text-5xl">
                    {mask(TOTAL)}
                  </p>
                  <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-bold text-success">
                    <ArrowUpRight className="size-3.5" /> +{naira(MONTH_CHANGE)} ·{" "}
                    +{MONTH_CHANGE_PCT}% this month
                  </p>
                </div>
                <button
                  type="button"
                  onClick={toggle}
                  aria-label={hidden ? "Show balances" : "Hide balances"}
                  className="grid size-10 shrink-0 place-items-center rounded-2xl border border-border text-muted-foreground transition-colors hover:bg-secondary"
                >
                  {hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>

              {/* Composition bar */}
              <div className="mt-6 flex h-3 overflow-hidden rounded-full bg-secondary">
                <span
                  className="bg-brand-gradient"
                  style={{ width: `${(INVESTED / TOTAL) * 100}%` }}
                />
                <span className="flex-1 bg-gold-gradient" />
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <dt className="text-xs text-muted-foreground">Invested</dt>
                  <dd className="mt-1 text-lg font-extrabold">{mask(INVESTED)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Wallet</dt>
                  <dd className="mt-1 text-lg font-extrabold">{mask(WALLET)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Weekly interest</dt>
                  <dd className="mt-1 text-lg font-extrabold text-success">
                    {mask(WEEK_EARNINGS)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Active plans</dt>
                  <dd className="mt-1 text-lg font-extrabold">{HOLDINGS.length}</dd>
                </div>
              </dl>
            </section>

            {/* Quick actions */}
            <section className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {QUICK_ACTIONS.map(({ label, icon: Icon, to }) => (
                <Link
                  key={label}
                  to={to}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3.5 shadow-card transition-colors hover:border-brand/40 hover:bg-accent/30"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand text-brand-foreground">
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0 truncate text-[13px] font-bold">{label}</span>
                </Link>
              ))}
            </section>

            <div className="mt-4 grid items-start gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
              {/* Holdings / payouts ledger */}
              <section className="rounded-[1.75rem] border border-border bg-surface p-6 shadow-card">
                <div className="flex gap-1 rounded-full bg-secondary p-1">
                  {(["holdings", "payouts"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTab(t)}
                      className={`flex-1 rounded-full px-4 py-2 text-xs font-bold capitalize transition-colors ${
                        tab === t ? "bg-brand text-brand-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {t === "holdings" ? "Holdings" : "Upcoming payouts"}
                    </button>
                  ))}
                </div>

                {tab === "holdings" ? (
                  <ul className="mt-5 space-y-4">
                    {HOLDINGS.map((h) => (
                      <li key={h.name} className="rounded-2xl border border-border p-4">
                        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold">{h.name}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {h.rate} · matures {h.date} · {h.daysLeft} days left
                            </p>
                          </div>
                          <p className="shrink-0 text-sm font-extrabold">{mask(h.amount)}</p>
                        </div>
                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
                          <span
                            className="block h-full rounded-full bg-gold-gradient"
                            style={{
                              width: `${Math.round(
                                ((h.totalDays - h.daysLeft) / h.totalDays) * 100,
                              )}%`,
                            }}
                          />
                        </div>
                      </li>
                    ))}
                    <li>
                      <Link
                        to="/portfolio"
                        className="inline-flex items-center gap-1 text-xs font-bold text-brand"
                      >
                        View full portfolio <ChevronRight className="size-3.5" />
                      </Link>
                    </li>
                  </ul>
                ) : (
                  <ul className="mt-5 divide-y divide-border">
                    {PAYOUTS.map((p) => (
                      <li
                        key={p.label}
                        className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3.5"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{p.label}</p>
                          <p className="text-xs text-muted-foreground">{p.date}</p>
                        </div>
                        <p className="shrink-0 text-sm font-extrabold text-success">
                          +{mask(p.amount)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* Side column: wallet, weekly earnings, maturity */}
              <div className="space-y-4">
                <section className="rounded-[1.75rem] border border-border bg-surface p-6 shadow-card">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    <Wallet className="size-4" /> Wallet
                  </div>
                  <p className="mt-3 text-3xl font-extrabold tracking-tight">{mask(WALLET)}</p>
                  <p className="mt-1 text-xs font-semibold text-muted-foreground">
                    Available funds: {mask(WALLET)}
                  </p>
                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                    Funds in your wallet are available for investment or withdrawal anytime and
                    do not earn interest or investment returns.
                  </p>
                  <Link
                    to="/invest"
                    className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-brand px-5 py-3 text-sm font-bold text-brand-foreground"
                  >
                    Add money
                  </Link>
                </section>

                <section className="rounded-[1.75rem] border border-border bg-surface p-6 shadow-card">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Weekly earnings
                  </p>
                  <p className="mt-2 text-2xl font-extrabold text-gold">{mask(WEEK_EARNINGS)}</p>
                  <div className="mt-4 flex h-20 items-end gap-2">
                    {WEEK_SERIES.map((v, i) => (
                      <div key={WEEK_LABELS[i]} className="flex flex-1 flex-col items-center gap-1.5">
                        <span
                          className="w-full rounded-t-md bg-gold-gradient"
                          style={{ height: `${(v / maxWeek) * 64}px` }}
                        />
                        <span className="text-[10px] font-semibold text-muted-foreground">
                          {WEEK_LABELS[i]}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-[1.75rem] bg-brand-gradient p-6 text-primary-foreground shadow-card">
                  <p className="text-xs font-bold uppercase tracking-widest text-primary-foreground/70">
                    Next maturity
                  </p>
                  <p className="mt-2 text-sm font-bold">
                    {NEXT_MATURITY.name} · {NEXT_MATURITY.tenor}
                  </p>
                  <p className="mt-1 text-2xl font-extrabold">{mask(NEXT_MATURITY.amount)}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-primary-foreground/75">
                    <span>Matures {NEXT_MATURITY.date}</span>
                    <span className="rounded-full bg-white/15 px-2.5 py-1 font-bold">
                      {NEXT_MATURITY.daysLeft} days left
                    </span>
                  </div>
                </section>
              </div>
            </div>

            {/* Recommendation */}
            <section className="mt-4 grid gap-4 rounded-[1.75rem] border border-gold/40 bg-accent p-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
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
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                {FEED.map((item, i) => (
                  <article
                    key={item.title}
                    className="rounded-[1.5rem] border border-border bg-surface p-5 shadow-card"
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

          </>
        )}
      </AppShell>
    </div>
  );
}
