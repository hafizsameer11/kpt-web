import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Delete,
  Landmark,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
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
import { createWithdrawal, isAuthenticated } from "@/lib/api";
import { naira } from "@/lib/home-data";
import { refreshWalletFromApi, useWalletBalance } from "@/lib/wallet-balance";
import {
  findAccount,
  hydratePayoutFromApi,
  maskAccount,
  MIN_WITHDRAWAL,
  payoutEta,
  type PayoutAccount,
  WITHDRAWAL_FEE,
} from "@/lib/withdraw-data";

export const Route = createFileRoute("/withdraw_/review")({
  validateSearch: z.object({
    acct: z.string().catch(""),
    amount: z.number().catch(0),
  }),
  head: () => ({
    meta: [
      { title: "Review Withdrawal | Kipit" },
      {
        name: "description",
        content:
          "Confirm the amount, bank and account name before authorizing your Kipit withdrawal.",
      },
      { property: "og:title", content: "Review Withdrawal | Kipit" },
      {
        property: "og:description",
        content: "Check your payout details and authorize with your Kipit PIN.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReviewWithdrawal,
});

const PIN_LENGTH = 4;

function ReviewWithdrawal() {
  const WALLET = useWalletBalance();
  const { acct, amount } = Route.useSearch();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [account, setAccount] = useState<PayoutAccount | undefined>();

  const [open, setOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [orderKey] = useState(() =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `wd-web-${amount}-${Math.random().toString(36).slice(2, 10)}`,
  );

  useEffect(() => {
    void hydratePayoutFromApi().then(() => {
      const found = findAccount(acct);
      if (!found) {
        void navigate({ to: "/withdraw/accounts", replace: true });
        return;
      }
      setAccount(found);
    });
  }, [acct, navigate]);

  const valid = amount >= MIN_WITHDRAWAL && amount <= WALLET;

  function press(key: string) {
    if (!account || busy) return;
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
            const result = await createWithdrawal({
              payoutBankId: account.id,
              amount,
              pin: next,
              idempotencyKey: orderKey,
            });
            await refreshWalletFromApi();
            setOpen(false);
            setPin("");
            void navigate({
              to: "/withdraw/processing",
              search: {
                acct: account.id,
                amount,
                ref: result.reference,
                id: result.id,
              },
            });
          } catch (err) {
            setPin("");
            setError(
              err instanceof Error ? err.message : "Could not authorize withdrawal.",
            );
          } finally {
            setBusy(false);
          }
        })();
      }
      return next;
    });
  }

  if (!account) {
    return (
      <AppShell title="Review Withdrawal" navVariant="elevated">
        <p className="px-4 py-10 text-[13px] text-muted-foreground">Loading…</p>
      </AppShell>
    );
  }

  const pinPad = (
    <>
      <p className="mt-3 text-center text-[16px] font-extrabold">Enter your PIN</p>
      <p className="-mt-0.5 text-center text-[12px] text-muted-foreground">
        Authorize {naira(amount)} to {account.bank}
      </p>

      <div className={`mt-4 flex justify-center gap-3 ${error ? "k-shake" : ""}`}>
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <span
            key={i}
            className={`size-3.5 rounded-full ${i < pin.length ? "k-pop bg-gold" : "bg-border"}`}
          />
        ))}
      </div>

      {error && (
        <p className="mt-3 text-center text-[12px] font-semibold text-destructive">
          {error}
        </p>
      )}
      {busy && (
        <p className="mt-3 text-center text-[12px] font-semibold text-muted-foreground">
          Authorizing…
        </p>
      )}

      <div className="mx-auto mt-5 grid w-full max-w-sm auto-rows-max grid-cols-3 gap-x-3 gap-y-2.5">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((k) => (
          <Key key={k} onClick={() => press(k)}>
            {k}
          </Key>
        ))}
        <span />
        <Key onClick={() => press("0")}>0</Key>
        <Key onClick={() => press("del")} aria-label="Delete">
          <Delete className="mx-auto size-5" />
        </Key>
      </div>
    </>
  );

  const authSheet = isMobile ? (
    <Drawer
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setPin("");
      }}
    >
      <DrawerContent className="max-h-[92svh] rounded-t-[2rem] bg-card px-6 pb-8 pt-2">
        <DrawerTitle className="sr-only">Enter your PIN</DrawerTitle>
        <DrawerDescription className="sr-only">
          Authorize {naira(amount)} withdrawal
        </DrawerDescription>
        {pinPad}
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setPin("");
      }}
    >
      <DialogContent className="max-w-sm rounded-xl">
        <DialogHeader>
          <DialogTitle className="sr-only">Enter your PIN</DialogTitle>
        </DialogHeader>
        {pinPad}
      </DialogContent>
    </Dialog>
  );

  return (
    <AppShell title="Review Withdrawal" navVariant="elevated">
      <div className="md:hidden">
        <MobileReview
          account={account}
          amount={amount}
          valid={valid}
          open={open}
          setOpen={setOpen}
          pinPad={pinPad}
        />
      </div>
      <div className="hidden md:block">
        <DesktopReview
          account={account}
          amount={amount}
          valid={valid}
          open={open}
          setOpen={setOpen}
          pinPad={pinPad}
        />
      </div>
      {authSheet}
    </AppShell>
  );
}

