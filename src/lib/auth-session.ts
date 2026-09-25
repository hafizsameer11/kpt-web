/**
 * Shared auth helpers for consumer web — logout clears API + local state.
 */
import { logout as apiLogout, getStoredUser, isAuthenticated, subscribeAuth } from "@/lib/api";
import { setKycTier, type KycTier } from "@/lib/kyc-state";
import { resetWalletBalance } from "@/lib/wallet-balance";

export { isAuthenticated, getStoredUser, subscribeAuth };

export async function signOut() {
  await apiLogout();
  const { resetSessionRestore } = await import("@/lib/auth-guard");
  resetSessionRestore();
  setKycTier(0 as KycTier);
  resetWalletBalance();
  const { resetLiveBalances } = await import("@/lib/live-balances");
  resetLiveBalances();
}

export function displayName() {
  const user = getStoredUser();
  if (!user) return "Guest";
  return `${user.firstName} ${user.surname}`.trim();
}

export function displayInitials() {
  const user = getStoredUser();
  if (!user) return "K";
  return `${user.firstName?.[0] ?? ""}${user.surname?.[0] ?? ""}`.toUpperCase() || "K";
}

export function tierLabel() {
  const tier = getStoredUser()?.kycTier;
  if (tier === "TIER_2") return "Tier 2 verified";
  if (tier === "TIER_1") return "Tier 1 verified";
  return "Unverified";
}
