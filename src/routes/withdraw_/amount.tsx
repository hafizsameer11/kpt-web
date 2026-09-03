import { KycGuard } from "@/components/kipit/KycGate";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Clock, Landmark, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { AppShell } from "@/components/kipit/AppShell";
import { naira, WALLET } from "@/lib/home-data";
import {
  findAccount,
  maskAccount,
  MIN_WITHDRAWAL,
  payoutEta,
  TIER,
  WITHDRAWAL_FEE,
} from "@/lib/withdraw-data";

export const Route = createFileRoute("/withdraw_/amount")({
  validateSearch: z.object({ acct: z.string().catch("pa1") }),
  head: () => ({
    meta: [
      { title: "Enter Withdrawal Amount | Kipit" },
      {
        name: "description",
        content:
          "Enter how much of your Kipit wallet balance you want to send to your bank account.",
      },
      { property: "og:title", content: "Enter Withdrawal Amount | Kipit" },
      {
        property: "og:description",
        content: "Choose your withdrawal amount and review before you confirm.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <KycGuard required={2}>
      <AmountScreen />
    </KycGuard>
  ),
});

const QUICK = [50_000, 100_000, 250_000];

function AmountScreen() {
  const { acct } = Route.useSearch();
  const account = findAccount(acct);
  const navigate = useNavigate();
  const [raw, setRaw] = useState("");
  const amount = Number(raw.replace(/[^0-9]/g, "")) || 0;

  const belowMin = amount > 0 && amount < MIN_WITHDRAWAL;
  const overWallet = amount > WALLET;
  const overLimit = amount > TIER.singleLimit;
  const valid = amount > 0 && !belowMin && !overWallet && !overLimit;

  return (
    <>
      <div className="md:hidden">
        <MobileAmount
          raw={raw}
          setRaw={setRaw}
          amount={amount}
          belowMin={belowMin}
          overWallet={overWallet}
          overLimit={overLimit}
          valid={valid}
          accountId={account.id}
          accountName={account.accountName}
          bank={account.bank}
          accountNumber={account.accountNumber}
        />
      </div>
      <div className="hidden md:block">
        <DesktopAmount
          raw={raw}
          setRaw={setRaw}
          amount={amount}
          belowMin={belowMin}
          overWallet={overWallet}
          overLimit={overLimit}
          valid={valid}
          accountId={account.id}
          accountName={account.accountName}
          bank={account.bank}
          accountNumber={account.accountNumber}
        />
      </div>
    </>
  );
}

interface AmountProps {
  raw: string;
  setRaw: (v: string) => void;
  amount: number;
  belowMin: boolean;
  overWallet: boolean;
  overLimit: boolean;
  valid: boolean;
  accountId: string;
  accountName: string;
  bank: string;
  accountNumber: string;
}

function MobileAmount({
  raw: _raw,
  setRaw,
  amount,
  belowMin,
  overWallet,
  overLimit,
  valid,
  accountId,
  accountName,
  bank,
  accountNumber,
}: AmountProps) {
  void _raw;
  const navigate = useNavigate();

  return (
    <AppShell title="Withdrawal Amount" navVariant="elevated">
      <div className="pb-2">
        <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-14 pt-6 text-primary-foreground md:mx-0 md:rounded-xl md:px-8 md:pt-8 md:shadow-float">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-32 size-72 rounded-full bg-gold/15 blur-[64px]"
          />
          <div className="relative md:max-w-3xl">
            <div className="flex items-center justify-between gap-3">
              <Link
                to="/withdraw/accounts"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold text-primary-foreground press"
              >
                <ArrowLeft className="size-3.5" /> Change account
              </Link>
              <span className="shrink-0 rounded-full bg-gold/15 px-2.5 py-1 text-[11px] font-extrabold text-gold">
                ₦0 fee
              </span>
            </div>

            <p className="mt-6 text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary-foreground/60">
              Amount to withdraw
            </p>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="font-display text-[40px] font-extrabold leading-none text-primary-foreground/60 md:text-[48px]">
                ₦
              </span>
              <input
                inputMode="numeric"
                autoComplete="off"
                aria-label="Amount to withdraw"
                placeholder="0"
                value={amount ? amount.toLocaleString("en-NG") : ""}
                onChange={(e) => setRaw(e.target.value)}
                className="w-full bg-transparent font-display text-[40px] font-extrabold leading-none tracking-[-0.035em] text-num text-primary-foreground outline-none placeholder:text-primary-foreground/25 md:text-[48px]"
              />
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-[12px] font-medium text-primary-foreground/60">
              <ShieldCheck className="size-3.5 text-primary-foreground/70" />
              Wallet balance {naira(WALLET)} &middot; min {naira(MIN_WITHDRAWAL)}
            </p>

            <div className="mt-5 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {QUICK.map((q) => (
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
                onClick={() => setRaw(String(Math.min(WALLET, TIER.singleLimit)))}
                className="shrink-0 flex-1 rounded-full border border-white/15 bg-white/10 py-2 text-[12px] font-bold text-primary-foreground/90 press"
              >
                Max
              </button>
            </div>
          </div>
        </section>

        <div className="relative -mx-4 -mt-8 rounded-t-[2rem] bg-background px-4 pt-5 md:mx-0 md:mt-6 md:rounded-none md:bg-transparent md:px-0 md:pt-0">
          <span
            aria-hidden
            className="mx-auto mb-4 block h-1 w-10 rounded-full bg-border md:hidden"
          />

          <div className="space-y-4 md:grid md:grid-cols-2 md:items-start md:gap-4 md:space-y-0">
            <section className="card-surface p-4 md:p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Paying into
              </p>
              <div className="mt-3 flex items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Landmark className="size-5" strokeWidth={2.2} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[13.5px] font-bold text-foreground">
                    {accountName}
                  </p>
                  <p className="truncate text-[12px] text-muted-foreground">
                    {bank} · {maskAccount(accountNumber)}
                  </p>
                </div>
              </div>

              {(belowMin || overWallet || overLimit) && (
                <p className="k-shake mt-3 rounded-xl bg-destructive/10 px-3 py-2.5 text-[12px] font-semibold text-destructive">
                  {overWallet
                    ? `Amount exceeds your wallet balance. Shortfall ${naira(amount - WALLET)}.`
                    : overLimit
                      ? `Single transaction limit is ${naira(TIER.singleLimit)}.`
                      : `Minimum withdrawal is ${naira(MIN_WITHDRAWAL)}.`}
                </p>
              )}
            </section>

            <section className="card-surface p-4 md:p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Payout summary
              </p>
              <dl className="mt-3 divide-y divide-border text-[13px]">
                <Row label="Amount">{naira(amount)}</Row>
                <Row label="Transfer fee">
                  {WITHDRAWAL_FEE === 0 ? "₦0" : naira(WITHDRAWAL_FEE)}
                </Row>
                <Row label="You receive">{naira(Math.max(amount - WITHDRAWAL_FEE, 0))}</Row>
                <Row label="Wallet after">{naira(Math.max(WALLET - amount, 0))}</Row>
              </dl>
              <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Clock className="size-3.5 shrink-0" /> {payoutEta}
              </p>
            </section>
          </div>

          <div className="mt-5">
            <button
              type="button"
              disabled={!valid}
              onClick={() =>
                void navigate({
                  to: "/withdraw/review",
                  search: { acct: accountId, amount },
                })
              }
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press disabled:opacity-40 disabled:shadow-none md:w-auto md:px-10"
            >
              Continue <ArrowRight className="size-4" strokeWidth={2.6} />
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-bold text-foreground">{children}</dd>
    </div>
  );
}

function DesktopAmount({
  setRaw,
  amount,
  belowMin,
  overWallet,
  overLimit,
  valid,
  accountId,
  accountName,
  bank,
  accountNumber,
}: AmountProps) {
  const navigate = useNavigate();

  return (
    <AppShell title="Withdrawal Amount">
      <div className="mx-auto w-full max-w-[1100px] space-y-6 pb-10">
        <section className="relative overflow-hidden rounded-3xl bg-brand-gradient px-10 py-10 text-primary-foreground shadow-float">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-36 size-96 rounded-full bg-gold/15 blur-[80px]"
          />
          <div className="relative">
            <div className="flex items-center justify-between gap-4">
              <Link
                to="/withdraw/accounts"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[11px] font-bold text-primary-foreground press"
              >
                <ArrowLeft className="size-3.5" /> Change account
              </Link>
              <span className="shrink-0 rounded-full bg-gold/15 px-3 py-1 text-[11px] font-extrabold text-gold">
                Withdraw &middot; Step 2 of 3 &middot; ₦0 fee
              </span>
            </div>

            <div className="mt-8 flex flex-wrap items-end justify-between gap-8">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-primary-foreground/60">
                  Amount to withdraw
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-display text-[52px] font-extrabold leading-none text-primary-foreground/60">
                    ₦
                  </span>
                  <input
                    inputMode="numeric"
                    autoComplete="off"
                    aria-label="Amount to withdraw"
                    placeholder="0"
                    value={amount ? amount.toLocaleString("en-NG") : ""}
                    onChange={(e) => setRaw(e.target.value)}
                    className="w-full max-w-[420px] bg-transparent font-display text-[52px] font-extrabold leading-none tracking-[-0.035em] text-num text-primary-foreground outline-none placeholder:text-primary-foreground/25"
                  />
                </div>
                <p className="mt-3 flex items-center gap-1.5 text-[13px] font-medium text-primary-foreground/60">
                  <ShieldCheck className="size-4 text-primary-foreground/70" />
                  Wallet balance {naira(WALLET)} &middot; min {naira(MIN_WITHDRAWAL)}
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                {QUICK.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setRaw(String(q))}
                    className={`rounded-full border px-5 py-2.5 text-[12.5px] font-bold transition-transform duration-150 press ${
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
                  onClick={() => setRaw(String(Math.min(WALLET, TIER.singleLimit)))}
                  className="rounded-full border border-white/15 bg-white/10 px-5 py-2.5 text-[12.5px] font-bold text-primary-foreground/90 press"
                >
                  Max
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-[minmax(0,1fr)_340px] items-start gap-6">
          <div className="min-w-0 space-y-4">
            <section className="card-surface p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Paying into
              </p>
              <div className="mt-4 flex items-center gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Landmark className="size-5" strokeWidth={2.2} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-bold text-foreground">
                    {accountName}
                  </p>
                  <p className="truncate text-[12.5px] text-muted-foreground">
                    {bank} &middot; {maskAccount(accountNumber)}
                  </p>
                </div>
                <span className="ml-auto flex items-center gap-1.5 text-[12px] text-muted-foreground">
                  <Clock className="size-3.5 shrink-0" /> {payoutEta}
                </span>
              </div>

              {(belowMin || overWallet || overLimit) && (
                <p className="k-shake mt-4 rounded-xl bg-destructive/10 px-3.5 py-3 text-[13px] font-semibold text-destructive">
                  {overWallet
                    ? `Amount exceeds your wallet balance. Shortfall ${naira(amount - WALLET)}.`
                    : overLimit
                      ? `Single transaction limit is ${naira(TIER.singleLimit)}.`
                      : `Minimum withdrawal is ${naira(MIN_WITHDRAWAL)}.`}
                </p>
              )}
            </section>

            <section className="rounded-2xl border border-border bg-muted/40 p-5">
              <p className="flex items-center gap-2 text-[12px] font-bold text-foreground">
                <ShieldCheck className="size-4 text-primary" /> Instant name check
              </p>
              <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
                The payout account above was verified against your Kipit name
                when it was added.
              </p>
            </section>
          </div>

          <aside className="sticky top-6 min-w-0">
            <section className="card-surface p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Payout summary
              </p>
              <dl className="mt-4 divide-y divide-border text-[13.5px]">
                <Row label="Amount">{naira(amount)}</Row>
                <Row label="Transfer fee">
                  {WITHDRAWAL_FEE === 0 ? "₦0" : naira(WITHDRAWAL_FEE)}
                </Row>
                <Row label="You receive">
                  <span className="text-gold">
                    {naira(Math.max(amount - WITHDRAWAL_FEE, 0))}
                  </span>
                </Row>
                <Row label="Wallet after">
                  {naira(Math.max(WALLET - amount, 0))}
                </Row>
              </dl>
              <p className="mt-4 flex items-center gap-1.5 text-[12px] text-muted-foreground">
                <Clock className="size-3.5 shrink-0" /> {payoutEta}
              </p>
              <button
                type="button"
                disabled={!valid}
                onClick={() =>
                  void navigate({
                    to: "/withdraw/review",
                    search: { acct: accountId, amount },
                  })
                }
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press disabled:opacity-40 disabled:shadow-none"
              >
                Continue <ArrowRight className="size-4" strokeWidth={2.6} />
              </button>
            </section>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
