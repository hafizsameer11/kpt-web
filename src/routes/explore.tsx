import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Building2,
  Check,
  Clock3,
  Landmark,
  Layers,
  LineChart,
  Search,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/kipit/AppShell";
import { DisclosureStrip } from "@/components/kipit/DisclosureStrip";
import { Rise } from "@/components/kipit/motion";
import { naira } from "@/lib/home-data";
import {
  AVAILABILITY_LABEL,
  EXPLORE_CATEGORIES,
  EXPLORE_COMING_SOON,
  EXPLORE_PRODUCTS,
  type ExploreProduct,
} from "@/lib/explore-data";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore — Kipit Investment Marketplace" },
      {
        name: "description",
        content:
          "Browse treasury bills, commercial papers, structured notes and managed portfolios, each with its rate, tenor and minimum investment shown together.",
      },
      { property: "og:title", content: "Explore — Kipit Investment Marketplace" },
      {
        property: "og:description",
        content:
          "Discover partner investment opportunities on Kipit with transparent rate, tenor, minimum and availability.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ExploreScreen,
});

const CATEGORY_ICON = {
  tbills: Landmark,
  cp: Building2,
  notes: Layers,
  portfolios: LineChart,
} as const;

function ExploreScreen() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const featured = EXPLORE_PRODUCTS.filter((p) => p.featured);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return EXPLORE_PRODUCTS.filter((p) => {
      const inCategory = !category || p.categoryId === category;
      const inQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.issuer.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      return inCategory && inQuery;
    });
  }, [query, category]);

  const activeCategory = EXPLORE_CATEGORIES.find((c) => c.id === category);

  return (
    <AppShell title="Explore" navVariant="elevated">
      <div className="pb-2">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-14 pt-9 text-primary-foreground md:mx-0 md:rounded-[2rem] md:px-8 md:pb-14 md:pt-12 md:shadow-float">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-32 size-72 rounded-full bg-gold/15 blur-[64px]"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-28 -left-20 size-64 rounded-full bg-white/10 blur-[56px]"
          />

          <div className="relative md:max-w-3xl">
            <h1 className="font-display text-[32px] font-extrabold leading-[1.05] tracking-[-0.035em] md:text-[40px]">
              Explore
            </h1>
            <p className="mt-2 text-[13px] leading-relaxed text-primary-foreground/70 md:text-sm">
              Partner opportunities beyond Kipit&rsquo;s own plans
            </p>

            {/* Search */}
            <div className="mt-6 flex items-center gap-2.5 rounded-2xl border border-white/12 bg-white/10 px-4 py-3 backdrop-blur-md">
              <Search className="size-4 shrink-0 text-primary-foreground/70" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products or issuers"
                aria-label="Search marketplace products"
                className="min-w-0 flex-1 bg-transparent text-[13.5px] font-semibold text-primary-foreground outline-none placeholder:font-medium placeholder:text-primary-foreground/50"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="rounded-full bg-white/15 p-1 press"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ── Sheet ────────────────────────────────────────────── */}
        <div className="relative -mx-4 -mt-8 rounded-t-[2rem] bg-background px-4 pt-5 md:mx-0 md:mt-6 md:rounded-none md:bg-transparent md:px-0 md:pt-0">
          <span
            aria-hidden
            className="mx-auto mb-4 block h-1 w-10 rounded-full bg-border md:hidden"
          />

          {/* Categories */}
          <Rise>
            <section>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Categories
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                {EXPLORE_CATEGORIES.map((c, i) => {
                  const Icon = CATEGORY_ICON[c.id as keyof typeof CATEGORY_ICON];
                  const active = category === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCategory(active ? null : c.id)}
                      aria-pressed={active}
                      style={{ ["--d" as string]: `${i * 80}ms` }}
                      className={`k-rise relative flex flex-col justify-between overflow-hidden rounded-[1.5rem] p-4 text-left press md:rounded-[2rem] md:p-5 ${
                        active
                          ? "bg-brand-gradient text-primary-foreground shadow-float"
                          : "border border-border bg-card"
                      }`}
                    >
                      <span
                        aria-hidden
                        className={`pointer-events-none absolute -right-10 -top-10 size-28 rounded-full ${
                          active ? "bg-gold/20" : "bg-accent/60"
                        }`}
                      />
                      <div className="relative flex items-start justify-between">
                        <span
                          className={`inline-flex size-10 items-center justify-center rounded-2xl ${
                            active
                              ? "bg-gold text-gold-foreground"
                              : "bg-secondary text-foreground"
                          }`}
                        >
                          <Icon className="size-5" />
                        </span>
                        {active && (
                          <span className="inline-flex size-5 items-center justify-center rounded-full bg-gold text-gold-foreground">
                            <Check className="size-3" strokeWidth={3} />
                          </span>
                        )}
                      </div>
                      <div className="relative mt-5">
                        <h3 className="font-display text-[13px] font-extrabold leading-tight md:text-base">
                          {c.name}
                        </h3>
                        <p
                          className={`mt-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${
                            active ? "text-gold" : "text-muted-foreground"
                          }`}
                        >
                          {c.count} products
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

            </section>
          </Rise>

          {/* Featured */}
          {!category && !query && (
            <Rise delay={60}>
              <section className="mt-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Featured this week
                </p>
                <FeaturedCarousel items={featured} />



              </section>
            </Rise>
          )}

          {/* Product list */}
          <Rise delay={120}>
            <section className="mt-6">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  {activeCategory ? activeCategory.name : "All products"}
                </p>
                {(category || query) && (
                  <button
                    type="button"
                    onClick={() => {
                      setCategory(null);
                      setQuery("");
                    }}
                    className="text-[11.5px] font-bold text-foreground underline-offset-4 hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>

              {results.length === 0 ? (
                <div className="mt-3 rounded-2xl border border-dashed border-border p-6 text-center">
                  <p className="text-[13px] font-bold">No matching products</p>
                  <p className="mt-1 text-[12px] text-muted-foreground">
                    Try a different search or category.
                  </p>
                </div>
              ) : (
                <div className="mt-3 space-y-3 md:grid md:grid-cols-2 md:gap-3 md:space-y-0">
                  {results.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              )}
            </section>
          </Rise>

          {/* Coming soon — elegant gold timeline */}
          <Rise delay={180}>
            <section className="mt-8">
              <div className="mb-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  On the roadmap
                </p>
                <div className="mt-1 flex items-center gap-3">
                  <h2 className="font-display text-lg font-extrabold text-foreground">
                    Coming soon
                  </h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
                  <span className="rounded-full border border-border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                    {EXPLORE_COMING_SOON.length} in build
                  </span>
                </div>
              </div>

              <div className="relative pl-8">
                {/* Vertical dotted gold line */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute left-[13px] top-2 bottom-24 w-px border-l border-dashed border-gold/50"
                />

                <div className="space-y-5">
                  {EXPLORE_COMING_SOON.map((c, i) => {
                    const timing = ["Next up", "Q4", "Q1 2027"][i] ?? "Soon";
                    return (
                      <div
                        key={c.name}
                        style={{ ["--d" as string]: `${i * 90}ms` }}
                        className="k-rise relative group"
                      >
                        {/* Timeline node */}
                        <span
                          aria-hidden
                          className="absolute -left-8 top-[1.15rem] flex size-[22px] items-center justify-center rounded-full bg-background"
                        >
                          <span
                            className={`size-2 rounded-full bg-gold ${
                              i === 0 ? "k-glow" : ""
                            }`}
                          />
                        </span>

                        {/* Card */}
                        <div className="card-surface p-4 transition-all duration-300 group-hover:border-gold/40 group-hover:shadow-float">
                          <div className="flex items-baseline justify-between gap-3">
                            <h3 className="font-display text-[15px] font-extrabold leading-tight text-foreground md:text-base">
                              {c.name}
                            </h3>
                            <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.12em] text-gold">
                              {timing}
                            </span>
                          </div>
                          <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
                            {c.note}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  className="text-[11px] font-bold uppercase tracking-[0.12em] text-gold transition-colors hover:text-gold/80 press"
                >
                  Notify me of updates
                </button>
              </div>
            </section>
          </Rise>


          <DisclosureStrip variant="marketplace" />
        </div>
      </div>
    </AppShell>
  );
}

function FeaturedCarousel({ items }: { items: ExploreProduct[] }) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [index, setIndex] = useState(0);

  const scrollTo = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.children[i] as HTMLElement | undefined;
    if (card) el.scrollTo({ left: card.offsetLeft - el.offsetLeft, behavior: "smooth" });
  };

  useEffect(() => {
    if (items.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((prev) => {
        const next = (prev + 1) % items.length;
        const el = trackRef.current;
        const card = el?.children[next] as HTMLElement | undefined;
        if (el && card)
          el.scrollTo({ left: card.offsetLeft - el.offsetLeft, behavior: "smooth" });
        return next;
      });
    }, 3000);
    return () => window.clearInterval(id);
  }, [items.length]);

  const onScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / (el.clientWidth || 1));
    setIndex(Math.min(items.length - 1, Math.max(0, i)));
  };

  return (
    <div className="mt-3">
      <div className="relative -mx-4 overflow-hidden md:mx-0">
        <div
          ref={trackRef}
          onScroll={onScroll}
          className="flex snap-x snap-mandatory overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((p) => (
            <div key={p.id} className="w-full shrink-0 snap-center px-4 md:px-0">
              <Link
                to="/explore/$productId"
                params={{ productId: p.id }}
                className="block press"
              >
              <article className="relative flex min-h-[23rem] flex-col justify-between overflow-hidden rounded-[1.9rem] bg-brand-gradient p-5 text-primary-foreground shadow-float md:min-h-[24rem] md:p-6">
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-12 -top-20 size-52 rounded-full bg-gold/25 blur-[56px]"
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute -bottom-24 -left-16 size-48 rounded-full bg-white/10 blur-[56px]"
                />

                <div className="relative">
                  <div className="flex items-start justify-between gap-3">
                    <span className="rounded-full bg-white/12 px-2.5 py-1 text-[9.5px] font-extrabold uppercase tracking-[0.14em] text-primary-foreground/80">
                      {p.category}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-gold-gradient px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-gold-foreground">
                      Featured
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-[22px] font-extrabold leading-[1.1] tracking-[-0.03em] md:text-[24px]">
                    {p.name}
                  </h3>
                  <p className="mt-1.5 text-[12px] text-primary-foreground/65">{p.issuer}</p>
                  <p className="mt-4 text-[12px] leading-relaxed text-primary-foreground/70">
                    {p.blurb}
                  </p>
                </div>

                <div className="relative">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary-foreground/55">
                    Rate p.a.
                  </p>
                  <p className="font-display text-[34px] font-extrabold leading-none tracking-[-0.03em] text-gold text-num">
                    {p.rate.replace(" p.a.", "")}
                  </p>

                  <div className="mt-4 flex items-center divide-x divide-white/15 rounded-2xl bg-white/10 py-2.5 backdrop-blur-sm">
                    <div className="flex-1 px-3 text-center">
                      <p className="text-[9.5px] uppercase tracking-[0.12em] text-primary-foreground/55">
                        Tenor
                      </p>
                      <p className="mt-0.5 text-[12px] font-extrabold">{p.tenor}</p>
                    </div>
                    <div className="flex-1 px-3 text-center">
                      <p className="text-[9.5px] uppercase tracking-[0.12em] text-primary-foreground/55">
                        Minimum
                      </p>
                      <p className="mt-0.5 text-[12px] font-extrabold">{naira(p.minimum)}</p>
                    </div>
                  </div>

                  <p className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-gold">
                    <Clock3 className="size-3.5" /> {p.closes}
                  </p>
                </div>
              </article>
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-center gap-1.5">
        {items.map((p, i) => (
          <button
            key={p.id}
            type="button"
            aria-label={`Go to featured product ${i + 1}`}
            onClick={() => {
              setIndex(i);
              scrollTo(i);
            }}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-5 bg-gold" : "w-1.5 bg-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function ProductCard({ product: p }: { product: ExploreProduct }) {

  const tone =
    p.availability === "open"
      ? "bg-emerald-500/10 text-emerald-600"
      : p.availability === "closing"
        ? "bg-gold/15 text-gold"
        : "bg-muted text-muted-foreground";

  return (
    <Link
      to="/explore/$productId"
      params={{ productId: p.id }}
      className="block card-surface p-4 press"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            {p.category}
          </p>
          <h3 className="mt-1 truncate text-[14px] font-extrabold leading-tight">
            {p.name}
          </h3>
          <p className="mt-0.5 truncate text-[11.5px] text-muted-foreground">
            {p.issuer}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[10.5px] font-extrabold ${tone}`}
        >
          {AVAILABILITY_LABEL[p.availability]}
        </span>
      </div>

      <div className="mt-3.5 flex divide-x divide-border rounded-xl bg-muted/50 py-2.5">
        <Stat label="Rate" value={p.rate} accent />
        <Stat label="Tenor" value={p.tenor} />
        <Stat label="Minimum" value={naira(p.minimum)} />
      </div>

      <p className="mt-3 text-[11.5px] leading-relaxed text-muted-foreground">
        {p.blurb}
      </p>
      <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
        <Clock3 className="size-3.5" /> {p.closes}
      </p>
    </Link>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex-1 px-2.5 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </p>
      <p
        className={`mt-0.5 text-[12.5px] font-extrabold leading-tight ${
          accent ? "text-gold" : "text-foreground"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
