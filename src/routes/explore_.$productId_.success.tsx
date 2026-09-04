import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, Building2, CreditCard, Plus, Wallet } from "lucide-react";
import { AppShell } from "@/components/kipit/AppShell";
import { DisclosureStrip } from "@/components/kipit/DisclosureStrip";
import { naira } from "@/lib/home-data";
import { getExploreProduct } from "@/lib/explore-data";

export const Route = createFileRoute("/explore_/$productId_/success")({
  head: () => ({
    meta: [
      { title: "Subscription Confirmed | Kipit Marketplace" },
      {
        name: "description",
        content:
          "Your Kipit marketplace subscription is confirmed — see your amount, transaction reference and portfolio destination.",
      },
      { property: "og:title", content: "Subscription Confirmed | Kipit Marketplace" },
      {
        property: "og:description",
        content: "Your marketplace investment has been added to your Kipit portfolio.",
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
  component: SubscriptionSuccessScreen,
});

const DAY_MS = 86_400_000;

const SOURCE_META = {
  wallet: { label: "Kipit Wallet", icon: Wallet },
  add: { label: "Wallet top-up (transfer)", icon: Plus },
  card: { label: "Card or bank via Paystack", icon: CreditCard },
} as const;

function SubscriptionSuccessScreen() {
  const { product } = Route.useLoaderData();
  const { amount, source } = Route.useSearch();

  const ratePct = Number(product.rate.match(/[\d.]+/)?.[0]) || 0;
  const days = Number(product.tenor.match(/\d+/)?.[0]) || 365;
  const interest = Math.round((amount * (ratePct / 100) * days) / 365);
  const payout = amount + interest;
  const maturityDate = new Date(Date.now() + days * DAY_MS).toLocaleDateString(
    "en-NG",
    { day: "2-digit", month: "short", year: "numeric" },
  );
  const reference = `KPT-MP-${String(Math.abs(amount + days) % 100000).padStart(5, "0")}`;
  const SourceIcon = SOURCE_META[source].icon;

  return (
    <AppShell title="Subscription Confirmed" navVariant="elevated">
      <div className="pb-2 md:mx-auto md:max-w-4xl">
        <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-16 pt-10 text-center text-primary-foreground md:mx-0 md:rounded-xl md:px-8 md:shadow-float">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-32 size-72 rounded-full bg-gold/20 blur-[64px]"
          />
          <div className="relative">
            <span className="relative mx-auto grid size-16 place-items-center">
              <span
                aria-hidden
                className="k-success-ring absolute inset-0 rounded-full border-2 border-gold"
              />
              <span className="k-success-pop grid size-16 place-items-center rounded-full bg-gold text-gold-foreground shadow-float">
                <svg viewBox="0 0 24 24" className="size-8" fill="none" aria-hidden>
                  <path
                    d="M5 12.5l4.5 4.5L19 7.5"
                    stroke="currentColor"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="k-success-check"
                  />
                </svg>
              </span>
            </span>
            <p className="k-success-fade mt-5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary-foreground/60">
              Subscription confirmed
            </p>
            <p className="k-success-fade mt-2 font-display text-[38px] font-extrabold leading-none tracking-[-0.035em] text-num md:text-[46px]">
              {naira(amount)}
            </p>
            <p className="k-success-fade mt-3 text-[12.5px] font-medium text-primary-foreground/70">
              {product.name} &middot; {product.rate}
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
                Transaction details
              </p>
              <dl className="mt-3 divide-y divide-border text-[13px]">
                <Row label="Reference">{reference}</Row>
                <Row label="Product">{product.name}</Row>
                <Row label="Issuer">{product.issuer}</Row>
                <Row label="Funded from">
                  <span className="inline-flex items-center gap-1.5">
                    <SourceIcon className="size-3.5 text-gold" />
                    {SOURCE_META[source].label}
                  </span>
                </Row>
                <Row label="Goes to">Portfolio &middot; {product.category}</Row>
                <Row label="Status">
                  <span className="rounded-full bg-emerald-500/12 px-2 py-0.5 text-[11px] font-extrabold text-emerald-600">
                    Allotted
                  </span>
                </Row>
              </dl>
            </section>

            <section className="card-surface p-4 md:p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Expected at maturity
              </p>
              <p className="mt-2 font-display text-[30px] font-extrabold leading-none text-num">
                {naira(payout)}
              </p>
              <p className="mt-2 text-[12px] font-semibold text-emerald-600">
                +{naira(interest)} return by {maturityDate}
              </p>
              <p className="mt-3 flex items-start gap-1.5 text-[11px] text-muted-foreground">
                <Building2 className="mt-0.5 size-3.5 shrink-0" />
                Indicative. Final value confirmed on allotment by the issuer.
              </p>
            </section>
          </div>

          <DisclosureStrip variant="marketplace" />

          <div className="mt-5 flex flex-col gap-2.5 md:flex-row">
            <Link
              to="/portfolio"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press md:w-auto md:px-10"
            >
              View in portfolio <ArrowRight className="size-4" strokeWidth={2.6} />
            </Link>
            <Link
              to="/explore"
              className="inline-flex w-full items-center justify-center rounded-xl border border-border bg-card px-5 py-3.5 text-[13.5px] font-bold text-foreground press md:w-auto md:px-8"
            >
              Back to Explore
            </Link>
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
      <dd className="text-right font-bold text-foreground">{children}</dd>
    </div>
  );
}
