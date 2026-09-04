import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Minus, Plus, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/kipit/AppShell";
import { Rise } from "@/components/kipit/motion";
import { naira, WALLET } from "@/lib/home-data";
import { EXPLORE_PRODUCTS } from "@/lib/explore-data";

export const Route = createFileRoute("/explore_/$productId_/calculator")({
  loader: ({ params }) => {
    const product = EXPLORE_PRODUCTS.find((p) => p.id === params.productId);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Calculator unavailable | Kipit" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${loaderData.product.name} Calculator | Kipit`;
    const description = `Estimate interest and payout for ${loaderData.product.name} at ${loaderData.product.rate} over ${loaderData.product.tenor}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ProductCalculatorScreen,
  notFoundComponent: CalcNotFound,
});

const DAY_MS = 86_400_000;
const num = (value: string) => Number(value.replace(/[^0-9.]/g, "")) || 0;

function ProductCalculatorScreen() {
  const { product: p } = Route.useLoaderData();
  const step = Math.max(p.minimum, 50_000);
  const [input, setInput] = useState(p.minimum.toLocaleString("en-NG"));

  const amount = Number(input.replace(/[^0-9]/g, "")) || 0;
  const rate = num(p.rate);
  const days = p.tenor === "Open-ended" ? 365 : num(p.tenor) || 365;

  const { interest, payout, monthly } = useMemo(() => {
    const gross = Math.round(amount * (rate / 100) * (days / 365));
    return {
      interest: gross,
      payout: amount + gross,
      monthly: Math.round((amount * (rate / 100)) / 12),
    };
  }, [amount, rate, days]);

  const belowMin = amount > 0 && amount < p.minimum;
  const overWallet = amount > WALLET;
  const maturity = new Date(Date.now() + days * DAY_MS).toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const setAmount = (value: number) =>
    setInput(Math.max(0, value).toLocaleString("en-NG"));

  const handleInput = (value: string) => {
    const digits = value.replace(/[^0-9]/g, "");
    setInput(digits ? Number(digits).toLocaleString("en-NG") : "");
  };

  return (
    <AppShell title="Calculator" navVariant="elevated">
      <div className="pb-2">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-16 pt-6 text-primary-foreground md:mx-0 md:rounded-xl md:px-8 md:pb-16 md:pt-8 md:shadow-float">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-32 size-72 rounded-full bg-gold/15 blur-[64px]"
          />
          <div className="relative md:max-w-3xl">
            <Link
              to="/explore/$productId"
              params={{ productId: p.id }}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold press"
            >
              <ArrowLeft className="size-3.5" /> {p.name}
            </Link>
            <h1 className="mt-5 font-display text-[26px] font-extrabold leading-tight tracking-[-0.02em] md:text-[32px]">
              Estimate your return
            </h1>
            <p className="mt-2 text-[12.5px] font-medium text-primary-foreground/65">
              {p.rate} · {p.tenor} · min {naira(p.minimum)}
            </p>
          </div>
        </section>

        {/* ── Sheet ────────────────────────────────────────────── */}
        <div className="relative -mx-4 -mt-10 rounded-t-[2rem] bg-background px-4 pt-5 md:mx-0 md:mt-6 md:grid md:grid-cols-[minmax(0,1fr)_380px] md:items-start md:gap-x-5 md:gap-y-4 md:rounded-none md:bg-transparent md:px-0 md:pt-0">
          <span
            aria-hidden
            className="mx-auto mb-4 block h-1 w-10 rounded-full bg-border md:hidden"
          />

          {/* Amount stepper */}
          <Rise className="md:col-start-1 md:row-start-1">
            <section className="card-surface p-4 md:p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Amount to invest
              </p>
              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Decrease amount"
                  onClick={() => setAmount(amount - step)}
                  className="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-card press"
                >
                  <Minus className="size-4" />
                </button>
                <input
                  type="text"
                  inputMode="numeric"
                  aria-label="Investment amount"
                  value={input}
                  onChange={(e) => handleInput(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  className="min-w-0 flex-1 bg-transparent text-center font-display text-[28px] font-extrabold leading-none tracking-[-0.02em] text-num outline-none"
                />
                <button
                  type="button"
                  aria-label="Increase amount"
                  onClick={() => setAmount(amount + step)}
                  className="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-card press"
                >
                  <Plus className="size-4" />
                </button>
              </div>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {[1, 2, 5, 10].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setAmount(p.minimum * m)}
                    className="rounded-full border border-border bg-card px-3 py-1.5 text-[11.5px] font-bold press"
                  >
                    {naira(p.minimum * m)}
                  </button>
                ))}
              </div>
              {belowMin && (
                <p className="mt-3 rounded-xl bg-destructive/10 px-3 py-2.5 text-[11.5px] font-semibold text-destructive">
                  Minimum investment is {naira(p.minimum)}.
                </p>
              )}
              {overWallet && (
                <p className="mt-2.5 rounded-xl bg-gold/10 px-3 py-2.5 text-[11.5px] font-semibold text-foreground">
                  You'd need to add {naira(amount - WALLET)} to your wallet to invest this much.
                </p>
              )}
            </section>
          </Rise>

          {/* Projection */}
          <Rise delay={60} className="md:col-start-2 md:row-start-1 md:row-span-2">
            <section className="relative mt-4 overflow-hidden rounded-xl bg-primary p-5 text-primary-foreground shadow-float md:mt-0 md:p-6">
              <span
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-20 size-52 rounded-full bg-gold/20 blur-[52px]"
              />
              <div className="relative">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary-foreground/60">
                  Projected payout on {maturity}
                </p>
                <p className="mt-2 font-display text-[34px] font-extrabold leading-none tracking-[-0.03em] text-num">
                  {naira(payout)}
                </p>
                <div className="mt-4 grid grid-cols-3 gap-3 border-t border-white/10 pt-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-primary-foreground/55">
                      Interest
                    </p>
                    <p className="mt-1 text-[14px] font-extrabold text-gold text-num">
                      {naira(interest)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-primary-foreground/55">
                      Per month
                    </p>
                    <p className="mt-1 text-[14px] font-extrabold text-num">{naira(monthly)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-primary-foreground/55">
                      Tenor
                    </p>
                    <p className="mt-1 text-[14px] font-extrabold text-num">{days} days</p>
                  </div>
                </div>
              </div>
            </section>
          </Rise>

          {/* Breakdown */}
          <Rise delay={120} className="md:col-start-1 md:row-start-2">
            <section className="mt-4 card-surface p-4 md:mt-0 md:p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                How this is calculated
              </p>
              <ul className="mt-3 space-y-2 text-[12.5px]">
                {[
                  ["Principal", naira(amount)],
                  ["Rate", p.rate],
                  ["Tenor", p.tenor],
                  ["Gross interest", naira(interest)],
                  ["Payout at maturity", naira(payout)],
                ].map(([k, v]) => (
                  <li
                    key={k}
                    className="flex items-center justify-between border-b border-border/50 pb-2 last:border-0 last:pb-0"
                  >
                    <span className="text-muted-foreground">{k}</span>
                    <span className="font-extrabold text-num">{v}</span>
                  </li>
                ))}
              </ul>
            </section>
          </Rise>

          {/* CTA */}
          <Rise delay={180} className="md:col-start-1 md:row-start-3">
            <div className="mt-5 space-y-2.5 md:mt-0">
              <Link
                to="/explore/$productId/subscribe"
                params={{ productId: p.id }}
                search={{ amount: amount || undefined }}
                className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[14px] font-extrabold press ${
                  p.availability === "closed"
                    ? "pointer-events-none bg-muted text-muted-foreground"
                    : "bg-primary text-gold"
                }`}
              >
                <TrendingUp className="size-4" />
                {p.availability === "closed" ? "Fully subscribed" : `Invest ${naira(amount)}`}
              </Link>
              <p className="pt-1 text-center text-[11px] leading-relaxed text-muted-foreground">
                Indicative estimate using simple interest. Actual returns depend on the allocation
                rate at settlement. Capital is at risk.
              </p>
            </div>
          </Rise>
        </div>
      </div>
    </AppShell>
  );
}

function CalcNotFound() {
  return (
    <AppShell title="Calculator" navVariant="elevated">
      <div className="px-1 py-10 text-center">
        <h1 className="font-display text-[20px] font-extrabold">Product not found</h1>
        <Link
          to="/explore"
          className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-[13.5px] font-extrabold text-gold press"
        >
          Back to Explore
        </Link>
      </div>
    </AppShell>
  );
}
