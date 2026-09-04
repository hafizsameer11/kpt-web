import { KycGuard } from "@/components/kipit/KycGate";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Info, ShieldCheck, Wallet } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/kipit/AppShell";
import { naira } from "@/lib/home-data";
import { CALL_ACCOUNT } from "@/lib/invest-data";
import { useWalletBalance } from "@/lib/wallet-balance";

export const Route = createFileRoute("/call-account_/withdraw_/wallet")({
  head: () => ({
    meta: [
      { title: "Move Call Account Money to Wallet | Kipit" },
      {
        name: "description",
        content:
          "Move any amount from your Kipit Call Account into your wallet instantly — no penalty, no waiting.",
      },
      { property: "og:title", content: "Move Call Account Money to Wallet | Kipit" },
      {
        property: "og:description",
        content: "Instantly move Call Account money into your Kipit wallet.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <KycGuard required={1}>
      <ToWalletScreen />
    </KycGuard>
  ),
});

const QUICK = [100_000, 250_000, 500_000];
const RATE = 0.145;

function ToWalletScreen() {
  const walletBalance = useWalletBalance();
  const [raw, setRaw] = useState("");
  const amount = Number(raw.replace(/[^0-9]/g, "")) || 0;
  const overBalance = amount > CALL_ACCOUNT.balance;
  const valid = amount > 0 && !overBalance;

  const setAmount = (v: number) => setRaw(v.toLocaleString("en-NG"));
  const dailyLost = Math.round((amount * RATE) / 365);

  return (
    <AppShell title="Move to wallet" navVariant="elevated">
      <div className="pb-2 md:mx-auto md:max-w-4xl">
        <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-14 pt-6 text-primary-foreground md:mx-0 md:rounded-xl md:px-8 md:pt-8 md:shadow-float">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-32 size-72 rounded-full bg-gold/15 blur-[64px]"
          />
          <div className="relative">
            <div className="flex items-center justify-between gap-3">
              <Link
                to="/call-account/withdraw"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold text-primary-foreground press"
              >
                <ArrowLeft className="size-3.5" /> Back
              </Link>
              <span className="shrink-0 rounded-full bg-gold/15 px-2.5 py-1 text-[11px] font-extrabold text-gold">
                Instant · Free
              </span>
            </div>

            <p className="mt-6 text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary-foreground/60">
              Amount to move
            </p>
            <div className="mt-2 flex items-end gap-2">
              <span className="font-display text-[34px] font-extrabold leading-none text-primary-foreground/70">
                ₦
              </span>
              <input
                inputMode="numeric"
                autoFocus
                value={raw}
                onChange={(e) => {
                  const digits = e.target.value.replace(/[^0-9]/g, "");
                  setRaw(digits ? Number(digits).toLocaleString("en-NG") : "");
                }}
                placeholder="0"
                aria-label="Amount to move to wallet"
                className="w-full min-w-0 bg-transparent font-display text-[40px] font-extrabold leading-none tracking-[-0.035em] text-num text-primary-foreground outline-none placeholder:text-primary-foreground/30"
              />
            </div>
            <p className="mt-3 text-[12px] font-medium text-primary-foreground/60">
              Call Account balance {naira(CALL_ACCOUNT.balance)}
            </p>

            <div className="mt-4 flex gap-2">
              {QUICK.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setAmount(q)}
                  className="shrink-0 flex-1 rounded-full border border-white/15 bg-white/10 py-2 text-[12px] font-bold text-primary-foreground/90 press"
                >
                  {naira(q)}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAmount(CALL_ACCOUNT.balance)}
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
                Destination
              </p>
              <div className="mt-3 flex items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold">
                  <Wallet className="size-5" strokeWidth={2.2} />
                </span>
                <div className="min-w-0">
                  <p className="text-[13.5px] font-bold text-foreground">Kipit Wallet</p>
                  <p className="text-[12px] text-muted-foreground">
                    Balance {naira(walletBalance)}
                  </p>
                </div>
              </div>
              {overBalance && (
                <p className="k-shake mt-3 rounded-xl bg-destructive/10 px-3 py-2.5 text-[12px] font-semibold text-destructive">
                  Amount exceeds your Call Account balance.
                </p>
              )}
            </section>

            <section className="card-surface p-4 md:p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Worth knowing
              </p>
              <ul className="mt-3 space-y-2.5 text-[12.5px] leading-relaxed text-muted-foreground">
                <li className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-primary" />
                  No penalty — interest already accrued stays yours.
                </li>
                <li className="flex items-start gap-2">
                  <Info className="mt-0.5 size-3.5 shrink-0" />
                  This amount stops earning{" "}
                  <span className="font-semibold text-foreground">
                    {naira(dailyLost)}/day
                  </span>{" "}
                  once it sits in your wallet.
                </li>
              </ul>
            </section>
          </div>

          <div className="mt-5">
            <Link
              to="/call-account/withdraw/success"
              search={{ amount }}
              aria-disabled={!valid}
              className={`inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press md:w-auto md:px-10 ${
                valid ? "" : "pointer-events-none opacity-40 shadow-none"
              }`}
            >
              Move to wallet <ArrowRight className="size-4" strokeWidth={2.6} />
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
