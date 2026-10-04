/**
 * MOB-080 — Explore landing data (marketplace).
 * Rate, tenor/liquidity and minimum always travel together (Global rule 3.3).
 */

export type ExploreCategory = {
  id: string;
  name: string;
  short: string;
  count: number;
};

export let EXPLORE_CATEGORIES: ExploreCategory[] = [];

export type ExploreProduct = {
  id: string;
  name: string;
  issuer: string;
  categoryId: string;
  category: string;
  rate: string;
  tenor: string;
  minimum: number;
  availability: "open" | "closing" | "closed";
  closes: string;
  featured?: boolean;
  blurb: string;
  largeTicket?: boolean;
};

export let EXPLORE_PRODUCTS: ExploreProduct[] = [];

/** Coming Soon rail (MOB-080). */
export const EXPLORE_COMING_SOON: { name: string; note: string; status: string }[] = [
  {
    name: "Real Estate Notes",
    note: "Fractional income-generating property",
    status: "NEXT UP",
  },
  {
    name: "Dollar Fixed Income",
    note: "USD savings and Eurobond access",
    status: "Q4",
  },
  {
    name: "Green Energy Notes",
    note: "Solar and mini-grid project funding",
    status: "Q1 2027",
  },
];

export const AVAILABILITY_LABEL: Record<
  ExploreProduct["availability"],
  string
> = {
  open: "Open",
  closing: "Closing soon",
  closed: "Fully subscribed",
};

/**
 * MOB-081 — Product detail content.
 * Every product resolves to a detail payload; generic copy is derived from the
 * category when a product has no bespoke entry.
 */
export type ProductDetail = {
  highlights: { label: string; value: string }[];
  about: string;
  how: string[];
  risks: string[];
  documents: { name: string; meta: string }[];
  faqs: { q: string; a: string }[];
};

const CATEGORY_ABOUT: Record<string, string> = {
  "treasury-bills":
    "Treasury bills are short-term debt instruments issued by the Federal Government of Nigeria and sold at a discount to face value. You receive the full face value at maturity.",
  tbills:
    "Treasury bills are short-term debt instruments issued by the Federal Government of Nigeria and sold at a discount to face value. You receive the full face value at maturity.",
  "commercial-papers":
    "Commercial paper is unsecured short-term debt issued by large corporates to fund working capital. Returns are fixed at purchase and paid at maturity.",
  cp: "Commercial paper is unsecured short-term debt issued by large corporates to fund working capital. Returns are fixed at purchase and paid at maturity.",
  "structured-notes":
    "Private and structured notes are arranged instruments secured on underlying assets or cash flows, offering higher yields for a longer lock-up.",
  notes:
    "Private and structured notes are arranged instruments secured on underlying assets or cash flows, offering higher yields for a longer lock-up.",
  "managed-portfolio":
    "Managed portfolios are professionally run mixes of fixed-income instruments. Returns are targets, not guarantees, and your balance moves with the portfolio.",
  portfolios:
    "Managed portfolios are professionally run mixes of fixed-income instruments. Returns are targets, not guarantees, and your balance moves with the portfolio.",
  commodities:
    "Commodity-linked products track physical or futures markets. Prices can move sharply with supply, demand and FX.",
};

export function getExploreProduct(id: string) {
  return EXPLORE_PRODUCTS.find((p) => p.id === id);
}

const exploreListeners = new Set<() => void>();
export function subscribeExplore(listener: () => void) {
  exploreListeners.add(listener);
  return () => {
    exploreListeners.delete(listener);
  };
}
function emitExplore() {
  exploreListeners.forEach((l) => l());
}

function mapAvailability(raw: string): ExploreProduct["availability"] {
  const v = raw.toLowerCase();
  if (v === "closing") return "closing";
  if (v === "closed") return "closed";
  return "open";
}

let exploreHydratePromise: Promise<boolean> | null = null;

