import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { useEffect } from "react";
import { AppShell } from "@/components/kipit/AppShell";
import { naira } from "@/lib/home-data";
import { getExploreProduct } from "@/lib/explore-data";

export const Route = createFileRoute("/explore_/$productId_/processing")({
  head: () => ({
    meta: [
      { title: "Processing Subscription | Kipit Marketplace" },
      {
        name: "description",
        content:
          "Hold on while Kipit debits your funding source and submits your marketplace subscription order.",
      },
      { property: "og:title", content: "Processing Subscription | Kipit Marketplace" },
      {
        property: "og:description",
        content: "Your Kipit marketplace subscription is being submitted.",
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
  component: SubscriptionProcessingScreen,
});

const STEPS = [
  "Debiting your funding source",
  "Submitting your order",
  "Confirming allotment",
];

function SubscriptionProcessingScreen() {
  const { product } = Route.useLoaderData();
  const { amount, source } = Route.useSearch();
  const navigate = useNavigate();

  useEffect(() => {
    const t = window.setTimeout(() => {
      void navigate({
        to: "/explore/$productId/success",
        params: { productId: product.id },
        search: { amount, source },
        replace: true,
      });
    }, 2600);
    return () => window.clearTimeout(t);
  }, [amount, source, product.id, navigate]);

  return (
    <AppShell title="Processing" navVariant="elevated">
      <div className="pb-2 md:mx-auto md:w-full md:max-w-[720px]">
        <section className="relative -mx-4 flex min-h-[70svh] flex-col items-center justify-center overflow-hidden bg-brand-gradient px-6 py-16 text-center text-primary-foreground md:mx-0 md:min-h-[60vh] md:rounded-xl md:shadow-float">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-gold/20 blur-[64px]"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -left-16 size-72 rounded-full bg-gold/10 blur-[64px]"
          />

          <div className="relative">
            <span className="relative mx-auto grid size-20 place-items-center">
              <span
                aria-hidden
                className="k-success-ring absolute inset-0 rounded-full border-2 border-gold/50"
              />
              <span
                aria-hidden
                className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-gold [animation-duration:1.1s]"
              />
              <span className="grid size-14 place-items-center rounded-full bg-gold/15 text-gold">
                <ShieldCheck className="size-7" strokeWidth={2.2} />
              </span>
            </span>

            <p className="k-success-fade mt-7 font-display text-[22px] font-extrabold leading-tight tracking-[-0.02em]">
              Submitting your subscription…
            </p>
            <p className="k-success-fade mt-2 text-[12.5px] text-primary-foreground/65">
              {naira(amount)} &middot; {product.name}. Please don't close this screen.
            </p>

            <ul className="mx-auto mt-7 w-full max-w-xs space-y-2.5 text-left">
              {STEPS.map((s, i) => (
                <li
                  key={s}
                  className="k-rise flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-2.5"
                  style={{ "--d": `${i * 700}ms` } as React.CSSProperties}
                >
                  <span className="size-1.5 shrink-0 rounded-full bg-gold" />
                  <span className="text-[12.5px] font-semibold text-primary-foreground/85">
                    {s}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
