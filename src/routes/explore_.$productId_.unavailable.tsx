import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, BellRing, Check, Clock, Lock } from "lucide-react";
import { AppShell } from "@/components/kipit/AppShell";
import { DisclosureStrip } from "@/components/kipit/DisclosureStrip";
import { Rise } from "@/components/kipit/motion";
import { naira } from "@/lib/home-data";
import { getExploreProduct } from "@/lib/explore-data";

export const Route = createFileRoute("/explore_/$productId_/unavailable")({
  head: () => ({
    meta: [
      { title: "Product Unavailable | Kipit Marketplace" },
      {
        name: "description",
        content:
          "This Kipit marketplace product is fully subscribed. Get notified when the next allocation window opens.",
      },
      { property: "og:title", content: "Product Unavailable | Kipit Marketplace" },
      {
        property: "og:description",
        content: "This offer is closed for now — ask Kipit to notify you when it reopens.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ params }) => {
    const product = getExploreProduct(params.productId);
    if (!product) throw notFound();
    return { product };
  },
  component: ProductUnavailableScreen,
});

function ProductUnavailableScreen() {
  const { product } = Route.useLoaderData();
  const [notified, setNotified] = useState(false);

  return (
    <AppShell title="Unavailable" navVariant="elevated">
      <div className="pb-2">
        <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-16 pt-10 text-center text-primary-foreground md:mx-0 md:rounded-xl md:px-8 md:shadow-float">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-32 size-72 rounded-full bg-gold/15 blur-[64px]"
          />
          <div className="relative">
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-white/10 text-gold ring-1 ring-white/15">
              <Lock className="size-7" strokeWidth={2.2} />
            </span>
            <p className="mt-5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary-foreground/60">
              Currently unavailable
            </p>
            <h1 className="mt-2 font-display text-[26px] font-extrabold leading-tight tracking-[-0.02em] md:text-[32px]">
              {product.name}
            </h1>
            <p className="mt-2 text-[12.5px] font-medium text-primary-foreground/70">
              {product.issuer} &middot; {product.category}
            </p>
          </div>
        </section>

        <div className="relative -mx-4 -mt-8 rounded-t-[2rem] bg-background px-4 pt-5 md:mx-0 md:mt-6 md:rounded-none md:bg-transparent md:px-0 md:pt-0">
          <span
            aria-hidden
            className="mx-auto mb-4 block h-1 w-10 rounded-full bg-border md:hidden"
          />

          <Rise>
            <section className="card-surface p-4 md:p-5">
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                This product is currently unavailable. The allocation window has closed
                and no new subscriptions are being accepted by the issuer.
              </p>
              <dl className="mt-4 divide-y divide-border text-[13px]">
                <Row label="Status">
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-extrabold text-muted-foreground">
                    {product.closes}
                  </span>
                </Row>
                <Row label="Last offered rate">
                  <span className="text-gold-strong">{product.rate}</span>
                </Row>
                <Row label="Tenor">{product.tenor}</Row>
                <Row label="Minimum">{naira(product.minimum)}</Row>
              </dl>
              <p className="mt-3 flex items-start gap-1.5 text-[11px] text-muted-foreground">
                <Clock className="mt-0.5 size-3.5 shrink-0" />
                Reopening dates are set by the issuer and are not guaranteed.
              </p>
            </section>
          </Rise>

          <Rise delay={60}>
            <button
              type="button"
              onClick={() => setNotified(true)}
              className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-[13.5px] font-extrabold press ${
                notified
                  ? "border border-border bg-card text-emerald-600"
                  : "bg-brand-gradient text-primary-foreground shadow-float"
              }`}
            >
              {notified ? (
                <>
                  <Check className="size-4" strokeWidth={3} />
                  We&apos;ll notify you when it reopens
                </>
              ) : (
                <>
                  <BellRing className="size-4" strokeWidth={2.6} />
                  Notify me
                </>
              )}
            </button>
          </Rise>

          <DisclosureStrip variant="marketplace" />

          <div className="mt-4 flex flex-col gap-2.5 md:flex-row">
            <Link
              to="/explore"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3.5 text-[13.5px] font-bold text-foreground press md:w-auto md:px-8"
            >
              Browse other products <ArrowRight className="size-4" strokeWidth={2.6} />
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
