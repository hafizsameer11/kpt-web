import { KycGuard } from "@/components/kipit/KycGate";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Info, ShieldCheck, Wallet } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { AppShell } from "@/components/kipit/AppShell";
import { useCountUp } from "@/components/kipit/motion";
import { naira, WALLET } from "@/lib/home-data";
import { TENOR_BANDS } from "@/lib/invest-data";

export const Route = createFileRoute("/fixed-plans_/create/")({
  validateSearch: z.object({ plan: z.string().optional().catch(undefined) }),
  head: () => ({
    meta: [
      { title: "Create a Fixed Plan | Kipit" },
      {
        name: "description",
        content:
          "Choose how much to lock into a Kipit fixed plan and earn up to 21.5% p.a. — minimum ₦10,000.",
      },
      { property: "og:title", content: "Create a Fixed Plan | Kipit" },
      {
        property: "og:description",
        content:
          "Start a Kipit fixed plan from your wallet — pick an amount, choose a tenor, and lock in a higher rate.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <KycGuard required={1}>
      <CreatePlanAmountScreen />
    </KycGuard>
  ),
});

/** Suggestions always start at (or above) the selected plan's minimum. */
const quickAmounts = (minimum: number) => {
  const base = [minimum, minimum * 2, minimum * 5];
  return Array.from(new Set(base.filter((v) => v <= WALLET))).slice(0, 3);
};
const LOWEST_MIN = Math.min(...TENOR_BANDS.map((b) => b.minimum));
const TOP_RATE = Math.max(
  ...TENOR_BANDS.map((b) => Number(b.rate.replace("%", ""))),
);

function CreatePlanAmountScreen() {
  const { plan } = Route.useSearch();
  const band = TENOR_BANDS.find((b) => b.days === plan);
  const MINIMUM = band?.minimum ?? LOWEST_MIN;
  const BEST_RATE = band ? Number(band.rate.replace("%", "")) : TOP_RATE;

  const [raw, setRaw] = useState("");
  const amount = Number(raw.replace(/[^0-9]/g, "")) || 0;
  const belowMin = amount > 0 && amount < MINIMUM;
  const overWallet = amount > WALLET;
  const valid = amount > 0 && !belowMin && !overWallet;
  const shortfall = overWallet ? amount - WALLET : 0;

  const bestYearly = useCountUp(Math.round(amount * (BEST_RATE / 100)), 500);

  return (
    <AppShell title="Create Plan" navVariant="elevated">
      <div className="pb-2">
        {/* ── Hero: amount entry (MOB-066) ───────────────────── */}
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
                to="/fixed-plans"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold text-primary-foreground press"
              >
                <ArrowLeft className="size-3.5" /> Fixed plans
              </Link>
              <span className="shrink-0 rounded-full bg-gold/15 px-2.5 py-1 text-[11px] font-extrabold text-gold">
                {band ? `${band.rate} p.a.` : `Up to ${BEST_RATE}% p.a.`}
              </span>
            </div>

            {band && (
              <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold text-primary-foreground">
                {band.name} &middot; {band.days}
              </p>
            )}

            <p className="mt-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary-foreground/60">
              How much do you want to lock in?
            </p>

            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="font-display text-[40px] font-extrabold leading-none text-primary-foreground/60 md:text-[48px]">
                ₦
              </span>
              <input
                inputMode="numeric"
                autoComplete="off"
                aria-label="Amount to invest"
                placeholder="0"
                value={amount ? amount.toLocaleString("en-NG") : ""}
                onChange={(e) => setRaw(e.target.value)}
                className="w-full bg-transparent font-display text-[40px] font-extrabold leading-none tracking-[-0.035em] text-num text-primary-foreground outline-none placeholder:text-primary-foreground/25 md:text-[48px]"
              />
            </div>

            <p className="mt-3 flex items-center gap-1.5 text-[12px] font-medium text-primary-foreground/60">
              <ShieldCheck className="size-3.5 text-primary-foreground/70" />
              Minimum {naira(MINIMUM)} &middot; funded from your wallet
            </p>

            {/* Quick amounts */}
            <div className="mt-5 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {quickAmounts(MINIMUM).map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setRaw(String(q))}
                  className={`shrink-0 flex-1 rounded-full border py-2 text-[12px] font-bold transition-transform duration-150 press ${
                    amount === q
                      ? "border-gold bg-gold text-gold-foreground"
                      : "border-white/15 bg-white/10 text-primary-foreground/90"
                  }`}
                >
                  {naira(q)}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setRaw(String(WALLET))}
                className="shrink-0 flex-1 rounded-full border border-white/15 bg-white/10 py-2 text-[12px] font-bold text-primary-foreground/90 press"
              >
                Max
              </button>
            </div>
          </div>
        </section>

        {/* ── Sheet ──────────────────────────────────────────── */}
        <div className="relative -mx-4 -mt-8 rounded-t-[2rem] bg-background px-4 pt-5 md:mx-0 md:mt-6 md:rounded-none md:bg-transparent md:px-0 md:pt-0">
          <span
            aria-hidden
            className="mx-auto mb-4 block h-1 w-10 rounded-full bg-border md:hidden"
          />

          <div className="space-y-4 md:grid md:grid-cols-2 md:items-start md:gap-4 md:space-y-0">
            {/* Funding source / insufficient funds (MOB-066) */}
            <section className="card-surface p-4 md:p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Funding source
              </p>
              <div className="mt-3 flex items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold">
                  <Wallet className="size-5" strokeWidth={2.2} />
                </span>
                <div className="min-w-0">
                  <p className="text-[13.5px] font-bold text-foreground">Kipit Wallet</p>
                  <p className="text-[12px] text-muted-foreground">
                    Available {naira(WALLET)}
                  </p>
                </div>
              </div>

              {overWallet ? (
                <div className="k-shake mt-3 rounded-xl bg-destructive/10 p-3">
                  <p className="text-[12px] font-semibold text-destructive">
                    Insufficient funds — you need {naira(amount)} but have{" "}
                    {naira(WALLET)}. Shortfall {naira(shortfall)}.
                  </p>
                  <div className="mt-2.5 flex gap-2">
                    <Link
                      to="/wallet/add-money"
                      className="flex-1 rounded-full bg-brand-gradient py-2 text-center text-[12px] font-extrabold text-primary-foreground press"
                    >
                      Add money
                    </Link>
                    <button
                      type="button"
                      onClick={() => setRaw(String(WALLET))}
                      className="flex-1 rounded-full border border-border bg-card py-2 text-[12px] font-bold text-foreground press"
                    >
                      Adjust amount
                    </button>
                  </div>
                </div>
              ) : (
                belowMin && (
                  <p className="k-shake mt-3 rounded-xl bg-destructive/10 px-3 py-2.5 text-[12px] font-semibold text-destructive">
                    Minimum for a fixed plan is {naira(MINIMUM)}.
                  </p>
                )
              )}
            </section>

            {/* Earning potential */}
            <section className="card-surface p-4 md:p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Earning potential
              </p>
              <p className="mt-3 font-display text-[26px] font-extrabold leading-none tracking-[-0.02em] text-num text-foreground">
                {naira(bestYearly)}
              </p>
              <p className="mt-1 text-[12px] text-muted-foreground">
                {band
                  ? `per year on ${band.name} at ${BEST_RATE}% p.a.`
                  : `per year at our best rate of ${BEST_RATE}% p.a.`}
              </p>
              <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Info className="size-3.5 shrink-0" />
                {band
                  ? `${band.name} is fixed for ${band.days} — confirm it on the next screen.`
                  : "Your exact rate depends on the tenor you choose next."}
              </p>
            </section>
          </div>

          {/* CTA */}
          <div className="mt-5">
            <Link
              to="/fixed-plans/create/tenor"
              search={{ amount, plan }}
              aria-disabled={!valid}
              className={`inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press md:w-auto md:px-10 ${
                valid ? "" : "pointer-events-none opacity-40 shadow-none"
              }`}
            >
              Continue <ArrowRight className="size-4" strokeWidth={2.6} />
            </Link>
            <p className="mt-2.5 text-center text-[11.5px] text-muted-foreground md:text-left">
              Next: pick a tenor and see your exact rate and payout.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
