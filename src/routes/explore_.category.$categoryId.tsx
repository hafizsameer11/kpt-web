import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  Check,
  ChevronRight,
  Layers,
  ShieldCheck,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/kipit/AppShell";
import { Rise } from "@/components/kipit/motion";
import { naira } from "@/lib/home-data";
import {
  AVAILABILITY_LABEL,
  EXPLORE_CATEGORIES,
  EXPLORE_PRODUCTS,
  type ExploreProduct,
} from "@/lib/explore-data";

export const Route = createFileRoute("/explore_/category/$categoryId")({
  loader: ({ params }) => {
    const category = EXPLORE_CATEGORIES.find((c) => c.id === params.categoryId);
    if (!category) throw notFound();
    return { category };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Category unavailable | Kipit" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${loaderData.category.name} | Kipit Explore`;
    const description = `Browse ${loaderData.category.name.toLowerCase()} on the Kipit marketplace — rates, tenors and minimums for every open offer.`;
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
  component: ExploreCategoryScreen,
  notFoundComponent: CategoryNotFound,
});

type SortKey = "rate" | "tenor" | "minimum";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "rate", label: "Highest rate" },
  { key: "tenor", label: "Shortest tenor" },
  { key: "minimum", label: "Lowest minimum" },
];

const num = (value: string) => Number(value.replace(/[^0-9.]/g, "")) || 0;

const AVAILABILITY_STYLE: Record<ExploreProduct["availability"], string> = {
  open: "bg-emerald-500/10 text-emerald-600",
  closing: "bg-gold/15 text-gold",
  closed: "bg-muted text-muted-foreground",
};

function ExploreCategoryScreen() {
  const { category } = Route.useLoaderData();
  const [sort, setSort] = useState<SortKey>("rate");
  const [openOnly, setOpenOnly] = useState(false);

  const products = useMemo(() => {
    const list = EXPLORE_PRODUCTS.filter(
      (p) => p.categoryId === category.id && (!openOnly || p.availability !== "closed"),
    );
    return [...list].sort((a, b) => {
      if (sort === "rate") return num(b.rate) - num(a.rate);
      if (sort === "minimum") return a.minimum - b.minimum;
      return (num(a.tenor) || 9_999) - (num(b.tenor) || 9_999);
    });
  }, [category.id, sort, openOnly]);

  return (
    <AppShell title={category.short} navVariant="elevated">
      {/* ── Desktop layout ─────────────────────────────────────── */}
      <div className="hidden md:block">
        <DesktopCategory category={category} products={products} sort={sort} setSort={setSort} openOnly={openOnly} setOpenOnly={setOpenOnly} />
      </div>
      {/* ── Mobile layout (unchanged) ──────────────────────────── */}
      <div className="pb-2 md:hidden">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="relative -mx-4 overflow-hidden bg-brand-gradient px-5 pb-16 pt-6 text-primary-foreground md:mx-0 md:rounded-xl md:px-8 md:pb-16 md:pt-8 md:shadow-float">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-32 size-72 rounded-full bg-gold/15 blur-[64px]"
          />
          <div className="relative md:max-w-3xl">
            <Link
              to="/explore"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold press"
            >
              <ArrowLeft className="size-3.5" /> Explore
            </Link>
            <h1 className="mt-5 font-display text-[26px] font-extrabold leading-tight tracking-[-0.02em] md:text-[32px]">
              {category.name}
            </h1>
            <p className="mt-2 text-[12.5px] font-medium text-primary-foreground/65">
              {products.length} of {category.count} offers shown · rates shown with tenor and
              minimum.
            </p>
          </div>
        </section>

        {/* ── Sheet ────────────────────────────────────────────── */}
        <div className="relative -mx-4 -mt-10 rounded-t-[2rem] bg-background px-4 pt-5 md:mx-0 md:mt-6 md:rounded-none md:bg-transparent md:px-0 md:pt-0">
          <span
            aria-hidden
            className="mx-auto mb-4 block h-1 w-10 rounded-full bg-border md:hidden"
          />

          {/* Sort + filter */}
          <Rise>
            <section className="rounded-xl border border-border/60 bg-card p-3 shadow-card">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                <ArrowUpDown className="size-3.5" /> Sort
              </div>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {SORTS.map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setSort(s.key)}
                    aria-pressed={sort === s.key}
                    className={`rounded-full border px-3 py-1.5 text-[11.5px] font-bold press ${
                      sort === s.key
                        ? "border-transparent bg-primary text-gold"
                        : "border-border bg-card text-foreground"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setOpenOnly((v) => !v)}
                aria-pressed={openOnly}
                className="mt-3 flex w-full items-center gap-2.5 rounded-xl bg-muted/50 px-3 py-2.5 text-left press"
              >
                <span
                  className={`grid size-5 place-items-center rounded-md border-2 ${
                    openOnly ? "border-gold bg-gold" : "border-muted-foreground/30"
                  }`}
                >
                  {openOnly && <Check className="size-3 text-gold-foreground" strokeWidth={4} />}
                </span>
                <span className="text-[12.5px] font-semibold">Hide fully subscribed offers</span>
              </button>
            </section>
          </Rise>

          {/* Products */}
          <section className="mt-4 space-y-3 md:grid md:grid-cols-2 md:gap-3 md:space-y-0">
            {products.map((p, i) => (
              <Rise key={p.id} delay={i * 60}>
                <Link
                  to="/explore/$productId"
                  params={{ productId: p.id }}
                  className="block h-full rounded-xl border border-border bg-card p-4 shadow-card press"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="font-display text-[15px] font-extrabold leading-tight tracking-[-0.01em]">
                        {p.name}
                      </h2>
                      <p className="mt-1 truncate text-[11.5px] text-muted-foreground">
                        {p.issuer}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${AVAILABILITY_STYLE[p.availability]}`}
                    >
                      {AVAILABILITY_LABEL[p.availability]}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border/60 pt-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Rate
                      </p>
                      <p className="mt-0.5 text-[13.5px] font-extrabold text-gold text-num">
                        {p.rate}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Tenor
                      </p>
                      <p className="mt-0.5 text-[13.5px] font-extrabold text-num">{p.tenor}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Minimum
                      </p>
                      <p className="mt-0.5 text-[13.5px] font-extrabold text-num">
                        {naira(p.minimum)}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 flex items-center gap-1.5 text-[11.5px] font-bold text-foreground">
                    View details <ArrowRight className="size-3.5" />
                  </p>
                </Link>
              </Rise>
            ))}
            {products.length === 0 && (
              <div className="rounded-xl border border-dashed border-border p-6 text-center">
                <p className="text-[13px] font-bold">Nothing open right now</p>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  Turn off the filter to see closed offers in this category.
                </p>
              </div>
            )}
          </section>

          <p className="mt-6 text-center text-[11px] leading-relaxed text-muted-foreground">
            Marketplace offers are arranged with SEC-licensed partners. Rates are indicative and
            capital is at risk.
          </p>
        </div>
      </div>
    </AppShell>
  );
}

function CategoryNotFound() {
  return (
    <AppShell title="Category" navVariant="elevated">
      <div className="px-1 py-10 text-center">
        <h1 className="font-display text-[20px] font-extrabold">Category not found</h1>
        <p className="mt-2 text-[13px] text-muted-foreground">
          This marketplace category is no longer available.
        </p>
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
