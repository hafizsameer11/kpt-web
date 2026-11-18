/** Withholding tax helpers (B28). Rates are net after 10% WHT; gross = net / 0.9. */

export const WHT_FRACTION = 0.1;
export const NET_FROM_GROSS = 1 - WHT_FRACTION;

/**
 * Parse the leading net % from labels like `10.00% net (11.11% gross)`.
 * Stripping all non-digits yields `10.0011.11` → NaN — always take the first number.
 */
export function parseNetRatePct(label: string | number | null | undefined): number {
  if (typeof label === "number") return Number.isFinite(label) ? label : 0;
  if (label == null) return 0;
  const match = String(label).match(/-?\d+(?:\.\d+)?/);
  const n = match ? Number(match[0]) : NaN;
  return Number.isFinite(n) ? n : 0;
}

export function grossRatePctFromNet(netPct: number) {
  return netPct / NET_FROM_GROSS;
}

export function netRatePctFromGross(grossPct: number) {
  return grossPct * NET_FROM_GROSS;
}

export type InterestBreakdown = {
  principal: number;
  days: number;
  netRatePct: number;
  grossRatePct: number;
  whtRatePct: number;
  grossInterest: number;
  withholdingTax: number;
  netInterest: number;
  valueAtMaturity: number;
  /** When interest paid upfront, maturity value is principal only. */
  payout?: "AT_MATURITY" | "UPFRONT";
};

/** Prorated interest using net p.a. rate (simple ACT/365). */
export function interestBreakdownFromNetRate(input: {
  principal: number;
  netRatePct: number;
  days: number;
  payout?: "AT_MATURITY" | "UPFRONT";
}): InterestBreakdown {
  const netInterest = (input.principal * (input.netRatePct / 100) * input.days) / 365;
  const grossInterest = netInterest / NET_FROM_GROSS;
  const withholdingTax = grossInterest - netInterest;
  const payout = input.payout ?? "AT_MATURITY";
  return {
    principal: input.principal,
    days: input.days,
    netRatePct: input.netRatePct,
    grossRatePct: grossRatePctFromNet(input.netRatePct),
    whtRatePct: WHT_FRACTION * 100,
    grossInterest,
    withholdingTax,
    netInterest,
    valueAtMaturity: payout === "UPFRONT" ? input.principal : input.principal + netInterest,
    payout,
  };
}

export function formatRatePair(netPct: number) {
  const gross = grossRatePctFromNet(netPct);
  return {
    netRatePct: netPct,
    grossRatePct: gross,
    label: `${netPct.toFixed(2)}% net (${gross.toFixed(2)}% gross)`,
  };
}

export function formatMoneyNaira(n: number) {
  return `₦${Math.round(n).toLocaleString("en-NG")}`;
}
