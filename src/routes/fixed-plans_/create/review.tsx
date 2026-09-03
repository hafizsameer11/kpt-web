import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Delete,
  Fingerprint,
  Gift,
  Lock,
  PiggyBank,
  RefreshCcw,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { AppShell } from "@/components/kipit/AppShell";
import { AmountCounter, Rise } from "@/components/kipit/motion";
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
import { TENOR_BANDS } from "@/lib/invest-data";

export const Route = createFileRoute("/fixed-plans_/create/review")({
  validateSearch: z.object({
    amount: z.number().catch(0),
    days: z.number().catch(0),
    name: z.string().catch(""),
    maturity: z.enum(["wallet", "rollover", "call"]).catch("wallet"),
    auto: z.string().catch(""),
    gift: z.string().catch(""),
  }),
  head: () => ({
    meta: [
      { title: "Review Your Fixed Plan | Kipit" },
      {
        name: "description",
        content:
          "Check your amount, rate, tenor, expected interest, payout, maturity date and instructions before confirming your Kipit fixed plan.",
      },
      { property: "og:title", content: "Review Your Fixed Plan | Kipit" },
      {
        property: "og:description",
        content:
          "Confirm the full summary of your fixed investment and authorize it securely.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PlanReviewScreen,
});

const DAY_MS = 86_400_000;
const PIN_LENGTH = 4;
const MAX_ATTEMPTS = 3;
const CORRECT_PIN = "1234";

const MATURITY_LABEL = {
  wallet: { label: "Move funds to wallet", icon: Wallet },
  rollover: { label: "Roll over investment", icon: RefreshCcw },
  call: { label: "Move to Call Account", icon: PiggyBank },
} as const;

function PlanReviewScreen() {
  const { amount, days, name, maturity, auto, gift } = Route.useSearch();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [open, setOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [busy, setBusy] = useState(false);

  const band = TENOR_BANDS.find(
    (b) => Number(b.days.replace(/\D/g, "")) === days,
  );
  const ratePct = band ? Number(band.rate.replace(/[^0-9.]/g, "")) : 14;
  const rateLabel = band ? band.rate : `${ratePct}%`;
  const interest = Math.round((amount * (ratePct / 100) * days) / 365);
  const payout = amount + interest;
  const maturityDate = new Date(Date.now() + days * DAY_MS).toLocaleDateString(
    "en-NG",
    { day: "2-digit", month: "short", year: "numeric" },
  );

  const locked = attempts >= MAX_ATTEMPTS;
  const valid = amount > 0 && days > 0 && amount <= WALLET;
  const MaturityIcon = MATURITY_LABEL[maturity].icon;

  function press(key: string) {
    if (locked || busy) return;
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
              to: "/fixed-plans/create/processing",
              search: { amount, days, name, maturity },
            });
          } else {
            const n = attempts + 1;
            setAttempts(n);
            setPin("");
            setError(
              n >= MAX_ATTEMPTS
                ? "Too many attempts. Try again in 30 minutes or reset your PIN."
                : `Incorrect PIN. ${MAX_ATTEMPTS - n} attempt${MAX_ATTEMPTS - n === 1 ? "" : "s"} left.`,
            );
          }
        }, 650);
      }
      return next;
    });
  }

  function biometrics() {
    if (locked || busy) return;
    setBusy(true);
    setError(null);
    window.setTimeout(() => {
      setBusy(false);
      setError("Biometric authentication failed. Enter your PIN instead.");
    }, 900);
  }

  const authPad = (
    <>
      <p className="mt-3 text-center text-[16px] font-extrabold">
        Authorize investment
      </p>
      <p className="-mt-0.5 text-center text-[12px] text-muted-foreground">
        {naira(amount)} · {days} days at {rateLabel}
      </p>

      <div className={`mt-4 flex justify-center gap-3 ${error ? "k-shake" : ""}`}>
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <span
            key={i}
            className={`size-3.5 rounded-full ${
              i < pin.length ? "k-pop bg-gold" : "bg-border"
            }`}
          />
        ))}
      </div>

      {error && (
        <p className="mt-3 text-center text-[12px] font-semibold text-destructive">
          {error}
        </p>
      )}
      {busy && !error && (
        <p className="mt-3 text-center text-[12px] font-semibold text-muted-foreground">
          Verifying…
        </p>
      )}

      <div className="mx-auto mt-5 grid w-full max-w-sm auto-rows-max grid-cols-3 gap-x-3 gap-y-2.5">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((k) => (
          <Key key={k} onClick={() => press(k)} disabled={locked}>
            {k}
          </Key>
        ))}
        <Key onClick={biometrics} aria-label="Use biometrics" disabled={locked}>
          <Fingerprint className="mx-auto size-5 text-gold" />
        </Key>
        <Key onClick={() => press("0")} disabled={locked}>
          0
        </Key>
        <Key onClick={() => press("del")} aria-label="Delete" disabled={locked}>
          <Delete className="mx-auto size-5" />
        </Key>
      </div>

      <p className="mt-4 text-center text-[11px] text-muted-foreground">
        Use PIN <span className="font-bold text-foreground">1234</span> in this prototype.
      </p>
    </>
  );

  return (
    <AppShell title="Review Plan" navVariant="elevated">
      <div className="pb-2">
        {/* Hero */}
        <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-14 pt-6 text-primary-foreground md:mx-0 md:rounded-xl md:px-8 md:pb-14 md:pt-8 md:shadow-float">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-32 size-72 rounded-full bg-gold/15 blur-[64px]"
          />
          <div className="relative md:max-w-3xl">
            <div className="flex items-center justify-between gap-3">
              <Link
                to="/fixed-plans/create/options"
                search={{ amount, days }}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold text-primary-foreground press"
              >
                <ArrowLeft className="size-3.5" /> Options
              </Link>
              <span className="shrink-0 rounded-full bg-gold/15 px-2.5 py-1 text-[11px] font-extrabold text-gold">
                {rateLabel} p.a.
              </span>
            </div>

            <p className="k-rise mt-6 text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary-foreground/60">
              {name ? name : "You're investing"}
            </p>
            <p
              className="k-rise mt-2 font-display text-[38px] font-extrabold leading-none tracking-[-0.035em] text-num md:text-[46px]"
              style={{ "--d": "80ms" } as React.CSSProperties}
            >
              <AmountCounter value={amount} hidden={false} mask={(v) => naira(v)} />
            </p>
            <p
              className="k-rise mt-3 text-[12.5px] font-medium text-primary-foreground/65"
              style={{ "--d": "160ms" } as React.CSSProperties}
            >
              {days} days · matures {maturityDate}
            </p>
          </div>
        </section>

        {/* Sheet */}
        <div className="relative -mx-4 -mt-8 rounded-t-[2rem] bg-background px-4 pt-5 md:mx-0 md:mt-6 md:rounded-none md:bg-transparent md:px-0 md:pt-0">
          <span
            aria-hidden
            className="mx-auto mb-4 block h-1 w-10 rounded-full bg-border md:hidden"
          />

          <div className="space-y-4 md:grid md:grid-cols-2 md:items-start md:gap-4 md:space-y-0">
            <Rise>
              <section className="card-surface p-4 md:p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Plan summary
                </p>
                <dl className="mt-3 divide-y divide-border text-[13px]">
                  <Row label="Plan name">{name || "Fixed plan"}</Row>
                  <Row label="Investment amount">{naira(amount)}</Row>
                  <Row label="Rate">{rateLabel} p.a.</Row>
                  <Row label="Tenor">{days} days</Row>
                  <Row label="Funding source">
                    <span className="inline-flex items-center gap-1.5">
                      <Wallet className="size-3.5 text-gold" /> Kipit Wallet
                    </span>
                  </Row>
                  <Row label="Wallet after">
                    {naira(Math.max(WALLET - amount, 0))}
                  </Row>
                </dl>
              </section>
            </Rise>

            <Rise delay={60}>
              <section className="card-surface p-4 md:p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  What you get at maturity
                </p>
                <div className="mt-3 flex divide-x divide-border">
                  <div className="flex-1 pr-4">
                    <p className="text-[11px] font-semibold text-muted-foreground">
                      Expected interest
                    </p>
                    <p className="mt-0.5 font-display text-[20px] font-extrabold leading-none text-num text-emerald-600">
                      +{naira(interest)}
                    </p>
                  </div>
                  <div className="flex-1 pl-4">
                    <p className="text-[11px] font-semibold text-muted-foreground">
                      Expected payout
                    </p>
                    <p className="mt-0.5 font-display text-[20px] font-extrabold leading-none text-num">
                      {naira(payout)}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-[11px] text-muted-foreground">
                  Payable on {maturityDate}. Indicative — early liquidation may reduce interest.
                </p>
              </section>
            </Rise>

            <Rise delay={120}>
              <section className="card-surface p-4 md:p-5 md:col-span-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Instructions
                </p>
                <dl className="mt-3 divide-y divide-border text-[13px]">
                  <Row label="Maturity instruction">
                    <span className="inline-flex items-center gap-1.5">
                      <MaturityIcon className="size-3.5 text-gold" />
                      {MATURITY_LABEL[maturity].label}
                    </span>
                  </Row>
                  <Row label="Auto-invest">
                    {auto ? (
                      <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[11px] font-extrabold text-gold">
                        {auto}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Off</span>
                    )}
                  </Row>
                  <Row label="Beneficiary">
                    {gift ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Gift className="size-3.5 text-gold" /> {gift}
                      </span>
                    ) : (
                      "Myself"
                    )}
                  </Row>
                </dl>
              </section>
            </Rise>
          </div>

          <div className="mt-5">
            <button
              type="button"
              disabled={!valid}
              onClick={() => setOpen(true)}
              className={`inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press md:w-auto md:px-10 ${
                valid ? "k-glow" : "opacity-40 shadow-none"
              }`}
            >
              {valid ? "Confirm investment" : "Details incomplete"}
              <ArrowRight className="size-4" strokeWidth={2.6} />
            </button>
            <p className="mt-2.5 flex items-center justify-center gap-1.5 text-[11.5px] text-muted-foreground md:justify-start">
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
            if (!o) {
              setPin("");
              setError(null);
            }
          }}
        >
          <DrawerContent className="max-h-[92svh] rounded-t-[2rem] bg-card px-6 pb-8 pt-2">
            <DrawerTitle className="sr-only">Authorize investment</DrawerTitle>
            <DrawerDescription className="sr-only">
              Enter your transaction PIN to confirm {naira(amount)}
            </DrawerDescription>
            {authPad}
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog
          open={open}
          onOpenChange={(o) => {
            setOpen(o);
            if (!o) {
              setPin("");
              setError(null);
            }
          }}
        >
          <DialogContent className="max-w-sm rounded-xl">
            <DialogHeader>
              <DialogTitle className="sr-only">Authorize investment</DialogTitle>
            </DialogHeader>
            {authPad}
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
      <dd className="text-right font-bold text-foreground">{children}</dd>
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
      className="h-12 rounded-lg border border-border bg-card font-display text-[17px] font-extrabold text-foreground press disabled:opacity-40"
      {...rest}
    >
      {children}
    </button>
  );
}
