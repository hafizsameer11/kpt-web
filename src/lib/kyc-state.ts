/**
 * Prototype KYC tier state (Product Paper §7.2 — "gates at the money, not the door").
 *
 * Tier 0 — sign-up only: browse products, rates and calculators. No money in or out.
 * Tier 1 — BVN verified: unlocks wallet funding, Call Account and fixed plans.
 * Tier 2 — NIN + selfie + address: unlocks withdrawals and payout accounts.
 *
 * Stored in localStorage so the demo journey survives reloads.
 */

import { useEffect, useState } from "react";

export type KycTier = 0 | 1 | 2;

const KEY = "kipit.kyc.tier";
const listeners = new Set<(t: KycTier) => void>();
let current: KycTier | null = null;

function read(): KycTier {
  if (current !== null) return current;
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(KEY);
  current = raw === "1" ? 1 : raw === "2" ? 2 : 0;
  return current;
}

export function getKycTier(): KycTier {
  return read();
}

export function setKycTier(tier: KycTier) {
  current = tier;
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, String(tier));
  listeners.forEach((l) => l(tier));
}

/** Reactive tier. Returns 0 during SSR/first paint, then hydrates from storage. */
export function useKycTier(): KycTier {
  const [tier, setTier] = useState<KycTier>(0);
  useEffect(() => {
    setTier(read());
    const l = (t: KycTier) => setTier(t);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return tier;
}

/** True once the component has hydrated — avoids flashing a gate during SSR. */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}

export const TIER_LABEL: Record<KycTier, string> = {
  0: "Unverified",
  1: "Tier 1 verified",
  2: "Tier 2 verified",
};

export const GATE_COPY = {
  1: {
    badge: "Verification needed",
    title: "Verify your BVN to add money",
    body:
      "Kipit is regulated, so we confirm your identity before any money moves in. Tier 1 takes about a minute — just your BVN.",
    unlocks: [
      "Fund your wallet and Call Account",
      "Create fixed-return plans",
      "Earn interest daily",
    ],
    cta: "Verify with BVN",
    to: "/verification/tier1" as const,
  },
  2: {
    badge: "Tier 2 required",
    title: "Complete Tier 2 to withdraw",
    body:
      "Payouts to a bank account need full KYC — your NIN, a live selfie and your residential address.",
    unlocks: [
      "Withdraw to any Nigerian bank",
      "Add and manage payout accounts",
      "Higher daily limits",
    ],
    cta: "Complete Tier 2",
    to: "/verification/tier2" as const,
  },
};
