import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bell,
  Building2,
  Check,
  ChevronRight,
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
  return (
    <AppShell title="Explore" navVariant="elevated">
      <DesktopExplore />
      <MobileExplore />
    </AppShell>
  );
}

function MobileExplore() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [notified, setNotified] = useState<string[]>([]);
  const toggleNotify = (name: string) =>
    setNotified((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );


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
    <div className="md:hidden">
      <div className="pb-2">

        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-14 pt-9 text-primary-foreground md:mx-0 md:rounded-xl md:px-8 md:pb-14 md:pt-12 md:shadow-float">
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
            <div className="mt-6 flex items-center gap-2.5 rounded-xl border border-white/12 bg-white/10 px-4 py-3 backdrop-blur-md">
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
                      className={`k-rise relative flex flex-col justify-between overflow-hidden rounded-xl p-4 text-left press md:rounded-xl md:p-5 ${
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
                          className={`inline-flex size-10 items-center justify-center rounded-xl ${
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

              {activeCategory && (
                <Link
                  to="/explore/category/$categoryId"
                  params={{ categoryId: activeCategory.id }}
                  className="mt-3 flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 press"
                >
                  <span className="text-[12.5px] font-bold">
                    View all {activeCategory.name}
                  </span>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </Link>
              )}
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
                <div className="mt-3 rounded-xl border border-dashed border-border p-6 text-center">
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
                        <button
                          type="button"
                          onClick={() => toggleNotify(c.name)}
                          aria-pressed={notified.includes(c.name)}
                          className="card-surface w-full p-4 text-left transition-all duration-300 press group-hover:border-gold/40 group-hover:shadow-float"
                        >
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
                          <span
                            className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10.5px] font-bold ${
                              notified.includes(c.name)
                                ? "bg-brand text-primary-foreground"
                                : "border border-border text-foreground"
                            }`}
                          >
                            {notified.includes(c.name) ? (
                              <>
                                <Check className="size-3" /> We'll notify you
                              </>
                            ) : (
                              <>
                                <Bell className="size-3" /> Notify me
                              </>
                            )}
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() =>
                    setNotified(
                      notified.length === EXPLORE_COMING_SOON.length
                        ? []
                        : EXPLORE_COMING_SOON.map((c) => c.name),
                    )
                  }
                  className="text-[11px] font-bold uppercase tracking-[0.12em] text-gold transition-colors hover:text-gold/80 press"
                >
                  {notified.length === EXPLORE_COMING_SOON.length
                    ? "Turn off all updates"
                    : "Notify me of all updates"}
                </button>
              </div>

            </section>
          </Rise>


          <DisclosureStrip variant="marketplace" />
        </div>
      </div>
    </div>

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
              <article className="relative flex min-h-[23rem] flex-col justify-between overflow-hidden rounded-xl bg-brand-gradient p-5 text-primary-foreground shadow-float md:min-h-[24rem] md:p-6">
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

                  <div className="mt-4 flex items-center divide-x divide-white/15 rounded-xl bg-white/10 py-2.5 backdrop-blur-sm">
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

      <div className="mt-3.5 flex divide-x divide-border rounded-lg bg-muted/50 py-2.5">
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

/* ── Desktop ─────────────────────────────────────────────────── */

function DesktopExplore() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [visible, setVisible] = useState(6);
  const [notified, setNotified] = useState<string[]>([]);

  const toggleNotify = (name: string) =>
    setNotified((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );

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
    <div className="hidden pb-4 md:block">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-brand-gradient px-8 py-7 text-primary-foreground shadow-float">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-28 size-72 rounded-full bg-gold/25 blur-3xl"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -left-24 bottom-[-6rem] size-72 rounded-full bg-white/10 blur-3xl"
        />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary-foreground/60">
              Marketplace
            </p>
            <h1 className="mt-3 font-display text-[38px] font-extrabold leading-none tracking-[-0.04em]">
              Explore
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-primary-foreground/70">
              Partner opportunities beyond Kipit&rsquo;s own plans — rate, tenor
              and minimum shown up front.
            </p>
          </div>

          <div className="flex w-full max-w-sm items-center gap-2.5 rounded-xl border border-white/12 bg-white/10 px-4 py-3 backdrop-blur-md">
            <Search className="size-4 shrink-0 text-primary-foreground/70" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setVisible(6);
              }}
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

      {/* Categories */}
      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {EXPLORE_CATEGORIES.map((c) => {
          const Icon = CATEGORY_ICON[c.id as keyof typeof CATEGORY_ICON];
          const active = category === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setCategory(active ? null : c.id);
                setVisible(6);
              }}
              aria-pressed={active}
              className={`relative flex items-center gap-3.5 overflow-hidden rounded-xl px-5 py-4 text-left transition-transform press hover:-translate-y-0.5 ${
                active
                  ? "bg-brand-gradient text-primary-foreground shadow-float ring-2 ring-gold/70"
                  : "border border-border bg-card"
              }`}
            >
              <span
                className={`grid size-11 shrink-0 place-items-center rounded-xl ${
                  active ? "bg-gold text-gold-foreground" : "bg-secondary text-foreground"
                }`}
              >
                <Icon className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block font-display text-[14.5px] font-extrabold leading-tight">
                  {c.name}
                </span>
                <span
                  className={`mt-0.5 block text-[10.5px] font-semibold uppercase tracking-[0.12em] ${
                    active ? "text-gold" : "text-muted-foreground"
                  }`}
                >
                  {c.count} products
                </span>
              </span>
              {active && (
                <span className="ml-auto grid size-5 shrink-0 place-items-center rounded-full bg-gold text-gold-foreground">
                  <Check className="size-3" strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid items-start gap-4 lg:grid-cols-[minmax(0,2.4fr)_minmax(0,1fr)]">
        {/* Left column */}
        <div className="grid min-w-0 grid-cols-1 gap-4">
          {activeCategory && (
            <Link
              to="/explore/category/$categoryId"
              params={{ categoryId: activeCategory.id }}
              className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-3.5 press hover:border-gold/40"
            >
              <span className="text-[13px] font-bold">
                View all {activeCategory.name}
              </span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          )}

          <section className="card-surface p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-base font-extrabold">
                {activeCategory ? activeCategory.name : "All products"}
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-semibold text-muted-foreground">
                  {results.length} listed
                </span>
                {(category || query) && (
                  <button
                    type="button"
                    onClick={() => {
                      setCategory(null);
                      setQuery("");
                      setVisible(6);
                    }}
                    className="text-[11.5px] font-bold text-foreground underline-offset-4 hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {results.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-border p-10 text-center">
                <p className="text-[13px] font-bold">No matching products</p>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  Try a different search or category.
                </p>
              </div>
            ) : (
              <>
                <div className="mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border">
                  {results.slice(0, visible).map((p) => (
                    <DesktopProductRow key={p.id} product={p} />
                  ))}
                </div>
                {results.length > visible && (
                  <button
                    type="button"
                    onClick={() => setVisible((v) => v + 6)}
                    className="mt-4 w-full rounded-xl border border-border py-3 text-[11.5px] font-bold uppercase tracking-[0.12em] text-foreground transition-colors press hover:border-gold/40 hover:text-gold"
                  >
                    Show {Math.min(6, results.length - visible)} more
                  </button>
                )}
              </>
            )}

          </section>
        </div>

        {/* Right column */}
        <div className="grid min-w-0 grid-cols-1 gap-4">
          {!category && !query && featured.length > 0 && (
            <section className="card-surface p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-base font-extrabold">
                  Featured this week
                </h2>
                <span className="rounded-full bg-gold-gradient px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-gold-foreground">
                  Top {Math.min(2, featured.length)}
                </span>
              </div>
              <div className="mt-4 space-y-3">
                {featured.slice(0, 2).map((p) => (
                  <Link
                    key={p.id}
                    to="/explore/$productId"
                    params={{ productId: p.id }}
                    className="relative block overflow-hidden rounded-xl bg-brand-gradient p-5 text-primary-foreground transition-transform press hover:-translate-y-0.5"
                  >
                    <span
                      aria-hidden
                      className="pointer-events-none absolute -right-10 -top-16 size-40 rounded-full bg-gold/25 blur-3xl"
                    />
                    <div className="relative">
                      <span className="rounded-full bg-white/12 px-2.5 py-1 text-[9.5px] font-extrabold uppercase tracking-[0.14em] text-primary-foreground/80">
                        {p.category}
                      </span>
                      <h3 className="mt-3 font-display text-[17px] font-extrabold leading-tight tracking-[-0.02em]">
                        {p.name}
                      </h3>
                      <p className="mt-1 text-[11.5px] text-primary-foreground/65">
                        {p.issuer}
                      </p>
                      <div className="mt-4 flex items-end justify-between gap-3">
                        <div>
                          <p className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-primary-foreground/55">
                            Rate p.a.
                          </p>
                          <p className="font-display text-[26px] font-extrabold leading-none tracking-[-0.03em] text-gold text-num">
                            {p.rate.replace(" p.a.", "")}
                          </p>
                        </div>
                        <div className="text-right text-[11px] text-primary-foreground/70">
                          <p>{p.tenor}</p>
                          <p className="mt-0.5">Min {naira(p.minimum)}</p>
                        </div>
                      </div>
                      <p className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-gold">
                        <Clock3 className="size-3.5" /> {p.closes}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className="card-surface p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-base font-extrabold">Coming soon</h2>
              <span className="rounded-full border border-border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                {EXPLORE_COMING_SOON.length} in build
              </span>
            </div>

            <div className="relative mt-4 pl-7">
              <span
                aria-hidden
                className="pointer-events-none absolute left-[9px] bottom-6 top-3 w-px border-l border-dashed border-gold/50"
              />
              <div className="space-y-3">
                {EXPLORE_COMING_SOON.map((c, i) => {
                  const timing = ["Next up", "Q4", "Q1 2027"][i] ?? "Soon";
                  const on = notified.includes(c.name);
                  return (
                    <div key={c.name} className="relative">
                      <span
                        aria-hidden
                        className="absolute -left-7 top-4 grid size-[18px] place-items-center rounded-full bg-card"
                      >
                        <span
                          className={`size-2 rounded-full bg-gold ${i === 0 ? "k-glow" : ""}`}
                        />
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleNotify(c.name)}
                        aria-pressed={on}
                        className="w-full rounded-xl border border-border bg-card p-4 text-left transition-all press hover:border-gold/40"
                      >
                        <div className="flex items-baseline justify-between gap-3">
                          <h3 className="font-display text-[13.5px] font-extrabold leading-tight">
                            {c.name}
                          </h3>
                          <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.12em] text-gold">
                            {timing}
                          </span>
                        </div>
                        <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted-foreground">
                          {c.note}
                        </p>
                        <span
                          className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10.5px] font-bold ${
                            on
                              ? "bg-brand text-primary-foreground"
                              : "border border-border text-foreground"
                          }`}
                        >
                          {on ? (
                            <>
                              <Check className="size-3" /> We&rsquo;ll notify you
                            </>
                          ) : (
                            <>
                              <Bell className="size-3" /> Notify me
                            </>
                          )}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setNotified(
                  notified.length === EXPLORE_COMING_SOON.length
                    ? []
                    : EXPLORE_COMING_SOON.map((c) => c.name),
                )
              }
              className="mt-5 w-full text-center text-[11px] font-bold uppercase tracking-[0.12em] text-gold transition-colors hover:text-gold/80 press"
            >
              {notified.length === EXPLORE_COMING_SOON.length
                ? "Turn off all updates"
                : "Notify me of all updates"}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

