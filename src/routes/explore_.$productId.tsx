import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Clock3,
  FileText,
  Info,
  Minus,
  Plus,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/kipit/AppShell";
import { DisclosureStrip } from "@/components/kipit/DisclosureStrip";
import { Rise } from "@/components/kipit/motion";
import {
  AVAILABILITY_LABEL,
  getExploreProduct,
  getProductDetail,
} from "@/lib/explore-data";
import { naira, WALLET } from "@/lib/home-data";

export const Route = createFileRoute("/explore_/$productId")({
  loader: ({ params }) => {
    const product = getExploreProduct(params.productId);
    if (!product) throw notFound();
    return { product, detail: getProductDetail(product) };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Product unavailable | Kipit" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { product } = loaderData;
    const title = `${product.name} — ${product.rate} | Kipit`;
    const description = `${product.issuer}. ${product.rate} over ${product.tenor}, from ${naira(product.minimum)} on the Kipit marketplace.`;
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
  notFoundComponent: ProductNotFound,
  component: ProductDetailScreen,
});

function ProductNotFound() {
  return (
    <AppShell title="Explore" navVariant="elevated">
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <h1 className="font-display text-xl font-extrabold">Product unavailable</h1>
        <p className="mt-2 max-w-xs text-[13px] text-muted-foreground">
          This offer may have closed. Browse the marketplace for what's open now.
        </p>
        <Link
          to="/explore"
          className="mt-5 rounded-full bg-brand-gradient px-5 py-2.5 text-[12.5px] font-extrabold text-primary-foreground press"
        >
          Back to Explore
        </Link>
      </div>
    </AppShell>
  );
}

function ProductDetailScreen() {
  const { product: p, detail } = Route.useLoaderData();
  const [amount, setAmount] = useState(p.minimum);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const closed = p.availability === "closed";
  const ratePct = Number(p.rate.match(/[\d.]+/)?.[0]) || 0;
  const days = Number(p.tenor.replace(/[^0-9]/g, "")) || 365;
  const estimate = Math.round((amount * (ratePct / 100) * days) / 365);
  const belowMin = amount < p.minimum;
  const overWallet = amount > WALLET;

  const tone =
    p.availability === "open"
      ? "bg-emerald-500/15 text-emerald-300"
      : p.availability === "closing"
        ? "bg-gold/20 text-gold"
        : "bg-white/10 text-primary-foreground/70";

  const step = Math.max(p.minimum / 2, 50_000);

  return (
    <AppShell title="Product" navVariant="elevated">
      <div className="pb-2">
        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-14 pt-6 text-primary-foreground md:mx-0 md:rounded-2xl md:px-8 md:pb-14 md:pt-8 md:shadow-float">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-28 size-72 rounded-full bg-gold/20 blur-[64px]"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-28 -left-20 size-64 rounded-full bg-white/10 blur-[56px]"
          />

          <div className="relative md:max-w-3xl">
            <div className="flex items-center justify-between gap-3">
              <Link
                to="/explore"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold press"
              >
                <ArrowLeft className="size-3.5" /> Explore
              </Link>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-[10.5px] font-extrabold ${tone}`}
              >
                {AVAILABILITY_LABEL[p.availability]}
              </span>
            </div>

            <span className="mt-6 inline-block rounded-full bg-white/12 px-2.5 py-1 text-[9.5px] font-extrabold uppercase tracking-[0.14em] text-primary-foreground/80">
              {p.category}
            </span>
            <h1 className="mt-3 font-display text-[26px] font-extrabold leading-[1.1] tracking-[-0.03em] md:text-[32px]">
              {p.name}
            </h1>
            <p className="mt-1.5 text-[12.5px] text-primary-foreground/65">{p.issuer}</p>

            <p className="mt-6 text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary-foreground/55">
              Rate p.a.
            </p>
            <p className="font-display text-[42px] font-extrabold leading-none tracking-[-0.035em] text-gold text-num md:text-[48px]">
              {p.rate.replace(" p.a.", "")}
            </p>

            <p className="mt-4 inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-gold">
              <Clock3 className="size-3.5" /> {p.closes}
            </p>
          </div>
        </section>

        {/* ── Sheet ────────────────────────────────────────── */}
        <div className="relative -mx-4 -mt-8 rounded-t-[2rem] bg-background px-4 pt-5 md:mx-0 md:mt-6 md:rounded-none md:bg-transparent md:px-0 md:pt-0">
          <span
            aria-hidden
            className="mx-auto mb-4 block h-1 w-10 rounded-full bg-border md:hidden"
          />

          {/* Key terms */}
          <Rise>
            <section className="card-surface overflow-hidden p-0">
              <div className="grid grid-cols-2 divide-x divide-y divide-border/70">
                {detail.highlights.map((h) => {
                  const isRate = h.label === "Rate";
                  const [head, ...rest] = h.value.split(" ");
                  const unit = rest.join(" ");
                  return (
                    <div key={h.label} className="flex flex-col justify-center p-5">
                      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/80">
                        {h.label}
                      </span>
                      <div className="mt-1.5 flex items-baseline gap-1">
                        <span
                          className={`font-display font-extrabold tracking-[-0.02em] text-num ${
                            isRate ? "text-[24px] text-gold" : "text-[20px] text-foreground"
                          }`}
                        >
                          {head}
                        </span>
                        {unit ? (
                          <span
                            className={`text-[11px] font-bold uppercase ${
                              isRate ? "text-gold/80" : "text-muted-foreground/70"
                            }`}
                          >
                            {unit}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </Rise>

          {/* Estimate calculator */}
          <Rise delay={60}>
            <section className="mt-4 card-surface p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Estimate your return
              </p>
              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Decrease amount"
                  onClick={() => setAmount((a) => Math.max(p.minimum, a - step))}
                  className="grid size-10 shrink-0 place-items-center rounded-2xl border border-border bg-card press"
                >
                  <Minus className="size-4" />
                </button>
                <div className="min-w-0 flex-1 text-center">
                  <p className="font-display text-[24px] font-extrabold leading-none tracking-[-0.02em] text-num">
                    {naira(amount)}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Minimum {naira(p.minimum)}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Increase amount"
                  onClick={() => setAmount((a) => a + step)}
                  className="grid size-10 shrink-0 place-items-center rounded-2xl border border-border bg-card press"
                >
                  <Plus className="size-4" />
                </button>
              </div>

              <div className="mt-4 rounded-2xl bg-muted/60 p-3.5">
                <p className="text-[11px] text-muted-foreground">
                  Estimated interest over {p.tenor === "Open-ended" ? "12 months" : p.tenor}
                </p>
                <p className="mt-1 font-display text-[22px] font-extrabold leading-none text-num text-foreground">
                  {naira(estimate)}
                </p>
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  Payout {naira(amount + estimate)} · indicative only
                </p>
              </div>

              <div className="mt-3 flex items-center gap-2.5 rounded-2xl border border-border/60 px-3 py-2.5">
                <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold">
                  <Wallet className="size-4" />
                </span>
                <p className="text-[11.5px] text-muted-foreground">
                  Wallet available <span className="font-bold text-foreground">{naira(WALLET)}</span>
                </p>
              </div>

              {overWallet && (
                <p className="mt-2.5 rounded-2xl bg-destructive/10 px-3 py-2.5 text-[11.5px] font-semibold text-destructive">
                  Insufficient wallet balance — add {naira(amount - WALLET)} to continue.
                </p>
              )}
              {belowMin && (
                <p className="mt-2.5 rounded-2xl bg-destructive/10 px-3 py-2.5 text-[11.5px] font-semibold text-destructive">
                  Minimum investment is {naira(p.minimum)}.
                </p>
              )}
            </section>
          </Rise>

          {/* About */}
          <Rise delay={100}>
            <section className="mt-4 card-surface overflow-hidden p-0">
              <div className="h-1 w-full bg-gold" />
              <div className="p-5 md:p-6">
                <h2 className="font-display text-[17px] font-extrabold tracking-tight">
                  About this product
                </h2>
                <p className="mt-2.5 text-[13px] leading-relaxed text-muted-foreground">
                  {detail.about}
                </p>
                <ul className="mt-5 space-y-4">
                  {detail.how.map((h) => (
                    <li key={h} className="flex items-start gap-3.5">
                      <span className="mt-[5px] size-2 shrink-0 rotate-45 bg-gold" />
                      <span className="text-[13px] font-medium leading-snug text-foreground">
                        {h}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </Rise>

          {/* Risks */}
          <Rise delay={140}>
            <section className="mt-4 overflow-hidden rounded-2xl bg-brand-gradient p-4 text-primary-foreground shadow-float">
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-2xl bg-gold/15 text-gold">
                  <ShieldCheck className="size-4.5" />
                </span>
                <h2 className="font-display text-[15px] font-extrabold">Risks to know</h2>
              </div>
              <ul className="mt-3 space-y-2.5">
                {detail.risks.map((r) => (
                  <li key={r} className="flex gap-2.5">
                    <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-gold" />
                    <span className="text-[12px] leading-relaxed text-primary-foreground/75">
                      {r}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </Rise>

          {/* Documents */}
          <Rise delay={180}>
            <section className="mt-5">
              <div className="flex items-center gap-2 px-1">
                <span className="h-px w-4 bg-gold" />
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
                  Documents
                </p>
              </div>
              <div className="mt-3 space-y-2.5">
                {detail.documents.map((d) => (
                  <button
                    key={d.name}
                    type="button"
                    className="group flex w-full items-center gap-3.5 rounded-xl border border-border bg-card p-3.5 text-left shadow-sm transition-all duration-300 press hover:border-gold"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/5 text-gold transition-colors group-hover:bg-gold group-hover:text-primary-foreground">
                      <FileText className="size-5" strokeWidth={1.5} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-display text-[15px] font-semibold leading-tight">
                        {d.name}
                      </span>
                      <span className="mt-0.5 block text-[11px] font-medium text-muted-foreground">
                        {d.meta}
                      </span>
                    </span>
                    <ChevronRight className="size-5 shrink-0 text-gold transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                ))}
              </div>
            </section>
          </Rise>

          {/* FAQs */}
          <Rise delay={220}>
            <section className="mt-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Questions
              </p>
              <div className="mt-2.5 divide-y divide-border rounded-2xl border border-border bg-card">
                {detail.faqs.map((f, i) => (
                  <div key={f.q}>
                    <button
                      type="button"
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left"
                      aria-expanded={openFaq === i}
                    >
                      <span className="text-[12.5px] font-bold">{f.q}</span>
                      <Plus
                        className={`size-4 shrink-0 text-muted-foreground transition-transform duration-300 ${
                          openFaq === i ? "rotate-45" : ""
                        }`}
                      />
                    </button>
                    {openFaq === i && (
                      <p className="k-rise px-3.5 pb-3.5 text-[12px] leading-relaxed text-muted-foreground">
                        {f.a}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </Rise>

          <p className="mt-4 flex items-start gap-2 text-[11px] leading-relaxed text-muted-foreground">
            <Info className="mt-[1px] size-3.5 shrink-0" />
            Offered by a third-party issuer and administered by Kipit's SEC-licensed partner.
          </p>

          <DisclosureStrip variant="marketplace" />

          {/* Sticky CTA */}
          <div className="sticky bottom-[calc(5.5rem+env(safe-area-inset-bottom)+0.75rem)] z-30 mt-5 md:static md:bottom-auto">
            <Link
              to="/fixed-plans/create"
              aria-disabled={closed || belowMin || overWallet}
              className={`flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press md:w-auto md:px-10 ${
                closed || belowMin || overWallet
                  ? "pointer-events-none opacity-40 shadow-none"
                  : ""
              }`}
            >
              {closed ? "Fully subscribed" : `Invest ${naira(amount)}`}
              {!closed && <ArrowRight className="size-4" strokeWidth={2.6} />}
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
