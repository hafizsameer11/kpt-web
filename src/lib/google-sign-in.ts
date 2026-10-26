import { ApiError, loginWithGoogle, tierNumber } from "@/lib/api";
import { requestGoogleIdToken, isGoogleSignInConfigured } from "@/lib/google-auth";
import { hydrateLiveBalances } from "@/lib/live-balances";
import { refreshWalletFromApi } from "@/lib/wallet-balance";
import { setKycTier } from "@/lib/kyc-state";

export { isGoogleSignInConfigured };

/**
 * Full Google continue flow: GIS token → API session → hydrate.
 * Returns the session user (with hasPin).
 */
export async function continueWithGoogle() {
  if (!isGoogleSignInConfigured()) {
    throw new Error("Google sign-in is not configured yet. Ask support to enable it.");
  }
  const idToken = await requestGoogleIdToken();
  try {
    const session = await loginWithGoogle(idToken);
    setKycTier(tierNumber(session.user.kycTier));
    await refreshWalletFromApi().catch(() => undefined);
    await hydrateLiveBalances().catch(() => undefined);
    return session;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw err;
  }
}
