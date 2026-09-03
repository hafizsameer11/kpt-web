import { createFileRoute } from "@tanstack/react-router";
import {
  Building2,
  Check,
  Clock3,
  Landmark,
  Layers,
  LineChart,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/kipit/AppShell";
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

          {/* Coming soon */}
          <Rise delay={180}>
            <section className="mt-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Coming soon
              </p>
              <div className="-mx-4 mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
                {EXPLORE_COMING_SOON.map((c, i) => (
                  <article
                    key={c.name}
                    style={{ ["--d" as string]: `${i * 80}ms` }}
                    className="k-rise relative w-[72%] min-w-[72%] shrink-0 snap-center overflow-hidden rounded-[1.5rem] border border-border bg-card p-4 md:w-auto md:min-w-0 md:rounded-[1.75rem] md:p-5"
                  >
                    <span
                      aria-hidden
                      className="pointer-events-none absolute -right-8 -top-10 size-24 rounded-full bg-accent/60"
                    />
                    <div className="relative">
                      <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-widest text-muted-foreground">
                        <Clock3 className="size-3" /> Soon
                      </span>
                      <h3 className="mt-3 font-display text-[14px] font-extrabold leading-tight">
                        {c.name}
                      </h3>
                      <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">
                        {c.note}
                      </p>
                      <span className="mt-4 block h-1 w-10 rounded-full bg-gold/60" />
                    </div>
                  </article>
                ))}
              </div>

            </section>
          </Rise>

          <p className="mt-6 flex items-start gap-2 text-[11px] leading-relaxed text-muted-foreground">
            <ShieldCheck className="mt-px size-3.5 shrink-0" />
            Marketplace products are offered by third-party issuers through
            Kipit&rsquo;s SEC-licensed partner. Rates are indicative and subject to
            availability at the time of subscription.
          </p>
        </div>
      </div>
    </AppShell>
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
    <article className="card-surface p-4">
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
    </article>
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
