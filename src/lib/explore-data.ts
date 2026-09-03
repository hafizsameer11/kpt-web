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

export const EXPLORE_CATEGORIES: ExploreCategory[] = [
  { id: "tbills", name: "Treasury Bills", short: "T-Bills", count: 4 },
  { id: "cp", name: "Commercial Papers", short: "Commercial", count: 3 },
  { id: "notes", name: "Private & Structured Notes", short: "Notes", count: 2 },
  { id: "portfolios", name: "Managed Portfolios", short: "Portfolios", count: 2 },
];

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
};

export const EXPLORE_PRODUCTS: ExploreProduct[] = [
  {
    id: "p1",
    name: "364-Day Treasury Bill",
    issuer: "Federal Government of Nigeria",
    categoryId: "tbills",
    category: "Treasury Bills",
    rate: "22.4% p.a.",
    tenor: "364 days",
    minimum: 100_000,
    availability: "open",
    closes: "Closes 12 Sep 2026",
    featured: true,
    blurb: "Sovereign-backed discount instrument held to maturity.",
  },
  {
    id: "p2",
    name: "Dangote Cement CP Series 12",
    issuer: "Dangote Cement Plc",
    categoryId: "cp",
    category: "Commercial Papers",
    rate: "24.1% p.a.",
    tenor: "180 days",
    minimum: 500_000,
    availability: "closing",
    closes: "Closes in 3 days",
    featured: true,
    blurb: "Short-term corporate paper from a blue-chip issuer.",
  },
  {
    id: "p3",
    name: "182-Day Treasury Bill",
    issuer: "Federal Government of Nigeria",
    categoryId: "tbills",
    category: "Treasury Bills",
    rate: "20.8% p.a.",
    tenor: "182 days",
    minimum: 100_000,
    availability: "open",
    closes: "Closes 19 Sep 2026",
    featured: true,
    blurb: "A half-year sovereign bill for parked cash.",
  },
  {
    id: "p4",
    name: "MTN Nigeria CP Series 8",
    issuer: "MTN Nigeria Communications Plc",
    categoryId: "cp",
    category: "Commercial Papers",
    rate: "23.5% p.a.",
    tenor: "270 days",
    minimum: 500_000,
    availability: "open",
    closes: "Closes 24 Sep 2026",
    blurb: "Telecoms issuer paper with quarterly coupon reporting.",
  },
  {
    id: "p5",
    name: "Infrastructure Note Series II",
    issuer: "Kipit Structured Partners",
    categoryId: "notes",
    category: "Private & Structured Notes",
    rate: "26.0% p.a.",
    tenor: "540 days",
    minimum: 5_000_000,
    availability: "closing",
    closes: "Closes in 6 days",
    featured: true,
    blurb: "Private note secured on operating infrastructure assets.",
  },
  {
    id: "p6",
    name: "Naira Balanced Portfolio",
    issuer: "SEC-licensed fund manager",
    categoryId: "portfolios",
    category: "Managed Portfolios",
    rate: "18.9% p.a. target",
    tenor: "Open-ended",
    minimum: 250_000,
    availability: "open",
    closes: "Always open",
    blurb: "A managed mix of bills, papers and bonds.",
  },
  {
    id: "p7",
    name: "Eurobond Income Portfolio",
    issuer: "SEC-licensed fund manager",
    categoryId: "portfolios",
    category: "Managed Portfolios",
    rate: "9.2% p.a. (USD)",
    tenor: "Open-ended",
    minimum: 2_000_000,
    availability: "closed",
    closes: "Fully subscribed",
    blurb: "Dollar income exposure; reopens next allocation window.",
  },
  {
    id: "p8",
    name: "91-Day Treasury Bill",
    issuer: "Federal Government of Nigeria",
    categoryId: "tbills",
    category: "Treasury Bills",
    rate: "19.3% p.a.",
    tenor: "91 days",
    minimum: 100_000,
    availability: "open",
    closes: "Closes 09 Sep 2026",
    blurb: "The shortest sovereign tenor on the marketplace.",
  },
];

/** Coming Soon rail (MOB-080). */
export const EXPLORE_COMING_SOON = [
  { name: "Real Estate Notes", note: "Fractional income-generating property" },
  { name: "Dollar Fixed Income", note: "USD savings and Eurobond access" },
  { name: "Green Energy Notes", note: "Solar and mini-grid project funding" },
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
  tbills:
    "Treasury bills are short-term debt instruments issued by the Federal Government of Nigeria and sold at a discount to face value. You receive the full face value at maturity.",
  cp: "Commercial paper is unsecured short-term debt issued by large corporates to fund working capital. Returns are fixed at purchase and paid at maturity.",
  notes:
    "Private and structured notes are arranged instruments secured on underlying assets or cash flows, offering higher yields for a longer lock-up.",
  portfolios:
    "Managed portfolios are professionally run mixes of fixed-income instruments. Returns are targets, not guarantees, and your balance moves with the portfolio.",
};

export function getExploreProduct(id: string) {
  return EXPLORE_PRODUCTS.find((p) => p.id === id);
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
      p.categoryId === "tbills"
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
