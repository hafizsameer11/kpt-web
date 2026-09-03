import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Clock, Delete, Fingerprint, Landmark, Lock } from "lucide-react";
import { useState } from "react";
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
import { naira, WALLET } from "@/lib/home-data";
import {
  findAccount,
  maskAccount,
  MIN_WITHDRAWAL,
  payoutEta,
  WITHDRAWAL_FEE,
} from "@/lib/withdraw-data";

export const Route = createFileRoute("/withdraw_/review")({
  validateSearch: z.object({
    acct: z.string().catch("pa1"),
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
const CORRECT_PIN = "1234";

function ReviewWithdrawal() {
  const { acct, amount } = Route.useSearch();
  const account = findAccount(acct);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [open, setOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const valid = amount >= MIN_WITHDRAWAL && amount <= WALLET;

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
        window.setTimeout(() => {
          setBusy(false);
          if (next === CORRECT_PIN) {
            setOpen(false);
            setPin("");
            void navigate({
              to: "/withdraw/processing",
              search: { acct: account.id, amount },
            });
          } else {
            setPin("");
            setError("Incorrect PIN. Try again.");
          }
        }, 700);
      }
      return next;
    });
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
        <Key
          onClick={() => {
            setBusy(true);
            window.setTimeout(() => {
              setBusy(false);
              setOpen(false);
              void navigate({
                to: "/withdraw/processing",
                search: { acct: account.id, amount },
              });
            }, 900);
          }}
          aria-label="Use biometrics"
        >
          <Fingerprint className="mx-auto size-5 text-gold" />
        </Key>
        <Key onClick={() => press("0")}>0</Key>
        <Key onClick={() => press("del")} aria-label="Delete">
          <Delete className="mx-auto size-5" />
        </Key>
      </div>
    </>
  );

  return (
    <AppShell title="Review Withdrawal" navVariant="elevated">
      <div className="pb-2">
        <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-14 pt-6 text-primary-foreground md:mx-0 md:rounded-xl md:px-8 md:pt-8 md:shadow-float">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-32 size-72 rounded-full bg-gold/15 blur-[64px]"
          />
          <div className="relative md:max-w-3xl">
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
            <p className="mt-2 font-display text-[40px] font-extrabold leading-none tracking-[-0.035em] text-num md:text-[48px]">
              {naira(amount)}
            </p>
            <p className="mt-3 flex items-center gap-1.5 text-[12px] font-medium text-primary-foreground/60">
              <Clock className="size-3.5 text-primary-foreground/70" /> {payoutEta}
            </p>
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

            <section className="card-surface p-4 md:p-5">
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
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press disabled:opacity-40 disabled:shadow-none md:w-auto md:px-10"
            >
              {valid ? "Confirm withdrawal" : "Amount not valid"}
              <ArrowRight className="size-4" strokeWidth={2.6} />
            </button>
            <p className="mt-2.5 flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
              <Lock className="size-3.5" /> Authorize with your PIN or biometrics.
            </p>
          </div>
        </div>
      </div>

      {isMobile ? (
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
      )}
    </AppShell>
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