interface ReviewAccount {
  id: string;
  accountName: string;
  bank: string;
  accountNumber: string;
}

function MobileReview({
  account,
  amount,
  valid,
  setOpen,
}: {
  account: ReviewAccount;
  amount: number;
  valid: boolean;
  open: boolean;
  setOpen: (v: boolean) => void;
  pinPad: React.ReactNode;
}) {
  const WALLET = useWalletBalance();
  return (
    <div className="pb-2">
      <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-14 pt-6 text-primary-foreground">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-32 size-72 rounded-full bg-gold/15 blur-[64px]"
        />
        <div className="relative">
          <Link
            to="/withdraw/amount"
            search={{ acct: account.id }}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold text-primary-foreground press"
          >
            <ArrowLeft className="size-3.5" /> Edit amount
          </Link>
          <p className="mt-6 text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary-foreground/60">
            You're withdrawing
          </p>
          <p className="mt-2 font-display text-[40px] font-extrabold leading-none tracking-[-0.035em] text-num">
            {naira(amount)}
          </p>
          <p className="mt-3 flex items-center gap-1.5 text-[12px] font-medium text-primary-foreground/60">
            <Clock className="size-3.5 text-primary-foreground/70" /> {payoutEta}
          </p>
        </div>
      </section>

      <div className="relative -mx-4 -mt-8 rounded-t-[2rem] bg-background px-4 pt-5">
        <span
          aria-hidden
          className="mx-auto mb-4 block h-1 w-10 rounded-full bg-border"
        />

        <div className="space-y-4">
          <section className="card-surface p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Destination
            </p>
            <div className="mt-3 flex items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <Landmark className="size-5" strokeWidth={2.2} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13.5px] font-bold text-foreground">
                  {account.accountName}
                </p>
                <p className="truncate text-[12px] text-muted-foreground">
                  {account.bank} · {maskAccount(account.accountNumber)}
                </p>
              </div>
            </div>
          </section>

          <section className="card-surface p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Transaction summary
            </p>
            <dl className="mt-3 divide-y divide-border text-[13px]">
              <Row label="Amount">{naira(amount)}</Row>
              <Row label="Transfer fee">
                {WITHDRAWAL_FEE === 0 ? "₦0" : naira(WITHDRAWAL_FEE)}
              </Row>
              <Row label="You receive">{naira(Math.max(amount - WITHDRAWAL_FEE, 0))}</Row>
              <Row label="From">Kipit Wallet</Row>
              <Row label="Wallet after">{naira(Math.max(WALLET - amount, 0))}</Row>
            </dl>
          </section>
        </div>

        <div className="mt-5">
          <button
            type="button"
            disabled={!valid}
            onClick={() => setOpen(true)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press disabled:opacity-40 disabled:shadow-none"
          >
            {valid ? "Confirm withdrawal" : "Amount not valid"}
            <ArrowRight className="size-4" strokeWidth={2.6} />
          </button>
          <p className="mt-2.5 flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
            <Lock className="size-3.5" /> Authorize with your transaction PIN.
          </p>
        </div>
      </div>
    </div>
  );
}

function DesktopReview({
  account,
  amount,
  valid,
  setOpen,
}: {
  account: ReviewAccount;
  amount: number;
  valid: boolean;
  open: boolean;
  setOpen: (v: boolean) => void;
  pinPad: React.ReactNode;
}) {
  const WALLET = useWalletBalance();
  return (
    <div className="mx-auto w-full max-w-[1100px] space-y-6 pb-10">
      <section className="relative overflow-hidden rounded-3xl bg-brand-gradient px-10 py-10 text-primary-foreground shadow-float">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-36 size-96 rounded-full bg-gold/15 blur-[80px]"
        />
        <div className="relative">
          <div className="flex items-center justify-between gap-4">
            <Link
              to="/withdraw/amount"
              search={{ acct: account.id }}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[11px] font-bold text-primary-foreground press"
            >
              <ArrowLeft className="size-3.5" /> Edit amount
            </Link>
            <span className="shrink-0 rounded-full bg-gold/15 px-3 py-1 text-[11px] font-extrabold text-gold">
              Withdraw · Step 3 of 3 · ₦0 fee
            </span>
          </div>

          <p className="mt-8 text-[11px] font-extrabold uppercase tracking-[0.2em] text-primary-foreground/60">
            You're withdrawing
          </p>
          <p className="mt-2 font-display text-[52px] font-extrabold leading-none tracking-[-0.035em] text-num">
            {naira(amount)}
          </p>
          <p className="mt-3 flex items-center gap-1.5 text-[13px] font-medium text-primary-foreground/60">
            <Clock className="size-4 text-primary-foreground/70" /> {payoutEta}
          </p>
        </div>
      </section>

      <div className="grid grid-cols-[minmax(0,1fr)_360px] items-start gap-6">
        <div className="min-w-0 space-y-4">
          <section className="card-surface p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Destination
            </p>
            <div className="mt-4 flex items-center gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <Landmark className="size-5" strokeWidth={2.2} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[15px] font-bold text-foreground">
                  {account.accountName}
                </p>
                <p className="truncate text-[12.5px] text-muted-foreground">
                  {account.bank} · {maskAccount(account.accountNumber)}
                </p>
              </div>
              <span className="ml-auto flex items-center gap-1.5 text-[12px] text-muted-foreground">
                <Clock className="size-3.5 shrink-0" /> {payoutEta}
              </span>
            </div>

            <div className="mt-5 rounded-2xl border border-border bg-muted/40 p-4">
              <p className="flex items-center gap-2 text-[12px] font-bold text-foreground">
                <ShieldCheck className="size-4 text-primary" /> Verified account
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                This payout account was verified against your Kipit name when it was added.
              </p>
            </div>
          </section>

          <section className="card-surface p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Transaction summary
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
              <Row label="From">Kipit Wallet</Row>
              <Row label="Wallet after">{naira(Math.max(WALLET - amount, 0))}</Row>
            </dl>
          </section>
        </div>

        <aside className="sticky top-6 min-w-0">
          <section className="card-surface p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Authorize
            </p>
            <p className="mt-4 font-display text-[32px] font-extrabold leading-none tracking-[-0.03em] text-foreground">
              {naira(Math.max(amount - WITHDRAWAL_FEE, 0))}
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-[12px] text-muted-foreground">
              <Clock className="size-3.5 shrink-0" /> {payoutEta}
            </p>

            <div className="mt-5 rounded-2xl border border-border bg-muted/40 p-4">
              <p className="flex items-center gap-2 text-[12px] font-bold text-foreground">
                <Lock className="size-4 text-primary" /> Transaction PIN
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                Confirm with your 4-digit transaction PIN.
              </p>
            </div>

            <button
              type="button"
              disabled={!valid}
              onClick={() => setOpen(true)}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press disabled:opacity-40 disabled:shadow-none"
            >
              {valid ? "Confirm withdrawal" : "Amount not valid"}
              <ArrowRight className="size-4" strokeWidth={2.6} />
            </button>
            <p className="mt-3 flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
              <ShieldCheck className="size-3.5" /> Secured by Kipit encryption.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Key({
  children,
  onClick,
  ...rest
}: {
  children: React.ReactNode;
  onClick: () => void;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl bg-secondary py-3.5 text-[19px] font-extrabold text-foreground press"
      {...rest}
    >
      {children}
    </button>
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
