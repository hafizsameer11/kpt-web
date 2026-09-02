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
import { naira, WALLET } from "@/lib/home-data";
import { CALL_ACCOUNT } from "@/lib/invest-data";

export const Route = createFileRoute("/call-account_/review")({
  validateSearch: (search: Record<string, unknown>) => ({
    amount: Number(search["amount"]) || 0,
  }),
  head: () => ({
    meta: [
      { title: "Review Call Account Deposit | Kipit" },
      {
        name: "description",
        content:
          "Confirm the amount, funding source and indicative rate before moving money into your Kipit Call Account.",
      },
      { property: "og:title", content: "Review Call Account Deposit | Kipit" },
      {
        property: "og:description",
        content:
          "Check your deposit details and authorize with your Kipit PIN.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReviewScreen,
});

const RATE = 0.145;
const PIN_LENGTH = 4;

function ReviewScreen() {
  const { amount } = Route.useSearch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const valid = amount >= CALL_ACCOUNT.minimum && amount <= WALLET;
  const dailyInterest = Math.round((amount * RATE) / 365);
  const monthlyInterest = Math.round((amount * RATE) / 12);

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
          setOpen(false);
          setPin("");
          void navigate({ to: "/call-account/success", search: { amount } });
        }, 700);
      }
      return next;
    });
  }

  return (
    <AppShell title="Review" navVariant="elevated">
      <div className="pb-2">
        <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-14 pt-6 text-primary-foreground md:mx-0 md:rounded-[2rem] md:px-8 md:pb-14 md:pt-8 md:shadow-float">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-32 size-72 rounded-full bg-gold/15 blur-[64px]"
          />
          <div className="relative md:max-w-3xl">
            <div className="flex items-center justify-between gap-3">
              <Link
                to="/call-account/add-money"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold text-primary-foreground press"
              >
                <ArrowLeft className="size-3.5" /> Edit amount
              </Link>
              <span className="shrink-0 rounded-full bg-gold/15 px-2.5 py-1 text-[11px] font-extrabold text-gold">
                {CALL_ACCOUNT.rate}
              </span>
            </div>

            <p className="mt-6 text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary-foreground/60">
              You're adding
            </p>
            <p className="mt-2 font-display text-[40px] font-extrabold leading-none tracking-[-0.035em] text-num md:text-[48px]">
              {naira(amount)}
            </p>
            <p className="mt-3 flex items-center gap-1.5 text-[12px] font-medium text-primary-foreground/60">
              <ShieldCheck className="size-3.5 text-primary-foreground/70" />
              To your Call Account &middot; {CALL_ACCOUNT.liquidity}
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
                Transaction summary
              </p>
              <dl className="mt-3 divide-y divide-border text-[13px]">
                <Row label="From">
                  <span className="inline-flex items-center gap-1.5 font-bold text-foreground">
                    <Wallet className="size-3.5 text-gold" /> Kipit Wallet
                  </span>
                </Row>
                <Row label="To">Call Account</Row>
                <Row label="Amount">{naira(amount)}</Row>
                <Row label="Fees">
                  <span className="font-bold text-foreground">₦0</span>
                </Row>
                <Row label="Rate">{CALL_ACCOUNT.rate}</Row>
                <Row label="Wallet after">
                  {naira(Math.max(WALLET - amount, 0))}
                </Row>
              </dl>
            </section>

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

          <div className="mt-5">
            <button
              type="button"
              disabled={!valid}
              onClick={() => setOpen(true)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none md:w-auto md:px-10"
            >
              {valid ? "Confirm & add money" : "Amount not valid"}
              <ArrowRight className="size-4" strokeWidth={2.6} />
            </button>
            <p className="mt-2.5 flex items-center justify-center gap-1.5 text-[11.5px] text-muted-foreground md:justify-start">
              <Lock className="size-3.5" /> You'll authorize with your Kipit PIN.
            </p>
          </div>
        </div>
      </div>

      {isMobile ? (
        <Drawer open={open} onOpenChange={(o) => { setOpen(o); if (!o) setPin(""); }}>
          <DrawerContent className="rounded-t-[2rem] bg-card px-6 pb-8 pt-2">
            <DrawerTitle className="sr-only">Enter your PIN</DrawerTitle>
            <DrawerDescription className="sr-only">
              Authorize {naira(amount)} to your Call Account
            </DrawerDescription>
            {pinPad}
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setPin(""); }}>
          <DialogContent className="max-w-sm rounded-3xl">
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

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-bold text-foreground">{children}</dd>
    </div>
  );
}

function Key({
  children,
  onClick,
  ...rest
}: { children: React.ReactNode; onClick: () => void } & React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl border border-border bg-card py-3 font-display text-[18px] font-extrabold text-foreground press"
      {...rest}
    >
      {children}
    </button>
  );
}
