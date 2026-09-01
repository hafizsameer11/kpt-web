import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Bell,
  ChevronRight,
  Eye,
  EyeOff,
  FileText,
  Lightbulb,
  PlusCircle,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { AppShell } from "@/components/kipit/AppShell";
import { Logo } from "@/components/kipit/Logo";
import { NewUserEmptyState } from "@/components/kipit/NewUserEmptyState";
import { FeedThumb } from "@/components/kipit/FeedThumb";
import { useBalanceVisibility, useIsNewUser } from "@/hooks/useBalanceVisibility";
import { GreetingText } from "@/components/kipit/SpecBlocks";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kipit Home — Your Investment Dashboard" },
      {
        name: "description",
        content:
          "See your Kipit portfolio value, wallet balance, weekly earnings and next maturity, and act fast with add money, withdraw and new plan.",
      },
      { property: "og:title", content: "Kipit Home — Your Investment Dashboard" },
      {
        property: "og:description",
        content:
          "Track your portfolio, wallet and investment plans in one place with Kipit.",
      },
    ],
  }),
  component: HomeScreen,
});

const naira = (value: number) =>
  `₦${value.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;

const QUICK_ACTIONS = [
  { label: "Add Money", icon: ArrowDownToLine },
  { label: "Withdraw", icon: ArrowUpFromLine },
  { label: "New Plan", icon: PlusCircle },
  { label: "Statements", icon: FileText },
];

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

function HomeScreen() {
  const { hidden, toggle, mask } = useBalanceVisibility();
  const isNewUser = useIsNewUser();


  return (
    <AppShell>
      {/* Mobile app header */}
      <header className="-mx-4 mb-4 rounded-b-[2rem] bg-brand-gradient px-5 pb-10 pt-6 text-brand-foreground md:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-full bg-brand-foreground/15 text-sm font-bold">
              AO
            </div>
            <div>
              <p className="text-xs opacity-75"><GreetingText /></p>
              <p className="text-sm font-bold">Adaeze O.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Logo tone="light" className="text-lg" />
            <Link
              to="/notifications"
              aria-label="Notifications"
              className="relative grid size-10 place-items-center rounded-full bg-brand-foreground/15"
            >
              <Bell className="size-5" />
              <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-gold" />
            </Link>

          </div>
        </div>

        <div className="mt-7">
          <div className="flex items-center gap-2 text-xs opacity-75">
            Total portfolio value
            <button
              type="button"
              onClick={toggle}
              aria-label={hidden ? "Show balances" : "Hide balances"}
            >
              {hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          <p className="mt-1 text-4xl font-extrabold tracking-tight">{mask(2450000)}</p>
          <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-brand-foreground/15 px-2.5 py-1 text-xs font-semibold">
            <TrendingUp className="size-3.5" /> +₦38,200 · +1.58% this month
          </p>
        </div>
      </header>

      {/* Desktop greeting + portfolio */}
      <section className="hidden md:block">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-muted-foreground"><GreetingText /></p>
            <h1 className="text-3xl font-extrabold tracking-tight">Adaeze O.</h1>
          </div>
          <button
            type="button"
            onClick={toggle}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold"
          >
            {hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            {hidden ? "Show balances" : "Hide balances"}
          </button>
        </div>
        <div className="mt-5 rounded-3xl bg-brand-gradient p-8 text-brand-foreground shadow-float">
          <p className="text-sm opacity-75">Total portfolio value</p>
          <p className="mt-2 text-5xl font-extrabold tracking-tight">{mask(2450000)}</p>
          <p className="mt-3 inline-flex items-center gap-1 rounded-full bg-brand-foreground/15 px-3 py-1 text-sm font-semibold">
            <TrendingUp className="size-4" /> +₦38,200 · +1.58% this month
          </p>
        </div>
      </section>

      {isNewUser ? (
        <div className="mt-5">
          <NewUserEmptyState />
        </div>
      ) : (
      <>
      {/* Quick actions */}
      <section className="mt-5 grid grid-cols-4 gap-2 md:mt-6 md:gap-4">

        {QUICK_ACTIONS.map(({ label, icon: Icon }) => (
          <button
            key={label}
            type="button"
            className="flex flex-col items-center gap-2 rounded-2xl bg-surface p-3 text-center shadow-card transition-transform active:scale-95 md:flex-row md:justify-start md:gap-3 md:p-4 md:text-left"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-accent text-accent-foreground">
              <Icon className="size-5" />
            </span>
            <span className="text-[11px] font-semibold leading-tight md:text-sm">
              {label}
            </span>
          </button>
        ))}
      </section>

      {/* Wallet + earnings + maturity */}
      <section className="mt-4 grid gap-4 md:mt-6 md:grid-cols-3">
        <article className="rounded-3xl bg-surface p-5 shadow-card md:col-span-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Wallet className="size-4" /> Wallet balance
          </div>
          <p className="mt-2 text-2xl font-extrabold">{mask(500000)}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Available funds: {mask(500000)}
          </p>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Funds in your wallet are available for investment or withdrawal anytime. Wallet funds
            do not earn interest or investment returns.
          </p>
        </article>

        <article className="rounded-3xl bg-surface p-5 shadow-card">
          <p className="text-sm font-semibold text-muted-foreground">Weekly earnings</p>
          <p className="mt-2 text-2xl font-extrabold text-success">{mask(12480)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Interest earned this week</p>
          <div className="mt-4 flex h-14 items-end gap-1.5">
            {[38, 52, 44, 66, 58, 80, 72].map((h, i) => (
              <span
                key={i}
                style={{ height: `${h}%` }}
                className="flex-1 rounded-t-md bg-gold-gradient"
              />
            ))}
          </div>
        </article>

        <article className="rounded-3xl bg-surface p-5 shadow-card">
          <p className="text-sm font-semibold text-muted-foreground">Next maturity</p>
          <p className="mt-2 text-base font-bold">Kipit Fixed Income · 90 days</p>
          <p className="mt-1 text-2xl font-extrabold">{mask(750000)}</p>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>Matures 14 Oct 2026</span>
            <span className="rounded-full bg-accent px-2.5 py-1 font-semibold text-accent-foreground">
              23 days left
            </span>
          </div>
        </article>
      </section>

      {/* Recommendation */}
      <section className="mt-4 rounded-3xl border border-gold/40 bg-accent p-5 md:mt-6 md:flex md:items-center md:justify-between md:gap-6">
        <div className="flex gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-gold-gradient text-gold-foreground">
            <Lightbulb className="size-5" />
          </span>
          <div>
            <p className="text-sm font-bold text-accent-foreground">
              Your ₦500,000 wallet balance isn't currently invested.
            </p>
            <p className="mt-1 text-xs text-accent-foreground/80">
              Plans from 18.5% p.a. · 30–365 day tenors · ₦50,000 minimum.
            </p>
          </div>
        </div>
        <button
          type="button"
          className="mt-4 inline-flex w-full items-center justify-center gap-1 rounded-full bg-brand px-5 py-3 text-sm font-bold text-brand-foreground md:mt-0 md:w-auto"
        >
          Explore Investments <ChevronRight className="size-4" />
        </button>
      </section>

      {/* Content feed */}
      <section className="mt-6">
        <h2 className="text-lg font-extrabold tracking-tight">For you</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {FEED.map((item, i) => (
            <article
              key={item.title}
              className="rounded-3xl bg-surface p-5 shadow-card transition-transform active:scale-[0.99]"
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

  );
}
