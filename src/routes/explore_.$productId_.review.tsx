import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CreditCard,
  Delete,
  Fingerprint,
  Lock,
  Plus,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/kipit/AppShell";
import { DisclosureStrip } from "@/components/kipit/DisclosureStrip";
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
import { getExploreProduct } from "@/lib/explore-data";

export const Route = createFileRoute("/explore_/$productId_/review")({
  head: () => ({
    meta: [
      { title: "Review Subscription | Kipit Marketplace" },
      {
        name: "description",
        content:
          "Check the product, amount, funding method and expected terms before authorizing your Kipit marketplace subscription.",
      },
      { property: "og:title", content: "Review Subscription | Kipit Marketplace" },
      {
        property: "og:description",
        content:
          "Confirm your subscription details and authorize securely with PIN or biometrics.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    amount: Number(search['amount']) || 0,
    source:
      search['source'] === "add" || search['source'] === "card"
        ? (search['source'] as "add" | "card")
        : ("wallet" as const),
  }),
  loader: ({ params }) => {
    const product = getExploreProduct(params.productId);
    if (!product) throw notFound();
    return { product };
  },
  component: SubscriptionReviewScreen,
});

const DAY_MS = 86_400_000;
const PIN_LENGTH = 4;
const MAX_ATTEMPTS = 3;
const CORRECT_PIN = "1234";

const SOURCE_META = {
  wallet: { label: "Kipit Wallet", icon: Wallet },
  add: { label: "Wallet top-up (transfer)", icon: Plus },
  card: { label: "Card or bank via Paystack", icon: CreditCard },
} as const;

function SubscriptionReviewScreen() {
  const { product } = Route.useLoaderData();
  const { amount, source } = Route.useSearch();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [open, setOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [busy, setBusy] = useState(false);

  const ratePct = Number(product.rate.match(/[\d.]+/)?.[0]) || 0;
  const days = Number(product.tenor.match(/\d+/)?.[0]) || 365;
  const interest = Math.round((amount * (ratePct / 100) * days) / 365);
  const payout = amount + interest;
  const maturityDate = new Date(Date.now() + days * DAY_MS).toLocaleDateString(
    "en-NG",
    { day: "2-digit", month: "short", year: "numeric" },
  );

  const locked = attempts >= MAX_ATTEMPTS;
  const valid = amount >= product.minimum && product.availability !== "closed";
  const SourceIcon = SOURCE_META[source].icon;

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
              to: "/explore/$productId/processing",
              params: { productId: product.id },
              search: { amount, source },
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
        Authorize subscription
      </p>
      <p className="-mt-0.5 text-center text-[12px] text-muted-foreground">
        {naira(amount)} &middot; {product.name}
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
    <AppShell title="Review Subscription" navVariant="elevated">
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
                to="/explore/$productId/subscribe"
                params={{ productId: product.id }}
                search={{ amount }}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold text-primary-foreground press"
              >
                <ArrowLeft className="size-3.5" /> Amount
              </Link>
              <span className="shrink-0 rounded-full bg-gold/15 px-2.5 py-1 text-[11px] font-extrabold text-gold">
                {product.rate}
              </span>
            </div>

            <p className="k-rise mt-6 truncate text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary-foreground/60">
              {product.name}
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
              {product.tenor} &middot; matures {maturityDate}
            </p>
          </div>
        </section>

        {/* Sheet */}
        <div className="relative -mx-4 -mt-8 rounded-t-[2rem] bg-background px-4 pt-5 md:mx-0 md:mt-6 md:rounded-none md:bg-transparent md:px-0 md:pt-0">
          <span
            aria-hidden
            className="mx-auto mb-4 block h-1 w-10 rounded-full bg-border md:hidden"
          />

          <div className="space-y-4 md:grid md:grid-cols-[minmax(0,1fr)_360px] md:items-start md:gap-5 md:space-y-0">
            {/* Left column — summary (+ desktop disclosure) */}
            <div className="min-w-0 space-y-4">
              <Rise>
                <section className="card-surface p-4 md:p-6">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Subscription summary
                  </p>
                  <dl className="mt-3 divide-y divide-border text-[13px] md:text-[14px]">
                    <Row label="Product">{product.name}</Row>
                    <Row label="Issuer">{product.issuer}</Row>
                    <Row label="Amount">{naira(amount)}</Row>
                    <Row label="Funding method">
                      <span className="inline-flex items-center gap-1.5">
                        <SourceIcon className="size-3.5 text-gold" />
                        {SOURCE_META[source].label}
                      </span>
                    </Row>
                    {source === "wallet" && (
                      <Row label="Wallet after">
                        {naira(Math.max(WALLET - amount, 0))}
                      </Row>
                    )}
                  </dl>
                </section>
              </Rise>
              <div className="hidden md:block">
                <DisclosureStrip variant="marketplace" />
              </div>
            </div>

            {/* Right rail — terms + confirm */}
            <aside className="min-w-0 space-y-4 md:sticky md:top-6">
              <Rise delay={60}>
                <section className="card-surface p-4 md:p-6">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Expected terms
                  </p>
                  <p className="mt-2 font-display text-[30px] font-extrabold leading-none text-num md:text-[34px]">
                    {naira(payout)}
                  </p>
                  <div className="mt-3 flex divide-x divide-border">
                    <div className="flex-1 pr-4">
                      <p className="text-[11px] font-semibold text-muted-foreground">
                        Expected return
                      </p>
                      <p className="mt-0.5 font-display text-[17px] font-extrabold leading-none text-gold text-num">
                        {naira(interest)}
                      </p>
                    </div>
                    <div className="flex-1 pl-4">
                      <p className="text-[11px] font-semibold text-muted-foreground">
                        Rate &middot; tenor
                      </p>
                      <p className="mt-0.5 text-[15px] font-bold text-foreground">
                        {product.rate} &middot; {product.tenor}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 flex items-start gap-1.5 text-[11px] text-muted-foreground">
                    <Building2 className="mt-0.5 size-3.5 shrink-0" />
                    Indicative until allotted. Paid at maturity to your wallet.
                  </p>
                </section>
              </Rise>

              <div className="md:hidden">
                <DisclosureStrip variant="marketplace" />
              </div>

              <div>
                <button
                  type="button"
                  disabled={!valid}
                  onClick={() => setOpen(true)}
                  className={`inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press ${
                    valid ? "k-glow" : "opacity-40 shadow-none"
                  }`}
                >
                  {valid ? "Confirm subscription" : "Details incomplete"}
                  <ArrowRight className="size-4" strokeWidth={2.6} />
                </button>
                <p className="mt-2.5 flex items-center justify-center gap-1.5 whitespace-nowrap text-[11.5px] text-muted-foreground md:justify-start">
                  <Lock className="size-3.5" /> Authorize with your PIN or biometrics.
                </p>
              </div>
            </aside>
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
            <DrawerTitle className="sr-only">Authorize subscription</DrawerTitle>
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
              <DialogTitle className="sr-only">Authorize subscription</DialogTitle>
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