function DesktopProductRow({ product: p }: { product: ExploreProduct }) {
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
      className="group flex items-center gap-4 bg-card px-5 py-4 transition-colors hover:bg-accent/40"
    >
      <div className="min-w-0 flex-1">
        <h3 className="text-[14px] font-extrabold leading-tight">{p.name}</h3>
        <p className="mt-1 truncate text-[11.5px] text-muted-foreground">
          {p.issuer} &middot; {p.category}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-[9.5px] font-extrabold uppercase tracking-[0.1em] ${tone}`}
          >
            {AVAILABILITY_LABEL[p.availability]}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold text-muted-foreground">
            <Clock3 className="size-3" /> {p.closes}
          </span>
        </div>
      </div>

      <div className="hidden w-20 shrink-0 text-right xl:block">
        <p className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Tenor
        </p>
        <p className="mt-0.5 text-[12.5px] font-bold">{p.tenor}</p>
      </div>
      <div className="hidden w-24 shrink-0 text-right lg:block">
        <p className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Minimum
        </p>
        <p className="mt-0.5 text-[12.5px] font-bold text-num">
          {naira(p.minimum)}
        </p>
      </div>
      <div className="w-28 shrink-0 text-right">
        <p className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Rate p.a.
        </p>
        <p className="mt-0.5 font-display text-[19px] font-extrabold leading-none tracking-[-0.02em] text-gold text-num">
          {p.rate.replace(" p.a.", "")}
        </p>
      </div>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
