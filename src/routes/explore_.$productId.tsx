import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Download,
  Clock3,
  FileText,
  Minus,
  Plus,
  ShieldCheck,
  Wallet,
  X,
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
  const [inputValue, setInputValue] = useState(p.minimum.toLocaleString("en-NG"));
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const closed = p.availability === "closed";
  const largeTicket = p.minimum >= 5_000_000;

  const ratePct = Number(p.rate.match(/[\d.]+/)?.[0]) || 0;
  const days = Number(p.tenor.replace(/[^0-9]/g, "")) || 365;
  const estimate = Math.round((amount * (ratePct / 100) * days) / 365);
  const belowMin = amount < p.minimum;
  const overWallet = amount > WALLET;

  const formatInput = (value: number) => value.toLocaleString("en-NG");

  const handleAmountChange = (raw: string) => {
    const digits = raw.replace(/[^0-9]/g, "");
    const numeric = digits ? Number(digits) : 0;
    setAmount(numeric);
    setInputValue(digits ? numeric.toLocaleString("en-NG") : "");
  };

  const handleAmountBlur = () => {
    const next = Math.max(amount, p.minimum);
    setAmount(next);
    setInputValue(formatInput(next));
  };

  const adjustAmount = (delta: number) => {
    const next = Math.max(p.minimum, amount + delta);
    setAmount(next);
    setInputValue(formatInput(next));
  };

  const tone =
    p.availability === "open"
      ? "bg-emerald-500/15 text-emerald-300"
      : p.availability === "closing"
        ? "bg-gold/20 text-gold"
        : "bg-white/10 text-primary-foreground/70";

  const step = Math.max(p.minimum / 2, 50_000);

  return (
    <AppShell title="Product" navVariant="elevated">
      {/* ===== MOBILE (unchanged) ===== */}
      <div className="pb-2 md:hidden">
        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-14 pt-6 text-primary-foreground md:mx-0 md:rounded-xl md:px-8 md:pb-14 md:pt-8 md:shadow-float">
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
                    <div key={h.label} className="flex min-w-0 flex-col justify-center p-4 sm:p-5">
                      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/80">
                        {h.label}
                      </span>
                      <div className="mt-1.5 flex min-w-0 flex-wrap items-baseline gap-x-1 gap-y-0.5">
                        <span
                          className={`min-w-0 break-words font-display font-extrabold tracking-[-0.02em] text-num ${
                            isRate ? "text-[22px] text-gold" : "text-[18px] text-foreground"
                          }`}
                        >
                          {head}
                        </span>
                        {unit ? (
                          <span
                            className={`min-w-0 break-words text-[11px] font-bold uppercase ${
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
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Estimate your return
                </p>
                <Link
                  to="/explore/$productId/calculator"
                  params={{ productId: p.id }}
                  className="text-[11.5px] font-bold text-foreground underline-offset-4 hover:underline"
                >
                  Full calculator
                </Link>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Decrease amount"
                  onClick={() => adjustAmount(-step)}
                  className="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-card press"
                >
                  <Minus className="size-4" />
                </button>
                <div className="min-w-0 flex-1 text-center">
                  <input
                    type="text"
                    inputMode="numeric"
                    aria-label="Investment amount"
                    aria-describedby="amount-min"
                    value={inputValue}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    onBlur={handleAmountBlur}
                    onFocus={(e) => e.target.select()}
                    className="w-full bg-transparent text-center font-display text-[24px] font-extrabold leading-none tracking-[-0.02em] text-num outline-none placeholder:text-muted-foreground/40"
                  />
                  <p id="amount-min" className="mt-1 text-[11px] text-muted-foreground">
                    Minimum {naira(p.minimum)}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Increase amount"
                  onClick={() => adjustAmount(step)}
                  className="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-card press"
                >
                  <Plus className="size-4" />
                </button>
              </div>

              <div className="mt-4 rounded-xl bg-muted/60 p-3.5">
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

              <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-border/60 px-3 py-2.5">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-gold/15 text-gold">
                  <Wallet className="size-4" />
                </span>
                <p className="text-[11.5px] text-muted-foreground">
                  Wallet available <span className="font-bold text-foreground">{naira(WALLET)}</span>
                </p>
              </div>

              {overWallet && (
                <p className="mt-2.5 rounded-xl bg-destructive/10 px-3 py-2.5 text-[11.5px] font-semibold text-destructive">
                  Insufficient wallet balance — add {naira(amount - WALLET)} to continue.
                </p>
              )}
              {belowMin && (
                <p className="mt-2.5 rounded-xl bg-destructive/10 px-3 py-2.5 text-[11.5px] font-semibold text-destructive">
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
            <section className="mt-4 overflow-hidden rounded-xl bg-brand-gradient p-4 text-primary-foreground shadow-float">
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-xl bg-gold/15 text-gold">
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
              <div className="flex items-center justify-between px-1">
                <h3 className="font-display text-lg font-semibold">Documents</h3>
                <span className="rounded-full bg-gold/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gold">
                  {detail.documents.length} Files
                </span>
              </div>
              <div className="mt-3 divide-y divide-border overflow-hidden rounded-lg border border-border bg-card shadow-[0_4px_20px_-4px_rgba(0,29,61,0.08)]">
                {detail.documents.map((d) => (
                  <button
                    key={d.name}
                    type="button"
                    onClick={() => toast.success(`${d.name} downloaded`)}
                    className="group flex w-full items-center gap-4 p-4 text-left transition-colors duration-300 press hover:bg-secondary/60"
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-gold/10 text-gold">
                      <FileText className="size-6" strokeWidth={1.5} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-medium leading-tight text-primary">
                        {d.name}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {d.meta}
                      </span>
                    </span>
                    <Download className="size-5 shrink-0 text-gold transition-transform duration-300 group-hover:translate-y-0.5" />
                  </button>
                ))}
              </div>
              <p className="mt-4 text-center text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Tap to download PDF
              </p>
            </section>
          </Rise>

          {/* FAQs */}
          <Rise delay={220}>
            <section className="mt-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Questions
              </p>
              <div className="mt-3 overflow-hidden rounded-xl border border-border bg-card">
                {detail.faqs.map((f, i) => {
                  const isOpen = openFaq === i;
                  return (
                    <div
                      key={f.q}
                      className={`${i !== 0 ? "border-t border-border" : ""}`}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : i)}
                        className="flex w-full items-center justify-between gap-4 px-5 py-[18px] text-left"
                        aria-expanded={isOpen}
                      >
                        <span className="text-[14.5px] font-bold leading-snug text-foreground">
                          {f.q}
                        </span>
                        {isOpen ? (
                          <X className="size-5 shrink-0 text-muted-foreground" strokeWidth={1.5} />
                        ) : (
                          <Plus className="size-5 shrink-0 text-muted-foreground" strokeWidth={1.5} />
                        )}
                      </button>
                      {isOpen && (
                        <p className="k-rise px-5 pb-[18px] text-[13px] leading-relaxed text-muted-foreground">
                          {f.a}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </Rise>

          <DisclosureStrip variant="marketplace" />

          {/* Sticky CTA */}
          <div className="sticky bottom-[calc(5.5rem+env(safe-area-inset-bottom)+0.75rem)] z-30 mt-5 md:static md:bottom-auto">
            {closed ? (
              <Link
                to="/explore/$productId/unavailable"
                params={{ productId: p.id }}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3.5 text-[13.5px] font-extrabold text-foreground press md:w-auto md:px-10"
              >
                Fully subscribed — notify me
                <ArrowRight className="size-4" strokeWidth={2.6} />
              </Link>
            ) : largeTicket ? (
              <Link
                to="/explore/$productId/request"
                params={{ productId: p.id }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press md:w-auto md:px-10"
              >
                Request adviser engagement
                <ArrowRight className="size-4" strokeWidth={2.6} />
              </Link>
            ) : (
              <Link
                to="/explore/$productId/subscribe"
                params={{ productId: p.id }}
                search={{ amount }}
                aria-disabled={belowMin || overWallet}
                className={`flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float press md:w-auto md:px-10 ${
                  belowMin || overWallet
                    ? "pointer-events-none opacity-40 shadow-none"
                    : ""
                }`}
              >
                {`Invest ${naira(amount)}`}
                <ArrowRight className="size-4" strokeWidth={2.6} />
              </Link>
            )}
            {largeTicket && !closed && (
              <p className="mt-2 text-center text-[11px] text-muted-foreground md:text-left">
                This product is arranged with a licensed adviser.
              </p>
            )}
          </div>

        </div>
      </div>

      {/* ===== DESKTOP ===== */}
      <div className="hidden md:block">
        <div className="mx-auto w-full max-w-[1180px] pb-10">
          <Link
            to="/explore"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[11.5px] font-bold text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" /> Back to marketplace
          </Link>

          <section className="relative mt-4 overflow-hidden rounded-2xl bg-brand-gradient px-8 py-8 text-primary-foreground shadow-float">
            <span
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-28 size-80 rounded-full bg-gold/20 blur-[70px]"
            />
            <div className="relative flex items-end justify-between gap-8">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-white/12 px-2.5 py-1 text-[9.5px] font-extrabold uppercase tracking-[0.14em] text-primary-foreground/80">
                    {p.category}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10.5px] font-extrabold ${tone}`}
                  >
                    {AVAILABILITY_LABEL[p.availability]}
                  </span>
                </div>
                <h1 className="mt-3 font-display text-[34px] font-extrabold leading-[1.05] tracking-[-0.03em]">
                  {p.name}
                </h1>
                <p className="mt-1.5 text-[13px] text-primary-foreground/65">{p.issuer}</p>
                <p className="mt-4 inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-gold">
                  <Clock3 className="size-3.5" /> {p.closes}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary-foreground/55">
                  Rate p.a.
                </p>
                <p className="font-display text-[52px] font-extrabold leading-none tracking-[-0.035em] text-gold text-num">
                  {p.rate.replace(" p.a.", "")}
                </p>
              </div>
            </div>

            <div className="relative mt-7 grid grid-cols-4 gap-px overflow-hidden rounded-xl bg-white/10">
              {detail.highlights.map((h) => (
                <div key={h.label} className="bg-brand-gradient px-4 py-3.5">
                  <p className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-primary-foreground/55">
                    {h.label}
                  </p>
                  <p className="mt-1 font-display text-[15px] font-extrabold tracking-[-0.01em] text-num">
                    {h.value}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <div className="mt-6 grid grid-cols-[minmax(0,1fr)_380px] items-start gap-6">
            {/* Left column */}
            <div className="space-y-5">
              <section className="card-surface overflow-hidden p-0">
                <div className="h-1 w-full bg-gold" />
                <div className="p-6">
                  <h2 className="font-display text-[18px] font-extrabold tracking-tight">
                    About this product
                  </h2>
                  <p className="mt-2.5 text-[13.5px] leading-relaxed text-muted-foreground">
                    {detail.about}
                  </p>
                  <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4">
                    {detail.how.map((h) => (
                      <li key={h} className="flex items-start gap-3">
                        <span className="mt-[6px] size-2 shrink-0 rotate-45 bg-gold" />
                        <span className="text-[13px] font-medium leading-snug text-foreground">
                          {h}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              <section className="overflow-hidden rounded-xl bg-brand-gradient p-6 text-primary-foreground shadow-float">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-9 place-items-center rounded-xl bg-gold/15 text-gold">
                    <ShieldCheck className="size-4.5" />
                  </span>
                  <h2 className="font-display text-[16px] font-extrabold">Risks to know</h2>
                </div>
                <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3">
                  {detail.risks.map((r) => (
                    <li key={r} className="flex gap-2.5">
                      <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-gold" />
                      <span className="text-[12.5px] leading-relaxed text-primary-foreground/75">
                        {r}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="card-surface p-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-[18px] font-extrabold tracking-tight">
                    Documents
                  </h2>
                  <span className="rounded-full bg-gold/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gold">
                    {detail.documents.length} files
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {detail.documents.map((d) => (
                    <button
                      key={d.name}
                      type="button"
                      onClick={() => toast.success(`${d.name} downloaded`)}
                      className="group rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-gold/50 hover:bg-secondary/50"
                    >
                      <span className="grid size-10 place-items-center rounded-lg bg-gold/10 text-gold">
                        <FileText className="size-5" strokeWidth={1.6} />
                      </span>
                      <span className="mt-3 block text-[13.5px] font-bold leading-tight text-foreground">
                        {d.name}
                      </span>
                      <span className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        {d.meta}
                        <Download className="size-3.5 text-gold transition-transform group-hover:translate-y-0.5" />
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="card-surface overflow-hidden p-0">
                <div className="px-6 pt-5">
                  <h2 className="font-display text-[18px] font-extrabold tracking-tight">
                    Questions
                  </h2>
                </div>
                <div className="mt-3">
                  {detail.faqs.map((f, i) => {
                    const isOpen = openFaq === i;
                    return (
                      <div key={f.q} className="border-t border-border">
                        <button
                          type="button"
                          onClick={() => setOpenFaq(isOpen ? null : i)}
                          className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"
                          aria-expanded={isOpen}
                        >
                          <span className="text-[14.5px] font-bold leading-snug text-foreground">
                            {f.q}
                          </span>
                          {isOpen ? (
                            <X className="size-5 shrink-0 text-muted-foreground" strokeWidth={1.5} />
                          ) : (
                            <Plus className="size-5 shrink-0 text-muted-foreground" strokeWidth={1.5} />
                          )}
                        </button>
                        {isOpen && (
                          <p className="px-6 pb-4 text-[13px] leading-relaxed text-muted-foreground">
                            {f.a}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* Right sticky invest panel */}
            <aside className="sticky top-6 space-y-4">
              <section className="card-surface p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Estimate your return
                  </p>
                  <Link
                    to="/explore/$productId/calculator"
                    params={{ productId: p.id }}
                    className="text-[11.5px] font-bold text-foreground underline-offset-4 hover:underline"
                  >
                    Full calculator
                  </Link>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <button
                    type="button"
                    aria-label="Decrease amount"
                    onClick={() => adjustAmount(-step)}
                    className="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-card transition-colors hover:bg-secondary"
                  >
                    <Minus className="size-4" />
                  </button>
                  <div className="min-w-0 flex-1 text-center">
                    <input
                      type="text"
                      inputMode="numeric"
                      aria-label="Investment amount"
                      value={inputValue}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      onBlur={handleAmountBlur}
                      onFocus={(e) => e.target.select()}
                      className="w-full bg-transparent text-center font-display text-[26px] font-extrabold leading-none tracking-[-0.02em] text-num outline-none"
                    />
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Minimum {naira(p.minimum)}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label="Increase amount"
                    onClick={() => adjustAmount(step)}
                    className="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-card transition-colors hover:bg-secondary"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>

                <div className="mt-4 rounded-xl bg-muted/60 p-4">
                  <p className="text-[11px] text-muted-foreground">
                    Estimated interest over {p.tenor === "Open-ended" ? "12 months" : p.tenor}
                  </p>
                  <p className="mt-1 font-display text-[24px] font-extrabold leading-none text-num text-foreground">
                    {naira(estimate)}
                  </p>
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    Payout {naira(amount + estimate)} · indicative only
                  </p>
                </div>

                <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-border/60 px-3 py-2.5">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-gold/15 text-gold">
                    <Wallet className="size-4" />
                  </span>
                  <p className="text-[11.5px] text-muted-foreground">
                    Wallet available{" "}
                    <span className="font-bold text-foreground">{naira(WALLET)}</span>
                  </p>
                </div>

                {overWallet && (
                  <p className="mt-2.5 rounded-xl bg-destructive/10 px-3 py-2.5 text-[11.5px] font-semibold text-destructive">
                    Insufficient wallet balance — add {naira(amount - WALLET)} to continue.
                  </p>
                )}
                {belowMin && (
                  <p className="mt-2.5 rounded-xl bg-destructive/10 px-3 py-2.5 text-[11.5px] font-semibold text-destructive">
                    Minimum investment is {naira(p.minimum)}.
                  </p>
                )}

                <div className="mt-4">
                  {closed ? (
                    <Link
                      to="/explore/$productId/unavailable"
                      params={{ productId: p.id }}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3.5 text-[13.5px] font-extrabold text-foreground transition-colors hover:bg-secondary"
                    >
                      Fully subscribed — notify me
                      <ArrowRight className="size-4" strokeWidth={2.6} />
                    </Link>
                  ) : largeTicket ? (
                    <Link
                      to="/explore/$productId/request"
                      params={{ productId: p.id }}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float"
                    >
                      Request adviser engagement
                      <ArrowRight className="size-4" strokeWidth={2.6} />
                    </Link>
                  ) : (
                    <Link
                      to="/explore/$productId/subscribe"
                      params={{ productId: p.id }}
                      search={{ amount }}
                      aria-disabled={belowMin || overWallet}
                      className={`flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3.5 text-[13.5px] font-extrabold text-primary-foreground shadow-float ${
                        belowMin || overWallet ? "pointer-events-none opacity-40 shadow-none" : ""
                      }`}
                    >
                      {`Invest ${naira(amount)}`}
                      <ArrowRight className="size-4" strokeWidth={2.6} />
                    </Link>
                  )}
                  {largeTicket && !closed && (
                    <p className="mt-2 text-center text-[11px] text-muted-foreground">
                      This product is arranged with a licensed adviser.
                    </p>
                  )}
                </div>
              </section>

              <DisclosureStrip variant="marketplace" />
            </aside>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
