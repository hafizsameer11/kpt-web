import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  Eye,
  EyeOff,
  Info,
  Plus,
  ShieldCheck,
  Target,
  TrendingUp,
} from "lucide-react";
import { AppShell } from "@/components/kipit/AppShell";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useBalanceVisibility } from "@/hooks/useBalanceVisibility";
import { naira, WALLET } from "@/lib/home-data";
import {
  CALL_ACCOUNT,
  CALL_ACCRUAL_TREND,
  CALL_ACCOUNT_FACTS,
  CALL_ACTIVITY,
  buildCallMonth,
  type CallDayInterest,
} from "@/lib/invest-data";

export const Route = createFileRoute("/call-account")({
  head: () => ({
    meta: [
      { title: "Call Account — Daily Interest on Idle Cash | Kipit" },
      {
        name: "description",
        content:
          "Track your Kipit Call Account: current balance, 14.5% p.a. rate, daily interest accrual, recent activity, and instant add money or withdraw.",
      },
      { property: "og:title", content: "Call Account — Daily Interest on Idle Cash | Kipit" },
      {
        property: "og:description",
        content:
          "Your Kipit Call Account balance, daily accrual and activity — withdraw anytime with no penalty.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CallAccountScreen,
});

/** Smooth (Catmull-Rom → bezier) SVG path for the 14-day accrual trend. */
function trendPoints(values: number[], w: number, h: number) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  return values.map((v, i) => ({
    x: (i / (values.length - 1)) * w,
    y: h - ((v - min) / span) * (h - 10) - 5,
  }));
}

function smoothPath(pts: { x: number; y: number }[]) {
  const first = pts[0];
  if (!first || pts.length < 2) return "";
  let d = `M${first.x.toFixed(1)},${first.y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p1 = pts[i]!;
    const p2 = pts[i + 1]!;
    const p0 = pts[i - 1] ?? p1;
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }
  return d;
}



function CallAccountScreen() {
  const { mask, hidden, toggle } = useBalanceVisibility();
  const pts = trendPoints(CALL_ACCRUAL_TREND, 300, 88);
  const line = smoothPath(pts);
  const last = pts[pts.length - 1] ?? { x: 300, y: 44 };


  return (
    <AppShell title="Call Account" navVariant="elevated">
      <div className="pb-2">
        {/* ── Hero ───────────────────────────────────────────────── */}
        <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-14 pt-6 text-primary-foreground md:mx-0 md:rounded-[2rem] md:px-8 md:pb-14 md:pt-8 md:shadow-float">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-32 size-72 rounded-full bg-gold/15 blur-[64px]"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-28 -left-20 size-64 rounded-full bg-white/10 blur-[56px]"
          />

          <div className="relative md:max-w-3xl">
            <div className="flex items-center justify-between gap-3">
              <Link
                to="/invest"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold text-primary-foreground press md:hidden"
              >
                <ArrowLeft className="size-3.5" /> Invest
              </Link>
              <button
                type="button"
                onClick={toggle}
                aria-label={hidden ? "Show balances" : "Hide balances"}
                className="ml-auto grid size-9 place-items-center rounded-full border border-white/15 bg-white/10 press"
              >
                {hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>

            {/* Title + rate */}
            <div className="mt-5 flex items-center justify-between gap-3">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary-foreground/60">
                {CALL_ACCOUNT.name}
              </p>
              <span className="shrink-0 rounded-full bg-gold/15 px-2.5 py-1 text-[11px] font-extrabold text-gold">
                {CALL_ACCOUNT.rate}
              </span>
            </div>

            {/* Balance lockup */}
            <div className="mt-2 space-y-1">
              <p className="font-display text-[40px] font-extrabold leading-none tracking-[-0.035em] text-num md:text-[48px]">
                {mask(CALL_ACCOUNT.balance)}
              </p>
              <p className="flex items-center gap-1.5 text-[12px] font-medium text-primary-foreground/60">
                <ShieldCheck className="size-3.5 text-primary-foreground/70" />
                {CALL_ACCOUNT.liquidity} &middot; min {naira(CALL_ACCOUNT.minimum)}
              </p>
            </div>

            {/* Accrual summary — minimal inline */}
            <div className="mt-5 flex gap-6">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary-foreground/50">
                  Earned today
                </p>
                <p className="mt-0.5 text-lg font-extrabold text-gold text-num">
                  {mask(CALL_ACCOUNT.accruedToday)}
                </p>
              </div>
              <div className="w-px bg-white/15" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary-foreground/50">
                  This month
                </p>
                <p className="mt-0.5 text-lg font-extrabold text-num">
                  {mask(CALL_ACCOUNT.accruedThisMonth)}
                </p>
              </div>
            </div>

            {/* Actions (MOB-061) — minimal text row */}
            <div className="mt-5 flex items-center gap-1">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full bg-gold px-4 py-2.5 text-[12px] font-extrabold text-gold-foreground press"
              >
                Add money <ArrowUpRight className="size-3.5" strokeWidth={2.6} />
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[12px] font-bold text-primary-foreground/90 press hover:text-primary-foreground"
              >
                <ArrowDownLeft className="size-3.5" strokeWidth={2.6} /> Withdraw
              </button>
              <a
                href="#activity"
                className="inline-flex items-center rounded-full px-4 py-2.5 text-[12px] font-bold text-primary-foreground/90 press hover:text-primary-foreground"
              >
                Activity
              </a>
            </div>
          </div>
        </section>

        {/* ── Sheet ─────────────────────────────────────────────── */}
        <div className="relative -mx-4 -mt-8 rounded-t-[2rem] bg-background px-4 pt-5 md:mx-0 md:mt-6 md:rounded-none md:bg-transparent md:px-0 md:pt-0">
          <span
            aria-hidden
            className="mx-auto mb-4 block h-1 w-10 rounded-full bg-border md:hidden"
          />

          {/* Daily accrual trend */}
          <section className="card-surface p-4 md:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Interest earned today
                </p>
                <p className="mt-1 font-display text-[26px] font-extrabold leading-none text-num">
                  {mask(CALL_ACCOUNT.accruedToday)}
                </p>
                <p className="mt-1.5 text-[11.5px] text-muted-foreground">
                  Accrues daily &middot; credited monthly
                </p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent/15 px-2.5 py-1 text-[11px] font-bold text-brand">
                <TrendingUp className="size-3.5" /> {CALL_ACCOUNT.rate}
              </span>
            </div>

            {/* 14-day calendar grid — today first, no scroll */}
            <FourteenDayCalendar mask={mask} />
          </section>


          {/* Full-month interest calendar */}
          <MonthInterestCalendar mask={mask} />

          {/* Third Interest earned today design — radial gauge */}
          <TodayInterestGauge mask={mask} />

          {/* Product explanation */}
          <section className="mt-4 card-surface p-4 md:p-5">
            <div className="flex items-center gap-2">
              <Info className="size-4 shrink-0 text-brand" />
              <h2 className="font-display text-base font-extrabold">How it works</h2>
            </div>
            <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">
              {CALL_ACCOUNT.blurb}
            </p>
            <ul className="mt-3 space-y-2">
              {CALL_ACCOUNT_FACTS.map((fact) => (
                <li key={fact} className="flex gap-2 text-[12px] leading-relaxed text-foreground/85">
                  <span
                    aria-hidden
                    className="mt-[7px] size-1.5 shrink-0 rounded-full bg-accent"
                  />
                  {fact}
                </li>
              ))}
            </ul>
          </section>

          {/* Add money shortcut */}
          <section className="mt-4 overflow-hidden rounded-3xl border border-border bg-card p-4 md:p-5">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-bold">Wallet available</p>
                <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                  {mask(WALLET)} idle &middot; move it here to earn {CALL_ACCOUNT.rate}
                </p>
              </div>
              <button
                type="button"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-brand px-4 py-2.5 text-[11.5px] font-extrabold text-brand-foreground press"
              >
                <Plus className="size-3.5" strokeWidth={2.6} /> Add money
              </button>
            </div>
          </section>

          {/* Activity */}
          <section id="activity" className="mt-7 scroll-mt-20">
            <div className="mb-3 flex items-center justify-between px-1">
              <h2 className="font-display text-base font-extrabold">Activity</h2>
              <Link to="/portfolio" className="text-xs font-bold text-brand">
                View all
              </Link>
            </div>
            <ul className="overflow-hidden rounded-3xl border border-border/60 bg-card">
              {CALL_ACTIVITY.map((item, i) => {
                const credit = item.kind !== "withdrawal";
                const Icon =
                  item.kind === "interest"
                    ? TrendingUp
                    : item.kind === "deposit"
                      ? ArrowUpRight
                      : ArrowDownLeft;
                return (
                  <li
                    key={item.id}
                    className={`flex items-center gap-3.5 px-4 py-3.5 ${
                      i > 0 ? "border-t border-border/50" : ""
                    }`}
                  >
                    <span
                      className={`grid size-10 shrink-0 place-items-center rounded-2xl ${
                        credit ? "bg-accent/15 text-brand" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="size-[17px]" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-bold">{item.label}</span>
                      <span className="block text-[11px] text-muted-foreground">{item.date}</span>
                    </span>
                    <span
                      className={`shrink-0 text-[13px] font-extrabold text-num ${
                        credit ? "text-brand" : "text-foreground"
                      }`}
                    >
                      {credit ? "+" : "−"}
                      {mask(item.amount)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>

          <p className="mt-4 flex items-start gap-2 px-1 text-[11px] leading-relaxed text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
            The Call Account rate is indicative per annum, accrues daily and may change with market
            conditions. Balances are held with Kipit&rsquo;s SEC-licensed partner.
          </p>
        </div>
      </div>
    </AppShell>
  );
}

type Day14 = {
  label: string;
  interest: number;
  balance: number;
  rate: string;
  isToday: boolean;
};

function build14Days(): Day14[] {
  const ref = new Date();
  const today = ref.getDate();
  const year = ref.getFullYear();
  const month = ref.getMonth();
  return [...CALL_ACCRUAL_TREND].reverse().map((interest, i) => {
    const isToday = i === 0;
    const date = new Date(year, month, today - i);
    const label = isToday
      ? "Today"
      : i === 1
        ? "Yesterday"
        : date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    return {
      label,
      interest,
      balance: CALL_ACCOUNT.balance - i * 900,
      rate: CALL_ACCOUNT.rate,
      isToday,
    };
  });
}

/** 14-day interest calendar with per-day detail dialog. */
function FourteenDayCalendar({ mask }: { mask: (n: number) => string }) {
  const days = useMemo(() => build14Days(), []);
  const [selected, setSelected] = useState<Day14 | null>(null);
  const total = days.reduce((a, d) => a + d.interest, 0);

  return (
    <div className="mt-5">
      <div className="grid grid-cols-7 gap-2">
        {days.map((d, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setSelected(d)}
            aria-label={`${d.label} interest`}
            className={`flex flex-col items-center gap-1 rounded-2xl px-1 py-2.5 press transition ${
              d.isToday
                ? "bg-brand text-primary-foreground shadow-sm"
                : "bg-muted/60 text-foreground hover:bg-muted"
            }`}
          >
            <span
              className={`text-[9px] font-semibold ${
                d.isToday ? "text-primary-foreground/70" : "text-muted-foreground"
              }`}
            >
              {d.label}
            </span>
            <span
              className={`text-[11px] font-extrabold text-num ${
                d.isToday ? "text-gold" : ""
              }`}
            >
              {mask(d.interest)}
            </span>
            <span
              className={`h-0.5 w-full rounded-full ${
                d.isToday ? "bg-gold" : "bg-border"
              }`}
            />
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-3">
        <p className="text-[11px] font-semibold text-muted-foreground">Last 14 days</p>
        <p className="text-[12.5px] font-extrabold text-num">{mask(total)}</p>
      </div>

      <Dialog open={selected !== null} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-[320px] rounded-3xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-base font-extrabold">
                  {selected.label}
                </DialogTitle>
                <DialogDescription className="text-[12px]">
                  Daily interest on your Call Account balance.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-1 rounded-2xl bg-muted/60 p-4 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Interest earned
                </p>
                <p className="mt-1 font-display text-[30px] font-extrabold leading-none text-num">
                  {mask(selected.interest)}
                </p>
              </div>
              <dl className="mt-1 space-y-2 text-[12.5px]">
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Closing balance</dt>
                  <dd className="font-extrabold text-num">{mask(selected.balance)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Rate applied</dt>
                  <dd className="font-extrabold">{selected.rate}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd className="font-extrabold text-brand">Accrued</dd>
                </div>
              </dl>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                Interest accrues daily and is credited to your Call Account on the 1st of each
                month.
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** Full-month interest calendar with per-day detail dialog. */
function MonthInterestCalendar({ mask }: { mask: (n: number) => string }) {
  const month = useMemo(() => buildCallMonth(), []);
  const [selected, setSelected] = useState<CallDayInterest | null>(null);
  const earned = month.days.filter((d) => !d.future);
  const best = earned.reduce((a, b) => (b.interest > a.interest ? b : a), earned[0]!);
  const todayDay = earned[earned.length - 1]?.day ?? 0;

  return (
    <section className="mt-4 card-surface p-4 md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Interest calendar
          </p>
          <h2 className="mt-1 font-display text-base font-extrabold">{month.monthLabel}</h2>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Month to date
          </p>
          <p className="mt-0.5 text-[15px] font-extrabold text-num">{mask(month.total)}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <span
            key={`${d}-${i}`}
            className="pb-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground"
          >
            {d}
          </span>
        ))}
        {Array.from({ length: month.firstWeekday }).map((_, i) => (
          <span key={`pad-${i}`} />
        ))}
        {month.days.map((d) => {
          const isToday = d.day === todayDay;
          const isBest = !d.future && d.day === best.day;
          return (
            <button
              key={d.day}
              type="button"
              disabled={d.future}
              onClick={() => setSelected(d)}
              aria-label={`${d.label} interest`}
              className={`flex aspect-square flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] press transition ${
                d.future
                  ? "text-muted-foreground/40"
                  : isToday
                    ? "bg-brand text-primary-foreground shadow-sm"
                    : isBest
                      ? "bg-gold/20 text-foreground"
                      : "bg-muted/60 text-foreground hover:bg-muted"
              }`}
            >
              <span
                className={`text-[11px] font-bold ${isToday ? "text-primary-foreground/75" : ""}`}
              >
                {d.day}
              </span>
              {!d.future && (
                <span
                  className={`text-[9px] font-extrabold text-num ${isToday ? "text-gold" : "text-muted-foreground"}`}
                >
                  {mask(d.interest)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-[11px] text-muted-foreground">
        Tap any day to see the interest earned and balance for that date.
      </p>

      <Dialog open={selected !== null} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-[320px] rounded-3xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-base font-extrabold">
                  {selected.label}
                </DialogTitle>
                <DialogDescription className="text-[12px]">
                  Daily interest on your Call Account balance.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-1 rounded-2xl bg-muted/60 p-4 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Interest earned
                </p>
                <p className="mt-1 font-display text-[30px] font-extrabold leading-none text-num">
                  {mask(selected.interest)}
                </p>
              </div>
              <dl className="mt-1 space-y-2 text-[12.5px]">
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Closing balance</dt>
                  <dd className="font-extrabold text-num">{mask(selected.balance)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Rate applied</dt>
                  <dd className="font-extrabold">{selected.rate}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd className="font-extrabold text-brand">Accrued</dd>
                </div>
              </dl>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                Interest accrues daily and is credited to your Call Account on the 1st of each
                month.
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
