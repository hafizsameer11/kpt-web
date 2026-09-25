import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarClock, LineChart, TrendingUp, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/kipit/AppShell";
import { Rise } from "@/components/kipit/motion";
import { naira } from "@/lib/home-data";
import { CALL_ACCOUNT, useTenorBands } from "@/lib/invest-data";

export const Route = createFileRoute("/calculator")({
  head: () => ({
    meta: [
      { title: "Investment Calculator | Kipit" },
      {
        name: "description",
        content:
          "Estimate what your money earns on Kipit. Set an amount and tenor to see interest, payout and effective rate before you invest.",
      },
      { property: "og:title", content: "Investment Calculator | Kipit" },
      {
        property: "og:description",
        content:
          "Model your returns across Kipit's Call Account and fixed plans with an indicative interest and payout estimate.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CalculatorScreen,
});

const DAY_MS = 86_400_000;
const QUICK_AMOUNTS = [100_000, 500_000, 1_000_000, 5_000_000];

type Option = {
  id: string;
  name: string;
  days: number;
  rate: number;
  minimum: number;
  liquidity: string;
};

function maturityLabel(days: number) {
  return new Date(Date.now() + days * DAY_MS).toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function useCalcOptions(): Option[] {
  const { bands } = useTenorBands();
  return useMemo(
    () => [
      {
        id: "call",
        name: CALL_ACCOUNT.name,
        days: 365,
        rate: parseFloat(CALL_ACCOUNT.rate) || 0,
        minimum: CALL_ACCOUNT.minimum,
        liquidity: "Withdraw anytime",
      },
      ...bands.map((b) => ({
        id: b.days,
        name: b.name,
        days: Number(b.days.replace(/\D/g, "")),
        rate: Number(b.rate.replace(/[^0-9.]/g, "")),
        minimum: b.minimum,
        liquidity: `Locked for ${b.days}`,
      })),
    ],
    [bands],
  );
}

function CalculatorScreen() {
  const OPTIONS = useCalcOptions();
  const [input, setInput] = useState("");
  const [optionId, setOptionId] = useState<string>("call");

  const amount = Number(input.replace(/[^0-9]/g, "")) || 0;
  const option = OPTIONS.find((o) => o.id === optionId) ?? OPTIONS[0];
  if (!option) {
    return (
      <AppShell title="Calculator" navVariant="elevated">
        <p className="px-5 py-8 text-sm text-muted-foreground">Loading rates…</p>
      </AppShell>
    );
  }

  const { interest, payout, perDay } = useMemo(() => {
    const gross = Math.round(amount * (option.rate / 100) * (option.days / 365));
    return {
      interest: gross,
      payout: amount + gross,
      perDay: Math.round((amount * (option.rate / 100)) / 365),
    };
  }, [amount, option]);

  const belowMin = amount > 0 && amount < option.minimum;
  const isCall = option.id === "call";

  const handleAmount = (value: string) => {
    const digits = value.replace(/[^0-9]/g, "");
    setInput(digits ? Number(digits).toLocaleString("en-NG") : "");
  };

  return (
    <AppShell title="Calculator" navVariant="elevated">
      <div className="pb-2 md:mx-auto md:w-full md:max-w-6xl md:pb-10">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-16 pt-6 text-primary-foreground md:mx-0 md:rounded-2xl md:px-9 md:pb-9 md:pt-9 md:shadow-float">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-32 size-72 rounded-full bg-gold/15 blur-[64px]"
          />
          <div className="relative md:max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold">
              <LineChart className="size-3.5" /> Investment calculator
            </span>
            <h1 className="mt-5 font-display text-[26px] font-extrabold leading-tight tracking-[-0.02em] md:text-[32px]">
              See what your money earns
            </h1>
            <p className="mt-2 max-w-md text-[12.5px] font-medium text-primary-foreground/65">
              Indicative only — actual returns depend on the rate at the time you invest.
            </p>
          </div>
        </section>

        {/* ── Sheet ────────────────────────────────────────────── */}
        {/* ── Desktop workspace ──────────────────────────────── */}
        <div className="mt-6 hidden md:grid md:grid-cols-[minmax(0,1fr)_400px] md:items-start md:gap-6">
          <div className="space-y-5">
            <section className="card-surface p-6">
              <label
                htmlFor="calc-amount-d"
                className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
              >
                Amount to invest
              </label>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-display text-[30px] font-extrabold text-muted-foreground">
                  ₦
                </span>
                <input
                  id="calc-amount-d"
                  type="text"
                  inputMode="numeric"
                  value={input}
                  onChange={(e) => handleAmount(e.target.value)}
                  placeholder="0"
                  className="w-full min-w-0 bg-transparent font-display text-[40px] font-extrabold leading-none tracking-[-0.03em] text-num outline-none placeholder:text-muted-foreground/40"
                />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {QUICK_AMOUNTS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setInput(q.toLocaleString("en-NG"))}
                    className={`rounded-full border px-3.5 py-1.5 text-[12px] font-bold transition-colors ${
                      amount === q
                        ? "border-transparent bg-primary text-gold"
                        : "border-border bg-card text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {naira(q)}
                  </button>
                ))}
              </div>
              {belowMin && (
                <p className="mt-4 rounded-xl bg-destructive/10 px-3 py-2.5 text-[12px] font-semibold text-destructive">
                  Minimum for {option.name} is {naira(option.minimum)}.
                </p>
              )}
            </section>

            <section>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Where to put it
              </p>
              <div className="grid grid-cols-2 gap-3">
                {OPTIONS.map((o) => {
                  const active = o.id === option.id;
                  const gross = Math.round(amount * (o.rate / 100) * (o.days / 365));
                  return (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => setOptionId(o.id)}
                      aria-pressed={active}
                      className={`rounded-2xl border p-4 text-left transition-all ${
                        active
                          ? "border-gold bg-primary/[0.05] shadow-card"
                          : "border-border bg-card hover:border-primary/30 hover:shadow-card"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`grid size-9 shrink-0 place-items-center rounded-xl ${
                            active ? "bg-gold text-gold-foreground" : "bg-secondary text-foreground"
                          }`}
                        >
                          {o.id === "call" ? (
                            <Wallet className="size-4" />
                          ) : (
                            <CalendarClock className="size-4" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-display text-[14.5px] font-extrabold tracking-[-0.01em]">
                            {o.name}
                          </span>
                          <span className="mt-0.5 block truncate text-[11.5px] text-muted-foreground">
                            min {naira(o.minimum)}
                          </span>
                        </span>
                        <span className="shrink-0 rounded-full bg-gold/15 px-2.5 py-1 text-[12.5px] font-extrabold text-gold text-num">
                          {o.rate}%
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
                        <span className="text-[11.5px] text-muted-foreground">{o.liquidity}</span>
                        <span className="text-[13px] font-extrabold text-num">+{naira(gross)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          <aside className="space-y-4 md:sticky md:top-6">
            <section className="relative overflow-hidden rounded-2xl bg-primary p-6 text-primary-foreground shadow-float">
              <span
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-20 size-52 rounded-full bg-gold/20 blur-[52px]"
              />
              <div className="relative">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary-foreground/60">
                  Estimated payout{" "}
                  {isCall ? "after 12 months" : `on ${maturityLabel(option.days)}`}
                </p>
                <p className="mt-2 font-display text-[36px] font-extrabold leading-none tracking-[-0.03em] text-num">
                  {naira(payout)}
                </p>
                <dl className="mt-5 space-y-3 border-t border-white/10 pt-4 text-[12.5px]">
                  <div className="flex items-center justify-between">
                    <dt className="text-primary-foreground/60">Interest earned</dt>
                    <dd className="font-extrabold text-gold text-num">{naira(interest)}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-primary-foreground/60">Per day</dt>
                    <dd className="font-extrabold text-num">{naira(perDay)}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-primary-foreground/60">Rate</dt>
                    <dd className="font-extrabold text-num">{option.rate}% p.a.</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-primary-foreground/60">Tenor</dt>
                    <dd className="font-extrabold text-num">{option.days} days</dd>
                  </div>
                </dl>
              </div>
            </section>

            <Link
              to="/fixed-plans/create"
              search={{ plan: isCall ? undefined : String(option.id) }}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[14px] font-extrabold text-gold transition hover:opacity-95"
            >
              <TrendingUp className="size-4" />
              Invest {naira(amount)}
            </Link>
            <Link
              to="/invest"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-border bg-card text-[14px] font-bold transition hover:bg-muted/50"
            >
              See all plans <ArrowRight className="size-4" />
            </Link>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Estimates use simple interest and current indicative rates. Returns are not
              guaranteed. Kipit works with SEC-licensed partners.
            </p>
          </aside>
        </div>

        {/* ── Mobile sheet ───────────────────────────────────── */}
        <div className="relative -mx-4 -mt-10 rounded-t-[2rem] bg-background px-4 pt-5 md:hidden">
          <span
            aria-hidden
            className="mx-auto mb-4 block h-1 w-10 rounded-full bg-border md:hidden"
          />

          {/* Amount */}
          <Rise>
            <section className="card-surface p-4 md:p-5">
              <label
                htmlFor="calc-amount"
                className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
              >
                Amount to invest
              </label>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="font-display text-[26px] font-extrabold text-muted-foreground">₦</span>
                <input
                  id="calc-amount"
                  type="text"
                  inputMode="numeric"
                  value={input}
                  onChange={(e) => handleAmount(e.target.value)}
                  placeholder="0"
                  className="w-full min-w-0 bg-transparent font-display text-[32px] font-extrabold leading-none tracking-[-0.02em] text-num outline-none placeholder:text-muted-foreground/40"
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {QUICK_AMOUNTS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setInput(q.toLocaleString("en-NG"))}
                    className={`rounded-full border px-3 py-1.5 text-[11.5px] font-bold press ${
                      amount === q
                        ? "border-transparent bg-primary text-gold"
                        : "border-border bg-card text-foreground"
                    }`}
                  >
                    {naira(q)}
                  </button>
                ))}
              </div>
              {belowMin && (
                <p className="mt-3 rounded-xl bg-destructive/10 px-3 py-2.5 text-[11.5px] font-semibold text-destructive">
                  Minimum for {option.name} is {naira(option.minimum)}.
                </p>
              )}
            </section>
          </Rise>

          {/* Option selector */}
          <Rise delay={60}>
            <section className="mt-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Where to put it
              </p>
              <div className="mt-3 overflow-hidden rounded-xl border border-border/60 bg-card shadow-card">
                {OPTIONS.map((o, i) => {
                  const active = o.id === option.id;
                  return (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => setOptionId(o.id)}
                      aria-pressed={active}
                      className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors press ${
                        i > 0 ? "border-t border-border/60" : ""
                      } ${active ? "bg-primary/[0.04]" : "hover:bg-muted/40"}`}
                    >
                      <span
                        className={`grid size-9 shrink-0 place-items-center rounded-xl ${
                          active ? "bg-gold text-gold-foreground" : "bg-secondary text-foreground"
                        }`}
                      >
                        {o.id === "call" ? (
                          <Wallet className="size-4" />
                        ) : (
                          <CalendarClock className="size-4" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-display text-[14.5px] font-extrabold tracking-[-0.01em]">
                          {o.name}
                        </span>
                        <span className="mt-0.5 block text-[11.5px] text-muted-foreground">
                          {o.liquidity} · min {naira(o.minimum)}
                        </span>
                      </span>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[12.5px] font-extrabold text-num ${
                          active ? "bg-primary text-gold" : "bg-gold/15 text-gold"
                        }`}
                      >
                        {o.rate}%
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          </Rise>

          {/* Result */}
          <Rise delay={120}>
            <section className="relative mt-4 overflow-hidden rounded-xl bg-primary p-5 text-primary-foreground shadow-float">
              <span
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-20 size-52 rounded-full bg-gold/20 blur-[52px]"
              />
              <div className="relative">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary-foreground/60">
                  Estimated payout {isCall ? "after 12 months" : `on ${maturityLabel(option.days)}`}
                </p>
                <p className="mt-2 font-display text-[34px] font-extrabold leading-none tracking-[-0.03em] text-num">
                  {naira(payout)}
                </p>
                <div className="mt-4 grid grid-cols-3 gap-3 border-t border-white/10 pt-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-primary-foreground/55">
                      Interest
                    </p>
                    <p className="mt-1 text-[14px] font-extrabold text-gold text-num">
                      {naira(interest)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-primary-foreground/55">
                      Per day
                    </p>
                    <p className="mt-1 text-[14px] font-extrabold text-num">{naira(perDay)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-primary-foreground/55">
                      Rate
                    </p>
                    <p className="mt-1 text-[14px] font-extrabold text-num">{option.rate}% p.a.</p>
                  </div>
                </div>
              </div>
            </section>
          </Rise>

          {/* Compare */}
          <Rise delay={180}>
            <section className="mt-4 card-surface p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Compare tenors on {naira(amount)}
              </p>
              <ul className="mt-3 space-y-2">
                {OPTIONS.filter((o) => o.id !== "call").map((o) => {
                  const gross = Math.round(amount * (o.rate / 100) * (o.days / 365));
                  return (
                    <li
                      key={o.id}
                      className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2.5"
                    >
                      <span className="text-[12.5px] font-semibold">
                        {o.days} days
                        <span className="ml-2 text-[11px] font-bold text-gold">{o.rate}%</span>
                      </span>
                      <span className="text-[13px] font-extrabold text-num">+{naira(gross)}</span>
                    </li>
                  );
                })}
              </ul>
            </section>
          </Rise>

          {/* CTA */}
          <Rise delay={220}>
            <div className="mt-5 space-y-2.5">
              <Link
                to="/fixed-plans/create"
                search={{ plan: isCall ? undefined : String(option.id) }}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[14px] font-extrabold text-gold press"
              >
                <TrendingUp className="size-4" />
                Invest {naira(amount)}
              </Link>
              <Link
                to="/invest"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-border bg-card text-[14px] font-bold press"
              >
                See all plans <ArrowRight className="size-4" />
              </Link>
              <p className="pt-1 text-center text-[11px] leading-relaxed text-muted-foreground">
                Estimates use simple interest and current indicative rates. Returns are not
                guaranteed. Kipit works with SEC-licensed partners.
              </p>
            </div>
          </Rise>
        </div>
      </div>
    </AppShell>
  );
}
