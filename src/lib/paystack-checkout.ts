/** Session helpers for in-app Paystack Checkout (web WebView equivalent). */

const STORAGE_KEY = "kipit:paystack-checkout";

export type PaystackCheckoutSession = {
  authorizationUrl: string;
  amount: number;
  reference: string;
};

export function storePaystackCheckout(session: PaystackCheckoutSession) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function readPaystackCheckout(): PaystackCheckoutSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PaystackCheckoutSession;
    if (!parsed?.authorizationUrl || !parsed?.reference) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearPaystackCheckout() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(STORAGE_KEY);
}

export function isPaystackReturnUrl(url: string, reference: string) {
  const lower = url.toLowerCase();
  if (lower.includes("/wallet/processing")) return true;
  if (lower.includes("trxref=") || lower.includes("reference=")) {
    try {
      const parsed = new URL(url);
      const ref =
        parsed.searchParams.get("reference") ||
        parsed.searchParams.get("trxref") ||
        parsed.searchParams.get("ref");
      if (ref && ref === reference) return true;
      if (parsed.searchParams.get("method") === "card") return true;
    } catch {
      return lower.includes(encodeURIComponent(reference)) || lower.includes(reference.toLowerCase());
    }
  }
  return false;
}

export function isPaystackCancelUrl(url: string) {
  const lower = url.toLowerCase();
  return lower.includes("cancel") && (lower.includes("paystack") || lower.includes("checkout"));
}
