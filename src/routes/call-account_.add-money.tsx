import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Info, ShieldCheck, Wallet } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/kipit/AppShell";
import { naira, WALLET } from "@/lib/home-data";
import { CALL_ACCOUNT } from "@/lib/invest-data";

export const Route = createFileRoute("/call-account_/add-money")({
  head: () => ({
    meta: [
      { title: "Add Money to Call Account | Kipit" },
      {
        name: "description",
        content:
          "Move idle wallet cash into your Kipit Call Account and start earning 14.5% p.a. daily interest with no lock-in.",
      },
      { property: "og:title", content: "Add Money to Call Account | Kipit" },
      {
        property: "og:description",
        content:
          "Fund your Kipit Call Account from your wallet and earn daily interest — withdraw anytime.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AddMoneyScreen,
});

const QUICK = [100_000, 250_000, 500_000];

const RATE = 0.145;

function AddMoneyScreen() {
  const [raw, setRaw] = useState("");
  const amount = Number(raw.replace(/[^0-9]/g, "")) || 0;
  const belowMin = amount > 0 && amount < CALL_ACCOUNT.minimum;
  const overWallet = amount > WALLET;
  const valid = amount > 0 && !belowMin && !overWallet;

  const dailyInterest = Math.round((amount * RATE) / 365);
  const monthlyInterest = Math.round((amount * RATE) / 12);

  return (
    <AppShell title="Add Money" navVariant="elevated">
      <div className="pb-2">
        {/* ── Hero: amount entry ─────────────────────────────── */}
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
                to="/call-account"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold text-primary-foreground press"
              >
                <ArrowLeft className="size-3.5" /> Call Account
              </Link>
              <span className="shrink-0 rounded-full bg-gold/15 px-2.5 py-1 text-[11px] font-extrabold text-gold">
                {CALL_ACCOUNT.rate}
              </span>
            </div>

            <p className="mt-6 text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary-foreground/60">
              Amount to add
            </p>

            <div className="mt-2 flex items-end gap-1.5">
              <span className="font-display text-[30px] font-extrabold leading-none text-primary-foreground/60">
                ₦
              </span>
              <input
                inputMode="numeric"
                autoComplete="off"
                aria-label="Amount to add"
                placeholder="0"
                value={amount ? amount.toLocaleString("en-NG") : ""}
                onChange={(e) => setRaw(e.target.value)}
                className="w-full bg-transparent font-display text-[40px] font-extrabold leading-none tracking-[-0.035em] text-num text-primary-foreground outline-none placeholder:text-primary-foreground/25 md:text-[48px]"
              />
            </div>

            <p className="mt-3 flex items-center gap-1.5 text-[12px] font-medium text-primary-foreground/60">
              <ShieldCheck className="size-3.5 text-primary-foreground/70" />
              Minimum {naira(CALL_ACCOUNT.minimum)} &middot; {CALL_ACCOUNT.liquidity}
            </p>

            {/* Quick amounts */}
            <div className="mt-5 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {QUICK.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setRaw(String(q))}
                  className={`shrink-0 flex-1 rounded-full border py-2 text-[12px] font-bold press ${
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

        {/* ── Sheet ───────────────────────────────────────────── */}
        <div className="relative -mx-4 -mt-8 rounded-t-[2rem] bg-background px-4 pt-5 md:mx-0 md:mt-6 md:rounded-none md:bg-transparent md:px-0 md:pt-0">
          <span
            aria-hidden
            className="mx-auto mb-4 block h-1 w-10 rounded-full bg-border md:hidden"
          />

          <div className="space-y-4 md:grid md:grid-cols-2 md:items-start md:gap-4 md:space-y-0">
            {/* Funding source */}
            <section className="card-surface p-4 md:p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Funding source
              </p>
              <div className="mt-3 flex items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gold/15 text-gold">
                  <Wallet className="size-5" strokeWidth={2.2} />
                </span>
                <div className="min-w-0">
                  <p className="text-[13.5px] font-bold text-foreground">Kipit Wallet</p>
                  <p className="text-[12px] text-muted-foreground">
                    Available {naira(WALLET)}
                  </p>
                </div>
              </div>

              {(belowMin || overWallet) && (
                <p className="mt-3 rounded-2xl bg-destructive/10 px-3 py-2.5 text-[12px] font-semibold text-destructive">
                  {overWallet
                    ? `Amount exceeds your wallet balance. Shortfall ${naira(amount - WALLET)}.`
                    : `Minimum for the Call Account is ${naira(CALL_ACCOUNT.minimum)}.`}
                </p>
              )}
            </section>

            {/* What you'll earn */}
            <section className="card-surface p-4 md:p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                What this earns
              </p>
              <div className="mt-3 flex divide-x divide-border">
                <div className="flex-1 pr-4">
                  <p className="text-[11px] font-semibold text-muted-foreground">Per day</p>
                  <p className="mt-0.5 font-display text-[20px] font-extrabold leading-none text-num">
                    {naira(dailyInterest)}
                  </p>
                </div>
                <div className="flex-1 pl-4">
                  <p className="text-[11px] font-semibold text-muted-foreground">Per month</p>
                  <p className="mt-0.5 font-display text-[20px] font-extrabold leading-none text-num">
                    {naira(monthlyInterest)}
                  </p>
                </div>
              </div>
              <p className="mt-3 flex items-center gap-1.5 whitespace-nowrap text-[11px] text-muted-foreground">
                <Info className="size-3.5 shrink-0" />
                Indicative at {CALL_ACCOUNT.rate} — accrues daily, credited monthly.
              </p>
            </section>
          </div>

          {/* CTA */}
          <div className="mt-5">
            <button
              type="button"
              disabled={!valid}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none md:w-auto md:px-10"
            >
              Continue <ArrowRight className="size-4" strokeWidth={2.6} />
            </button>
            <p className="mt-2.5 text-center text-[11.5px] text-muted-foreground md:text-left">
              You'll review the amount, rate and funding source before it's confirmed.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
