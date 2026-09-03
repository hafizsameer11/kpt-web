import { KycGuard } from "@/components/kipit/KycGate";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CreditCard,
  ShieldCheck,
  Wallet,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/kipit/AppShell";
import { naira, WALLET } from "@/lib/home-data";
import {
  cardFee,
  MAX_CARD_DEPOSIT,
  MIN_DEPOSIT,
  QUICK_DEPOSITS,
  type DepositMethod,
} from "@/lib/wallet-data";

export const Route = createFileRoute("/wallet_/add-money")({
  head: () => ({
    meta: [
      { title: "Add Money to Wallet | Kipit" },
      {
        name: "description",
        content:
          "Fund your Kipit wallet instantly by bank transfer to your dedicated account or with a debit card.",
      },
      { property: "og:title", content: "Add Money to Wallet | Kipit" },
      {
        property: "og:description",
        content: "Top up your Kipit wallet by bank transfer or debit card.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <KycGuard required={1}>
      <WalletAddMoney />
    </KycGuard>
  ),
});

function WalletAddMoney() {
  const navigate = useNavigate();
  const [raw, setRaw] = useState("");
  const [method, setMethod] = useState<DepositMethod>("transfer");
  const amount = Number(raw.replace(/[^0-9]/g, "")) || 0;

  const belowMin = amount > 0 && amount < MIN_DEPOSIT;
  const overCardLimit = method === "card" && amount > MAX_CARD_DEPOSIT;
  const valid = amount > 0 && !belowMin && !overCardLimit;
  const fee = method === "card" ? cardFee(amount) : 0;

  return (
    <AppShell title="Add Money" navVariant="elevated">
      <div className="pb-2">
        <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-14 pt-6 text-primary-foreground md:mx-0 md:rounded-xl md:px-8 md:pt-8 md:shadow-float">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-32 size-72 rounded-full bg-gold/15 blur-[64px]"
          />
          <div className="relative md:max-w-3xl">
            <div className="flex items-center justify-between gap-3">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold text-primary-foreground press"
              >
                <ArrowLeft className="size-3.5" /> Home
              </Link>
              <span className="shrink-0 rounded-full bg-gold/15 px-2.5 py-1 text-[11px] font-extrabold text-gold">
                Wallet {naira(WALLET)}
              </span>
            </div>

            <p className="mt-6 text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary-foreground/60">
              Amount to add
            </p>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="font-display text-[40px] font-extrabold leading-none text-primary-foreground/60 md:text-[48px]">
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
              Minimum {naira(MIN_DEPOSIT)} &middot; funds land in your wallet
            </p>

            <div className="mt-5 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {QUICK_DEPOSITS.map((q) => (
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
            </div>
          </div>
        </section>

        <div className="relative -mx-4 -mt-8 rounded-t-[2rem] bg-background px-4 pt-5 md:mx-0 md:mt-6 md:rounded-none md:bg-transparent md:px-0 md:pt-0">
          <span
            aria-hidden
            className="mx-auto mb-4 block h-1 w-10 rounded-full bg-border md:hidden"
          />

          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            How do you want to pay?
          </p>

          <ul className="mt-3 space-y-2.5 md:grid md:grid-cols-2 md:gap-3 md:space-y-0">
            <MethodOption
              active={method === "transfer"}
              onClick={() => setMethod("transfer")}
              icon={<Building2 className="size-5" strokeWidth={2.2} />}
              title="Bank transfer"
              desc="Send to your dedicated Kipit account · ₦0 fee"
              badge="Free"
            />
            <MethodOption
              active={method === "card"}
              onClick={() => setMethod("card")}
              icon={<CreditCard className="size-5" strokeWidth={2.2} />}
              title="Debit card"
              desc={`1.5% processing fee · up to ${naira(MAX_CARD_DEPOSIT)} per payment`}
            />
          </ul>

          <section className="card-surface mt-4 p-4 md:max-w-lg md:p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Summary
            </p>
            <dl className="mt-3 divide-y divide-border text-[13px]">
              <Row label="Amount">{naira(amount)}</Row>
              <Row label="Fee">{fee === 0 ? "₦0" : naira(fee)}</Row>
              <Row label="Wallet after">{naira(WALLET + amount)}</Row>
            </dl>
            {(belowMin || overCardLimit) && (
              <p className="k-shake mt-3 rounded-xl bg-destructive/10 px-3 py-2.5 text-[12px] font-semibold text-destructive">
                {overCardLimit
                  ? `Card payments are capped at ${naira(MAX_CARD_DEPOSIT)}. Use bank transfer instead.`
                  : `Minimum deposit is ${naira(MIN_DEPOSIT)}.`}
              </p>
            )}
            <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Wallet className="size-3.5 shrink-0" /> Wallet cash is idle — move it into a
              plan to start earning.
            </p>
          </section>

          <div className="mt-5">
            <button
              type="button"
              disabled={!valid}
              onClick={() =>
                void navigate({
                  to: method === "card" ? "/wallet/card" : "/wallet/transfer",
                  search: { amount },
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

function MethodOption({
  active,
  onClick,
  icon,
  title,
  desc,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  desc: string;
  badge?: string;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={`flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-colors press ${
          active ? "border-gold bg-gold/[0.07]" : "border-border bg-card hover:border-gold/40"
        }`}
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="truncate text-[13.5px] font-bold text-foreground">{title}</span>
            {badge && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-gold">
                <Zap className="size-3" strokeWidth={2.6} /> {badge}
              </span>
            )}
          </span>
          <span className="mt-0.5 block text-[12px] text-muted-foreground">{desc}</span>
        </span>
        <span
          className={`grid size-5 shrink-0 place-items-center rounded-full border ${
            active ? "border-gold bg-gold text-gold-foreground" : "border-border"
          }`}
        >
          {active && <Check className="size-3.5" strokeWidth={3} />}
        </span>
      </button>
    </li>
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
