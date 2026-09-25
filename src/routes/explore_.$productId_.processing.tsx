import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/kipit/AppShell";
import { fetchPortfolioHolding } from "@/lib/api";
import { naira } from "@/lib/home-data";
import { ensureExploreHydrated, getExploreProduct } from "@/lib/explore-data";

export const Route = createFileRoute("/explore_/$productId_/processing")({
  head: () => ({
    meta: [
      { title: "Processing Subscription | Kipit Marketplace" },
      {
        name: "description",
        content:
          "Hold on while Kipit debits your funding source and confirms your marketplace allotment.",
      },
      { property: "og:title", content: "Processing Subscription | Kipit Marketplace" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    amount: Number(search["amount"]) || 0,
    source:
      search["source"] === "add" || search["source"] === "card"
        ? (search["source"] as "add" | "card")
        : ("wallet" as const),
    placementId: typeof search["placementId"] === "string" ? search["placementId"] : "",
  }),
  loader: async ({ params }) => {
    await ensureExploreHydrated();
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
  const { amount, source, placementId } = Route.useSearch();
  const navigate = useNavigate();
  const [note, setNote] = useState("Submitting your subscription…");

  useEffect(() => {
    let cancelled = false;
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    const goSuccess = () => {
      if (cancelled) return;
      void navigate({
        to: "/explore/$productId/success",
        params: { productId: product.id },
        search: { amount, source, placementId },
        replace: true,
      });
    };

    const run = async () => {
      if (!placementId) {
        await sleep(600);
        if (!cancelled) {
          void navigate({
            to: "/explore/$productId",
            params: { productId: product.id },
            replace: true,
          });
        }
        return;
      }
      for (let attempt = 0; attempt < 20; attempt++) {
        if (cancelled) return;
        try {
          const holding = await fetchPortfolioHolding(placementId);
          if (holding?.id) {
            setNote("Allotment confirmed");
            await sleep(400);
            goSuccess();
            return;
          }
        } catch {
          /* keep polling — subscribe already succeeded */
        }
        if (attempt === 5) setNote("Confirming allotment with the issuer…");
        await sleep(1500);
      }
      // Subscribe debit already succeeded — land on success with placement id even if holding fetch lagged.
      if (!cancelled) {
        void navigate({
          to: "/explore/$productId/success",
          params: { productId: product.id },
          search: { amount, source, placementId },
          replace: true,
        });
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [amount, source, product.id, placementId, navigate]);

  return (
    <AppShell title="Processing" navVariant="elevated">
      <div className="pb-2 md:mx-auto md:w-full md:max-w-[720px]">
        <section className="relative -mx-4 flex min-h-[70svh] flex-col items-center justify-center overflow-hidden bg-brand-gradient px-6 py-16 text-center text-primary-foreground md:mx-0 md:min-h-[60vh] md:rounded-xl md:shadow-float">
          <div className="relative">
            <span className="relative mx-auto grid size-20 place-items-center">
              <span
                aria-hidden
                className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-gold [animation-duration:1.1s]"
              />
              <span className="grid size-14 place-items-center rounded-full bg-gold/15 text-gold">
                <ShieldCheck className="size-7" strokeWidth={2.2} />
              </span>
            </span>

            <p className="mt-7 font-display text-[22px] font-extrabold leading-tight tracking-[-0.02em]">
              {note}
            </p>
            <p className="mt-2 text-[12.5px] text-primary-foreground/65">
              {naira(amount)} &middot; {product.name}. Please don&apos;t close this screen.
            </p>

            <ul className="mx-auto mt-7 w-full max-w-xs space-y-2.5 text-left">
              {STEPS.map((s) => (
                <li
                  key={s}
                  className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-2.5"
                >
                  <span className="size-1.5 shrink-0 rounded-full bg-gold" />
                  <span className="text-[12.5px] font-semibold text-primary-foreground/85">{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