/** Hydrate marketplace catalog from /v1/explore (empty on failure). */
export async function hydrateExploreFromApi() {
  try {
    const { fetchExploreCategories, fetchExploreProducts } = await import("@/lib/api");
    const [cats, products] = await Promise.all([
      fetchExploreCategories().catch(() => []),
      fetchExploreProducts().catch(() => []),
    ]);
    const list = Array.isArray(products) ? products : [];
    const catList = Array.isArray(cats) ? cats : [];
    EXPLORE_CATEGORIES = catList.map((c) => ({
      id: c.slug || c.id,
      name: c.name || "Category",
      short: (c.name || "Category").split(" ")[0] || c.name || "Category",
      count: c.productCount ?? 0,
    }));
    EXPLORE_PRODUCTS = list.map((p, i) => ({
      id: p.id || p.slug,
      name: p.name || "Product",
      issuer: p.issuer || "",
      categoryId: p.category?.slug || "",
      category: p.category?.name || "",
      rate: `${p.ratePct ?? 0}% p.a.`,
      tenor: `${p.tenorDays ?? 0} days`,
      minimum: Math.max(0, Math.round(p.minimum ?? 0)),
      availability: mapAvailability(String(p.availability ?? "open")),
      closes: String(p.availability ?? "").toLowerCase() === "open" ? "Open" : "See details",
      featured: i < 4,
      blurb: p.blurb || "",
      largeTicket: Boolean(p.largeTicket) || (p.minimum ?? 0) >= 5_000_000,
    }));
    emitExplore();
    return true;
  } catch {
    EXPLORE_CATEGORIES = [];
    EXPLORE_PRODUCTS = [];
    emitExplore();
    return false;
  }
}

/** Await catalog before product loaders so deep links don't 404 on a race. */
export async function ensureExploreHydrated() {
  if (EXPLORE_PRODUCTS.length > 0) return true;
  if (!exploreHydratePromise) {
    exploreHydratePromise = hydrateExploreFromApi().finally(() => {
      exploreHydratePromise = null;
    });
  }
  return exploreHydratePromise;
}

export function getProductDetail(p: ExploreProduct): ProductDetail {
  const fixed = p.tenor !== "Open-ended";
  return {
    highlights: [
      { label: "Rate", value: p.rate },
      { label: fixed ? "Tenor" : "Liquidity", value: fixed ? p.tenor : "Withdraw anytime" },
      { label: "Minimum", value: `₦${p.minimum.toLocaleString("en-NG")}` },
      { label: "Payout", value: fixed ? "At maturity" : "Accrues daily" },
    ],
    about: CATEGORY_ABOUT[p.categoryId] ?? p.blurb,
    how: [
      "Fund the investment from your Kipit wallet.",
      fixed
        ? "Your rate is locked in for the full tenor at the point of purchase."
        : "Your balance earns the prevailing rate, accrued daily.",
      fixed
        ? "Principal and interest are paid to your wallet on the maturity date."
        : "Withdraw all or part of your balance to your wallet at any time.",
    ],
    risks: [
      p.categoryId === "tbills" || p.categoryId === "treasury-bills"
        ? "Sovereign-backed, but early exit may be at a discount to par."
        : "Issuer credit risk applies — returns depend on the issuer meeting its obligations.",
      fixed
        ? "Funds are locked for the tenor. Early liquidation may attract a penalty."
        : "Target returns are indicative and can move with market rates.",
      "Rates are indicative until your order is confirmed and allotted.",
    ],
    documents: [
      { name: "Offer summary", meta: "PDF · 240 KB" },
      { name: "Issuer information", meta: "PDF · 1.1 MB" },
      { name: "Risk disclosure", meta: "PDF · 180 KB" },
    ],
    faqs: [
      {
        q: "When do I get my money back?",
        a: fixed
          ? `Principal and interest land in your Kipit wallet at the end of the ${p.tenor} tenor.`
          : "You can withdraw to your wallet at any time; withdrawals typically settle same day.",
      },
      {
        q: "Is my investment guaranteed?",
        a: "No investment is guaranteed. Returns depend on the issuer and prevailing market conditions.",
      },
      {
        q: "Who holds my funds?",
        a: "Funds are administered by Kipit's SEC-licensed partner. Kipit does not hold client assets directly.",
      },
    ],
  };
}
