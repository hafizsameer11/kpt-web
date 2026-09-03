import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CalendarClock, Check, ChevronRight, Info, SlidersHorizontal } from "lucide-react";
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

          {/* Tenor options (MOB-067) — premium layered cards */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {TENOR_BANDS.map((b, i) => {
              const active = selected === b.days;
              const unaffordable = amount < b.minimum;
              const label = TERM_LABELS[b.days] ?? "Fixed Term";
              return (
                <Rise key={b.days} delay={i * 60}>
                  <button
                    type="button"
                    onClick={() => setSelected(b.days)}
                    className={`relative w-full rounded-[2rem] border-2 p-5 text-left transition-all duration-200 press ${
                      active
                        ? "border-gold bg-primary text-primary-foreground shadow-float ring-4 ring-gold/10"
                        : unaffordable
                          ? "border-dashed border-border bg-card/60 opacity-70 grayscale"
                          : "border-transparent bg-card shadow-card hover:shadow-float"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`text-[11px] font-semibold uppercase tracking-wider ${
                          active ? "text-gold/70" : "text-muted-foreground"
                        }`}
                      >
                        {label}
                      </p>
                      {active && (
                        <span className="grid size-5 shrink-0 place-items-center rounded-full bg-gold text-gold-foreground">
                          <Check className="size-3" strokeWidth={4} />
                        </span>
                      )}
                    </div>
                    <p
                      className={`mt-1 font-display text-[24px] font-extrabold leading-none tracking-[-0.02em] ${
                        active
                          ? "text-primary-foreground"
                          : unaffordable
                            ? "text-foreground/60"
                            : "text-foreground"
                      }`}
                    >
                      {b.days}
                    </p>
                    <div className="mt-3">
                      <span
                        className={`inline-block rounded-md px-2 py-1 text-[13px] font-bold ${
                          active
                            ? "bg-gold text-gold-foreground"
                            : unaffordable
                              ? "bg-muted text-muted-foreground"
                              : "bg-primary text-gold"
                        }`}
                      >
                        {b.rate} p.a.
                      </span>
                    </div>
                    <div className="mt-3 flex flex-col gap-1">
                      <span
                        className={`text-[10px] font-medium uppercase ${
                          active ? "text-primary-foreground/50" : "text-muted-foreground"
                        }`}
                      >
                        Min {naira(b.minimum)}
                      </span>
                      {unaffordable && !active && (
                        <span className="text-[10px] font-bold uppercase tracking-tight text-destructive">
                          Above your amount
                        </span>
                      )}
                    </div>
                  </button>
                </Rise>
              );
            })}
          </div>

          {/* Custom tenor (MOB-068) */}
          <Rise delay={TENOR_BANDS.length * 60} className="mt-4">
            <button
              type="button"
              onClick={() => setSelected("custom")}
              className={`flex w-full items-center justify-between rounded-[2rem] border p-5 text-left transition-all duration-200 press ${
                selected === "custom"
                  ? "border-gold bg-primary text-primary-foreground shadow-float ring-4 ring-gold/10"
                  : "border-transparent bg-card shadow-card hover:shadow-float"
              }`}
            >
              <span className="flex items-center gap-4">
                <span
                  className={`grid size-12 shrink-0 place-items-center rounded-2xl border ${
                    selected === "custom"
                      ? "border-white/10 bg-white/10 text-gold"
                      : "border-border bg-muted/60 text-foreground"
                  }`}
                >
                  <SlidersHorizontal className="size-5" strokeWidth={2} />
                </span>
                <span>
                  <span
                    className={`block text-[16px] font-bold ${
                      selected === "custom" ? "text-primary-foreground" : "text-foreground"
                    }`}
                  >
                    Custom tenor
                  </span>
                  <span
                    className={`block text-[12px] ${
                      selected === "custom" ? "text-primary-foreground/60" : "text-muted-foreground"
                    }`}
                  >
                    Pick your own number of days
                  </span>
                </span>
              </span>
              <ChevronRight
                className={`size-5 shrink-0 ${
                  selected === "custom" ? "text-gold" : "text-muted-foreground/40"
                }`}
                strokeWidth={2.5}
              />
            </button>
          </Rise>

          {/* Custom days input */}
          {selected === "custom" && (
            <section className="card-surface mt-4 p-4 md:p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Number of days
              </p>
              <input
                inputMode="numeric"
                autoComplete="off"
                aria-label="Custom tenor in days"
                placeholder="e.g. 120"
                value={customDays}
                onChange={(e) => setCustomDays(e.target.value)}
                className="mt-2 w-full bg-transparent font-display text-[28px] font-extrabold leading-none text-num text-foreground outline-none placeholder:text-muted-foreground/40"
              />
              <p className="mt-2 text-[11.5px] text-muted-foreground">
                Minimum 30 days. Your rate is set by the tenor band your days fall into.
              </p>
            </section>
          )}

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
