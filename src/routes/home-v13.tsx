import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowUpRight,
  Bell,
  CalendarClock,
  ChevronRight,
  Eye,
  EyeOff,
  FileText,
  Landmark,
  Lightbulb,
  PiggyBank,
  Plus,
  Target,
  Wallet,
} from "lucide-react";
import { AppShell } from "@/components/kipit/AppShell";
import { Logo } from "@/components/kipit/Logo";
import { NewUserEmptyState } from "@/components/kipit/NewUserEmptyState";
import { FeedThumb } from "@/components/kipit/FeedThumb";
import { useBalanceVisibility, useIsNewUser } from "@/hooks/useBalanceVisibility";
import { GreetingText, TierStatusCard, WalletNote } from "@/components/kipit/SpecBlocks";

export const Route = createFileRoute("/home-v13")({
  head: () => ({
    meta: [
      { title: "Kipit Home 13 — The Definitive Wealth Dashboard" },
      {
        name: "description",
        content:
          "Kipit home concept 13: a calm, precise wealth dashboard with a live growth curve, plan holdings, 90-day payout schedule and idle-cash guidance.",
      },
      { property: "og:title", content: "Kipit Home 13 — The Definitive Wealth Dashboard" },
      {
        property: "og:description",
        content:
          "Total value, growth curve, holdings, payout schedule and wallet guidance in one quiet, premium dashboard.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomeV13Screen,
});

/* ---------------------------------------------------------------- data --- */

const WALLET = 500_000;
const INVESTED = 2_450_000;
const TOTAL = WALLET + INVESTED; // ₦2,950,000
const WEEK_EARNINGS = 12_480;

const naira = (v: number) => `₦${v.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
const short = (v: number) =>
  v >= 1_000_000 ? `₦${(v / 1_000_000).toFixed(2)}m` : `₦${Math.round(v / 1000)}k`;

type Frame = "1W" | "1M" | "3M" | "1Y";

const SERIES: Record<Frame, { points: number[]; labels: string[] }> = {
  "1W": {
    points: [2_931_400, 2_934_200, 2_937_800, 2_939_500, 2_943_100, 2_946_800, 2_950_000],
    labels: ["Mon", "", "Wed", "", "Fri", "", "Today"],
  },
  "1M": {
    points: [2_902_000, 2_911_500, 2_908_900, 2_921_300, 2_930_400, 2_938_700, 2_950_000],
    labels: ["W1", "", "W2", "", "W3", "", "Now"],
  },
  "3M": {
    points: [2_760_000, 2_798_000, 2_824_000, 2_861_000, 2_888_000, 2_919_000, 2_950_000],
    labels: ["Jul", "", "Aug", "", "Sep", "", "Now"],
  },
  "1Y": {
    points: [2_180_000, 2_305_000, 2_412_000, 2_566_000, 2_704_000, 2_842_000, 2_950_000],
    labels: ["Sep 25", "", "Jan", "", "May", "", "Now"],
  },
};

const HOLDINGS = [
  {
    name: "Kipit Fixed Income",
    icon: Landmark,
    amount: 750_000,
    rate: 18.5,
    matures: "24 Sep 2026",
    daysLeft: 23,
    tenor: 90,
  },
  {
    name: "Kipit Lock",
    icon: Target,
    amount: 1_100_000,
    rate: 21,
    matures: "12 Mar 2027",
    daysLeft: 192,
    tenor: 365,
  },
  {
    name: "Goal — Rent",
    icon: PiggyBank,
    amount: 600_000,
    rate: 15.2,
    matures: "05 Dec 2026",
    daysLeft: 95,
    tenor: 180,
  },
];

const PAYOUTS = [
  { label: "Sep", amount: 785_600, plan: "Fixed Income matures" },
  { label: "Oct", amount: 22_400, plan: "Monthly interest" },
  { label: "Nov", amount: 22_400, plan: "Monthly interest" },
  { label: "Dec", amount: 622_800, plan: "Goal — Rent matures" },
];

const FEED = [
  {
    tag: "Product update",
    title: "Fixed Income now settles same-day",
    body: "Maturity payouts land in your wallet within minutes of maturity.",
  },
  {
    tag: "Education",
    title: "Tenor, rate and your real return",
    body: "A 3-minute read on how tenor shapes the money you actually keep.",
  },
  {
    tag: "Announcement",
    title: "Tier 2 verification is now instant",
    body: "Upgrade with your BVN and NIN to raise your transaction limits.",
  },
];

const ACTIONS = [
  { label: "Add money", icon: ArrowDownToLine },
  { label: "Withdraw", icon: ArrowUpFromLine },
  { label: "New plan", icon: Plus },
  { label: "Statements", icon: FileText },
];

/* --------------------------------------------------------------- chart --- */

function GrowthCurve({ frame }: { frame: Frame }) {
  const { points, labels } = SERIES[frame];
  const { line, area } = useMemo(() => {
    const w = 600;
    const h = 170;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const span = max - min || 1;
    const coords = points.map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - 12 - ((p - min) / span) * (h - 34);
      return [x, y] as const;
    });
    // smooth cubic path
    const first = coords[0] ?? ([0, h] as const);
    let d = `M ${first[0]} ${first[1]}`;
    for (let i = 1; i < coords.length; i++) {
      const [x0, y0] = coords[i - 1]!;
      const [x1, y1] = coords[i]!;
      const cx = (x0 + x1) / 2;
      d += ` C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`;
    }
    return { line: d, area: `${d} L ${w} ${h} L 0 ${h} Z` };
  }, [points]);

  return (
    <figure className="mt-6">
      <svg
        viewBox="0 0 600 170"
        preserveAspectRatio="none"
        className="h-40 w-full md:h-44"
        role="img"
        aria-label={`Portfolio growth over ${frame}`}
      >
        <defs>
          <linearGradient id="v13-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.34" />
            <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((g) => (
          <line
            key={g}
            x1="0"
            x2="600"
            y1={170 * g}
            y2={170 * g}
            stroke="currentColor"
            strokeOpacity="0.12"
            strokeWidth="1"
          />
        ))}
        <path d={area} fill="url(#v13-fill)" />
        <path
          d={line}
          fill="none"
          stroke="var(--gold)"
          strokeWidth="3"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <figcaption className="mt-2 grid grid-cols-7 text-[11px] font-medium opacity-60">
        {labels.map((l, i) => (
          <span key={i} className={i === labels.length - 1 ? "text-right" : ""}>
            {l}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}

/* ---------------------------------------------------------------- page --- */

function HomeV13Screen() {
  const { hidden, toggle, mask } = useBalanceVisibility();
  const isNewUser = useIsNewUser();
  const [frame, setFrame] = useState<Frame>("1M");

  const delta = useMemo(() => {
    const p = SERIES[frame].points;
    const change = p[p.length - 1] - p[0];
    return { change, pct: (change / p[0]) * 100 };
  }, [frame]);

  const maxPayout = Math.max(...PAYOUTS.map((p) => p.amount));

  return (
    <AppShell title="Home" navVariant="morph">
      <div className="type-v13">
        {/* Mobile identity bar */}
        <div className="-mx-4 flex items-center justify-between px-5 pb-3 pt-5 md:hidden">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-full bg-brand text-xs font-bold text-brand-foreground">
              AO
            </span>
            <div>
              <p className="text-[11px] text-muted-foreground">
                <GreetingText />
              </p>
              <p className="text-sm font-bold">Adaeze O.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Logo className="text-lg" />
            <Link
              to="/notifications"
              aria-label="Notifications"
              className="relative grid size-9 place-items-center rounded-full border border-border bg-surface"
            >
              <Bell className="size-4" />
              <span className="absolute right-2 top-2 size-1.5 rounded-full bg-gold" />
            </Link>
          </div>
        </div>

        {/* Desktop greeting */}
        <div className="hidden items-end justify-between md:flex">
          <div>
            <p className="text-sm text-muted-foreground">
              <GreetingText />
            </p>
            <h1 className="font-display text-3xl">Adaeze O.</h1>
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

        {isNewUser ? (
          <div className="mt-5">
            <NewUserEmptyState />
          </div>
        ) : (
          <>
            {/* Hero: total value + growth curve */}
            <section className="mt-4 overflow-hidden rounded-[2rem] bg-brand-gradient p-6 text-brand-foreground shadow-float md:mt-6 md:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-medium opacity-70">
                    Total value
                    <button
                      type="button"
                      onClick={toggle}
                      aria-label={hidden ? "Show balances" : "Hide balances"}
                      className="md:hidden"
                    >
                      {hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  <p className="font-display mt-1 text-[2.6rem] leading-none md:text-6xl">
                    {mask(TOTAL)}
                  </p>
                  <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-foreground/12 px-3 py-1 text-xs font-semibold">
                    <ArrowUpRight className="size-3.5 text-gold" />
                    {hidden ? "••••" : `+${naira(delta.change)}`} · +{delta.pct.toFixed(2)}%
                    <span className="opacity-60">{frame}</span>
                  </p>
                </div>

                <div className="flex rounded-full bg-brand-foreground/10 p-1">
                  {(Object.keys(SERIES) as Frame[]).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFrame(f)}
                      aria-pressed={frame === f}
                      className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                        frame === f
                          ? "bg-gold-gradient text-gold-foreground"
                          : "text-brand-foreground/65"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <GrowthCurve frame={frame} />

              <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-brand-foreground/12 pt-5">
                {[
                  { k: "Invested", v: mask(INVESTED) },
                  { k: "Wallet", v: mask(WALLET) },
                  { k: "Earned this week", v: mask(WEEK_EARNINGS) },
                ].map((s) => (
                  <div key={s.k}>
                    <dt className="text-[11px] opacity-65">{s.k}</dt>
                    <dd className="font-display mt-1 text-base md:text-xl">{s.v}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {/* Actions */}
            <section className="mt-4 grid grid-cols-4 gap-2 md:mt-5 md:gap-3">
              {ACTIONS.map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  type="button"
                  className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface px-2 py-3.5 text-center transition-colors hover:border-gold/60 md:flex-row md:justify-start md:gap-3 md:px-4 md:text-left"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground transition-colors group-hover:bg-gold-gradient group-hover:text-gold-foreground">
                    <Icon className="size-4.5" />
                  </span>
                  <span className="text-xs font-semibold leading-tight md:text-sm">{label}</span>
                </button>
              ))}
            </section>

            {/* Holdings + payout schedule */}
            <section className="mt-4 grid gap-4 md:mt-6 md:grid-cols-5">
              <div className="rounded-[1.75rem] border border-border bg-surface p-5 shadow-card md:col-span-3 md:p-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg">Your plans</h2>
                  <Link
                    to="/portfolio"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand"
                  >
                    View all <ChevronRight className="size-3.5" />
                  </Link>
                </div>

                <ul className="mt-4 space-y-3">
                  {HOLDINGS.map((h) => {
                    const Icon = h.icon;
                    const progress = Math.round(((h.tenor - h.daysLeft) / h.tenor) * 100);
                    return (
                      <li
                        key={h.name}
                        className="rounded-2xl border border-border/70 p-4 transition-colors hover:border-brand/30"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
                              <Icon className="size-4.5" />
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold">{h.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {h.rate}% p.a. · matures {h.matures}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-display text-base">{mask(h.amount)}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {h.daysLeft} days left
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <span
                            className="block h-full rounded-full bg-gold-gradient"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="rounded-[1.75rem] border border-border bg-surface p-5 shadow-card md:col-span-2 md:p-6">
                <div className="flex items-center gap-2">
                  <CalendarClock className="size-4 text-brand" />
                  <h2 className="font-display text-lg">Next 4 payouts</h2>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Expected credits to your Kipit wallet.
                </p>
                <ul className="mt-4 space-y-3.5">
                  {PAYOUTS.map((p) => (
                    <li key={p.label}>
                      <div className="flex items-baseline justify-between text-xs">
                        <span className="font-semibold">{p.label}</span>
                        <span className="font-display text-sm">
                          {hidden ? "₦•••" : short(p.amount)}
                        </span>
                      </div>
                      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
                        <span
                          className="block h-full rounded-full bg-brand-gradient"
                          style={{ width: `${Math.max(8, (p.amount / maxPayout) * 100)}%` }}
                        />
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground">{p.plan}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Idle cash guidance */}
            <section className="mt-4 grid gap-4 md:mt-6 md:grid-cols-5">
              <article className="rounded-[1.75rem] border border-gold/40 bg-accent p-5 md:col-span-3 md:flex md:items-center md:justify-between md:gap-6 md:p-6">
                <div className="flex gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gold-gradient text-gold-foreground">
                    <Lightbulb className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-accent-foreground">
                      {naira(WALLET)} in your wallet isn&apos;t working yet.
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-accent-foreground/80">
                      At 18.5% p.a. for 90 days that&apos;s about {naira(23_125)} in interest.
                      Plans start from ₦50,000.
                    </p>
                  </div>
                </div>
                <Link
                  to="/invest"
                  className="mt-4 inline-flex w-full items-center justify-center gap-1 rounded-full bg-brand px-5 py-3 text-sm font-bold text-brand-foreground md:mt-0 md:w-auto md:shrink-0"
                >
                  Invest now <ChevronRight className="size-4" />
                </Link>
              </article>

              <article className="rounded-[1.75rem] border border-border bg-surface p-5 shadow-card md:col-span-2 md:p-6">
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <Wallet className="size-4" /> Wallet balance
                </div>
                <p className="font-display mt-2 text-3xl">{mask(WALLET)}</p>
                <WalletNote className="mt-3" />
              </article>
            </section>

            {/* Feed */}
            <section className="mt-6">
              <h2 className="font-display text-lg">For you</h2>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                {FEED.map((item, i) => (
                  <article
                    key={item.title}
                    className="rounded-[1.5rem] border border-border bg-surface p-4 shadow-card transition-transform active:scale-[0.99]"
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

            <section className="mt-6">
              <TierStatusCard />
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}
