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
  { id: "tbills", name: "Treasury Bills", short: "T-Bills", count: 6 },
  { id: "cp", name: "Commercial Papers", short: "Commercial", count: 4 },
  { id: "notes", name: "Private & Structured Notes", short: "Notes", count: 3 },
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
