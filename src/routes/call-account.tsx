import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  Eye,
  EyeOff,
  Info,
  Plus,
  ShieldCheck,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/kipit/AppShell";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useBalanceVisibility } from "@/hooks/useBalanceVisibility";
import { AmountCounter } from "@/components/kipit/motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { naira, WALLET } from "@/lib/home-data";
import {
  CALL_ACCOUNT,
  CALL_ACCRUAL_TREND,
  CALL_ACCOUNT_FACTS,
  CALL_ACTIVITY,
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


function dayLabel(i: number, total: number) {
  if (i === total - 1) return "Today";
  if (i === 0) return "14d ago";
  return `-${total - 1 - i}d`;
}

function fullDate(i: number, total: number) {
  const d = new Date();
  d.setDate(d.getDate() - (total - 1 - i));
  return d.toLocaleDateString("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: d.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
}

function DayDetail({ day, onClose }: { day: number; onClose: () => void }) {
  const { mask } = useBalanceVisibility();
  const isMobile = useIsMobile();
  const value = CALL_ACCRUAL_TREND[day]!;
  const prev = day > 0 ? CALL_ACCRUAL_TREND[day - 1] ?? null : null;
  const change = prev !== null ? value - prev : 0;
  const cumulative = CALL_ACCRUAL_TREND.slice(0, day + 1).reduce((a, b) => a + b, 0);
  const isToday = day === CALL_ACCRUAL_TREND.length - 1;

  const body = (
    <div className="text-center">
      <div className="relative bg-brand-gradient px-6 pb-7 pt-8 text-primary-foreground">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 grid size-8 place-items-center rounded-full bg-white/10 press"
          aria-label="Close"
        >
          <X className="size-4" />
        </button>
        <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary-foreground/60">
          {isToday ? "Today" : fullDate(day, CALL_ACCRUAL_TREND.length)}
        </p>
        <p className="mt-3 font-display text-[40px] font-extrabold leading-none tracking-[-0.03em] text-gold text-num">
          {mask(value)}
        </p>
        <p className="mt-2 text-[12px] font-medium text-primary-foreground/70">
          Interest earned
        </p>
      </div>

      <div className="grid grid-cols-2 gap-px bg-border">
        <div className="bg-card p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            vs previous day
          </p>
          <p className={`mt-1 text-[15px] font-extrabold text-num ${change >= 0 ? "text-brand" : "text-destructive"}`}>
            {change >= 0 ? "+" : ""}
            {mask(change)}
          </p>
        </div>
        <div className="bg-card p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Running total
          </p>
          <p className="mt-1 text-[15px] font-extrabold text-num">
            {mask(cumulative)}
          </p>
        </div>
      </div>

      <div className="px-5 pb-6 pt-4">
        <p className="text-[12px] leading-relaxed text-muted-foreground">
          {isToday
            ? "Today's interest is based on your current Call Account balance. It will be credited with your monthly payout on the 1st."
            : `Interest for ${fullDate(day, CALL_ACCRUAL_TREND.length)} has already been credited to your running balance.`}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-xl bg-brand py-3 text-[12px] font-extrabold text-brand-foreground press"
        >
          Done
        </button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className="overflow-hidden rounded-t-[2rem] border-0 bg-card p-0 pb-6">
          <DrawerTitle className="sr-only">Interest details</DrawerTitle>
          <DrawerDescription className="sr-only">
            Detailed interest information for {fullDate(day, CALL_ACCRUAL_TREND.length)}
          </DrawerDescription>
          {body}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm overflow-hidden rounded-xl border-0 bg-card p-0 shadow-2xl">
        <DialogTitle className="sr-only">Interest details</DialogTitle>
        <DialogDescription className="sr-only">
          Detailed interest information for {fullDate(day, CALL_ACCRUAL_TREND.length)}
        </DialogDescription>
        {body}
      </DialogContent>
    </Dialog>
  );
}

function CallAccountScreen() {
  const { mask, hidden, toggle } = useBalanceVisibility();
  const pts = trendPoints(CALL_ACCRUAL_TREND, 300, 88);
  const line = smoothPath(pts);
  const last = pts[pts.length - 1] ?? { x: 300, y: 44 };
  const streakRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLButtonElement>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useEffect(() => {
    if (streakRef.current && todayRef.current) {
      const container = streakRef.current;
      const today = todayRef.current;
      const scrollLeft = today.offsetLeft - container.clientWidth / 2 + today.clientWidth / 2;
      container.scrollTo({ left: Math.max(0, scrollLeft), behavior: "instant" });
    }
  }, []);


  return (
    <AppShell title="Call Account" navVariant="elevated">
      <div className="pb-2">
        {/* ── Hero ───────────────────────────────────────────────── */}
        <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-14 pt-6 text-primary-foreground md:mx-0 md:rounded-xl md:px-8 md:pb-14 md:pt-8 md:shadow-float">
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
                <AmountCounter value={CALL_ACCOUNT.balance} hidden={hidden} mask={mask} />
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
                  <AmountCounter value={CALL_ACCOUNT.accruedToday} hidden={hidden} mask={mask} />
                </p>
              </div>
              <div className="w-px bg-white/15" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary-foreground/50">
                  This month
                </p>
                <p className="mt-0.5 text-lg font-extrabold text-num">
                  <AmountCounter value={CALL_ACCOUNT.accruedThisMonth} hidden={hidden} mask={mask} />
                </p>
              </div>
            </div>

            {/* Actions (MOB-061) — minimal text row */}
            <div className="mt-5 flex items-center gap-1">
              <Link
                to="/call-account/add-money"
                className="inline-flex items-center gap-1.5 rounded-full bg-gold px-4 py-2.5 text-[12px] font-extrabold text-gold-foreground press"
              >
                Add money <ArrowUpRight className="size-3.5" strokeWidth={2.6} />
              </Link>
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

            {/* 14-day streak */}
            <div className="relative mt-5">
              <div
                ref={streakRef}
                className="flex items-end justify-between gap-2 overflow-x-auto pb-3 pt-1 scrollbar-hide"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {CALL_ACCRUAL_TREND.map((v, i) => {
                  const isToday = i === CALL_ACCRUAL_TREND.length - 1;
                  const label = dayLabel(i, CALL_ACCRUAL_TREND.length);
                  return (
                    <button
                      key={i}
                      type="button"
                      ref={isToday ? todayRef : undefined}
                      onClick={() => setSelectedDay(i)}
                      style={{ ["--d" as string]: `${i * 35}ms`, minWidth: isToday ? 76 : 52 }}
                      className={`k-rise flex shrink-0 flex-col items-center gap-2 rounded-xl px-2.5 py-3 text-left transition-transform duration-150 active:scale-95 ${
                        isToday
                          ? "bg-brand text-primary-foreground shadow-sm"
                          : "bg-muted/60 text-foreground hover:bg-muted"
                      }`}

                    >
                      <span className={`text-[10px] font-semibold ${isToday ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {label}
                      </span>
                      <span className={`text-[12px] font-extrabold text-num ${isToday ? "text-gold" : ""}`}>
                        {mask(v)}
                      </span>
                      <span
                        className={`h-1 w-full rounded-full ${isToday ? "bg-gold" : "bg-border"}`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Day detail popup */}
            {selectedDay !== null && (
              <DayDetail day={selectedDay} onClose={() => setSelectedDay(null)} />
            )}

            <div className="mt-1 flex items-center justify-between border-t border-border/70 pt-3">
              <p className="text-[11px] font-semibold text-muted-foreground">Last 14 days</p>
              <p className="text-[12.5px] font-extrabold text-num">
                {mask(CALL_ACCRUAL_TREND.reduce((a, b) => a + b, 0))}
              </p>
            </div>
          </section>



          {/* Product explanation */}
          <section className="group relative mt-4 overflow-hidden rounded-xl border border-gold/20 bg-brand p-5 shadow-float md:p-6">
            {/* Outer glow */}
            <span
              aria-hidden
              className="pointer-events-none absolute -inset-1 rounded-xl bg-gradient-to-r from-gold/20 to-gold-foreground/20 opacity-50 blur-xl transition duration-1000 group-hover:opacity-75"
            />
            {/* Background accents */}
            <span
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 size-32 rounded-full bg-gold/10 blur-3xl"
            />
            <span
              aria-hidden
              className="pointer-events-none -bottom-12 -left-12 size-24 rounded-full bg-gold/10 blur-2xl"
            />
            {/* Shine sweep */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-20 transition-transform duration-1000 group-hover:translate-x-full"
            />

            <div className="relative">
              {/* Header */}
              <div className="flex items-center gap-3.5">
                <div className="grid size-12 place-items-center rounded-xl bg-gold-gradient shadow-[0_4px_14px_rgba(212,175,55,0.28)]">
                  <Info className="size-6 text-brand" strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="font-display text-lg font-extrabold text-primary-foreground">
                    How it works
                  </h2>
                  <span className="mt-1 block h-0.5 w-8 rounded-full bg-gold" />
                </div>
              </div>

              {/* Intro */}
              <p className="mt-5 text-[12.5px] leading-relaxed text-primary-foreground/75">
                Daily interest on idle cash, credited monthly.{" "}
                <span className="font-semibold text-gold">No lock-in.</span>
              </p>

              {/* Facts */}
              <ul className="mt-6 space-y-4">
                {CALL_ACCOUNT_FACTS.map((fact, i) => (
                  <li
                    key={fact}
                    className={`flex gap-3.5 text-[12.5px] leading-relaxed ${
                      i === CALL_ACCOUNT_FACTS.length - 1
                        ? "border-t border-gold/10 pt-4 text-primary-foreground/55"
                        : "text-primary-foreground/85"
                    }`}
                  >
                    {i === CALL_ACCOUNT_FACTS.length - 1 ? (
                      <ShieldCheck className="mt-0.5 size-4 shrink-0 text-gold/70" />
                    ) : (
                      <span
                        aria-hidden
                        className="mt-[7px] size-1.5 shrink-0 rounded-full bg-gold ring-4 ring-gold/10"
                      />
                    )}
                    {fact}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Wallet + projected earnings — unified card */}
          <section className="mt-4 overflow-hidden rounded-xl border border-border bg-card">
            {/* Top: wallet available */}
            <div className="p-4 md:p-5">
              <div className="flex items-start gap-3">
                <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-gold/15 text-brand">
                  <Wallet className="size-5" strokeWidth={2.2} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                      Wallet available
                    </p>
                    <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10.5px] font-extrabold text-brand">
                      {CALL_ACCOUNT.rate}
                    </span>
                  </div>
                  <p className="mt-1 font-display text-xl font-extrabold leading-none">
                    <AmountCounter value={WALLET} hidden={hidden} mask={mask} />
                  </p>
                  <p className="mt-1.5 text-[11.5px] leading-snug text-muted-foreground">
                    Idle cash — move it here to start earning daily.
                  </p>
                </div>
              </div>
              <Link
                to="/call-account/add-money"
                className="press mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-brand px-4 py-3 text-[12.5px] font-extrabold text-brand-foreground"
              >
                <Plus className="size-4" strokeWidth={2.6} /> Add money
              </Link>
            </div>

            {/* Divider */}
            <div className="h-px bg-border" />

            {/* Bottom: projected earnings */}
            <div className="bg-muted/20 p-4 md:p-5">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="font-display text-[15px] font-extrabold">Projected earnings</h2>
                <span className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  At {CALL_ACCOUNT.rate}
                </span>
              </div>
              <p className="mt-1 text-[11.5px] leading-snug text-muted-foreground">
                If your balance stays invested. Rates may change.
              </p>
              <div className="mt-4 flex gap-4 border-t border-border/60 pt-4">
                {[
                  { label: "Next 30 days", value: (CALL_ACCOUNT.balance * 0.145) / 12 },
                  { label: "Next 12 months", value: CALL_ACCOUNT.balance * 0.145 },
                ].map((p, i, arr) => (
                  <div
                    key={p.label}
                    className={`flex-1 ${i < arr.length - 1 ? "border-r border-border/60 pr-4" : ""}`}
                  >
                    <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      {p.label}
                    </p>
                    <p className="mt-1 font-display text-[22px] font-extrabold leading-none text-brand text-num">
                      <AmountCounter value={Math.round(p.value)} hidden={hidden} mask={mask} />
                    </p>
                  </div>
                ))}
              </div>
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
            <ul className="overflow-hidden rounded-xl border border-border/60 bg-card">
              {CALL_ACTIVITY.map((item, i) => {
                const credit = item.kind !== "withdrawal";
                const failed = item.status === "failed";
                const Icon =
                  item.kind === "interest"
                    ? TrendingUp
                    : item.kind === "deposit"
                      ? ArrowUpRight
                      : ArrowDownLeft;
                const statusStyle: Record<string, string> = {
                  successful: "bg-accent/15 text-brand",
                  processing: "bg-gold/20 text-brand",
                  pending: "bg-muted text-muted-foreground",
                  failed: "bg-destructive/10 text-destructive",
                };
                return (
                  <li
                    key={item.id}
                    style={{ ["--d" as string]: `${i * 70}ms` }}
                    className={`k-rise flex items-center gap-3.5 px-4 py-3.5 ${
                      i > 0 ? "border-t border-border/50" : ""
                    }`}
                  >
                    <span
                      className={`grid size-10 shrink-0 place-items-center rounded-xl ${
                        failed
                          ? "bg-destructive/10 text-destructive"
                          : credit
                            ? "bg-accent/15 text-brand"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="size-[17px]" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-bold">{item.label}</span>
                      <span className="mt-0.5 flex items-center gap-1.5">
                        <span className="text-[11px] text-muted-foreground">{item.date}</span>
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[9.5px] font-extrabold uppercase tracking-[0.08em] ${statusStyle[item.status]}`}
                        >
                          {item.status}
                        </span>
                      </span>
                    </span>
                    <span
                      className={`shrink-0 text-[13px] font-extrabold text-num ${
                        failed
                          ? "text-muted-foreground line-through"
                          : credit
                            ? "text-brand"
                            : "text-foreground"
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


        </div>
      </div>
    </AppShell>
  );
}
