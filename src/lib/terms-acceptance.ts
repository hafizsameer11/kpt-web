/**
 * Product Paper §7 — offer terms acceptance.
 * Every marketplace subscription records which version of the product's offer
 * terms the customer accepted, plus a timestamp. Prototype store: localStorage.
 */

export type TermsAcceptance = {
  productId: string;
  productName: string;
  version: string;
  amount: number;
  acceptedAt: string;
};

const KEY = "kipit:terms-acceptances";

/** Stable pseudo-version derived from the product id, so it never changes between renders. */
export function productTermsVersion(productId: string) {
  let hash = 0;
  for (const ch of productId) hash = (hash * 31 + ch.charCodeAt(0)) % 997;
  const major = 1 + (hash % 3);
  const minor = hash % 10;
  return `v${major}.${minor}`;
}

export function listTermsAcceptances(): TermsAcceptance[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as TermsAcceptance[]) : [];
  } catch {
    return [];
  }
}

export function recordTermsAcceptance(entry: Omit<TermsAcceptance, "acceptedAt">) {
  if (typeof window === "undefined") return;
  const next: TermsAcceptance[] = [
    { ...entry, acceptedAt: new Date().toISOString() },
    ...listTermsAcceptances(),
  ].slice(0, 25);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable in prototype */
  }
}

export function formatAcceptedAt(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** @deprecated Prefer `buildWhatsAppSupportUrl` from app config — hardcoded number is invalid. */
export const WHATSAPP_NUMBER = "";
/** @deprecated Prefer `buildWhatsAppSupportUrl(fetchAppConfig().support.whatsapp)`. */
export const WHATSAPP_URL = "";
