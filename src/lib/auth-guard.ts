import { redirect } from "@tanstack/react-router";
import { isAuthenticated, restoreSession } from "@/lib/api";

/** Routes reachable without a session (PRD §9.1 welcome/auth + gift claim invite). */
const PUBLIC_PATHS = [
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
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

/**
 * Root auth gate — unauthenticated users go to Welcome (not the dashboard).
 * Signed-in users hitting welcome/login/signup go to Home.
 * Skip on SSR (no localStorage); client navigation enforces the gate.
 */
export async function authGateBeforeLoad(pathname: string) {
  if (typeof window === "undefined") return;

  await ensureSessionRestored();
  const authed = isAuthenticated();

  if (isPublicAuthPath(pathname)) {
    if (
      authed &&
      (pathname === "/welcome" ||
        pathname === "/splash" ||
        pathname === "/login" ||
        pathname.startsWith("/login/") ||
        pathname === "/signup" ||
        pathname.startsWith("/signup/"))
    ) {
      throw redirect({ to: "/" });
    }
    return;
  }

  if (!authed) {
    throw redirect({ to: "/welcome" });
  }
}
