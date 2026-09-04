import { KycGuard } from "@/components/kipit/KycGate";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CreditCard,
  Plus,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/kipit/AppShell";
import { DisclosureStrip } from "@/components/kipit/DisclosureStrip";
import { Rise, useCountUp } from "@/components/kipit/motion";
import { naira, WALLET } from "@/lib/home-data";
import { getExploreProduct } from "@/lib/explore-data";

export const Route = createFileRoute("/explore_/$productId_/subscribe")({
  head: () => ({
    meta: [
      { title: "Subscribe to Product | Kipit" },
      {
        name: "description",
        content:
          "Enter your subscription amount, check your wallet balance and pick a funding source for your Kipit marketplace investment.",
      },
      { property: "og:title", content: "Subscribe to Product | Kipit" },
      {
        property: "og:description",
        content:
          "Set your amount and funding source to subscribe to a Kipit marketplace investment.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    amount:
      search['amount'] !== undefined && search['amount'] !== null
        ? Number(search['amount']) || undefined
        : undefined,
  }),
  loader: ({ params }) => {
    const product = getExploreProduct(params.productId);
    if (!product) throw notFound();
    return { product };
  },
  component: () => (
    <KycGuard required={1}>
      <SubscribeScreen />
    </KycGuard>
  ),
});

type Source = "wallet" | "add" | "card";

function SubscribeScreen() {
  const { product } = Route.useLoaderData();
  const { amount: initialAmount } = Route.useSearch();
  const [raw, setRaw] = useState(
    String(initialAmount && initialAmount > 0 ? initialAmount : product.minimum),
  );
  const [source, setSource] = useState<Source>("wallet");

  const amount = Number(raw.replace(/[^0-9]/g, "")) || 0;
  const belowMin = amount > 0 && amount < product.minimum;
  const shortfall = Math.max(0, amount - WALLET);
  const walletShort = shortfall > 0;
  const closed = product.availability === "closed";
  const valid =
    amount > 0 && !belowMin && !closed && (!walletShort || source !== "wallet");

  const ratePct = Number(product.rate.match(/[\d.]+/)?.[0]) || 0;
  const days = Number(product.tenor.match(/\d+/)?.[0]) || 365;
  const interest = Math.round((amount * (ratePct / 100) * days) / 365);
  const expected = useCountUp(amount + interest, 500);
  const earn = useCountUp(interest, 500);

  const quick = [product.minimum, product.minimum * 2, product.minimum * 5];

  return (
    <AppShell title="Subscribe" navVariant="elevated">
      <div className="pb-2">
        {/* Hero: amount entry */}
        <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-14 pt-6 text-primary-foreground md:mx-0 md:rounded-xl md:px-8 md:pb-14 md:pt-8 md:shadow-float">
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
                to="/explore/$productId"
                params={{ productId: product.id }}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold text-primary-foreground press"
              >
                <ArrowLeft className="size-3.5" /> Product
              </Link>
              <span className="shrink-0 rounded-full bg-gold/15 px-2.5 py-1 text-[11px] font-extrabold text-gold">
                {product.rate}
              </span>
            </div>

            <p className="mt-6 truncate text-[13px] font-bold text-primary-foreground/85">
              {product.name}
            </p>
            <p className="mt-0.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary-foreground/55">
              Amount to invest
            </p>

            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="font-display text-[40px] font-extrabold leading-none text-primary-foreground/60 md:text-[48px]">
                ₦
              </span>
              <input
                inputMode="numeric"
                autoComplete="off"
                aria-label="Amount to invest"
                placeholder="0"
                value={amount ? amount.toLocaleString("en-NG") : ""}
                onChange={(e) => setRaw(e.target.value)}
                className="w-full bg-transparent font-display text-[40px] font-extrabold leading-none tracking-[-0.035em] text-num text-primary-foreground outline-none placeholder:text-primary-foreground/25 md:text-[48px]"
              />
            </div>

            <p className="mt-3 flex items-center gap-1.5 text-[12px] font-medium text-primary-foreground/60">
              <ShieldCheck className="size-3.5 text-primary-foreground/70" />
              Minimum {naira(product.minimum)} &middot; {product.tenor}
            </p>

            <div className="mt-5 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {quick.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setRaw(String(q))}
                  className={`shrink-0 flex-1 rounded-full border px-3 py-2 text-[12px] font-bold transition-transform duration-150 press ${
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
                className="shrink-0 flex-1 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-[12px] font-bold text-primary-foreground/90 press"
              >
                Max
              </button>
            </div>
          </div>
        </section>

        {/* Sheet */}
        <div className="relative -mx-4 -mt-8 rounded-t-[2rem] bg-background px-4 pt-5 md:mx-0 md:mt-6 md:rounded-none md:bg-transparent md:px-0 md:pt-0">
          <span
            aria-hidden
            className="mx-auto mb-4 block h-1 w-10 rounded-full bg-border md:hidden"
          />

          <div className="space-y-4 md:grid md:grid-cols-[minmax(0,1fr)_360px] md:items-start md:gap-6 md:space-y-0">
            {/* Funding source */}
            <Rise>
              <section className="card-surface p-4 md:p-5">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Funding source
                  </p>
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    Wallet {naira(WALLET)}
                  </span>
                </div>

                <div className="mt-3 space-y-2">
                  <SourceRow
                    active={source === "wallet"}
                    onSelect={() => setSource("wallet")}
                    icon={<Wallet className="size-5" strokeWidth={2.2} />}
                    title="Kipit Wallet"
                    sub={
                      walletShort
                        ? `Short by ${naira(shortfall)}`
                        : `Available ${naira(WALLET)}`
                    }
                    warn={walletShort}
                  />

                  {walletShort && (
                    <>
                      <SourceRow
                        active={source === "add"}
                        onSelect={() => setSource("add")}
                        icon={<Plus className="size-5" strokeWidth={2.4} />}
                        title="Add money to wallet"
                        sub={`Top up ${naira(shortfall)} by transfer`}
                      />
                      <SourceRow
                        active={source === "card"}
                        onSelect={() => setSource("card")}
                        icon={<CreditCard className="size-5" strokeWidth={2.2} />}
                        title="Pay with card"
                        sub="Card or bank via Paystack"
                      />
                    </>
                  )}
                </div>

                {(belowMin || (walletShort && source === "wallet")) && (
                  <p className="k-shake mt-3 rounded-lg bg-destructive/10 px-3 py-2.5 text-[12px] font-semibold text-destructive">
                    {belowMin
                      ? `Minimum for this product is ${naira(product.minimum)}.`
                      : `Wallet is short by ${naira(shortfall)}. Add money or pay with card.`}
                  </p>
                )}
              </section>
            </Rise>

            {/* Expected value */}
            <Rise delay={80} className="md:sticky md:top-6">
              <section className="relative overflow-hidden rounded-xl bg-brand-gradient p-4 text-primary-foreground shadow-float md:p-6">
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-16 -top-20 size-48 rounded-full bg-gold/20 blur-[48px]"
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute -bottom-20 -left-12 size-40 rounded-full bg-white/10 blur-[40px]"
                />

                <div className="relative">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary-foreground/60">
                    Expected at maturity
                  </p>
                  <p className="mt-1.5 font-display text-[30px] font-extrabold leading-none tracking-[-0.02em] text-gold text-num">
                    {naira(expected)}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2.5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-primary-foreground/55">
                        Expected return
                      </p>
                      <p className="mt-1 font-display text-[16px] font-extrabold leading-none text-gold text-num">
                        +{naira(earn)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2.5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-primary-foreground/55">
                        Rate &middot; tenor
                      </p>
                      <p className="mt-1 whitespace-nowrap text-[13px] font-bold text-primary-foreground text-num">
                        {product.rate} &middot; {product.tenor}
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 flex items-start gap-1.5 border-t border-white/10 pt-2.5 text-[11px] text-primary-foreground/60">
                    <Building2 className="mt-0.5 size-3.5 shrink-0" />
                    {product.issuer} &middot; indicative until allotted. Paid at maturity to your wallet.
                  </p>

                  {/* Desktop CTA lives in the sticky rail */}
                  <div className="mt-5 hidden md:block">
                    <Link
                      to="/explore/$productId/review"
                      params={{ productId: product.id }}
                      search={{ amount, source }}
                      disabled={!valid}
                      className={`flex w-full items-center justify-center gap-2 rounded-xl bg-gold-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-gold-foreground shadow-float press ${
                        valid ? "" : "pointer-events-none opacity-40 shadow-none"
                      }`}
                    >
                      {closed ? "Fully subscribed" : "Continue"}
                      {!closed && <ArrowRight className="size-4" strokeWidth={2.6} />}
                    </Link>
                    <p className="mt-2.5 text-[11.5px] text-primary-foreground/60">
                      Review product, amount and funding method before confirming.
                    </p>
                  </div>
                </div>
              </section>
            </Rise>
          </div>

          <DisclosureStrip variant="marketplace" />

          {/* CTA (mobile) */}
          <div className="sticky bottom-[calc(5.5rem+env(safe-area-inset-bottom)+0.75rem)] z-30 mt-5 md:hidden">
            <Link
              to="/explore/$productId/review"
              params={{ productId: product.id }}
              search={{ amount, source }}
              disabled={!valid}
              className={`flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press md:w-auto md:px-10 ${
                valid ? "" : "pointer-events-none opacity-40 shadow-none"
              }`}
            >
              {closed ? "Fully subscribed" : "Continue"}
              {!closed && <ArrowRight className="size-4" strokeWidth={2.6} />}
            </Link>
            <p className="mt-2.5 whitespace-nowrap text-center text-[11.5px] text-muted-foreground md:text-left">
              Review product, amount and funding method before confirming.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function SourceRow({
  active,
  onSelect,
  icon,
  title,
  sub,
  warn,
}: {
  active: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  title: string;
  sub: string;
  warn?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left press ${
        active ? "border-gold bg-gold/5" : "border-border bg-card"
      }`}
    >
      <span
        className={`grid size-10 shrink-0 place-items-center rounded-lg ${
          active ? "bg-gold/15 text-gold" : "bg-muted text-muted-foreground"
        }`}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13.5px] font-bold text-foreground">{title}</span>
        <span
          className={`block text-[12px] ${
            warn ? "font-semibold text-destructive" : "text-muted-foreground"
          }`}
        >
          {sub}
        </span>
      </span>
      {active && (
        <span className="grid size-5 shrink-0 place-items-center rounded-full bg-gold text-gold-foreground">
          <Check className="size-3.5" strokeWidth={3} />
        </span>
      )}
    </button>
  );
}
