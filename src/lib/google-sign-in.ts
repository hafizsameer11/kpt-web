import { ApiError, fetchMe, loginWithGoogle, setSession, getAccessToken, tierNumber } from "@/lib/api";
import {
  requestGoogleIdToken,
  isGoogleSignInConfigured,
  resolveGoogleClientId,
} from "@/lib/google-auth";
import { hydrateLiveBalances } from "@/lib/live-balances";
import { refreshWalletFromApi } from "@/lib/wallet-balance";
import { setKycTier } from "@/lib/kyc-state";

export { isGoogleSignInConfigured, resolveGoogleClientId };

/**
 * Full Google continue flow: GIS token → API session → hydrate.
 * Returns the session user (with hasPassword / hasPin from /me).
 */
export async function continueWithGoogle() {
  const clientId = await resolveGoogleClientId();
  if (!clientId) {
    throw new Error("Google sign-in is not configured yet. Ask support to enable it.");
  }
  const idToken = await requestGoogleIdToken();
  try {
    const session = await loginWithGoogle(idToken);
    setKycTier(tierNumber(session.user.kycTier));
    // Prefer /me flags so onboarding routing matches the database.
    try {
      const me = await fetchMe();
      const token = getAccessToken();
      if (token && me?.user) {
        setSession({
          accessToken: token,
          user: { ...session.user, ...me.user },
        });
        session.user = { ...session.user, ...me.user };
      }
    } catch {
      /* keep login payload */
    }
    await refreshWalletFromApi().catch(() => undefined);
    await hydrateLiveBalances().catch(() => undefined);
    return session;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw err;
  }
}
