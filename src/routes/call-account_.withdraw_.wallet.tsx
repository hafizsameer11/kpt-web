import { KycGuard } from "@/components/kipit/KycGate";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Delete,
  Info,
  Lock,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/kipit/AppShell";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { naira } from "@/lib/home-data";
import { callWithdraw, isAuthenticated } from "@/lib/api";
import { useKycTier } from "@/lib/kyc-state";
import { useCallAccountLive, hydrateLiveBalances } from "@/lib/live-balances";
import { refreshWalletFromApi, useWalletBalance } from "@/lib/wallet-balance";

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
const PIN_LENGTH = 4;

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `cw-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function ToWalletScreen() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const tier = useKycTier();
  const walletBalance = useWalletBalance();
  const { balance: callBalance, ratePct } = useCallAccountLive();
  const rateDecimal = ratePct > 0 ? ratePct / 100 : 0;
  const [raw, setRaw] = useState("");
  const [open, setOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [orderKey] = useState(() => newId());

  const amount = Number(raw.replace(/[^0-9]/g, "")) || 0;
  const overBalance = amount > callBalance;
  const valid = amount > 0 && !overBalance;
  const dailyLost = Math.round((amount * rateDecimal) / 365);

  const setAmount = (v: number) => setRaw(v.toLocaleString("en-NG"));

  function press(key: string) {
    setError(null);
    if (key === "del") {
      setPin((p) => p.slice(0, -1));
      return;
    }
    setPin((p) => {
      const next = (p + key).slice(0, PIN_LENGTH);
      if (next.length === PIN_LENGTH) {
        setBusy(true);
        void (async () => {
          try {
            if (!isAuthenticated()) throw new Error("Sign in to continue.");
            await callWithdraw(amount, next, orderKey);
            await refreshWalletFromApi();
            await hydrateLiveBalances().catch(() => undefined);
            setOpen(false);
            setPin("");
            void navigate({
              to: "/call-account/withdraw/success",
              search: { amount, ref: orderKey },
            });
          } catch (err) {
            setError(err instanceof Error ? err.message : "Could not move funds.");
            setPin("");
          } finally {
            setBusy(false);
          }
        })();
      }
      return next;
    });
  }

  const pinPad = (
    <>
      <p className="mt-3 text-center text-[16px] font-extrabold">Enter your PIN</p>
      <p className="-mt-0.5 text-center text-[12px] text-muted-foreground">
        Authorize {naira(amount)} from Call Account
      </p>
      <div className={`mt-4 flex justify-center gap-3 ${error ? "k-shake" : ""}`}>
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <span
            key={i}
            className={`size-3.5 rounded-full ${i < pin.length ? "bg-gold" : "bg-border"}`}
          />
        ))}
      </div>
      {error ? (
        <p className="mt-3 text-center text-[12px] font-semibold text-destructive">{error}</p>
      ) : null}
      {busy ? (
        <p className="mt-3 text-center text-[12px] font-semibold text-muted-foreground">
          Authorizing…
        </p>
      ) : null}
      <div className="mx-auto mt-5 grid w-full max-w-sm grid-cols-3 gap-x-3 gap-y-2.5">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((k) => (
          <button
            key={k}
            type="button"
            disabled={busy}
            onClick={() => press(k)}
            className="rounded-xl bg-secondary py-3.5 text-[18px] font-extrabold press"
          >
            {k}
          </button>
        ))}
        <span />
        <button
          type="button"
          disabled={busy}
          onClick={() => press("0")}
          className="rounded-xl bg-secondary py-3.5 text-[18px] font-extrabold press"
        >
          0
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => press("del")}
          aria-label="Delete"
          className="grid place-items-center rounded-xl bg-secondary py-3.5 press"
        >
          <Delete className="size-5" />
        </button>
      </div>
    </>
  );

  return (
    <AppShell title="Move to wallet" navVariant="elevated">
      <div className="pb-2 md:mx-auto md:max-w-4xl">
        <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-14 pt-6 text-primary-foreground md:mx-0 md:rounded-xl md:px-8 md:pt-8 md:shadow-float">
          <div className="relative">
            <div className="flex items-center justify-between gap-3">
              <Link
                to="/call-account"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold press"
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
                autoFocus={tier >= 1}
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
              Call Account balance {naira(callBalance)}
            </p>
            <div className="mt-4 flex gap-2">
              {QUICK.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setAmount(q)}
                  className="shrink-0 flex-1 rounded-full border border-white/15 bg-white/10 py-2 text-[12px] font-bold press"
                >
                  {naira(q)}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAmount(callBalance)}
                className="shrink-0 flex-1 rounded-full border border-white/15 bg-white/10 py-2 text-[12px] font-bold press"
              >
                Max
              </button>
            </div>
          </div>
        </section>

        <div className="relative -mx-4 -mt-8 rounded-t-[2rem] bg-background px-4 pt-5 md:mx-0 md:mt-6 md:rounded-none md:bg-transparent md:px-0 md:pt-0">
          <div className="space-y-4 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
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
              {overBalance ? (
                <p className="mt-3 rounded-xl bg-destructive/10 px-3 py-2.5 text-[12px] font-semibold text-destructive">
                  Amount exceeds your Call Account balance.
                </p>
              ) : null}
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
                  <span className="font-semibold text-foreground">{naira(dailyLost)}/day</span>{" "}
                  in your wallet.
                </li>
              </ul>
            </section>
          </div>

          <div className="mt-5">
            <button
              type="button"
              disabled={!valid}
              onClick={() => {
                setPin("");
                setError(null);
                setOpen(true);
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press disabled:opacity-40 md:w-auto md:px-10"
            >
              Move to wallet <ArrowRight className="size-4" strokeWidth={2.6} />
            </button>
            <p className="mt-2.5 flex items-center justify-center gap-1.5 text-[11.5px] text-muted-foreground md:justify-start">
              <Lock className="size-3.5" /> You&apos;ll authorize with your Kipit PIN.
            </p>
          </div>
        </div>
      </div>

      {isMobile ? (
        <Drawer
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) {
              setPin("");
              setError(null);
            }
          }}
        >
          <DrawerContent className="px-4 pb-8 pt-2">
            <DrawerTitle className="sr-only">Authorize move</DrawerTitle>
            <DrawerDescription className="sr-only">Enter your transaction PIN</DrawerDescription>
            {pinPad}
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) {
              setPin("");
              setError(null);
            }
          }}
        >
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Authorize move</DialogTitle>
            </DialogHeader>
            {pinPad}
          </DialogContent>
        </Dialog>
      )}
    </AppShell>
  );
}
