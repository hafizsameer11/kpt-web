import { redirect } from "@tanstack/react-router";
import { getStoredUser, isAuthenticated, restoreSession } from "@/lib/api";
import { isAuthOnboardingPath } from "@/lib/post-auth-navigation";

/** Routes reachable without a session (marketing site + auth + gift claim). */
const PUBLIC_PATHS = [
  "/",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/delete-account",
  "/learn",
  "/welcome",
  "/splash",
  "/login",
  "/signup",
  "/forgot-password",
  "/gifts/claim",
] as const;

let sessionPromise: Promise<boolean> | null = null;

export async function ensureSessionRestored() {
  if (!sessionPromise) {
    sessionPromise = restoreSession().finally(() => {
      /* allow a later retry after logout */
    });
  }
  return sessionPromise;
}

/** Call after logout so the next navigation re-checks the session. */
export function resetSessionRestore() {
  sessionPromise = null;
}

export function isPublicAuthPath(pathname: string) {
  if (pathname === "/") return true;
  return PUBLIC_PATHS.some(
    (p) => p !== "/" && (pathname === p || pathname.startsWith(`${p}/`)),
  );
}

function isPinOnboardingPath(pathname: string) {
  return (
    pathname === "/signup/pin" ||
    pathname.startsWith("/signup/pin/") ||
    pathname === "/signup/confirm-pin" ||
    pathname.startsWith("/signup/confirm-pin/") ||
    pathname === "/signup/biometrics" ||
    pathname.startsWith("/signup/biometrics/") ||
    pathname === "/signup/success" ||
    pathname.startsWith("/signup/success/")
  );
}

/**
 * Root auth gate — unauthenticated users go to the marketing landing.
 * Signed-in users must finish password + PIN before the app shell.
 * Skip on SSR (no localStorage); client navigation enforces the gate.
 */
export async function authGateBeforeLoad(pathname: string) {
  if (typeof window === "undefined") return;

  await ensureSessionRestored();
  const authed = isAuthenticated();
  const user = getStoredUser();

  // Incomplete Google / social accounts cannot enter the dashboard yet.
  // Biometrics + success are always allowed once the user reached them (PIN
  // may already be saved server-side even if local flags were stale).
  if (authed && user) {
    const onLateOnboarding =
      pathname === "/signup/biometrics" ||
      pathname.startsWith("/signup/biometrics/") ||
      pathname === "/signup/success" ||
      pathname.startsWith("/signup/success/");

    if (!onLateOnboarding) {
      if (user.hasPassword !== true) {
        if (
          pathname !== "/signup/set-password" &&
          !pathname.startsWith("/signup/set-password/")
        ) {
          throw redirect({ to: "/signup/set-password" });
        }
      } else if (user.hasPin !== true) {
        if (!isPinOnboardingPath(pathname)) {
          throw redirect({ to: "/signup/pin" });
        }
      }
    }
  }

  if (isPublicAuthPath(pathname)) {
    if (
      authed &&
      !isAuthOnboardingPath(pathname) &&
      (pathname === "/welcome" ||
        pathname === "/splash" ||
        pathname === "/login" ||
        pathname.startsWith("/login/") ||
        pathname === "/signup" ||
        pathname.startsWith("/signup/"))
    ) {
      throw redirect({ to: "/home" });
    }
    return;
  }

  if (!authed) {
    throw redirect({ to: "/" });
  }
}
