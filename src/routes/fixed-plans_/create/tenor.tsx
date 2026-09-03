import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CalendarClock, Check, ChevronRight, Info, Minus, Plus, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { z } from "zod";
import { AppShell } from "@/components/kipit/AppShell";
import { Rise } from "@/components/kipit/motion";
import { naira } from "@/lib/home-data";
import { TENOR_BANDS } from "@/lib/invest-data";

export const Route = createFileRoute("/fixed-plans_/create/tenor")({
  validateSearch: z.object({ amount: z.number().catch(0) }),
  head: () => ({
    meta: [
      { title: "Choose a Tenor | Kipit" },
      {
        name: "description",
        content:
          "Pick 30, 90, 180 or 365 days — or set a custom tenor — and see your exact rate, interest and payout.",
      },
      { property: "og:title", content: "Choose a Tenor | Kipit" },
      {
        property: "og:description",
        content:
          "Choose how long to lock your Kipit fixed plan and preview the rate, interest and maturity date.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CreatePlanTenorScreen,
});

const DAY_MS = 86_400_000;

/** Short category label shown above each fixed tenor. */
const TERM_LABELS: Record<string, string> = {
  "30 days": "Short Term",
  "90 days": "Popular",
  "180 days": "Mid Term",
  "365 days": "Long Term",
};

/** Rate for any tenor length, from the configured bands (MOB-068). */
function rateForDays(days: number): number {
  if (days >= 365) return 21.5;
  if (days >= 180) return 16.0;
  if (days >= 90) return 19.2;
  return 12.8;
}

function maturityLabel(days: number) {
  return new Date(Date.now() + days * DAY_MS).toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function CreatePlanTenorScreen() {
  const { amount } = Route.useSearch();
  const [selected, setSelected] = useState<string | null>(null);
  const [customDays, setCustomDays] = useState("");

  const days = useMemo(() => {
    if (selected === "custom") {
      const d = Number(customDays.replace(/[^0-9]/g, "")) || 0;
      return d >= 30 ? d : 0;
    }
    const band = TENOR_BANDS.find((b) => b.days === selected);
    return band ? Number(band.days.replace(/\D/g, "")) : 0;
  }, [selected, customDays]);

  const rate = days ? rateForDays(days) : 0;
  const interest = Math.round(amount * (rate / 100) * (days / 365));
  const payout = amount + interest;
  const band = TENOR_BANDS.find((b) => b.days === selected);
  const belowBandMin = band ? amount < band.minimum : false;
  const valid = days > 0 && !belowBandMin;

  return (
    <AppShell title="Choose Tenor" navVariant="elevated">
      <div className="pb-2">
        {/* ── Hero summary ───────────────────────────────────── */}
        <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-14 pt-6 text-primary-foreground md:mx-0 md:rounded-[2rem] md:px-8 md:pb-14 md:pt-8 md:shadow-float">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-32 size-72 rounded-full bg-gold/15 blur-[64px]"
          />
          <div className="relative md:max-w-3xl">
            <Link
              to="/fixed-plans/create"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold text-primary-foreground press"
            >
              <ArrowLeft className="size-3.5" /> Amount
            </Link>
            <p className="mt-6 text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary-foreground/60">
              You're locking in
            </p>
            <p className="mt-1 font-display text-[34px] font-extrabold leading-none tracking-[-0.03em] text-num md:text-[40px]">
              {naira(amount)}
            </p>
            <p className="mt-3 text-[12px] font-medium text-primary-foreground/60">
              Now choose how long — longer tenors earn higher rates.
            </p>
          </div>
        </section>

        {/* ── Sheet ──────────────────────────────────────────── */}
        <div className="relative -mx-4 -mt-8 rounded-t-[2rem] bg-background px-4 pt-5 md:mx-0 md:mt-6 md:rounded-none md:bg-transparent md:px-0 md:pt-0">
          <span
            aria-hidden
            className="mx-auto mb-4 block h-1 w-10 rounded-full bg-border md:hidden"
          />

          {/* Tenor options (MOB-067) — sleek app-style selector list */}
          <div className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-card">
            {TENOR_BANDS.map((b, i) => {
              const active = selected === b.days;
              const unaffordable = amount < b.minimum;
              const label = TERM_LABELS[b.days] ?? "Fixed Term";
              return (
                <Rise key={b.days} delay={i * 60}>
                  <button
                    type="button"
                    onClick={() => setSelected(b.days)}
                    aria-pressed={active}
                    className={`relative flex w-full items-center gap-3.5 px-4 py-4 text-left transition-colors duration-150 press md:px-5 ${
                      i > 0 ? "border-t border-border/60" : ""
                    } ${active ? "bg-primary/[0.04]" : "hover:bg-muted/40"}`}
                  >
                    {/* radio indicator */}
                    <span
                      className={`grid size-5 shrink-0 place-items-center rounded-full border-2 transition-all duration-200 ${
                        active
                          ? "border-gold bg-gold"
                          : "border-muted-foreground/30 bg-transparent"
                      }`}
                    >
                      {active && <Check className="size-3 text-gold-foreground" strokeWidth={4} />}
                    </span>

                    {/* tenor + meta */}
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline gap-2">
                        <span
                          className={`font-display text-[17px] font-extrabold tracking-[-0.01em] ${
                            unaffordable ? "text-muted-foreground/70" : "text-foreground"
                          }`}
                        >
                          {b.days}
                        </span>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {label}
                        </span>
                      </span>
                      <span
                        className={`mt-0.5 block text-[11.5px] ${
                          unaffordable && !active
                            ? "font-semibold text-destructive"
                            : "text-muted-foreground"
                        }`}
                      >
                        {unaffordable && !active
                          ? `Above your amount · min ${naira(b.minimum)}`
                          : `Min ${naira(b.minimum)}`}
                      </span>
                    </span>

                    {/* rate */}
                    <span
                      className={`shrink-0 rounded-full px-3 py-1.5 text-[13px] font-extrabold text-num transition-colors ${
                        active
                          ? "bg-primary text-gold shadow-sm"
                          : unaffordable
                            ? "bg-muted text-muted-foreground"
                            : "bg-gold/15 text-gold"
                      }`}
                    >
                      {b.rate}
                    </span>
                  </button>
                </Rise>
              );
            })}
          </div>

          {/* Custom tenor (MOB-068) */}
          <Rise delay={TENOR_BANDS.length * 60} className="mt-3">
            <section
              aria-label="Custom tenor"
              className={`relative overflow-hidden rounded-3xl border transition-all duration-200 ${
                selected === "custom"
                  ? "border-gold/50 bg-primary text-primary-foreground shadow-float"
                  : "border-border/60 bg-card shadow-card"
              }`}
            >
              {selected === "custom" && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-16 -top-20 size-48 rounded-full bg-gold/20 blur-[48px]"
                />
              )}
              <div className="relative p-4 md:p-5">
                <button
                  type="button"
                  onClick={() => setSelected("custom")}
                  aria-pressed={selected === "custom"}
                  className="flex w-full items-center gap-3.5 text-left press"
                >
                  <span
                    className={`grid size-10 shrink-0 place-items-center rounded-2xl ${
                      selected === "custom"
                        ? "bg-gold text-gold-foreground"
                        : "bg-primary/[0.06] text-foreground"
                    }`}
                  >
                    <SlidersHorizontal className="size-4.5" strokeWidth={2.5} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block font-display text-[16px] font-extrabold tracking-[-0.01em] ${
                        selected === "custom" ? "text-primary-foreground" : "text-foreground"
                      }`}
                    >
                      Custom tenor
                    </span>
                    <span
                      className={`block text-[11.5px] ${
                        selected === "custom"
                          ? "text-primary-foreground/60"
                          : "text-muted-foreground"
                      }`}
                    >
                      Pick your own number of days
                    </span>
                  </span>
                  {selected !== "custom" && (
                    <ChevronRight
                      className="size-4 shrink-0 text-muted-foreground/40"
                      strokeWidth={2.5}
                    />
                  )}
                </button>

                {/* Inline stepper — revealed when custom is selected */}
                {selected === "custom" && (
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      type="button"
                      aria-label="Decrease days"
                      onClick={() =>
                        setCustomDays((v) => String(Math.max(30, (Number(v) || 30) - 10)))
                      }
                      className="grid size-11 shrink-0 place-items-center rounded-full border border-white/20 bg-white/10 text-primary-foreground press"
                    >
                      <Minus className="size-4" strokeWidth={3} />
                    </button>
                    <span className="relative flex min-w-0 flex-1 items-baseline justify-center gap-1.5 rounded-2xl bg-white/10 px-3 py-2.5">
                      <input
                        inputMode="numeric"
                        autoComplete="off"
                        aria-label="Custom tenor in days"
                        placeholder="120"
                        value={customDays}
                        onChange={(e) => setCustomDays(e.target.value.replace(/[^0-9]/g, ""))}
                        className="w-[3ch] min-w-0 bg-transparent text-center font-display text-[24px] font-extrabold leading-none text-num text-primary-foreground outline-none placeholder:text-primary-foreground/30"
                        style={{ width: `${Math.max(2, customDays.length || 3)}ch` }}
                      />
                      <span className="text-[12px] font-bold text-primary-foreground/50">
                        days
                      </span>
                    </span>
                    <button
                      type="button"
                      aria-label="Increase days"
                      onClick={() => setCustomDays((v) => String((Number(v) || 30) + 10))}
                      className="grid size-11 shrink-0 place-items-center rounded-full bg-gold text-gold-foreground shadow-glow press"
                    >
                      <Plus className="size-4" strokeWidth={3} />
                    </button>
                  </div>
                )}
                {selected === "custom" && (
                  <p className="mt-3 text-center text-[11px] text-primary-foreground/50">
                    Minimum 30 days · rate set by the band your days fall into
                  </p>
                )}
              </div>
            </section>
          </Rise>

          {/* Live preview: rate, interest, payout, maturity (MOB-068/069) */}
          {days > 0 && (
            <section className="card-surface mt-4 overflow-hidden p-0">
              <div className="flex items-center justify-between bg-primary px-4 py-3.5 text-primary-foreground md:px-5">
                <span className="flex items-center gap-2 text-[12px] font-bold">
                  <CalendarClock className="size-4 text-gold" />
                  {days} days at {rate}% p.a.
                </span>
                <span className="rounded-full bg-gold/15 px-2.5 py-1 text-[10.5px] font-extrabold text-gold">
                  Matures {maturityLabel(days)}
                </span>
              </div>
              <div className="flex divide-x divide-border px-4 py-4 md:px-5">
                <div className="flex-1 pr-4">
                  <p className="text-[11px] font-semibold text-muted-foreground">
                    Expected interest
                  </p>
                  <p className="mt-0.5 font-display text-[19px] font-extrabold leading-none text-num text-gold">
                    +{naira(interest)}
                  </p>
                </div>
                <div className="flex-1 pl-4">
                  <p className="text-[11px] font-semibold text-muted-foreground">
                    Payout at maturity
                  </p>
                  <p className="mt-0.5 font-display text-[19px] font-extrabold leading-none text-num">
                    {naira(payout)}
                  </p>
                </div>
              </div>
              <p className="flex items-center gap-1.5 border-t border-border px-4 py-3 text-[11px] text-muted-foreground md:px-5">
                <Info className="size-3.5 shrink-0" />
                Principal and interest are paid to your wallet at maturity.
              </p>
            </section>
          )}

          {/* CTA — plan options & review (MOB-070/075) is the next screen */}
          <div className="mt-5">
            <button
              type="button"
              disabled={!valid}
              className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press md:w-auto md:px-10 ${
                valid ? "" : "opacity-40 shadow-none"
              }`}
            >
              Continue
            </button>
            <p className="mt-2.5 text-center text-[11.5px] text-muted-foreground md:text-left">
              Next: plan options and a full review before you confirm.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
